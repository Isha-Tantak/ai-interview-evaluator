import json
import numpy as np
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models import SemanticCacheEntry
from app.services.ollama_service import ollama_service
from app.config import settings

def cosine_similarity(v1: list, v2: list) -> float:
    a = np.array(v1)
    b = np.array(v2)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(np.dot(a, b) / norm)

class SemanticCache:
    @staticmethod
    async def get(db: Session, question: str, candidate_answer: str) -> Optional[Dict[str, Any]]:
        """Look for a semantically identical question-answer evaluation in SQLite."""
        combined_text = f"Question: {question.strip()}\nAnswer: {candidate_answer.strip()}"
        query_embedding = await ollama_service.get_embedding(combined_text)

        entries = db.query(SemanticCacheEntry).all()
        best_score = -1.0
        best_match = None

        for entry in entries:
            stored_vector = json.loads(entry.embedding)
            sim = cosine_similarity(query_embedding, stored_vector)
            if sim > best_score:
                best_score = sim
                best_match = entry

        if best_match and best_score >= settings.SIMILARITY_THRESHOLD:
            verdict = json.loads(best_match.evaluation_json)
            verdict["from_cache"] = True
            return verdict
        
        return None

    @staticmethod
    async def set(db: Session, question: str, candidate_answer: str, evaluation: Dict[str, Any]):
        """Persist embedding and evaluation into SQLite cache."""
        combined_text = f"Question: {question.strip()}\nAnswer: {candidate_answer.strip()}"
        embedding = await ollama_service.get_embedding(combined_text)

        cache_entry = SemanticCacheEntry(
            question=question,
            candidate_answer=candidate_answer,
            embedding=json.dumps(embedding),
            evaluation_json=json.dumps(evaluation)
        )
        db.add(cache_entry)
        db.commit()

semantic_cache = SemanticCache()