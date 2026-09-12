"""Employer Panel endpoints.

Paths here match frontend/employer-panel/src/config/api.js one-for-one — that
file was written with guessed route names, and these are the routes it guessed.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_employer
from app.core.database import get_db
from app.models.employers import Employer
from app.services import demo_store, employer_service

router = APIRouter(prefix="/employer", tags=["employer"])


# ---------------------------------------------------------------------------
# request bodies
# ---------------------------------------------------------------------------


class JobPayload(BaseModel):
    title: str | None = None
    type: str | None = None
    description: str | None = None
    required_skills: list[str] | None = None
    preferred_skills: list[str] | None = None
    education_requirement: str | None = None
    experience_requirement: str | None = None
    salary: str | None = None
    location: str | None = None
    district_id: int | None = None
    occupation_id: int | None = None
    work_mode: str | None = None
    application_deadline: str | None = None
    openings: int | None = None
    status: str | None = None


class VerificationPayload(BaseModel):
    documents: list[Any] = []


class AssessmentPayload(BaseModel):
    job_id: Any
    title: str
    type: str = "test"
    skills_tested: list[str] = []
    due_date: str | None = None
    pass_threshold: int | None = None
    duration_minutes: int | None = None
    questions: list[dict] | None = None
    brief: str | None = None


class AssignPayload(BaseModel):
    application_ids: list[Any]


class ReviewPayload(BaseModel):
    score: float | None = None
    status: str | None = None
    feedback: str | None = None


# ---------------------------------------------------------------------------
# profile & verification
# ---------------------------------------------------------------------------


@router.get("/profile")
def profile(employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)):
    return employer_service.employer_profile(db, employer)


@router.get("/verification/digilocker")
def get_verification(employer: Employer = Depends(get_current_employer)):
    return demo_store.employer_verification(employer.id)


@router.post("/verification/digilocker")
def set_verification(
    payload: VerificationPayload,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    demo_store.set_employer_verification(employer.id, payload.documents)
    return employer_service.employer_profile(db, employer)


# ---------------------------------------------------------------------------
# postings
# ---------------------------------------------------------------------------


@router.get("/jobs")
def list_jobs(employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)):
    return employer_service.list_jobs(db, employer.id)


@router.post("/jobs", status_code=201)
def create_job(
    payload: JobPayload,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    return employer_service.create_job(
        db, employer.id, payload.model_dump(exclude_none=True), employer.district_id
    )


@router.get("/jobs/{job_id}")
def get_job(
    job_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    job = employer_service.get_job(db, employer.id, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Posting not found")
    return job


@router.put("/jobs/{job_id}")
def update_job(
    job_id: str,
    payload: JobPayload,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    job = employer_service.update_job(
        db, employer.id, job_id, payload.model_dump(exclude_none=True)
    )
    if job is None:
        raise HTTPException(status_code=404, detail="Posting not found")
    return job


@router.patch("/jobs/{job_id}/close")
def close_job(
    job_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    job = employer_service.close_job(db, employer.id, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Posting not found")
    return job


# ---------------------------------------------------------------------------
# applicants & matching
# ---------------------------------------------------------------------------


@router.get("/jobs/{job_id}/applications")
def applicants(
    job_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    return employer_service.list_applicants(db, employer.id, job_id)


@router.get("/jobs/{job_id}/candidates")
def candidates(
    job_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    return employer_service.candidate_matches(db, employer.id, job_id)


# ---------------------------------------------------------------------------
# analytics
# ---------------------------------------------------------------------------


@router.get("/analytics")
def analytics(employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)):
    return employer_service.analytics_for_employer(db, employer.id)


@router.get("/skill-demand")
def skill_demand(employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)):
    return employer_service.skill_demand_for_employer(db, employer.id)


# ---------------------------------------------------------------------------
# Test & PS
# ---------------------------------------------------------------------------


def _ensure_seeded(db: Session, employer_id: int) -> None:
    demo_store.seed_employer(employer_id, employer_service.list_jobs(db, employer_id))


@router.get("/assessments/summary")
def assessments_summary(
    employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)
):
    _ensure_seeded(db, employer.id)
    return demo_store.summary(employer.id)


@router.get("/assessments")
def list_assessments(
    employer: Employer = Depends(get_current_employer), db: Session = Depends(get_db)
):
    _ensure_seeded(db, employer.id)
    return [demo_store.decorate(a) for a in demo_store.list_assessments(employer.id)]


@router.post("/assessments", status_code=201)
def create_assessment(
    payload: AssessmentPayload,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    _ensure_seeded(db, employer.id)
    job = employer_service.get_job(db, employer.id, payload.job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Posting not found")
    return demo_store.decorate(
        demo_store.create_assessment(employer.id, payload.model_dump(), job["title"])
    )


@router.get("/jobs/{job_id}/assessments")
def assessments_for_job(
    job_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    _ensure_seeded(db, employer.id)
    return [
        demo_store.decorate(a)
        for a in demo_store.list_assessments(employer.id)
        if str(a["job_id"]) == str(job_id)
    ]


@router.get("/assessments/{assessment_id}")
def get_assessment(
    assessment_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    _ensure_seeded(db, employer.id)
    a = demo_store.get_assessment(employer.id, assessment_id)
    if a is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return demo_store.decorate(a)


@router.post("/assessments/{assessment_id}/assign")
def assign_assessment(
    assessment_id: str,
    payload: AssignPayload,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    _ensure_seeded(db, employer.id)
    a = demo_store.get_assessment(employer.id, assessment_id)
    if a is None:
        raise HTTPException(status_code=404, detail="Assessment not found")

    applicants = employer_service.list_applicants(db, employer.id, a["job_id"])
    by_id = {str(x["id"]): x for x in applicants}
    targets = []
    for app_id in payload.application_ids:
        source = by_id.get(str(app_id))
        if source is None:
            # The application belongs to another of this employer's postings
            # (or the list was fetched before the assessment was created), so
            # resolve the trainee from the row itself rather than dropping it.
            source = employer_service.application_target(db, employer.id, app_id) or {}
        targets.append(
            {
                "application_id": app_id,
                "trainee_id": source.get("trainee_id"),
                "candidate_name": source.get("candidate_name") or "Applicant {}".format(app_id),
                "verified": source.get("trainee_verified", False),
            }
        )

    return demo_store.decorate(demo_store.assign(employer.id, assessment_id, targets))


@router.get("/assessments/{assessment_id}/submissions")
def assessment_submissions(
    assessment_id: str,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    _ensure_seeded(db, employer.id)
    items = demo_store.submissions(employer.id, assessment_id)
    if items is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return items


@router.patch("/submissions/{submission_id}/review")
def review_submission(
    submission_id: str,
    payload: ReviewPayload,
    employer: Employer = Depends(get_current_employer),
):
    sub = demo_store.review_submission(submission_id, payload.model_dump(exclude_none=True))
    if sub is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub
