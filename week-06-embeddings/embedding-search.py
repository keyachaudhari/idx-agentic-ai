# Uses Google Gemini embeddings to find semantically similar property listings.
#
# HOW IT WORKS:
# 1. Take a listing's description (L_Remarks) and key fields
# 2. Convert it to a list of 768 numbers (an "embedding") using Gemini
# 3. Do the same for the user's search query
# 4. Find listings whose embeddings are closest to the query embedding
# (using cosine similarity — like measuring the angle between two arrows)

from google import genai
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import mysql.connector
import os
from dotenv import load_dotenv
import json

load_dotenv("../.env")

# Configure Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_embedding(text: str) -> list:
    """Convert text into an embedding using Gemini."""
    text = text.replace("\n", " ").strip()[:8000]

    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )

    return result.embeddings[0].values

def build_listing_text(row: dict) -> str:
    """Combine listing fields into one text block for embedding."""
    return f"""
    {row.get('L_Type_', '')} in {row.get('L_City', '')}, CA.
    {row.get('L_Keyword2', '')} beds, {row.get('LM_Dec_3', '')} baths.
    {row.get('LM_Int2_3', '')} sq ft. Built {row.get('YearBuilt', '')}.
    Price: ${row.get('L_SystemPrice', 0):,}.
    {row.get('L_Remarks', '')}
    """.strip()
    
def fetch_sample_listings(limit=50):
    """Fetch a sample of active listings from MySQL."""
    conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "idx_exchange")
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"""
        SELECT L_ListingID, L_Type_, L_City, L_Keyword2, LM_Dec_3,
            LM_Int2_3, YearBuilt, L_SystemPrice, L_Remarks, L_Address
        FROM rets_property
        WHERE L_Status = 'Active'
            AND L_Remarks IS NOT NULL
            AND L_Remarks != ''
        LIMIT {limit}
    """)
    rows = cursor.fetchall()
    conn.close()
    return rows

def find_similar_listings(query: str, listings: list, top_k=5):
    """Find top_k listings most similar to the query."""
    print(f"Generating query embedding for: '{query}'")
    query_embedding = np.array(get_embedding(query)).reshape(1, -1)
    
    print(f"Generating embeddings for {len(listings)} listings...")
    scored = []
    for i, listing in enumerate(listings, start=1):
        print(f"Embedding listing {i}/{len(listings)}")
        text = build_listing_text(listing)
        emb = np.array(get_embedding(text)).reshape(1, -1)
        sim = cosine_similarity(query_embedding, emb)[0][0]
        scored.append((listing, float(sim)))

    # Sort by similarity score (highest first)
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]

# Test it
if __name__ == "__main__":
    print("=== Semantic Property Search Test ===\n")
    # Fetch sample listings
    listings = fetch_sample_listings(limit=3) # keep small for speed
    print(f"Fetched {len(listings)} listings\n")

    # Test queries
    queries = [
        "charming craftsman with mountain views and character",
        "modern open floor plan great for entertaining",
        "cozy starter home near good schools",
    ]

    for query in queries:
        print(f"\nQuery: '{query}'")
        results = find_similar_listings(query, listings, top_k=3)
        for listing, score in results:
            print(f" [{score:.3f}] {listing['L_Address']}, {listing['L_City']}")
    print("---")