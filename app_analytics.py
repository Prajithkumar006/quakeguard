"""Module 4 - app/user analytics: churn prediction + user segmentation.

Input data format (data/app_users.csv), one row per user:
    user_id, platform, days_since_install, sessions_7d, last_active_days, alerts_30d, alerts_acked_30d,
    notif_enabled, location_perm, drills_completed, contacts_added, churned_30d (0/1, target)
Export this from your analytics tool (Firebase, Mixpanel, your own DB).
"""
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.inspection import permutation_importance
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from common import DATA, MODELS

CSV = DATA / "app_users.csv"
MODEL = MODELS / "app_analytics.joblib"
NUM = ["days_since_install", "sessions_7d", "last_active_days", "alerts_30d", "alerts_acked_30d",
       "notif_enabled", "location_perm", "drills_completed", "contacts_added"]
CAT = ["platform"]


def generate(n=3000, seed=2):
    rng = np.random.default_rng(seed)
    sessions = rng.poisson(rng.gamma(2, 1.5, n))
    notif = (rng.random(n) < 0.75).astype(int)
    loc = (rng.random(n) < 0.65).astype(int)
    alerts = rng.poisson(3, n)
    drills = rng.poisson(0.8, n)
    contacts = rng.poisson(1.2, n)
    last = np.clip(rng.exponential(6, n) * np.where(sessions > 0, 0.5, 2), 0, 60).round()
    logit = (0.8 - 0.30 * sessions + 0.07 * last - 0.8 * notif - 0.4 * loc - 0.3 * drills
             - 0.25 * contacts + rng.normal(0, 0.5, n))
    churn = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
    pd.DataFrame({
        "user_id": np.arange(n), "platform": rng.choice(["android", "ios", "web"], n, p=[.6, .3, .1]),
        "days_since_install": rng.integers(1, 720, n), "sessions_7d": sessions, "last_active_days": last,
        "alerts_30d": alerts, "alerts_acked_30d": rng.binomial(alerts, rng.uniform(.2, .95, n)),
        "notif_enabled": notif, "location_perm": loc, "drills_completed": drills,
        "contacts_added": contacts, "churned_30d": churn,
    }).to_csv(CSV, index=False)
    print(f"  wrote {CSV.name}")


def train():
    df = pd.read_csv(CSV)
    X, y = df[NUM + CAT], df["churned_30d"]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
    prep = ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"), CAT)], remainder="passthrough")
    churn = Pipeline([("prep", prep), ("clf", HistGradientBoostingClassifier(max_iter=200, random_state=0))]).fit(Xtr, ytr)
    auc = roc_auc_score(yte, churn.predict_proba(Xte)[:, 1])
    print(f"  churn model ROC-AUC={auc:.3f}  (base churn rate {y.mean():.1%})")
    imp = permutation_importance(churn, Xte, yte, n_repeats=5, random_state=0, scoring="roc_auc")
    top = sorted(zip(X.columns, imp.importances_mean), key=lambda t: -t[1])[:4]
    print("  top churn drivers:", ", ".join(f"{k} ({v:.3f})" for k, v in top))
    seg = Pipeline([("sc", StandardScaler()), ("km", KMeans(4, n_init=10, random_state=0))]).fit(df[NUM])
    df["segment"] = seg.predict(df[NUM])
    print("  segment profiles (mean values):")
    print(df.groupby("segment")[["sessions_7d", "last_active_days", "notif_enabled", "drills_completed",
                                  "contacts_added", "churned_30d"]].mean().round(2).to_string())
    joblib.dump({"churn": churn, "segments": seg}, MODEL)


@lru_cache(maxsize=1)
def _load():
    return joblib.load(MODEL)


def score_user(user: dict):
    b = _load()
    row = pd.DataFrame([user])[NUM + CAT]
    risk = float(b["churn"].predict_proba(row)[0, 1])
    nudges = []
    if not user["notif_enabled"]:
        nudges.append("Prompt user to enable alert notifications")
    if not user["location_perm"]:
        nudges.append("Explain why location improves alert accuracy")
    if user["contacts_added"] == 0:
        nudges.append("Prompt to add emergency contacts")
    if user["drills_completed"] == 0:
        nudges.append("Invite to complete a practice drill")
    return {"churn_risk": round(risk, 3), "segment": int(b["segments"].predict(row[NUM])[0]), "suggested_nudges": nudges}


if __name__ == "__main__":
    if not CSV.exists():
        generate()
    train()
