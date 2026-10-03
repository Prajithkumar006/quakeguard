/* ==========================================================================
   QuakeGuard - Off-Grid P2P Mesh Communication Engine (v3)
   BroadcastChannel relay (same-device tabs / demo) with TTL + hop tracking.

   v3 additions
   - Delivery receipts: every message shows Sending -> Sent -> Delivered to N
     (receivers send a tiny MSG_ACK back; ACKs are relayed multi-hop too)
   - Store-and-forward: undelivered messages are retried, and when a new
     device appears, recent help/urgent messages are shared with it
   - One-tap replies ("Received", "On my way", "Help is coming") that thread
     under the original message
   - Nicknames, live nearby-device list with last-seen, priority filters
   - Urgent alerts: banner + beep + vibration (+ OS notification if allowed)
   - Share my location (GPS coordinates) with a message
   - Flood/spam protection (rate limit + per-sender dedupe), safe escaping
   ========================================================================== */

const meshNetwork = {
  nodeId: (() => {
    let id = null;
    try { id = sessionStorage.getItem('quakeguard_mesh_node'); } catch (e) {}
    if (!id) {
      id = `NODE-${Math.floor(1000 + Math.random() * 9000)}`;
      try { sessionStorage.setItem('quakeguard_mesh_node', id); } catch (e) {}
    }
    return id;
  })(),
  nick: '',
  broadcastChannel: null,
  activePeers: new Map(),          // nodeId -> { seen:ms, nick }
  messageHistory: new Set(),       // seen packet ids (loop prevention)
  messages: [],
  priority: 'info',
  filter: 'all',
  lastSendAt: 0,
  pendingLoc: null,
  MAX_TTL: 6,
  PEER_TIMEOUT: 25000,
  RETRY_MS: 8000,
  MAX_RETRIES: 5,
  STORE_KEY: 'quakeguard_mesh_messages_v3',
  NICK_KEY: 'quakeguard_mesh_nick',

  PRIORITIES: {
    info:   { label: 'Info',   icon: 'fa-circle-info',          cls: 'mesh-p-info' },
    help:   { label: 'Help',   icon: 'fa-hand',                 cls: 'mesh-p-help' },
    urgent: { label: 'Urgent', icon: 'fa-triangle-exclamation', cls: 'mesh-p-urgent' }
  },
  QUICK: [
    { text: "I'm safe",                       p: 'info',   icon: 'fa-shield-heart' },
    { text: 'Need help - trapped',            p: 'urgent', icon: 'fa-person-falling' },
    { text: 'Medical help needed',            p: 'urgent', icon: 'fa-kit-medical' },
    { text: 'Road blocked / unsafe',          p: 'help',   icon: 'fa-road-barrier' },
    { text: 'Safe shelter with space here',   p: 'info',   icon: 'fa-house-chimney' }
  ],
  REPLIES: ['Received', 'On my way', 'Help is coming'],
  SAMPLES: [
    { id: 's1', sender: 'NODE-7421', nick: 'Medic Dave',    text: 'Setting up emergency first aid station at Central Park entrance.', hops: 1, offsetMin: 2, p: 'help', sample: true },
    { id: 's2', sender: 'NODE-3108', nick: 'Civilian Sara', text: 'Road blocked at 14th Ave by fallen power lines.',                   hops: 2, offsetMin: 5, p: 'info', sample: true }
  ],

  /* ---------- lifecycle ---------- */
  init() {
    if (this._started) { this.renderMeshUI(); return; }
    this._started = true;
    try { this.nick = (localStorage.getItem(this.NICK_KEY) || '').slice(0, 24); } catch (e) {}
    this.loadMessages();

    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('quakeguard_p2p_mesh');
      this.broadcastChannel.onmessage = (e) => this.handleIncomingMeshPacket(e.data);
    } else {
      // Fallback transport for browsers without BroadcastChannel: the
      // localStorage "storage" event also fires across same-device tabs.
      window.addEventListener('storage', (e) => {
        if (e.key === 'quakeguard_mesh_bus' && e.newValue) {
          try { this.handleIncomingMeshPacket(JSON.parse(e.newValue)); } catch (err) {}
        }
      });
    }
    this.ping();
    setInterval(() => this.ping(), 8000);
    setInterval(() => this.retryPending(), this.RETRY_MS);
    setInterval(() => { this.prunePeers(); this.renderMeshUI(true); }, 15000);
    window.addEventListener('online',  () => this.updatePeerCountUI());
    window.addEventListener('offline', () => this.updatePeerCountUI());
    window.addEventListener('pagehide', () => this.broadcastMeshPacket({ type: 'PEER_BYE', senderNode: this.nodeId, ttl: 1 }));

    this.renderComposer();
    this.renderMeshUI();
  },

  displayName(nodeId, nick) { return nick ? `${nick} (${nodeId})` : nodeId; },

  ping() { this.broadcastMeshPacket({ type: 'PEER_PING', senderNode: this.nodeId, nick: this.nick, ttl: 1 }); },

  prunePeers() {
    const now = Date.now();
    for (const [id, p] of this.activePeers) if (now - p.seen > this.PEER_TIMEOUT) this.activePeers.delete(id);
    this.updatePeerCountUI();
  },

  /* ---------- storage ---------- */
  loadMessages() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(this.STORE_KEY) || '[]'); } catch (e) {}
    const now = Date.now();
    const samples = this.SAMPLES.map(s => ({ ...s, ts: now - s.offsetMin * 60000 }));
    this.messages = saved.length ? saved : samples;
    this.messages.forEach(m => this.messageHistory.add(m.id));
  },
  saveMessages() {
    try { localStorage.setItem(this.STORE_KEY, JSON.stringify(this.messages.slice(0, 200))); } catch (e) {}
  },
  clearMessages() {
    this.messages = [];
    this.saveMessages();
    this.renderMeshUI();
  },

  /* ---------- networking ---------- */
  broadcastMeshPacket(packet) {
    const id = packet.packetId || `${packet.senderNode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const relay = !!packet._relay;
    if (this.messageHistory.has(id) && !relay && packet.type !== 'PEER_PING' && !packet._resend) return;
    this.messageHistory.add(id);
    packet.packetId = id;
    delete packet._relay;
    delete packet._resend;
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(packet); } catch (e) {}
    } else {
      try { localStorage.setItem('quakeguard_mesh_bus', JSON.stringify({ ...packet, _n: Math.random() })); } catch (e) {}
    }
    return id;
  },

  sendMeshMessage(presetText, presetPriority, opts) {
    opts = opts || {};
    const input = document.getElementById('mesh-msg-input');
    let text = (presetText || (input && input.value) || '').trim().slice(0, 280);
    if (!text) { if (input) input.focus(); return; }

    const nowMs = Date.now();
    if (nowMs - this.lastSendAt < 700) return;      // basic spam / double-tap guard
    this.lastSendAt = nowMs;

    const p = presetPriority || this.priority;
    const loc = opts.loc || (!presetText ? this.pendingLoc : null);
    const packet = {
      type: 'TEXT_MSG', senderNode: this.nodeId, nick: this.nick, text, p,
      ttl: this.MAX_TTL, hops: 0, ts: nowMs
    };
    if (loc) packet.loc = loc;
    if (opts.replyTo) packet.replyTo = opts.replyTo;

    const id = this.broadcastMeshPacket(packet);
    this.addMessage({
      id, sender: this.nodeId, nick: this.nick, mine: true, text, hops: 0, ts: nowMs, p,
      loc: loc || null, replyTo: opts.replyTo || null,
      acks: [], retries: 0, lastTry: nowMs
    });

    if (input && !presetText) { input.value = ''; this.updateCounter(); input.focus(); }
    if (!presetText) { this.pendingLoc = null; this.updateLocBtn(); }
  },

  replyTo(msgId, text) {
    const orig = this.messages.find(m => m.id === msgId);
    this.sendMeshMessage(text, orig && orig.p === 'urgent' ? 'help' : 'info', {
      replyTo: { id: msgId, sender: orig ? orig.sender : '', nick: orig ? orig.nick : '', text: orig ? orig.text.slice(0, 60) : '' }
    });
  },

  handleIncomingMeshPacket(packet) {
    if (!packet || typeof packet !== 'object' || packet.senderNode === this.nodeId) return;
    const nick = String(packet.nick || '').slice(0, 24);

    if (packet.type === 'PEER_PING') {
      const isNew = !this.activePeers.has(packet.senderNode);
      this.activePeers.set(packet.senderNode, { seen: Date.now(), nick });
      this.updatePeerCountUI();
      if (isNew) this.syncTo(packet.senderNode);
      return;
    }
    if (packet.type === 'PEER_BYE') {
      this.activePeers.delete(packet.senderNode);
      this.updatePeerCountUI();
      return;
    }

    if (packet.type === 'MSG_ACK') {
      if (!packet.packetId || this.messageHistory.has(packet.packetId)) return;
      this.messageHistory.add(packet.packetId);
      const m = this.messages.find(x => x.id === packet.ackFor && x.mine);
      if (m) {
        m.acks = m.acks || [];
        if (!m.acks.includes(packet.senderNode)) { m.acks.push(packet.senderNode); this.saveMessages(); this.renderMeshUI(true); }
      } else if (packet.ttl > 1) {
        this.broadcastMeshPacket({ ...packet, ttl: packet.ttl - 1, hops: (packet.hops || 0) + 1, _relay: true });
      }
      return;
    }

    if (packet.type === 'TEXT_MSG') {
      if (!packet.packetId || this.messageHistory.has(packet.packetId)) return;
      this.messageHistory.add(packet.packetId);
      this.activePeers.set(packet.senderNode, { seen: Date.now(), nick });

      const p = this.PRIORITIES[packet.p] ? packet.p : 'info';
      const msg = {
        id: packet.packetId, sender: String(packet.senderNode).slice(0, 20), nick, mine: false,
        text: String(packet.text || '').slice(0, 280),
        hops: packet.hops || 0, ts: packet.ts || Date.now(), p,
        loc: this.cleanLoc(packet.loc), replyTo: this.cleanReply(packet.replyTo)
      };
      this.addMessage(msg);

      // delivery receipt back to the original sender
      this.broadcastMeshPacket({
        type: 'MSG_ACK', senderNode: this.nodeId, nick: this.nick, ackFor: packet.packetId,
        ttl: this.MAX_TTL, hops: 0
      });

      if (packet.ttl > 1) {   // relay onward with updated TTL / hop count
        this.broadcastMeshPacket({ ...packet, ttl: packet.ttl - 1, hops: (packet.hops || 0) + 1, _relay: true });
      }
      if (p === 'urgent') this.alertUrgent(msg);
      else if (msg.replyTo && msg.replyTo.id && this.messages.some(x => x.id === msg.replyTo.id && x.mine)) this.softPing();
    }
  },

  cleanLoc(l) {
    if (!l || typeof l.lat !== 'number' || typeof l.lon !== 'number') return null;
    if (Math.abs(l.lat) > 90 || Math.abs(l.lon) > 180) return null;
    return { lat: Math.round(l.lat * 1e5) / 1e5, lon: Math.round(l.lon * 1e5) / 1e5 };
  },
  cleanReply(r) {
    if (!r || typeof r !== 'object') return null;
    return { id: String(r.id || '').slice(0, 80), sender: String(r.sender || '').slice(0, 20),
             nick: String(r.nick || '').slice(0, 24), text: String(r.text || '').slice(0, 60) };
  },

  /* ---------- store-and-forward ---------- */
  // Share recent help/urgent messages with a device we just discovered.
  syncTo(/* nodeId */) {
    const recent = this.messages.filter(m => !m.sample && (m.p !== 'info') && Date.now() - m.ts < 6 * 3600 * 1000).slice(0, 10);
    recent.forEach((m, i) => setTimeout(() => {
      this.broadcastMeshPacket({
        type: 'TEXT_MSG', senderNode: m.sender, nick: m.nick || '', text: m.text, p: m.p,
        ttl: Math.max(1, this.MAX_TTL - (m.hops || 0) - 1), hops: (m.hops || 0) + (m.mine ? 0 : 1),
        ts: m.ts, packetId: m.id, loc: m.loc || undefined, replyTo: m.replyTo || undefined, _resend: true
      });
    }, 250 * (i + 1)));
  },

  // Re-broadcast my own messages that nobody has confirmed yet.
  retryPending() {
    if (!this.activePeers.size) return;
    let changed = false;
    this.messages.forEach(m => {
      if (!m.mine || (m.acks && m.acks.length) || (m.retries || 0) >= this.MAX_RETRIES) return;
      if (Date.now() - (m.lastTry || m.ts) < this.RETRY_MS) return;
      m.retries = (m.retries || 0) + 1; m.lastTry = Date.now(); changed = true;
      this.broadcastMeshPacket({
        type: 'TEXT_MSG', senderNode: this.nodeId, nick: m.nick || '', text: m.text, p: m.p,
        ttl: this.MAX_TTL, hops: 0, ts: m.ts, packetId: m.id, loc: m.loc || undefined,
        replyTo: m.replyTo || undefined, _resend: true
      });
    });
    if (changed) { this.saveMessages(); this.renderMeshUI(true); }
  },

  addMessage(m) {
    this.messages.unshift(m);
    this.saveMessages();
    this.renderMeshUI();
  },

  /* ---------- alerts ---------- */
  beep(freqs) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this._ac = this._ac || new Ctx();
      let t = this._ac.currentTime;
      freqs.forEach(f => {
        const o = this._ac.createOscillator(), g = this._ac.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g); g.connect(this._ac.destination); o.start(t); o.stop(t + 0.2); t += 0.22;
      });
    } catch (e) {}
  },
  softPing() { this.beep([660]); },

  alertUrgent(msg) {
    this.flashUrgent();
    this.beep([880, 660, 880]);
    const b = document.getElementById('mesh-alert-banner');
    if (b) {
      b.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>URGENT</strong> from ${this.esc(this.displayName(msg.sender, msg.nick))}: ${this.esc(msg.text)}
        <button type="button" onclick="this.parentNode.style.display='none'" aria-label="Dismiss">&times;</button>`;
      b.style.display = 'flex';
      clearTimeout(this._bannerT);
      this._bannerT = setTimeout(() => { b.style.display = 'none'; }, 30000);
    }
    try {
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        new Notification('QuakeGuard - Urgent message', { body: msg.text });
      }
    } catch (e) {}
  },

  flashUrgent() {
    const el = document.getElementById('mesh-peer-count');
    if (el) { el.classList.add('mesh-flash'); setTimeout(() => el.classList.remove('mesh-flash'), 2500); }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  },

  /* ---------- UI helpers ---------- */
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  timeAgo(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 10) return 'Just now';
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return new Date(ts).toLocaleDateString();
  },

  updatePeerCountUI() {
    const el = document.getElementById('mesh-peer-count');
    if (el) {
      const n = this.activePeers.size;
      el.removeAttribute('data-i18n');
      el.className = 'badge mesh-status ' + (n > 0 ? 'badge-success' : 'badge-warning');
      el.innerHTML = n > 0
        ? `<span class="mesh-dot"></span> ${n} nearby device${n === 1 ? '' : 's'} connected`
        : `<span class="mesh-dot"></span> Searching for nearby devices...`;
    }
    const net = document.getElementById('mesh-net-state');
    if (net) net.innerHTML = navigator.onLine
      ? '<i class="fa-solid fa-wifi"></i> Internet available - mesh stays active as backup'
      : '<i class="fa-solid fa-plane"></i> Offline mode - messages relay device to device';
    this.renderPeers();
  },

  renderPeers() {
    const box = document.getElementById('mesh-peers');
    if (!box) return;
    const peers = [...this.activePeers.entries()].sort((a, b) => b[1].seen - a[1].seen);
    box.innerHTML = `<span class="mesh-peers-label"><i class="fa-solid fa-circle-nodes"></i> Nearby:</span>` +
      (peers.length
        ? peers.slice(0, 8).map(([id, p]) => `<span class="mesh-peer-chip" title="Last seen ${this.timeAgo(p.seen)}"><span class="mesh-dot"></span>${this.esc(this.displayName(id, p.nick))}</span>`).join('')
        : `<span class="mesh-peer-none">none yet - open QuakeGuard on another device or tab</span>`);
  },

  updateCounter() {
    const i = document.getElementById('mesh-msg-input'), c = document.getElementById('mesh-char-count');
    if (i && c) c.textContent = `${i.value.length}/280`;
  },

  setPriority(p) {
    this.priority = p;
    document.querySelectorAll('.mesh-prio-btn').forEach(b => b.classList.toggle('active', b.dataset.p === p));
  },

  setFilter(f) {
    this.filter = f;
    document.querySelectorAll('.mesh-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.f === f));
    this.renderMeshUI(true);
  },

  setNick(v) {
    this.nick = String(v || '').replace(/[<>]/g, '').trim().slice(0, 24);
    try { localStorage.setItem(this.NICK_KEY, this.nick); } catch (e) {}
    this.ping();
  },

  shareLocation() {
    const btn = document.getElementById('mesh-loc-btn');
    if (this.pendingLoc) { this.pendingLoc = null; this.updateLocBtn(); return; }
    if (!navigator.geolocation) { if (btn) btn.title = 'Location is not supported on this device'; return; }
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...'; }
    navigator.geolocation.getCurrentPosition(
      pos => { this.pendingLoc = this.cleanLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude }); if (btn) btn.disabled = false; this.updateLocBtn(); },
      () => { this.pendingLoc = null; if (btn) { btn.disabled = false; } this.updateLocBtn('Location unavailable'); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  },
  updateLocBtn(err) {
    const btn = document.getElementById('mesh-loc-btn');
    if (!btn) return;
    btn.classList.toggle('active', !!this.pendingLoc);
    btn.innerHTML = this.pendingLoc
      ? `<i class="fa-solid fa-location-dot"></i> Location attached (tap to remove)`
      : `<i class="fa-solid fa-location-crosshairs"></i> ${err || 'Attach my location'}`;
  },

  requestNotify() {
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
  },

  renderComposer() {
    const page = document.getElementById('page-mesh');
    if (page && !document.getElementById('mesh-alert-banner')) {
      const b = document.createElement('div');
      b.id = 'mesh-alert-banner'; b.className = 'mesh-alert-banner'; b.setAttribute('role', 'alert'); b.style.display = 'none';
      page.insertBefore(b, page.firstChild);
    }
    const box = document.getElementById('mesh-composer-extra');
    if (!box) return;
    box.innerHTML = `
      <div class="mesh-nick-row">
        <label for="mesh-nick-input"><i class="fa-solid fa-id-badge"></i> Your name</label>
        <input type="text" id="mesh-nick-input" class="form-control" maxlength="24" autocomplete="nickname"
               placeholder="Optional - shown to nearby people" value="${this.esc(this.nick)}"
               oninput="meshNetwork.setNick(this.value)" onfocus="meshNetwork.requestNotify()">
        <span class="mesh-node">${this.esc(this.nodeId)}</span>
      </div>
      <div class="mesh-quick">
        ${this.QUICK.map((q, i) => `<button type="button" class="mesh-chip ${this.PRIORITIES[q.p].cls}" onclick="meshNetwork.sendMeshMessage(meshNetwork.QUICK[${i}].text, meshNetwork.QUICK[${i}].p)"><i class="fa-solid ${q.icon}"></i> ${this.esc(q.text)}</button>`).join('')}
      </div>
      <div class="mesh-prio" role="group" aria-label="Message priority">
        ${Object.entries(this.PRIORITIES).map(([k, v]) => `<button type="button" data-p="${k}" class="mesh-prio-btn ${v.cls} ${k === this.priority ? 'active' : ''}" onclick="meshNetwork.setPriority('${k}')"><i class="fa-solid ${v.icon}"></i> ${v.label}</button>`).join('')}
        <button type="button" id="mesh-loc-btn" class="mesh-prio-btn mesh-loc-btn" onclick="meshNetwork.shareLocation()"><i class="fa-solid fa-location-crosshairs"></i> Attach my location</button>
        <span id="mesh-char-count" class="mesh-count">0/280</span>
      </div>`;

    const feed = document.getElementById('mesh-feed-container');
    if (feed && !document.getElementById('mesh-toolbar')) {
      const tb = document.createElement('div');
      tb.id = 'mesh-toolbar';
      tb.innerHTML = `
        <div id="mesh-peers" class="mesh-peers"></div>
        <div class="mesh-filters" role="group" aria-label="Filter messages">
          <button type="button" class="mesh-filter-btn active" data-f="all" onclick="meshNetwork.setFilter('all')">All</button>
          <button type="button" class="mesh-filter-btn" data-f="urgent" onclick="meshNetwork.setFilter('urgent')">Urgent</button>
          <button type="button" class="mesh-filter-btn" data-f="help" onclick="meshNetwork.setFilter('help')">Help</button>
          <button type="button" class="mesh-filter-btn" data-f="mine" onclick="meshNetwork.setFilter('mine')">Mine</button>
        </div>`;
      feed.parentNode.insertBefore(tb, feed);
    }
    this.updatePeerCountUI();
  },

  statusOf(m) {
    const n = (m.acks || []).length;
    if (n > 0) return { cls: 'ok',   icon: 'fa-check-double', text: `Delivered to ${n} device${n === 1 ? '' : 's'}` };
    if (!this.activePeers.size) return { cls: 'wait', icon: 'fa-clock', text: 'Waiting for a nearby device - will send automatically' };
    if ((m.retries || 0) >= this.MAX_RETRIES) return { cls: 'fail', icon: 'fa-circle-exclamation', text: 'No confirmation yet - nearby devices may be out of range' };
    return { cls: 'sent', icon: 'fa-check', text: 'Sent - waiting for confirmation' };
  },

  renderMeshUI() {
    this.updatePeerCountUI();
    const c = document.getElementById('mesh-feed-container');
    if (!c) return;
    let list = this.messages;
    if (this.filter === 'urgent') list = list.filter(m => m.p === 'urgent');
    else if (this.filter === 'help') list = list.filter(m => m.p === 'help');
    else if (this.filter === 'mine') list = list.filter(m => m.mine);
    // urgent first within the last 10 minutes, then newest first
    list = [...list].sort((a, b) => {
      const ua = a.p === 'urgent' && Date.now() - a.ts < 600000 ? 1 : 0;
      const ub = b.p === 'urgent' && Date.now() - b.ts < 600000 ? 1 : 0;
      return ub - ua || b.ts - a.ts;
    });

    if (!list.length) {
      c.innerHTML = `<div class="mesh-empty"><i class="fa-solid fa-tower-broadcast"></i><p>${this.messages.length ? 'No messages in this filter.' : 'No messages yet.'}</p><small>Messages from nearby devices will appear here.</small></div>`;
      return;
    }
    c.innerHTML = list.map(m => {
      const pr = this.PRIORITIES[m.p] || this.PRIORITIES.info;
      const name = m.mine ? 'You' : this.displayName(m.sender, m.nick);
      const initials = this.esc(m.mine ? 'ME' : ((m.nick && m.nick.trim()[0]) ? m.nick.trim().slice(0, 2).toUpperCase() : (String(m.sender).match(/\d{2}/) || ['??'])[0]));
      const hops = m.hops === 0 ? (m.mine ? 'Sent' : 'Direct') : `${m.hops} hop${m.hops === 1 ? '' : 's'}`;
      const st = m.mine ? this.statusOf(m) : null;
      const quote = m.replyTo && m.replyTo.id
        ? `<div class="mesh-quote"><i class="fa-solid fa-reply"></i> ${this.esc(this.displayName(m.replyTo.sender, m.replyTo.nick) || 'message')}: ${this.esc(m.replyTo.text)}</div>` : '';
      const loc = m.loc ? `<div class="mesh-loc"><i class="fa-solid fa-location-dot"></i> ${m.loc.lat}, ${m.loc.lon}
          <a href="https://www.openstreetmap.org/?mlat=${m.loc.lat}&amp;mlon=${m.loc.lon}#map=17/${m.loc.lat}/${m.loc.lon}" target="_blank" rel="noopener">map</a></div>` : '';
      const replies = (!m.mine && !m.sample)
        ? `<div class="mesh-replies">${this.REPLIES.map(r => `<button type="button" class="mesh-reply-btn" data-id="${this.esc(m.id)}" data-r="${this.esc(r)}">${this.esc(r)}</button>`).join('')}</div>` : '';
      return `
      <div class="mesh-msg ${m.mine ? 'mine' : ''} ${pr.cls}">
        <div class="mesh-avatar">${initials}</div>
        <div class="mesh-body">
          <div class="mesh-meta">
            <strong>${this.esc(name)}</strong>
            ${m.mine ? `<span class="mesh-node">${this.esc(this.nodeId)}</span>` : ''}
            <span class="mesh-time">${this.timeAgo(m.ts)}</span>
            ${m.sample ? '<span class="mesh-sample">sample</span>' : ''}
          </div>
          ${quote}
          <div class="mesh-text">${this.esc(m.text)}</div>
          ${loc}
          ${st ? `<div class="mesh-status-line mesh-st-${st.cls}"><i class="fa-solid ${st.icon}"></i> ${this.esc(st.text)}</div>` : ''}
          ${replies}
        </div>
        <div class="mesh-tags">
          ${m.p !== 'info' ? `<span class="mesh-prio-tag ${pr.cls}"><i class="fa-solid ${pr.icon}"></i> ${pr.label}</span>` : ''}
          <span class="badge badge-info mesh-hop"><i class="fa-solid fa-share-nodes"></i> ${hops}</span>
        </div>
      </div>`;
    }).join('');

    c.querySelectorAll('.mesh-reply-btn').forEach(b => {
      b.onclick = () => this.replyTo(b.dataset.id, b.dataset.r);
    });
  }
};

window.meshNetwork = meshNetwork;
