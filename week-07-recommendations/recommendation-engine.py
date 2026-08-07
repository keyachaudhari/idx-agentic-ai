# Hybrid recommendation engine combining:
# - Structured similarity (price, beds, city, sqft) = 60% of score
# - Semantic similarity (description embeddings) = 40% of score
#
# Also validates the recommended price against recent sold comps
# from california_sold.

import google.generativeai as genai
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv("../.env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_embedding(text: str) -> list:
    text = text.replace("\n", " ").strip()[:8000]
    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_document"
    )
    return result["embedding"]

def get_db():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "idx_exchange")
    )

def calculate_similarity_score(target, candidate, target_emb, candidate_emb):
    """
    Calculate how similar two listings are.
    Returns a score 0-100.
    - 60 points max from structured data (price, beds, city, sqft)
    - 40 points max from semantic similarity (embeddings)
    """
    score = 0.0

    # === Structured similarity (60 points max) ===

    # Price similarity (20 points max)
    price_diff = abs((target.get("L_SystemPrice") or 0) - (candidate.get("L_SystemPrice") or 0))
    if price_diff < 50_000:
        score += 20
    elif price_diff < 150_000:
        score += 12
    elif price_diff < 300_000:
        score += 5

    # Same number of bedrooms (15 points)
    if target.get("L_Keyword2") == candidate.get("L_Keyword2"):
        score += 15

    # Same city (15 points)
    if target.get("L_City") == candidate.get("L_City"):
        score += 15

    # Similar square footage (10 points max)
    sqft_diff = abs((target.get("LM_Int2_3") or 0) - (candidate.get("LM_Int2_3") or 0))
    if sqft_diff < 300:
        score += 10
    elif sqft_diff < 700:
        score += 5

    # === Semantic similarity (40 points max) ===
    sem_sim = cosine_similarity(
        np.array(target_emb).reshape(1, -1),
        np.array(candidate_emb).reshape(1, -1)
    )[0][0]
    score += sem_sim * 40

    return round(score, 2)

def validate_with_comps(city: str, sqft: int, list_price: int):
    """
    Check if a listing price is reasonable by comparing to
    recent sold comps in california_sold.
    Returns: comp_price, delta_pct, comp_count
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            AVG(ClosePrice / NULLIF(LivingArea, 0)) AS avg_ppsf,
            COUNT(*) AS comp_count
        FROM california_sold
        WHERE City = %s
            AND PropertyType = 'Residential'
            AND LivingArea BETWEEN %s AND %s
            AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    """, [city, sqft * 0.8, sqft * 1.2])
    row = cursor.fetchone()
    conn.close()

    avg_ppsf = row["avg_ppsf"] or 0
    comp_price = avg_ppsf * sqft
    comp_count = row["comp_count"]
    delta_pct = ((list_price - comp_price) / comp_price * 100) if comp_price > 0 else 0

    return {
        "comp_price": round(comp_price),
        "list_price": list_price,
        "comp_count": comp_count,
        "delta_pct": round(delta_pct, 1)
    }

def get_recommendations(target_listing_id: str, limit=20):
    """Find the 5 most similar listings to a given listing."""
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Get target listing
    cursor.execute("""
        SELECT L_ListingID, L_Address, L_City, L_SystemPrice,
            L_Keyword2, LM_Int2_3, L_Type_, L_Remarks, YearBuilt
        FROM rets_property
        WHERE L_ListingID = %s
    """, [target_listing_id])
    target = cursor.fetchone()

    if not target:
        print(f"Listing {target_listing_id} not found")
        conn.close()
        return
    
    # Get candidate listings (same city for relevance)
    cursor.execute("""
        SELECT L_ListingID, L_Address, L_City, L_SystemPrice,
            L_Keyword2, LM_Int2_3, L_Type_, L_Remarks, YearBuilt
        FROM rets_property
        WHERE L_Status = 'Active'
            AND L_ListingID != %s
            AND L_Remarks IS NOT NULL
        LIMIT %s
    """, [target_listing_id, limit])
    candidates = cursor.fetchall()
    conn.close()

    print(f"Target: {target['L_Address']}, {target['L_City']} — ${target['L_SystemPrice']}")
    print(f"Comparing against {len(candidates)} candidates...\n")

    # Build embeddings
    def build_text(row):
        return f"{row.get('L_Type_', '')} in {row.get('L_City', '')}, {row.get('L_Keyword2', '')}, {row.get('LM_Int2_3', 0)}"
    
    target_emb = get_embedding(build_text(target))

    scored = []
    for candidate in candidates:
        cand_emb = get_embedding(build_text(candidate))
        score = calculate_similarity_score(target, candidate, target_emb, cand_emb)
        scored.append((candidate, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    top5 = scored[:5]

    print("=== Top 5 Recommendations ===\n")
    for i, (listing, score) in enumerate(top5, 1):
        comp = validate_with_comps(
            listing["L_City"],
            listing["LM_Int2_3"] or 1000,
            listing["L_SystemPrice"] or 0
        )
        price_note = " Fairly priced" if abs(comp["delta_pct"]) < 10 else (
            " Above comps" if comp["delta_pct"] > 0 else " Below comps"
        )
        print(f"{i}. [{score:.1f}/100] {listing['L_Address']}, {listing['L_City']}")
        print(f" Listed: ${listing['L_SystemPrice']:,} | Comp est: ${comp['comp_price']:,}")
        print(f" {listing['L_Keyword2']} bd | {listing['LM_Int2_3']} sqf")
        print()

# Test — grab first listing and find similar ones
if __name__ == "__main__":
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT L_ListingID FROM rets_property WHERE L_Status='Active'")
    row = cursor.fetchone()
    conn.close()

    if row:
        get_recommendations(row["L_ListingID"])
    else:
        print("No listings found")