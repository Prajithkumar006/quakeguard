"""Module 2 - magnitude estimation + shaking-intensity / risk from quake records.

Input data format (data/quake_records.csv), one row per (event, location):
    magnitude, depth_km, distance_km, vs30, building_vuln, mmi, pd_cm, tau_c_s
      distance_km  : epicentral distance from the user's location
      vs30         : soil stiffness (m/s), lower = softer ground = more shaking
      building_vuln: 0 (very safe) .. 1 (very vulnerable)
      mmi          : observed intensity (Modified Mercalli 1-10), e.g. from "Did You Feel It?" reports
      pd_cm, tau_c_s : early P-wave peak displacement and period (only needed for the magnitude model)
Public catalogs (e.g. USGS ComCat) give magnitude/depth/location; join them with your own app data.
"""
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from common import DATA, MODELS

CSV = DATA / "quake_records.csv"
MAG_MODEL = MODELS / "magnitude_estimator.joblib"
MMI_MODEL = MODELS / "intensity_model.joblib"
RISK_COLS = ["magnitude", "depth_km", "distance_km", "vs30", "building_vuln"]
MAG_COLS = ["log_pd", "log_tau", "log_hypo"]


def generate(n=6000, seed=1):
    rng = np.random.default_rng(seed)
    mag = np.clip(3 + rng.exponential(0.8, n), 3, 8.5)           # Gutenberg-Richter-like
    depth = np.clip(rng.lognormal(2.8, 0.8, n), 2, 300)
    dist = rng.uniform(5, 400, n)
    vs30 = rng.uniform(150, 900, n)
    vuln = rng.uniform(0, 1, n)
    hypo = np.hypot(dist, depth)
    mmi = (1.4 * mag - 3.2 * np.log10(hypo) + 3.0
           + np.clip((600 - vs30) / 450, -0.5, 1) + rng.normal(0, 0.3, n))
    log_pd = -3.3 + 0.72 * mag - 1.1 * np.log10(hypo) + rng.normal(0, 0.25, n)
    log_tau = 0.30 * mag - 1.95 + rng.normal(0, 0.12, n)
    pd.DataFrame({
        "magnitude": mag.round(2), "depth_km": depth.round(1), "distance_km": dist.round(1),
        "vs30": vs30.round(0), "building_vuln": vuln.round(2), "mmi": np.clip(mmi, 1, 10).round(2),
        "pd_cm": (10 ** log_pd).round(6), "tau_c_s": (10 ** log_tau).round(4),
    }).to_csv(CSV, index=False)
    print(f"  wrote {CSV.name}")


def train():
    df = pd.read_csv(CSV)
    # intensity model
    Xtr, Xte, ytr, yte = train_test_split(df[RISK_COLS], df["mmi"], test_size=0.2, random_state=0)
    m = HistGradientBoostingRegressor(max_iter=300, random_state=0).fit(Xtr, ytr)
    p = m.predict(Xte)
    print(f"  intensity (MMI): MAE={mean_absolute_error(yte, p):.2f}  R2={r2_score(yte, p):.3f}")
    joblib.dump(m, MMI_MODEL)
    # early-warning magnitude model
    hypo = np.hypot(df["distance_km"], df["depth_km"])
    X = pd.DataFrame({"log_pd": np.log10(df["pd_cm"]), "log_tau": np.log10(df["tau_c_s"]), "log_hypo": np.log10(hypo)})
    Xtr, Xte, ytr, yte = train_test_split(X, df["magnitude"], test_size=0.2, random_state=0)
    m = HistGradientBoostingRegressor(max_iter=300, random_state=0).fit(Xtr, ytr)
    p = m.predict(Xte)
    print(f"  magnitude from P-wave: MAE={mean_absolute_error(yte, p):.2f}  R2={r2_score(yte, p):.3f}")
    joblib.dump(m, MAG_MODEL)


@lru_cache(maxsize=1)
def _load():
    return joblib.load(MAG_MODEL), joblib.load(MMI_MODEL)


def alert_level(mmi, building_vuln=0.5):
    score = mmi + 1.5 * (building_vuln - 0.5)
    if score < 4:
        return "low", "Light shaking possible. No action needed."
    if score < 6:
        return "moderate", "Noticeable shaking. Drop, Cover, Hold On."
    if score < 7.5:
        return "high", "Strong shaking. Drop, Cover, Hold On now. Stay away from windows."
    return "severe", "Very strong shaking. Drop, Cover, Hold On immediately."


def assess(pd_cm, tau_c_s, distance_km, depth_km, vs30=400, building_vuln=0.5):
    """Full chain: early P-wave measurements -> magnitude -> intensity -> alert level."""
    mag_m, mmi_m = _load()
    hypo = float(np.hypot(distance_km, depth_km))
    mag = float(mag_m.predict(pd.DataFrame([{"log_pd": np.log10(pd_cm), "log_tau": np.log10(tau_c_s),
                                              "log_hypo": np.log10(hypo)}]))[0])
    mmi = float(mmi_m.predict(pd.DataFrame([{"magnitude": mag, "depth_km": depth_km, "distance_km": distance_km,
                                              "vs30": vs30, "building_vuln": building_vuln}]))[0])
    level, msg = alert_level(mmi, building_vuln)
    return {"est_magnitude": round(mag, 2), "est_mmi": round(mmi, 2), "alert_level": level, "message": msg}


if __name__ == "__main__":
    if not CSV.exists():
        generate()
    train()
