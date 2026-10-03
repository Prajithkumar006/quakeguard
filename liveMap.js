/* ==========================================================================
   QuakeGuard - Live Map Engine (Google Maps API & Multi-Layer Tiles)
   ========================================================================== */

const quakeDatabase = {
  // 1. GLOBAL HISTORICAL EARTHQUAKES DATABASE (Worldwide Coverage)
  historicalQuakes: [
    // --- TAMIL NADU & SOUTH INDIA ---
    { id: "hq_tn1", mag: 5.6, place: "2001 Cuddalore-Puducherry Coast Earthquake (Tamil Nadu, India)", lat: 11.950, lng: 79.830, depth: 10.0, year: 2001, casualties: "5 dead, 100+ injured", tsunami: "No (Coastal Shaking)" },
    { id: "hq_tn2", mag: 6.0, place: "1900 Coimbatore Earthquake (Tamil Nadu Moyar Shear, India)", lat: 10.990, lng: 76.960, depth: 15.0, year: 1900, casualties: "Heavy Structural Damage", tsunami: "No" },
    { id: "hq_tn3", mag: 9.1, place: "2004 Sumatra Tsunami Impact (Nagapattinam & Chennai, TN, India)", lat: 3.316, lng: 95.854, depth: 30.0, year: 2004, casualties: "10,000+ in Tamil Nadu", tsunami: "Yes (10m Tsunami Wave in TN)" },
    
    // --- INDIA & HIMALAYAN REGION ---
    { id: "hq_in1", mag: 7.7, place: "2001 Bhuj Gujarat Earthquake (India)", lat: 23.419, lng: 70.232, depth: 16.0, year: 2001, casualties: "20,085 dead", tsunami: "No" },
    { id: "hq_in2", mag: 6.2, place: "1993 Killari Latur Earthquake (Peninsular India)", lat: 18.080, lng: 76.520, depth: 10.0, year: 1993, casualties: "9,748 dead", tsunami: "No" },
    { id: "hq_in3", mag: 6.8, place: "1999 Chamoli Earthquake (Uttarakhand, India)", lat: 30.492, lng: 79.288, depth: 15.0, year: 1999, casualties: "103 dead", tsunami: "No" },
    { id: "hq_in4", mag: 5.7, place: "1969 Godavari Valley Bhadrachalam Earthquake (India)", lat: 17.900, lng: 80.600, depth: 12.0, year: 1969, casualties: "Minor Structural Damage", tsunami: "No" },
    { id: "hq_in5", mag: 8.1, place: "1897 Great Assam Earthquake (Shillong Plateau, India)", lat: 26.000, lng: 91.500, depth: 35.0, year: 1897, casualties: "1,542 dead", tsunami: "No" },
    { id: "hq_np1", mag: 7.8, place: "2015 Gorkha Nepal Earthquake (Himalayan Fault)", lat: 28.147, lng: 84.708, depth: 8.2, year: 2015, casualties: "8,964 dead", tsunami: "No" },
    { id: "hq_pk1", mag: 7.6, place: "2005 Kashmir Earthquake (Muzaffarabad / Northern India)", lat: 34.493, lng: 73.629, depth: 26.0, year: 2005, casualties: "87,351 dead", tsunami: "No" },

    // --- JAPAN & EAST ASIA ---
    { id: "hq_jp1", mag: 9.1, place: "2011 Great East Japan (Tohoku) Megathrust Earthquake", lat: 38.297, lng: 142.372, depth: 29.0, year: 2011, casualties: "19,759 dead", tsunami: "Yes (40.5m Tsunami Wave)" },
    { id: "hq_jp2", mag: 7.5, place: "2024 Noto Peninsula Earthquake (Ishikawa, Japan)", lat: 37.500, lng: 137.200, depth: 10.0, year: 2024, casualties: "245 dead", tsunami: "Yes (6.6m Tsunami Wave)" },
    { id: "hq_jp3", mag: 6.9, place: "1995 Great Hanshin Kobe Earthquake (Japan)", lat: 34.583, lng: 135.033, depth: 16.0, year: 1995, casualties: "6,434 dead", tsunami: "No" },
    { id: "hq_jp4", mag: 7.9, place: "1923 Great Kanto Earthquake (Tokyo-Yokohama, Japan)", lat: 35.200, lng: 139.300, depth: 15.0, year: 1923, casualties: "142,800 dead", tsunami: "Yes (12m Tsunami Wave)" },
    { id: "hq_jp5", mag: 7.0, place: "2016 Kumamoto Earthquakes (Kyushu, Japan)", lat: 32.755, lng: 130.763, depth: 10.0, year: 2016, casualties: "273 dead", tsunami: "No" },
    { id: "hq_cn1", mag: 8.0, place: "2008 Wenchuan Sichuan Earthquake (China)", lat: 31.002, lng: 103.367, depth: 19.0, year: 2008, casualties: "87,587 dead", tsunami: "No" },
    { id: "hq_cn2", mag: 7.6, place: "1976 Great Tangshan Earthquake (China)", lat: 39.570, lng: 118.090, depth: 12.0, year: 1976, casualties: "242,769 dead", tsunami: "No" },
    { id: "hq_tw1", mag: 7.4, place: "2024 Hualien Earthquake (Taiwan)", lat: 23.770, lng: 121.670, depth: 15.0, year: 2024, casualties: "18 dead, 1,100+ injured", tsunami: "Minor (0.5m)" },

    // --- NORTH AMERICA & PACIFIC RIM ---
    { id: "hq_us1", mag: 9.2, place: "1964 Great Alaska Good Friday Earthquake (USA)", lat: 61.020, lng: -147.650, depth: 25.0, year: 1964, casualties: "131 dead", tsunami: "Yes (67m Tsunami Wave)" },
    { id: "hq_us2", mag: 7.9, place: "1906 Great San Francisco Earthquake (California, USA)", lat: 37.750, lng: -122.550, depth: 10.0, year: 1906, casualties: "3,000+ dead", tsunami: "Minor" },
    { id: "hq_us3", mag: 6.7, place: "1994 Northridge Earthquake (Los Angeles, USA)", lat: 34.213, lng: -118.537, depth: 18.2, year: 1994, casualties: "57 dead", tsunami: "No" },
    { id: "hq_mx1", mag: 8.0, place: "1985 Mexico City Earthquake (Michoacan Subduction, Mexico)", lat: 18.190, lng: -102.533, depth: 20.0, year: 1985, casualties: "10,000+ dead", tsunami: "Yes (3m Tsunami)" },

    // --- SOUTH AMERICA ---
    { id: "hq_cl1", mag: 9.5, place: "1960 Valdivia Great Chilean Earthquake (Largest Recorded)", lat: -38.240, lng: -73.050, depth: 33.0, year: 1960, casualties: "6,000+ dead", tsunami: "Yes (25m Tsunami)" },
    { id: "hq_cl2", mag: 8.8, place: "2010 Maule Chilean Offshore Megathrust Earthquake", lat: -35.909, lng: -72.733, depth: 35.0, year: 2010, casualties: "525 dead", tsunami: "Yes (29m Tsunami)" },
    { id: "hq_pe1", mag: 7.9, place: "1970 Great Ancash Earthquake & Avalanche (Peru)", lat: -9.180, lng: -78.820, depth: 45.0, year: 1970, casualties: "70,000+ dead", tsunami: "No" },

    // --- EUROPE, MEDITERRANEAN & MIDDLE EAST ---
    { id: "hq_tr1", mag: 7.8, place: "2023 Kahramanmaras Turkey-Syria Earthquake", lat: 37.174, lng: 37.032, depth: 10.0, year: 2023, casualties: "59,259 dead", tsunami: "No" },
    { id: "hq_tr2", mag: 7.6, place: "1999 Izmit Earthquake (North Anatolian Fault, Turkey)", lat: 40.748, lng: 29.864, depth: 17.0, year: 1999, casualties: "17,127 dead", tsunami: "Yes (2.5m Tsunami)" },
    { id: "hq_ir1", mag: 6.6, place: "2003 Bam Earthquake (Southeastern Iran)", lat: 29.000, lng: 58.337, depth: 10.0, year: 2003, casualties: "34,000 dead", tsunami: "No" },
    { id: "hq_pt1", mag: 8.5, place: "1755 Great Lisbon Earthquake & Tsunami (Portugal)", lat: 36.000, lng: -11.000, depth: 30.0, year: 1755, casualties: "60,000+ dead", tsunami: "Yes (20m Tsunami)" },
    { id: "hq_it1", mag: 6.3, place: "2009 L'Aquila Earthquake (Abruzzo, Italy)", lat: 42.334, lng: 13.334, depth: 8.8, year: 2009, casualties: "308 dead", tsunami: "No" },

    // --- CARIBBEAN & OCEANIA ---
    { id: "hq_ht1", mag: 7.0, place: "2010 Port-au-Prince Haiti Earthquake", lat: 18.457, lng: -72.533, depth: 13.0, year: 2010, casualties: "160,000+ dead", tsunami: "Minor (3m)" },
    { id: "hq_nz1", mag: 6.2, place: "2011 Christchurch Earthquake (Canterbury, New Zealand)", lat: -43.583, lng: 172.680, depth: 5.0, year: 2011, casualties: "185 dead", tsunami: "No" }
  ],

  // 2. EMERGENCY RELIEF SHELTERS DATABASE (Worldwide)
  shelters: [
    { id: "sh_tn1", name: "Rajaji Community Disaster Relief Hub", city: "Chennai, Tamil Nadu, India", lat: 13.0827, lng: 80.2707, capacity: "2,500 beds", waterStatus: "Abundant Reserve", medicalRating: "Level A+", phone: "+91 44 2530-0000", img: "assets/shelter.jpg" },
    { id: "sh_tn2", name: "Coimbatore Disaster Relief Station", city: "Coimbatore, Tamil Nadu, India", lat: 11.0168, lng: 76.9558, capacity: "1,800 beds", waterStatus: "Sufficient", medicalRating: "Level A", phone: "+91 422 230-0000", img: "assets/shelter.jpg" },
    { id: "sh_tn3", name: "Nagapattinam Coastal Evacuation Shelter", city: "Nagapattinam, Tamil Nadu, India", lat: 10.7673, lng: 79.8449, capacity: "3,000 beds", waterStatus: "Full Coastal Reserve", medicalRating: "Level A", phone: "+91 4365 240-000", img: "assets/shelter.jpg" },
    { id: "sh_jp1", name: "Tokyo Disaster Prevention Relief Center", city: "Tokyo, Japan", lat: 35.689, lng: 139.691, capacity: "3,500 beds", waterStatus: "Full Reserve", medicalRating: "Level A+", phone: "+81 3-5321-1111", img: "assets/shelter.jpg" },
    { id: "sh_jp2", name: "Kobe Emergency Preparedness Station", city: "Kobe, Japan", lat: 34.690, lng: 135.195, capacity: "2,200 beds", waterStatus: "Abundant", medicalRating: "Level A", phone: "+81 78-322-5111", img: "assets/shelter.jpg" },
    { id: "sh_us1", name: "Central High Emergency Relief Hub", city: "San Francisco, USA", lat: 37.779, lng: -122.415, capacity: "850 beds", waterStatus: "Abundant", medicalRating: "Level A", phone: "+1 (415) 554-6000", img: "assets/shelter.jpg" },
    { id: "sh_tr1", name: "Istanbul Municipal Disaster Evacuation Complex", city: "Istanbul, Turkey", lat: 41.008, lng: 28.978, capacity: "2,000 beds", waterStatus: "Sufficient", medicalRating: "Level B", phone: "+90 212 455 1300", img: "assets/shelter.jpg" }
  ],

  // 3. TRAUMA HOSPITALS & MEDICAL CENTERS DATABASE (Worldwide)
  hospitals: [
    { id: "hp_tn1", name: "Rajiv Gandhi Govt General Hospital (RGGGH) Emergency Care", city: "Chennai, Tamil Nadu, India", lat: 13.0815, lng: 80.2762, beds: "150 Emergency Beds", traumaLevel: "Level I Trauma", helpline: "108 / +91 44 2530-5000" },
    { id: "hp_tn2", name: "Coimbatore Medical College Hospital Trauma Unit", city: "Coimbatore, Tamil Nadu, India", lat: 11.0026, lng: 76.9678, beds: "95 Trauma Beds", traumaLevel: "Level I Trauma", helpline: "108 / +91 422 230-1393" },
    { id: "hp_tn3", name: "JIPMER Emergency & Trauma Medical Center", city: "Puducherry / TN Border", lat: 11.9560, lng: 79.8000, beds: "110 ICU Beds", traumaLevel: "Level I Trauma", helpline: "+91 413 227-2380" },
    { id: "hp_jp1", name: "Tokyo Medical University Emergency Center", city: "Tokyo, Japan", lat: 35.693, lng: 139.690, beds: "120 ICU Beds", traumaLevel: "Level I Trauma", helpline: "+81 3-3342-6111" },
    { id: "hp_jp2", name: "Kobe University Hospital Disaster Care Center", city: "Kobe, Japan", lat: 34.685, lng: 135.166, beds: "85 Emergency Beds", traumaLevel: "Level I Trauma", helpline: "+81 78-382-5111" },
    { id: "hp_us1", name: "St. Jude Regional Trauma Center", city: "San Francisco, USA", lat: 37.772, lng: -122.428, beds: "45 Trauma Beds", traumaLevel: "Level I Trauma", helpline: "911 / (415) 206-8000" }
  ],

  // 4. POLICE & SEARCH-AND-RESCUE (SAR) UNITS DATABASE
  policeStations: [
    { id: "po_tn1", name: "Tamil Nadu Disaster Response Force (TNDRF) Command", city: "Chennai, Tamil Nadu, India", lat: 13.040, lng: 80.250, units: "16 K9 SAR Teams + Flood Rescue", phone: "100 / +91 44 2844-0000" },
    { id: "po_jp1", name: "Tokyo Metropolitan Police SAR Command", city: "Tokyo, Japan", lat: 35.678, lng: 139.754, units: "20 Rapid Disaster Response Squads", phone: "110 / +81 3-3581-4321" },
    { id: "po_us1", name: "Central District Police & Search-and-Rescue Command", city: "San Francisco, USA", lat: 37.798, lng: -122.408, units: "12 K9 SAR Teams On Standby", phone: "+1 (415) 553-0123" }
  ],

  // 5. FIRE & HEAVY DISASTER RESCUE STATIONS DATABASE
  fireStations: [
    { id: "fs_tn1", name: "Tamil Nadu Fire & Rescue Services (TNFRS) Headquarters", city: "Chennai, Tamil Nadu, India", lat: 13.070, lng: 80.260, trucks: "8 Extrication Trucks + Water Rescue", phone: "101 / +91 44 2855-0000" },
    { id: "fs_jp1", name: "Tokyo Fire Department Heavy Rescue Battalion", city: "Tokyo, Japan", lat: 35.685, lng: 139.760, trucks: "12 Urban Search & Rescue Heavy Engines", phone: "119 / +81 3-3212-2111" }
  ],

  // 6. MAJOR GEOLOGICAL FAULT LINES DATABASE (Global Coverage)
  faultLines: [
    {
      name: "Moyar-Bhavani Shear Zone (Tamil Nadu, India)",
      type: "Proterozoic Shear Fault",
      length: "200 km",
      slipRate: "1-3 mm/yr",
      coords: [
        [11.500, 76.200], [11.350, 76.600], [11.100, 76.950],
        [11.000, 77.300], [10.900, 77.800]
      ]
    },
    {
      name: "Main Himalayan Thrust System (India / Nepal)",
      type: "Continental Collision Megathrust",
      length: "2,400 km",
      slipRate: "15-20 mm/yr",
      coords: [
        [34.000, 74.000], [31.500, 78.000], [28.500, 84.000],
        [27.000, 89.000], [27.500, 94.000]
      ]
    },
    {
      name: "Japan Trench Subduction Megathrust Zone (Japan)",
      type: "Subduction Megathrust Fault",
      length: "800 km",
      slipRate: "80-90 mm/yr",
      coords: [
        [41.000, 144.500], [39.500, 143.800], [38.000, 143.000],
        [36.500, 142.200], [35.000, 141.500]
      ]
    },
    {
      name: "Nankai Trough Megathrust Fault (Japan)",
      type: "Subduction Megathrust",
      length: "700 km",
      slipRate: "40-65 mm/yr",
      coords: [
        [35.000, 139.000], [34.000, 137.500], [33.000, 135.500],
        [32.000, 133.000]
      ]
    },
    {
      name: "San Andreas Fault System (California, USA)",
      type: "Transform Fault",
      length: "1,200 km",
      slipRate: "20-35 mm/yr",
      coords: [
        [32.700, -114.700], [33.700, -116.200], [34.500, -118.100],
        [35.300, -120.200], [36.800, -121.500], [37.7749, -122.4194]
      ]
    },
    {
      name: "North Anatolian Fault Zone (Turkey)",
      type: "Right-Lateral Strike-Slip Fault",
      length: "1,500 km",
      slipRate: "24 mm/yr",
      coords: [
        [40.700, 27.500], [40.800, 29.500], [40.900, 32.000],
        [40.300, 36.000], [39.800, 40.000]
      ]
    }
  ]
};

