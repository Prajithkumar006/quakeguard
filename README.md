# QuakeGuard

> **QuakeGuard** is an open-source real-time earthquake detection, seismic risk calculation, emergency SOS dispatch, and disaster response coordination platform.

![QuakeGuard Logo](assets/logo.jpg)

---

## 📌 Features

- **Real-Time Seismic Monitoring**: Integrates live feeds from USGS and EMSC GeoJSON APIs with pulse circle markers and focal depth indicators.
- **Interactive Emergency Map**: Interactive Leaflet map displaying safe relief shelters, Level I trauma hospitals, police/SAR stations, fire rescue bases, and fault line overlays.
- **Seismic Risk Calculation Engine**: Evaluates fault proximity, focal depth, and site soil classification (NEHRP site classes A–E) to compute risk scores and S-wave attenuation.
- **Structural Damage Inspector**: Image-based inspection tool for post-earthquake masonry cracks and collapse risk evaluation.
- **One-Tap Emergency SOS**: Triggers distress modal, dual-tone AudioContext alarm siren, GPS location capture, and SMS dispatch alert.
- **Multi-Language Support**: Seamless instant UI translation for English, Tamil (தமிழ்), and Hindi (हिंदी).
- **Offline & PWA Ready**: Service worker caching (`sw.js`) and PWA web manifest (`manifest.json`) for zero-connectivity emergency survival access.
- **Cross-Platform**: Run as a Web App, Desktop Native Window (Electron), or Mobile App (Flutter/Android).

---

## 🛠️ Project Structure

```
quakeguard/
├── index.html              # Main Application Viewport
├── css/
│   └── styles.css          # Design Tokens, Glassmorphism & Theme Variables
├── js/
│   ├── app.js              # Application Controller & Navigation Router
│   ├── multiLang.js        # i18n Dictionaries (English, Tamil, Hindi)
│   ├── liveMap.js          # Leaflet Map Engine & USGS Feed Handler
│   ├── databaseExplorer.js # Seismic & Facility Data Catalog Explorer
│   ├── aiPredictor.js      # Seismic Risk & Attenuation Algorithm
│   ├── aiDamageAssessor.js # Structural Integrity Inspection Module
│   ├── aiBackend.js        # Client for the AI server (fails soft to offline mode)
│   ├── aiVoiceAssistant.js # Emergency Safety Voice & Text Assistant
│   ├── sosManager.js       # Emergency SOS & Audio Siren Synthesizer
│   ├── disasterPreparedness.js # Preparedness Guides & Kit Checklist
│   ├── communityReports.js     # Crowdsourced Incident Feed & Form
│   ├── volunteerModule.js      # Volunteer Rescue Mission Board
│   └── rescueAdmin.js          # Command Center & Advisory Broadcaster
├── ai_server/              # Python AI chat server (see above)
│   └── ...
├── backend/                # Java Spring Boot REST API & PostgreSQL Schema
├── mobile/                 # Flutter Android Mobile Codebase
├── desktop_app.js          # Electron Desktop App Main Process
├── run_app.bat             # Windows Desktop Launcher Script
├── sw.js                   # PWA Service Worker for Offline Mode
└── manifest.json           # PWA Web Manifest
```

---

## 🚀 Quick Start

### Web Platform
1. Open `index.html` directly in any modern web browser, or serve via local server:
   ```bash
   python -m http.server 8080
   ```
2. Navigate to `http://localhost:8080`

### Web Platform + AI assistant (recommended)
Double-click `start_with_ai.bat` (Windows) or run `./start_with_ai.sh` (Mac/Linux). It sets up Python once, trains the chat model, and serves the site and the AI together at `http://localhost:8000`.
- The chat bubble shows **AI online** when the AI server is connected, and **Offline mode** when it isn't. In offline mode the original built-in assistant answers, so the chat still works without the server (PWA/offline use).
- Used by the AI server: English questions about earthquake safety, with a collapsible "Thinking" trace and a helpful / not helpful button. Used by the built-in assistant: Tamil, Hindi, and site-specific topics (shelters, sensors, volunteers, predictor, community feed, family circle).
- If you open the site some other way (`python -m http.server 8080`, `file://`), start the AI server separately (`start_with_ai.bat`) and the site finds it at `localhost:8000`. To use another address: `localStorage.setItem('qg_ai_url','https://your-server')`.
- Privacy: chat messages are sent to the AI server. If you set `ANTHROPIC_API_KEY` in the server's environment, unanswered questions are also sent to Anthropic's API. Say so in your privacy policy.
- Improve it over time: `cd ai_server && python learn.py review`, then `python learn.py add "<message>" <intent>`.
- Before going public: set `QG_ALLOWED_ORIGINS` to your site's address and put the server behind HTTPS.

### Desktop Native Window
- Double-click `run_app.bat` or run via PowerShell:
  ```powershell
  .\run_app.ps1
  ```

### Mobile App (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
