#!/usr/bin/env bash
# Starts the KaushalSetu API on http://localhost:8000
set -e
cd "$(dirname "$0")/backend"
if [ ! -f .env ]; then
  echo "backend/.env is missing. Copy backend/.env.example to backend/.env first."
  exit 1
fi
python -m uvicorn app.main:app --reload --port 8000
