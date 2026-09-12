"""Offline smoke test — no PostgreSQL required.

Builds a small SQLite database with the same schema and the same shape of data
as the seeded skillgrow database, then calls every endpoint the three panels
use and checks the response shapes.

Run from the backend directory:

    python tests/smoke_test.py

Exit code 0 means every route answered with the shape its panel expects.
This does not replace testing against the real Postgres dataset; it catches
wiring mistakes (bad routes, missing keys, ordering bugs) in seconds.
"""

import os
import random
import sys
import tempfile
from datetime import datetime, timedelta
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

DB_PATH = Path(tempfile.gettempdir()) / "kaushalsetu_smoke.db"
if DB_PATH.exists():
    DB_PATH.unlink()

os.environ["DATABASE_URL"] = "sqlite:///{}".format(DB_PATH)
os.environ["JWT_SECRET_KEY"] = "smoke-test-secret"
os.environ["ENABLE_ML"] = "false"
os.environ["ANALYTICS_CACHE_TTL"] = "0"

from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app.models.applications import Application  # noqa: E402
from app.models.assessments import Assessment  # noqa: E402
from app.models.districts import District  # noqa: E402
from app.models.employers import Employer  # noqa: E402
from app.models.employment import Employment  # noqa: E402
from app.models.employment_followups import EmploymentFollowup  # noqa: E402
from app.models.job_skills import JobSkill  # noqa: E402
from app.models.jobs import Job  # noqa: E402
from app.models.occupations import Occupation  # noqa: E402
from app.models.skill_demand import SkillDemand  # noqa: E402
from app.models.skills import Skill  # noqa: E402
from app.models.trainee_skills import TraineeSkill  # noqa: E402
from app.models.trainees import Trainee  # noqa: E402
from app.models.training_programs import TrainingProgram  # noqa: E402
from app.models.training_providers import TrainingProvider  # noqa: E402
from app.models.users import User  # noqa: E402

random.seed(42)

FAILURES = []
CHECKS = 0


