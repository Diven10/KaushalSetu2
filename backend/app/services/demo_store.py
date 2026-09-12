"""In-process store for the two features that have no table in the schema yet:
the Test & PS module and DigiLocker verification.

Why not tables: the Phase 2 dataset is finished and signed off, and adding
tables to it is a schema change that needs sign-off first. So these two
features are served from process memory — they behave like real endpoints
(create, assign, submit, auto-grade, review, persist-for-the-session) but the
data resets when uvicorn restarts.

database/migrations/001_assessments_and_verification.sql has the DDL for
turning this into real storage when that decision is made. Nothing in this
file writes to the database.
"""

from __future__ import annotations

import itertools
from datetime import date, datetime, timedelta, timezone

_counter = itertools.count(1000)


def _next_id(prefix: str) -> str:
    return "{}-{}".format(prefix, next(_counter))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# employer_id -> list[assessment]
_assessments: dict[int, list[dict]] = {}
# employer_id -> verification record
_verification: dict[int, dict] = {}
# trainee_id -> verification record
_trainee_verification: dict[int, dict] = {}


# ---------------------------------------------------------------------------
# assessments
# ---------------------------------------------------------------------------


def seed_employer(employer_id: int, jobs: list[dict]) -> None:
    """Give a brand-new employer session one worked example per kind, built
    from that employer's own real postings, so the module isn't empty on first
    open. Called once per employer."""
    if employer_id in _assessments:
        return
    _assessments[employer_id] = []
    if not jobs:
        return

    job = jobs[0]
    skills = job.get("required_skills") or []
    due = (date.today() + timedelta(days=10)).isoformat()

    _assessments[employer_id].append(
        {
            "id": _next_id("assess"),
            "employer_id": employer_id,
            "job_id": job["id"],
            "job_title": job["title"],
            "title": "{} — Skills Test".format(job["title"]),
            "type": "test",
            "skills_tested": skills[:3],
            "due_date": due,
            "duration_minutes": 20,
            "pass_threshold": 60,
            "questions": [
                {
                    "prompt": "Before starting work on site, what is the first safety step?",
                    "options": [
                        "Begin work immediately to save time",
                        "Isolate the supply, lock out, and verify with a meter",
                        "Ask a colleague to supervise informally",
                        "Check next week's weather",
                    ],
                    "correct_index": 1,
                },
                {
                    "prompt": "A task falls outside your training. What do you do?",
                    "options": [
                        "Attempt it and learn on the job",
                        "Skip it silently",
                        "Escalate to a supervisor before proceeding",
                        "Ask another trainee to do it",
                    ],
                    "correct_index": 2,
                },
            ],
            "created_at": _now_iso(),
            "submissions": [],
        }
    )

    if len(jobs) > 1:
        job2 = jobs[1]
        _assessments[employer_id].append(
            {
                "id": _next_id("assess"),
                "employer_id": employer_id,
                "job_id": job2["id"],
                "job_title": job2["title"],
                "title": "{} — Practical Problem Statement".format(job2["title"]),
                "type": "ps",
                "skills_tested": (job2.get("required_skills") or [])[:2],
                "due_date": due,
                "pass_threshold": None,
                "brief": (
                    "Describe, step by step, how you would complete a typical day-one task "
                    "for this role. Include the tools you would use and the checks you would "
                    "run before signing off."
                ),
                "created_at": _now_iso(),
                "submissions": [],
            }
        )


def list_assessments(employer_id: int) -> list[dict]:
    return _assessments.get(employer_id, [])


def decorate(assessment: dict) -> dict:
    subs = assessment.get("submissions", [])
    scored = [s["score"] for s in subs if s.get("score") is not None]
    return {
        **assessment,
        "assigned_count": len(subs),
        "pending_review_count": len([s for s in subs if s.get("status") == "submitted"]),
        "average_score": round(sum(scored) / len(scored), 1) if scored else None,
    }


def get_assessment(employer_id: int, assessment_id: str) -> dict | None:
    for a in _assessments.get(employer_id, []):
        if str(a["id"]) == str(assessment_id):
            return a
    return None


