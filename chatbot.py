"""Module 3 - safety assistant trained on many varied user messages.

How it works
  1. data/knowledge_base.csv  (columns: intent, category, question, answer)
       - `question`: many ways a user might phrase the message, separated by " | "
       - `answer`:   one vetted reply, or several variants separated by " || " (the bot rotates them)
  2. Training expands each phrasing automatically (lower-case, no punctuation, typos, filler words like
     "hey"/"pls"/"urgent") so the model copes with messy real-world messages.
  3. A classifier (TF-IDF word + character n-grams -> logistic regression) predicts the intent, so
     different messages get different replies: emergency steps, calm reassurance, app help, small talk...
  4. Replies are always text YOU wrote, so safety guidance stays controlled.
  5. Low-confidence messages are logged to data/unanswered_questions.csv so you know what to add next.

Retrain after editing the CSV:  python chatbot.py
Evaluate on held-out messages:  python chatbot.py --eval
Chat in the terminal:           python chatbot.py --chat
"""
import csv
import random
import re
import sys
from datetime import datetime
from functools import lru_cache

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.pipeline import FeatureUnion

from common import DATA, MODELS

CSV = DATA / "knowledge_base.csv"
TEST_CSV = DATA / "test_messages.csv"
MODEL = MODELS / "chatbot.joblib"
UNANSWERED = DATA / "unanswered_questions.csv"

CONF_SURE = 0.50      # at/above: answer directly
CONF_OK = 0.20        # [CONF_OK, CONF_SURE): answer, plus offer the runner-up topic
CONF_ASK = 0.08       # [CONF_ASK, CONF_OK): don't answer, ask "did you mean ...?" with the top 2 topics
MIN_SIM = 0.20        # guard: message must also look somewhat like known phrasings

URGENT_RE = re.compile(
    r"\b(trapped|bleeding|unconscious|not breathing|can'?t breathe|cannot breathe|heart attack|buried|"
    r"collapsed on|stuck under|going to die|dying|on fire|not moving|head injury|broken (?:bone|leg|arm))\b", re.I)
URGENT_MSG = ("If someone is in immediate danger, call your local emergency number right now "
              "(for example 112 or 911). ")
FALLBACK = ("I'm not sure about that one. Could you rephrase it? For urgent help call your local emergency "
            "number; otherwise check your local disaster authority's guidance.")

_last_variant = {}    # intent -> index of the variant used last time, to avoid immediate repeats


# ----------------------------------------------------------------------------- data
def generate():
    from kb_seed import SEED
    rows = [{"intent": i, "category": c, "question": q, "answer": a} for i, c, q, a in SEED]
    pd.DataFrame(rows).to_csv(CSV, index=False)
    print(f"  wrote {CSV.name} ({len(rows)} intents)")


def _typo(s, rng):
    if len(s) < 6:
        return s
    i = rng.randrange(1, len(s) - 2)
    mode = rng.choice(["swap", "drop", "dup"])
    if mode == "swap":
        return s[:i] + s[i + 1] + s[i] + s[i + 2:]
    if mode == "drop":
        return s[:i] + s[i + 1:]
    return s[:i] + s[i] + s[i:]


PRE = ["hey ", "hi ", "please ", "pls ", "quick question ", "urgent ", "hello, ", "ok so ", "um ", "sorry but ", "bro "]
POST = [" please", " pls", " ?", " now", " asap", " thanks", " !!", " plz"]


def augment(phrase, rng, n=5):
    base = phrase.strip()
    out = {base, base.lower(), re.sub(r"[^\w\s']", "", base.lower()), base.upper()}
    for _ in range(n):
        v = base.lower()
        r = rng.random()
        if r < 0.4:
            v = _typo(v, rng)
        elif r < 0.7:
            v = rng.choice(PRE) + v
        else:
            v = v + rng.choice(POST)
        out.add(v)
    return out


def _vectorizer():
    return FeatureUnion([
        ("word", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, lowercase=True)),
        ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True, lowercase=True)),
    ])


