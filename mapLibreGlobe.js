/* ==========================================================================
   QuakeGuard - 3D & 2D Vector Earth Globe Engine (MapLibre GL v5.24.0)
   ========================================================================== */

const mapLibreGlobe = {
  map: null,
  isInitialized: false,
  maplibreglInstance: null,
  isSpinning: true,
  userInteracting: false,
  spinFrame: null,
  secondsPerRevolution: 120, // slow, cinematic rotation
  maxSpinZoom: 4,            // stop spinning once zoomed in past this
  slowSpinZoom: 2.5,         // start easing the spin speed down past this zoom

  is3DEnabled: false,        // 3D buildings + terrain toggle state
  DEM_SOURCE_ID: 'qg-terrain-dem',
  HILLSHADE_LAYER_ID: 'qg-hillshade-layer',
  BUILDINGS_SOURCE_ID: 'qg-3d-buildings-source',
  BUILDINGS_LAYER_ID: 'qg-3d-buildings-layer',
  // Free, keyless AWS-hosted worldwide elevation tiles (Terrarium encoding) —
  // used for real 3D terrain relief (mountains, valleys, elevation).
  DEM_TILE_URL: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  // Free, keyless, unlimited OSM vector tiles (OpenMapTiles schema) — this is
  // what actually carries real building footprint + height data, unlike the
  // bare demotiles.maplibre.org style which only has country outlines.
  RICH_STYLE_URL: 'https://tiles.openfreemap.org/styles/liberty',
  BUILDINGS_TILE_URL: 'https://tiles.openfreemap.org/planet',
  // Free, keyless Esri World Imagery — real satellite/aerial photography,
  // already whitelisted in sw.js's TILE_HOSTS so it caches for offline use
  // the same way the other basemaps do.
  SATELLITE_TILE_URL: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  SATELLITE_LABELS_URL: 'https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  currentStyleKey: 'globe', // tracks which basemap is active, so 3D assets know whether to also draw hillshade

  _failedHTML() {
    return `
      <div style="width:100%; height:100%; min-height:200px; display:flex; align-items:center; justify-content:center; text-align:center; padding:1.5rem; background:#020617; border-radius:12px; color:#e2e8f0; font-family:sans-serif;">
        <div>
          <i class="fa-solid fa-globe" style="font-size:1.8rem; color:#f97316;"></i>
          <div style="font-weight:800; margin-top:0.5rem;">3D globe couldn't load</div>
          <div style="font-size:0.82rem; color:#94a3b8; margin-top:0.35rem; max-width:340px;">
            MapLibre GL failed to load from the CDN. Check that you're online, and if you're
            opening this file directly (double-click), try serving it instead via
            <code>server.ps1</code> / <code>run_app.bat</code>.
          </div>
          <button class="btn btn-outline" style="margin-top:0.75rem; font-size:0.8rem;" onclick="mapLibreGlobe.isInitialized=false; mapLibreGlobe.init();">
            <i class="fa-solid fa-rotate-right"></i> Retry
          </button>
        </div>
      </div>`;
  },

  // Loads the MapLibre GL UMD build via a classic <script> tag rather than a
  // dynamic ES-module import(). Dynamic import() of remote modules is
  // blocked by Chrome/Edge when the page is opened as a local file
  // (file://) instead of served over http(s), which left this globe blank
  // with no error shown. A classic script tag works in both cases.
  _loadMaplibreScript() {
    return new Promise((resolve, reject) => {
      if (window.maplibregl) { resolve(window.maplibregl); return; }
      const existing = document.getElementById('maplibre-gl-script');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.maplibregl));
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.id = 'maplibre-gl-script';
      script.src = 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js';
      script.onload = () => resolve(window.maplibregl);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  async init(containerId) {
    const targetId = containerId || 'maplibre-globe-container';
    const container = document.getElementById(targetId);
    if (!container) return;

    if (this.isInitialized && this.map) {
      setTimeout(() => {
        if (this.map) this.map.resize();
      }, 100);
      return;
    }

    try {
      this.maplibreglInstance = await this._loadMaplibreScript();
      if (!this.maplibreglInstance) throw new Error('maplibregl global not present after script load');

      this.map = new this.maplibreglInstance.Map({
        container: targetId,
        style: this.RICH_STYLE_URL, // Real OSM vector data (roads, buildings, land use) instead of bare country outlines
        projection: 'globe', // Force the true rotating 3D sphere (not the flattened map)
        center: [0.0, 20.0], // Full World View
        zoom: 1.8,
        minZoom: 1,
        maxZoom: 19,
        pitch: 15,
        maxPitch: 85, // allow a steep tilt for inspecting 3D buildings/terrain up close
        canvasContextAttributes: { antialias: true }, // smoother edges on 3D building extrusions
        fadeDuration: 0,          // skip the cross-fade between tile generations -> tiles pop in instantly instead of animating in over ~300ms
        refreshExpiredTiles: false, // don't re-request tiles just because their HTTP cache expired -> fewer round trips on a spinning globe
        maxTileCacheZoomLevels: 6,  // keep more zoom levels of tiles resident so zooming in/out on a city redraws from cache, not network
        localIdeographFontFamily: false // skip generating CJK glyphs locally; not needed and saves main-thread time on first load
      });

      this.map.addControl(new this.maplibreglInstance.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), 'top-right');

      // Surface tile/source load failures instead of failing silently.
      // Without this, a blocked/slow request to the buildings or terrain
      // CDN (common on restrictive mobile networks) leaves the 3D toggle
      // looking "on" with nothing rendered, and no way to tell that from
      // a spot that genuinely has no OSM building data. One retry per
      // failed source, then a visible, dismissible notice.
      this._erroredSources = this._erroredSources || {};
      this.map.on('error', (e) => this._handleMapError(e));

      // Add a faint starfield behind the globe, and (re-)apply the globe
      // projection + 3D buildings/terrain assets, every time a style
      // finishes loading — this is the reliable point recommended by
      // MapLibre's own globe examples, and covers both the initial load
      // and any later setStyle() calls (sources/layers get wiped on those).
      this._styleLoaded = false;
      clearTimeout(this._styleTimer);
      this._styleTimer = setTimeout(() => {
        if (!this._styleLoaded && !this.offlineActive && window.offlineBasemap && window.OFFLINE_GEO) {
          this.setOfflineMode(true, 'The online map style could not be reached, so the built-in offline globe is shown.');
        }
      }, navigator.onLine ? 10000 : 3500);
      this.map.on('style.load', () => {
        this._styleLoaded = true;
        if (this.map.setProjection) this.map.setProjection({ type: 'globe' });
        if (this.map.setSky) {
          this.map.setSky({
            'sky-color': '#020617',
            'sky-horizon-blend': 0.5,
            'horizon-color': '#0f172a',
            'horizon-fog-blend': 0.5,
            'fog-color': '#020617',
            'fog-ground-blend': 0.5
          });
        }
        // Only rebuild the 3D buildings/terrain sources after a style swap
        // if the user had actually turned 3D on before — otherwise this
        // fetches and parses a large global buildings vector tile source
        // and DEM tiles for every visitor by default, whether or not they
        // ever use the 3D toggle. See toggle3D() for the lazy first-time add.
        if (this.is3DEnabled) this._ensure3DAssets();
      });

      this.map.on('load', () => {
        this.addEarthquakeMarkers();
        this._bindSpinInteractionHandlers();
        this.startSpin();
      });

      this.isInitialized = true;
      console.log('[QuakeGuard MapLibre GL] 3D/2D World Map loaded successfully.');
    } catch (err) {
      console.warn('[QuakeGuard MapLibre GL] 3D Globe failed to load:', err);
      // No MapLibre (offline and never cached): show the built-in offline globe instead of an error box
      if (window.offlineBasemap && window.OFFLINE_GEO) {
        this.isInitialized = false; this.map = null;
        container.innerHTML = '';
        this.setOfflineMode(true, 'The 3D map library could not load, so the built-in offline globe is shown.');
      } else {
        container.innerHTML = this._failedHTML();
      }
    }
  },

  // ------------------------------------------------------------------------
  // Auto-Rotation ("spin the globe"): eases the camera's longitude forward
  // on every animation frame, like Mapbox/MapLibre's classic spinning-globe
  // demo. Pauses while the user is dragging/zooming and resumes shortly
  // after they let go, and never spins once zoomed in close.
  // ------------------------------------------------------------------------
  _bindSpinInteractionHandlers() {
    if (!this.map || this._spinHandlersBound) return;
    this._spinHandlersBound = true;

    const pause = () => { this.userInteracting = true; };
    const resume = () => {
      this.userInteracting = false;
      if (this.isSpinning) this._spinTick();
    };

    this.map.on('mousedown', pause);
    this.map.on('touchstart', pause);
    this.map.on('dragstart', pause);
    this.map.on('mouseup', resume);
    this.map.on('touchend', resume);
    this.map.on('dragend', resume);
    this.map.on('pitchend', resume);
    this.map.on('rotateend', resume);
  },

  // ------------------------------------------------------------------------
  // Real 3D world features: building extrusions (from actual OSM building
  // footprint + height data) and terrain relief (from real-world elevation
  // data, i.e. actual mountains/hills/valleys) — plus hillshade so terrain
  // reads clearly even before you tilt the camera. Re-run after every style
  // load since setStyle() wipes custom sources/layers.
  // ------------------------------------------------------------------------
  _ensure3DAssets() {
    if (!this.map) return;

    if (!this.map.getSource(this.DEM_SOURCE_ID)) {
      this.map.addSource(this.DEM_SOURCE_ID, {
        type: 'raster-dem',
        tiles: [this.DEM_TILE_URL],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15,
        // Caps how many terrain tiles the DEM source will keep loaded/decoded
        // in memory at once — bounds worst-case terrain build time when
        // flying to a new mountainous region instead of decoding an
        // unbounded number of tiles synchronously.
        volatile: false
      });
    }

    if (!this.map.getLayer(this.HILLSHADE_LAYER_ID)) {
      this.map.addLayer({
        id: this.HILLSHADE_LAYER_ID,
        type: 'hillshade',
        source: this.DEM_SOURCE_ID,
        // Skipped on the satellite basemap — real photography already
        // carries its own terrain shading, so a flat-color hillshade tint
        // on top would just muddy the imagery instead of adding relief.
        layout: { visibility: (this.is3DEnabled && this.currentStyleKey !== 'satellite') ? 'visible' : 'none' },
        paint: {
          // Apple Maps-style flyover relief: soft, low-contrast shading (not
          // a harsh black/white hillshade) with a fixed sun direction that
          // stays put on the terrain as you rotate, like real sunlight.
          'hillshade-exaggeration': 0.45,
          'hillshade-illumination-anchor': 'map',
          'hillshade-illumination-direction': 315,
          'hillshade-shadow-color': '#3a3f36',
          'hillshade-highlight-color': '#f7f4ea',
          'hillshade-accent-color': '#8a9385'
        }
      });
    }

    if (!this.map.getSource(this.BUILDINGS_SOURCE_ID)) {
      this.map.addSource(this.BUILDINGS_SOURCE_ID, {
        type: 'vector',
        url: this.BUILDINGS_TILE_URL
      });
    }

    if (!this.map.getLayer(this.BUILDINGS_LAYER_ID)) {
      // Insert below the first label layer (if any) so place-name text still
      // renders on top of the extruded buildings, matching MapLibre's own
      // official "Display buildings in 3D" example pattern.
      let labelLayerId;
      try {
        const layers = (this.map.getStyle() || {}).layers || [];
        for (const layer of layers) {
          if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
            labelLayerId = layer.id;
            break;
          }
        }
      } catch (err) {
        // Style not fully serializable yet — fall back to inserting on top,
        // which is still correct, just without the label re-ordering.
        console.warn('[QuakeGuard MapLibre GL] could not read style layers for label ordering:', err);
      }

      this.map.addLayer({
        id: this.BUILDINGS_LAYER_ID,
        type: 'fill-extrusion',
        source: this.BUILDINGS_SOURCE_ID,
        'source-layer': 'building',
        minzoom: 13,
        filter: ['!=', ['get', 'hide_3d'], true],
        layout: { visibility: this.is3DEnabled ? 'visible' : 'none' },
        paint: {
          // Warm off-white/limestone facades that darken with height, closer
          // to Apple Maps' building material than flat slate-blue blocks.
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 8],
            0, '#e4e1d8',
            40, '#cfccc2',
            100, '#b3b0a7',
            200, '#8f8d86'
          ],
          // Fade extrusions in over one zoom step around minzoom instead of
          // popping in at full height the instant a tile loads — cheap to
          // compute (it's just the existing height interpolation stretched
          // one extra step) but reads as far smoother/"instant" to the eye.
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            13.6, ['coalesce', ['get', 'render_height'], 8]
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            13.6, ['coalesce', ['get', 'render_min_height'], 0]
          ],
          'fill-extrusion-opacity': 1,
          // Real per-face shading driven by the map light (below) instead of
          // a flat fill — this is what makes extrusions read as solid,
          // lit volumes rather than colored cardboard cutouts. (Ambient
          // occlusion on fill-extrusion isn't implemented in MapLibre GL JS
          // yet — only Mapbox GL JS has it — so vertical-gradient + the
          // map light below are what's actually available here.)
          'fill-extrusion-vertical-gradient': true
        }
      }, labelLayerId);
    }

    // Hairline rooftop edges on top of the extrusions — this is the detail
    // that makes a dense skyline read as individually-modeled buildings
    // instead of one merged gray mass once you're tilted in close, without
    // adding a second heavy source (it reuses the same buildings tiles).
    if (!this.map.getLayer(this.BUILDINGS_LAYER_ID + '-outline')) {
      this.map.addLayer({
        id: this.BUILDINGS_LAYER_ID + '-outline',
        type: 'line',
        source: this.BUILDINGS_SOURCE_ID,
        'source-layer': 'building',
        minzoom: 15,
        filter: ['!=', ['get', 'hide_3d'], true],
        layout: { visibility: this.is3DEnabled ? 'visible' : 'none' },
        paint: {
          'line-color': '#6b6960',
          'line-width': 0.6,
          'line-opacity': 0.5
        }
      }, labelLayerId);
    }

    // A fixed low-angle "sun" so extruded rooftops/walls pick up real
    // highlight/shadow contrast (Apple Maps' signature look) instead of
    // MapLibre's flat default lighting — set once here rather than per
    // frame since it doesn't need to change while spinning/panning.
    if (this.map.setLight) {
      this.map.setLight({
        anchor: 'map',
        color: '#ffffff',
        intensity: 0.4,
        position: [1.5, 210, 35]
      });
    }

    // Re-apply the current on/off state (e.g. after a style swap) so
    // buildings/terrain don't silently reset to hidden.
    this._apply3DState();
  },

  // Turns the 3D buildings + terrain relief on/off. Tilts the camera when
  // turning on (flat top-down views can't show building height or terrain
  // relief) and levels it back out when turning off.
  toggle3D() {
    if (this.offlineActive) { alert('3D terrain and buildings need an internet connection. Switch back to the Live Globe when you are online.'); return; }
    if (!this.map) return;
    this.is3DEnabled = !this.is3DEnabled;

    const btn = document.getElementById('globe-3d-toggle-btn');
    if (btn) {
      btn.innerHTML = this.is3DEnabled
        ? '<i class="fa-solid fa-cube"></i> <span>Aerial View</span>'
        : '<i class="fa-solid fa-cube"></i> <span>Normal View</span>';
      btn.classList.toggle('btn-primary', this.is3DEnabled);
      btn.classList.toggle('btn-outline', !this.is3DEnabled);
    }

    // The camera tilt (top-down -> aerial, like Google Earth) is done FIRST
    // and on its own, before touching any building/terrain sources. That
    // way the view always visibly changes the instant you click the
    // button, even on a slow connection where the building/terrain tile
    // fetch below is still in flight or fails outright — the two used to
    // be one all-or-nothing sequence, so a source error could silently
    // cancel the tilt too and make the button look completely dead.
    this.userInteracting = true;
    const flyOptions = { pitch: this.is3DEnabled ? 60 : 15, duration: 900 };
    if (this.is3DEnabled && this.map.getZoom() < 14) {
      flyOptions.zoom = 15.5;
      if (this.map.getZoom() < 3) {
        flyOptions.center = [76.9558, 11.0168]; // Coimbatore — matches the quick-fly preset above
      }
    }
    this.map.easeTo(flyOptions);
    this.map.once('moveend', () => {
      this.userInteracting = false;
      if (this.isSpinning) this._spinTick();
    });

    // Creates the DEM/hillshade/buildings source+layers the first time
    // this is ever turned on (idempotent — _ensure3DAssets checks
    // getSource()/getLayer() before adding, so calling it again is a
    // cheap no-op). Nothing heavy loads until the user actually asks for
    // it. Wrapped so that any problem here (bad tile response, a style
    // that isn't fully loaded yet) can't take the camera tilt above down
    // with it — worst case you get the aerial angle with buildings
    // catching up a moment later instead of nothing happening at all.
    try {
      this._ensure3DAssets();
      this._apply3DState();
    } catch (err) {
      console.error('[QuakeGuard MapLibre GL] toggle3D: building/terrain setup failed, camera still tilted:', err);
      this._showMapNotice("3D view is on, but buildings/terrain couldn't load. Check the browser console for details.");
    }
  },

  _apply3DState() {
    if (!this.map) return;
    const vis = this.is3DEnabled ? 'visible' : 'none';

    if (this.map.getLayer(this.BUILDINGS_LAYER_ID)) {
      this.map.setLayoutProperty(this.BUILDINGS_LAYER_ID, 'visibility', vis);
    }
    if (this.map.getLayer(this.BUILDINGS_LAYER_ID + '-outline')) {
      this.map.setLayoutProperty(this.BUILDINGS_LAYER_ID + '-outline', 'visibility', vis);
    }
    if (this.map.getLayer(this.HILLSHADE_LAYER_ID)) {
      this.map.setLayoutProperty(this.HILLSHADE_LAYER_ID, 'visibility', this.currentStyleKey === 'satellite' ? 'none' : vis);
    }
    if (this.map.setTerrain) {
      // 1.5x exaggeration reads closer to Apple Maps' punched-up mountain
      // relief than true-scale elevation, which looks nearly flat at globe
      // zoom levels.
      this.map.setTerrain(this.is3DEnabled ? { source: this.DEM_SOURCE_ID, exaggeration: 1.5 } : null);
    }
  },

  // ------------------------------------------------------------------------
  // Error handling: distinguishes a real load failure (network/CDN issue —
  // worth retrying and telling the user about) from an empty vector tile
  // (a spot with no OSM building/road data — not an error, just sparse
  // source data, especially common outside heavily-mapped cities).
  // ------------------------------------------------------------------------
  _handleMapError(e) {
    const sourceId = e && e.sourceId;
    console.warn('[QuakeGuard MapLibre GL] map error:', sourceId || '(no source)', e && e.error);

    if (!sourceId) return; // style/sprite/glyph errors etc. — logged above, not actionable in-UI

    const isBuildingsOrTerrain = sourceId === this.BUILDINGS_SOURCE_ID || sourceId === this.DEM_SOURCE_ID;
    if (!isBuildingsOrTerrain) return;

    if (!this._erroredSources[sourceId]) {
      // First failure for this source this session: wait a moment (the CDN
      // blip may just be transient) and retry once by tearing down and
      // re-adding the source/layers.
      this._erroredSources[sourceId] = 1;
      setTimeout(() => {
        if (!this.map) return;
        try {
          if (sourceId === this.BUILDINGS_SOURCE_ID) {
            if (this.map.getLayer(this.BUILDINGS_LAYER_ID + '-outline')) this.map.removeLayer(this.BUILDINGS_LAYER_ID + '-outline');
            if (this.map.getLayer(this.BUILDINGS_LAYER_ID)) this.map.removeLayer(this.BUILDINGS_LAYER_ID);
            if (this.map.getSource(this.BUILDINGS_SOURCE_ID)) this.map.removeSource(this.BUILDINGS_SOURCE_ID);
          } else {
            if (this.map.getLayer(this.HILLSHADE_LAYER_ID)) this.map.removeLayer(this.HILLSHADE_LAYER_ID);
            if (this.map.getSource(this.DEM_SOURCE_ID)) this.map.removeSource(this.DEM_SOURCE_ID);
          }
        } catch (err) { /* already gone — fine */ }
        if (this.is3DEnabled) this._ensure3DAssets();
      }, 1500);
    } else if (this._erroredSources[sourceId] === 1) {
      // Failed again after the retry — this is a real, persistent problem
      // (CDN blocked/down), not sparse data. Tell the user instead of
      // leaving the 3D toggle silently doing nothing.
      this._erroredSources[sourceId] = 2;
      const label = sourceId === this.BUILDINGS_SOURCE_ID ? '3D buildings' : 'terrain';
      this._showMapNotice(`Couldn't load ${label} data — check your connection or try again in a moment.`);
    }
  },

  _showMapNotice(message) {
    const container = this.map && this.map.getContainer();
    if (!container) return;
    let banner = container.querySelector('.qg-globe-notice');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'qg-globe-notice';
      banner.style.cssText = 'position:absolute; left:0.6rem; right:0.6rem; bottom:0.6rem; z-index:5; background:rgba(15,23,42,0.92); color:#fde68a; border:1px solid #f97316; border-radius:8px; padding:0.5rem 0.7rem; font:600 0.75rem/1.3 sans-serif; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;';
      container.style.position = container.style.position || 'relative';
      container.appendChild(banner);
    }
    banner.innerHTML = `<span>${message}</span>`;
    const dismiss = document.createElement('button');
    dismiss.textContent = '✕';
    dismiss.style.cssText = 'background:none; border:none; color:#fde68a; cursor:pointer; font-weight:800;';
    dismiss.onclick = () => banner.remove();
    banner.appendChild(dismiss);
  },

  // ------------------------------------------------------------------------
  // Offline globe (offlineBasemap.js): a tile-free, library-free 3D globe that
  // sits on top of the MapLibre canvas. Used automatically when MapLibre or
  // its map style can't load, and available any time via the toolbar button.
  // ------------------------------------------------------------------------
  offlineActive: false,
  offlineView: null,

  toggleOfflineMode() { this.setOfflineMode(!this.offlineActive); },

  setOfflineMode(on, note) {
    if (!window.offlineBasemap || !window.OFFLINE_GEO) { alert('The offline globe data is missing from this install.'); return; }
    const container = document.getElementById('maplibre-globe-container'); if (!container) return;
    let host = container.querySelector(':scope > .qg-offline-host');
    this.offlineActive = !!on;
    const btn = document.getElementById('globe-offline-toggle-btn');
    if (btn) { btn.classList.toggle('btn-primary', !!on); btn.classList.toggle('btn-outline', !on); const sp = btn.querySelector('span'); if (sp) sp.textContent = on ? 'Live Globe' : 'Offline Globe'; }
    if (on) {
      if (this.map && this.isSpinning) { this._spinWasOn = true; this.stopSpin(); }
      if (!host) {
        host = document.createElement('div'); host.className = 'qg-offline-host';
        host.style.cssText = 'position:absolute;inset:0;z-index:30;border-radius:inherit;overflow:hidden;';
        container.appendChild(host);
      }
      host.style.display = 'block';
      if (!this.offlineView) {
        const c = this.map ? this.map.getCenter() : { lng: 78, lat: 18 };
        this.offlineView = offlineBasemap.mountGlobe(host, { lat: Math.max(-60, Math.min(60, c.lat)), lng: c.lng, zoom: 1, layers: { shelters: false, hospitals: false } });
      } else { this.offlineView.resize(); this.offlineView.startSpin && this.offlineView.startSpin(); }
      this.offlineView._syncSpinBtn();
      if (note) {
        const n = document.createElement('div');
        n.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);bottom:44px;max-width:80%;z-index:6;background:rgba(15,23,42,.92);color:#e2e8f0;border:1px solid rgba(148,163,184,.4);border-radius:10px;padding:6px 12px;font:600 12px Inter,system-ui,sans-serif;text-align:center;';
        n.textContent = note; host.appendChild(n); setTimeout(() => n.remove(), 7000);
      }
      const sb = document.getElementById('globe-spin-toggle-btn');
      if (sb && this.offlineView) this.offlineView._syncSpinBtn();
    } else {
      if (host) host.style.display = 'none';
      if (this.offlineView) this.offlineView.stopSpin();
      if (this.map) { this.map.resize(); if (this._spinWasOn) { this._spinWasOn = false; this.startSpin(); } }
      else { this.isInitialized = false; this.init(); }
    }
  },

  startSpin() {
    this.isSpinning = true;
    const btn = document.getElementById('globe-spin-toggle-btn');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Pause Rotation</span>';
    this._spinTick();
  },

  stopSpin() {
    this.isSpinning = false;
    if (this.spinFrame) cancelAnimationFrame(this.spinFrame);
    this.spinFrame = null;
    const btn = document.getElementById('globe-spin-toggle-btn');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Auto-Rotate</span>';
  },

  toggleSpin() {
    if (this.offlineActive && this.offlineView) { this.offlineView.toggleSpin(); return; }
    if (this.isSpinning) this.stopSpin();
    else this.startSpin();
  },

  _spinTick() {
    if (this.spinFrame) cancelAnimationFrame(this.spinFrame);
    this.spinFrame = null;
    if (!this.map || !this.isSpinning || this.userInteracting) return;

    const zoom = this.map.getZoom();
    if (zoom < this.maxSpinZoom) {
      let degreesPerFrame = 360 / this.secondsPerRevolution / 60;
      if (zoom > this.slowSpinZoom) {
        // Ease the spin speed down as the user zooms in, instead of an abrupt stop
        const t = (zoom - this.slowSpinZoom) / (this.maxSpinZoom - this.slowSpinZoom);
        degreesPerFrame *= (1 - t);
      }
      const center = this.map.getCenter();
      center.lng -= degreesPerFrame;
      // jumpTo sets the camera directly with no internal animation/easing
      // pass — cheaper per-frame than easeTo({duration:0}), which still
      // goes through the full easing/animation manager for zero benefit
      // here since we're already driving our own requestAnimationFrame loop.
      this.map.jumpTo({ center });
    }

    this.spinFrame = requestAnimationFrame(() => this._spinTick());
  },

  changeProjectionStyle(styleKey) {
    if (!this.map) return;
    this.currentStyleKey = styleKey;

    let styleUrl = this.RICH_STYLE_URL;
    if (styleKey === 'osm-raster') {
      styleUrl = {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    } else if (styleKey === 'satellite') {
      styleUrl = {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [this.SATELLITE_TILE_URL],
            tileSize: 256,
            maxzoom: 19,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          },
          // Place names, roads, and borders drawn over the photography —
          // without this a pure satellite layer has no labels at all,
          // which is disorienting once you're tilted into 3D.
          'satellite-labels': {
            type: 'raster',
            tiles: [this.SATELLITE_LABELS_URL],
            tileSize: 256,
            maxzoom: 19
          }
        },
        layers: [
          { id: 'satellite-tiles-layer', type: 'raster', source: 'satellite-tiles', minzoom: 0, maxzoom: 19 },
          { id: 'satellite-labels-layer', type: 'raster', source: 'satellite-labels', minzoom: 0, maxzoom: 19 }
        ]
      };
    }
    // 'vector-2d' and 'globe' use the plain vector style; 'satellite' uses
    // real imagery instead — 'globe' and 'satellite' both keep the globe
    // projection (a photo-real rotating Earth), 'vector-2d'/'osm-raster'
    // stay flat.

    this.map.setStyle(styleUrl);
    this.map.once('style.load', () => {
      if ((styleKey === 'globe' || styleKey === 'satellite') && this.map.setProjection) {
        this.map.setProjection({ type: 'globe' });
      }
      // Same lazy rule as the initial load — only rebuild 3D assets if
      // they'd actually been turned on already. On a satellite basemap the
      // hillshade relief layer is skipped (see _ensure3DAssets) since the
      // photography already shows real terrain shading — adding a second,
      // flat-color hillshade on top would just muddy the imagery. Building
      // extrusions and true 3D terrain displacement still apply either way.
      if (this.is3DEnabled) this._ensure3DAssets();
      this.addEarthquakeMarkers();
    });
  },

  // Renders every quake as ONE GPU circle layer instead of one DOM element
  // per quake. This matters a lot here specifically because the globe spins
  // continuously: MapLibre has to reproject and reposition every DOM
  // Marker via JavaScript on EVERY animation frame forever, while a GL
  // circle layer is redrawn by the GPU as part of the normal map render —
  // no per-marker JS work at all. Popups are now built lazily on click
  // instead of 36 Popup objects being constructed upfront.
  QUAKE_SOURCE_ID: 'qg-quake-points',
  QUAKE_LAYER_ID: 'qg-quake-points-layer',

  addEarthquakeMarkers() {
    if (!this.map || !window.quakeDatabase || !this.maplibreglInstance) return;

    const quakes = window.quakeDatabase.historicalQuakes || [];
    const geojson = {
      type: 'FeatureCollection',
      features: quakes.map(q => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [q.lng, q.lat] },
        properties: {
          mag: q.mag,
          place: q.place,
          depth: q.depth,
          year: q.year || 2026,
          casualties: q.casualties || ''
        }
      }))
    };

    const existingSource = this.map.getSource(this.QUAKE_SOURCE_ID);
    if (existingSource) {
      // setStyle() wipes custom sources/layers, so after a style swap this
      // source won't exist and we fall through to recreating it below —
      // this branch only fires when re-calling with fresh/live quake data
      // on the SAME still-loaded style.
      existingSource.setData(geojson);
      return;
    }

    this.map.addSource(this.QUAKE_SOURCE_ID, { type: 'geojson', data: geojson });
    this.map.addLayer({
      id: this.QUAKE_LAYER_ID,
      type: 'circle',
      source: this.QUAKE_SOURCE_ID,
      paint: {
        'circle-radius': ['max', ['*', ['get', 'mag'], 1.8], 6],
        'circle-color': [
          'case',
          ['>=', ['get', 'mag'], 7.5], '#dc2626',
          ['>=', ['get', 'mag'], 6.0], '#ef4444',
          '#f97316'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.85
      }
    });

    this.map.on('click', this.QUAKE_LAYER_ID, (e) => {
      const f = e.features[0];
      const p = f.properties;
      const color = p.mag >= 7.5 ? '#dc2626' : p.mag >= 6.0 ? '#ef4444' : '#f97316';
      new this.maplibreglInstance.Popup({ offset: 12 })
        .setLngLat(f.geometry.coordinates.slice())
        .setHTML(`
          <div style="font-family: sans-serif; padding: 6px; color: #0f172a; min-width: 180px;">
            <h4 style="margin: 0; color: ${color}; font-weight: 800; font-size: 0.95rem;">M ${Number(p.mag).toFixed(1)} Earthquake</h4>
            <div style="font-weight: 700; margin: 4px 0; font-size: 0.85rem;">${p.place}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Depth: ${p.depth} km | Year: ${p.year}</div>
            ${p.casualties ? `<div style="font-size: 0.75rem; color: #dc2626; font-weight: 700; margin-top: 2px;">Impact: ${p.casualties}</div>` : ''}
          </div>
        `)
        .addTo(this.map);
    });
    this.map.on('mouseenter', this.QUAKE_LAYER_ID, () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', this.QUAKE_LAYER_ID, () => { this.map.getCanvas().style.cursor = ''; });
  },

  flyToWorldView() {
    if (this.offlineActive && this.offlineView) { this.offlineView.flyToWorldView(); return; }
    if (this.map) {
      this.userInteracting = true; // hold off auto-spin while the camera flies
      this.map.flyTo({
        center: [0, 20],
        zoom: 1.8,
        pitch: 0,
        essential: true,
        speed: 1.2
      });
      this.map.once('moveend', () => {
        this.userInteracting = false;
        if (this.isSpinning) this._spinTick();
      });
    }
  },

  flyToLocation(lng, lat, zoom, name) {
    if (this.offlineActive && this.offlineView) { this.offlineView.flyToLocation(lng, lat, zoom, name); return; }
    if (this.map) {
      this.userInteracting = true; // hold off auto-spin while the camera flies
      this.map.flyTo({
        center: [lng, lat],
        zoom: zoom || 4.5,
        essential: true,
        speed: 1.2
      });
      this.map.once('moveend', () => {
        this.userInteracting = false;
        if (this.isSpinning) this._spinTick();
      });

      const titleEl = document.getElementById('globe-target-title');
      if (titleEl) titleEl.innerText = name || `Focus: ${lng.toFixed(2)}, ${lat.toFixed(2)}`;
    }
  }
};

// Expose module globally so `window.mapLibreGlobe` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.mapLibreGlobe = mapLibreGlobe;
