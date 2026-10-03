/* ==========================================================================
   QuakeGuard - Virtual Telemetry & Life-Detection Sensor Engine
   ========================================================================== */

const virtualSensorEngine = {
  isScanning: false,
  updateInterval: null,
  canvasSeismic: null,
  canvasThermal: null,
  ctxSeismic: null,
  ctxThermal: null,

  // Sensor Telemetry State
  seismic: {
    node: "Seismic Geophone Node Alpha (Bedrock Fault Boundary)",
    pga: 0.02, // Peak Ground Acceleration in g
    frequency: 3.2, // Hz
    pWaveDetected: false,
    sWaveCountdown: 0,
    waveformHistory: new Array(80).fill(0)
  },

  motion: {
    node: "Micro-Doppler Rubble Radar Node 04",
    status: "Active Scanning",
    snrDb: 18.4,
    respirationRate: 16, // breaths per min
    movementDetected: true,
    depthMeters: 2.8,
    confidencePct: 94.2
  },

  thermal: {
    node: "FLIR Thermal Matrix Sensor 09",
    targetTemp: 36.8, // Human body temp C
    ambientTemp: 18.2,
    survivorsFound: 2,
    gridData: []
  },

  init() {
    this.canvasSeismic = document.getElementById('sensor-seismic-canvas');
    this.canvasThermal = document.getElementById('sensor-thermal-canvas');

    if (this.canvasSeismic) this.ctxSeismic = this.canvasSeismic.getContext('2d');
    if (this.canvasThermal) this.ctxThermal = this.canvasThermal.getContext('2d');

    this.generateThermalGrid();
    this.startLiveTelemetry();
  },

  startLiveTelemetry() {
    if (this.updateInterval) clearInterval(this.updateInterval);

    this.updateInterval = setInterval(() => {
      const adminPage = document.getElementById('page-admin');
      const isVisible = adminPage && adminPage.classList.contains('active');

      this.tickSeismic();
      this.tickMotion();
      this.tickThermal();

      if (isVisible) {
        // Only render canvases if advanced view is active to save GPU/CPU resources
        const advancedContainer = document.getElementById('cmd-advanced-view');
        if (advancedContainer && advancedContainer.style.display !== 'none') {
          this.renderCanvases();
        }
        this.updateUI();
      }
    }, 250);
  },

  tickSeismic() {
    // Simulate real-time ground vibration noise / P-wave spikes
    let noise = (Math.random() - 0.5) * 0.04;
    if (this.seismic.pWaveDetected) {
      noise += (Math.random() - 0.5) * 0.45; // High seismic wave amplitude
      this.seismic.pga = Math.min(0.85, this.seismic.pga + 0.05);
    } else {
      this.seismic.pga = Math.max(0.015, 0.02 + noise);
    }

    this.seismic.waveformHistory.push(noise);
    if (this.seismic.waveformHistory.length > 80) {
      this.seismic.waveformHistory.shift();
    }
  },

  tickMotion() {
    // Micro-doppler radar heartbeat & breathing cycle modulation
    if (this.motion.movementDetected) {
      this.motion.confidencePct = Math.min(99.4, Math.max(88.0, this.motion.confidencePct + (Math.random() - 0.5) * 1.5));
      this.motion.snrDb = (18 + Math.sin(Date.now() / 400) * 4).toFixed(1);
    }
  },

  tickThermal() {
    // Subtle thermal fluctuation simulation
    if (Math.random() > 0.7) {
      this.thermal.targetTemp = (36.7 + (Math.random() - 0.5) * 0.4).toFixed(1);
    }
  },

  generateThermalGrid() {
    // Generate 16x16 grid simulating FLIR infrared thermal camera
    this.thermal.gridData = [];
    for (let r = 0; r < 16; r++) {
      let row = [];
      for (let c = 0; c < 16; c++) {
        // Cold rubble (15°C - 20°C) with two hot spots (36.5°C - 37.2°C) representing survivors
        let temp = 16 + Math.random() * 4;
        
        // Survivor 1 Hotspot at (5, 6)
        if (Math.hypot(r - 5, c - 6) < 2.2) {
          temp = 36.8 - Math.hypot(r - 5, c - 6) * 4 + Math.random();
        }
        // Survivor 2 Hotspot at (11, 12)
        if (Math.hypot(r - 11, c - 12) < 1.8) {
          temp = 36.5 - Math.hypot(r - 11, c - 12) * 4.5 + Math.random();
        }

        row.push(temp);
      }
      this.thermal.gridData.push(row);
    }
  },

  renderCanvases() {
    // 1. Render Seismic Waveform Canvas
    if (this.ctxSeismic && this.canvasSeismic) {
      const w = this.canvasSeismic.width;
      const h = this.canvasSeismic.height;
      this.ctxSeismic.clearRect(0, 0, w, h);

      // Background grid lines
      this.ctxSeismic.strokeStyle = "rgba(51, 65, 85, 0.4)";
      this.ctxSeismic.lineWidth = 1;
      this.ctxSeismic.beginPath();
      for (let x = 0; x < w; x += 20) { this.ctxSeismic.moveTo(x, 0); this.ctxSeismic.lineTo(x, h); }
      for (let y = 0; y < h; y += 15) { this.ctxSeismic.moveTo(0, y); this.ctxSeismic.lineTo(w, y); }
      this.ctxSeismic.stroke();

      // Waveform trace
      this.ctxSeismic.strokeStyle = this.seismic.pWaveDetected ? "#ef4444" : "#38bdf8";
      this.ctxSeismic.lineWidth = 2;
      this.ctxSeismic.beginPath();
      const step = w / 80;
      for (let i = 0; i < this.seismic.waveformHistory.length; i++) {
        let x = i * step;
        let y = (h / 2) + (this.seismic.waveformHistory[i] * (h * 1.8));
        if (i === 0) this.ctxSeismic.moveTo(x, y);
        else this.ctxSeismic.lineTo(x, y);
      }
      this.ctxSeismic.stroke();
    }

    // 2. Render FLIR Thermal Canvas
    if (this.ctxThermal && this.canvasThermal) {
      const w = this.canvasThermal.width;
      const h = this.canvasThermal.height;
      const cellW = w / 16;
      const cellH = h / 16;

      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
          let t = this.thermal.gridData[r] ? this.thermal.gridData[r][c] : 18;
          // Interpolate color from Cold Blue (15°C) to Warm Red/Yellow (37°C)
          let ratio = Math.min(1, Math.max(0, (t - 15) / 22));
          let rCol = Math.floor(ratio * 240);
          let gCol = Math.floor(ratio * 120);
          let bCol = Math.floor((1 - ratio) * 200);

          this.ctxThermal.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
          this.ctxThermal.fillRect(c * cellW, r * cellH, cellW - 0.5, cellH - 0.5);
        }
      }

      // Draw Target Crosshairs on Survivor Hotspots
      this.drawCrosshair(this.ctxThermal, 6 * cellW, 5 * cellH, "#38bdf8", "VICTIM #1 (36.8°C)");
      this.drawCrosshair(this.ctxThermal, 12 * cellW, 11 * cellH, "#10b981", "VICTIM #2 (36.5°C)");
    }
  },

  drawCrosshair(ctx, x, y, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "9px monospace";
    ctx.fillText(label, x + 10, y - 5);
  },

  updateUI() {
    const pgaEl = document.getElementById('sensor-seismic-pga');
    const snrEl = document.getElementById('sensor-motion-snr');
    const tempEl = document.getElementById('sensor-thermal-temp');
    const countEl = document.getElementById('sensor-victims-count');

    if (pgaEl) pgaEl.innerText = `${(this.seismic.pga * 980.665).toFixed(1)} cm/s² (${this.seismic.pga.toFixed(3)}g)`;
    if (snrEl) snrEl.innerText = `${this.motion.snrDb} dB (Respiration: ${this.motion.respirationRate} bpm)`;
    if (tempEl) tempEl.innerText = `${this.thermal.targetTemp} °C (Human Heat Signature)`;
    if (countEl) countEl.innerText = `${this.thermal.survivorsFound} Confirmed Hidden Survivors`;

    // Simple View UI Elements
    const simpleSeismicStatus = document.getElementById('simple-seismic-status');
    const simpleSeismicBadge = document.getElementById('simple-seismic-badge');
    const simpleVictimsStatus = document.getElementById('simple-victims-status');
    const simpleThermalStatus = document.getElementById('simple-thermal-status');

    if (simpleSeismicStatus) {
      simpleSeismicStatus.innerText = this.seismic.pWaveDetected ? 
        `🚨 WARNING: HEAVY GROUND SHAKING DETECTED! (${this.seismic.pga.toFixed(3)}g)` : 
        `Current State: Ground is Stable (${this.seismic.pga.toFixed(3)}g - Minor Vibrations)`;
      simpleSeismicStatus.style.color = this.seismic.pWaveDetected ? 'var(--color-red-400)' : 'var(--color-blue-400)';
    }

    if (simpleSeismicBadge) {
      simpleSeismicBadge.className = this.seismic.pWaveDetected ? 'badge badge-danger' : 'badge badge-success';
      simpleSeismicBadge.innerHTML = this.seismic.pWaveDetected ? 
        '<i class="fa-solid fa-triangle-exclamation"></i> Shaking Alert' : 
        '<i class="fa-solid fa-circle-check"></i> Safe & Quiet';
    }

    if (simpleVictimsStatus) {
      simpleVictimsStatus.innerText = `${this.thermal.survivorsFound} Survivors Trapped Under 2.8m Rubble (16 bpm breathing & 72 bpm heartbeat)`;
    }

    if (simpleThermalStatus) {
      simpleThermalStatus.innerText = `Heat Target Confirmed: ${this.thermal.targetTemp}°C Human Body Temperature`;
    }
  },

  triggerSimulatedSeismicPWave() {
    this.seismic.pWaveDetected = true;
    let countdown = 15;

    const alertBox = document.getElementById('pwave-alert-box');
    if (alertBox) {
      alertBox.style.display = 'block';
    }

    const timer = setInterval(() => {
      countdown--;
      const display = document.getElementById('pwave-countdown-display');
      if (display) display.innerText = `${countdown}s`;

      if (countdown <= 0) {
        clearInterval(timer);
        this.seismic.pWaveDetected = false;
        if (alertBox) alertBox.style.display = 'none';
        alert("P-Wave Early Warning Test Complete. S-Wave Impact Window Passed.");
      }
    }, 1000);
  },

  dispatchSARRescueTeamToTarget(victimId) {
    alert(`DISPATCHING HEAVY RESCUE UNIT & K9 SEARCH TEAM TO SENSOR TARGET #${victimId}!\nCoordinates: Lat 13.0827, Lng 80.2707 | Depth: 2.8 meters under rubble.`);
  }
};

// Expose module globally so `window.virtualSensorEngine` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.virtualSensorEngine = virtualSensorEngine;
