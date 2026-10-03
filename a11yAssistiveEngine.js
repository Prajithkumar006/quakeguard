/* ==========================================================================
   QuakeGuard - Voice Reader (accessibility)

   When Voice Reader is ON the page reads aloud WHAT YOU POINT AT:
     - click or tap any text, button, heading, card or message  -> it is read
     - select (highlight) text with mouse or finger             -> only that selection is read
     - press Tab to move to a button / field                    -> its label is read
     - press Esc, or switch Voice Reader off                    -> reading stops
   The part being read is outlined so you can see where it is reading.
   It uses the device's own speech voices, so it works with no internet.
   The language follows the language chosen on the site (English / Tamil / Hindi).
   ========================================================================== */

const a11yAssistiveEngine = {
  isToolbarVisible: localStorage.getItem('qg_a11y_toolbar_enabled') === 'true',

  settings: {
    screenReaderNarration: localStorage.getItem('qg_a11y_screenReader') === 'true'
  },

  _bound: false,
  _queue: [],
  _speaking: false,
  _token: 0,
  _highlightEl: null,
  _voicesCache: null,
  _ignoreClickUntil: 0,

  init() {
    // Earlier versions had more accessibility switches. Clear their saved state so that
    // nothing from them (large text, high contrast, simple mode...) stays switched on
    // with no button left to turn it off.
    ['qg_a11y_contrast', 'qg_a11y_fontSize', 'qg_a11y_dyslexia', 'qg_a11y_strobe', 'qg_a11y_simple'].forEach(k => localStorage.removeItem(k));
    ['data-a11y-contrast', 'data-a11y-fontsize', 'data-a11y-dyslexia', 'data-simple-mode'].forEach(a => document.documentElement.removeAttribute(a));

    this.setupKeyboardNavigation();
    this._bindReaderEvents();
    if ('speechSynthesis' in window) {
      // voices load asynchronously in Chrome/Edge
      window.speechSynthesis.onvoiceschanged = () => { this._voicesCache = null; };
    }
    this.applySettings();
  },

  // ---------------------------------------------------------------- toolbar
  toggleAccessibilityToolbar() {
    this.isToolbarVisible = !this.isToolbarVisible;
    localStorage.setItem('qg_a11y_toolbar_enabled', this.isToolbarVisible ? 'true' : 'false');
    this.updateToolbarVisibility();
  },

  updateToolbarVisibility() {
    const bar = document.getElementById('a11y-bar');
    const navBtn = document.getElementById('nav-a11y-btn');
    if (bar) bar.style.display = this.isToolbarVisible ? 'flex' : 'none';
    if (navBtn) {
      navBtn.classList.toggle('btn-primary', this.isToolbarVisible);
      navBtn.classList.toggle('btn-icon', !this.isToolbarVisible);
    }
  },

  applySettings() {
    this.updateToolbarVisibility();
    this.updateToolbarUI();
  },

  updateToolbarUI() {
    const btn = document.getElementById('a11y-btn-reader');
    const on = this.settings.screenReaderNarration;
    if (btn) { btn.className = on ? 'btn btn-primary' : 'btn btn-outline'; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    document.body.classList.toggle('qg-voice-reader-on', on);
  },

  // ---------------------------------------------------------------- on / off
  toggleScreenReader() {
    this.settings.screenReaderNarration = !this.settings.screenReaderNarration;
    localStorage.setItem('qg_a11y_screenReader', this.settings.screenReaderNarration ? 'true' : 'false');
    this.updateToolbarUI();
    this._ignoreClickUntil = Date.now() + 400;   // don't read the toolbar button itself right after the toggle message
    if (this.settings.screenReaderNarration) {
      if (!('speechSynthesis' in window)) {
        alert('This browser has no text-to-speech support. Please use Chrome, Edge or Safari.');
        this.settings.screenReaderNarration = false; localStorage.setItem('qg_a11y_screenReader', 'false'); this.updateToolbarUI(); return;
      }
      this.speak(this._t('on'), { force: true, noHighlight: true });
      this._toast(this._t('toast'));
    } else {
      this.stop();
      this._toast(null);
    }
  },

  // ---------------------------------------------------------------- language & voices
  _lang() {
    const code = (window.multiLang && multiLang.currentLang) || (window.aiVoiceAssistant && aiVoiceAssistant.activeLang) || 'en';
    return code;
  },
  _bcp47() { return ({ en: 'en-US', ta: 'ta-IN', hi: 'hi-IN' })[this._lang()] || 'en-US'; },

  _t(key) {
    const T = {
      en: { on: 'Voice Reader on. Click or tap any text to hear it. Select text to hear just that part. Press Escape to stop.', toast: 'Voice Reader is ON: click or tap any text to hear it. Select text to read only that part.', stop: 'Stop', nothing: 'There is nothing to read here.', novoice: 'No voice for this language is installed on this device, so the default voice is used.' },
      ta: { on: 'குரல் வாசிப்பு இயக்கத்தில் உள்ளது. எந்த எழுத்தையும் தொட்டால் அல்லது கிளிக் செய்தால் படிக்கும். நிறுத்த Escape அழுத்தவும்.', toast: 'குரல் வாசிப்பு இயக்கத்தில்: எந்த எழுத்தையும் கிளிக் செய்தால் படிக்கும்.', stop: 'நிறுத்து', nothing: 'படிக்க எதுவும் இல்லை.', novoice: 'இந்த மொழிக்கான குரல் இந்த சாதனத்தில் இல்லை; இயல்புநிலை குரல் பயன்படுத்தப்படுகிறது.' },
      hi: { on: 'वॉइस रीडर चालू है। किसी भी लिखे हुए पर क्लिक या टैप करें, वह पढ़ा जाएगा। रोकने के लिए Escape दबाएं।', toast: 'वॉइस रीडर चालू: किसी भी टेक्स्ट पर क्लिक करें, वह पढ़ा जाएगा।', stop: 'रोकें', nothing: 'यहाँ पढ़ने के लिए कुछ नहीं है।', novoice: 'इस भाषा की आवाज़ इस डिवाइस पर नहीं है, इसलिए डिफ़ॉल्ट आवाज़ का उपयोग हो रहा है।' }
    };
    return (T[this._lang()] || T.en)[key];
  },

  _pickVoice(lang) {
    if (!('speechSynthesis' in window)) return null;
    if (!this._voicesCache) this._voicesCache = window.speechSynthesis.getVoices() || [];
    const v = this._voicesCache, prefix = lang.split('-')[0].toLowerCase();
    const matches = v.filter(x => x.lang && x.lang.toLowerCase().replace('_', '-').startsWith(prefix));
    // prefer a voice that is stored on the device (works offline), then an exact region match
    return matches.find(x => x.localService && x.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) || matches.find(x => x.localService) || matches.find(x => x.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) || matches[0] || null;
  },

  // ---------------------------------------------------------------- speaking
  // Splits long text into short chunks: Chrome silently stops long utterances after ~15 seconds.
  _chunks(text) {
    const clean = text.replace(/\s+/g, ' ').trim();
    const parts = clean.match(/[^.!?।\n]+[.!?।]?/g) || [clean];
    const out = []; let cur = '';
    parts.forEach(p => {
      if ((cur + ' ' + p).length > 180 && cur) { out.push(cur.trim()); cur = p; } else cur += ' ' + p;
    });
    if (cur.trim()) out.push(cur.trim());
    return out.flatMap(c => c.length > 220 ? c.match(/.{1,200}(\s|$)/g).map(x => x.trim()).filter(Boolean) : [c]);
  },

  speak(text, opts) {
    opts = opts || {};
    if (!text || !text.trim() || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++this._token;           // callbacks from an older, cancelled utterance must not continue the queue
    this._queue = this._chunks(text);
    this._speaking = true;
    if (!opts.noHighlight && opts.el) this._highlight(opts.el);
    const lang = this._bcp47();
    const voice = this._pickVoice(lang);
    if (!voice && lang !== 'en-US' && !this._warnedVoice) { this._warnedVoice = true; this._toast(this._t('novoice'), 5000); }
    const next = () => {
      if (!this._speaking || token !== this._token) return;
      const chunk = this._queue.shift();
      if (!chunk) { this._speaking = false; this._clearHighlight(); return; }
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = lang; if (voice) u.voice = voice;
      u.rate = 0.95; u.pitch = 1;
      u.onend = next;
      u.onerror = () => { if (this._speaking && token === this._token) next(); };
      synth.speak(u);
    };
    // a short tick after cancel() avoids Chrome dropping the first utterance
    setTimeout(next, 30);
  },

  stop() {
    this._token++; this._speaking = false; this._queue = [];
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this._clearHighlight();
  },

  // Called by the rest of the app for status messages; speaks only when Voice Reader is ON
  announce(text) {
    const ariaBox = document.getElementById('a11y-live-announcer');
    if (ariaBox) ariaBox.innerText = text;
    if (this.settings.screenReaderNarration) this.speak(text, { noHighlight: true });
  },

  // ---------------------------------------------------------------- what to read
  _isInteractive(el) { return /^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL)$/.test(el.tagName) || el.getAttribute('role') === 'button'; },

  _labelFor(el) {
    const aria = el.getAttribute('aria-label'); if (aria) return aria;
    if (el.tagName === 'SELECT') {
      const opt = el.options[el.selectedIndex]; const lab = this._fieldLabel(el);
      return (lab ? lab + '. ' : '') + 'Dropdown. ' + (opt ? opt.text : '');
    }
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const lab = this._fieldLabel(el) || el.placeholder || el.name || '';
      const val = el.type === 'password' ? '' : el.value;
      return (lab ? lab + '. ' : '') + (el.type === 'checkbox' || el.type === 'radio' ? (el.checked ? 'checked' : 'not checked') : (val ? 'Contains ' + val : 'Empty text field'));
    }
    return '';
  },
  _fieldLabel(el) {
    if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) return l.innerText.trim(); }
    const wrap = el.closest('label'); if (wrap) return wrap.innerText.trim();
    const grp = el.closest('.form-group'); const l = grp && grp.querySelector('label'); return l ? l.innerText.trim() : '';
  },

  _visibleText(el) {
    // innerText respects hidden elements; ignore icon glyphs and the screen-reader announcer
    return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  },

  // Walks up from what was clicked to the closest sensible block of text
  _findReadable(target) {
    if (!target || target.nodeType !== 1) target = target && target.parentElement;
    if (!target) return null;
    if (target.closest('canvas, .leaflet-container, .maplibregl-map, .qg-offline-view, #a11y-live-announcer, .qg-reader-toast')) return null;

    const own = this._labelFor(target.closest('input, select, textarea') || target);
    if (own) { const f = target.closest('input, select, textarea'); return { el: f, text: own }; }

    let el = target;
    for (let i = 0; el && el !== document.body && i < 8; i++, el = el.parentElement) {
      const text = this._visibleText(el);
      if (!text) continue;
      const tag = el.tagName;
      const isBlock = /^(H[1-6]|P|LI|TD|TH|BUTTON|A|LABEL|SUMMARY|DT|DD|FIGCAPTION|BLOCKQUOTE|OPTION)$/.test(tag) || el.getAttribute('role') === 'button' || el.classList.contains('chat-msg');
      if (isBlock && text.length <= 900) return { el, text: this._withTitle(el, text) };
      // a plain container (div/span): accept it if it holds a short, self-contained piece of text
      if (text.length >= 12 && text.length <= 400) return { el, text };
      if (text.length > 400) {
        // too big to read in one go: read what was actually clicked, not the whole card
        const t0 = this._visibleText(target);
        if (t0) return { el: target, text: t0.length > 600 ? t0.slice(0, 600) : t0 };
        return null;
      }
    }
    const t = this._visibleText(target);
    return t ? { el: target, text: t } : null;
  },
  _withTitle(el, text) { return text; },

  // ---------------------------------------------------------------- events
  _bindReaderEvents() {
    if (this._bound) return; this._bound = true;

    // click / tap
    document.addEventListener('click', e => {
      if (!this.settings.screenReaderNarration) return;
      if (Date.now() < this._ignoreClickUntil) return;
      if (e.target.closest && e.target.closest('#a11y-btn-reader')) return;
      const sel = window.getSelection && window.getSelection().toString().trim();
      if (sel) return;   // a selection is read by the mouseup handler instead
      const hit = this._findReadable(e.target);
      if (hit && hit.text) this.speak(hit.text, { el: hit.el });
    }, true);

    // selected text: read exactly what was highlighted
    const readSelection = () => {
      if (!this.settings.screenReaderNarration) return;
      setTimeout(() => {
        const s = window.getSelection && window.getSelection();
        const txt = s ? s.toString().trim() : '';
        if (txt.length > 1) { this.speak(txt, { noHighlight: true }); }
      }, 60);
    };
    document.addEventListener('mouseup', readSelection, true);
    document.addEventListener('touchend', readSelection, true);

    // keyboard: reading the control that Tab lands on
    document.addEventListener('focusin', e => {
      if (!this.settings.screenReaderNarration || !document.body.classList.contains('user-is-tabbing')) return;
      const t = e.target; if (!t || t === document.body) return;
      const label = this._labelFor(t) || this._visibleText(t) || t.getAttribute('title') || '';
      if (label) this.speak(label, { el: t });
    });

    // Esc stops
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this._speaking) this.stop();
    });

    // leaving the page / switching language should not leave speech running
    window.addEventListener('beforeunload', () => this.stop());
  },

  setupKeyboardNavigation() {
    window.addEventListener('keydown', e => { if (e.key === 'Tab') document.body.classList.add('user-is-tabbing'); });
    window.addEventListener('mousedown', () => document.body.classList.remove('user-is-tabbing'));
  },

  // ---------------------------------------------------------------- visuals
  _highlight(el) {
    this._clearHighlight();
    if (!el || !el.classList) return;
    el.classList.add('qg-reading'); this._highlightEl = el;
  },
  _clearHighlight() {
    if (this._highlightEl) { this._highlightEl.classList.remove('qg-reading'); this._highlightEl = null; }
  },

  _toast(msg, ms) {
    const old = document.querySelector('.qg-reader-toast'); if (old) old.remove();
    if (!msg) return;
    const d = document.createElement('div'); d.className = 'qg-reader-toast'; d.setAttribute('role', 'status');
    const sp = document.createElement('span'); sp.textContent = msg; d.appendChild(sp);
    const b = document.createElement('button'); b.type = 'button'; b.textContent = this._t('stop');
    b.onclick = () => { this.stop(); d.remove(); };
    d.appendChild(b); document.body.appendChild(d);
    setTimeout(() => d.remove(), ms || 9000);
  }
};

// Expose module globally so `window.a11yAssistiveEngine` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.a11yAssistiveEngine = a11yAssistiveEngine;
