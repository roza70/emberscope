
import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_FILE = (
    PROJECT_ROOT / "data" / "processed" / "evidence.json"
)

STOP_WORDS = {
    "the", "is", "are", "was", "were", "what", "how",
    "why", "and", "or", "for", "to", "of", "in", "on",
    "a", "an", "do", "does", "can", "could", "tell",
    "me", "about", "from", "with", "under"
}


def tokenize(text):
    """Convert text into searchable lowercase words."""
    words = re.findall(r"[a-z0-9-]+", text.lower())
    return {
        word for word in words
        if word not in STOP_WORDS
    }


def load_evidence():
    """Load evidence records from the local JSON database."""
    with open(EVIDENCE_FILE, "r", encoding="utf-8-sig") as file:
        return json.load(file)


def search_evidence(query, evidence=None, top_k=5):
    """Find relevant evidence using keyword matching."""

    if not query or not query.strip():
        return []

    if evidence is None:
        evidence = load_evidence()

    query_words = tokenize(query)

    if not query_words:
        return []

    results = []

    minimum_score = 3 if len(query_words) >= 2 else 1

    for record in evidence:
        score = 0

        fields = {
            "psi_id": (record.get("psi_id", ""), 5),
            "topic": (record.get("topic", ""), 3),
            "claim": (record.get("claim", ""), 2),
            "source_title": (record.get("source_title", ""), 2),
            "evidence_id": (record.get("evidence_id", ""), 1),
        }

        for value, weight in fields.values():
            matched_words = query_words & tokenize(value)
            score += len(matched_words) * weight

        if score >= minimum_score:
            results.append({
                **record,
                "relevance_score": score
            })

    results.sort(
        key=lambda item: item["relevance_score"],
        reverse=True
    )

    return results[:top_k]


if __name__ == "__main__":
    question = input("Ask EmberScope: ")

    matches = search_evidence(question)

    if not matches:
        print("\nNo matching evidence found.")
    else:
        print(f"\nFound {len(matches)} relevant record(s):")

        for item in matches:
            print("\n" + "=" * 55)
            print("Investigation:", item["psi_id"])
            print("Topic:", item["topic"])
            print("Evidence type:", item["evidence_type"])
            print("Relevance score:", item["relevance_score"])
            print("Claim:", item["claim"])
            print("Source:", item["source_title"])
            print("Source URL:", item["source_url"])
            print("Data status:", item["data_status"])
            print("Limitations:", item["limitations"])
