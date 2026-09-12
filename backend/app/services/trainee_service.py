"""Everything the Trainee Panel reads, assembled from the real tables.

Shapes here are the ones the panel's components already use (see
frontend/trainee-panel/src/data/mockData.js) so the live data drops straight
into the existing cards: opportunities carry `role/employer/location/wage/
match/type`, the skill-gap rows carry `skill/current/required`, and so on.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.applications import Application
from app.models.assessments import Assessment
from app.models.districts import District
from app.models.employers import Employer
from app.models.employment import Employment
from app.models.job_skills import JobSkill
from app.models.jobs import Job
from app.models.occupations import Occupation
from app.models.skill_demand import SkillDemand
from app.models.skills import Skill
from app.models.trainee_skills import TraineeSkill
from app.models.trainees import Trainee
from app.models.training_programs import TrainingProgram
from app.models.training_providers import TrainingProvider
from app.services import demo_store

PROFICIENCY_SCORE = {"beginner": 50, "intermediate": 70, "advanced": 85}

STAGE_FOR_STATUS = {
    "applied": "Applied",
    "shortlisted": "Shortlisted",
    "assessment": "Assessment",
    "interview": "Interview",
    "hired": "Hired",
    "rejected": "Applied",
}


def _monthly(value) -> float:
    return float(value) / 12 if value else 0.0


def _wage_band(db: Session, occupation_id: int | None) -> str:
    if not occupation_id:
        return "Not specified"
    rows = (
        db.query(Employment.salary)
        .filter(Employment.occupation_id == occupation_id, Employment.salary.isnot(None))
        .all()
    )
    values = sorted(_monthly(r[0]) for r in rows if r[0])
    if not values:
        return "Not specified"
    low = values[len(values) // 4]
    high = values[(len(values) * 3) // 4]
    return "₹{:,.0f} – ₹{:,.0f} / month".format(round(low, -2), round(high, -2))


def skill_scores(db: Session, trainee_id: int) -> dict[int, float]:
    """Current proficiency per skill: the assessment score when there is one,
    otherwise the recorded proficiency level."""
    scores: dict[int, float] = {}
    for skill_id, level in (
        db.query(TraineeSkill.skill_id, TraineeSkill.proficiency_level)
        .filter(TraineeSkill.trainee_id == trainee_id)
        .all()
    ):
        scores[skill_id] = PROFICIENCY_SCORE.get((level or "").lower(), 55)

    for skill_id, score in (
        db.query(Assessment.skill_id, Assessment.score)
        .filter(Assessment.trainee_id == trainee_id, Assessment.skill_id.isnot(None))
        .all()
    ):
        if score is not None:
            scores[skill_id] = float(score)
    return scores


def profile(db: Session, trainee: Trainee) -> dict:
    district = (
        db.query(District).filter(District.id == trainee.district_id).first()
        if trainee.district_id
        else None
    )
    program = (
        db.query(TrainingProgram).filter(TrainingProgram.id == trainee.training_program_id).first()
        if trainee.training_program_id
        else None
    )
    provider = (
        db.query(TrainingProvider)
        .filter(TrainingProvider.id == program.training_provider_id)
        .first()
        if program
        else None
    )
    employment = (
        db.query(Employment)
        .filter(Employment.trainee_id == trainee.id)
        .order_by(Employment.start_date.desc())
        .first()
    )
    employer = (
        db.query(Employer).filter(Employer.id == employment.employer_id).first()
        if employment
        else None
    )
    scores = skill_scores(db, trainee.id)
    assessments = [
        float(s)
        for (s,) in db.query(Assessment.score).filter(Assessment.trainee_id == trainee.id).all()
        if s is not None
    ]

    return {
        "trainee_id": trainee.id,
        "full_name": trainee.full_name,
        "phone": trainee.phone,
        "date_of_birth": trainee.date_of_birth.isoformat() if trainee.date_of_birth else None,
        "district": district.name if district else None,
        "district_id": trainee.district_id,
        "state": "Maharashtra",
        "training_program": program.name if program else None,
        "training_provider": provider.name if provider else None,
        "skill_count": len(scores),
        "assessment_count": len(assessments),
        "average_assessment_score": round(sum(assessments) / len(assessments), 1)
        if assessments
        else None,
        "employment": {
            "status": "employed" if employment and not employment.end_date else "seeking",
            "employer": employer.company_name if employer else None,
            "monthly_salary": round(_monthly(employment.salary)) if employment else None,
            "start_date": employment.start_date.isoformat()
            if employment and employment.start_date
            else None,
        },
        "verification": demo_store.trainee_verification(trainee.id),
        "provenance": "observed",
    }


def skills(db: Session, trainee_id: int) -> list[dict]:
    scores = skill_scores(db, trainee_id)
    names = {s.id: s for s in db.query(Skill).filter(Skill.id.in_(scores.keys())).all()} if scores else {}
    levels = dict(
        db.query(TraineeSkill.skill_id, TraineeSkill.proficiency_level)
        .filter(TraineeSkill.trainee_id == trainee_id)
        .all()
    )
    out = [
        {
            "skill_id": skill_id,
            "skill": names[skill_id].name,
            "category": names[skill_id].category,
            "proficiency_level": levels.get(skill_id),
            "score": score,
            "provenance": "observed",
        }
        for skill_id, score in scores.items()
        if skill_id in names
    ]
    out.sort(key=lambda s: s["score"], reverse=True)
    return out


def _required_scores_for_occupation(db: Session, occupation_id: int) -> dict[int, float]:
    """What the occupation needs, taken from the skill_demand table."""
    rows = (
        db.query(SkillDemand.skill_id, SkillDemand.demand_score)
        .filter(SkillDemand.occupation_id == occupation_id)
        .all()
    )
    acc: dict[int, list[float]] = defaultdict(list)
    for skill_id, score in rows:
        if score is not None:
            acc[skill_id].append(float(score))
    return {k: sum(v) / len(v) for k, v in acc.items()}


def resolve_occupation(db: Session, occupation: str | None, occupation_id: int | None):
    if occupation_id:
        return db.query(Occupation).filter(Occupation.id == occupation_id).first()
    if occupation:
        match = db.query(Occupation).filter(Occupation.name.ilike(occupation)).first()
        if match:
            return match
        return db.query(Occupation).filter(Occupation.name.ilike("%{}%".format(occupation))).first()
    return None


def skill_gap(
    db: Session, trainee_id: int, occupation: str | None = None, occupation_id: int | None = None
) -> dict:
    target = resolve_occupation(db, occupation, occupation_id)
    if target is None:
        # Fall back to the occupation this trainee has most often applied to.
        row = (
            db.query(Job.occupation_id)
            .join(Application, Application.job_id == Job.id)
            .filter(Application.trainee_id == trainee_id, Job.occupation_id.isnot(None))
            .first()
        )
        if row:
            target = db.query(Occupation).filter(Occupation.id == row[0]).first()
    if target is None:
        target = db.query(Occupation).order_by(Occupation.id).first()
    if target is None:
        return {"occupation": None, "rows": [], "matchScore": 0, "criticalGaps": []}

    required = _required_scores_for_occupation(db, target.id)
    # Keep the 8 skills the occupation demands most.
    top = sorted(required.items(), key=lambda kv: kv[1], reverse=True)[:8]
    current = skill_scores(db, trainee_id)
    names = {
        s.id: s.name
        for s in db.query(Skill.id, Skill.name).filter(Skill.id.in_([k for k, _ in top])).all()
    } if top else {}

    rows = []
    for skill_id, required_score in top:
        rows.append(
            {
                "skill_id": skill_id,
                "skill": names.get(skill_id, "Skill {}".format(skill_id)),
                "current": round(current.get(skill_id, 0)),
                "required": round(required_score),
            }
        )

    covered = sum(min(r["current"], r["required"]) for r in rows)
    needed = sum(r["required"] for r in rows) or 1

    return {
        "occupation": target.name,
        "occupation_id": target.id,
        "rows": rows,
        "matchScore": round(covered / needed * 100, 1),
        "criticalGaps": [r["skill"] for r in rows if r["required"] - r["current"] >= 15],
        "provenance": "observed",
    }


def opportunities(db: Session, trainee: Trainee, limit: int = 12) -> list[dict]:
    """Open postings ranked by how well the trainee's skills match them."""
    my_skills = set(skill_scores(db, trainee.id).keys())

    jobs = (
        db.query(Job)
        .filter(Job.status == "open")
        .order_by(Job.created_at.desc())
        .limit(400)
        .all()
    )
    job_ids = [j.id for j in jobs]
    if not job_ids:
        return []

    skill_rows = (
        db.query(JobSkill.job_id, JobSkill.skill_id, Skill.name)
        .join(Skill, Skill.id == JobSkill.skill_id)
        .filter(JobSkill.job_id.in_(job_ids))
        .all()
    )
    req_ids: dict[int, set[int]] = defaultdict(set)
    req_names: dict[int, list[str]] = defaultdict(list)
    for job_id, skill_id, name in skill_rows:
        req_ids[job_id].add(skill_id)
        req_names[job_id].append(name)

    employers = {
        e.id: e.company_name
        for e in db.query(Employer.id, Employer.company_name).all()
    }
    districts = {d.id: d.name for d in db.query(District.id, District.name).all()}
    applied_job_ids = {
        r[0] for r in db.query(Application.job_id).filter(Application.trainee_id == trainee.id).all()
    }

    out = []
    for job in jobs:
        required = req_ids.get(job.id, set())
        skill_match = len(required & my_skills) / len(required) * 100 if required else 40.0
        location_bonus = 12 if job.district_id == trainee.district_id else 0
        match = round(min(skill_match * 0.85 + location_bonus, 99))
        out.append(
            {
                "id": "job-{}".format(job.id),
                "job_id": job.id,
                "role": job.title,
                "employer": employers.get(job.employer_id, "Employer"),
                "location": "{}, Maharashtra".format(districts.get(job.district_id))
                if job.district_id
                else "Maharashtra",
                "wage": _wage_band(db, job.occupation_id),
                "match": match,
                "type": "Full-time",
                "skills": req_names.get(job.id, []),
                "matched_skills": [
                    n
                    for sid, n in zip(req_ids.get(job.id, set()), req_names.get(job.id, []))
                    if sid in my_skills
                ],
                "alreadyApplied": job.id in applied_job_ids,
                "provenance": "observed",
            }
        )

    out.sort(key=lambda o: o["match"], reverse=True)
    return out[:limit]


