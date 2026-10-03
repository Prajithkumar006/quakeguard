/* ==========================================================================
   QuakeGuard - Disaster Preparedness & Emergency Kit Checklist
   ========================================================================== */

const disasterPreparedness = {
  kitItems: [
    { 
      id: "k1", 
      name: { en: "Drinking Water (1 Gallon / Person / Day)", ta: "குடிநீர் (ஒருவருக்கு ஒரு நாளைக்கு 1 கேலன்)", hi: "पीने का पानी (1 गैलन / व्यक्ति / दिन)" }, 
      category: "Essentials", 
      checked: true 
    },
    { 
      id: "k2", 
      name: { en: "Non-Perishable Food (3-Day Supply)", ta: "கெடாத உணவுப் பொருட்கள் (3 நாள் தேவை)", hi: "गैर-खराब होने वाला भोजन (3 दिन की आपूर्ति)" }, 
      category: "Essentials", 
      checked: true 
    },
    { 
      id: "k3", 
      name: { en: "Battery / Crank Radio & NOAA Feed", ta: "பேட்டரி ரேடியோ & வானிலை செய்திகள்", hi: "बैटरी / क्रैंक रेडियो और NOAA फ़ीड" }, 
      category: "Comms", 
      checked: true 
    },
    { 
      id: "k4", 
      name: { en: "First Aid Kit & Prescription Meds", ta: "முதலுதவி பெட்டி & மருந்துகள்", hi: "प्राथमिक चिकित्सा किट और दवाएं" }, 
      category: "Medical", 
      checked: false 
    },
    { 
      id: "k5", 
      name: { en: "Heavy-Duty Flashlight & Extra Batteries", ta: "மின்விளக்கு & கூடுதல் பேட்டரிகள்", hi: "टॉर्च और अतिरिक्त बैटरी" }, 
      category: "Tools", 
      checked: true 
    },
    { 
      id: "k6", 
      name: { en: "Whistle to Signal for Help", ta: "உதவிக்கு சிக்னல் செய்ய விசில்", hi: "मदद का संकेत देने के लिए सीटी" }, 
      category: "Tools", 
      checked: false 
    },
    { 
      id: "k7", 
      name: { en: "Dust Masks (N95) & Duct Tape", ta: "தூசி மாஸ்க் (N95) & டேப்", hi: "डस्ट मास्क (N95) और डक्ट टेप" }, 
      category: "Protection", 
      checked: false 
    },
    { 
      id: "k8", 
      name: { en: "Moist Towelettes & Garbage Bags", ta: "ஈரமான துடைப்பான்கள் & குப்பை பைகள்", hi: "गीले तौलिये और कचरा बैग" }, 
      category: "Sanitation", 
      checked: true 
    }
  ],

  renderChecklist() {
    const container = document.getElementById('kit-checklist-container');
    if (!container) return;

    const lang = window.multiLang ? window.multiLang.currentLang : 'en';

    container.innerHTML = this.kitItems.map(item => {
      const displayName = typeof item.name === 'object' ? (item.name[lang] || item.name.en) : item.name;
      return `
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.75rem;">
          <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} onchange="disasterPreparedness.toggleCheck('${item.id}')" style="width: 18px; height: 18px; cursor: pointer;">
          <label for="${item.id}" style="font-size: 0.88rem; cursor: pointer; color: ${item.checked ? 'var(--text-primary)' : 'var(--text-muted)'}; text-decoration: ${item.checked ? 'none' : 'line-through'};">
            ${displayName}
          </label>
        </div>
      `;
    }).join('');
  },

  toggleCheck(id) {
    const item = this.kitItems.find(k => k.id === id);
    if (item) {
      item.checked = !item.checked;
      this.renderChecklist();
    }
  }
};

// Expose module globally so `window.disasterPreparedness` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.disasterPreparedness = disasterPreparedness;
