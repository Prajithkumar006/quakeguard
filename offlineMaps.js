/* ==========================================================================
   QuakeGuard - Offline Maps Manager
   Tracks online/offline state and lets the user pre-download the map tiles
   for whatever area is currently on screen, so it keeps rendering with no
   signal. Works together with sw.js, which caches every map tile the app
   loads automatically as you browse.
   ========================================================================== */

const offlineMaps = {
  init() {
    this._updateStatusBadge();
    window.addEventListener('online', () => this._updateStatusBadge());
    window.addEventListener('offline', () => this._updateStatusBadge());
  },

  _updateStatusBadge() {
    const el = document.getElementById('connection-status-badge');
    if (!el) return;
    if (navigator.onLine) {
      el.innerHTML = '<i class="fa-solid fa-wifi"></i> Online';
      el.style.color = '#10b981';
      el.title = 'Connected — live data and fresh map tiles are available.';
    } else {
      el.innerHTML = '<i class="fa-solid fa-wifi-slash"></i> Offline';
      el.style.color = '#f59e0b';
      el.title = 'No connection — showing cached data and previously-saved map areas.';
    }
  },

  // One-tap "get ready for no signal" while online: saves what the offline
  // map, offline globe and offline assistant need beyond the app files.
  async prepareOfflinePack(btn) {
    if (!navigator.onLine) { alert('You are offline right now. Connect to the internet and press this button once, so the offline pack can be saved.'); return; }
    const label = btn && btn.querySelector('span');
    const set = t => { if (label) label.textContent = t; };
    if (btn) btn.disabled = true;
    set('Saving...');
    const done = [], missing = [];
    const note = (ok, text) => (ok ? done : missing).push(text);

    try { note(window.offlineBasemap && await offlineBasemap.loadRealBorders(), 'country borders'); } catch (e) { note(false, 'country borders'); }
    try { const n = window.liveMap ? await liveMap.refreshSavedFeed() : 0; note(n > 0, 'latest earthquake feed (' + n + ' quakes)'); } catch (e) { note(false, 'latest earthquake feed'); }
    try { const p = window.offlineBasemap ? await offlineBasemap.getPosition(true) : null; note(!!p, 'your position (for nearest shelter/hospital)'); } catch (e) { note(false, 'your position'); }

    // Make sure the map/chart/icon libraries are in the offline cache (the service worker stores whatever is fetched)
    const libs = [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css', 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', 'https://cdn.jsdelivr.net/npm/chart.js'
    ];
    const results = await Promise.allSettled(libs.map(u => fetch(u, { mode: 'cors' }).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })));
    const okLibs = results.filter(r => r.status === 'fulfilled').length;
    note(okLibs === libs.length, 'map and chart libraries (' + okLibs + '/' + libs.length + ')');

    if (btn) btn.disabled = false;
    set(missing.length ? 'Offline Pack (partial)' : 'Offline Pack saved');
    setTimeout(() => set('Prepare Offline Pack'), 6000);
    alert((done.length ? 'Saved for offline use:\n- ' + done.join('\n- ') : '') +
      (missing.length ? '\n\nCould not save:\n- ' + missing.join('\n- ') + '\n(Check your connection or location permission and try again.)' : '') +
      '\n\nTip: also press "Save This Area Offline" while looking at your region to keep real street-level map tiles.' +
      '\nThe offline assistant, offline map and offline globe are already built into the app.');
  },

  // --- Slippy-map tile math (standard Web Mercator XYZ scheme) -----------
  _lon2tileX(lon, z) {
    return Math.floor((lon + 180) / 360 * Math.pow(2, z));
  },
  _lat2tileY(lat, z) {
    const rad = lat * Math.PI / 180;
    return Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, z));
  },

  // Builds the list of tile URLs covering `bounds` for one XYZ tile
  // provider (base layer, plus its paired label/reference layer if it has
  // one), across a small range of zoom levels centered on `baseZoom`.
  // Never goes past the provider's real `maxNativeZoom` — tiles beyond that
  // don't exist on the server, so there's nothing useful to save.
  _buildTileUrls(provider, bounds, baseZoom) {
    const hardCap = provider.maxNativeZoom || 15;
    const minZ = Math.max(1, baseZoom - 1);
    const maxZ = Math.min(baseZoom + 2, hardCap, 15);
    const urls = [];
    const templates = [provider.url, provider.referenceUrl].filter(Boolean);

    for (let z = minZ; z <= maxZ; z++) {
      const xMin = this._lon2tileX(bounds.getWest(), z);
      const xMax = this._lon2tileX(bounds.getEast(), z);
      const yMin = this._lat2tileY(bounds.getNorth(), z);
      const yMax = this._lat2tileY(bounds.getSouth(), z);

      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          templates.forEach(template => {
            let url = template.replace('{z}', z).replace('{x}', x).replace('{y}', y);
            if (url.includes('{s}')) url = url.replace('{s}', (provider.subdomains || 'abc')[0]);
            urls.push(url);
          });
        }
      }
    }
    return urls;
  },

  // Pre-downloads tiles for whichever Leaflet map ('dashboard' or 'full')
  // is currently visible, covering its current view plus a couple of zoom
  // levels in and out, so panning/zooming a bit while offline still works.
  downloadAreaForOffline(which) {
    const map = which === 'dashboard' ? window.liveMap && window.liveMap.dashMap
                                       : window.liveMap && window.liveMap.fullMap;
    const btnId = which === 'dashboard' ? 'dash-offline-btn' : 'full-offline-btn';
    const btn = document.getElementById(btnId);

    if (!map || typeof L === 'undefined') {
      alert('The map needs to finish loading before you can save it for offline use.');
      return;
    }
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      alert('Offline saving isn\'t ready yet — reload the page once you have a connection, then try again.');
      return;
    }

    const styleKey = which === 'dashboard' ? 'carto-dark' : (window.liveMap.activeMapStyle || 'carto-dark');
    const provider = window.liveMap.tileProviders[styleKey] || window.liveMap.tileProviders['carto-dark'];
    const bounds = map.getBounds();
    const baseZoom = Math.round(map.getZoom());
    const urls = this._buildTileUrls(provider, bounds, baseZoom);

    if (urls.length > 500) {
      const proceed = confirm(`This will save about ${urls.length} map tiles (~${Math.round(urls.length * 15 / 1024)} MB) for offline use. Continue?`);
      if (!proceed) return;
    }

    this._sendTilesToCache(urls, btn);
  },

  _sendTilesToCache(urls, btn) {
    const setLabel = (html) => { if (btn) btn.innerHTML = html; };
    const defaultLabel = '<i class="fa-solid fa-download"></i> <span>Save This Area Offline</span>';
    setLabel(`<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving 0/${urls.length}</span>`);
    if (btn) btn.disabled = true;

    const onMessage = (event) => {
      const data = event.data || {};
      if (data.type === 'CACHE_TILES_PROGRESS') {
        setLabel(`<i class="fa-solid fa-spinner fa-spin"></i> <span>Saving ${data.done}/${data.total}</span>`);
      } else if (data.type === 'CACHE_TILES_DONE') {
        setLabel('<i class="fa-solid fa-circle-check"></i> <span>Saved for Offline</span>');
        if (btn) btn.disabled = false;
        navigator.serviceWorker.removeEventListener('message', onMessage);
        setTimeout(() => setLabel(defaultLabel), 4000);
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    navigator.serviceWorker.controller.postMessage({ type: 'CACHE_TILES', urls });
  }
};

// Expose module globally so `window.offlineMaps` checks elsewhere (app.js)
// find it — top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.offlineMaps = offlineMaps;
