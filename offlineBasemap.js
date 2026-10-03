/* ==========================================================================
   QuakeGuard - Offline Basemap (flat map + 3D globe, no tiles, no libraries)

   Draws the world from data that ships inside the app (offlineGeo.js), so
   the map and the globe still render with no internet, no map tiles and
   even if Leaflet / MapLibre never loaded. Layers: earthquakes (historical
   catalogue + last saved live feed), shelters, hospitals, police/rescue, fire
   stations, fault lines, city names, your GPS position and a straight-line
   route to the nearest facility.

   Three entry points:
     offlineBasemap.mountFlat(containerId)    pan / zoom Web-Mercator map
     offlineBasemap.mountGlobe(containerId)   drag-to-rotate orthographic globe
     offlineBasemap.attachUnderlay(leafletMap) draws the outline *under* the
         Leaflet tile layers, so tiles that were never cached show land and
         sea instead of a blank grey square.

   When the app has been online once it also downloads Natural Earth country
   borders (world-atlas, ~100 KB) and keeps them in localStorage; after that
   the offline map shows borders and country names too.
   ========================================================================== */
(function () {
  'use strict';

  const G = window.OFFLINE_GEO || { land: {}, water: {}, cities: [], seas: [], continents: [] };
  const D2R = Math.PI / 180;
  const TAU = Math.PI * 2;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lonX = lon => (lon + 180) / 360;
  const mercY = lat => { const s = Math.sin(clamp(lat, -85.0511, 85.0511) * D2R); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
  const yToLat = y => Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) / D2R;
  const magColor = m => m >= 7.5 ? '#dc2626' : m >= 6 ? '#ef4444' : m >= 4.5 ? '#f97316' : '#3b82f6';
  const magRadius = m => clamp(3.5 + (Number(m) - 3) * 2.6, 4, 24);

  const COLORS = {
    ocean: '#0b1d3a', oceanDeep: '#071326', land: '#2f4f3f', landEdge: '#5b8f74', grid: 'rgba(148,163,184,0.10)',
    border: 'rgba(226,232,240,0.30)', label: 'rgba(226,232,240,0.92)', labelDim: 'rgba(148,163,184,0.55)', fault: '#f59e0b'
  };
  const FAC_STYLE = {
    shelter: { c: '#2563eb', t: 'S', name: 'Relief shelter' },
    hospital: { c: '#dc2626', t: 'H', name: 'Hospital' },
    police: { c: '#4f46e5', t: 'P', name: 'Police / rescue' },
    fire: { c: '#ea580c', t: 'F', name: 'Fire & rescue' }
  };

  // ------------------------------------------------------------------ geometry prep
  function prepRings(obj) {
    return Object.keys(obj).map(k => {
      const ring = obj[k];
      return {
        name: k,
        mx: ring.map(p => [lonX(p[0]), mercY(p[1])]),                                   // mercator unit coords for the flat map
        gl: ring.map(p => [p[0] * D2R, Math.sin(p[1] * D2R), Math.cos(p[1] * D2R)]),    // lon rad, sin lat, cos lat for the globe
        ll: ring
      };
    });
  }
  const BUILTIN = { land: prepRings(G.land), water: prepRings(G.water) };
  let REAL = null;   // { land: rings, borders: [{mx, gl, ll}], labels: [{n, lon, lat, a}] }

  function prepLine(ll) {
    return { mx: ll.map(p => [lonX(p[0]), mercY(p[1])]), gl: ll.map(p => [p[0] * D2R, Math.sin(p[1] * D2R), Math.cos(p[1] * D2R)]), ll };
  }

  // ------------------------------------------------------------------ real borders (TopoJSON)
  const REAL_KEY = 'qg_world_110m';
  const REAL_URLS = ['https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', 'https://unpkg.com/world-atlas@2/countries-110m.json'];
  const views = new Set();

  function decodeTopo(topo) {
    const tr = topo.transform;
    const arcs = topo.arcs.map(a => {
      let x = 0, y = 0;
      return a.map(p => {
        if (!tr) return [p[0], p[1]];
        x += p[0]; y += p[1];
        return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]];
      });
    });
    const arcPts = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
    const ring = idxs => { const out = []; idxs.forEach((i, k) => { const pts = arcPts(i); for (let j = k ? 1 : 0; j < pts.length; j++) out.push(pts[j]); }); return out; };
    const polys = g => (g.type === 'Polygon' ? [g.arcs.map(ring)] : g.type === 'MultiPolygon' ? g.arcs.map(p => p.map(ring)) : []);
    const geoms = o => (o.type === 'GeometryCollection' ? o.geometries : [o]);

    const landRings = [];
    geoms(topo.objects.land || { type: 'GeometryCollection', geometries: [] }).forEach(g => polys(g).forEach(p => p.forEach(r => landRings.push(r))));

    // interior borders = arcs shared by two countries; also collect label anchors
    const use = new Map(); const labels = [];
    const countAll = g => {
      const walk = a => Array.isArray(a) ? a.forEach(walk) : use.set(a < 0 ? ~a : a, (use.get(a < 0 ? ~a : a) || 0) + 1);
      if (g.arcs) walk(g.arcs);
    };
    const countries = topo.objects.countries ? geoms(topo.objects.countries) : [];
    countries.forEach(g => {
      countAll(g);
      let best = null, bestA = 0;
      polys(g).forEach(p => {
        const o = p[0]; let a = 0, cx = 0, cy = 0;
        for (let i = 0, n = o.length; i < n; i++) { const [x0, y0] = o[i], [x1, y1] = o[(i + 1) % n]; const f = x0 * y1 - x1 * y0; a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f; }
        a /= 2; if (Math.abs(a) > bestA && a !== 0) { bestA = Math.abs(a); best = [cx / (6 * a), cy / (6 * a)]; }
      });
      const nm = g.properties && g.properties.name;
      if (nm && best) labels.push({ n: nm, lon: best[0], lat: best[1], a: bestA });
    });
    const borders = [];
    use.forEach((n, i) => { if (n >= 2) borders.push(arcs[i]); });
    return { landRings, borders, labels };
  }

  function installReal(topo) {
    const d = decodeTopo(topo);
    if (!d.landRings.length) throw new Error('no land in topology');
    REAL = {
      land: prepRings(Object.fromEntries(d.landRings.map((r, i) => ['r' + i, r]))),
      borders: d.borders.map(prepLine),
      labels: d.labels
    };
    views.forEach(v => v.invalidate());
    document.dispatchEvent(new CustomEvent('qg-offline-basemap-upgraded'));
  }

  async function loadRealBorders() {
    try {
      const cached = localStorage.getItem(REAL_KEY);
      if (cached) { installReal(JSON.parse(cached)); }
    } catch (e) { /* ignore a corrupt copy; refetch below */ }
    if (REAL || !navigator.onLine) return !!REAL;
    for (const url of REAL_URLS) {
      try {
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000);
        const res = await fetch(url, { signal: ctl.signal }); clearTimeout(t);
        if (!res.ok) continue;
        const txt = await res.text(); const topo = JSON.parse(txt);
        installReal(topo);
        try { localStorage.setItem(REAL_KEY, txt); } catch (e) { /* quota: still usable this session */ }
        return true;
      } catch (e) { /* try next mirror */ }
    }
    return false;
  }

  // ------------------------------------------------------------------ data
  function readJSON(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function dataset() {
    const db = window.quakeDatabase || {};
    const feed = readJSON('qg_last_feed');
    return {
      quakes: db.historicalQuakes || [], recent: (feed && feed.quakes) || [], feedAt: feed && feed.savedAt,
      shelters: db.shelters || [], hospitals: db.hospitals || [], police: db.policeStations || [], fire: db.fireStations || [],
      faults: db.faultLines || [], pos: readJSON('qg_last_pos')
    };
  }
  function getPosition(force) {
    return new Promise(resolve => {
      const cached = () => readJSON('qg_last_pos');
      if (!navigator.geolocation) return resolve(cached());
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; resolve(cached()); } }, 7000);
      navigator.geolocation.getCurrentPosition(p => {
        if (done) return; done = true; clearTimeout(t);
        const o = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, t: Date.now() };
        try { localStorage.setItem('qg_last_pos', JSON.stringify(o)); } catch (e) {}
        resolve(o);
      }, () => { if (done) return; done = true; clearTimeout(t); resolve(cached()); }, { timeout: 6000, maximumAge: force ? 0 : 600000 });
    });
  }
  const hav = (a, b, c, d) => {
    const dLat = (c - a) * D2R, dLon = (d - b) * D2R;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * D2R) * Math.cos(c * D2R) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };
  const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  const bearing = (a, b, c, d) => {
    const y = Math.sin((d - b) * D2R) * Math.cos(c * D2R), x = Math.cos(a * D2R) * Math.sin(c * D2R) - Math.sin(a * D2R) * Math.cos(c * D2R) * Math.cos((d - b) * D2R);
    return COMPASS[Math.round(((Math.atan2(y, x) / D2R + 360) % 360) / 45) % 8];
  };
  const ago = ms => { const m = Math.max(1, Math.round((Date.now() - ms) / 60000)); return m < 90 ? m + ' min' : m < 2880 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' days'; };

  // ------------------------------------------------------------------ base view
  class BaseView {
    constructor(container, opts) {
      this.el = typeof container === 'string' ? document.getElementById(container) : container;
      if (!this.el) throw new Error('offlineBasemap: container not found');
      this.opts = opts || {};
      this.layers = Object.assign({ quakes: true, recent: true, shelters: true, hospitals: true, police: false, fire: false, faults: true, cities: true, borders: true }, this.opts.layers || {});
      this.markers = []; this.route = null; this.userPos = null; this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this._raf = null; this._anim = null; this.w = 0; this.h = 0; this.popup = null;
      this.el.innerHTML = '';
      if (getComputedStyle(this.el).position === 'static') this.el.style.position = 'relative'; this.el.style.overflow = 'hidden'; this.el.style.touchAction = 'none'; this.el.style.userSelect = 'none';
      this.el.classList.add('qg-offline-view');
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;';
      this.el.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.ui = document.createElement('div');
      this.ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-family:Inter,system-ui,sans-serif;';
      this.el.appendChild(this.ui);
      views.add(this);
      this._ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.resize()) : null;
      if (this._ro) this._ro.observe(this.el); else window.addEventListener('resize', this._onWinResize = () => this.resize());
    }

    _btn(label, title, fn, extra) {
      const b = document.createElement('button');
      b.type = 'button'; b.innerHTML = label; b.title = title || '';
      b.style.cssText = 'pointer-events:auto;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.82);color:#e2e8f0;border-radius:8px;min-width:32px;height:32px;padding:0 9px;font:600 12px Inter,system-ui,sans-serif;backdrop-filter:blur(4px);' + (extra || '');
      b.addEventListener('click', e => { e.stopPropagation(); fn(); });
      b.addEventListener('pointerdown', e => e.stopPropagation());
      return b;
    }

    _buildUI(zoomable) {
      const chips = document.createElement('div');
      chips.style.cssText = 'position:absolute;left:10px;top:10px;right:60px;display:flex;flex-wrap:wrap;gap:6px;';
      const defs = [['quakes', 'Quakes'], ['shelters', 'Shelters'], ['hospitals', 'Hospitals'], ['police', 'Police'], ['fire', 'Fire'], ['faults', 'Faults'], ['cities', 'Cities']];
      this.chipEls = {};
      defs.forEach(([k, label]) => {
        const b = this._btn(label, 'Show or hide ' + label.toLowerCase(), () => { this.setLayer(k, !this.layers[k]); }, 'height:26px;min-width:0;font-size:11px;');
        this.chipEls[k] = b; chips.appendChild(b);
      });
      this.ui.appendChild(chips);
      const ctr = document.createElement('div');
      ctr.style.cssText = 'position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;';
      zoomable.forEach(z => ctr.appendChild(this._btn(z.label, z.title, z.fn)));
      this.ui.appendChild(ctr);
      this.status = document.createElement('div');
      this.status.style.cssText = 'position:absolute;left:10px;bottom:8px;max-width:70%;font:600 11px Inter,system-ui,sans-serif;color:#cbd5e1;background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.25);border-radius:8px;padding:4px 8px;pointer-events:none;';
      this.ui.appendChild(this.status);
      this.panel = document.createElement('div');
      this.panel.style.cssText = 'position:absolute;right:10px;bottom:8px;max-width:46%;display:none;font:500 12px Inter,system-ui,sans-serif;color:#e2e8f0;background:rgba(15,23,42,.9);border:1px solid rgba(148,163,184,.35);border-radius:10px;padding:8px 10px;pointer-events:auto;line-height:1.45;';
      this.ui.appendChild(this.panel);
      this._refreshChips();
    }

    _refreshChips() {
      Object.keys(this.chipEls || {}).forEach(k => {
        const on = !!this.layers[k]; const b = this.chipEls[k];
        b.style.background = on ? 'rgba(37,99,235,.85)' : 'rgba(15,23,42,.82)'; b.style.color = on ? '#fff' : '#94a3b8';
      });
    }
    setLayer(k, on) { this.layers[k] = !!on; this._refreshChips(); this.invalidate(); }
    setMinMag(m) { this.minMag = Number(m) || 0; this.invalidate(); }

    _statusText() {
      const d = dataset();
      return 'Offline map \u00b7 ' + (REAL ? 'country borders' : 'simplified outline') + (d.feedAt ? ' \u00b7 live feed saved ' + ago(d.feedAt) + ' ago' : '');
    }

    resize() {
      const r = this.el.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return;
      this.w = w; this.h = h;
      this.canvas.width = Math.round(w * this.dpr); this.canvas.height = Math.round(h * this.dpr);
      this._onResize && this._onResize();
      this.invalidate();
    }

    invalidate() { if (!this._raf) this._raf = requestAnimationFrame(t => { this._raf = null; this._frame(t); }); }
    _frame() {
      if (!this.w) { this.resize(); if (!this.w) return; }
      this.status.textContent = this._statusText();
      this.draw();
    }

    animate(duration, step) {
      if (this._anim) cancelAnimationFrame(this._anim);
      const t0 = performance.now();
      const run = now => {
        const k = clamp((now - t0) / duration, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        step(e); this.invalidate();
        if (k < 1) this._anim = requestAnimationFrame(run); else this._anim = null;
      };
      this._anim = requestAnimationFrame(run);
    }

    showPopup(x, y, html) {
      this.hidePopup();
      const p = document.createElement('div');
      p.style.cssText = 'position:absolute;pointer-events:auto;min-width:170px;max-width:260px;background:#fff;color:#0f172a;border-radius:10px;padding:9px 11px;box-shadow:0 8px 26px rgba(0,0,0,.45);font:500 12px Inter,system-ui,sans-serif;line-height:1.4;z-index:5;';
      p.innerHTML = html + '<div style="position:absolute;right:7px;top:4px;cursor:pointer;color:#64748b;font-size:15px" data-x>&times;</div>';
      this.el.appendChild(p);
      const pw = p.offsetWidth, ph = p.offsetHeight;
      p.style.left = clamp(x - pw / 2, 6, this.w - pw - 6) + 'px'; p.style.top = clamp(y - ph - 14, 6, this.h - ph - 6) + 'px';
      p.querySelector('[data-x]').addEventListener('click', () => this.hidePopup());
      p.addEventListener('pointerdown', e => e.stopPropagation());
      this.popup = p;
    }
    hidePopup() { if (this.popup) { this.popup.remove(); this.popup = null; } }

    popupHTML(m) {
      const d = m.d;
      if (m.type === 'quake' || m.type === 'recent') {
        const col = magColor(d.mag);
        return `<div style="font-weight:800;color:${col};font-size:14px">M ${Number(d.mag).toFixed(1)} earthquake${m.type === 'recent' ? ' <span style="font-size:10px;color:#0891b2">(saved live feed)</span>' : ''}</div>` +
          `<div style="font-weight:700;margin:3px 0">${esc(d.place)}</div><div style="color:#475569">Depth ${esc(d.depth == null ? '?' : Math.round(d.depth * 10) / 10)} km${d.year ? ' \u00b7 ' + esc(d.year) : d.time ? ' \u00b7 ' + esc(new Date(d.time).toLocaleString()) : ''}</div>` +
          (d.casualties ? `<div style="color:#dc2626;font-weight:700;margin-top:2px">${esc(d.casualties)}</div>` : '') + (d.tsunami && !/^no/i.test(d.tsunami) ? `<div style="color:#2563eb;font-weight:700">Tsunami: ${esc(d.tsunami)}</div>` : '');
      }
      if (m.type === 'user') return '<div style="font-weight:800;color:#2563eb">Your last known position</div><div style="color:#475569">' + d.lat.toFixed(4) + ', ' + d.lng.toFixed(4) + '</div>';
      const st = FAC_STYLE[m.type];
      const extra = d.capacity || d.traumaLevel || d.units || d.trucks || '';
      const phone = d.phone || d.helpline || '';
      let km = '';
      if (this.userPos) km = `<div style="margin-top:3px;font-weight:700">${hav(this.userPos.lat, this.userPos.lng, d.lat, d.lng).toFixed(1)} km ${bearing(this.userPos.lat, this.userPos.lng, d.lat, d.lng)} of you</div>`;
      return `<div style="font-weight:800;color:${st.c}">${esc(st.name)}</div><div style="font-weight:700;margin:3px 0">${esc(d.name)}</div><div style="color:#475569">${esc(d.city || '')}</div>` +
        (extra ? `<div>${esc(extra)}</div>` : '') + (phone ? `<div>&#9742; ${esc(phone)}</div>` : '') + km;
    }

    _bindPointer(opts) {
      const c = this.canvas; const pts = new Map(); let moved = 0, downT = 0, last = null, pinch = null;
      c.addEventListener('pointerdown', e => {
        c.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
        moved = 0; downT = performance.now(); last = { x: e.offsetX, y: e.offsetY }; c.style.cursor = 'grabbing';
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
        opts.onDown && opts.onDown();
      });
      c.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) { const hit = this.hit(e.offsetX, e.offsetY); c.style.cursor = hit ? 'pointer' : 'grab'; return; }
        pts.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
        if (pts.size === 2) {
          const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinch) opts.onZoom((a.x + b.x) / 2, (a.y + b.y) / 2, Math.log2(d / pinch)); pinch = d; moved = 99; return;
        }
        const dx = e.offsetX - last.x, dy = e.offsetY - last.y; moved += Math.abs(dx) + Math.abs(dy);
        last = { x: e.offsetX, y: e.offsetY };
        if (moved > 4) { this.hidePopup(); opts.onDrag(dx, dy); }
      });
      const up = e => {
        if (!pts.has(e.pointerId)) return;
        pts.delete(e.pointerId); pinch = null; c.style.cursor = 'grab';
        if (moved <= 5 && performance.now() - downT < 600 && pts.size === 0) {
          const hit = this.hit(e.offsetX, e.offsetY);
          if (hit) this.showPopup(hit.x, hit.y, this.popupHTML(hit)); else this.hidePopup();
        }
        opts.onUp && opts.onUp();
      };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      c.addEventListener('wheel', e => { e.preventDefault(); opts.onZoom(e.offsetX, e.offsetY, -e.deltaY * (e.deltaMode ? 0.05 : 0.0016)); }, { passive: false });
      c.addEventListener('dblclick', e => opts.onZoom(e.offsetX, e.offsetY, 1));
    }

    hit(x, y) {
      let best = null, bd = 1e9;
      for (let i = this.markers.length - 1; i >= 0; i--) {
        const m = this.markers[i]; const d = Math.hypot(m.x - x, m.y - y);
        if (d <= m.r + 6 && d < bd) { best = m; bd = d; }
      }
      return best;
    }

    // collect markers for the current frame; project(lon,lat) -> [x,y] or null if hidden
    _collectMarkers(project, sizeScale) {
      const d = dataset(); this.userPos = d.pos; const out = [];
      const L = this.layers; const s = sizeScale || 1;
      const fac = (arr, key, on) => { if (on) arr.forEach(f => { const p = project(f.lng, f.lat); if (p) out.push({ type: key, x: p[0], y: p[1], r: 9, d: f, k: p[2] }); }); };
      fac(d.shelters, 'shelter', L.shelters); fac(d.hospitals, 'hospital', L.hospitals); fac(d.police, 'police', L.police); fac(d.fire, 'fire', L.fire);
      const mm = this.minMag || 0;
      if (L.quakes) d.quakes.filter(q => q.mag >= mm).forEach(q => { const p = project(q.lng, q.lat); if (p) out.push({ type: 'quake', x: p[0], y: p[1], r: magRadius(q.mag) * s, d: q, k: p[2] }); });
      if (L.recent) d.recent.filter(q => q.mag >= mm).forEach(q => { const p = project(q.lng, q.lat); if (p) out.push({ type: 'recent', x: p[0], y: p[1], r: magRadius(q.mag) * s, d: q, k: p[2] }); });
      if (d.pos) { const p = project(d.pos.lng, d.pos.lat); if (p) out.push({ type: 'user', x: p[0], y: p[1], r: 8, d: d.pos, k: p[2] }); }
      return out;
    }

    _drawMarker(m) {
      const ctx = this.ctx; const k = m.k == null ? 1 : m.k;
      if (m.type === 'quake' || m.type === 'recent') {
        const col = magColor(m.d.mag);
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 1.55, 0, TAU); ctx.fillStyle = col + '30'; ctx.fill();
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fillStyle = col + 'cc'; ctx.fill();
        ctx.lineWidth = m.type === 'recent' ? 2.5 : 1.5; ctx.strokeStyle = m.type === 'recent' ? '#22d3ee' : 'rgba(255,255,255,.9)'; ctx.stroke();
      } else if (m.type === 'user') {
        ctx.beginPath(); ctx.arc(m.x, m.y, 14, 0, TAU); ctx.fillStyle = 'rgba(37,99,235,.22)'; ctx.fill();
        ctx.beginPath(); ctx.arc(m.x, m.y, 6.5, 0, TAU); ctx.fillStyle = '#2563eb'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
      } else {
        const st = FAC_STYLE[m.type]; const sz = 17 * (0.8 + 0.2 * k);
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(m.x - sz / 2, m.y - sz / 2, sz, sz, 4) : ctx.rect(m.x - sz / 2, m.y - sz / 2, sz, sz);
        ctx.fillStyle = st.c; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '800 ' + Math.round(sz * 0.62) + 'px Inter,system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(st.t, m.x, m.y + 0.5);
      }
    }

    // straight-line route to the nearest facility of a kind (works with the saved GPS position)
    async routeToNearest(kind) {
      const key = { shelter: 'shelters', hospital: 'hospitals', police: 'police', fire: 'fire' }[kind] || 'shelters';
      const pos = await getPosition(true);
      this.panel.style.display = 'block';
      if (!pos) { this.panel.innerHTML = 'I could not get your location. Allow location access for this site (GPS works without internet).'; return null; }
      const list = dataset()[key];
      if (!list.length) return null;
      const best = list.map(f => ({ f, km: hav(pos.lat, pos.lng, f.lat, f.lng) })).sort((a, b) => a.km - b.km)[0];
      this.layers[key] = true; this._refreshChips();
      this.route = { from: pos, to: best.f, kind };
      this.panel.innerHTML = `<b style="color:${FAC_STYLE[kind].c}">Nearest ${FAC_STYLE[kind].name.toLowerCase()}</b><br>${esc(best.f.name)}<br>${best.km.toFixed(1)} km ${bearing(pos.lat, pos.lng, best.f.lat, best.f.lng)} (straight line, not road distance)` +
        (best.f.phone || best.f.helpline ? '<br>&#9742; ' + esc(best.f.phone || best.f.helpline) : '') + '<div style="margin-top:4px;color:#94a3b8;font-size:11px;cursor:pointer" data-clear>Clear route</div>';
      this.panel.querySelector('[data-clear]').onclick = () => { this.route = null; this.panel.style.display = 'none'; this.invalidate(); };
      this.focusOn(pos, best.f);
      this.invalidate();
      return best;
    }

    destroy() {
      views.delete(this);
      if (this._raf) cancelAnimationFrame(this._raf); if (this._anim) cancelAnimationFrame(this._anim);
      if (this._spinRaf) cancelAnimationFrame(this._spinRaf);
      if (this._ro) this._ro.disconnect(); else window.removeEventListener('resize', this._onWinResize);
      this.el.innerHTML = ''; this.el.classList.remove('qg-offline-view');
    }
  }

  // ------------------------------------------------------------------ flat (web-mercator) map
  class FlatView extends BaseView {
    constructor(container, opts) {
      super(container, opts);
      const o = this.opts;
      this.z = o.zoom != null ? o.zoom : 2; this.cx = lonX(o.lng != null ? o.lng : 20); this.cy = mercY(o.lat != null ? o.lat : 22);
      this._buildUI([
        { label: '+', title: 'Zoom in', fn: () => this.zoomBy(1) }, { label: '&minus;', title: 'Zoom out', fn: () => this.zoomBy(-1) },
        { label: '&#8962;', title: 'Reset to world view', fn: () => this.flyTo(22, 20, 2) },
        { label: '&#9678;', title: 'Go to my location', fn: () => this.goToMe() },
        { label: 'S', title: 'Route to nearest shelter', fn: () => this.routeToNearest('shelter') },
        { label: 'H', title: 'Route to nearest hospital', fn: () => this.routeToNearest('hospital') }
      ]);
      this._bindPointer({
        onDrag: (dx, dy) => { const W = this._W(); this.cx -= dx / W; this.cy = clamp(this.cy - dy / W, 0.02, 0.98); this.invalidate(); },
        onZoom: (x, y, dz) => this.zoomAt(x, y, dz)
      });
      this.resize();
    }
    _W() { return 256 * Math.pow(2, this.z); }
    _minZ() { return Math.max(0.8, Math.log2(Math.max(this.h, 200) / 256)); }
    _onResize() { this.z = clamp(this.z, this._minZ(), 12); }
    lonLatAt(x, y) { const W = this._W(); return [(this.cx + (x - this.w / 2) / W) * 360 - 180, yToLat(this.cy + (y - this.h / 2) / W)]; }
    zoomAt(x, y, dz) {
      const [lon, lat] = this.lonLatAt(x, y); const nz = clamp(this.z + dz, this._minZ(), 12);
      if (nz === this.z) return; this.z = nz; const W = this._W();
      this.cx = lonX(lon) - (x - this.w / 2) / W; this.cy = clamp(mercY(lat) - (y - this.h / 2) / W, 0.02, 0.98); this.invalidate();
    }
    zoomBy(dz) { this.zoomAt(this.w / 2, this.h / 2, dz); }
    setView(lat, lng, z) { this.cx = lonX(lng); this.cy = mercY(lat); if (z != null) this.z = clamp(z, this._minZ(), 12); this.invalidate(); }
    flyTo(lat, lng, z) {
      let tx = lonX(lng); const fx = this.cx, fy = this.cy, fz = this.z; const ty = mercY(lat), tz = clamp(z == null ? this.z : z, this._minZ(), 12);
      tx = tx + Math.round(fx - tx);   // shortest way round the world
      this.animate(900, e => { this.cx = fx + (tx - fx) * e; this.cy = fy + (ty - fy) * e; this.z = fz + (tz - fz) * e; });
    }
    flyToLocation(lng, lat, z, name) { this.flyTo(lat, lng, z); if (name) { const t = document.getElementById('globe-target-title'); if (t) t.innerText = name; } }
    async goToMe() { const p = await getPosition(true); if (p) { this.flyTo(p.lat, p.lng, Math.max(this.z, 8)); this.invalidate(); } }
    focusOn(a, b) {
      const w = Math.abs(lonX(a.lng) - lonX(b.lng)) || 0.0005, h = Math.abs(mercY(a.lat) - mercY(b.lat)) || 0.0005;
      const z = clamp(Math.log2(Math.min(this.w / (w * 256 * 2.6), this.h / (h * 256 * 2.6))), this._minZ(), 11);
      this.flyTo((a.lat + b.lat) / 2, (a.lng + b.lng) / 2, z);
    }

    draw() {
      const ctx = this.ctx, w = this.w, h = this.h, W = this._W(), z = this.z;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = COLORS.ocean; ctx.fillRect(0, 0, w, h);
      const ox = w / 2 - this.cx * W, oy = h / 2 - this.cy * W;   // screen position of lon -180 / lat max at this zoom
      const kMin = Math.floor(-ox / W) - 1, kMax = Math.ceil((w - ox) / W);

      // graticule
      const step = z < 2.5 ? 30 : z < 4 ? 15 : z < 5.5 ? 10 : z < 7 ? 5 : z < 9 ? 2 : 1;
      ctx.lineWidth = 1; ctx.strokeStyle = COLORS.grid; ctx.beginPath();
      for (let lon = -180 + (kMin * 360); lon <= 180 + kMax * 360; lon += step) { const x = Math.round(ox + (lon + 180) / 360 * W) + .5; if (x < -2 || x > w + 2) continue; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let lat = -80; lat <= 80; lat += step) { const y = Math.round(oy + mercY(lat) * W) + .5; if (y < -2 || y > h + 2) continue; ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // land (+ lakes), repeated across world copies
      const land = REAL ? REAL.land : BUILTIN.land, water = REAL ? [] : BUILTIN.water;
      const fill = (rings, color, edge) => {
        ctx.fillStyle = color; ctx.strokeStyle = edge || 'transparent'; ctx.lineWidth = 1;
        for (let k = kMin; k <= kMax; k++) {
          const bx = ox + k * W;
          if (bx > w || bx + W * 1.06 < 0) continue;
          ctx.beginPath();
          for (const r of rings) {
            const p = r.mx; let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
            for (let i = 0; i < p.length; i++) { const x = p[i][0], y = p[i][1]; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
            if (bx + maxX * W < -4 || bx + minX * W > w + 4 || oy + maxY * W < -4 || oy + minY * W > h + 4) continue;
            ctx.moveTo(bx + p[0][0] * W, oy + p[0][1] * W);
            for (let i = 1; i < p.length; i++) ctx.lineTo(bx + p[i][0] * W, oy + p[i][1] * W);
            ctx.closePath();
          }
          ctx.fill(); if (edge) ctx.stroke();
        }
      };
      fill(land, COLORS.land, COLORS.landEdge);
      if (water.length) fill(water, COLORS.ocean, COLORS.landEdge);

      // country borders (only after real data has been saved)
      if (REAL && this.layers.borders) {
        ctx.strokeStyle = COLORS.border; ctx.lineWidth = 0.8; ctx.beginPath();
        for (let k = kMin; k <= kMax; k++) {
          const bx = ox + k * W; if (bx > w || bx + W < 0) continue;
          for (const l of REAL.borders) { const p = l.mx; ctx.moveTo(bx + p[0][0] * W, oy + p[0][1] * W); for (let i = 1; i < p.length; i++) ctx.lineTo(bx + p[i][0] * W, oy + p[i][1] * W); }
        }
        ctx.stroke();
      }

      // fault lines
      const d = dataset();
      if (this.layers.faults) {
        ctx.strokeStyle = COLORS.fault; ctx.lineWidth = 2.2; ctx.setLineDash([7, 5]);
        for (let k = kMin; k <= kMax; k++) {
          const bx = ox + k * W; ctx.beginPath();
          d.faults.forEach(f => f.coords.forEach((c, i) => { const x = bx + lonX(c[1]) * W, y = oy + mercY(c[0]) * W; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }));
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // labels
      const taken = []; const place = (txt, x, y, font, color, align) => {
        ctx.font = font; const tw = ctx.measureText(txt).width; const rx = align === 'center' ? x - tw / 2 : x;
        const r = [rx - 2, y - 8, rx + tw + 2, y + 8];
        if (r[2] < 0 || r[0] > w || r[3] < 0 || r[1] > h) return false;
        for (const t of taken) if (!(r[2] < t[0] || r[0] > t[2] || r[3] < t[1] || r[1] > t[3])) return false;
        taken.push(r); ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(7,19,38,.85)'; ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y); return true;
      };
      const kx = (lon, k) => ox + k * W + lonX(lon) * W, ky = lat => oy + mercY(lat) * W;
      if (z < 3.4) G.continents.forEach(([n, lon, lat]) => { for (let k = kMin; k <= kMax; k++) place(n.split('').join(z < 2.2 ? ' ' : ''), kx(lon, k), ky(lat), '700 ' + (z < 2.2 ? 10 : 12) + 'px Inter,system-ui,sans-serif', COLORS.labelDim, 'center'); });
      if (z < 4.6) G.seas.forEach(([n, lon, lat]) => { for (let k = kMin; k <= kMax; k++) place(n, kx(lon, k), ky(lat), 'italic 600 10px Inter,system-ui,sans-serif', 'rgba(125,170,230,.55)', 'center'); });
      if (REAL && z >= 2.6 && z < 7) REAL.labels.slice().sort((a, b) => b.a - a.a).forEach(c => { if (z < 3.4 && c.a < 60) return; for (let k = kMin; k <= kMax; k++) place(c.n, kx(c.lon, k), ky(c.lat), '600 ' + (z < 4 ? 10 : 11) + 'px Inter,system-ui,sans-serif', COLORS.labelDim, 'center'); });

      // markers
      const mk = []; this.markers = mk;
      const proj = (lon, lat) => { for (let k = kMin; k <= kMax; k++) { const x = kx(lon, k), y = ky(lat); if (x > -30 && x < w + 30 && y > -30 && y < h + 30) return [x, y, 1]; } return null; };
      const recs = this._collectMarkers(proj, 1);
      const order = { quake: 1, recent: 2, shelter: 3, hospital: 3, police: 3, fire: 3, user: 4 };
      recs.sort((a, b) => (order[a.type] - order[b.type]) || (b.r - a.r));
      // route
      if (this.route) {
        const a = proj(this.route.from.lng, this.route.from.lat), b = proj(this.route.to.lng, this.route.to.lat);
        if (a && b) { ctx.strokeStyle = FAC_STYLE[this.route.kind].c; ctx.lineWidth = 3.5; ctx.setLineDash([2, 7]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt'; }
      }
      recs.forEach(m => { mk.push(m); this._drawMarker(m); });
      if (this.layers.cities) {
        const maxRank = z < 2.6 ? 1 : z < 4.2 ? 2 : 3; const minZ = { 1: 1.6, 2: 3.2, 3: 4.6 };
        G.cities.forEach(([n, lon, lat, rank]) => {
          if (rank > maxRank || z < minZ[rank]) return;
          const p = proj(lon, lat); if (!p) return;
          ctx.beginPath(); ctx.arc(p[0], p[1], rank === 1 ? 2.8 : 2.2, 0, TAU); ctx.fillStyle = '#f8fafc'; ctx.fill();
          place(n, p[0] + 6, p[1], (rank === 1 ? '700 ' : '600 ') + '11px Inter,system-ui,sans-serif', COLORS.label, 'left');
        });
      }
      // facility names when zoomed in
      if (z >= 6) mk.forEach(m => { if (FAC_STYLE[m.type]) place(m.d.name.replace(/ \(.*$/, ''), m.x + 12, m.y, '600 10px Inter,system-ui,sans-serif', '#bfdbfe', 'left'); });

      // scale bar
      const mpp = 40075016.686 * Math.cos(yToLat(this.cy) * D2R) / W; const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
      let km = nice[0]; for (const n of nice) { if (n * 1000 / mpp < 120) km = n; }
      const len = km * 1000 / mpp;
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w - 16 - len, h - 34); ctx.lineTo(w - 16 - len, h - 28); ctx.lineTo(w - 16, h - 28); ctx.lineTo(w - 16, h - 34); ctx.stroke();
      ctx.fillStyle = '#e2e8f0'; ctx.font = '600 10px Inter,system-ui,sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(km + ' km', w - 16, h - 36);
      this.panel.style.bottom = '44px';
    }
  }

  // ------------------------------------------------------------------ globe (orthographic)
  class GlobeView extends BaseView {
    constructor(container, opts) {
      super(container, opts);
      const o = this.opts;
      this.lon0 = o.lng != null ? o.lng : 78; this.lat0 = o.lat != null ? o.lat : 18; this.f = o.zoom != null ? o.zoom : 1;
      this.spinning = o.spin !== false; this.interacting = false; this._resumeT = null; this._last = 0;
      this.stars = []; let s = 7; for (let i = 0; i < 160; i++) { s = (s * 16807) % 2147483647; const a = s / 2147483647; s = (s * 16807) % 2147483647; const b = s / 2147483647; s = (s * 16807) % 2147483647; this.stars.push([a, b, 0.4 + (s / 2147483647) * 1.2]); }
      this.spinBtn = this._btn(this.spinning ? '&#10074;&#10074;' : '&#9654;', 'Pause / resume auto-rotation', () => this.toggleSpin());
      this._buildUI([
        { label: '+', title: 'Zoom in', fn: () => this.zoomAt(0, 0, 0.6) }, { label: '&minus;', title: 'Zoom out', fn: () => this.zoomAt(0, 0, -0.6) },
        { label: '&#8962;', title: 'World view', fn: () => this.flyToWorldView() }, { label: '&#9678;', title: 'Go to my location', fn: () => this.goToMe() },
        { label: 'S', title: 'Route to nearest shelter', fn: () => this.routeToNearest('shelter') }
      ]);
      this.ui.children[1].appendChild(this.spinBtn);
      this._bindPointer({
        onDown: () => { this.interacting = true; clearTimeout(this._resumeT); },
        onUp: () => { clearTimeout(this._resumeT); this._resumeT = setTimeout(() => { this.interacting = false; this._loop(); }, 2500); },
        onDrag: (dx, dy) => { const R = this._R(); this.lon0 -= (dx / R) * 57.2958 / Math.max(0.3, Math.cos(this.lat0 * D2R)); this.lat0 = clamp(this.lat0 + (dy / R) * 57.2958, -88, 88); this.invalidate(); },
        onZoom: (x, y, dz) => this.zoomAt(x, y, dz)
      });
      this.resize(); this._loop();
    }
    _R() { return Math.min(this.w, this.h) * 0.45 * this.f; }
    zoomAt(x, y, dz) { this.f = clamp(this.f * Math.exp(dz * 1.1), 0.7, 70); this.invalidate(); }
    toggleSpin() { this.spinning = !this.spinning; this.spinBtn.innerHTML = this.spinning ? '&#10074;&#10074;' : '&#9654;'; this._loop(); this._syncSpinBtn(); }
    startSpin() { this.spinning = true; this.spinBtn.innerHTML = '&#10074;&#10074;'; this._loop(); this._syncSpinBtn(); }
    stopSpin() { this.spinning = false; this.spinBtn.innerHTML = '&#9654;'; this._syncSpinBtn(); }
    _syncSpinBtn() {
      const b = document.getElementById('globe-spin-toggle-btn');
      if (b) b.innerHTML = this.spinning ? '<i class="fa-solid fa-pause"></i> <span>Pause Rotation</span>' : '<i class="fa-solid fa-play"></i> <span>Auto-Rotate</span>';
    }
    _loop() {
      if (this._spinRaf || !this.spinning) return;
      this._last = performance.now();
      const run = now => {
        this._spinRaf = null;
        if (!this.spinning || !this.el.isConnected) return;
        const dt = Math.min(0.1, (now - this._last) / 1000); this._last = now;
        if (!this.interacting && !this._anim && this.f < 2.2 && this.w) { this.lon0 -= dt * 360 / 120 * (this.f > 1.4 ? (2.2 - this.f) / 0.8 : 1); this.draw(); }
        this._spinRaf = requestAnimationFrame(run);
      };
      this._spinRaf = requestAnimationFrame(run);
    }
    flyToWorldView() { this.flyTo(20, this.lon0, 1); }
    flyTo(lat, lng, f) {
      const fl = this.lon0, fa = this.lat0, ff = this.f; let tl = lng; tl += Math.round((fl - tl) / 360) * 360;
      const tf = clamp(f == null ? this.f : f, 0.7, 70); this.interacting = true; clearTimeout(this._resumeT);
      this.animate(1100, e => { this.lon0 = fl + (tl - fl) * e; this.lat0 = fa + (lat - fa) * e; this.f = Math.exp(Math.log(ff) + (Math.log(tf) - Math.log(ff)) * e); });
      this._resumeT = setTimeout(() => { this.interacting = false; }, 1100 + 2500);
    }
    // same signature as the MapLibre globe, zoom is a MapLibre-style zoom level
    flyToLocation(lng, lat, zoom, name) {
      this.flyTo(lat, lng, clamp(Math.pow(2, ((zoom || 4.5) - 1.8) * 0.55), 0.7, 70));
      if (name) { const t = document.getElementById('globe-target-title'); if (t) t.innerText = name; }
    }
    async goToMe() { const p = await getPosition(true); if (p) this.flyTo(p.lat, p.lng, 6); }
    focusOn(a, b) { this.flyTo((a.lat + b.lat) / 2, (a.lng + b.lng) / 2, clamp(1.2 / Math.max(0.01, (hav(a.lat, a.lng, b.lat, b.lng) / 6371)), 1.5, 40)); }

    _view(lon, lat) {   // -> [x, y, z] unit-sphere view coords
      const dl = lon * D2R - this.lon0 * D2R, sl = Math.sin(lat * D2R), cl = Math.cos(lat * D2R), cd = Math.cos(dl);
      return [cl * Math.sin(dl), this._cl0 * sl - this._sl0 * cl * cd, this._sl0 * sl + this._cl0 * cl * cd];
    }

    // builds a canvas sub-path for a ring on the sphere, following the limb where the ring goes behind the globe
    _ringPath(ring, cx, cy, R) {
      const ctx = this.ctx, g = ring.gl, n = g.length, lon0 = this.lon0 * D2R, sl0 = this._sl0, cl0 = this._cl0;
      const P = new Array(n); let first = -1;
      for (let i = 0; i < n; i++) {
        const dl = g[i][0] - lon0, cd = Math.cos(dl), sl = g[i][1], cl = g[i][2];
        const z = sl0 * sl + cl0 * cl * cd; P[i] = [cl * Math.sin(dl), cl0 * sl - sl0 * cl * cd, z];
        if (first < 0 && z >= 0) first = i;
      }
      if (first < 0) return false;
      let started = false, exitA = null;
      const put = (x, y) => { const sx = cx + R * x, sy = cy - R * y; if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy); };
      for (let k = 0; k < n; k++) {
        const i = (first + k) % n, j = (i + 1) % n, A = P[i], B = P[j], av = A[2] >= 0, bv = B[2] >= 0;
        if (av) put(A[0], A[1]);
        if (av !== bv) {
          const t = A[2] / (A[2] - B[2]); let x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t; const m = Math.hypot(x, y) || 1; x /= m; y /= m;
          if (av) { put(x, y); exitA = Math.atan2(y, x); }
          else {
            const a2 = Math.atan2(y, x);
            if (exitA !== null) { let d = a2 - exitA; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; const st = Math.max(1, Math.ceil(Math.abs(d) / 0.12)); for (let s = 1; s < st; s++) put(Math.cos(exitA + d * s / st), Math.sin(exitA + d * s / st)); }
            put(x, y);
          }
        }
      }
      ctx.closePath(); return true;
    }

    draw() {
      const ctx = this.ctx, w = this.w, h = this.h; if (!w) return;
      const R = this._R(), cx = w / 2, cy = h / 2; this._sl0 = Math.sin(this.lat0 * D2R); this._cl0 = Math.cos(this.lat0 * D2R);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e2e8f0'; this.stars.forEach(s => { ctx.globalAlpha = 0.25 + s[2] * 0.35; ctx.beginPath(); ctx.arc(s[0] * w, s[1] * h, s[2] * 0.7, 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1;
      // atmosphere + sphere
      const halo = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.16); halo.addColorStop(0, 'rgba(56,189,248,.45)'); halo.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.16, 0, TAU); ctx.fill();
      const og = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R); og.addColorStop(0, '#16407f'); og.addColorStop(1, '#071a3d');
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();

      // graticule
      ctx.strokeStyle = 'rgba(148,163,184,.14)'; ctx.lineWidth = 1; ctx.beginPath();
      const gs = this.f > 6 ? 5 : this.f > 2.5 ? 10 : 30;
      const run = (pts) => { let pen = false; pts.forEach(p => { const v = this._view(p[0], p[1]); if (v[2] > 0) { const x = cx + R * v[0], y = cy - R * v[1]; pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; }); };
      for (let lon = -180; lon < 180; lon += gs) { const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push([lon, lat]); run(pts); }
      for (let lat = -90 + gs; lat < 90; lat += gs) { const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push([lon, lat]); run(pts); }
      ctx.stroke();

      // land
      const land = REAL ? REAL.land : BUILTIN.land;
      ctx.fillStyle = COLORS.land; ctx.strokeStyle = COLORS.landEdge; ctx.lineWidth = 1;
      ctx.beginPath(); land.forEach(r => this._ringPath(r, cx, cy, R)); ctx.fill(); ctx.stroke();
      if (!REAL) { ctx.fillStyle = '#10305f'; ctx.beginPath(); BUILTIN.water.forEach(r => this._ringPath(r, cx, cy, R)); ctx.fill(); }
      if (REAL && this.layers.borders && this.f > 1.2) { ctx.strokeStyle = COLORS.border; ctx.lineWidth = 0.7; ctx.beginPath(); REAL.borders.forEach(l => { const g = l.ll; let pen = false; for (let i = 0; i < g.length; i++) { const v = this._view(g[i][0], g[i][1]); if (v[2] > 0) { const x = cx + R * v[0], y = cy - R * v[1]; pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; } }); ctx.stroke(); }

      // faults
      const d = dataset();
      if (this.layers.faults) {
        ctx.strokeStyle = COLORS.fault; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        d.faults.forEach(f => { ctx.beginPath(); let pen = false; f.coords.forEach(c => { const v = this._view(c[1], c[0]); if (v[2] > 0.02) { const x = cx + R * v[0], y = cy - R * v[1]; pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false; }); ctx.stroke(); });
        ctx.setLineDash([]);
      }
      // route (great circle sampled)
      if (this.route) {
        const a = this.route.from, b = this.route.to; ctx.strokeStyle = FAC_STYLE[this.route.kind].c; ctx.lineWidth = 3; ctx.setLineDash([2, 6]); ctx.lineCap = 'round'; ctx.beginPath(); let pen = false;
        for (let s = 0; s <= 24; s++) { const t = s / 24; const lat = a.lat + (b.lat - a.lat) * t, lon = a.lng + (b.lng - a.lng) * t; const v = this._view(lon, lat); if (v[2] > 0) { const x = cx + R * v[0], y = cy - R * v[1]; pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } }
        ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
      }
      // markers
      this.markers = [];
      const proj = (lon, lat) => { const v = this._view(lon, lat); return v[2] > 0.03 ? [cx + R * v[0], cy - R * v[1], v[2]] : null; };
      const sizeScale = clamp(Math.pow(this.f, 0.18), 0.8, 1.6);
      const recs = this._collectMarkers(proj, sizeScale);
      const order = { quake: 1, recent: 2, shelter: 3, hospital: 3, police: 3, fire: 3, user: 4 };
      recs.sort((a, b) => (order[a.type] - order[b.type]) || (b.r - a.r));
      recs.forEach(m => { this.markers.push(m); this._drawMarker(m); });
      if (this.layers.cities && this.f > 1.7) {
        const maxRank = this.f > 5 ? 3 : this.f > 3 ? 2 : 1; ctx.font = '600 11px Inter,system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        G.cities.forEach(([n, lon, lat, rank]) => { if (rank > maxRank) return; const p = proj(lon, lat); if (!p) return; ctx.beginPath(); ctx.arc(p[0], p[1], 2.3, 0, TAU); ctx.fillStyle = '#f8fafc'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(2,6,23,.85)'; ctx.strokeText(n, p[0] + 6, p[1]); ctx.fillStyle = COLORS.label; ctx.fillText(n, p[0] + 6, p[1]); });
      }
      // limb darkening / light
      const sh = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.35, cx, cy, R); sh.addColorStop(0, 'rgba(255,255,255,.06)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.5)');
      ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();
      ctx.strokeStyle = 'rgba(148,163,184,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      this.panel.style.bottom = '8px';
    }
  }

  // ------------------------------------------------------------------ Leaflet underlay
  function attachUnderlay(map) {
    if (!map || typeof L === 'undefined' || map._qgUnderlay) return null;
    if (!map.getPane('qgOfflinePane')) { const p = map.createPane('qgOfflinePane'); p.style.zIndex = 150; }
    const Layer = L.GridLayer.extend({
      createTile(coords) {
        const size = this.getTileSize(), dpr = Math.min(window.devicePixelRatio || 1, 2);
        const t = document.createElement('canvas'); t.width = size.x * dpr; t.height = size.y * dpr;
        const ctx = t.getContext('2d'); ctx.scale(dpr, dpr);
        const n = Math.pow(2, coords.z), tx = ((coords.x % n) + n) % n, ty = coords.y, S = size.x;
        ctx.fillStyle = COLORS.ocean; ctx.fillRect(0, 0, S, S);
        const land = REAL ? REAL.land : BUILTIN.land, water = REAL ? [] : BUILTIN.water;
        const draw = (rings, color) => {
          ctx.fillStyle = color; ctx.strokeStyle = COLORS.landEdge; ctx.lineWidth = 1; ctx.beginPath();
          for (let k = -1; k <= 1; k++) {
            for (const r of rings) {
              const p = r.mx; let minX = 9, maxX = -9, minY = 9, maxY = -9;
              for (let i = 0; i < p.length; i++) { const x = p[i][0], y = p[i][1]; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
              const x0 = (minX + k) * n - tx, x1 = (maxX + k) * n - tx, y0 = minY * n - ty, y1 = maxY * n - ty;
              if (x1 < -0.02 || x0 > 1.02 || y1 < -0.02 || y0 > 1.02) continue;
              ctx.moveTo(((p[0][0] + k) * n - tx) * S, (p[0][1] * n - ty) * S);
              for (let i = 1; i < p.length; i++) ctx.lineTo(((p[i][0] + k) * n - tx) * S, (p[i][1] * n - ty) * S);
              ctx.closePath();
            }
          }
          ctx.fill(); ctx.stroke();
        };
        draw(land, COLORS.land); if (water.length) draw(water, COLORS.ocean);
        return t;
      }
    });
    const layer = new Layer({ pane: 'qgOfflinePane', tileSize: 256, minZoom: 0, maxZoom: 19, updateWhenIdle: true, keepBuffer: 2, attribution: '' });
    layer.addTo(map); map._qgUnderlay = layer;
    views.add({ invalidate() { try { layer.redraw(); } catch (e) {} } });
    return layer;
  }

  // ------------------------------------------------------------------ public API
  const offlineBasemap = {
    activeFlat: null, activeGlobe: null,
    mountFlat(id, opts) { const v = new FlatView(id, opts); this._track(v, 'activeFlat'); return v; },
    mountGlobe(id, opts) { const v = new GlobeView(id, opts); this._track(v, 'activeGlobe'); return v; },
    _track(v, slot) { const prev = this[slot]; if (prev && prev !== v && prev.el === v.el) { try { prev.destroy(); } catch (e) {} } this[slot] = v; const d = v.destroy.bind(v); v.destroy = () => { d(); if (this[slot] === v) this[slot] = null; }; },
    attachUnderlay,
    loadRealBorders,
    hasRealBorders: () => !!REAL,
    getPosition, dataset,
    refresh() { views.forEach(v => v.invalidate()); },
    setLayer(k, on) { if (this.activeFlat) this.activeFlat.setLayer(k, on); if (this.activeGlobe) this.activeGlobe.setLayer(k, on); },
    _decodeTopo: decodeTopo
  };
  window.offlineBasemap = offlineBasemap;

  // fetch & keep the real country borders once the app has been online
  const start = () => { loadRealBorders(); window.addEventListener('online', () => { if (!REAL) loadRealBorders(); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
