"""PostgreSQL connection helper used by the ML layer."""
import os
from pathlib import Path
from urllib.parse import urlparse, unquote
import psycopg2
from dotenv import load_dotenv

# Load the backend .env when the ML package is run from the project.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / "backend" / ".env")
load_dotenv(PROJECT_ROOT / ".env")


def _settings_from_url():
    url = os.getenv("DATABASE_URL")
    if not url:
        return None
    parsed = urlparse(url)
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "dbname": (parsed.path or "/skillgrow").lstrip("/"),
        "user": unquote(parsed.username or "postgres"),
        "password": unquote(parsed.password or ""),
    }


def get_connection():
    settings = _settings_from_url()
    if settings:
        return psycopg2.connect(**settings)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "skillgrow"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )
