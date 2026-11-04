from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: Optional[str] = None

class SessionCreate(BaseModel):
    role: str = Field(min_length=1, max_length=100)
    difficulty: str = "Intermediate"

    @field_validator("role")
    @classmethod
    def role_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Role cannot be blank")
        return value

class GenerateQuestionRequest(BaseModel):
    session_id: int
    previous_questions: List[str] = Field(default_factory=list)

class AnswerSubmission(BaseModel):
    session_id: int
    question: str = Field(min_length=1)
    candidate_answer: str = Field(min_length=1, max_length=12000)

    @field_validator("question", "candidate_answer")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Question and answer cannot be blank")
        return value

class EvaluationResponse(BaseModel):
    score: float
    accuracy: float
    depth: float
    clarity: float
    strengths: List[str]
    improvements: List[str]
    feedback: str
    from_cache: bool

class DashboardStats(BaseModel):
    total_sessions: int
    total_evaluations: int
    average_score: float
    cache_hit_rate: float
    recent_sessions: List[dict]