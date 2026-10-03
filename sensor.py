"""Module 1 - quake detection from phone accelerometer windows.

Input data format (data/sensor_windows.csv), one row per sample, 50 Hz:
    window_id, label, x, y, z      (m/s^2, 100 rows = 2 s per window)
labels: still, walking, vehicle, shake_drop, quake
"""
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd
from scipy.stats import kurtosis
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

from common import DATA, MODELS

FS, WIN = 50, 100
CSV = DATA / "sensor_windows.csv"
MODEL = MODELS / "quake_detector.joblib"


def window_features(xyz):
    """xyz: array (n, 3) of raw accelerometer samples -> dict of features."""
    xyz = np.asarray(xyz, dtype=float)
    a = xyz - xyz.mean(axis=0)                      # remove gravity / orientation
    mag = np.linalg.norm(a, axis=1)
    spec = np.abs(np.fft.rfft(mag - mag.mean()))
    freqs = np.fft.rfftfreq(len(mag), 1 / FS)
    dom = freqs[spec[1:].argmax() + 1]
    band = spec[(freqs >= 1) & (freqs <= 10)].sum() / (spec.sum() + 1e-9)
    sta = np.convolve(mag**2, np.ones(10) / 10, mode="valid")   # 0.2 s
    lta = np.convolve(mag**2, np.ones(50) / 50, mode="valid")   # 1.0 s
    ratio = sta[40:] / (lta + 1e-9)
    m0 = mag - mag.mean()
    return {
        "rms": np.sqrt((mag**2).mean()), "peak": mag.max(), "std": mag.std(),
        "zcr": float((np.diff(np.sign(m0)) != 0).mean()),
        "dom_freq": dom, "band_ratio": band, "max_sta_lta": ratio.max(),
        "kurtosis": float(kurtosis(mag)),
        "jerk": np.abs(np.diff(mag)).mean(),
        "rms_x": a[:, 0].std(), "rms_y": a[:, 1].std(), "rms_z": a[:, 2].std(),
        "late_over_early": (mag[WIN // 2:] ** 2).mean() / ((mag[:WIN // 2] ** 2).mean() + 1e-9),
    }


# ---------------------------------------------------------------- sample data
def _make_window(label, rng):
    t = np.arange(WIN) / FS
    idx = np.arange(WIN)
    g = rng.normal(size=3); g = g / np.linalg.norm(g) * 9.81      # random phone tilt
    d = rng.normal(size=3); d /= np.linalg.norm(d)                # motion direction
    acc = np.tile(g, (WIN, 1))

    def wave(freq, amp, env=1.0):
        return np.outer(amp * env * np.sin(2 * np.pi * freq * t + rng.uniform(0, 6.28)), d)

    noise = 0.02
    if label == "walking":
        acc += wave(rng.uniform(1.6, 2.3), rng.uniform(1.0, 3.0)); noise = 0.15
    elif label == "vehicle":
        acc += wave(rng.uniform(0.3, 1.2), rng.uniform(0.2, 0.8)); noise = 0.12
        if rng.random() < 0.4:
            k = rng.integers(10, 80)
            acc += wave(rng.uniform(4, 10), rng.uniform(1, 3), (idx >= k) * np.exp(-(idx - k).clip(0) / 6))
    elif label == "shake_drop":
        if rng.random() < 0.5:
            k = rng.integers(10, 80)
            acc += wave(rng.uniform(5, 15), rng.uniform(8, 25), (idx >= k) * np.exp(-(idx - k).clip(0) / rng.uniform(3, 10)))
        else:
            acc += wave(rng.uniform(2, 6), rng.uniform(4, 10))
        noise = 0.2
    elif label == "quake":
        onset = rng.integers(5, 40)
        p_env = (idx >= onset) * np.exp(-(idx - onset).clip(0) / 40)
        s_env = np.clip((idx - onset - 15) / 30, 0, 1)
        acc += wave(rng.uniform(5, 10), rng.uniform(0.03, 0.3), p_env)
        acc += wave(rng.uniform(1, 5), rng.uniform(0.15, 2.0), s_env)
        noise = 0.03
    return acc + rng.normal(0, noise, acc.shape)


def generate(per_class=300, seed=0):
    rng = np.random.default_rng(seed)
    rows = []
    wid = 0
    for label in ["still", "walking", "vehicle", "shake_drop", "quake"]:
        for _ in range(per_class):
            w = _make_window(label, rng)
            rows.append(pd.DataFrame({"window_id": wid, "label": label, "x": w[:, 0], "y": w[:, 1], "z": w[:, 2]}))
            wid += 1
    pd.concat(rows).to_csv(CSV, index=False)
    print(f"  wrote {CSV.name}")


# ------------------------------------------------------------------- training
def train():
    df = pd.read_csv(CSV)
    feats, labels = [], []
    for _, g in df.groupby("window_id", sort=False):
        feats.append(window_features(g[["x", "y", "z"]].values))
        labels.append(g["label"].iloc[0])
    X, y = pd.DataFrame(feats), np.array(labels)
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
    clf = HistGradientBoostingClassifier(max_iter=200, random_state=0).fit(Xtr, ytr)
    pred = clf.predict(Xte)
    print(classification_report(yte, pred, digits=3))
    fa = ((pred == "quake") & (yte != "quake")).sum() / (yte != "quake").sum()
    print(f"  false-alarm rate (non-quake predicted quake): {fa:.2%}")
    joblib.dump({"model": clf, "columns": list(X.columns)}, MODEL)


@lru_cache(maxsize=1)
def _load():
    return joblib.load(MODEL)


def detect(xyz):
    """xyz: 100 x 3 list/array of m/s^2. Returns class probabilities + quake_probability."""
    bundle = _load()
    X = pd.DataFrame([window_features(xyz)])[bundle["columns"]]
    probs = dict(zip(bundle["model"].classes_, bundle["model"].predict_proba(X)[0].round(4)))
    return {"quake_probability": float(probs["quake"]), "probabilities": {k: float(v) for k, v in probs.items()}}


if __name__ == "__main__":
    if not CSV.exists():
        generate()
    train()
