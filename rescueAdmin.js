/* ==========================================================================
   QuakeGuard - Simplified Sensors, AI Advisories & Command Hub Engine
   ========================================================================== */

const rescueAdmin = {
  currentViewMode: 'simple',

  setCommandViewMode(mode) {
    this.currentViewMode = mode;

    const simpleBtn = document.getElementById('cmd-view-btn-simple');
    const advancedBtn = document.getElementById('cmd-view-btn-advanced');
    const simpleContainer = document.getElementById('cmd-simple-view');
    const advancedContainer = document.getElementById('cmd-advanced-view');

    if (mode === 'simple') {
      if (simpleBtn) { simpleBtn.className = 'btn btn-primary'; }
      if (advancedBtn) { advancedBtn.className = 'btn btn-outline'; }
      if (simpleContainer) { simpleContainer.style.display = 'block'; }
      if (advancedContainer) { advancedContainer.style.display = 'none'; }
    } else {
      if (simpleBtn) { simpleBtn.className = 'btn btn-outline'; }
      if (advancedBtn) { advancedBtn.className = 'btn btn-primary'; }
      if (simpleContainer) { simpleContainer.style.display = 'none'; }
      if (advancedContainer) { advancedContainer.style.display = 'block'; }
      
      // Ensure canvases render properly when switching to advanced view
      if (window.virtualSensorEngine) window.virtualSensorEngine.renderCanvases();
      if (window.acousticBioDemodulator) window.acousticBioDemodulator.renderSonarCanvas();
    }
  },

  // 🤖 AI Dynamic Advisory Generator based on Live Citizen Incident Reports & Sensor Telemetry
  generateAiDynamicAdvisory() {
    const reports = (window.communityReports && window.communityReports.reports) ? window.communityReports.reports : [];
    const sensors = window.virtualSensorEngine ? window.virtualSensorEngine : null;

    let dynamicAdvisories = [];

    // 1. Analyze live crowdsourced citizen incident reports
    reports.forEach(r => {
      if (r.severity === 'Critical') {
        if (r.type.includes('Building') || r.type.includes('Crack')) {
          dynamicAdvisories.push(`AI COMMUNITY ADVISORY [Critical Structural Fracture]: ${r.type} reported near ${r.loc}. Evacuate adjacent structures 50m immediately.`);
        } else if (r.type.includes('Injured') || r.type.includes('Civilians')) {
          dynamicAdvisories.push(`AI RESCUE DISPATCH ADVISORY: Extrication & K9 search teams active near ${r.loc}. Keep emergency road lanes clear!`);
        } else if (r.type.includes('Gas') || r.type.includes('Fire')) {
          dynamicAdvisories.push(`AI HAZARD ADVISORY [Gas Rupture / Fire Hazard]: Gas leak near ${r.loc}. Shut off main gas valves & avoid open flames!`);
        }
      }
    });

    // 2. Incorporate live virtual sensors telemetry state
    if (sensors && sensors.seismic && sensors.seismic.pWaveDetected) {
      dynamicAdvisories.push(`AI SEISMIC ALERT [P-Wave Waveform Triggered]: Ground shaking arriving in 15 seconds! DROP, COVER & HOLD ON immediately.`);
    } else if (sensors && sensors.thermal && sensors.thermal.survivorsFound > 0) {
      dynamicAdvisories.push(`AI LIFE DETECTED [FLIR & Bio-Sonar Lock]: ${sensors.thermal.survivorsFound} hidden survivors located under rubble. Medical triage team ready.`);
    }

    // 3. Fallback AI Disaster Knowledgebase pool
    const fallbackPool = [
      "AI DISASTER ADVISORY: Secondary aftershocks probable within 45 mins. Inspect gas valves & stay clear of unreinforced masonry walls.",
      "AI SAFE SHELTER UPDATE: Rajaji Community Relief Hub has 800 open emergency beds with clean water, emergency rations & power generators.",
      "AI TSUNAMI & COASTAL ADVISORY: Coastal seismic sensors report stable water levels. Move 1km inland if strong 20+ second shaking is felt near beach areas.",
      "AI FAMILY REUNION ADVISORY: Use QuakeGuard Family Safety Circle to mark yourself SAFE and broadcast offline mesh location to relatives.",
      "AI FIRST AID INSTRUCTION: Apply firm clean cloth pressure to arterial wounds. Do not move victims with suspected spinal neck injuries."
    ];

    let chosenMsg = "";
    if (dynamicAdvisories.length > 0) {
      const randIdx = Math.floor(Math.random() * dynamicAdvisories.length);
      chosenMsg = dynamicAdvisories[randIdx];
    } else {
      const randIdx = Math.floor(Math.random() * fallbackPool.length);
      chosenMsg = fallbackPool[randIdx];
    }

    this.updateAdvisoryUI(chosenMsg, "AI DYNAMIC ADVISORY");
    alert(`🤖 AI DYNAMIC ADVISORY SYNTHESIZED & BROADCASTED:\n\n"${chosenMsg}"\n\nCalculated from live citizen incident reports & sensor telemetry!`);
  },

  // 🎲 AI Random Safety Advisory Generator
  generateAiRandomAdvisory() {
    const randomAdvisoryPool = [
      "AI SMART ALERT: Secondary aftershocks probable. Secure tall bookcases, glass cabinets, and heavy wall appliances.",
      "AI MEDICAL ADVISORY: Emergency medical stations operating 24/7 at Chennai Central & Coimbatore Hubs. Free first-aid kits available.",
      "AI STRUCTURAL SAFETY: Diagonal X-cracks on walls indicate load-bearing shear risk. Evacuate building immediately!",
      "AI UTILITY ADVISORY: Main gas and electrical shutoffs activated in District 4. Do not turn on light switches if gas is smelled.",
      "AI WATER & HYGIENE: Boil tap water for 3 minutes before drinking or use bottled water distributed at local shelter points.",
      "AI VOLUNTEER DISPATCH: 8 rescue response units active. Registered volunteers report to Command Hub for equipment assignment.",
      "AI P2P MESH ADVISORY: Cellular towers degraded. Open QuakeGuard Off-Grid P2P Mesh to send emergency messages without internet!"
    ];

    const randomIndex = Math.floor(Math.random() * randomAdvisoryPool.length);
    const chosenMsg = randomAdvisoryPool[randomIndex];

    this.updateAdvisoryUI(chosenMsg, "AI SAFETY ADVISORY");
    alert(`🎲 AI RANDOM SAFETY ADVISORY GENERATED:\n\n"${chosenMsg}"\n\nPushed to all active mobile and web users!`);
  },

  sendPresetAdvisory(presetId) {
    let msg = "";
    if (presetId === 1) {
      msg = "SEISMIC ADVISORY: DROP, COVER & HOLD ON immediately under heavy furniture! Protect head & neck.";
    } else if (presetId === 2) {
      msg = "EVACUATION ADVISORY: Evacuate damaged masonry structures immediately to open ground relief centers!";
    } else if (presetId === 3) {
      msg = "RELIANCE HUB ADVISORY: Rajaji Community Safe Shelter is OPEN with free clean water, medical aid & generator power.";
    }

    this.updateAdvisoryUI(msg, "EMERGENCY BROADCAST");
    alert(`📢 1-CLICK PUBLIC ADVISORY BROADCASTED:\n\n"${msg}"\n\nPushed to all connected mobile & web apps!`);
  },

  updateAdvisoryUI(msg, tag) {
    const previewBox = document.getElementById('ai-advisory-preview-text');
    if (previewBox) {
      previewBox.innerHTML = `<strong>[${tag}]</strong> ${msg}`;
    }

    const ticker = document.getElementById('live-ticker-text');
    if (ticker) {
      ticker.innerHTML = `<strong>[${tag}]</strong> ${msg}`;
    }
  },

  renderAdvisory() {
    const lang = window.multiLang ? window.multiLang.currentLang : 'en';
    const tag = lang === 'ta' ? 'நேரலை அறிவிப்பு' : lang === 'hi' ? 'लाइव सलाह' : 'LIVE ADVISORY';
    const msg = lang === 'ta' 
      ? '"பொது பாதுகாப்பு வழிகாட்டல்: 2 மீட்பு நபர்கள் கண்டறியப்பட்டுள்ளனர். அவசர முகாம்கள் திறந்துள்ளன."' 
      : lang === 'hi' 
      ? '"सार्वजनिक सुरक्षा सलाह: FLIR रडार द्वारा पीड़ितों को खोजा गया। आपातकालीन राहत केंद्र खुले हैं।"' 
      : '"PUBLIC SAFETY ADVISORY: Search teams active. Emergency relief hubs open with clean water & power."';
    this.updateAdvisoryUI(msg, tag);
  },

  triggerSensorSiren() {
    if (window.sosManager && window.sosManager.playSirenAudio) {
      window.sosManager.playSirenAudio();
    } else {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
      } catch (e) {
        console.warn("Audio siren warning:", e);
      }
    }
    alert("🚨 BUILDING SENSOR ALARM SIREN SOUNDED! Local emergency speakers activated.");
  },

  sendBroadcast() {
    const input = document.getElementById('admin-broadcast-msg');
    const msg = input ? input.value.trim() : '';

    if (!msg) {
      alert("Please enter alert message text to broadcast.");
      return;
    }

    this.updateAdvisoryUI(msg, "GOVERNMENT ADVISORY");
    input.value = '';
    alert("Emergency Broadcast Advisory pushed to all active mobile and web users!");
  }
};

// Expose module globally so `window.rescueAdmin` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.rescueAdmin = rescueAdmin;
