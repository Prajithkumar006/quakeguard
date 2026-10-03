"""Optional REST API:  uvicorn api:app --reload   then open http://127.0.0.1:8000/docs"""
import csv
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import app_analytics, brain, chatbot, quakes, sensor
from common import DATA, ROOT
import os

app = FastAPI(title="Quake Guard AI")
# Local development: the site may be opened from file://, :8080 or this server. Restrict this
# list (QG_ALLOWED_ORIGINS="https://yoursite.com") before exposing the server publicly.
_origins = os.getenv("QG_ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=_origins, allow_methods=["GET", "POST"], allow_headers=["*"])


class Window(BaseModel):
    samples: list[list[float]]          # 100 x [x, y, z] in m/s^2 (50 Hz, 2 s)


class Assess(BaseModel):
    pd_cm: float
    tau_c_s: float
    distance_km: float
    depth_km: float
    vs30: float = 400
    building_vuln: float = 0.5


class Question(BaseModel):
    text: str = Field(max_length=500)
    session_id: str = Field(default="default", max_length=64)
    debug: bool = False


class Feedback(BaseModel):
    text: str = Field(max_length=500)
    answer: str = Field(max_length=2000)
    helpful: bool


class User(BaseModel):
    platform: str
    days_since_install: int
    sessions_7d: int
    last_active_days: float
    alerts_30d: int
    alerts_acked_30d: int
    notif_enabled: int
    location_perm: int
    drills_completed: int
    contacts_added: int


@app.post("/detect")
def detect(w: Window): return sensor.detect(w.samples)

@app.post("/assess")
def assess(a: Assess): return quakes.assess(**a.model_dump())

@app.post("/chat")
def chat(q: Question): return brain.reply(q.text, q.session_id, q.debug)

@app.post("/feedback")
def feedback(f: Feedback):
    p = DATA / "feedback.csv"; new = not p.exists()
    with open(p, "a", newline="") as fh:
        w = csv.writer(fh)
        if new: w.writerow(["time", "message", "answer", "helpful"])
        w.writerow([datetime.now().isoformat(timespec="seconds"), f.text, f.answer, f.helpful])
    return {"ok": True}

@app.get("/health")
def health(): return {"ok": True}


# Serve the QuakeGuard website itself from the same server (must stay LAST so API routes win).
SITE = ROOT.parent
if (SITE / "index.html").exists():
    app.mount("/", StaticFiles(directory=SITE, html=True), name="site")