def find_assessment_anywhere(assessment_id: str) -> dict | None:
    for items in _assessments.values():
        for a in items:
            if str(a["id"]) == str(assessment_id):
                return a
    return None


def create_assessment(employer_id: int, payload: dict, job_title: str | None) -> dict:
    assessment = {
        "id": _next_id("assess"),
        "employer_id": employer_id,
        "job_title": job_title,
        "created_at": _now_iso(),
        "submissions": [],
        **payload,
    }
    _assessments.setdefault(employer_id, []).insert(0, assessment)
    return assessment


def update_assessment(employer_id: int, assessment_id: str, payload: dict) -> dict | None:
    a = get_assessment(employer_id, assessment_id)
    if a is None:
        return None
    a.update({k: v for k, v in payload.items() if v is not None})
    return a


def assign(employer_id: int, assessment_id: str, targets: list[dict]) -> dict | None:
    """targets: [{application_id, trainee_id, candidate_name, verified}]"""
    a = get_assessment(employer_id, assessment_id)
    if a is None:
        return None
    existing = {str(s["application_id"]) for s in a["submissions"]}
    for t in targets:
        if str(t["application_id"]) in existing:
            continue
        a["submissions"].append(
            {
                "id": _next_id("sub"),
                "assessment_id": a["id"],
                "application_id": t["application_id"],
                "trainee_id": t.get("trainee_id"),
                "candidate_name": t.get("candidate_name"),
                "verified": bool(t.get("verified")),
                "status": "assigned",
                "score": None,
                "feedback": None,
                "submission_text": None,
                "assigned_at": _now_iso(),
            }
        )
    return a


def submissions(employer_id: int, assessment_id: str) -> list[dict] | None:
    a = get_assessment(employer_id, assessment_id)
    return None if a is None else a["submissions"]


def find_submission(submission_id: str) -> tuple[dict, dict] | tuple[None, None]:
    for items in _assessments.values():
        for a in items:
            for s in a["submissions"]:
                if str(s["id"]) == str(submission_id):
                    return a, s
    return None, None


def review_submission(submission_id: str, payload: dict) -> dict | None:
    _, sub = find_submission(submission_id)
    if sub is None:
        return None
    if payload.get("score") is not None:
        sub["score"] = payload["score"]
    if payload.get("status"):
        sub["status"] = payload["status"]
    if payload.get("feedback") is not None:
        sub["feedback"] = payload["feedback"]
    sub["reviewed_at"] = _now_iso()
    return sub


def summary(employer_id: int) -> dict:
    items = _assessments.get(employer_id, [])
    all_subs = [s for a in items for s in a["submissions"]]
    scored = [s["score"] for s in all_subs if s.get("score") is not None]
    recent = sorted(
        all_subs,
        key=lambda s: s.get("reviewed_at") or s.get("submitted_at") or s.get("assigned_at") or "",
        reverse=True,
    )[:5]
    return {
        "total_assessments": len(items),
        "assigned_count": len(all_subs),
        "pending_review_count": len([s for s in all_subs if s["status"] == "submitted"]),
        "awaiting_submission_count": len([s for s in all_subs if s["status"] == "assigned"]),
        "average_score": round(sum(scored) / len(scored), 1) if scored else None,
        "recent_activity": [
            {
                "submission_id": s["id"],
                "candidate_name": s.get("candidate_name"),
                "status": s["status"],
                "score": s.get("score"),
                "at": s.get("reviewed_at") or s.get("submitted_at") or s.get("assigned_at"),
            }
            for s in recent
        ],
    }


# --- trainee side ---


def assessments_for_trainee(trainee_id: int) -> list[dict]:
    out = []
    for items in _assessments.values():
        for a in items:
            for s in a["submissions"]:
                if s.get("trainee_id") == trainee_id:
                    out.append(
                        {
                            "id": a["id"],
                            "submission_id": s["id"],
                            "title": a["title"],
                            "type": a["type"],
                            "job_title": a.get("job_title"),
                            "skills_tested": a.get("skills_tested", []),
                            "due_date": a.get("due_date"),
                            "duration_minutes": a.get("duration_minutes"),
                            "pass_threshold": a.get("pass_threshold"),
                            "questions": [
                                {"prompt": q["prompt"], "options": q["options"]}
                                for q in a.get("questions", [])
                            ],
                            "brief": a.get("brief"),
                            "status": s["status"],
                            "score": s.get("score"),
                            "feedback": s.get("feedback"),
                        }
                    )
    return out


