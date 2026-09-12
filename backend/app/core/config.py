"""Central configuration for the KaushalSetu backend.

Everything the app can be tuned with lives here and is read from environment
variables (loaded from backend/.env). Nothing else in the codebase should call
os.getenv directly.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent

# backend/.env first, then a project-level .env as a fallback.
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(PROJECT_ROOT / ".env")


def _csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    # --- database ---
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/skillgrow",
    )

    # --- auth ---
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-in-env")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720")
    )

    # --- CORS ---
    # The three Vite dev servers, on their pinned ports (see each panel's
    # vite.config.js). Override with a comma-separated CORS_ORIGINS if you run
    # them somewhere else.
    CORS_ORIGINS: list[str] = _csv(
        os.getenv(
            "CORS_ORIGINS",
            ",".join(
                [
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://localhost:5175",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:5174",
                    "http://127.0.0.1:5175",
                ]
            ),
        )
    )

    # --- demo identities ---
    # The trainee and employer panels are demoed without a login screen in
    # front of them. When no bearer token is present, the API falls back to
    # these identities so the panels show real data straight away.
    # Set ALLOW_DEMO_IDENTITY=false to require a real token everywhere.
    ALLOW_DEMO_IDENTITY: bool = os.getenv("ALLOW_DEMO_IDENTITY", "true").lower() != "false"
    DEMO_TRAINEE_ID: int | None = (
        int(os.getenv("DEMO_TRAINEE_ID")) if os.getenv("DEMO_TRAINEE_ID") else None
    )
    DEMO_EMPLOYER_ID: int | None = (
        int(os.getenv("DEMO_EMPLOYER_ID")) if os.getenv("DEMO_EMPLOYER_ID") else None
    )

    # --- shared sign-in hub ---
    # The single login page is served by this API at "/". After a successful
    # sign-in it forwards the user to whichever panel matches their role.
    # Override these if you run the panels on different ports.
    TRAINEE_PANEL_URL: str = os.getenv("TRAINEE_PANEL_URL", "http://localhost:5173")
    EMPLOYER_PANEL_URL: str = os.getenv("EMPLOYER_PANEL_URL", "http://localhost:5174")
    GOV_PORTAL_URL: str = os.getenv("GOV_PORTAL_URL", "http://localhost:5175")

    @property
    def PANEL_URLS(self) -> dict:
        return {
            "trainee": self.TRAINEE_PANEL_URL,
            "employer": self.EMPLOYER_PANEL_URL,
            "government": self.GOV_PORTAL_URL,
        }

    # --- analytics cache ---
    # The government portal's numbers are a full-dataset rollup. It is computed
    # once and reused for this many seconds.
    ANALYTICS_CACHE_TTL: int = int(os.getenv("ANALYTICS_CACHE_TTL", "300"))

    # --- ML layer ---
    # The Career Digital Twin imports Parnavi's/Deven's ml package, which opens
    # its own psycopg2 connection. Set ENABLE_ML=false to run the API without it.
    ENABLE_ML: bool = os.getenv("ENABLE_ML", "true").lower() != "false"

    # Which roles a stranger may pick on the public /api/auth/register form.
    # Drop "government" from this list before this is ever deployed anywhere
    # real — self-serve access to state-wide intelligence is not something you
    # want open. It is included by default only so the demo can show all three
    # sign-up flows.
    SELF_REGISTER_ROLES: list[str] = _csv(
        os.getenv("SELF_REGISTER_ROLES", "trainee,employer,government")
    )

    # Set to false to make every write endpoint session-only (nothing is
    # inserted into or updated in Postgres). Useful if you want the validated
    # Phase 2 dataset left byte-identical while demoing.
    ALLOW_DB_WRITES: bool = os.getenv("ALLOW_DB_WRITES", "true").lower() != "false"

    # Pass mark used to decide whether an assessment counts as "certified".
    PASS_MARK: float = float(os.getenv("PASS_MARK", "50"))


settings = Settings()