def applications(db: Session, trainee: Trainee) -> list[dict]:
    rows = (
        db.query(Application, Job, Employer, District)
        .join(Job, Job.id == Application.job_id)
        .join(Employer, Employer.id == Job.employer_id)
        .outerjoin(District, District.id == Job.district_id)
        .filter(Application.trainee_id == trainee.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    out = []
    for app, job, employer, district in rows:
        status = demo_store.application_status_override(app.id) or app.status
        applied_on = app.applied_at.date().isoformat() if app.applied_at else None
        history = [{"stage": "Applied", "date": applied_on, "note": "Application submitted."}]
        if status in ("shortlisted", "interview", "assessment", "hired"):
            history.append({"stage": "Shortlisted", "date": applied_on, "note": "Employer shortlisted this application."})
        if status == "hired":
            history.append({"stage": "Hired", "date": applied_on, "note": "Offer accepted."})
        out.append(
            {
                "id": app.id,
                "opportunityId": "job-{}".format(job.id),
                "job_id": job.id,
                "role": job.title,
                "employer": employer.company_name,
                "location": "{}, Maharashtra".format(district.name) if district else "Maharashtra",
                "wage": _wage_band(db, job.occupation_id),
                "stage": STAGE_FOR_STATUS.get(status, "Applied"),
                "status": status,
                "rejected": status == "rejected",
                "appliedOn": applied_on,
                "history": history,
                "provenance": "observed",
            }
        )
    return out


def apply_to_job(db: Session, trainee: Trainee, job_id: int) -> dict:
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None:
        raise LookupError("Posting not found")

    existing = (
        db.query(Application)
        .filter(Application.trainee_id == trainee.id, Application.job_id == job_id)
        .first()
    )
    if existing:
        return {"id": existing.id, "status": existing.status, "job_id": job_id, "new": False}

    if not settings.ALLOW_DB_WRITES:
        raise PermissionError("Writes are disabled (ALLOW_DB_WRITES=false)")

    application = Application(
        trainee_id=trainee.id,
        job_id=job_id,
        status="applied",
        applied_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return {"id": application.id, "status": application.status, "job_id": job_id, "new": True}


def notifications(db: Session, trainee: Trainee) -> list[dict]:
    """Trainee-facing nudges, derived from that trainee's own real records."""
    items = []

    apps = applications(db, trainee)
    shortlisted = [a for a in apps if a["stage"] in ("Shortlisted", "Interview")]
    if shortlisted:
        items.append(
            {
                "id": "notif-shortlisted",
                "kind": "positive",
                "title": "{} application(s) moved forward".format(len(shortlisted)),
                "body": "{} shortlisted you. Keep an eye on your assessments tab.".format(
                    shortlisted[0]["employer"]
                ),
            }
        )

    pending = [
        a
        for a in demo_store.assessments_for_trainee(trainee.id)
        if a["status"] == "assigned"
    ]
    if pending:
        items.append(
            {
                "id": "notif-assessment",
                "kind": "action",
                "title": "{} assessment(s) waiting".format(len(pending)),
                "body": "Complete '{}' before the due date.".format(pending[0]["title"]),
            }
        )

    gap = skill_gap(db, trainee.id)
    if gap["criticalGaps"]:
        items.append(
            {
                "id": "notif-skill-gap",
                "kind": "warning",
                "title": "{} skills below what {} roles need".format(
                    len(gap["criticalGaps"]), gap["occupation"]
                ),
                "body": "Biggest gap: {}.".format(gap["criticalGaps"][0]),
            }
        )

    if demo_store.trainee_verification(trainee.id)["status"] != "verified":
        items.append(
            {
                "id": "notif-verification",
                "kind": "action",
                "title": "Verify your documents",
                "body": "Verified profiles are flagged to employers in their applicant list.",
            }
        )

    return items


def peer_benchmark(db: Session, trainee: Trainee) -> dict:
    """How this trainee compares with others in the same district."""
    peers = [
        r[0]
        for r in db.query(Trainee.id).filter(Trainee.district_id == trainee.district_id).all()
    ]
    if not peers:
        return {}

    my = skill_scores(db, trainee.id)
    my_avg = sum(my.values()) / len(my) if my else 0

    rows = (
        db.query(Assessment.trainee_id, Assessment.score)
        .filter(Assessment.trainee_id.in_(peers))
        .all()
    )
    acc: dict[int, list[float]] = defaultdict(list)
    for trainee_id, score in rows:
        if score is not None:
            acc[trainee_id].append(float(score))
    peer_avgs = sorted(sum(v) / len(v) for v in acc.values())

    if not peer_avgs:
        return {}
    below = len([v for v in peer_avgs if v < my_avg])
    return {
        "districtPeers": len(peers),
        "yourAverage": round(my_avg, 1),
        "districtAverage": round(sum(peer_avgs) / len(peer_avgs), 1),
        "percentile": round(below / len(peer_avgs) * 100),
        "provenance": "observed",
    }