def check(condition, label):
    global CHECKS
    CHECKS += 1
    if not condition:
        FAILURES.append(label)
        print("  FAIL  {}".format(label))
    else:
        print("  ok    {}".format(label))


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    districts = [District(name=n) for n in ["Pune", "Nashik", "Nagpur", "Gadchiroli"]]
    skills = [
        Skill(name=n, category=c)
        for n, c in [
            ("Electrical Wiring", "Construction"),
            ("Panel Installation", "Renewable Energy"),
            ("Safety Compliance", "General"),
            ("JavaScript", "IT"),
            ("CNC Operation", "Manufacturing"),
        ]
    ]
    occupations = [
        Occupation(name=n, category=c)
        for n, c in [
            ("Solar Technician", "Renewable Energy"),
            ("Electrician", "Construction"),
            ("Web Developer", "IT"),
        ]
    ]
    db.add_all(districts + skills + occupations)
    db.flush()

    providers = [
        TrainingProvider(name="{} ITI".format(d.name), district_id=d.id) for d in districts
    ]
    db.add_all(providers)
    db.flush()

    programs = [
        TrainingProgram(
            training_provider_id=p.id,
            name="{} Programme".format(p.name),
            duration_weeks=12,
            primary_skill_id=skills[i % len(skills)].id,
        )
        for i, p in enumerate(providers)
    ]
    db.add_all(programs)
    db.flush()

    now = datetime(2026, 9, 1)

    employers = []
    for i, d in enumerate(districts):
        user = User(
            email="employer{}@example.com".format(i),
            password_hash=hash_password("employerpass"),
            role="employer",
            created_at=now,
        )
        db.add(user)
        db.flush()
        employer = Employer(
            user_id=user.id,
            district_id=d.id,
            company_name="{} Industries".format(d.name),
            contact_phone="99999000{}".format(i),
        )
        db.add(employer)
        employers.append(employer)
    db.flush()

    trainees = []
    for i in range(60):
        district = districts[i % len(districts)]
        user = User(
            email="trainee{}@example.com".format(i),
            password_hash=hash_password("traineepass"),
            role="trainee",
            created_at=now,
        )
        db.add(user)
        db.flush()
        trainee = Trainee(
            user_id=user.id,
            district_id=district.id,
            full_name="Trainee {}".format(i),
            phone="88888000{}".format(i),
            training_program_id=programs[i % len(programs)].id,
        )
        db.add(trainee)
        trainees.append(trainee)
    db.flush()

    for t in trainees:
        chosen = random.sample(skills, k=random.randint(2, 4))
        for s in chosen:
            db.add(
                TraineeSkill(
                    trainee_id=t.id,
                    skill_id=s.id,
                    proficiency_level=random.choice(["beginner", "intermediate", "advanced"]),
                )
            )
            db.add(
                Assessment(
                    trainee_id=t.id,
                    skill_id=s.id,
                    training_program_id=t.training_program_id,
                    score=random.randint(35, 95),
                    assessed_at=now - timedelta(days=random.randint(30, 400)),
                )
            )
    db.flush()

    jobs = []
    for i in range(24):
        employer = employers[i % len(employers)]
        job = Job(
            employer_id=employer.id,
            occupation_id=occupations[i % len(occupations)].id,
            district_id=employer.district_id,
            title="{} opening {}".format(occupations[i % len(occupations)].name, i),
            status="open" if i % 4 else "closed",
            created_at=now - timedelta(days=random.randint(10, 500)),
        )
        db.add(job)
        db.flush()
        for s in random.sample(skills, k=2):
            db.add(JobSkill(job_id=job.id, skill_id=s.id))
        jobs.append(job)
    db.flush()

    applications = []
    for i, t in enumerate(trainees):
        for job in random.sample(jobs, k=2):
            app_row = Application(
                trainee_id=t.id,
                job_id=job.id,
                status=random.choice(["applied", "applied", "shortlisted", "rejected", "hired"]),
                applied_at=now - timedelta(days=random.randint(5, 500)),
            )
            db.add(app_row)
            applications.append(app_row)
    db.flush()

    for app_row in applications:
        if app_row.status != "hired":
            continue
        job = next(j for j in jobs if j.id == app_row.job_id)
        start = app_row.applied_at.date() + timedelta(days=random.randint(10, 40))
        employment = Employment(
            trainee_id=app_row.trainee_id,
            employer_id=job.employer_id,
            occupation_id=job.occupation_id,
            district_id=job.district_id,
            salary=random.randint(180000, 500000),
            start_date=start,
        )
        db.add(employment)
        db.flush()
        for window in (30, 90):
            db.add(
                EmploymentFollowup(
                    employment_id=employment.id,
                    followup_date=start + timedelta(days=window),
                    retained=random.random() > 0.25,
                    salary_at_followup=float(employment.salary) * random.choice([1.0, 1.0, 1.08]),
                )
            )

    for s in skills:
        for d in districts:
            for o in occupations:
                db.add(
                    SkillDemand(
                        skill_id=s.id,
                        district_id=d.id,
                        occupation_id=o.id,
                        demand_score=random.randint(20, 95),
                        recorded_at=(now - timedelta(days=random.choice([30, 120, 210, 300]))).date(),
                    )
                )

    db.commit()
    db.close()


