"""Trainee Panel endpoints.

Everything is scoped to the calling trainee: a bearer token picks the account,
and with ALLOW_DEMO_IDENTITY on, an unauthenticated call falls back to the
demo trainee so the panel opens with real data.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_trainee
from app.core.database import get_db
from app.models.occupations import Occupation
from app.models.trainees import Trainee
from app.services import demo_store, trainee_service

router = APIRouter(prefix="/trainee", tags=["trainee"])


class ApplyPayload(BaseModel):
    job_id: int


class VerificationPayload(BaseModel):
    documents: list[Any] = []


class SubmitPayload(BaseModel):
    answers: list[int] | None = None
    text: str | None = None


@router.get("/profile")
def profile(trainee: Trainee = Depends(get_current_trainee), db: Session = Depends(get_db)):
    return trainee_service.profile(db, trainee)


@router.get("/skills")
def skills(trainee: Trainee = Depends(get_current_trainee), db: Session = Depends(get_db)):
    return trainee_service.skills(db, trainee.id)


@router.get("/occupations")
def occupations(db: Session = Depends(get_db)):
    return [
        {"id": o.id, "name": o.name, "category": o.category}
        for o in db.query(Occupation).order_by(Occupation.name).all()
    ]


@router.get("/skill-gap")
def skill_gap(
    occupation: str | None = Query(None, description="Target occupation name"),
    occupation_id: int | None = Query(None),
    trainee: Trainee = Depends(get_current_trainee),
    db: Session = Depends(get_db),
):
    return trainee_service.skill_gap(db, trainee.id, occupation, occupation_id)


@router.get("/opportunities")
def opportunities(
    limit: int = Query(12, ge=1, le=50),
    trainee: Trainee = Depends(get_current_trainee),
    db: Session = Depends(get_db),
):
    return trainee_service.opportunities(db, trainee, limit)


@router.get("/applications")
def applications(trainee: Trainee = Depends(get_current_trainee), db: Session = Depends(get_db)):
    return trainee_service.applications(db, trainee)


@router.post("/applications", status_code=201)
def apply(
    payload: ApplyPayload,
    trainee: Trainee = Depends(get_current_trainee),
    db: Session = Depends(get_db),
):
    try:
        return trainee_service.apply_to_job(db, trainee, payload.job_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))


@router.get("/notifications")
def notifications(trainee: Trainee = Depends(get_current_trainee), db: Session = Depends(get_db)):
    return trainee_service.notifications(db, trainee)


@router.get("/peer-benchmark")
def peer_benchmark(trainee: Trainee = Depends(get_current_trainee), db: Session = Depends(get_db)):
    return trainee_service.peer_benchmark(db, trainee)


# --- Test & PS (trainee side of the employer module) ---


@router.get("/assessments")
def assessments(trainee: Trainee = Depends(get_current_trainee)):
    return demo_store.assessments_for_trainee(trainee.id)


@router.post("/assessments/{submission_id}/submit")
def submit_assessment(
    submission_id: str,
    payload: SubmitPayload,
    trainee: Trainee = Depends(get_current_trainee),
):
    result = demo_store.submit(submission_id, payload.answers, payload.text)
    if result is None:
        raise HTTPException(status_code=404, detail="Assessment not assigned to you")
    return result


# --- DigiLocker ---


@router.get("/verification/digilocker")
def get_verification(trainee: Trainee = Depends(get_current_trainee)):
    return demo_store.trainee_verification(trainee.id)


@router.post("/verification/digilocker")
def set_verification(
    payload: VerificationPayload,
    trainee: Trainee = Depends(get_current_trainee),
):
    return demo_store.set_trainee_verification(trainee.id, payload.documents)
