"""Everything the Employer Panel needs, assembled from the real tables.

The `jobs` table is deliberately thin (title/status/occupation/district), while
the panel's posting card shows a richer object. Anything not in the table is
either derived from real data (salary band from actual employment records for
that occupation, applicant counts from `applications`) or stored in the job
overlay in demo_store.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.applications import Application
from app.models.districts import District
from app.models.employment import Employment
from app.models.job_skills import JobSkill
from app.models.jobs import Job
from app.models.occupations import Occupation
from app.models.skills import Skill
from app.models.trainee_skills import TraineeSkill
from app.models.trainees import Trainee
from app.models.assessments import Assessment
from app.services import demo_store

STRONG_MATCH = 70


def _monthly(value) -> float:
    return float(value) / 12 if value else 0.0


def salary_band_for_occupation(db: Session, occupation_id: int | None) -> str | None:
    if not occupation_id:
        return None
    rows = (
        db.query(Employment.salary)
        .filter(Employment.occupation_id == occupation_id, Employment.salary.isnot(None))
        .all()
    )
    values = sorted(_monthly(r[0]) for r in rows if r[0])
    if not values:
        return None
    low = values[len(values) // 4]
    high = values[(len(values) * 3) // 4]
    return "₹{:,.0f} – ₹{:,.0f} / month".format(round(low, -2), round(high, -2))


def job_skill_names(db: Session, job_ids: list[int]) -> dict[int, list[str]]:
    if not job_ids:
        return {}
    rows = (
        db.query(JobSkill.job_id, Skill.name)
        .join(Skill, Skill.id == JobSkill.skill_id)
        .filter(JobSkill.job_id.in_(job_ids))
        .all()
    )
    out: dict[int, list[str]] = defaultdict(list)
    for job_id, name in rows:
        out[job_id].append(name)
    return out


def serialize_job(
    db: Session,
    job: Job,
    skills: list[str],
    applicant_count: int,
    strong_match_count: int,
    district_names: dict[int, str],
    occupation_names: dict[int, str],
) -> dict:
    extras = demo_store.job_extras(job.id)
    created = job.created_at or datetime.now(timezone.utc)
    occupation = occupation_names.get(job.occupation_id)
    location = district_names.get(job.district_id)
    return {
        "id": job.id,
        "title": job.title,
        "type": extras.get("type", "job"),
        "status": job.status,
        "occupation": occupation,
        "description": extras.get(
            "description",
            "Open {} position in {}. Required skills: {}.".format(
                occupation or "vocational",
                location or "Maharashtra",
                ", ".join(skills) if skills else "see job description",
            ),
        ),
        "required_skills": extras.get("required_skills", skills),
        "preferred_skills": extras.get("preferred_skills", []),
        "education_requirement": extras.get("education_requirement", "ITI / Diploma"),
        "experience_requirement": extras.get("experience_requirement", "0-2 years"),
        "salary": extras.get("salary")
        or salary_band_for_occupation(db, job.occupation_id)
        or "Not specified",
        "location": extras.get(
            "location",
            "{}, Maharashtra".format(location) if location else "Maharashtra",
        ),
        "district_id": job.district_id,
        "work_mode": extras.get("work_mode", "on-site"),
        "application_deadline": extras.get(
            "application_deadline", (created + timedelta(days=45)).date().isoformat()
        ),
        "openings": extras.get("openings", 1),
        "created_at": created.isoformat(),
        "applicant_count": applicant_count,
        "strong_match_count": strong_match_count,
        "provenance": "observed",
    }


def _lookup_tables(db: Session) -> tuple[dict[int, str], dict[int, str]]:
    districts = {d.id: d.name for d in db.query(District.id, District.name).all()}
    occupations = {o.id: o.name for o in db.query(Occupation.id, Occupation.name).all()}
    return districts, occupations


def list_jobs(db: Session, employer_id: int) -> list[dict]:
    jobs = (
        db.query(Job)
        .filter(Job.employer_id == employer_id)
        .order_by(Job.created_at.desc())
        .all()
    )
    job_ids = [j.id for j in jobs]
    skills = job_skill_names(db, job_ids)
    districts, occupations = _lookup_tables(db)

    app_rows = (
        db.query(Application.job_id, Application.id, Application.trainee_id)
        .filter(Application.job_id.in_(job_ids))
        .all()
        if job_ids
        else []
    )
    apps_by_job: dict[int, list] = defaultdict(list)
    for job_id, app_id, trainee_id in app_rows:
        apps_by_job[job_id].append(trainee_id)

    trainee_skill_map = _trainee_skill_map(
        db, [t for ids in apps_by_job.values() for t in ids]
    )

    out = []
    for job in jobs:
        required = set(
            db_skill_ids(db, job.id)
        )
        strong = 0
        for trainee_id in apps_by_job.get(job.id, []):
            if not required:
                continue
            overlap = len(required & trainee_skill_map.get(trainee_id, set()))
            if overlap / len(required) * 100 >= STRONG_MATCH:
                strong += 1
        out.append(
            serialize_job(
                db,
                job,
                skills.get(job.id, []),
                len(apps_by_job.get(job.id, [])),
                strong,
                districts,
                occupations,
            )
        )

    return demo_store.local_jobs(employer_id) + out


_skill_id_cache: dict[int, list[int]] = {}


def db_skill_ids(db: Session, job_id: int) -> list[int]:
    if job_id not in _skill_id_cache:
        _skill_id_cache[job_id] = [
            r[0] for r in db.query(JobSkill.skill_id).filter(JobSkill.job_id == job_id).all()
        ]
    return _skill_id_cache[job_id]


def _trainee_skill_map(db: Session, trainee_ids: list[int]) -> dict[int, set[int]]:
    if not trainee_ids:
        return {}
    rows = (
        db.query(TraineeSkill.trainee_id, TraineeSkill.skill_id)
        .filter(TraineeSkill.trainee_id.in_(list(set(trainee_ids))))
        .all()
    )
    out: dict[int, set[int]] = defaultdict(set)
    for trainee_id, skill_id in rows:
        out[trainee_id].add(skill_id)
    return out


def get_job(db: Session, employer_id: int, job_id) -> dict | None:
    for job in demo_store.local_jobs(employer_id):
        if str(job["id"]) == str(job_id):
            return job
    try:
        job_pk = int(job_id)
    except (TypeError, ValueError):
        return None
    job = db.query(Job).filter(Job.id == job_pk, Job.employer_id == employer_id).first()
    if job is None:
        return None
    districts, occupations = _lookup_tables(db)
    skills = job_skill_names(db, [job.id]).get(job.id, [])
    applicants = db.query(Application).filter(Application.job_id == job.id).all()
    required = set(db_skill_ids(db, job.id))
    tsm = _trainee_skill_map(db, [a.trainee_id for a in applicants])
    strong = sum(
        1
        for a in applicants
        if required and len(required & tsm.get(a.trainee_id, set())) / len(required) * 100 >= STRONG_MATCH
    )
    return serialize_job(db, job, skills, len(applicants), strong, districts, occupations)


def create_job(db: Session, employer_id: int, payload: dict, district_id: int | None) -> dict:
    if not settings.ALLOW_DB_WRITES:
        job = {
            "id": demo_store.next_local_job_id(),
            "status": "open",
            "applicant_count": 0,
            "strong_match_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "provenance": "session",
            **payload,
        }
        return demo_store.add_local_job(employer_id, job)

    occupation_id = payload.get("occupation_id")
    if not occupation_id and payload.get("title"):
        match = (
            db.query(Occupation)
            .filter(Occupation.name.ilike("%{}%".format(payload["title"][:20])))
            .first()
        )
        occupation_id = match.id if match else None

    job = Job(
        employer_id=employer_id,
        occupation_id=occupation_id,
        district_id=payload.get("district_id") or district_id,
        title=payload.get("title") or "Untitled posting",
        status="open",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(job)
    db.flush()

    for name in payload.get("required_skills") or []:
        skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
        if skill:
            db.add(JobSkill(job_id=job.id, skill_id=skill.id))

    db.commit()
    db.refresh(job)
    _skill_id_cache.pop(job.id, None)

    demo_store.set_job_extras(job.id, {k: v for k, v in payload.items() if k != "title"})
    return get_job(db, employer_id, job.id)


def update_job(db: Session, employer_id: int, job_id, payload: dict) -> dict | None:
    local = demo_store.update_local_job(employer_id, job_id, payload)
    if local:
        return local

    try:
        job_pk = int(job_id)
    except (TypeError, ValueError):
        return None
    job = db.query(Job).filter(Job.id == job_pk, Job.employer_id == employer_id).first()
    if job is None:
        return None

    if payload.get("title") and settings.ALLOW_DB_WRITES:
        job.title = payload["title"]
    if payload.get("status") and settings.ALLOW_DB_WRITES:
        job.status = payload["status"]
    if settings.ALLOW_DB_WRITES:
        db.commit()

    demo_store.set_job_extras(job.id, payload)
    return get_job(db, employer_id, job.id)


def close_job(db: Session, employer_id: int, job_id) -> dict | None:
    return update_job(db, employer_id, job_id, {"status": "closed"})


# ---------------------------------------------------------------------------
# applicants & matching
# ---------------------------------------------------------------------------


def match_breakdown(
    required: set[int],
    trainee_skills: set[int],
    same_district: bool,
    avg_assessment: float | None,
    has_experience: bool,
) -> tuple[float, dict, list[str]]:
    skills_score = (
        len(required & trainee_skills) / len(required) * 100 if required else 50.0
    )
    location_score = 100.0 if same_district else 45.0
    experience_score = 75.0 if has_experience else 40.0
    education_score = avg_assessment if avg_assessment is not None else 50.0

    total = (
        skills_score * 0.55
        + education_score * 0.15
        + experience_score * 0.15
        + location_score * 0.15
    )

    reasons = []
    matched = len(required & trainee_skills)
    if required:
        reasons.append("Holds {} of {} required skills".format(matched, len(required)))
    if same_district:
        reasons.append("Based in the same district as the posting")
    if avg_assessment is not None:
        reasons.append("Average assessment score {}".format(round(avg_assessment)))
    if has_experience:
        reasons.append("Has prior employment recorded on the platform")

    return (
        round(total, 1),
        {
            "skills": round(skills_score),
            "education": round(education_score),
            "experience": round(experience_score),
            "location": round(location_score),
        },
        reasons,
    )


def _assessment_avgs(db: Session, trainee_ids: list[int]) -> dict[int, float]:
    if not trainee_ids:
        return {}
    rows = (
        db.query(Assessment.trainee_id, Assessment.score)
        .filter(Assessment.trainee_id.in_(list(set(trainee_ids))))
        .all()
    )
    acc: dict[int, list[float]] = defaultdict(list)
    for trainee_id, score in rows:
        if score is not None:
            acc[trainee_id].append(float(score))
    return {k: sum(v) / len(v) for k, v in acc.items()}


def list_applicants(db: Session, employer_id: int, job_id) -> list[dict]:
    try:
        job_pk = int(job_id)
    except (TypeError, ValueError):
        return []
    job = db.query(Job).filter(Job.id == job_pk, Job.employer_id == employer_id).first()
    if job is None:
        return []

    applications = db.query(Application).filter(Application.job_id == job.id).all()
    trainee_ids = [a.trainee_id for a in applications]
    trainees = {
        t.id: t for t in db.query(Trainee).filter(Trainee.id.in_(trainee_ids)).all()
    } if trainee_ids else {}
    districts, _ = _lookup_tables(db)
    required = set(db_skill_ids(db, job.id))
    tsm = _trainee_skill_map(db, trainee_ids)
    avgs = _assessment_avgs(db, trainee_ids)
    employed = {
        r[0]
        for r in db.query(Employment.trainee_id)
        .filter(Employment.trainee_id.in_(trainee_ids))
        .all()
    } if trainee_ids else set()

    out = []
    for app in applications:
        trainee = trainees.get(app.trainee_id)
        score, breakdown, reasons = match_breakdown(
            required,
            tsm.get(app.trainee_id, set()),
            bool(trainee and trainee.district_id == job.district_id),
            avgs.get(app.trainee_id),
            app.trainee_id in employed,
        )
        out.append(
            {
                "id": app.id,
                "trainee_id": app.trainee_id,
                "candidate_name": trainee.full_name if trainee else "Applicant",
                "job_id": job.id,
                "job_title": job.title,
                "status": demo_store.application_status_override(app.id) or app.status,
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
                "location": districts.get(trainee.district_id) if trainee else None,
                "match_score": score,
                "match_breakdown": breakdown,
                "match_reasons": reasons,
                "trainee_verified": demo_store.is_trainee_verified(app.trainee_id),
                "provenance": "observed",
            }
        )

    out.sort(key=lambda a: a["match_score"], reverse=True)
    return out


def candidate_matches(db: Session, employer_id: int, job_id, limit: int = 12) -> list[dict]:
    """Trainees who match the posting but have NOT applied to it."""
    try:
        job_pk = int(job_id)
    except (TypeError, ValueError):
        return []
    job = db.query(Job).filter(Job.id == job_pk, Job.employer_id == employer_id).first()
    if job is None:
        return []

    required = set(db_skill_ids(db, job.id))
    if not required:
        return []

    applied = {
        r[0] for r in db.query(Application.trainee_id).filter(Application.job_id == job.id).all()
    }

    candidate_ids = [
        r[0]
        for r in db.query(TraineeSkill.trainee_id)
        .filter(TraineeSkill.skill_id.in_(list(required)))
        .distinct()
        .limit(600)
        .all()
    ]
    candidate_ids = [c for c in candidate_ids if c not in applied]
    if not candidate_ids:
        return []

    trainees = {
        t.id: t for t in db.query(Trainee).filter(Trainee.id.in_(candidate_ids)).all()
    }
    districts, _ = _lookup_tables(db)
    tsm = _trainee_skill_map(db, candidate_ids)
    avgs = _assessment_avgs(db, candidate_ids)
    employed = {
        r[0]
        for r in db.query(Employment.trainee_id)
        .filter(Employment.trainee_id.in_(candidate_ids))
        .all()
    }
    skill_names = {s.id: s.name for s in db.query(Skill.id, Skill.name).all()}

    out = []
    for trainee_id in candidate_ids:
        trainee = trainees.get(trainee_id)
        if trainee is None:
            continue
        score, breakdown, reasons = match_breakdown(
            required,
            tsm.get(trainee_id, set()),
            trainee.district_id == job.district_id,
            avgs.get(trainee_id),
            trainee_id in employed,
        )
        out.append(
            {
                "trainee_id": trainee_id,
                "name": trainee.full_name,
                "location": districts.get(trainee.district_id),
                "skills": [
                    skill_names[s] for s in list(tsm.get(trainee_id, set()))[:6] if s in skill_names
                ],
                "match_score": score,
                "match_breakdown": breakdown,
                "match_reasons": reasons,
                "verified": demo_store.is_trainee_verified(trainee_id),
                "provenance": "predicted",
            }
        )

    out.sort(key=lambda c: c["match_score"], reverse=True)
    return out[:limit]


def update_application_status(db: Session, application_id, status: str) -> dict:
    valid = {"applied", "shortlisted", "interview", "assessment", "hired", "rejected"}
    if status not in valid:
        raise ValueError("status must be one of: {}".format(", ".join(sorted(valid))))

    application = db.query(Application).filter(Application.id == application_id).first()
    if application is None:
        raise LookupError("Application not found")

    if settings.ALLOW_DB_WRITES and status in {"applied", "shortlisted", "hired", "rejected"}:
        application.status = status
        db.commit()
        db.refresh(application)
    else:
        # "interview" / "assessment" aren't values the seeded column uses, so
        # they're kept as a session-level override rather than written.
        demo_store.set_application_status_override(application_id, status)

    return {
        "id": application.id,
        "status": demo_store.application_status_override(application.id) or application.status,
        "job_id": application.job_id,
        "trainee_id": application.trainee_id,
    }


# ---------------------------------------------------------------------------
# analytics
# ---------------------------------------------------------------------------


def analytics_for_employer(db: Session, employer_id: int) -> dict:
    job_ids = [r[0] for r in db.query(Job.id).filter(Job.employer_id == employer_id).all()]
    applications = (
        db.query(Application).filter(Application.job_id.in_(job_ids)).all() if job_ids else []
    )
    employments = db.query(Employment).filter(Employment.employer_id == employer_id).all()

    funnel = {"applied": 0, "shortlisted": 0, "assessment": 0, "interview": 0, "hired": 0}
    for app in applications:
        status = demo_store.application_status_override(app.id) or app.status
        funnel["applied"] += 1
        if status in ("shortlisted", "interview", "assessment", "hired"):
            funnel["shortlisted"] += 1
        if status in ("assessment", "interview", "hired"):
            funnel["assessment"] += 1
        if status in ("interview", "hired"):
            funnel["interview"] += 1
        if status == "hired":
            funnel["hired"] += 1

    # time to hire: application date -> employment start date, per trainee
    hired_dates = {
        a.trainee_id: a.applied_at for a in applications if a.status == "hired" and a.applied_at
    }
    deltas = []
    for e in employments:
        applied = hired_dates.get(e.trainee_id)
        if applied and e.start_date:
            days = (e.start_date - applied.date()).days
            if 0 <= days <= 365:
                deltas.append(days)

    from app.models.employment_followups import EmploymentFollowup

    employment_ids = [e.id for e in employments]
    followups = (
        db.query(EmploymentFollowup)
        .filter(EmploymentFollowup.employment_id.in_(employment_ids))
        .all()
        if employment_ids
        else []
    )
    start_by_employment = {e.id: e.start_date for e in employments}

    def retention_at(day_window: int) -> int | None:
        relevant = []
        for f in followups:
            start = start_by_employment.get(f.employment_id)
            if not start:
                continue
            days = (f.followup_date - start).days
            if abs(days - day_window) <= 20:
                relevant.append(bool(f.retained))
        if not relevant:
            return None
        return round(sum(1 for r in relevant if r) / len(relevant) * 100)

    salaries = [_monthly(e.salary) for e in employments if e.salary]

    return {
        "total_hires": len(employments),
        "avg_time_to_hire_days": round(sum(deltas) / len(deltas)) if deltas else None,
        "retention_30_day": retention_at(30),
        "retention_90_day": retention_at(90),
        "avg_salary_monthly": round(sum(salaries) / len(salaries)) if salaries else None,
        "open_postings": len(
            [r for r in db.query(Job.status).filter(Job.employer_id == employer_id).all() if r[0] == "open"]
        ),
        "funnel": funnel,
        "provenance": "observed",
    }


def skill_demand_for_employer(db: Session, employer_id: int) -> list[dict]:
    """For each skill this employer asks for: how many of its postings need it,
    and what share of its applicants actually hold it."""
    job_ids = [r[0] for r in db.query(Job.id).filter(Job.employer_id == employer_id).all()]
    if not job_ids:
        return []

    rows = (
        db.query(JobSkill.job_id, JobSkill.skill_id, Skill.name)
        .join(Skill, Skill.id == JobSkill.skill_id)
        .filter(JobSkill.job_id.in_(job_ids))
        .all()
    )
    required_counts: dict[tuple[int, str], int] = defaultdict(int)
    for _, skill_id, name in rows:
        required_counts[(skill_id, name)] += 1

    applicant_ids = [
        r[0] for r in db.query(Application.trainee_id).filter(Application.job_id.in_(job_ids)).all()
    ]
    tsm = _trainee_skill_map(db, applicant_ids)
    total_applicants = len(set(applicant_ids)) or 1

    out = []
    for (skill_id, name), count in required_counts.items():
        holders = sum(1 for skills in tsm.values() if skill_id in skills)
        out.append(
            {
                "skill": name,
                "required_count": count,
                "applicant_count": holders,
                "coverage_percentage": round(holders / total_applicants * 100),
                "provenance": "observed",
            }
        )
    out.sort(key=lambda s: (-s["required_count"], s["coverage_percentage"]))
    return out


def employer_profile(db: Session, employer) -> dict:
    districts, _ = _lookup_tables(db)
    from app.models.users import User

    user = db.query(User).filter(User.id == employer.user_id).first()
    return {
        "id": employer.id,
        "company_name": employer.company_name,
        "email": user.email if user else None,
        "contact_phone": employer.contact_phone,
        "district_id": employer.district_id,
        "location": "{}, Maharashtra".format(districts.get(employer.district_id))
        if employer.district_id
        else "Maharashtra",
        "verification": demo_store.employer_verification(employer.id),
        "provenance": "observed",
    }


def application_target(db: Session, employer_id: int, application_id) -> dict | None:
    """Minimal applicant record for one application id, used when assigning an
    assessment to someone who isn't in the currently-listed applicant set."""
    try:
        app_pk = int(application_id)
    except (TypeError, ValueError):
        return None

    row = (
        db.query(Application, Trainee)
        .join(Job, Job.id == Application.job_id)
        .outerjoin(Trainee, Trainee.id == Application.trainee_id)
        .filter(Application.id == app_pk, Job.employer_id == employer_id)
        .first()
    )
    if row is None:
        return None
    application, trainee = row
    return {
        "id": application.id,
        "trainee_id": application.trainee_id,
        "candidate_name": trainee.full_name if trainee else None,
        "trainee_verified": demo_store.is_trainee_verified(application.trainee_id),
    }
