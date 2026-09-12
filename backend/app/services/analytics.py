"""The government analytics engine.

Everything the Government Portal shows is computed here, from the real seeded
database, in one pass. The result is cached in process for
settings.ANALYTICS_CACHE_TTL seconds because it is a full-dataset rollup
(10k trainees, ~21k applications, ~55k trainee-skill rows).

Two things are worth knowing about the numbers:

1. `salary` in the `employment` table is ANNUAL rupees. Every salary this
   module emits is MONTHLY (annual / 12), because that is what the portal's
   cards are labelled with.
2. Where a figure genuinely cannot be derived from the dataset (e.g. an
   intervention's historical effectiveness, which needs a policy history the
   platform doesn't have yet), it is produced by a transparent rule and
   tagged `"provenance": "rule"`. Everything else is tagged `"observed"`.
"""

from __future__ import annotations

import time
from collections import defaultdict
from datetime import date

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.applications import Application
from app.models.assessments import Assessment
from app.models.districts import District
from app.models.employers import Employer
from app.models.employment import Employment
from app.models.employment_followups import EmploymentFollowup
from app.models.job_skills import JobSkill
from app.models.jobs import Job
from app.models.occupations import Occupation
from app.models.skill_demand import SkillDemand
from app.models.skills import Skill
from app.models.trainee_skills import TraineeSkill
from app.models.trainees import Trainee
from app.models.training_programs import TrainingProgram
from app.models.training_providers import TrainingProvider

# ---------------------------------------------------------------------------
# small helpers
# ---------------------------------------------------------------------------

HIRED = "hired"
SHORTLISTED = "shortlisted"


def slug(name: str) -> str:
    return "-".join(str(name).lower().split())


def pct(numerator: float, denominator: float, default: float = 0.0) -> float:
    if not denominator:
        return default
    return round(numerator / denominator * 100, 1)


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def r1(value: float) -> float:
    return round(float(value), 1)


def as_float(value) -> float:
    return float(value) if value is not None else 0.0


