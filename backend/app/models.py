from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("InterviewSession", back_populates="user")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=False)  # e.g., "Senior Python Engineer"
    difficulty = Column(String(50), default="Intermediate")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    evaluations = relationship(
        "QuestionEvaluation",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="QuestionEvaluation.created_at"
    )

class QuestionEvaluation(Base):
    __tablename__ = "question_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question = Column(Text, nullable=False)
    candidate_answer = Column(Text, nullable=False)
    
    # LLM Judge Output
    score = Column(Float, nullable=False)  # Overall 1-10
    accuracy = Column(Float, nullable=False)
    depth = Column(Float, nullable=False)
    clarity = Column(Float, nullable=False)
    strengths = Column(Text, nullable=False)      # JSON list as string
    improvements = Column(Text, nullable=False)   # JSON list as string
    feedback = Column(Text, nullable=False)
    from_cache = Column(Integer, default=0)        # 1 if cache hit
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="evaluations")

class SemanticCacheEntry(Base):
    __tablename__ = "semantic_cache"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    candidate_answer = Column(Text, nullable=False)
    embedding = Column(Text, nullable=False)        # JSON string of vector float values
    evaluation_json = Column(Text, nullable=False)  # Cached structured verdict
    created_at = Column(DateTime, default=datetime.utcnow)