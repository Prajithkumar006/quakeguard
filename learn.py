"""Human-in-the-loop learning. Nothing is learned from users automatically (safety). A person reviews, then:
   python learn.py review                       list unanswered messages + thumbs-down feedback
   python learn.py add "<message>" <intent>     add the phrasing to that intent and retrain"""
import sys
import pandas as pd
import chatbot
from common import DATA

if sys.argv[1:2] == ["review"]:
    for f in ("unanswered_questions.csv", "feedback.csv"):
        p = DATA / f
        print(f"\n== {f} ==\n" + (pd.read_csv(p).tail(50).to_string(index=False) if p.exists() else "(none yet)"))
elif sys.argv[1:2] == ["add"] and len(sys.argv) == 4:
    kb = pd.read_csv(chatbot.CSV)
    if sys.argv[3] not in set(kb["intent"]):
        sys.exit(f"unknown intent {sys.argv[3]!r}; known: {', '.join(kb['intent'])}")
    kb.loc[kb["intent"] == sys.argv[3], "question"] += " | " + sys.argv[2]
    kb.to_csv(chatbot.CSV, index=False)
    chatbot.train()
else:
    print(__doc__)