def main():
    seed()
    client = TestClient(app)

    print("\n--- system ---")
    r = client.get("/api/health")
    check(r.status_code == 200 and r.json()["database"] == "connected", "GET /api/health")

    print("\n--- shared sign-in page ---")
    r = client.get("/")
    check(
        r.status_code == 200 and "KaushalSetu" in r.text,
        "GET / serves the shared sign-in page",
    )
    check(
        "__PANEL_URLS__" not in r.text and "localhost:5174" in r.text,
        "panel URLs are injected into the page from settings",
    )

    print("\n--- auth ---")
    r = client.post(
        "/api/auth/login", json={"email": "trainee0@example.com", "password": "traineepass"}
    )
    check(r.status_code == 200 and "access_token" in r.json(), "POST /api/auth/login")
    token = r.json()["access_token"]
    headers = {"Authorization": "Bearer {}".format(token)}
    r = client.get("/api/auth/me", headers=headers)
    check(r.status_code == 200 and r.json()["role"] == "trainee", "GET /api/auth/me")
    r = client.post(
        "/api/auth/login", json={"email": "trainee0@example.com", "password": "wrong"}
    )
    check(r.status_code == 401, "POST /api/auth/login rejects a bad password")

    print("\n--- government portal ---")
    r = client.get("/api/gov/state-summary")
    body = r.json()
    check(
        r.status_code == 200
        and {"totalTrainees", "placementRate", "retentionRate", "avgSalary", "skillGap", "qoq", "healthScore"}
        <= set(body),
        "GET /api/gov/state-summary",
    )

    r = client.get("/api/gov/districts")
    districts = r.json()
    check(r.status_code == 200 and len(districts) == 4, "GET /api/gov/districts")
    check(
        {"id", "name", "healthScore", "trendSeries", "skills", "providers", "employers", "recommendations"}
        <= set(districts[0]),
        "district objects carry every key the portal reads",
    )
    check(len(districts[0]["trendSeries"]) == 8, "district trendSeries has 8 quarters")

    r = client.get("/api/gov/districts/trends")
    check(
        r.status_code == 200 and {"topImprovers", "biggestDeclines", "summary"} <= set(r.json()),
        "GET /api/gov/districts/trends (not read as a district id)",
    )

    r = client.get("/api/gov/districts/{}".format(districts[0]["id"]))
    check(r.status_code == 200 and r.json()["name"] == districts[0]["name"], "GET /api/gov/districts/{id}")

    r = client.get("/api/gov/districts/not-a-district")
    check(r.status_code == 404, "GET /api/gov/districts/{id} 404s on an unknown district")

    r = client.get("/api/gov/skills")
    check(
        r.status_code == 200
        and {"skill", "demand", "supply", "gap", "growth", "placement", "salary", "risk"}
        <= set(r.json()[0]),
        "GET /api/gov/skills",
    )

    r = client.get("/api/gov/career-outcomes")
    body = r.json()
    check(
        r.status_code == 200
        and {"training", "certification", "placement", "employment", "retention", "progression"}
        <= set(body["funnel"]),
        "GET /api/gov/career-outcomes",
    )

    r = client.get("/api/gov/early-warning")
    warnings = r.json()
    check(r.status_code == 200 and isinstance(warnings, list), "GET /api/gov/early-warning")
    if warnings:
        check(
            {"id", "severity", "district", "skill", "observedSignal", "predictedRisk", "recommendedAction"}
            <= set(warnings[0]),
            "early-warning objects carry every key the detail page reads",
        )
        r = client.get("/api/gov/early-warning/{}".format(warnings[0]["id"]))
        check(r.status_code == 200, "GET /api/gov/early-warning/{id}")

    r = client.post(
        "/api/gov/policy-simulator/run",
        json={
            "district": districts[0]["id"],
            "skill": "Electrical Wiring",
            "intervention": "Increase Training Seats",
            "quantity": 250,
            "horizon": "12 months",
        },
    )
    body = r.json()
    check(
        r.status_code == 200
        and {"placement", "employment", "retention", "skillGap", "impactScore", "confidence"} <= set(body)
        and body["placement"]["to"] >= body["placement"]["from"],
        "POST /api/gov/policy-simulator/run",
    )

    r = client.get("/api/gov/impact")
    check(
        r.status_code == 200 and {"score", "components", "ranking", "interventions"} <= set(r.json()),
        "GET /api/gov/impact",
    )

    print("\n--- employer panel ---")
    r = client.get("/api/employer/profile")
    check(r.status_code == 200 and "company_name" in r.json(), "GET /api/employer/profile (demo identity)")

    r = client.get("/api/employer/jobs")
    jobs = r.json()
    check(r.status_code == 200 and len(jobs) > 0, "GET /api/employer/jobs")
    check(
        {"id", "title", "status", "required_skills", "salary", "location", "applicant_count", "strong_match_count"}
        <= set(jobs[0]),
        "posting objects carry every key the posting card reads",
    )

    # Touch the assessments endpoint now, while the newest posting is still a
    # real seeded one — the module seeds its worked example from jobs[0].
    client.get("/api/employer/assessments")

    job_id = jobs[0]["id"]
    r = client.get("/api/employer/jobs/{}".format(job_id))
    check(r.status_code == 200, "GET /api/employer/jobs/{id}")

    r = client.get("/api/employer/jobs/{}/applications".format(job_id))
    applicants = r.json()
    check(r.status_code == 200 and isinstance(applicants, list), "GET /api/employer/jobs/{id}/applications")
    if applicants:
        check(
            {"id", "candidate_name", "status", "match_score", "match_breakdown"} <= set(applicants[0]),
            "applicant objects carry match score + breakdown",
        )

    r = client.get("/api/employer/jobs/{}/candidates".format(job_id))
    check(r.status_code == 200 and isinstance(r.json(), list), "GET /api/employer/jobs/{id}/candidates")

    r = client.get("/api/employer/analytics")
    check(
        r.status_code == 200 and "funnel" in r.json() and "total_hires" in r.json(),
        "GET /api/employer/analytics",
    )

    r = client.get("/api/employer/skill-demand")
    check(r.status_code == 200 and isinstance(r.json(), list), "GET /api/employer/skill-demand")

    r = client.post(
        "/api/employer/jobs",
        json={
            "title": "Smoke-test posting",
            "type": "job",
            "description": "Created by the smoke test.",
            "required_skills": ["Safety Compliance"],
            "openings": 2,
            "work_mode": "on-site",
        },
    )
    check(r.status_code == 201 and r.json()["title"] == "Smoke-test posting", "POST /api/employer/jobs")
    new_job_id = r.json()["id"]
    check(r.json()["openings"] == 2, "posting overlay fields survive the round trip")

    r = client.patch("/api/employer/jobs/{}/close".format(new_job_id))
    check(r.status_code == 200 and r.json()["status"] == "closed", "PATCH /api/employer/jobs/{id}/close")

    if applicants:
        r = client.patch(
            "/api/applications/{}/status".format(applicants[0]["id"]),
            json={"status": "shortlisted"},
        )
        check(
            r.status_code == 200 and r.json()["status"] == "shortlisted",
            "PATCH /api/applications/{id}/status",
        )
        r = client.patch(
            "/api/applications/{}/status".format(applicants[0]["id"]), json={"status": "nonsense"}
        )
        check(r.status_code == 400, "PATCH /api/applications/{id}/status rejects an unknown status")

    print("\n--- Test & PS ---")
    r = client.get("/api/employer/assessments")
    assessments = r.json()
    check(r.status_code == 200 and len(assessments) >= 1, "GET /api/employer/assessments (auto-seeded)")

    r = client.get("/api/employer/assessments/summary")
    check(
        r.status_code == 200 and "pending_review_count" in r.json(),
        "GET /api/employer/assessments/summary (not read as an assessment id)",
    )

    mcq = next((a for a in assessments if a["type"] == "test"), None)
    check(mcq is not None, "an MCQ assessment exists to assign")

    mcq_applicants = (
        client.get("/api/employer/jobs/{}/applications".format(mcq["job_id"])).json() if mcq else []
    )
    check(bool(mcq_applicants), "the MCQ's posting has applicants to assign it to")

    if mcq and mcq_applicants:
        applicants = mcq_applicants
        r = client.post(
            "/api/employer/assessments/{}/assign".format(mcq["id"]),
            json={"application_ids": [applicants[0]["id"]]},
        )
        check(r.status_code == 200 and r.json()["assigned_count"] == 1, "POST assessments/{id}/assign")

        r = client.get("/api/employer/assessments/{}/submissions".format(mcq["id"]))
        subs = r.json()
        check(r.status_code == 200 and len(subs) == 1, "GET assessments/{id}/submissions")

        trainee_id = applicants[0]["trainee_id"]
        trainee_user = SessionLocal().query(Trainee).filter(Trainee.id == trainee_id).first()
        t_login = client.post(
            "/api/auth/login",
            json={
                "email": SessionLocal().query(User).filter(User.id == trainee_user.user_id).first().email,
                "password": "traineepass",
            },
        )
        t_headers = {"Authorization": "Bearer {}".format(t_login.json()["access_token"])}

        r = client.get("/api/trainee/assessments", headers=t_headers)
        assigned = r.json()
        check(r.status_code == 200 and len(assigned) == 1, "GET /api/trainee/assessments")
        check(
            "correct_index" not in str(assigned[0]["questions"]),
            "answer key is NOT sent to the trainee",
        )

        r = client.post(
            "/api/trainee/assessments/{}/submit".format(subs[0]["id"]),
            json={"answers": [1, 2]},
            headers=t_headers,
        )
        check(
            r.status_code == 200 and r.json()["score"] == 100.0 and r.json()["status"] == "evaluated",
            "POST /api/trainee/assessments/{id}/submit auto-grades the MCQ",
        )

        r = client.patch(
            "/api/employer/submissions/{}/review".format(subs[0]["id"]),
            json={"score": 88, "status": "evaluated", "feedback": "Good work."},
        )
        check(r.status_code == 200 and r.json()["score"] == 88, "PATCH submissions/{id}/review")

    print("\n--- verification ---")
    r = client.post(
        "/api/employer/verification/digilocker",
        json={"documents": [{"type": "GSTIN", "id": "27AAAAA0000A1Z5"}]},
    )
    check(
        r.status_code == 200 and r.json()["verification"]["status"] == "verified",
        "POST /api/employer/verification/digilocker persists",
    )

    r = client.post(
        "/api/trainee/verification/digilocker",
        json={"documents": [{"type": "Aadhaar", "id": "XXXX-1234"}]},
        headers=headers,
    )
    check(r.status_code == 200 and r.json()["status"] == "verified", "POST /api/trainee/verification/digilocker")

    print("\n--- trainee panel ---")
    r = client.get("/api/trainee/profile", headers=headers)
    check(r.status_code == 200 and "full_name" in r.json(), "GET /api/trainee/profile")

    r = client.get("/api/trainee/skills", headers=headers)
    check(r.status_code == 200 and isinstance(r.json(), list), "GET /api/trainee/skills")

    r = client.get("/api/trainee/skill-gap", headers=headers)
    gap = r.json()
    check(
        r.status_code == 200 and gap["rows"] and {"skill", "current", "required"} <= set(gap["rows"][0]),
        "GET /api/trainee/skill-gap returns chart-ready rows",
    )

    r = client.get("/api/trainee/skill-gap?occupation=Electrician", headers=headers)
    check(r.status_code == 200 and r.json()["occupation"] == "Electrician", "skill-gap honours ?occupation=")

    r = client.get("/api/trainee/opportunities", headers=headers)
    opps = r.json()
    check(
        r.status_code == 200
        and opps
        and {"id", "role", "employer", "location", "wage", "match", "type"} <= set(opps[0]),
        "GET /api/trainee/opportunities matches the opportunity card shape",
    )
    check(
        all(opps[i]["match"] >= opps[i + 1]["match"] for i in range(len(opps) - 1)),
        "opportunities are ranked by match score",
    )

    r = client.get("/api/trainee/applications", headers=headers)
    apps = r.json()
    check(
        r.status_code == 200 and (not apps or {"id", "role", "stage", "history"} <= set(apps[0])),
        "GET /api/trainee/applications",
    )

    unapplied = next((o for o in opps if not o["alreadyApplied"]), None)
    if unapplied:
        r = client.post(
            "/api/trainee/applications", json={"job_id": unapplied["job_id"]}, headers=headers
        )
        check(r.status_code == 201 and r.json()["new"] is True, "POST /api/trainee/applications")
        r = client.post(
            "/api/trainee/applications", json={"job_id": unapplied["job_id"]}, headers=headers
        )
        check(r.json()["new"] is False, "re-applying to the same posting is a no-op")

    r = client.get("/api/trainee/notifications", headers=headers)
    check(r.status_code == 200 and isinstance(r.json(), list), "GET /api/trainee/notifications")

    r = client.get("/api/trainee/peer-benchmark", headers=headers)
    check(r.status_code == 200, "GET /api/trainee/peer-benchmark")

    r = client.get("/api/trainee/occupations", headers=headers)
    check(r.status_code == 200 and len(r.json()) == 3, "GET /api/trainee/occupations")

    print("\n--- registration ---")
    r = client.post(
        "/api/auth/register",
        json={
            "email": "newtrainee@example.com",
            "password": "a-good-password",
            "role": "trainee",
            "full_name": "New Trainee",
        },
    )
    check(r.status_code == 201 and "access_token" in r.json(), "POST /api/auth/register (trainee)")
    check(r.json()["user"]["role"] == "trainee", "registration returns the new user's role")

    r = client.post(
        "/api/auth/register",
        json={"email": "newtrainee@example.com", "password": "a-good-password", "role": "trainee"},
    )
    check(r.status_code == 409, "registering an existing email is rejected")

    r = client.post(
        "/api/auth/register",
        json={"email": "shortpw@example.com", "password": "short", "role": "trainee"},
    )
    check(r.status_code == 400, "a password under 8 characters is rejected")

    r = client.post(
        "/api/auth/register",
        json={"email": "newemployer@example.com", "password": "a-good-password",
              "role": "employer", "company_name": "New Co"},
    )
    check(r.status_code == 201, "POST /api/auth/register (employer)")

    r = client.post(
        "/api/auth/login",
        json={"email": "newtrainee@example.com", "password": "a-good-password"},
    )
    check(r.status_code == 200, "a newly registered account can sign in")
    new_headers = {"Authorization": "Bearer {}".format(r.json()["access_token"])}
    r = client.get("/api/trainee/profile", headers=new_headers)
    check(
        r.status_code == 200 and r.json()["full_name"] == "New Trainee",
        "a new trainee's own profile is scoped to them",
    )

    r = client.get("/api/gov/state-summary", headers=new_headers)
    check(
        r.status_code == 200,
        "gov routes stay open to any token while ALLOW_DEMO_IDENTITY is on",
    )

    print("\n--- generic reader (registered last) ---")
    r = client.get("/api/districts")
    check(r.status_code == 200 and len(r.json()) == 4, "GET /api/districts still works")
    r = client.get("/api/users")
    check(
        r.status_code == 200 and "password_hash" not in r.json()[0],
        "generic reader never exposes password hashes",
    )
    r = client.get("/api/career-twin/1/1")
    check(r.status_code == 503, "career-twin returns 503 when ENABLE_ML=false (not a crash)")

    print("\n" + "=" * 60)
    if FAILURES:
        print("FAILED {} of {} checks:".format(len(FAILURES), CHECKS))
        for f in FAILURES:
            print("  - {}".format(f))
        return 1
    print("PASSED all {} checks".format(CHECKS))
    return 0


if __name__ == "__main__":
    sys.exit(main())
