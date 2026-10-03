/* ==========================================================================
   QuakeGuard - Infrasound Animal & Wildlife Early Warning Bio-Network
   ========================================================================== */

const animalInfrasoundNetwork = {
  activeSpecies: [
    { id: "bio1", species: "Canine SAR Pack Alpha", location: "Coimbatore Foothills, TN", leadTime: "34 mins lead time", anomalyIndex: "HIGH (0.12 Hz Infrasound)", status: "Agitated Flight Behavior" },
    { id: "bio2", species: "Migratory Avian Sensor Flock", location: "Nagapattinam Coast, TN", leadTime: "42 mins lead time", anomalyIndex: "ELEVATED (0.05 Hz Infrasound)", status: "Mass Altitude Sudden Shift" },
    { id: "bio3", species: "Marine Bio-Acoustic Pod", location: "Bay of Bengal Deep Water", leadTime: "28 mins lead time", anomalyIndex: "CRITICAL (P-Wave Micro-shock)", status: "Offshore Movement Pattern" }
  ],

  renderUI() {
    const container = document.getElementById('animal-infrasound-list');
    if (!container) return;

    container.innerHTML = this.activeSpecies.map(s => `
      <div style="background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 10px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-teal-400);">${s.species}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);"><i class="fa-solid fa-location-dot"></i> ${s.location} | <strong style="color:var(--color-orange-400);">${s.status}</strong></div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-warning" style="font-size: 0.75rem;"><i class="fa-solid fa-clock text-orange"></i> ${s.leadTime}</span>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-mono mt-1;">${s.anomalyIndex}</div>
        </div>
      </div>
    `).join('');
  }
};

// Expose module globally so `window.animalInfrasoundNetwork` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.animalInfrasoundNetwork = animalInfrasoundNetwork;
