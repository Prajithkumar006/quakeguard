/* ==========================================================================
   QuakeGuard - Service Worker (Offline Cache, PWA Support & Offline Maps)
   ========================================================================== */

const SW_VERSION = 'v2.9-mesh3-damage4-face2';
const STATIC_CACHE = `quakeguard-static-${SW_VERSION}`;
// Tile & live-data caches are NOT versioned with the app build — a new app
// version shouldn't wipe out map areas or the last known quake feed the
// person already downloaded for offline use.
const TILE_CACHE = 'quakeguard-tiles-v1';
const DATA_CACHE = 'quakeguard-data-v1';
const KEEP_CACHES = [STATIC_CACHE, TILE_CACHE, DATA_CACHE];

// Core app shell — always same-origin, safe to precache with cache.addAll.
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './manifest.json',
  './js/app.js',
  './js/multiLang.js',
  './js/liveMap.js',
  './js/mapLibreGlobe.js',
  './js/offlineMaps.js',
  './js/offlineGeo.js',
  './js/offlineBasemap.js',
  './js/offlineBrain.js',
  './js/databaseExplorer.js',
  './js/familyCircle.js',
  './js/pWaveEarlyWarning.js',
  './js/mutualAid.js',
  './js/meshNetwork.js',
  './js/aiPredictor.js',
  './js/faceCascade.js',
  './js/faceHaar.js',
  './js/aiDamageAssessor.js',
  './js/aiBackend.js',
  './js/aiVoiceAssistant.js',
  './js/sosManager.js',
  './js/disasterPreparedness.js',
  './js/communityReports.js',
  './js/volunteerModule.js',
  './js/virtualSensorEngine.js',
  './js/acousticBioDemodulator.js',
  './js/animalInfrasoundNetwork.js',
  './js/a11yAssistiveEngine.js',
  './js/rescueAdmin.js',
  './assets/logo.jpg',
  './assets/building_damage.jpg',
  './assets/shelter.jpg'
];

// Third-party library/style assets, fetched & cached individually rather
// than via cache.addAll — one blocked or slow CDN request would otherwise
// fail the entire install step and leave the app shell uncached.
const CDN_SHELL = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',   // real country borders for the offline map & globe
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap'
];

// Hostnames that serve map tiles / vector styles / sprites / glyphs. Any
// request to these is treated as a cacheable map asset: cache-first, and
// silently topped up from the network whenever a new tile is seen — so
// areas the person has actually looked at keep working with no signal.
const TILE_HOSTS = [
  'services.arcgisonline.com',
  'maps.wikimedia.org',
  'tile.opentopomap.org',
  'demotiles.maplibre.org',
  'tiles.openfreemap.org',      // MapLibre style + vector tiles (roads, land use, 2D/3D buildings)
  's3.amazonaws.com'            // AWS-hosted elevation/terrain DEM tiles
];

function isTileRequest(urlStr) {
  try {
    const host = new URL(urlStr).hostname;
    return TILE_HOSTS.some(h => host === h || host.endsWith('.' + h));
  } catch (e) {
    return false;
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const staticCache = await caches.open(STATIC_CACHE);
    try {
      await staticCache.addAll(APP_SHELL);
    } catch (e) {
      console.warn('[QuakeGuard SW] Some app-shell files failed to precache:', e);
    }

    // Best-effort: library/font/style CDN assets. Failures here (offline
    // first install, blocked CDN) are swallowed — the runtime fetch
    // handler below will retry and cache them the next time they load.
    await Promise.allSettled(CDN_SHELL.map(async url => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (res && (res.ok || res.type === 'opaque')) await staticCache.put(url, res);
      } catch (e) { /* will be cached at runtime instead */ }
    }));

    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => !KEEP_CACHES.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // AI server endpoints must always hit the network (a cached /health would fake 'online')
  if (/\/(health|chat|feedback)(\?|$)/.test(new URL(req.url).pathname)) return;

  // 1. Map tiles / vector styles / sprites / glyphs — cache-first, caching
  //    whatever is freshly fetched so this area is available offline later.
  if (isTileRequest(req.url)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // 2. Live earthquake feed (USGS) — network-first, falling back to the
  //    last successfully fetched copy when there's no connection.
  if (req.url.includes('earthquake.usgs.gov')) {
    event.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await cache.match(req);
        return cached || Response.error();
      }
    })());
    return;
  }

  // 3. App shell, library scripts/styles & everything else — cache-first,
  //    falling back to network, topping up the cache with new same-origin
  //    responses as they're seen.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});

// Lets page code ask the Service Worker to pre-fetch & cache a batch of
// tile URLs up front (used by the "Save This Area Offline" buttons),
// reporting progress back to whichever tab asked.
self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'CACHE_TILES') return;
  const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
  const source = event.source;

  event.waitUntil((async () => {
    const cache = await caches.open(TILE_CACHE);
    let done = 0;
    for (const url of urls) {
      try {
        const existing = await cache.match(url);
        if (!existing) {
          const res = await fetch(url, { mode: 'no-cors' });
          await cache.put(url, res);
        }
      } catch (e) { /* skip this tile, keep going */ }
      done++;
      if (source) source.postMessage({ type: 'CACHE_TILES_PROGRESS', done, total: urls.length });
    }
    if (source) source.postMessage({ type: 'CACHE_TILES_DONE', done, total: urls.length });
  })());
});
