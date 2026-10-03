/* ==========================================================================
   QuakeGuard - Emergency SOS, Distress Siren & SMS/Call Fallback
   ==========================================================================
   IMPORTANT (read before changing): a web page can never silently SEND an
   SMS or place a call on its own — no browser API allows that, with or
   without a backend. What genuinely works, with zero internet and just a
   cell signal, is handing off to the device's own SMS/Phone app via the
   `sms:` and `tel:` URI schemes, pre-filled with the message/number, one
   tap from being sent. That's what this module does — it's a real,
   honest fallback, not a simulation of one.
   ========================================================================== */

const sosManager = {
  audioCtx: null,
  oscillator1: null,
  oscillator2: null,
  isSirenPlaying: false,

  CONTACTS_KEY: 'quakeguard_emergency_contacts',

  triggerSOSModal() {
    const modal = document.getElementById('sos-modal-overlay');
    if (modal) {
      modal.classList.add('active');
      this.playAlarmSiren();
    }
  },

  closeSOSModal() {
    const modal = document.getElementById('sos-modal-overlay');
    if (modal) {
      modal.classList.remove('active');
      this.stopAlarmSiren();
    }
  },

  playAlarmSiren() {
    try {
      if (this.isSirenPlaying) return;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Dual Oscillators for authentic European/US emergency siren tone
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      this.oscillator1.type = 'sawtooth';
      this.oscillator2.type = 'sine';

      // Modulate frequency back and forth between 600Hz and 950Hz
      const now = this.audioCtx.currentTime;
      this.oscillator1.frequency.setValueAtTime(600, now);
      this.oscillator1.frequency.linearRampToValueAtTime(950, now + 0.6);
      this.oscillator1.frequency.linearRampToValueAtTime(600, now + 1.2);

      gainNode.gain.setValueAtTime(0.3, now);

      this.oscillator1.connect(gainNode);
      this.oscillator2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      this.oscillator1.start();
      this.oscillator2.start();
      this.isSirenPlaying = true;
    } catch (e) {
      console.warn('[QuakeGuard SOS] Web Audio Siren requires user interaction.', e);
    }
  },

  stopAlarmSiren() {
    if (this.audioCtx && this.isSirenPlaying) {
      try {
        if (this.oscillator1) this.oscillator1.stop();
        if (this.oscillator2) this.oscillator2.stop();
        this.audioCtx.close();
      } catch (e) {}
      this.isSirenPlaying = false;
    }
  },

  // ------------------------------------------------------------------
  // Emergency Contacts — saved ahead of time so nobody has to type a
  // phone number while panicking mid-emergency. Stored locally on the
  // device only (localStorage); never sent anywhere.
  // ------------------------------------------------------------------
  getContacts() {
    try {
      return JSON.parse(localStorage.getItem(this.CONTACTS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  },

  saveContacts(contacts) {
    localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
  },

  addContactFromForm() {
    const nameEl = document.getElementById('sos-contact-name');
    const phoneEl = document.getElementById('sos-contact-phone');
    if (!nameEl || !phoneEl) return;

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const digitCount = (phone.match(/\d/g) || []).length;

    if (!phone || digitCount < 7) {
      alert('Enter a valid phone number (with country code if possible), e.g. +91 98765 43210.');
      return;
    }

    const contacts = this.getContacts();
    contacts.push({ name: name || 'Emergency Contact', phone });
    this.saveContacts(contacts);
    nameEl.value = '';
    phoneEl.value = '';
    this.renderContactsList();
  },

  removeContact(index) {
    const contacts = this.getContacts();
    contacts.splice(index, 1);
    this.saveContacts(contacts);
    this.renderContactsList();
  },

  renderContactsList() {
    const list = document.getElementById('sos-contacts-list');
    if (!list) return;
    const contacts = this.getContacts();

    if (!contacts.length) {
      list.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.4rem 0;">No emergency contacts saved yet — add one below so SOS SMS has somewhere to go.</div>';
      return;
    }

    list.innerHTML = contacts.map((c, i) => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 0.4rem;">
        <div>
          <div style="font-weight: 700; font-size: 0.85rem;">${c.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${c.phone}</div>
        </div>
        <button onclick="sosManager.removeContact(${i})" style="background: none; border: none; color: var(--color-red-400); cursor: pointer; font-size: 0.9rem;" title="Remove">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  },

  // ------------------------------------------------------------------
  // Real device actions. Both use standard URI schemes the OS itself
  // handles — this works with no internet connection, just cell signal,
  // because it's the same as if the person opened Phone/Messages by hand.
  // ------------------------------------------------------------------

  // iOS Safari requires "&body=" after a recipient number; Android/Chrome
  // and desktop expect "?body=". Using the wrong one on iOS silently drops
  // the pre-filled message, so we branch on platform.
  _buildSmsLink(numbers, body) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = (isIOS && numbers) ? '&' : '?';
    return `sms:${numbers}${separator}body=${encodeURIComponent(body)}`;
  },

  sendSmsSOS() {
    const contacts = this.getContacts();
    let numbers = contacts.map(c => c.phone);

    if (!numbers.length) {
      const entered = prompt("No emergency contacts saved yet. Enter a phone number to send your SOS to now (or add contacts permanently from the Emergency Contacts panel on the dashboard):");
      if (!entered || !entered.trim()) return;
      numbers = [entered.trim()];
    }

    const btn = document.getElementById('sos-sms-btn');
    const setLabel = (html) => { if (btn) btn.innerHTML = html; };
    const defaultLabel = '<i class="fa-solid fa-comment-sms"></i> <span data-i18n="sendSmsSosBtn">Send SOS via SMS</span>';
    setLabel('<i class="fa-solid fa-spinner fa-spin"></i> <span>Getting your location…</span>');

    const openSms = (locationLine) => {
      const body = `EMERGENCY - I need help. ${locationLine} Sent via QuakeGuard.`;
      const link = this._buildSmsLink(numbers.join(','), body);
      window.location.href = link;
      setLabel(defaultLabel);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          openSms(`My location: https://maps.google.com/?q=${lat},${lng}`);
        },
        () => openSms("Couldn't confirm my exact location — please try calling me."),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      openSms("This device doesn't support location sharing — please try calling me.");
    }
  },

  // Opens the device's own Phone app with an emergency number ready to
  // dial. 112 reaches emergency services in the EU, India and much of the
  // world; it's shown alongside a reminder for regions (like 911 in the
  // US/Canada) that use a different number.
  callEmergencyNumber() {
    window.location.href = 'tel:112';
  },

  // Kept for any old markup still calling this name — routes to the real
  // SMS action instead of the old fake alert.
  executeEmergencyCall() {
    this.sendSmsSOS();
  }
};

// Expose module globally so `window.sosManager` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.sosManager = sosManager;
