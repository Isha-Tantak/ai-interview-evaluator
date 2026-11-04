import json
import math
import httpx
from typing import List, Dict, Any
from app.config import settings


class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    async def get_embedding(self, text: str) -> List[float]:
        """Fetch embedding from Ollama using the configured model."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model, "prompt": text}
            )
            resp.raise_for_status()
            data = resp.json()
            embedding = data.get("embedding") if isinstance(data, dict) else None
            if (
                not isinstance(embedding, list)
                or not embedding
                or any(
                    isinstance(value, bool)
                    or not isinstance(value, (int, float))
                    or not math.isfinite(value)
                    for value in embedding
                )
            ):
                raise ValueError("Ollama returned an invalid embedding")
            return embedding

    async def generate_interview_question(self, role: str, difficulty: str, past_questions: List[str]) -> str:
        past_str = "\n".join([f"- {q}" for q in past_questions]) if past_questions else "None"
        prompt = f"""You are an expert technical interviewer hiring for a {difficulty} {role} position.
Generate ONE clear, challenging, and relevant interview question for this candidate.
Do NOT repeat any of these previous questions:
{past_str}

Return ONLY the single question without any greeting, preamble, or numbering."""

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                }
            )
            resp.raise_for_status()
            data = resp.json()
            if not isinstance(data, dict) or not isinstance(data.get("response"), str):
                raise ValueError("Ollama returned an invalid interview question")
            question = data["response"].strip()
            if not question:
                raise ValueError("Ollama returned an empty interview question")
            return question

    @staticmethod
    def validate_judgment(result: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(result, dict):
            raise ValueError("Ollama returned an invalid evaluation object")

        validated = {}
        for key in ("score", "accuracy", "depth", "clarity"):
            value = result.get(key)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not 1 <= value <= 10:
                raise ValueError(f"Ollama returned an invalid {key} score")
            validated[key] = float(value)

        for key in ("strengths", "improvements"):
            value = result.get(key)
            if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
                raise ValueError(f"Ollama returned invalid {key}")
            validated[key] = value

        feedback = result.get("feedback")
        if not isinstance(feedback, str) or not feedback.strip():
            raise ValueError("Ollama returned empty evaluation feedback")
        validated["feedback"] = feedback.strip()
        return validated

    async def judge_answer(self, question: str, candidate_answer: str) -> Dict[str, Any]:
        prompt = f"""You are a strict, fair, and expert LLM Judge evaluating a candidate's interview response.

Question:
\"\"\"{question}\"\"\"

Candidate's Answer:
\"\"\"{candidate_answer}\"\"\"

Evaluate the answer against the question, not against an ideal answer the candidate was never asked to provide.
Judge technical correctness and relevance first, then completeness/depth and clarity. Reward accurate reasoning
and concrete examples; do not reward confident but unsupported claims. For an empty or irrelevant answer, score
it accordingly rather than inventing strengths. Give specific, actionable feedback and identify important omissions.
Use the full 1-10 scale consistently: 1 is incorrect or non-responsive, 5 is partially correct with meaningful
gaps, and 10 is accurate, complete, and clearly explained for the role and difficulty.

Output must be a strictly valid JSON object matching this schema:
{{
  "score": <float between 1.0 and 10.0>,
  "accuracy": <float between 1.0 and 10.0>,
  "depth": <float between 1.0 and 10.0>,
  "clarity": <float between 1.0 and 10.0>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "feedback": "<concise constructive feedback paragraph>"
}}

Output ONLY the JSON object, with no markdown code fences and no extra text."""

        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            resp.raise_for_status()
            data = resp.json()
            if not isinstance(data, dict) or not isinstance(data.get("response"), str):
                raise ValueError("Ollama returned an invalid evaluation response")
            raw = data["response"].strip()
            # Clean possible markdown wrap
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            return self.validate_judgment(json.loads(raw.strip()))

ollama_service = OllamaService()