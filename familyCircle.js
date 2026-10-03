/* ==========================================================================
   QuakeGuard - Family Emergency Safety Circle & "I AM SAFE" Beacon
   ========================================================================== */

const familyCircle = {
  members: [
    { id: "m1", name: "Sarah (Spouse)", status: "SAFE", location: "Downtown Shelter (37.779, -122.415)", battery: "84%", time: "3 mins ago" },
    { id: "m2", name: "David (Son)", status: "SAFE", location: "Central High School", battery: "92%", time: "8 mins ago" },
    { id: "m3", name: "Elena (Mother)", status: "UNCHECKED", location: "Sunset District", battery: "45%", time: "Last seen 2h ago" }
  ],

  markSelfSafe() {
    const msg = window.multiLang ? (
      window.multiLang.currentLang === 'ta' 
        ? "நிலை புதுப்பிக்கப்பட்டது: 'நான் பாதுகாப்பாக உள்ளேன்'\nஉங்கள் ஜிபிஎஸ் இருப்பிடம் மற்றும் பேட்டரி அளவு குடும்ப வட்டத்திற்கு அனுப்பப்பட்டது."
        : window.multiLang.currentLang === 'hi'
        ? "स्थिति अपडेट की गई: 'मैं सुरक्षित हूं'\nआपका जीपीएस स्थान और बैटरी स्तर आपके परिवार के पास भेज दिया गया है।"
        : "STATUS UPDATED: 'I AM SAFE'\nBroadcasted low-bandwidth beacon with your GPS coordinates & battery level to your Family Circle."
    ) : "STATUS UPDATED: 'I AM SAFE'";
    alert(msg);
  },

  renderMembers() {
    const container = document.getElementById('family-members-list');
    if (!container) return;

    const safeLabel = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'பாதுகாப்பாக உள்ளார்' : window.multiLang.currentLang === 'hi' ? 'सुरक्षित' : 'SAFE') : 'SAFE';
    const uncheckedLabel = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'தொடர்பு கொள்ளப்படவில்லை' : window.multiLang.currentLang === 'hi' ? 'अपुष्ट' : 'UNCHECKED') : 'UNCHECKED';
    const batteryLabel = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'பேட்டரி' : window.multiLang.currentLang === 'hi' ? 'बैटरी' : 'Battery') : 'Battery';

    container.innerHTML = this.members.map(m => {
      const isSafe = m.status === 'SAFE';
      const badgeClass = isSafe ? 'badge-success' : 'badge-warning';
      const statusText = isSafe ? safeLabel : uncheckedLabel;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 0.85rem 1.1rem; border-radius: 12px; border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${isSafe ? '#10b981' : '#f59e0b'};"></div>
            <div>
              <div style="font-weight: 700;">${m.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${m.location} | ${batteryLabel}: ${m.battery}</div>
            </div>
          </div>
          <span class="badge ${badgeClass}">${statusText}</span>
        </div>
      `;
    }).join('');
  }
};

// Expose module globally so `window.familyCircle` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.familyCircle = familyCircle;
