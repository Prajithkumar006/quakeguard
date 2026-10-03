"""Assistant brain: conversation memory + visible reasoning steps + tools + optional LLM for open-ended questions.
Safety-critical answers always come from the vetted knowledge base (chatbot.py); the LLM never replaces them."""
import json, os, re, urllib.request
import chatbot

EMO = {"panic": r"\b(help|scared|terrified|panic\w*|freaking|omg|dying|die)\b",
       "worry": r"\b(worried|anxious|nervous|afraid|stress\w*|can'?t sleep)\b",
       "angry": r"\b(useless|stupid|hate|rubbish|sucks|terrible)\b"}
LEAD = {"worry": "That sounds stressful, and it's okay to feel that way. ", "angry": "Sorry this isn't going well. "}
FOLLOW = re.compile(r"^(and|what about|how about|then|so|but)\b[ ,]*", re.I)
SESSIONS = {}
SYSTEM = ("You are Quake Guard's earthquake-safety assistant. Be calm, brief and practical. Always recommend Drop, Cover "
          "and Hold On during shaking and calling local emergency services for danger. Never predict earthquakes, never "
          "give medical diagnoses, and say when you are unsure. Stay on earthquake safety and the app.")


# ------------------------------------------------------------------ tools (real calculations)
def warning_time(km):
    """Seconds between alert and damaging S-wave. Assumes S 3.5 km/s and ~6 s to detect, confirm and deliver."""
    s = km / 3.5 - 6
    return (f"For a quake about {km:g} km away, damaging S-waves take roughly {km/3.5:.0f} s to reach you. After ~6 s for "
            f"detection and delivery that leaves about {s:.0f} s of warning. " if s > 0 else
            f"At about {km:g} km you're likely inside the 'blind zone': shaking may arrive before or with the alert. ") + \
           "(Rough estimate; real numbers depend on the network and the quake.)"


def kit_calc(people, days=3):
    return f"For {people} people for {days} days: about {4*people*days} litres of water (4 L/person/day), plus {days*3*people} meals of non-perishable food, and a flashlight, first-aid kit, power bank and medicines for each person."


def _tools(text):
    t = text.lower()
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:km|kilomet)", t)
    if m and re.search(r"warn|alert|second|time|how long|early", t):
        return "warning_time", warning_time(float(m.group(1)))
    m = re.search(r"(\d+)\s*(?:people|persons|members|of us|adults|kids)", t)
    if m and re.search(r"kit|water|supplies|food|store|stock", t):
        return "kit_calc", kit_calc(int(m.group(1)))
    return None, None


def _llm(history, text):
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return None
    body = {"model": os.getenv("QG_MODEL", "claude-sonnet-5-5"), "max_tokens": 400, "system": SYSTEM,
            "messages": history[-6:] + [{"role": "user", "content": text}]}
    req = urllib.request.Request("https://api.anthropic.com/v1/messages", json.dumps(body).encode(),
                                 {"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return "".join(b.get("text", "") for b in json.load(r)["content"])
    except Exception:
        return None


# ------------------------------------------------------------------------- main loop
def reply(text, session_id="default", debug=False):
    s = SESSIONS.setdefault(session_id, {"history": [], "intent": None, "cat": None, "asked_place": False})
    thoughts = []
    emo = next((k for k, p in EMO.items() if re.search(p, text, re.I)), None)
    thoughts.append(f"Read the message. Tone: {emo or 'neutral'}.")

    tool, out = _tools(text)
    if tool:
        thoughts.append(f"Question needs a calculation -> used tool `{tool}`.")
        res = {"answer": out, "intent": tool, "category": "tool", "confidence": 1.0}
    else:
        probe = text
        if FOLLOW.match(text) or len(text.split()) <= 3:
            probe = FOLLOW.sub("", text)
        res = chatbot.ask(probe)
        thoughts.append(f"Matched topic '{res['intent']}' (confidence {res['confidence']}).")
        if res["intent"] is None and s["cat"] in ("during", "after") and len(text.split()) <= 8:
            res = chatbot.ask(f"{s['cat']} earthquake {probe}")
            thoughts.append(f"Treated it as a follow-up to the earlier '{s['cat']}' topic -> '{res['intent']}'.")
        if res["intent"] is None:
            llm = _llm(s["history"], text)
            if llm:
                thoughts.append("No vetted answer; asked the language model with safety rules.")
                res = {"answer": llm, "intent": "llm", "category": "llm", "confidence": None}
            else:
                thoughts.append("No vetted answer and no language model configured; asked the user to rephrase.")

    answer = res["answer"]
    if emo in LEAD and res["category"] not in ("during", "chat"):
        answer = LEAD[emo] + answer
    if res["intent"] == "during_general" and not s["asked_place"]:
        answer += "\n\nTell me where you are (indoors, in a car, outside, in bed) and I'll tailor the steps."
        s["asked_place"] = True
        thoughts.append("Gave the emergency steps first, then asked one follow-up about location.")
    if res["intent"] not in (None, "llm", "out_of_scope"):
        s["intent"], s["cat"] = res["intent"], res["category"]
    s["history"] += [{"role": "user", "content": text}, {"role": "assistant", "content": answer}]
    out = {"answer": answer, "intent": res["intent"], "confidence": res["confidence"]}
    if debug:
        out["thoughts"] = thoughts
    return out


if __name__ == "__main__":
    print("Quake Guard assistant (type 'quit' to exit)")
    while (t := input("you: ").strip()) != "quit":
        r = reply(t, debug=True)
        print("  [thinking]", " | ".join(r["thoughts"]))
        print("bot:", r["answer"], "\n")
