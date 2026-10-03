/* ==========================================================================
   QuakeGuard - Acoustic Sub-Rubble Bio-Demodulation & Tapping Sonar Engine
   ========================================================================== */

const acousticBioDemodulator = {
  isListening: false,
  audioCtx: null,
  analyser: null,
  animFrame: null,

  state: {
    node: "Acoustic Seismometer Probe #07 (North Building Collapse)",
    sosTappingDetected: true,
    tappingPattern: "S.O.S. (... --- ...) Rhythmic Concrete Tapping",
    tappingBpm: 120,
    estimatedDepthMeters: 3.4,
    heartbeatDetected: true,
    heartbeatRate: 72, // bpm
    confidenceScore: 97.6,
    fftHistory: new Array(64).fill(12)
  },

  init() {
    this.canvas = document.getElementById('acoustic-sonar-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.startSonarSimulation();
    }
  },

  startSonarSimulation() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    const loop = () => {
      const adminPage = document.getElementById('page-admin');
      const isVisible = adminPage && adminPage.classList.contains('active');
      const advancedContainer = document.getElementById('cmd-advanced-view');
      const isAdvancedVisible = advancedContainer && advancedContainer.style.display !== 'none';

      if (isVisible) {
        this.updateSimulationData();
        if (isAdvancedVisible) {
          this.renderSonarCanvas();
        }
        this.updateUI();
      }
      this.animFrame = requestAnimationFrame(loop);
    };

    loop();
  },

  updateSimulationData() {
    // Generate synthetic audio spectrum (low frequency sub-rubble rumble + 120bpm tapping spike)
    for (let i = 0; i < 64; i++) {
      let noise = Math.random() * 15;
      
      // Heartbeat pulse peak around bin 4-6
      if (i >= 4 && i <= 7) {
        noise += Math.abs(Math.sin(Date.now() / 400)) * 65;
      }
      
      // Concrete tapping spike around bin 24-28
      if (i >= 24 && i <= 28) {
        let tapMod = (Math.floor(Date.now() / 300) % 3 === 0) ? 85 : 10;
        noise += tapMod;
      }

      this.state.fftHistory[i] = noise;
    }

    if (Math.random() > 0.85) {
      this.state.confidenceScore = (96.5 + Math.random() * 2.8).toFixed(1);
    }
  },

  renderSonarCanvas() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Dark Acoustic Grid Lines
    this.ctx.strokeStyle = "rgba(30, 41, 59, 0.8)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let x = 0; x < w; x += 25) { this.ctx.moveTo(x, 0); this.ctx.lineTo(x, h); }
    for (let y = 0; y < h; y += 20) { this.ctx.moveTo(0, y); this.ctx.lineTo(w, y); }
    this.ctx.stroke();

    // Render Audio Frequency Bars (FFT)
    const barWidth = w / 64;
    for (let i = 0; i < 64; i++) {
      let val = this.state.fftHistory[i];
      let barH = (val / 100) * (h * 0.85);
      let x = i * barWidth;
      let y = h - barH;

      // Color gradient based on frequency range (Heartbeat vs Tapping)
      if (i >= 4 && i <= 7) {
        this.ctx.fillStyle = "#ef4444"; // Red Heartbeat Sonar
      } else if (i >= 24 && i <= 28) {
        this.ctx.fillStyle = "#38bdf8"; // Cyan Tapping Sonar
      } else {
        this.ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
      }

      this.ctx.fillRect(x, y, barWidth - 1, barH);
    }

    // Overlay Tapping Radar Pulse Ring
    const centerX = w / 2;
    const centerY = h / 2;
    const pulseRadius = (Date.now() / 15) % (w / 3);
    
    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
    this.ctx.stroke();

    // Crosshair target on lock
    this.ctx.strokeStyle = "#10b981";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
    this.ctx.moveTo(centerX - 18, centerY); this.ctx.lineTo(centerX + 18, centerY);
    this.ctx.moveTo(centerX, centerY - 18); this.ctx.lineTo(centerX, centerY + 18);
    this.ctx.stroke();

    this.ctx.fillStyle = "#10b981";
    this.ctx.font = "10px monospace";
    this.ctx.fillText("ACOUSTIC TARGET LOCK: S.O.S. PATTERN DETECTED", 10, 16);
  },

  updateUI() {
    const tapEl = document.getElementById('acoustic-pattern-status');
    const depthEl = document.getElementById('acoustic-depth-val');
    const heartEl = document.getElementById('acoustic-heartbeat-rate');
    const confEl = document.getElementById('acoustic-conf-score');

    if (tapEl) tapEl.innerText = this.state.tappingPattern;
    if (depthEl) depthEl.innerText = `${this.state.estimatedDepthMeters} meters under concrete`;
    if (heartEl) heartEl.innerText = `${this.state.heartbeatRate} bpm (Human Heartbeat Signal)`;
    if (confEl) confEl.innerText = `${this.state.confidenceScore}% Signal Match`;
  },

  triggerAcousticLockAlert() {
    alert(`ACOUSTIC BIO-SONAR LOCK-ON!\nDetected rhythmic concrete tapping ("... --- ...") & human heartbeat signal at ${this.state.estimatedDepthMeters}m depth.\nLocation: North Wing Rubble Sector 3.`);
  }
};

// Expose module globally so `window.acousticBioDemodulator` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.acousticBioDemodulator = acousticBioDemodulator;