def submit(submission_id: str, answers: list[int] | None, text: str | None) -> dict | None:
    """Auto-grades MCQ tests; problem statements go to the employer for review."""
    assessment, sub = find_submission(submission_id)
    if sub is None:
        return None

    sub["submitted_at"] = _now_iso()

    if assessment["type"] == "test" and answers is not None:
        questions = assessment.get("questions", [])
        if questions:
            correct = sum(
                1
                for i, q in enumerate(questions)
                if i < len(answers) and answers[i] == q["correct_index"]
            )
            sub["score"] = round(correct / len(questions) * 100, 1)
            threshold = assessment.get("pass_threshold") or 0
            sub["status"] = "evaluated"
            sub["passed"] = sub["score"] >= threshold
            sub["answers"] = answers
            return sub

    sub["submission_text"] = text
    sub["status"] = "submitted"
    return sub


# ---------------------------------------------------------------------------
# DigiLocker verification
# ---------------------------------------------------------------------------


def employer_verification(employer_id: int) -> dict:
    return _verification.get(employer_id, {"status": "pending", "documents": []})


def set_employer_verification(employer_id: int, documents: list) -> dict:
    record = {
        "status": "verified" if documents else "pending",
        "documents": documents,
        "verified_at": _now_iso() if documents else None,
        "method": "DigiLocker (simulated consent)",
    }
    _verification[employer_id] = record
    return record


def trainee_verification(trainee_id: int) -> dict:
    return _trainee_verification.get(trainee_id, {"status": "pending", "documents": []})


def set_trainee_verification(trainee_id: int, documents: list) -> dict:
    record = {
        "status": "verified" if documents else "pending",
        "documents": documents,
        "verified_at": _now_iso() if documents else None,
        "method": "DigiLocker (simulated consent)",
    }
    _trainee_verification[trainee_id] = record
    return record


def is_trainee_verified(trainee_id: int) -> bool:
    return _trainee_verification.get(trainee_id, {}).get("status") == "verified"


# ---------------------------------------------------------------------------
# job overlay
# ---------------------------------------------------------------------------
# The `jobs` table holds id / employer / occupation / district / title /
# status / created_at. The Employer Panel's posting form collects more than
# that (description, salary band, work mode, openings, deadline, preferred
# skills). Those extra fields are kept here, keyed by job id, and merged over
# the real row on read. Same rationale as above: no schema change without
# sign-off.

_job_extras: dict[str, dict] = {}
# Used only when settings.ALLOW_DB_WRITES is false: postings created in the
# panel live here for the session instead of being inserted.
_local_jobs: dict[int, list[dict]] = {}
_application_status: dict[str, str] = {}


def job_extras(job_id) -> dict:
    return _job_extras.get(str(job_id), {})


def set_job_extras(job_id, payload: dict) -> dict:
    current = _job_extras.get(str(job_id), {})
    current.update({k: v for k, v in payload.items() if v is not None})
    _job_extras[str(job_id)] = current
    return current


def local_jobs(employer_id: int) -> list[dict]:
    return _local_jobs.get(employer_id, [])


def add_local_job(employer_id: int, job: dict) -> dict:
    _local_jobs.setdefault(employer_id, []).insert(0, job)
    return job


def update_local_job(employer_id: int, job_id, payload: dict) -> dict | None:
    for job in _local_jobs.get(employer_id, []):
        if str(job["id"]) == str(job_id):
            job.update({k: v for k, v in payload.items() if v is not None})
            return job
    return None


def application_status_override(application_id) -> str | None:
    return _application_status.get(str(application_id))


def set_application_status_override(application_id, status: str) -> None:
    _application_status[str(application_id)] = status


def next_local_job_id() -> str:
    return _next_id("job")