# --------------------------------------------------------------------------- train
def train(seed=7):
    kb = pd.read_csv(CSV)
    if "intent" not in kb.columns:                       # old 3-column file still works
        kb["intent"] = [f"entry_{i}" for i in range(len(kb))]
    rng = random.Random(seed)
    texts, labels, clean = [], [], []
    answers, cats = {}, {}
    for _, r in kb.iterrows():
        intent = r["intent"]
        answers[intent] = [a.strip() for a in str(r["answer"]).split("||") if a.strip()]
        cats[intent] = r["category"]
        for p in str(r["question"]).split("|"):
            p = p.strip()
            if not p:
                continue
            clean.append((p, intent))
            for v in augment(p, rng):
                texts.append(v); labels.append(intent)
    vec = _vectorizer()
    X = vec.fit_transform(texts)
    clf = LogisticRegression(C=100, max_iter=5000)
    clf.fit(X, labels)
    # retrieval index of the clean phrasings, used as a similarity guard and for "did you mean"
    M = vec.transform([p for p, _ in clean])
    joblib.dump({"vec": vec, "clf": clf, "M": M, "clean": clean, "answers": answers, "cats": cats}, MODEL)
    print(f"  {len(kb)} intents, {len(clean)} phrasings -> {len(texts)} training messages")


@lru_cache(maxsize=1)
def _load():
    return joblib.load(MODEL)


# ----------------------------------------------------------------------------- chat
def _pick(intent, answers):
    options = answers[intent]
    if len(options) == 1:
        return options[0]
    prev = _last_variant.get(intent)
    choices = [i for i in range(len(options)) if i != prev]
    i = random.choice(choices)
    _last_variant[intent] = i
    return options[i]


def _log_unanswered(text):
    new = not UNANSWERED.exists()
    with open(UNANSWERED, "a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["time", "question"])
        w.writerow([datetime.now().isoformat(timespec="seconds"), text])


def ask(text):
    text = (text or "").strip()
    if not text:
        return {"answer": "Type a question, for example: 'what should I do during an earthquake?'",
                "confidence": 0.0, "category": None, "intent": None}
    b = _load()
    X = b["vec"].transform([text])
    proba = b["clf"].predict_proba(X)[0]
    order = proba.argsort()[::-1]
    intent, conf = b["clf"].classes_[order[0]], float(proba[order[0]])
    sim = float(cosine_similarity(X, b["M"]).max())
    urgent = URGENT_RE.search(text) is not None
    prefix = URGENT_MSG if urgent and b["cats"][intent] in ("after", "during") else ""

    if CONF_ASK <= conf < CONF_OK and sim >= MIN_SIM and intent != "out_of_scope":
        # unsure: don't risk a wrong safety answer, offer the two most likely topics instead
        _log_unanswered(text)
        opts = [b["clf"].classes_[j] for j in order[:3] if b["clf"].classes_[j] != "out_of_scope"][:2]
        ex = [next(p for p, i in b["clean"] if i == o) for o in opts]
        ask_msg = "I want to get this right - did you mean: " + " or ".join(f'"{e}"' for e in ex) + "? Please tell me a bit more."
        return {"answer": (URGENT_MSG if urgent else "") + ask_msg, "confidence": round(conf, 3),
                "category": None, "intent": None, "suggestions": opts}

    if conf < CONF_ASK or sim < MIN_SIM:
        _log_unanswered(text)
        return {"answer": (URGENT_MSG if urgent else "") + FALLBACK, "confidence": round(conf, 3),
                "category": None, "intent": None}

    answer = _pick(intent, b["answers"])
    if intent != "out_of_scope" and conf < CONF_SURE:
        alt = b["clf"].classes_[order[1]]
        if alt not in ("out_of_scope", "ack", "greeting"):
            example = next(p for p, i in b["clean"] if i == alt)
            answer += f"\n\n(If that's not what you meant, you can ask something like: \"{example}\")"
    return {"answer": prefix + answer, "confidence": round(conf, 3), "category": b["cats"][intent], "intent": intent}


# ---------------------------------------------------------------------------- eval
def evaluate(verbose=True):
    """Accuracy on data/test_messages.csv (message,intent). Unseen messages = honest estimate."""
    t = pd.read_csv(TEST_CSV)
    b = _load()
    wrong, hit = [], 0
    for msg, want in zip(t["message"], t["intent"]):
        got = ask(msg)["intent"]
        if want == "unknown":
            ok = got in (None, "out_of_scope")
        else:
            ok = got == want
        hit += ok
        if not ok:
            wrong.append((msg, want, got))
    acc = hit / len(t)
    print(f"  held-out accuracy: {hit}/{len(t)} = {acc:.1%}")
    if verbose:
        for m, w, g in wrong:
            print(f"    MISS  {m!r}: wanted {w}, got {g}")
    return acc


if __name__ == "__main__":
    if "--chat" in sys.argv:
        print("Quake Guard chat (Ctrl+C to quit)")
        while True:
            try:
                print("bot:", ask(input("you: "))["answer"], "\n")
            except (KeyboardInterrupt, EOFError):
                break
    else:
        if not CSV.exists() or "--regen" in sys.argv:
            generate()
        train()
        if "--eval" in sys.argv:
            evaluate()
