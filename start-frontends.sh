#!/usr/bin/env bash
# Runs all three panels in the background.
#   5173 Trainee Panel   5174 Employer Panel   5175 Government Portal
set -e
cd "$(dirname "$0")/frontend"
for panel in trainee-panel employer-panel gov-portal; do
  (cd "$panel" && [ -d node_modules ] || (cd "$panel" && npm install))
  (cd "$panel" && npm run dev &)
done
wait
