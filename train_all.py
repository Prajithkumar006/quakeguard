"""Train every model. Real data in data/ is used if present; otherwise sample data is generated.
Usage:  python train_all.py            (use existing data, generate samples where missing)
        python train_all.py --regen    (regenerate sample data too - overwrites data/*.csv!)
"""
import sys

import app_analytics, chatbot, quakes, sensor

regen = "--regen" in sys.argv
for name, mod in [("1/4 quake detection", sensor), ("2/4 magnitude + risk", quakes),
                  ("3/4 safety chatbot", chatbot), ("4/4 app analytics", app_analytics)]:
    print(f"\n=== {name} ===")
    if regen or not mod.CSV.exists():
        mod.generate()
    else:
        print(f"  using existing data/{mod.CSV.name}")
    mod.train()
print("\nAll models saved in models/")
