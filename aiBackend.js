/* ==========================================================================
   QuakeGuard - AI backend client
   Talks to the Python AI server (ai_server/). Everything here fails soft: if the
   server is unreachable or slow, callers get null and the built-in offline
   assistant answers instead. No API keys ever live in the browser.
   Server URL: window.QG_AI_URL, or localStorage 'qg_ai_url', or same origin
   (when the site is served by ai_server), or http://localhost:8000.
   ========================================================================== */
const aiBackend = {
  online: false,
  sessionId: 's' + Math.random().toString(36).slice(2) + Date.now().toString(36),
  _listeners: [],

  baseUrl() {
    if (window.QG_AI_URL) return window.QG_AI_URL;
    try { const u = localStorage.getItem('qg_ai_url'); if (u) return u; } catch (e) {}
    if (location.protocol.startsWith('http') && location.port === '8000') return location.origin;
    return 'http://localhost:8000';
  },

  onStatus(fn) { this._listeners.push(fn); fn(this.online); },
  _set(v) { if (v !== this.online) { this.online = v; this._listeners.forEach(f => f(v)); } },

  async _fetch(path, opts, ms) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    try { return await fetch(this.baseUrl() + path, { ...opts, signal: ctl.signal, cache: 'no-store' }); }
    finally { clearTimeout(timer); }
  },

  async ping() {
    try {
      const r = await this._fetch('/health', {}, 2500);
      const j = r.ok ? await r.json() : null;
      this._set(!!(j && j.ok));
    } catch (e) { this._set(false); }
    return this.online;
  },

  // -> {answer, intent, confidence, thoughts} or null when the AI server can't be used
  async ask(text) {
    if (!navigator.onLine) { this._set(false); return null; }
    try {
      const r = await this._fetch('/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500), session_id: this.sessionId, debug: true })
      }, 6000);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      this._set(true);
      return await r.json();
    } catch (e) { this._set(false); return null; }
  },

  feedback(text, answer, helpful) {
    this._fetch('/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, answer, helpful })
    }, 4000).catch(() => {});
  },

  start() {
    this.ping();
    setInterval(() => this.ping(), 30000);
    window.addEventListener('online', () => this.ping());
    window.addEventListener('offline', () => this._set(false));
  }
};
window.aiBackend = aiBackend;