const liveMap = {
  dashMap: null,
  fullMap: null,
  activeTileLayer: null,
  activeMapStyle: 'carto-dark', // 100% Keyless, Open-Source Free Map Tiles
  
  earthquakeLayers: [],
  shelterLayers: [],
  hospitalLayers: [],
  policeLayers: [],
  fireLayers: [],
  faultLayers: [],
  routeLayers: [],
  userLocationMarker: null,
  userAccuracyCircle: null,

  showSheltersState: true,
  showHospitalsState: true,
  showPoliceState: true,
  showFireState: true,
  showFaultsState: true,
  activeDataSource: 'usgs-live',

  // 100% Keyless Open-Source Tile Provider Endpoints.
  // NOTE: CARTO's basemaps.cartocdn.com tiles now require a free API key —
  // without one they render with an "API KEY REQUIRED" watermark instead of
  // failing outright. Swapped those styles for Esri's long-standing free,
  // keyless legacy basemap tile services (services.arcgisonline.com) so the
  // "dark", "light" and "voyager"-style options keep working with no signup.
  //
  // `maxNativeZoom` is the deepest zoom level the tile SERVER actually has
  // imagery for. Without it, Leaflet kept requesting tiles past that point
  // and got back nothing for many areas — the "map data not available"
  // gaps when zooming in. Leaflet now stops requesting past this level and
  // instead smoothly upscales the last real tile, so there's always
  // something to look at.
  //
  // `referenceUrl`, where present, is Esri's paired "Reference" layer — the
  // Dark/Light Gray "Canvas" base tiles ship with NO text at all by design,
  // so without this overlay the map has no country, city, road or place
  // names anywhere. It's drawn on top of the base layer automatically.
  tileProviders: {
    'carto-dark': {
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      referenceUrl: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      maxNativeZoom: 16,
      attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap contributors'
    },
    'openstreetmap': {
      // tile.openstreetmap.org's usage policy explicitly disallows embedding
      // in distributed/bundled apps like this one — it has started 403-ing
      // this app ("Access blocked... App is not following the tile usage
      // policy"). Wikimedia's maps.wikimedia.org mirror serves the same OSM
      // data (place names included) and is intended for exactly this kind
      // of reuse, no key needed.
      url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
      maxNativeZoom: 19,
      attribution: '&copy; OpenStreetMap contributors, tiles by Wikimedia'
    },
    'mapcn-light': {
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      referenceUrl: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      maxNativeZoom: 16,
      attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap contributors'
    },
    'opentopo': {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      subdomains: 'abc',
      maxNativeZoom: 17,
      attribution: '&copy; OpenTopoMap & OpenStreetMap'
    },
    'carto-voyager': {
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      maxNativeZoom: 19,
      attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap contributors'
    }
  },

  // Shows a clear, actionable message instead of a silent blank box when
  // the Leaflet library hasn't loaded (blocked CDN, no internet, etc.)
  _libFailedHTML() {
    return `
      <div style="width:100%; height:100%; min-height:200px; display:flex; align-items:center; justify-content:center; text-align:center; padding:1.5rem; background:#0f172a; border-radius:12px; color:#e2e8f0; font-family:sans-serif;">
        <div>
          <i class="fa-solid fa-map-location-dot" style="font-size:1.8rem; color:#f97316;"></i>
          <div style="font-weight:800; margin-top:0.5rem;">Map library couldn't load</div>
          <div style="font-size:0.82rem; color:#94a3b8; margin-top:0.35rem; max-width:340px;">
            Leaflet failed to load from the CDN. This usually means there's no internet
            connection right now, or the page was opened as a local file
            (double-clicked) instead of served over http(s). Serving it via
            <code>server.ps1</code> / <code>run_app.bat</code> and confirming you're online
            should fix this.
          </div>
          <button class="btn btn-outline" style="margin-top:0.75rem; font-size:0.8rem;" onclick="liveMap.retryInit()">
            <i class="fa-solid fa-rotate-right"></i> Retry
          </button>
        </div>
      </div>`;
  },

  retryInit() {
    this.dashMap = null;
    this.fullMap = null;
    this.initDashboardMap();
    this.initFullMap();
  },

  // Waits briefly for the Leaflet global (`L`) to appear before giving up —
  // handles the case where the CDN script is just slow rather than blocked.
  _waitForLeaflet(callback, attempt) {
    attempt = attempt || 0;
    if (window.L) { callback(); return; }
    if (attempt >= 20) { // ~4 seconds total
      console.warn('[QuakeGuard Live Map] Leaflet did not load after waiting — check network/CDN access.');
      // Leaflet (loaded from a CDN) isn't available, most likely because the
      // device is offline and the library was never cached. Instead of a dead
      // error box, fall back to the built-in offline map, which needs no library.
      const dash = document.getElementById('dash-map-container');
      const full = document.getElementById('full-map-container');
      const ok = window.offlineBasemap && window.OFFLINE_GEO;
      if (dash && !this.dashMap) { if (ok) this._mountOfflineOnly('dashboard', dash); else dash.innerHTML = this._libFailedHTML(); }
      if (full && !this.fullMap) { if (ok) this._mountOfflineOnly('full', full); else full.innerHTML = this._libFailedHTML(); }
      return;
    }
    setTimeout(() => this._waitForLeaflet(callback, attempt + 1), 200);
  },

  initDashboardMap() {
    const container = document.getElementById('dash-map-container');
    if (!container) return;

    if (typeof L === 'undefined') {
      this._waitForLeaflet(() => this.initDashboardMap());
      return;
    }

    if (!this.dashMap) {
      this.dashMap = L.map('dash-map-container', {
        zoomControl: false,
        minZoom: 1,
        maxZoom: 19,
        worldCopyJump: true,
        preferCanvas: true,   // canvas rendering for markers/circles — much faster than SVG
        fadeAnimation: false, // skip the tile fade-in transition for snappier-feeling loads
        wheelPxPerZoomLevel: 100
      }).setView([13.0827, 80.2707], 3);
      
      this.setMapTileStyle(this.dashMap, 'carto-dark');
      this.renderQuakesOnMap(this.dashMap, quakeDatabase.historicalQuakes);
      if (window.offlineBasemap) offlineBasemap.attachUnderlay(this.dashMap);   // land/sea shows even where tiles were never cached
      if (this._offlineWanted.dashboard) this.setOfflineMap('dashboard', true);
    }

    setTimeout(() => {
      if (this.dashMap) this.dashMap.invalidateSize();
    }, 200);
  },

  initFullMap() {
    const container = document.getElementById('full-map-container');
    if (!container) return;

    if (typeof L === 'undefined') {
      this._waitForLeaflet(() => this.initFullMap());
      return;
    }

    if (!this.fullMap) {
      this.fullMap = L.map('full-map-container', {
        minZoom: 1,
        maxZoom: 19,
        worldCopyJump: true,
        preferCanvas: true,   // canvas rendering for markers/circles — much faster than SVG
        fadeAnimation: false, // skip the tile fade-in transition for snappier-feeling loads
        wheelPxPerZoomLevel: 100
      }).setView([20.0, 0.0], 2);

      this.setMapTileStyle(this.fullMap, this.activeMapStyle);
      if (window.offlineBasemap) offlineBasemap.attachUnderlay(this.fullMap);
      this.renderInfrastructureAndFaults();
      this.loadSelectedDataset();
      if (this._offlineWanted.full) this.setOfflineMap('full', true);
    }

    setTimeout(() => {
      if (this.fullMap) this.fullMap.invalidateSize();
    }, 200);
  },

  // ======================================================================
  // Offline map support (see offlineBasemap.js)
  //  - an offline underlay under the tiles, so uncached areas still show land/sea
  //  - an Offline Map overlay (own renderer, no tiles, no library) that the
  //    person can switch on, and that switches itself on when tiles can't load
  //  - the last live quake feed is saved on the device for use while offline
  // ======================================================================
  _offlineWanted: { dashboard: false, full: false },
  _offlineViews: { dashboard: null, full: null },
  _containerId(which) { return which === 'dashboard' ? 'dash-map-container' : 'full-map-container'; },
  _offlineBtn(which) { return document.getElementById(which === 'dashboard' ? 'dash-offlinemap-btn' : 'full-offlinemap-btn'); },

  _watchTiles(map, layer) {
    let errs = 0, loads = 0, timer = null;
    layer.on('tileload', () => { loads++; });
    layer.on('tileerror', () => {
      errs++;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const which = map === this.dashMap ? 'dashboard' : map === this.fullMap ? 'full' : null;
        if (which && errs >= 4 && loads === 0 && !this._offlineWanted[which] && !this._offlineAutoDismissed) {
          this.setOfflineMap(which, true, 'Map tiles are not available right now, so the built-in offline map is shown.');
        }
      }, 1800);
    });
  },

  _setOfflineBtnState(which, on) {
    const b = this._offlineBtn(which); if (!b) return;
    b.classList.toggle('btn-primary', on); b.classList.toggle('btn-outline', !on);
    const sp = b.querySelector('span'); if (sp) sp.textContent = on ? 'Live Map' : 'Offline Map';
    b.title = on ? 'Back to the live tile map' : 'Switch between the live tile map and the built-in offline map';
  },

  toggleOfflineMap(which) { this.setOfflineMap(which, !this._offlineWanted[which]); },

  setOfflineMap(which, on, note) {
    if (!window.offlineBasemap || !window.OFFLINE_GEO) return;
    const container = document.getElementById(this._containerId(which)); if (!container) return;
    const map = which === 'dashboard' ? this.dashMap : this.fullMap;
    this._offlineWanted[which] = !!on;
    if (!on) this._offlineAutoDismissed = true;
    if (!map) { this._mountOfflineOnly(which, container); return; }   // Leaflet not available: offline view is the only view
    let host = container.querySelector(':scope > .qg-offline-host');
    if (on) {
      if (!host) {
        host = document.createElement('div'); host.className = 'qg-offline-host';
        host.style.cssText = 'position:absolute;inset:0;z-index:1200;border-radius:inherit;overflow:hidden;';
        container.appendChild(host);
      }
      host.style.display = 'block';
      const small = which === 'dashboard';
      if (!this._offlineViews[which]) {
        const c = map.getCenter();
        this._offlineViews[which] = offlineBasemap.mountFlat(host, { lat: c.lat, lng: c.lng, zoom: Math.max(1, Math.min(map.getZoom(), 9)), layers: small ? { shelters: false, hospitals: false, police: false, fire: false, faults: false } : {} });
      } else { this._offlineViews[which].resize(); }
      if (which === 'full') { const sel = document.getElementById('map-filter-mag'); if (sel) this._offlineViews.full.setMinMag(parseFloat(sel.value || 0)); }
      if (note) this._offlineNote(host, note);
    } else if (host) {
      host.style.display = 'none';
      map.invalidateSize();
    }
    this._setOfflineBtnState(which, !!on);
  },

  _offlineNote(host, text) {
    const n = document.createElement('div');
    n.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);bottom:44px;max-width:80%;z-index:6;background:rgba(15,23,42,.92);color:#e2e8f0;border:1px solid rgba(148,163,184,.4);border-radius:10px;padding:6px 12px;font:600 12px Inter,system-ui,sans-serif;text-align:center;';
    n.textContent = text; host.appendChild(n); setTimeout(() => n.remove(), 7000);
  },

  // Leaflet missing entirely: the offline map takes the whole container
  _mountOfflineOnly(which, container) {
    if (!window.offlineBasemap || !window.OFFLINE_GEO) return;
    this._offlineWanted[which] = true;
    container.innerHTML = '';
    const small = which === 'dashboard';
    this._offlineViews[which] = offlineBasemap.mountFlat(container, { lat: small ? 13 : 20, lng: small ? 80 : 0, zoom: small ? 3 : 2, layers: small ? { shelters: false, hospitals: false, police: false, fire: false, faults: false } : {} });
    if (which === 'full') { const sel = document.getElementById('map-filter-mag'); if (sel) this._offlineViews.full.setMinMag(parseFloat(sel.value || 0)); }
    this._offlineNote(container, 'Offline map: the map library could not load, so the built-in map is shown.');
    this._setOfflineBtnState(which, true);
  },

  _offlineActive(which) { return !!(this._offlineWanted[which] && this._offlineViews[which]); },

  // remember the last good live feed so it can be shown (and asked about) without internet
  _saveFeed(quakes) {
    try { localStorage.setItem('qg_last_feed', JSON.stringify({ savedAt: Date.now(), quakes })); } catch (e) { /* storage full or blocked */ }
    if (window.offlineBasemap) offlineBasemap.refresh();
  },
  // Downloads and saves the live feed without drawing it (used by "Prepare Offline Pack")
  async refreshSavedFeed() {
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
      const data = await response.json();
      const parsed = data.features.map(f => ({
        id: f.id, mag: f.properties.mag, place: f.properties.place, time: f.properties.time,
        lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], depth: f.geometry.coordinates[2]
      })).slice(0, 35);
      this._saveFeed(parsed);
      return parsed.length;
    } catch (e) { return 0; }
  },
  _loadSavedFeed() {
    try { const f = JSON.parse(localStorage.getItem('qg_last_feed') || 'null'); return f && f.quakes && f.quakes.length ? f : null; } catch (e) { return null; }
  },

  setMapTileStyle(mapInstance, styleKey) {
    if (!mapInstance) return;

    // Remove any previously active base + label layers on THIS map instance
    // (dashboard mini-map and full map are tracked independently).
    if (mapInstance._qgBaseLayer) mapInstance.removeLayer(mapInstance._qgBaseLayer);
    if (mapInstance._qgLabelLayer) mapInstance.removeLayer(mapInstance._qgLabelLayer);

    const provider = this.tileProviders[styleKey] || this.tileProviders['carto-dark'];
    const nativeZoom = provider.maxNativeZoom || 19;

    const commonTileOptions = {
      minZoom: 1,
      maxZoom: 19,
      // Stops network requests past the tile server's real resolution and
      // upscales the last good tile instead — this is what fixes the grey
      // "map data not available" tiles when zooming in close.
      maxNativeZoom: nativeZoom,
      subdomains: provider.subdomains || 'abc',
      // Faster, smoother panning/zooming: don't re-request tiles mid-zoom,
      // and keep a wider ring of already-loaded tiles around the viewport.
      updateWhenZooming: false,
      keepBuffer: 4,
      attribution: provider.attribution
    };

    const baseLayer = L.tileLayer(provider.url, commonTileOptions).addTo(mapInstance);
    mapInstance._qgBaseLayer = baseLayer;
    this._watchTiles(mapInstance, baseLayer);

    // Place-name / label overlay — only the Esri "Canvas" base styles need
    // this; OpenStreetMap, OpenTopoMap and the Esri Street Map already
    // include their own place, city and road labels.
    if (provider.referenceUrl) {
      const labelLayer = L.tileLayer(provider.referenceUrl, {
        ...commonTileOptions,
        opacity: 0.95
      }).addTo(mapInstance);
      mapInstance._qgLabelLayer = labelLayer;
    }

    if (mapInstance === this.fullMap) {
      this.activeTileLayer = baseLayer;
      this.activeMapStyle = styleKey;
    }
  },

  changeMapStyle(styleKey) {
    this.setMapTileStyle(this.fullMap, styleKey);
  },

  flyToWorldMap() {
    if (!this.fullMap && this._offlineActive('full')) { this._offlineViews.full.flyTo(20, 0, 2); return; }
    if (!this.fullMap) {
      appRouter.navigate('map');
      setTimeout(() => this.flyToWorldMap(), 300);
      return;
    }
    if (this._offlineActive('full')) { this._offlineViews.full.flyTo(20, 0, 2); return; }
    this.fullMap.flyTo([20.0, 0.0], 2, { duration: 1.5 });
  },

  flyToLocation(lat, lng, zoom = 12, label = 'Target Epicenter Location') {
    if (!this.fullMap && this._offlineActive('full')) { this._offlineViews.full.flyTo(lat, lng, Math.min(zoom, 10)); return; }
    if (!this.fullMap) {
      appRouter.navigate('map');
      setTimeout(() => this.flyToLocation(lat, lng, zoom, label), 300);
      return;
    }
    if (this._offlineActive('full')) { this._offlineViews.full.flyTo(lat, lng, Math.min(zoom, 10)); return; }
    this.fullMap.flyTo([lat, lng], zoom, { duration: 1.5 });
    
    L.popup()
      .setLatLng([lat, lng])
      .setContent(`
        <div style="font-family: sans-serif; text-align: center; padding: 4px;">
          <h4 style="margin: 0; color: #0284c7; font-weight: 800;">📍 ${label}</h4>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        </div>
      `)
      .openOn(this.fullMap);
  },

  flyToCoimbatore() {
    this.flyToLocation(11.0168, 76.9558, 13, 'Coimbatore Disaster Command Zone');
  },


  setDataSource(source) {
    this.activeDataSource = source;
    this.loadSelectedDataset();
  },

  async loadSelectedDataset() {
    if (!this.fullMap) return;

    this.earthquakeLayers.forEach(layer => this.fullMap.removeLayer(layer));
    this.earthquakeLayers = [];

    if (this.activeDataSource === 'usgs-live') {
      await this.fetchUSGSFeed();
    } else if (this.activeDataSource === 'emsc-live') {
      await this.fetchEMSCFeed();
    } else if (this.activeDataSource === 'historical') {
      this.renderQuakesOnMap(this.fullMap, quakeDatabase.historicalQuakes);
      this.updateRecentQuakeListUI(quakeDatabase.historicalQuakes);
    }
  },

  async fetchUSGSFeed() {
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
      const data = await response.json();
      
      const parsedQuakes = data.features.map(f => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2]
      })).slice(0, 35);

      this._saveFeed(parsedQuakes);
      this.renderQuakesOnMap(this.fullMap, parsedQuakes);
      this.updateRecentQuakeListUI(parsedQuakes);
    } catch (err) {
      const saved = this._loadSavedFeed();
      if (saved) {
        // Offline: show the last live feed this device saved instead of only the old catalogue
        console.warn('[QuakeGuard Map] USGS unreachable, showing the feed saved on this device.', err);
        this.renderQuakesOnMap(this.fullMap, saved.quakes);
        this.updateRecentQuakeListUI(saved.quakes);
      } else {
        console.warn('[QuakeGuard Map] USGS API Offline, falling back to Historical Catalog.', err);
        this.renderQuakesOnMap(this.fullMap, quakeDatabase.historicalQuakes);
        this.updateRecentQuakeListUI(quakeDatabase.historicalQuakes);
      }
    }
  },

  async fetchEMSCFeed() {
    const emscQuakes = [
      { id: "em1", mag: 5.6, place: "Central Mediterranean Sea", time: Date.now() - 1200000, lat: 36.410, lng: 22.150, depth: 15.0 },
      { id: "em2", mag: 4.8, place: "Eastern Turkey - Malatya Region", time: Date.now() - 3600000, lat: 38.350, lng: 38.310, depth: 10.0 },
      { id: "em3", mag: 4.2, place: "Central Apennines, Italy", time: Date.now() - 7200000, lat: 42.630, lng: 13.280, depth: 8.5 }
    ];
    this.renderQuakesOnMap(this.fullMap, emscQuakes);
    this.updateRecentQuakeListUI(emscQuakes);
  },

  renderQuakesOnMap(mapInstance, quakes) {
    if (!mapInstance) return;

    // Build every circle marker first, then add them to the map as one
    // batch via a layerGroup instead of one individual .addTo() call per
    // quake — a single insert instead of N separate ones, faster on
    // pages with many quakes (e.g. after the live USGS feed adds more).
    const newLayers = [];
    quakes.forEach(q => {
      const color = q.mag >= 7.0 ? '#dc2626' : q.mag >= 6.0 ? '#ef4444' : q.mag >= 4.5 ? '#f97316' : '#3b82f6';
      const radius = Math.max(q.mag * 4.5, 8);

      const circle = L.circleMarker([q.lat, q.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        radius: radius
      });

      let popupHtml = `
        <div style="font-family: sans-serif; padding: 6px; min-width: 200px;">
          <h4 style="margin: 0; color: ${color}; font-weight: 800; font-size: 1rem;">M ${q.mag.toFixed(1)} Earthquake</h4>
          <div style="font-weight: 700; margin: 4px 0; font-size: 0.9rem;">${q.place}</div>
          <div style="font-size: 0.8rem; color: #555;">Focal Depth: ${q.depth} km</div>
      `;

      if (q.casualties) {
        popupHtml += `<div style="font-size: 0.8rem; color: #dc2626; font-weight: 700; margin-top: 2px;">Casualties: ${q.casualties}</div>`;
      }
      if (q.tsunami) {
        popupHtml += `<div style="font-size: 0.8rem; color: #2563eb; font-weight: 700;">Tsunami Alert: ${q.tsunami}</div>`;
      }

      popupHtml += `
          <button onclick="sosManager.triggerSOSModal()" style="margin-top: 8px; width: 100%; background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            Trigger SOS Response
          </button>
        </div>
      `;

      circle.bindPopup(popupHtml);
      newLayers.push(circle);
    });

    // One batched insert instead of N — Leaflet only has to run its
    // "add to map" bookkeeping once for the whole group.
    L.layerGroup(newLayers).addTo(mapInstance);
    this.earthquakeLayers.push(...newLayers);
  },

  renderInfrastructureAndFaults() {
    if (!this.fullMap) return;

    // 1. Render Shelters with Custom DivIcon
    const shelterIcon = L.divIcon({
      className: 'map-div-marker shelter',
      html: '<i class="fa-solid fa-house-medical"></i>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    quakeDatabase.shelters.forEach(s => {
      const marker = L.marker([s.lat, s.lng], { icon: shelterIcon }).addTo(this.fullMap);
      marker.bindTooltip(s.name, { permanent: true, direction: 'top', offset: [0, -14], className: 'qg-map-label qg-map-label-shelter' });
      marker.bindPopup(`
        <div style="font-family: sans-serif; text-align: center; width: 220px;">
          <img src="${s.img}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;">
          <h4 style="margin: 0; color: #2563eb; font-weight: 800;">🏠 ${s.name}</h4>
          <div style="font-size: 0.82rem; margin-top: 4px; color: #555;">${s.city}</div>
          <div style="font-size: 0.85rem; margin-top: 4px;">Capacity: <strong>${s.capacity}</strong></div>
          <div style="font-size: 0.8rem; color: #10b981; font-weight: 700;">Water Reserve: ${s.waterStatus}</div>
          <button onclick="liveMap.showEvacuationRoute([${s.lat}, ${s.lng}], '${s.name}', '#2563eb')" style="margin-top: 8px; width: 100%; background: #2563eb; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            Navigate Evacuation Route
          </button>
        </div>
      `);
      this.shelterLayers.push(marker);
    });

    // 2. Render Hospitals
    const hospitalIcon = L.divIcon({
      className: 'map-div-marker hospital',
      html: '<i class="fa-solid fa-hospital"></i>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    quakeDatabase.hospitals.forEach(h => {
      const marker = L.marker([h.lat, h.lng], { icon: hospitalIcon }).addTo(this.fullMap);
      marker.bindTooltip(h.name, { permanent: true, direction: 'top', offset: [0, -14], className: 'qg-map-label qg-map-label-hospital' });
      marker.bindPopup(`
        <div style="font-family: sans-serif; width: 210px;">
          <h4 style="margin: 0; color: #ef4444; font-weight: 800;">🏥 ${h.name}</h4>
          <div style="font-size: 0.82rem; color: #555;">${h.city} | ${h.traumaLevel}</div>
          <div style="font-size: 0.85rem; margin-top: 4px; color: #10b981; font-weight: 700;">${h.beds}</div>
          <div style="font-size: 0.8rem; margin-top: 4px;">Helpline: <strong>${h.helpline}</strong></div>
          <button onclick="liveMap.showEvacuationRoute([${h.lat}, ${h.lng}], '${h.name}', '#ef4444')" style="margin-top: 8px; width: 100%; background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            Navigate Evacuation Route
          </button>
        </div>
      `);
      this.hospitalLayers.push(marker);
    });

    // 3. Render Police Stations
    const policeIcon = L.divIcon({
      className: 'map-div-marker police',
      html: '<i class="fa-solid fa-shield-halved"></i>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    quakeDatabase.policeStations.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: policeIcon }).addTo(this.fullMap);
      marker.bindTooltip(p.name, { permanent: true, direction: 'top', offset: [0, -13], className: 'qg-map-label qg-map-label-police' });
      marker.bindPopup(`
        <div style="font-family: sans-serif; width: 200px;">
          <h4 style="margin: 0; color: #3b82f6; font-weight: 800;">🚓 ${p.name}</h4>
          <div style="font-size: 0.82rem; color: #555;">${p.city}</div>
          <div style="font-size: 0.85rem; margin-top: 4px; color: #2563eb; font-weight: 700;">${p.units}</div>
          <div style="font-size: 0.8rem; margin-top: 2px;">Phone: <strong>${p.phone}</strong></div>
          <button onclick="liveMap.showEvacuationRoute([${p.lat}, ${p.lng}], '${p.name}', '#3b82f6')" style="margin-top: 8px; width: 100%; background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            Navigate Evacuation Route
          </button>
        </div>
      `);
      this.policeLayers.push(marker);
    });

    // 4. Render Heavy Fire Rescue Stations
    const fireIcon = L.divIcon({
      className: 'map-div-marker fire',
      html: '<i class="fa-solid fa-fire-extinguisher"></i>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    quakeDatabase.fireStations.forEach(f => {
      const marker = L.marker([f.lat, f.lng], { icon: fireIcon }).addTo(this.fullMap);
      marker.bindTooltip(f.name, { permanent: true, direction: 'top', offset: [0, -13], className: 'qg-map-label qg-map-label-fire' });
      marker.bindPopup(`
        <div style="font-family: sans-serif; width: 200px;">
          <h4 style="margin: 0; color: #f97316; font-weight: 800;">🚒 ${f.name}</h4>
          <div style="font-size: 0.82rem; color: #555;">${f.city}</div>
          <div style="font-size: 0.85rem; margin-top: 4px; color: #f97316; font-weight: 700;">${f.trucks}</div>
          <div style="font-size: 0.8rem; margin-top: 2px;">Dispatch: <strong>${f.phone}</strong></div>
          <button onclick="liveMap.showEvacuationRoute([${f.lat}, ${f.lng}], '${f.name}', '#f97316')" style="margin-top: 8px; width: 100%; background: #f97316; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            Navigate Evacuation Route
          </button>
        </div>
      `);
      this.fireLayers.push(marker);
    });

    // 5. Render Geological Fault Lines
    quakeDatabase.faultLines.forEach(fl => {
      const polyline = L.polyline(fl.coords, {
        color: '#f97316',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(this.fullMap);

      polyline.bindPopup(`
        <div style="font-family: sans-serif;">
          <h4 style="margin: 0; color: #f97316; font-weight: 800;">⚡ ${fl.name}</h4>
          <div style="font-size: 0.85rem; margin-top: 4px;">Type: <strong>${fl.type}</strong></div>
          <div style="font-size: 0.85rem;">Length: <strong>${fl.length}</strong> | Slip Rate: <strong>${fl.slipRate}</strong></div>
        </div>
      `);

      this.faultLayers.push(polyline);
    });
  },

  updateRecentQuakeListUI(quakes) {
    const container = document.getElementById('recent-quake-list');
    if (!container) return;

    container.innerHTML = quakes.map(q => {
      const badgeClass = q.mag >= 7.0 ? 'badge-danger' : q.mag >= 6.0 ? 'badge-danger' : q.mag >= 4.5 ? 'badge-warning' : 'badge-info';
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge ${badgeClass}" style="font-size: 0.9rem; padding: 0.4rem 0.75rem;">M ${q.mag.toFixed(1)}</span>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">${q.place}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Focal Depth: ${q.depth}km | ${q.year ? 'Year ' + q.year : new Date(q.time).toLocaleTimeString()}</div>
            </div>
          </div>
          <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="appRouter.navigate('map')">
            Locate <i class="fa-solid fa-crosshairs"></i>
          </button>
        </div>
      `;
    }).join('');
  },

  filterEarthquakes() {
    const minMag = parseFloat(document.getElementById('map-filter-mag').value || 0);
    if (this._offlineViews.full) this._offlineViews.full.setMinMag(minMag);
    if (!this.fullMap) return;
    this.earthquakeLayers.forEach(layer => this.fullMap.removeLayer(layer));
    this.earthquakeLayers = [];

    const sourceData = this.activeDataSource === 'historical' ? quakeDatabase.historicalQuakes : quakeDatabase.historicalQuakes;
    const filtered = sourceData.filter(q => q.mag >= minMag);
    this.renderQuakesOnMap(this.fullMap, filtered);
  },

  toggleShelters() {
    this.showSheltersState = !this.showSheltersState;
    if (this._offlineViews.full) this._offlineViews.full.setLayer('shelters', this.showSheltersState);
    if (!this.fullMap) return;
    this.shelterLayers.forEach(l => this.showSheltersState ? this.fullMap.addLayer(l) : this.fullMap.removeLayer(l));
  },

  toggleHospitals() {
    this.showHospitalsState = !this.showHospitalsState;
    if (this._offlineViews.full) this._offlineViews.full.setLayer('hospitals', this.showHospitalsState);
    if (!this.fullMap) return;
    this.hospitalLayers.forEach(l => this.showHospitalsState ? this.fullMap.addLayer(l) : this.fullMap.removeLayer(l));
  },

  togglePolice() {
    this.showPoliceState = !this.showPoliceState;
    if (this._offlineViews.full) this._offlineViews.full.setLayer('police', this.showPoliceState);
    if (!this.fullMap) return;
    this.policeLayers.forEach(l => this.showPoliceState ? this.fullMap.addLayer(l) : this.fullMap.removeLayer(l));
  },

  toggleFire() {
    this.showFireState = !this.showFireState;
    if (this._offlineViews.full) this._offlineViews.full.setLayer('fire', this.showFireState);
    if (!this.fullMap) return;
    this.fireLayers.forEach(l => this.showFireState ? this.fullMap.addLayer(l) : this.fullMap.removeLayer(l));
  },

  toggleFaultLines() {
    this.showFaultsState = !this.showFaultsState;
    if (this._offlineViews.full) this._offlineViews.full.setLayer('faults', this.showFaultsState);
    if (!this.fullMap) return;
    this.faultLayers.forEach(l => this.showFaultsState ? this.fullMap.addLayer(l) : this.fullMap.removeLayer(l));
  },

  // --------------------------------------------------------------------
  // Evacuation Routing — uses the device's actual GPS location (via the
  // browser's Geolocation API) as the starting point, then routes to the
  // nearest shelter, hospital, police/SAR and fire/rescue station all at
  // once. Falls back to Coimbatore if location access is denied/unavailable.
  // --------------------------------------------------------------------

  // Great-circle distance between two lat/lng points, in kilometers.
  _haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // Asks the device for its real GPS position, places a "you are here"
  // marker there, then runs `callback(userLoc)`. Falls back to a fixed
  // point with a clear alert if location access is denied/unsupported —
  // routing still works, it's just not personalized to the device.
  _locateThenRun(callback) {
    if (!this.fullMap) return;

    const btn = document.getElementById('evac-route-btn');
    const setBtnLabel = (html) => { if (btn) btn.innerHTML = html; };
    const defaultBtnLabel = '<i class="fa-solid fa-route"></i> <span data-i18n="evacRouteBtn">Evacuation Route</span>';
    setBtnLabel('<i class="fa-solid fa-spinner fa-spin"></i> <span>Getting your location…</span>');

    const proceed = (userLoc, accuracy) => {
      this._placeUserLocationMarker(userLoc[0], userLoc[1], accuracy);
      callback(userLoc);
      setBtnLabel(defaultBtnLabel);
    };
    const fallback = () => {
      alert("Couldn't get your device's location — showing routes from Coimbatore instead. Check that this site has permission to use your location (browser and device settings).");
      proceed([11.0168, 76.9558], null);
    };

    if (!('geolocation' in navigator)) { fallback(); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => proceed([pos.coords.latitude, pos.coords.longitude], pos.coords.accuracy),
      () => fallback(),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  },

  _placeUserLocationMarker(lat, lng, accuracy) {
    if (!this.fullMap) return;
    if (this.userLocationMarker) this.fullMap.removeLayer(this.userLocationMarker);
    if (this.userAccuracyCircle) this.fullMap.removeLayer(this.userAccuracyCircle);

    const youIcon = L.divIcon({
      className: 'qg-user-location-marker',
      html: '<div class="qg-user-dot"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    this.userLocationMarker = L.marker([lat, lng], { icon: youIcon, zIndexOffset: 2000 })
      .addTo(this.fullMap)
      .bindPopup('<strong>📍 You are here</strong>');

    // Accuracy ring — shows how precise the device's GPS fix actually is.
    if (accuracy) {
      this.userAccuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.08,
        weight: 1
      }).addTo(this.fullMap);
    }
  },

  _clearEvacuationRoutes() {
    if (this.fullMap) this.routeLayers.forEach(l => this.fullMap.removeLayer(l));
    this.routeLayers = [];
    const panel = document.getElementById('evac-route-summary');
    if (panel) panel.remove();
  },

  // destinationCoords/destinationName/destinationColor: passed when called
  // from a single facility's popup ("Navigate Evacuation Route" button) to
  // route to just that one place. Called with no arguments (the main
  // "Evacuation Route" button), it instead finds and routes to the
  // NEAREST shelter, hospital, police/SAR unit and fire/rescue station.
  showEvacuationRoute(destinationCoords, destinationName, destinationColor) {
    if (this._offlineActive('full')) {
      // offline map: straight-line route to the nearest shelter from the GPS fix (GPS needs no internet)
      this._offlineViews.full.routeToNearest('shelter');
      return;
    }
    if (!this.fullMap) return;

    if (destinationCoords) {
      this._locateThenRun((userLoc) => {
        this._drawRoutesFrom(userLoc, [{
          coords: destinationCoords,
          name: destinationName || 'Selected Destination',
          type: 'Destination',
          color: destinationColor || '#10b981'
        }]);
      });
      return;
    }

    this._locateThenRun((userLoc) => {
      const nearestOf = (list) => {
        if (!list || !list.length) return null;
        let best = null, bestDist = Infinity;
        list.forEach(item => {
          const d = this._haversineKm(userLoc[0], userLoc[1], item.lat, item.lng);
          if (d < bestDist) { bestDist = d; best = item; }
        });
        return best ? { item: best, distanceKm: bestDist } : null;
      };

      const categories = [
        { list: quakeDatabase.shelters, type: 'Nearest Shelter', color: '#2563eb' },
        { list: quakeDatabase.hospitals, type: 'Nearest Hospital', color: '#ef4444' },
        { list: quakeDatabase.policeStations, type: 'Nearest Police / SAR', color: '#3b82f6' },
        { list: quakeDatabase.fireStations, type: 'Nearest Fire / Rescue', color: '#f97316' }
      ];

      const targets = [];
      categories.forEach(cat => {
        const nearest = nearestOf(cat.list);
        if (nearest) {
          targets.push({
            coords: [nearest.item.lat, nearest.item.lng],
            name: nearest.item.name,
            type: cat.type,
            color: cat.color,
            distanceKm: nearest.distanceKm
          });
        }
      });

      if (!targets.length) {
        alert('No shelters, hospitals, police or fire stations are loaded to route to yet.');
        return;
      }

      this._drawRoutesFrom(userLoc, targets);
    });
  },

  // Draws one route per target, from the real road network where possible.
  // Uses OSRM's free public routing API (no key required) for an actual
  // driving route; if that's unreachable (offline, blocked, rate-limited)
  // it falls back to a straight-line estimate so the feature still works.
  async _drawRoutesFrom(userLoc, targets) {
    this._clearEvacuationRoutes();

    const bounds = [userLoc];
    const summaryRows = [];

    for (const t of targets) {
      let latlngs = [userLoc, t.coords];
      let distanceKm = t.distanceKm != null ? t.distanceKm : this._haversineKm(userLoc[0], userLoc[1], t.coords[0], t.coords[1]);
      let durationMin = (distanceKm / 35) * 60; // fallback estimate @ 35 km/h avg
      let isRoadRoute = false;

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLoc[1]},${userLoc[0]};${t.coords[1]},${t.coords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const route = data.routes && data.routes[0];
          if (route && route.geometry && route.geometry.coordinates) {
            latlngs = route.geometry.coordinates.map(c => [c[1], c[0]]); // GeoJSON is [lng,lat]
            distanceKm = route.distance / 1000;
            durationMin = route.duration / 60;
            isRoadRoute = true;
          }
        }
      } catch (e) {
        // Offline or the public routing server is unreachable — the
        // straight-line fallback set above is used instead.
      }

      const line = L.polyline(latlngs, {
        color: t.color,
        weight: 5,
        opacity: 0.85,
        dashArray: isRoadRoute ? null : '9, 9'
      }).addTo(this.fullMap);

      line.bindPopup(`
        <div style="font-family: sans-serif; font-size: 0.85rem;">
          <strong>${t.type}: ${t.name}</strong><br>
          ${distanceKm.toFixed(1)} km &middot; ~${Math.max(1, Math.round(durationMin))} min drive
          ${isRoadRoute ? '' : '<br><span style="color:#f59e0b;">(straight-line estimate — live road route unavailable)</span>'}
        </div>
      `);

      this.routeLayers.push(line);
      bounds.push(t.coords);
      summaryRows.push({ ...t, distanceKm, durationMin, isRoadRoute });
    }

    this.fullMap.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    this._showEvacuationSummary(summaryRows);
  },

  _showEvacuationSummary(rows) {
    const mapEl = document.getElementById('full-map-container');
    if (!mapEl) return;
    if (getComputedStyle(mapEl).position === 'static') mapEl.style.position = 'relative';

    const old = document.getElementById('evac-route-summary');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'evac-route-summary';
    panel.style.cssText = 'position:absolute; top:12px; left:12px; z-index:1000; background:rgba(15,23,42,0.92); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:0.75rem 0.9rem; max-width:250px; font-family:sans-serif; color:#e2e8f0; box-shadow:0 4px 16px rgba(0,0,0,0.5);';

    let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
      <span style="font-weight:800; font-size:0.85rem;">🚨 Evacuation Routes</span>
      <span style="cursor:pointer; color:#94a3b8;" onclick="document.getElementById('evac-route-summary').remove()">✕</span>
    </div>`;

    rows.forEach(r => {
      html += `
        <div style="display:flex; align-items:flex-start; gap:0.45rem; margin-bottom:0.45rem; font-size:0.78rem;">
          <span style="width:10px; height:10px; margin-top:3px; border-radius:50%; background:${r.color}; flex-shrink:0;"></span>
          <div>
            <div style="font-weight:700;">${r.type}</div>
            <div style="color:#94a3b8;">${r.name}</div>
            <div>${r.distanceKm.toFixed(1)} km &middot; ~${Math.max(1, Math.round(r.durationMin))} min${r.isRoadRoute ? '' : ' (est.)'}</div>
          </div>
        </div>`;
    });

    html += `<div style="font-size:0.68rem; color:#64748b; margin-top:0.3rem;">From your device's GPS location</div>`;

    panel.innerHTML = html;
    mapEl.appendChild(panel);
  }
};

// Expose modules globally so `window.quakeDatabase` / `window.liveMap` checks
// elsewhere (app.js) find them — top-level `const`/`let` do NOT attach to
// `window` the way `var` does.
window.quakeDatabase = quakeDatabase;
window.liveMap = liveMap;
