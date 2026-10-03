/* ==========================================================================
   QuakeGuard - Seismic P-Wave Early Warning Countdown Engine
   ========================================================================== */

const pWaveEarlyWarning = {
  countdownTimer: null,
  secondsLeft: 18,

  triggerTestWarning() {
    this.secondsLeft = 18;
    const alertBox = document.getElementById('pwave-alert-box');
    if (alertBox) alertBox.style.display = 'block';

    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      this.secondsLeft--;
      const display = document.getElementById('pwave-countdown-display');
      if (display) display.innerText = `${this.secondsLeft}s`;

      if (this.secondsLeft <= 0) {
        clearInterval(this.countdownTimer);
        alert("S-WAVE GROUND SHAKING ARRIVED! DROP, COVER, AND HOLD ON!");
      }
    }, 1000);
  }
};

// Expose module globally so `window.pWaveEarlyWarning` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.pWaveEarlyWarning = pWaveEarlyWarning;
