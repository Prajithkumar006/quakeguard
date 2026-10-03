/* ==========================================================================
   QuakeGuard - Community Mutual Aid & Supply Sharing Board
   ========================================================================== */

const mutualAid = {
  supplies: [
    { id: "s1", type: "OFFERING", title: "Clean Bottled Water (5 Cases)", loc: "Mission St & 16th", contact: "Community Hub #3" },
    { id: "s2", type: "REQUESTING", title: "Infant Baby Formula & Diapers", loc: "Sunset District Relief Tent", contact: "Maria G." },
    { id: "s3", type: "OFFERING", title: "Portable Gas Generator Power", loc: "Central Park Shelter", contact: "Dave R." }
  ],

  renderBoard() {
    this.renderAidBoard();
  },

  renderAidBoard() {
    const container = document.getElementById('mutual-aid-list');
    if (!container) return;

    const contactLabel = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'வழங்குநரைத் தொடர்பு கொள்ளவும்' : window.multiLang.currentLang === 'hi' ? 'आपूर्ति प्रदाता से संपर्क करें' : 'Contact Supply Provider') : 'Contact Supply Provider';
    const offeringLabel = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'வழங்கப்படுகிறது' : window.multiLang.currentLang === 'hi' ? 'उपलब्ध' : 'OFFERING') : 'OFFERING';
    const requestingLabel = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'தேவைப்படுகிறது' : window.multiLang.currentLang === 'hi' ? 'आवश्यकता' : 'REQUESTING') : 'REQUESTING';

    container.innerHTML = this.supplies.map(s => {
      const isOffer = s.type === 'OFFERING';
      const badgeClass = isOffer ? 'badge-success' : 'badge-warning';
      const typeText = isOffer ? offeringLabel : requestingLabel;
      return `
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span class="badge ${badgeClass}">${typeText}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${s.loc}</span>
            </div>
            <h4 style="font-weight: 700; margin-bottom: 0.5rem;">${s.title}</h4>
          </div>
          <button class="btn btn-outline" style="width: 100%; font-size: 0.85rem; margin-top: 0.75rem;" onclick="alert('Contact details sent to your phone!')">
            ${contactLabel} <i class="fa-solid fa-comment-sms"></i>
          </button>
        </div>
      `;
    }).join('');
  }
};

// Expose module globally so `window.mutualAid` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.mutualAid = mutualAid;
