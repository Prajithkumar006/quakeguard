import numpy as np

import app_analytics, chatbot, quakes, sensor

rng = np.random.default_rng(42)
print("--- 1. detection ---")
for label in ["still", "walking", "quake"]:
    w = sensor._make_window(label, rng)
    print(label, "->", sensor.detect(w)["quake_probability"])

print("\n--- 2. magnitude + risk ---")
print(quakes.assess(pd_cm=0.05, tau_c_s=1.0, distance_km=40, depth_km=12, vs30=300, building_vuln=0.7))

print("\n--- 3. chatbot ---")
for q in ["hi", "what do I do right now the ground is shaking", "im driving and the road is shaking", "HELP", "how much warning will I get",
          "my wall has big cracks can i go back in", "im so scared of quakes", "thanks!", "best pizza recipe"]:
    r = chatbot.ask(q)
    print(f"{q!r} -> [{r['intent']}] {r['answer'][:110]}")

print("\n--- 4. analytics ---")
print(app_analytics.score_user(dict(platform="android", days_since_install=90, sessions_7d=0, last_active_days=20,
      alerts_30d=2, alerts_acked_30d=0, notif_enabled=0, location_perm=1, drills_completed=0, contacts_added=0)))
