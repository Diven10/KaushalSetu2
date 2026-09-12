"""Generic read-only resource access, the Career Digital Twin, and the
application-status endpoint shared by both panels.

This router is registered LAST in main.py: `/api/{resource}` would otherwise
swallow `/api/gov/...`, `/api/employer/...` and `/api/trainee/...`.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.applications import Application
from app.models.assessments import Assessment
from app.models.districts import District
from app.models.employers import Employer
from app.models.employment import Employment
from app.models.employment_followups import EmploymentFollowup
from app.models.government_users import GovernmentUser
from app.models.job_skills import JobSkill
from app.models.jobs import Job
from app.models.occupations import Occupation
from app.models.skill_demand import SkillDemand
from app.models.skills import Skill
from app.models.trainee_skills import TraineeSkill
from app.models.trainees import Trainee
from app.models.training_programs import TrainingProgram
from app.models.training_providers import TrainingProvider
from app.models.users import User
from app.services import employer_service
from app.services.crud import get_record, list_records

router = APIRouter()


# ---------------------------------------------------------------------------
# ML layer (imported lazily so the API still starts if the ml package or its
# psycopg2 connection isn't available)
# ---------------------------------------------------------------------------


def _load_career_twin():
    import sys
    from pathlib import Path

    ml_path = Path(__file__).resolve().parents[3] / "ml"
    if str(ml_path) not in sys.path:
        sys.path.insert(0, str(ml_path))

    from ai_service import get_career_twin

    return get_career_twin


# ---------------------------------------------------------------------------
# application status (used by the Employer Panel's pipeline board)
# ---------------------------------------------------------------------------


class StatusPayload(BaseModel):
    status: str


@router.patch("/applications/{application_id}/status")
def set_application_status(
    application_id: int,
    payload: StatusPayload,
    db: Session = Depends(get_db),
):
    try:
        return employer_service.update_application_status(db, application_id, payload.status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# ---------------------------------------------------------------------------
# Career Digital Twin
# ---------------------------------------------------------------------------


@router.get("/career-twin/{trainee_id}/{occupation_id}")
def career_twin(
    trainee_id: int,
    occupation_id: int,
    job_id: int | None = Query(None),
):
    """The full Career Digital Twin for a trainee against a target occupation."""
    if not settings.ENABLE_ML:
        raise HTTPException(status_code=503, detail="ML layer disabled (ENABLE_ML=false)")

    try:
        get_career_twin = _load_career_twin()
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail="ML layer unavailable: {}".format(exc)
        )

    try:
        result = get_career_twin(
            trainee_id=trainee_id,
            occupation_id=occupation_id,
            job_id=job_id,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503, detail="Career Twin could not be computed: {}".format(exc)
        )

    if result.get("status") == "NOT_FOUND":
        raise HTTPException(
            status_code=404, detail=result.get("message", "Career Twin data not found")
        )

    return result


# ---------------------------------------------------------------------------
# generic resource access
# ---------------------------------------------------------------------------

MODEL_MAP = {
    "districts": District,
    "users": User,
    "trainees": Trainee,
    "training-providers": TrainingProvider,
    "training-programs": TrainingProgram,
    "skills": Skill,
    "employers": Employer,
    "occupations": Occupation,
    "jobs": Job,
    "job-skills": JobSkill,
    "applications": Application,
    "employment": Employment,
    "employment-followups": EmploymentFollowup,
    "trainee-skills": TraineeSkill,
    "assessments": Assessment,
    "skill-demand": SkillDemand,
    "government-users": GovernmentUser,
}

# Never expose password hashes through the generic reader.
HIDDEN_COLUMNS = {"password_hash"}


def serialize(row, model):
    return {
        c.name: getattr(row, c.name)
        for c in model.__table__.columns
        if c.name not in HIDDEN_COLUMNS
    }


@router.get("/{resource}")
def list_resource(
    resource: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    model = MODEL_MAP.get(resource)
    if not model:
        raise HTTPException(status_code=404, detail="Resource not found")
    return [serialize(x, model) for x in list_records(db, model, skip, limit)]


@router.get("/{resource}/{record_id}")
def get_resource(resource: str, record_id: int, db: Session = Depends(get_db)):
    model = MODEL_MAP.get(resource)
    if not model:
        raise HTTPException(status_code=404, detail="Resource not found")
    row = get_record(db, model, record_id)
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    return serialize(row, model)
