"""Government Portal endpoints.

Response shapes match exactly what frontend/gov-portal/src/services/api.js
expects, so the portal runs against this router with no component changes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_government
from app.core.database import get_db
from app.services import analytics

# Every route below is behind the government guard. It is permissive while
# ALLOW_DEMO_IDENTITY is true (see deps.get_current_government).
router = APIRouter(
    prefix="/gov",
    tags=["government"],
    dependencies=[Depends(get_current_government)],
)


class SimulationRequest(BaseModel):
    district: str | None = None
    skill: str | None = None
    intervention: str | None = None
    quantity: float | None = 250
    horizon: str | None = "12 months"


@router.get("/state-summary")
def state_summary(refresh: bool = Query(False), db: Session = Depends(get_db)):
    snap = analytics.get_snapshot(db, force=refresh)
    return {**snap["stateSummary"], "healthScore": snap["stateHealthScore"]}


@router.get("/districts")
def districts(db: Session = Depends(get_db)):
    return analytics.get_snapshot(db)["districts"]


# Registered before /districts/{id} so "trends" isn't read as a district id.
@router.get("/districts/trends")
def district_trends(db: Session = Depends(get_db)):
    items = analytics.get_snapshot(db)["districts"]
    by_yoy = sorted(items, key=lambda d: d["yoyDelta"], reverse=True)
    summary = {
        "improving": len([d for d in items if d["trendCategory"] == "Improving"]),
        "stable": len([d for d in items if d["trendCategory"] == "Stable"]),
        "declining": len([d for d in items if d["trendCategory"] == "Declining"]),
        "significantDecline": len(
            [d for d in items if d["trendCategory"] == "Significant Decline"]
        ),
    }
    return {
        "topImprovers": by_yoy[:5],
        "biggestDeclines": list(reversed(by_yoy))[:5],
        "summary": summary,
    }


@router.get("/districts/{id_or_name}")
def district_detail(id_or_name: str, db: Session = Depends(get_db)):
    items = analytics.get_snapshot(db)["districts"]
    match = next(
        (d for d in items if d["id"] == id_or_name or d["name"].lower() == id_or_name.lower()),
        None,
    )
    if match is None:
        raise HTTPException(status_code=404, detail="District not found")
    return match


@router.get("/skills")
def skills(db: Session = Depends(get_db)):
    return analytics.get_snapshot(db)["stateSkills"]


@router.get("/career-outcomes")
def career_outcomes(db: Session = Depends(get_db)):
    return analytics.get_snapshot(db)["careerOutcomes"]


@router.get("/early-warning")
def early_warnings(db: Session = Depends(get_db)):
    return analytics.get_snapshot(db)["earlyWarnings"]


@router.get("/early-warning/{warning_id}")
def early_warning(warning_id: str, db: Session = Depends(get_db)):
    items = analytics.get_snapshot(db)["earlyWarnings"]
    match = next((w for w in items if w["id"] == warning_id), None)
    if match is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return match


@router.post("/policy-simulator/run")
def run_policy_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    snap = analytics.get_snapshot(db)
    try:
        return analytics.run_simulation(snap, payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/impact")
def impact(db: Session = Depends(get_db)):
    return analytics.get_snapshot(db)["impact"]


@router.post("/refresh")
def refresh_cache(db: Session = Depends(get_db)):
    """Force-rebuild the analytics snapshot (useful after re-seeding)."""
    analytics.invalidate_snapshot()
    snap = analytics.get_snapshot(db, force=True)
    return {"status": "ok", "asOf": snap["asOf"], "districts": len(snap["districts"])}
