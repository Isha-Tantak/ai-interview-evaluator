import json
import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, InterviewSession, QuestionEvaluation
from app.schemas import (
    SessionCreate, GenerateQuestionRequest,
    AnswerSubmission, EvaluationResponse, DashboardStats
)
from app.auth import get_current_user
from app.services.ollama_service import ollama_service
from app.services.semantic_cache import semantic_cache

router = APIRouter(prefix="/api/interview", tags=["interview"])
logger = logging.getLogger(__name__)

@router.post("/sessions")
def create_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_session = InterviewSession(
        user_id=current_user.id,
        role=data.role,
        difficulty=data.difficulty
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"session_id": new_session.id, "role": new_session.role, "difficulty": new_session.difficulty}

@router.post("/question")
async def get_question(
    req: GenerateQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == req.session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        question = await ollama_service.generate_interview_question(
            role=session.role,
            difficulty=session.difficulty,
            past_questions=req.previous_questions
        )
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Question generation failed. Check that Ollama is running and try again.") from exc
    return {"question": question}

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_answer(
    submission: AnswerSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == submission.session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    cache_available = True
    try:
        cached_eval = await semantic_cache.get(db, submission.question, submission.candidate_answer)
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Semantic cache lookup failed; evaluating answer without cache: %s", exc)
        cached_eval = None
        cache_available = False

    if cached_eval:
        result = cached_eval
        from_cache = 1
    else:
        try:
            result = await ollama_service.judge_answer(submission.question, submission.candidate_answer)
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            logger.exception("Ollama failed to evaluate an interview answer")
            raise HTTPException(
                status_code=502,
                detail="Ollama could not evaluate the answer. Check the configured model and try again."
            ) from exc

        from_cache = 0
        if cache_available:
            try:
                await semantic_cache.set(db, submission.question, submission.candidate_answer, result)
            except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
                logger.warning("Semantic cache storage failed; returning the completed evaluation: %s", exc)

    try:
        result = ollama_service.validate_judgment(result)
    except (KeyError, TypeError, ValueError) as exc:
        logger.exception("Evaluation result validation failed")
        raise HTTPException(
            status_code=502,
            detail="The evaluator returned an invalid result. Please try submitting again."
        ) from exc

    # 3. Store record in database
    eval_record = QuestionEvaluation(
        session_id=session.id,
        question=submission.question,
        candidate_answer=submission.candidate_answer,
        score=float(result.get("score", 0)),
        accuracy=float(result.get("accuracy", 0)),
        depth=float(result.get("depth", 0)),
        clarity=float(result.get("clarity", 0)),
        strengths=json.dumps(result.get("strengths", [])),
        improvements=json.dumps(result.get("improvements", [])),
        feedback=result.get("feedback", ""),
        from_cache=from_cache
    )
    db.add(eval_record)
    db.commit()

    return EvaluationResponse(
        score=result["score"],
        accuracy=result["accuracy"],
        depth=result["depth"],
        clarity=result["clarity"],
        strengths=result["strengths"],
        improvements=result["improvements"],
        feedback=result["feedback"],
        from_cache=bool(from_cache)
    )

@router.get("/history")
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    history = []
    for s in sessions:
        evals = []
        for e in s.evaluations:
            evals.append({
                "id": e.id,
                "question": e.question,
                "candidate_answer": e.candidate_answer,
                "score": e.score,
                "accuracy": e.accuracy,
                "depth": e.depth,
                "clarity": e.clarity,
                "strengths": json.loads(e.strengths),
                "improvements": json.loads(e.improvements),
                "feedback": e.feedback,
                "from_cache": bool(e.from_cache),
                "created_at": e.created_at.isoformat()
            })
        history.append({
            "session_id": s.id,
            "role": s.role,
            "difficulty": s.difficulty,
            "created_at": s.created_at.isoformat(),
            "evaluations": evals
        })
    return history

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).all()
    session_ids = [s.id for s in sessions]
    
    evaluations = db.query(QuestionEvaluation).filter(QuestionEvaluation.session_id.in_(session_ids)).all() if session_ids else []

    total_evals = len(evaluations)
    avg_score = round(sum(e.score for e in evaluations) / total_evals, 1) if total_evals > 0 else 0.0
    cache_hits = sum(1 for e in evaluations if e.from_cache == 1)
    hit_rate = round((cache_hits / total_evals) * 100, 1) if total_evals > 0 else 0.0

    recent = []
    for s in sorted(sessions, key=lambda x: x.created_at, reverse=True)[:5]:
        s_evals = [e for e in evaluations if e.session_id == s.id]
        s_avg = round(sum(e.score for e in s_evals) / len(s_evals), 1) if s_evals else 0.0
        recent.append({
            "id": s.id,
            "role": s.role,
            "difficulty": s.difficulty,
            "date": s.created_at.strftime("%b %d, %Y"),
            "question_count": len(s_evals),
            "average_score": s_avg
        })

    return DashboardStats(
        total_sessions=len(sessions),
        total_evaluations=total_evals,
        average_score=avg_score,
        cache_hit_rate=hit_rate,
        recent_sessions=recent
    )