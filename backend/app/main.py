"""KaushalSetu API — the single backend behind all three panels.

Router order matters: the generic `/api/{resource}` reader in
app/api/routes.py must be registered last, or it will match `/api/gov/...`
and friends first.
"""

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.api.employer import router as employer_router
from app.api.gov import router as gov_router
from app.api.routes import router as generic_router
from app.api.trainee import router as trainee_router
from app.core.config import settings
from app.core.database import SessionLocal

app = FastAPI(
    title="KaushalSetu API",
    description=(
        "Skilling intelligence platform. Serves the Government Portal, the "
        "Trainee Panel and the Employer Panel from one database."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


LOGIN_PAGE = Path(__file__).resolve().parent / "web" / "login.html"


@app.get("/", response_class=HTMLResponse, tags=["system"], include_in_schema=False)
@app.get("/login", response_class=HTMLResponse, tags=["system"], include_in_schema=False)
def sign_in_page():
    """The single sign-in page for all three panels.

    It is served from the API rather than from one of the panels because no
    panel is a natural home for the other two, and this way there is no fourth
    dev server to start. After a successful sign-in it forwards the user to
    whichever panel matches the role on their account.
    """
    html = LOGIN_PAGE.read_text(encoding="utf-8")
    return html.replace("__PANEL_URLS__", json.dumps(settings.PANEL_URLS))


@app.get("/logo.png", tags=["system"], include_in_schema=False)
def logo():
    """The brand mark, used by the sign-in page."""
    return FileResponse(LOGIN_PAGE.parent / "logo.png", media_type="image/png")


@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "service": "kaushalsetu-api"}


@app.get("/api/health", tags=["system"])
def api_health():
    """Health check that also proves the database connection works."""
    db = SessionLocal()
    try:
        counts = {}
        for table in ("districts", "trainees", "jobs", "applications", "employment"):
            counts[table] = db.execute(text("SELECT COUNT(*) FROM {}".format(table))).scalar()
        return {"status": "ok", "database": "connected", "counts": counts}
    except Exception as exc:
        return {"status": "degraded", "database": "unavailable", "error": str(exc)}
    finally:
        db.close()


# Specific routers first...
app.include_router(auth_router, prefix="/api")
app.include_router(gov_router, prefix="/api")
app.include_router(employer_router, prefix="/api")
app.include_router(trainee_router, prefix="/api")
# ...generic catch-all last.
app.include_router(generic_router, prefix="/api")
