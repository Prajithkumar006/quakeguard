# Quake Guard AI

Four trainable models in one project. Sample data is **synthetic placeholder data** so everything runs out of the box;
replace the CSVs in `data/` with your real data and retrain.

| # | Module | What it does | Your data goes in |
|---|--------|--------------|-------------------|
| 1 | `sensor.py` | Detects quake shaking vs. walking/vehicle/drops from phone accelerometer windows | `data/sensor_windows.csv` |
| 2 | `quakes.py` | P-wave -> magnitude -> shaking intensity (MMI) -> alert level | `data/quake_records.csv` |
| 3 | `chatbot.py` | Safety assistant: intent classifier trained on many user phrasings, different reply per message type | `data/knowledge_base.csv` |
| 4 | `app_analytics.py` | Churn prediction + user segments + suggested nudges | `data/app_users.csv` |

Each file's docstring lists the exact column format.

## Run
```
pip install -r requirements.txt
python train_all.py      # trains all 4 (uses your CSVs if present, else makes samples)
python demo.py           # example predictions
uvicorn api:app --reload   # optional REST API, docs at /docs
```
Delete a CSV (or run `python train_all.py --regen`, which overwrites all of them) to go back to sample data.

## Before trusting it
- **Scores on sample data are meaningless** (the sensor model scores ~100% because synthetic classes are easy). Evaluate on real, held-out data.
- **Detection needs real labelled shaking**: public seismic datasets (e.g. STEAD, USGS catalog) plus your own device recordings, including lots of "false alarm" activity (driving, dropping phones, trains, construction).
- **Never alert from one phone.** Require many nearby devices to agree within a few seconds before sending a public alert, and keep a human/official-source check for large alerts.
- **No model predicts earthquakes.** This detects shaking that has started and estimates its effects.
- Chatbot: ~70 message types (emergency, after-quake, preparing, science, app help, small talk, scared/anxious, off-topic). Training auto-adds typos, caps and filler words. Held-out check: `python chatbot.py --eval`. Accuracy on messages it was *not* tuned on was roughly 80% - the seed phrasings were written by one person, so **real accuracy needs real user messages**: copy lines from `data/unanswered_questions.csv` into `knowledge_base.csv` (new phrasing under the right intent, or a new row) and retrain. Chat in the terminal with `python chatbot.py --chat`.
- The chatbot only returns answers you wrote, so guidance stays controlled. Review the seed safety text against your local authority's guidance (and fill in the two placeholder app answers). Unanswered questions are logged to `data/unanswered_questions.csv`.
- App analytics: if you collect personal data, make sure you have consent and follow your privacy law (GDPR, India's DPDP Act, etc.).