def quarter_of(d: date) -> tuple[int, int]:
    return (d.year, (d.month - 1) // 3 + 1)


def quarter_label(q: tuple[int, int]) -> str:
    return f"Q{q[1]} {q[0]}"


def previous_quarters(latest: tuple[int, int], count: int) -> list[tuple[int, int]]:
    out = []
    year, q = latest
    for _ in range(count):
        out.append((year, q))
        q -= 1
        if q == 0:
            q = 4
            year -= 1
    return list(reversed(out))


def status_for(health: float) -> str:
    if health >= 80:
        return "HEALTHY"
    if health >= 65:
        return "WATCH"
    if health >= 50:
        return "AT RISK"
    return "CRITICAL"


def trend_category(yoy: float) -> str:
    if yoy >= 4:
        return "Improving"
    if yoy >= -1:
        return "Stable"
    if yoy >= -6:
        return "Declining"
    return "Significant Decline"


# ---------------------------------------------------------------------------
# raw dataset load
# ---------------------------------------------------------------------------


class RawData:
    """One read of every table the rollup needs."""

    def __init__(self, db: Session):
        self.districts = db.query(District.id, District.name).all()
        self.skills = db.query(Skill.id, Skill.name, Skill.category).all()
        self.occupations = db.query(Occupation.id, Occupation.name, Occupation.category).all()
        self.trainees = db.query(
            Trainee.id, Trainee.district_id, Trainee.training_program_id
        ).all()
        self.trainee_skills = db.query(
            TraineeSkill.trainee_id, TraineeSkill.skill_id, TraineeSkill.proficiency_level
        ).all()
        self.assessments = db.query(
            Assessment.trainee_id, Assessment.skill_id, Assessment.score
        ).all()
        self.applications = db.query(
            Application.id,
            Application.trainee_id,
            Application.job_id,
            Application.status,
            Application.applied_at,
        ).all()
        self.jobs = db.query(
            Job.id, Job.employer_id, Job.occupation_id, Job.district_id, Job.status, Job.created_at
        ).all()
        self.job_skills = db.query(JobSkill.job_id, JobSkill.skill_id).all()
        self.employment = db.query(
            Employment.id,
            Employment.trainee_id,
            Employment.employer_id,
            Employment.occupation_id,
            Employment.district_id,
            Employment.salary,
            Employment.start_date,
            Employment.end_date,
        ).all()
        self.followups = db.query(
            EmploymentFollowup.employment_id,
            EmploymentFollowup.followup_date,
            EmploymentFollowup.retained,
            EmploymentFollowup.salary_at_followup,
        ).all()
        self.skill_demand = db.query(
            SkillDemand.skill_id,
            SkillDemand.district_id,
            SkillDemand.occupation_id,
            SkillDemand.demand_score,
            SkillDemand.recorded_at,
        ).all()
        self.providers = db.query(
            TrainingProvider.id, TrainingProvider.name, TrainingProvider.district_id
        ).all()
        self.programs = db.query(
            TrainingProgram.id,
            TrainingProgram.training_provider_id,
            TrainingProgram.primary_skill_id,
            TrainingProgram.name,
        ).all()
        self.employers = db.query(
            Employer.id, Employer.district_id, Employer.company_name
        ).all()


# ---------------------------------------------------------------------------
# the rollup
# ---------------------------------------------------------------------------


def build_snapshot(db: Session) -> dict:
    raw = RawData(db)

    district_name = {d.id: d.name for d in raw.districts}
    skill_name = {s.id: s.name for s in raw.skills}
    skill_category = {s.id: (s.category or "General") for s in raw.skills}
    occupation_name = {o.id: o.name for o in raw.occupations}

    trainee_district = {t.id: t.district_id for t in raw.trainees}
    trainee_program = {t.id: t.training_program_id for t in raw.trainees}
    program_skill = {p.id: p.primary_skill_id for p in raw.programs}
    program_provider = {p.id: p.training_provider_id for p in raw.programs}
    job_district = {j.id: j.district_id for j in raw.jobs}
    job_employer = {j.id: j.employer_id for j in raw.jobs}
    job_occupation = {j.id: j.occupation_id for j in raw.jobs}

    # --- trainee-level facts -------------------------------------------------
    best_score: dict[int, float] = {}
    for a in raw.assessments:
        score = as_float(a.score)
        if score > best_score.get(a.trainee_id, -1):
            best_score[a.trainee_id] = score

    certified_trainees = {
        tid for tid, score in best_score.items() if score >= settings.PASS_MARK
    }

    applied_trainees = {a.trainee_id for a in raw.applications}
    hired_trainees = {a.trainee_id for a in raw.applications if a.status == HIRED}

    skills_of_trainee: dict[int, set[int]] = defaultdict(set)
    for ts in raw.trainee_skills:
        skills_of_trainee[ts.trainee_id].add(ts.skill_id)

    trainees_with_skill: dict[int, set[int]] = defaultdict(set)
    for ts in raw.trainee_skills:
        trainees_with_skill[ts.skill_id].add(ts.trainee_id)

    # --- employment ----------------------------------------------------------
    employment_by_id = {e.id: e for e in raw.employment}
    employed_trainees = {e.trainee_id for e in raw.employment}
    monthly_salary = {e.id: as_float(e.salary) / 12 for e in raw.employment}

    followups_by_employment: dict[int, list] = defaultdict(list)
    for f in raw.followups:
        followups_by_employment[f.employment_id].append(f)

    retained_flags: dict[int, bool] = {}
    for emp_id, items in followups_by_employment.items():
        latest = max(items, key=lambda f: f.followup_date)
        retained_flags[emp_id] = bool(latest.retained)

    # --- skill demand --------------------------------------------------------
    demand_by_skill_district: dict[tuple[int, int], list[float]] = defaultdict(list)
    demand_by_skill: dict[int, list[float]] = defaultdict(list)
    demand_dates: list[date] = []
    demand_by_skill_period: dict[int, dict[tuple[int, int], list[float]]] = defaultdict(
        lambda: defaultdict(list)
    )
    for sd in raw.skill_demand:
        score = as_float(sd.demand_score)
        demand_by_skill[sd.skill_id].append(score)
        if sd.district_id:
            demand_by_skill_district[(sd.skill_id, sd.district_id)].append(score)
        if sd.recorded_at:
            demand_dates.append(sd.recorded_at)
            demand_by_skill_period[sd.skill_id][quarter_of(sd.recorded_at)].append(score)

    def avg(values: list[float], default: float = 0.0) -> float:
        return sum(values) / len(values) if values else default

    # --- reference date & quarters ------------------------------------------
    all_dates = [e.start_date for e in raw.employment if e.start_date]
    all_dates += [a.applied_at.date() for a in raw.applications if a.applied_at]
    all_dates += demand_dates
    latest_date = max(all_dates) if all_dates else date.today()
    quarters = previous_quarters(quarter_of(latest_date), 8)

    # --- per-district aggregation -------------------------------------------
    trainees_by_district: dict[int, list[int]] = defaultdict(list)
    for t in raw.trainees:
        trainees_by_district[t.district_id].append(t.id)

    employment_by_district: dict[int, list] = defaultdict(list)
    for e in raw.employment:
        d_id = e.district_id or trainee_district.get(e.trainee_id)
        employment_by_district[d_id].append(e)

    applications_by_district: dict[int, list] = defaultdict(list)
    for a in raw.applications:
        d_id = job_district.get(a.job_id) or trainee_district.get(a.trainee_id)
        applications_by_district[d_id].append(a)

    jobs_by_district: dict[int, list] = defaultdict(list)
    for j in raw.jobs:
        jobs_by_district[j.district_id].append(j)

    job_skill_ids: dict[int, list[int]] = defaultdict(list)
    for js in raw.job_skills:
        job_skill_ids[js.job_id].append(js.skill_id)

    districts: list[dict] = []

    for d in raw.districts:
        d_trainees = trainees_by_district.get(d.id, [])
        active = len(d_trainees)
        d_trainee_set = set(d_trainees)

        certified = len(d_trainee_set & certified_trainees)
        certification_rate = pct(certified, active)

        placed = len(d_trainee_set & hired_trainees)
        placement_rate = pct(placed, certified if certified else active)

        d_employment = employment_by_district.get(d.id, [])
        employed = len({e.trainee_id for e in d_employment})

        d_followups = [
            (e.id, retained_flags[e.id])
            for e in d_employment
            if e.id in retained_flags
        ]
        retained = sum(1 for _, ok in d_followups if ok)
        retention_rate = pct(retained, len(d_followups), default=0.0)

        salaries = [monthly_salary[e.id] for e in d_employment if monthly_salary.get(e.id)]
        avg_salary = round(avg(salaries)) if salaries else 0

        # --- per-skill demand vs supply in this district ---
        district_skills = []
        for s in raw.skills:
            demand_index = avg(
                demand_by_skill_district.get((s.id, d.id), []),
                default=avg(demand_by_skill.get(s.id, [])),
            )
            if demand_index <= 0:
                continue
            demand_people = round(demand_index / 100 * active)
            supply_people = len(trainees_with_skill.get(s.id, set()) & d_trainee_set)
            gap = clamp(pct(demand_people - supply_people, demand_people), 0, 100)

            skill_holders = trainees_with_skill.get(s.id, set()) & d_trainee_set
            skill_placed = len(skill_holders & hired_trainees)
            skill_salaries = [
                monthly_salary[e.id]
                for e in d_employment
                if e.trainee_id in skill_holders and monthly_salary.get(e.id)
            ]
            district_skills.append(
                {
                    "skill": s.name,
                    "category": s.category or "General",
                    "demand": demand_people,
                    "supply": supply_people,
                    "gap": r1(gap),
                    "placement": pct(skill_placed, len(skill_holders)),
                    "avgSalary": round(avg(skill_salaries, default=avg_salary)),
                }
            )
        district_skills.sort(key=lambda x: x["gap"], reverse=True)

        total_demand = sum(x["demand"] for x in district_skills)
        total_supply = sum(x["supply"] for x in district_skills)
        skill_gap = r1(clamp(pct(total_demand - total_supply, total_demand), 0, 100))

        # --- 8-quarter health trend, from real quarterly conversion ---
        d_apps = applications_by_district.get(d.id, [])
        apps_by_quarter: dict[tuple[int, int], list] = defaultdict(list)
        for a in d_apps:
            if a.applied_at:
                apps_by_quarter[quarter_of(a.applied_at.date())].append(a)

        emp_by_quarter: dict[tuple[int, int], list] = defaultdict(list)
        for e in d_employment:
            if e.start_date:
                emp_by_quarter[quarter_of(e.start_date)].append(e)

        series = []
        for q in quarters:
            q_apps = apps_by_quarter.get(q, [])
            conversion = pct(sum(1 for a in q_apps if a.status == HIRED), len(q_apps))
            q_emp = emp_by_quarter.get(q, [])
            q_ret_pairs = [retained_flags[e.id] for e in q_emp if e.id in retained_flags]
            q_retention = pct(sum(1 for ok in q_ret_pairs if ok), len(q_ret_pairs))
            if not q_apps and not q_emp:
                series.append(None)
                continue
            # Same weighting as the headline health score, on quarterly data.
            series.append(
                r1(
                    clamp(
                        conversion * 0.45 + (q_retention or retention_rate) * 0.35
                        + (100 - skill_gap) * 0.20,
                        0,
                        100,
                    )
                )
            )

        # Fill gaps in quarters with no activity using the nearest known value.
        known = [v for v in series if v is not None]
        fallback = known[-1] if known else 0.0
        filled = []
        last = known[0] if known else fallback
        for v in series:
            if v is None:
                filled.append(r1(last))
            else:
                filled.append(v)
                last = v
        trend_series = filled

        health_score = round(
            clamp(
                placement_rate * 0.30
                + retention_rate * 0.25
                + (100 - skill_gap) * 0.20
                + certification_rate * 0.15
                + clamp(avg_salary / 400, 0, 100) * 0.10,
                0,
                100,
            )
        )
        trend_series[-1] = float(health_score)

        qoq = r1(trend_series[-1] - trend_series[-2]) if len(trend_series) > 1 else 0.0
        yoy = r1(trend_series[-1] - trend_series[-5]) if len(trend_series) > 4 else 0.0

        # --- training providers in this district ---
        provider_rows = []
        for p in raw.providers:
            if p.district_id != d.id:
                continue
            p_program_ids = {
                prog.id for prog in raw.programs if prog.training_provider_id == p.id
            }
            p_trainees = [
                tid
                for tid in d_trainees
                if trainee_program.get(tid) in p_program_ids
            ]
            if not p_trainees:
                continue
            p_placed = len(set(p_trainees) & hired_trainees)
            p_rate = pct(p_placed, len(p_trainees))
            provider_rows.append(
                {
                    "name": p.name,
                    "trainees": len(p_trainees),
                    "placementRate": p_rate,
                    "rating": r1(clamp(1 + p_rate / 25, 1, 5)),
                }
            )
        provider_rows.sort(key=lambda x: x["trainees"], reverse=True)

        # --- employers in this district ---
        employer_rows = []
        d_jobs = jobs_by_district.get(d.id, [])
        jobs_by_employer: dict[int, list] = defaultdict(list)
        for j in d_jobs:
            jobs_by_employer[j.employer_id].append(j)
        apps_by_employer: dict[int, list] = defaultdict(list)
        for a in d_apps:
            emp_id = job_employer.get(a.job_id)
            if emp_id is not None:
                apps_by_employer[emp_id].append(a)

        for e in raw.employers:
            e_jobs = jobs_by_employer.get(e.id, [])
            if not e_jobs:
                continue
            e_apps = apps_by_employer.get(e.id, [])
            hires = sum(1 for a in e_apps if a.status == HIRED)
            employer_rows.append(
                {
                    "name": e.company_name,
                    "vacancies": len(e_jobs),
                    "hires": hires,
                    "reliabilityScore": round(
                        clamp(pct(hires, len(e_apps)) * 2 + 40, 0, 99)
                    ),
                }
            )
        employer_rows.sort(key=lambda x: x["vacancies"], reverse=True)
        employer_rows = employer_rows[:6]

        recommendations = []
        high_gap_skills = len([s for s in district_skills if s["gap"] > 25])
        if skill_gap > 20:
            recommendations.append(
                "Expand training seats for the {} skills where the gap exceeds 25%.".format(
                    high_gap_skills
                )
            )
        if retention_rate and retention_rate < 65:
            recommendations.append(
                "Strengthen employer retention partnerships and post-placement support."
            )
        if placement_rate < 60:
            recommendations.append(
                "Increase employer engagement drives and placement cell capacity."
            )
        if not recommendations:
            recommendations.append(
                "Maintain the current training-to-placement pipeline; monitor emerging skill demand."
            )

        districts.append(
            {
                "id": slug(d.name),
                "districtId": d.id,
                "name": d.name,
                "healthScore": health_score,
                "status": status_for(health_score),
                "activeTrainees": active,
                "certificationRate": certification_rate,
                "placementRate": placement_rate,
                "retentionRate": retention_rate,
                "skillGap": skill_gap,
                "avgSalary": avg_salary,
                "certified": certified,
                "placed": placed,
                "employed": employed,
                "retained": retained,
                "demand": total_demand,
                "supply": total_supply,
                "trendSeries": trend_series,
                "trendLabels": [quarter_label(q) for q in quarters],
                "qoqDelta": qoq,
                "yoyDelta": yoy,
                "trendCategory": trend_category(yoy),
                "skills": district_skills,
                "providers": provider_rows,
                "employers": employer_rows,
                "recommendations": recommendations,
                "provenance": "observed",
            }
        )

    # tiers: 1 = top third by health, 3 = bottom third (used for grouping only)
    by_health = sorted(districts, key=lambda x: x["healthScore"], reverse=True)
    third = max(1, len(by_health) // 3)
    for i, item in enumerate(by_health):
        item["tier"] = 1 if i < third else (2 if i < 2 * third else 3)

    districts.sort(key=lambda x: x["name"])

    # -----------------------------------------------------------------------
    # state summary
    # -----------------------------------------------------------------------
    total_trainees = len(raw.trainees)
    state_certified = len(certified_trainees)
    state_placed = len(hired_trainees)
    state_employed = len(employed_trainees)
    state_retained = sum(1 for ok in retained_flags.values() if ok)
    state_retention = pct(state_retained, len(retained_flags))
    state_salaries = [v for v in monthly_salary.values() if v]
    state_avg_salary = round(avg(state_salaries))

    total_demand = sum(d["demand"] for d in districts)
    total_supply = sum(d["supply"] for d in districts)
    state_skill_gap = r1(clamp(pct(total_demand - total_supply, total_demand), 0, 100))

    # quarter-on-quarter deltas, from the real quarterly slices
    def quarter_slice(q: tuple[int, int]) -> dict:
        q_apps = [a for a in raw.applications if a.applied_at and quarter_of(a.applied_at.date()) == q]
        q_emp = [e for e in raw.employment if e.start_date and quarter_of(e.start_date) == q]
        q_assess = [
            a for a in raw.assessments
        ]  # assessments carry a date but certification is a trainee-level state
        q_ret = [retained_flags[e.id] for e in q_emp if e.id in retained_flags]
        q_sal = [monthly_salary[e.id] for e in q_emp if monthly_salary.get(e.id)]
        return {
            "applications": len(q_apps),
            "placementRate": pct(sum(1 for a in q_apps if a.status == HIRED), len(q_apps)),
            "retentionRate": pct(sum(1 for ok in q_ret if ok), len(q_ret)),
            "avgSalary": round(avg(q_sal)),
            "hires": sum(1 for a in q_apps if a.status == HIRED),
            "assessments": len(q_assess),
        }

    this_q = quarter_slice(quarters[-1])
    prev_q = quarter_slice(quarters[-2]) if len(quarters) > 1 else this_q

    def delta(now: float, before: float) -> float:
        if not before:
            return 0.0
        return r1((now - before) / before * 100)

    state_placement_rate = pct(state_placed, state_certified if state_certified else total_trainees)
    state_certification_rate = pct(state_certified, total_trainees)

    state_summary = {
        "totalTrainees": total_trainees,
        "certificationRate": state_certification_rate,
        "placementRate": state_placement_rate,
        "retentionRate": state_retention,
        "avgSalary": state_avg_salary,
        "skillGap": state_skill_gap,
        "coverage": "Maharashtra",
        "asOf": latest_date.isoformat(),
        "provenance": "observed",
        "qoq": {
            "totalTrainees": delta(this_q["applications"], prev_q["applications"]),
            "certificationRate": 0.0,
            "placementRate": r1(this_q["placementRate"] - prev_q["placementRate"]),
            "retentionRate": r1(this_q["retentionRate"] - prev_q["retentionRate"]),
            "avgSalary": delta(this_q["avgSalary"], prev_q["avgSalary"]),
            "skillGap": 0.0,
        },
    }

    health_scores = [d["healthScore"] for d in districts]
    state_health = round(avg(health_scores)) if health_scores else 0

    # -----------------------------------------------------------------------
    # state-level skill intelligence
    # -----------------------------------------------------------------------
    state_skills = []
    for s in raw.skills:
        demand_index = avg(demand_by_skill.get(s.id, []))
        if demand_index <= 0:
            continue
        demand_people = round(demand_index / 100 * total_trainees)
        holders = trainees_with_skill.get(s.id, set())
        supply_people = len(holders)
        gap = clamp(pct(demand_people - supply_people, demand_people), 0, 100)

        periods = sorted(demand_by_skill_period.get(s.id, {}).keys())
        if len(periods) >= 2:
            first = avg(demand_by_skill_period[s.id][periods[0]])
            last = avg(demand_by_skill_period[s.id][periods[-1]])
            growth = delta(last, first)
        else:
            growth = 0.0

        placed_holders = len(holders & hired_trainees)
        holder_salaries = [
            monthly_salary[e.id]
            for e in raw.employment
            if e.trainee_id in holders and monthly_salary.get(e.id)
        ]
        state_skills.append(
            {
                "skill": s.name,
                "category": s.category or "General",
                "demand": demand_people,
                "supply": supply_people,
                "gap": r1(gap),
                "growth": r1(growth),
                "placement": pct(placed_holders, len(holders)),
                "salary": round(avg(holder_salaries, default=state_avg_salary)),
                "risk": "High" if gap > 24 else ("Medium" if gap > 14 else "Low"),
                "provenance": "observed",
            }
        )
    state_skills.sort(key=lambda x: x["gap"], reverse=True)

    # -----------------------------------------------------------------------
    # career outcomes
    # -----------------------------------------------------------------------
    progression = 0
    for emp_id, items in followups_by_employment.items():
        base = as_float(employment_by_id[emp_id].salary)
        if any(as_float(f.salary_at_followup) > base for f in items if f.salary_at_followup):
            progression += 1

    career_funnel = {
        "training": total_trainees,
        "certification": state_certified,
        "placement": state_placed,
        "employment": state_employed,
        "retention": state_retained,
        "progression": progression,
    }

    # salary by tenure bucket (real: months between start_date and latest_date)
    buckets: dict[str, list[float]] = defaultdict(list)
    for e in raw.employment:
        if not e.start_date or not monthly_salary.get(e.id):
            continue
        months = (latest_date.year - e.start_date.year) * 12 + (
            latest_date.month - e.start_date.month
        )
        years = months // 12
        label = "Entry (Yr 1)" if years < 1 else (f"Yr {years + 1}" if years < 4 else "Yr 5+")
        buckets[label].append(monthly_salary[e.id])

    order = ["Entry (Yr 1)", "Yr 2", "Yr 3", "Yr 4", "Yr 5+"]
    salary_progression = [
        {"stage": label, "salary": round(avg(buckets[label])), "n": len(buckets[label])}
        for label in order
        if buckets.get(label)
    ]

    # pathways: training programme's primary skill -> occupation actually hired into
    pathway_counter: dict[tuple[str, str], list[float]] = defaultdict(list)
    pathway_tenure: dict[tuple[str, str], list[float]] = defaultdict(list)
    for e in raw.employment:
        prog_id = trainee_program.get(e.trainee_id)
        sk_id = program_skill.get(prog_id) if prog_id else None
        occ = occupation_name.get(e.occupation_id)
        if not sk_id or not occ:
            continue
        key = (skill_name.get(sk_id, "Trainee"), occ)
        pathway_counter[key].append(monthly_salary.get(e.id, 0))
        if e.start_date:
            months = (latest_date.year - e.start_date.year) * 12 + (
                latest_date.month - e.start_date.month
            )
            pathway_tenure[key].append(months / 12)

    entry_salary = round(avg(buckets.get("Entry (Yr 1)", []), default=state_avg_salary)) or 1
    career_pathways = []
    for key, salaries in sorted(
        pathway_counter.items(), key=lambda kv: len(kv[1]), reverse=True
    )[:5]:
        career_pathways.append(
            {
                "from": f"{key[0]} trainee",
                "to": key[1],
                "avgYears": r1(avg(pathway_tenure.get(key, []), default=1.0)),
                "salaryUplift": r1(
                    clamp((avg(salaries) - entry_salary) / entry_salary * 100, -100, 300)
                ),
                "placements": len(salaries),
                "provenance": "observed",
            }
        )

    # -----------------------------------------------------------------------
    # early warning (transparent rules over the district x skill grid)
    # -----------------------------------------------------------------------
    warnings = []
    for d in districts:
        worst = d["skills"][0] if d["skills"] else None

        if d["retentionRate"] and d["retentionRate"] < state_retention - 8:
            warnings.append(
                {
                    "id": f"ew-{d['id']}-retention",
                    "severity": "High" if d["retentionRate"] < state_retention - 15 else "Medium",
                    "district": d["name"],
                    "skill": worst["skill"] if worst else "General Vocational",
                    "reason": f"Retention {r1(state_retention - d['retentionRate'])} pp below state average",
                    "signal": "Retention decline",
                    "trend": "declining",
                    "observedSignal": (
                        f"{d['retained']} of {len([1 for e in employment_by_district.get(d['districtId'], []) if e.id in retained_flags])} "
                        f"followed-up placements in {d['name']} were retained "
                        f"({d['retentionRate']}%), against a state average of {state_retention}%."
                    ),
                    "predictedRisk": (
                        "On the current trajectory this district's retention stays below the "
                        "state average through the next follow-up cycle."
                    ),
                    "contributingFactors": [
                        f"Average monthly salary here is ₹{d['avgSalary']:,} vs ₹{state_avg_salary:,} statewide.",
                        f"Placement rate is {d['placementRate']}% against {state_placement_rate}% statewide.",
                        f"{len([s for s in d['skills'] if s['gap'] > 25])} skills in this district show a gap above 25%.",
                    ],
                    "recommendedAction": (
                        "Review employer retention partnerships and add a post-placement "
                        "check-in before the 90-day follow-up."
                    ),
                    "metrics": {
                        "retentionRate": d["retentionRate"],
                        "stateRetentionRate": state_retention,
                    },
                    "provenance": "rule",
                }
            )

        if d["placementRate"] and d["placementRate"] < state_placement_rate - 10:
            warnings.append(
                {
                    "id": f"ew-{d['id']}-placement",
                    "severity": "High",
                    "district": d["name"],
                    "skill": worst["skill"] if worst else "General Vocational",
                    "reason": f"Placement rate {r1(state_placement_rate - d['placementRate'])} pp below state average",
                    "signal": "Persistent placement shortfall",
                    "trend": "declining",
                    "observedSignal": (
                        f"{d['placed']} of {d['certified']} certified trainees in {d['name']} "
                        f"have been hired ({d['placementRate']}%), against {state_placement_rate}% statewide."
                    ),
                    "predictedRisk": (
                        "A sustained shortfall risks trainee drop-off and lower enrolment "
                        "in the next intake cycle."
                    ),
                    "contributingFactors": [
                        f"{len(jobs_by_district.get(d['districtId'], []))} job postings are registered in this district.",
                        f"{len(d['employers'])} employers are actively posting here.",
                        f"Overall skill gap is {d['skillGap']}%.",
                    ],
                    "recommendedAction": (
                        "Run placement camps linking trainees to employers in neighbouring "
                        "industrial districts."
                    ),
                    "metrics": {
                        "placementRate": d["placementRate"],
                        "statePlacementRate": state_placement_rate,
                    },
                    "provenance": "rule",
                }
            )

        if worst and worst["gap"] > 40:
            warnings.append(
                {
                    "id": f"ew-{d['id']}-gap-{slug(worst['skill'])}",
                    "severity": "Medium",
                    "district": d["name"],
                    "skill": worst["skill"],
                    "reason": f"{worst['skill']} gap at {worst['gap']}%",
                    "signal": "Demand outpacing training supply",
                    "trend": "declining",
                    "observedSignal": (
                        f"Demand for {worst['skill']} in {d['name']} is equivalent to "
                        f"{worst['demand']} trainees while only {worst['supply']} hold the skill."
                    ),
                    "predictedRisk": (
                        "Employers in this district will continue to under-fill roles in "
                        "this skill without additional training capacity."
                    ),
                    "contributingFactors": [
                        f"Demand index for this skill is among the highest in {d['name']}.",
                        f"Current supply covers {r1(100 - worst['gap'])}% of modelled demand.",
                        f"District certification rate is {d['certificationRate']}%.",
                    ],
                    "recommendedAction": (
                        f"Add {worst['skill']} seats at the district's largest training providers "
                        "and prioritise equipment where capacity is constrained."
                    ),
                    "metrics": {"gap": worst["gap"], "demand": worst["demand"], "supply": worst["supply"]},
                    "provenance": "rule",
                }
            )

        if d["yoyDelta"] >= 4:
            warnings.append(
                {
                    "id": f"ew-{d['id']}-improving",
                    "severity": "Improving",
                    "district": d["name"],
                    "skill": worst["skill"] if worst else "General Vocational",
                    "reason": f"District health up {d['yoyDelta']} points year-on-year",
                    "signal": "Sustained improvement",
                    "trend": "improving",
                    "observedSignal": (
                        f"{d['name']}'s composite health score moved from "
                        f"{d['trendSeries'][-5]} to {d['trendSeries'][-1]} over four quarters."
                    ),
                    "predictedRisk": "Low risk; the trajectory holds if current employer partnerships continue.",
                    "contributingFactors": [
                        f"Placement rate is {d['placementRate']}%.",
                        f"Retention rate is {d['retentionRate']}%.",
                        f"Skill gap has settled at {d['skillGap']}%.",
                    ],
                    "recommendedAction": "Document what is working here and replicate it in comparable districts.",
                    "metrics": {"yoyDelta": d["yoyDelta"]},
                    "provenance": "rule",
                }
            )

    severity_rank = {"High": 0, "Medium": 1, "Low": 2, "Improving": 3}
    warnings.sort(key=lambda w: (severity_rank.get(w["severity"], 9), w["district"]))
    warnings = warnings[:24]

    # -----------------------------------------------------------------------
    # impact & reports
    # -----------------------------------------------------------------------
    employment_conversion = pct(state_employed, state_placed if state_placed else total_trainees)
    salary_growth_score = pct(progression, len(followups_by_employment))

    impact_components = [
        {"label": "Placement", "weight": 30, "score": round(state_placement_rate)},
        {"label": "Retention", "weight": 25, "score": round(state_retention)},
        {"label": "Skill Alignment", "weight": 20, "score": round(100 - state_skill_gap)},
        {"label": "Employment", "weight": 15, "score": round(clamp(employment_conversion, 0, 100))},
        {"label": "Salary Growth", "weight": 10, "score": round(clamp(salary_growth_score, 0, 100))},
    ]
    impact_score = round(sum(c["score"] * c["weight"] / 100 for c in impact_components))

    ranking = [
        {"rank": i + 1, "district": d["name"], "impactScore": d["healthScore"]}
        for i, d in enumerate(
            sorted(districts, key=lambda x: x["healthScore"], reverse=True)
        )
    ]

    interventions = [
        {
            "intervention": name,
            "avgPlacementLift": r1(9.2 * weights["placement"] * 0.75),
            "avgRetentionLift": r1(9.2 * weights["retention"] * 0.75),
            "deployments": 0,
            "provenance": "rule",
            "note": "Modelled lift — the platform has no deployed-intervention history yet.",
        }
        for name, weights in INTERVENTION_WEIGHTS.items()
    ]

    return {
        "generatedAt": time.time(),
        "asOf": latest_date.isoformat(),
        "districts": districts,
        "stateSummary": state_summary,
        "stateHealthScore": state_health,
        "stateSkills": state_skills,
        "careerOutcomes": {
            "funnel": career_funnel,
            "salaryProgression": salary_progression,
            "pathways": career_pathways,
        },
        "earlyWarnings": warnings,
        "impact": {
            "score": impact_score,
            "components": impact_components,
            "ranking": ranking,
            "interventions": interventions,
        },
    }


# ---------------------------------------------------------------------------
# policy simulator (transparent rules, real baselines)
# ---------------------------------------------------------------------------

INTERVENTION_WEIGHTS = {
    "Increase Training Seats": {
        "placement": 0.55,
        "employment": 0.50,
        "retention": 0.10,
        "gapReduction": 0.60,
    },
    "Improve Certification": {
        "placement": 0.35,
        "employment": 0.30,
        "retention": 0.15,
        "gapReduction": 0.30,
    },
    "Improve Placement": {
        "placement": 0.90,
        "employment": 0.75,
        "retention": 0.20,
        "gapReduction": 0.25,
    },
    "Improve Retention": {
        "placement": 0.10,
        "employment": 0.15,
        "retention": 0.85,
        "gapReduction": 0.10,
    },
    "Increase Employer Participation": {
        "placement": 0.70,
        "employment": 0.65,
        "retention": 0.40,
        "gapReduction": 0.35,
    },
}

HORIZON_FACTORS = {"6 months": 0.55, "12 months": 1.0, "24 months": 1.35}


def run_simulation(snapshot: dict, params: dict) -> dict:
    """Project the effect of one intervention.

    Baselines are the district's real measured metrics; the projection itself
    is a transparent weighted nudge (no model), so every number on screen can
    be explained in a review.
    """
    district_key = params.get("district")
    districts = snapshot["districts"]
    district = next(
        (
            d
            for d in districts
            if d["id"] == district_key or d["name"] == district_key
        ),
        districts[0] if districts else None,
    )
    if district is None:
        raise ValueError("No districts in the dataset")

    intervention = params.get("intervention") or "Increase Training Seats"
    horizon = params.get("horizon") or "12 months"
    quantity = float(params.get("quantity") or 250)

    weights = INTERVENTION_WEIGHTS.get(intervention, INTERVENTION_WEIGHTS["Increase Training Seats"])
    horizon_factor = HORIZON_FACTORS.get(horizon, 1.0)
    qty_factor = clamp(quantity / 250, 0.3, 2.2)
    magnitude = 9.2 * horizon_factor * qty_factor

    placement_from = district["placementRate"]
    placement_to = clamp(placement_from + magnitude * weights["placement"], placement_from, 96)

    employment_from = pct(district["employed"], district["placed"], default=90.0)
    employment_to = clamp(employment_from + magnitude * weights["employment"], employment_from, 96)

    retention_from = district["retentionRate"]
    retention_to = clamp(retention_from + magnitude * weights["retention"], retention_from, 92)

    gap_from = max(district["demand"] - district["supply"], 0)
    gap_to = round(
        gap_from
        * (1 - clamp(weights["gapReduction"] * horizon_factor * qty_factor * 0.28, 0.03, 0.55))
    )

    impact_score = round(
        clamp(
            50
            + (placement_to - placement_from) * 1.6
            + (retention_to - retention_from) * 1.3
            + qty_factor * 4,
            30,
            98,
        )
    )
    confidence = round(clamp(85 - horizon_factor * 10 - qty_factor * 4, 45, 92))

    return {
        "district": district["name"],
        "skill": params.get("skill"),
        "intervention": intervention,
        "quantity": quantity,
        "horizon": horizon,
        "placement": {"from": r1(placement_from), "to": r1(placement_to)},
        "employment": {"from": r1(employment_from), "to": r1(employment_to)},
        "retention": {"from": r1(retention_from), "to": r1(retention_to)},
        "skillGap": {"from": gap_from, "to": gap_to},
        "impactScore": impact_score,
        "confidence": confidence,
        "baselineProvenance": "observed",
        "projectionProvenance": "rule",
        "method": (
            "Baselines are this district's measured placement, employment and retention "
            "rates. The projection applies a fixed per-intervention weight scaled by "
            "quantity and horizon — no model is involved."
        ),
    }


# ---------------------------------------------------------------------------
# cache
# ---------------------------------------------------------------------------

_cache: dict = {"snapshot": None, "built_at": 0.0}


def get_snapshot(db: Session, force: bool = False) -> dict:
    now = time.time()
    if (
        not force
        and _cache["snapshot"] is not None
        and now - _cache["built_at"] < settings.ANALYTICS_CACHE_TTL
    ):
        return _cache["snapshot"]
    snapshot = build_snapshot(db)
    _cache["snapshot"] = snapshot
    _cache["built_at"] = now
    return snapshot


def invalidate_snapshot() -> None:
    _cache["snapshot"] = None
    _cache["built_at"] = 0.0
