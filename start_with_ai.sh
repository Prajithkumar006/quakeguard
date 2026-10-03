#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/ai_server"
[ -d .venv ] || { python3 -m venv .venv; .venv/bin/pip install -q -r requirements.txt; }
.venv/bin/python chatbot.py
echo "QuakeGuard is starting at http://localhost:8000  (Ctrl+C to stop)"
.venv/bin/python -m uvicorn api:app --host 127.0.0.1 --port 8000
