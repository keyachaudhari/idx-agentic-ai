# Retrieval-Augmented Generation pipeline:
# 1. Load knowledge documents
# 2. Split documents into overlapping chunks
# 3. Generate Gemini embeddings for each chunk
# 4. Embed the user's question
# 5. Find the most relevant chunks using cosine similarity
# 6. Send those chunks to Gemini as context
# 7. Answer using ONLY the retrieved context

import os
import numpy as np
import google.generativeai as genai

from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity

# Setup
load_dotenv("../.env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY was not found in ../.env")

genai.configure(api_key=api_key)

# Step 1 - Chunking
def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> list:
    """
    Split a document into overlapping chunks.

    Overlap helps preserve context when important information
    falls near the boundary between two chunks.
    """

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks

# Step 2 - Gemini Embeddings
def get_embedding(text: str) -> list:
    """
    Convert text into a Gemini embedding vector.
    """

    text = text.replace("\n", " ").strip()[:8000]

    result = genai.embed_content(
        model="models/gemini-embedding-2",
        content=text,
        task_type="retrieval_document"
    )

    return result["embedding"]

# Step 3 - Load Documents
def load_documents() -> list:
    """
    Load all Week 8 knowledge sources.
    """

    document_files = [
        (
            "Real Estate Data Analyst Primer",
            "docs/real-estate-primer.txt"
        ),
        (
            "Trestle Property Metadata",
            "docs/trestle-metadata.txt"
        ),
        (
            "Week 5 Market Summaries",
            "docs/week5-market-summary.txt"
        ),
        (
            "IDX Schema Reference",
            "docs/idx-schema-reference.txt"
        ),
    ]

    documents = []

    for title, path in document_files:

        if not os.path.exists(path):
            print(f"WARNING: File not found: {path}")
            continue

        with open(path, "r", encoding="utf-8") as file:
            content = file.read()

        documents.append({
            "title": title,
            "content": content
        })

    return documents

# Step 4 - Build the RAG Index
def index_documents(documents: list) -> list:
    """
    Split documents into chunks and create an embedding
    for every chunk.
    """

    index = []

    for document in documents:

        chunks = chunk_text(document["content"])

        print(
            f"Indexing '{document['title']}' "
            f"-> {len(chunks)} chunks"
        )

        for chunk in chunks:

            embedding = get_embedding(chunk)

            index.append({
                "source": document["title"],
                "chunk": chunk,
                "embedding": embedding
            })

    return index

# Step 5 - Retrieve Relevant Chunks
def retrieve(query: str, index: list, top_k: int = 4) -> list:
    """
    Find the chunks most semantically similar to the question.
    """

    query_embedding = np.array(
        get_embedding(query)
    ).reshape(1, -1)

    scored = []

    for item in index:

        document_embedding = np.array(
            item["embedding"]
        ).reshape(1, -1)

        similarity = cosine_similarity(
            query_embedding,
            document_embedding
        )[0][0]

        scored.append({
            "source": item["source"],
            "chunk": item["chunk"],
            "score": float(similarity)
        })

    scored.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return scored[:top_k]

# Step 6 - Generate Grounded Answer
def rag_answer(query: str, index: list) -> str:
    """
    Answer a question using ONLY retrieved document context.
    """

    retrieved = retrieve(
        query=query,
        index=index,
        top_k=4
    )

    context_parts = []

    for item in retrieved:

        context_parts.append(
            f"SOURCE: {item['source']}\n"
            f"{item['chunk']}"
        )

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""
You are a real estate knowledge assistant.

Answer the user's question using ONLY the information
contained in the context below.

Do not use outside knowledge.

If the answer cannot be found in the context, say:

"I don't have information about that in the indexed knowledge base."

Keep the answer clear and concise.

CONTEXT:

{context}

QUESTION:

{query}

ANSWER:
"""

    model = genai.GenerativeModel(
        "gemini-3.6-flash"
    )

    response = model.generate_content(prompt)

    answer = response.text.strip()

    sources = []

    for item in retrieved:
        if item["source"] not in sources:
            sources.append(item["source"])

    source_text = ", ".join(sources)

    return (
        f"{answer}\n\n"
        f"Sources retrieved: {source_text}"
    )

# Main Test
if __name__ == "__main__":

    print("=== Week 8 RAG Knowledge Assistant ===\n")

    print("Loading documents...")

    documents = load_documents()

    print(
        f"Loaded {len(documents)} knowledge sources.\n"
    )

    print("=== Building Knowledge Index ===")

    index = index_documents(documents)

    print(
        f"\nTotal chunks indexed: {len(index)}\n"
    )

    questions = [
        "What does DOM mean?",
        "What columns are in california_sold?",
        "What is a list-to-close ratio?",
        "What is L_SystemPrice?",
        "What does L_Keyword2 mean?",
        "What is L_Remarks in rets_property?"
    ]

    print("=== RAG Question Answering ===\n")

    for question in questions:

        print(f"Q: {question}\n")

        try:
            answer = rag_answer(
                question,
                index
            )

            print(f"A: {answer}")

        except Exception as error:
            print(
                f"ERROR answering question: {error}"
            )

        print("\n" + "-" * 70 + "\n")