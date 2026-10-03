/* ==========================================================================
   QuakeGuard - Main Application Controller & Router
   ========================================================================== */

const appRouter = {
  currentTheme: 'dark',
  currentUserRole: localStorage.getItem('quakeguard_user_role') || 'user',

  init() {
    console.log('[QuakeGuard Core] Initializing platform modules & multi-database engine...');

    // Initialize Theme & Role-based UI
    this.initTheme();
    this.applyRolePermissions();

    // Initialize modules
    if (window.liveMap) window.liveMap.initDashboardMap();
    if (window.disasterPreparedness) window.disasterPreparedness.renderChecklist();
    if (window.communityReports) window.communityReports.renderFeed();
    if (window.volunteerModule) window.volunteerModule.init();
    if (window.databaseExplorer) window.databaseExplorer.init();
    if (window.familyCircle) window.familyCircle.renderMembers();
    if (window.sosManager) window.sosManager.renderContactsList();
    if (window.mutualAid) window.mutualAid.renderAidBoard();
    if (window.meshNetwork) window.meshNetwork.init();
    if (window.virtualSensorEngine) window.virtualSensorEngine.init();
    if (window.acousticBioDemodulator) window.acousticBioDemodulator.init();
    if (window.animalInfrasoundNetwork) window.animalInfrasoundNetwork.renderUI();
    if (window.a11yAssistiveEngine) window.a11yAssistiveEngine.init();
    if (window.offlineMaps) window.offlineMaps.init();

    // Register Service Worker for PWA Offline Caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('[QuakeGuard PWA] Service Worker registered successfully.'))
        .catch(err => console.warn('[QuakeGuard PWA] Service Worker registration failed.', err));
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('quakeguard_theme') || 'dark';
    this.currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  },

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('quakeguard_theme', this.currentTheme);
    
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.className = this.currentTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  },

  applyRolePermissions() {
    const isAdmin = this.currentUserRole === 'admin';
    const algoGroup = document.getElementById('admin-algorithm-selector-group');
    if (algoGroup) {
      algoGroup.style.display = isAdmin ? 'block' : 'none';
    }
  },

  navigate(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Update nav links active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-page') === pageId) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Ensure role permissions are refreshed
    this.applyRolePermissions();

    // Lazy load specific map view
    if (pageId === 'map') {
      if (window.liveMap) {
        setTimeout(() => {
          window.liveMap.initFullMap();
          if (window.liveMap.fullMap) window.liveMap.fullMap.invalidateSize();
        }, 100);
      }
      if (window.mapLibreGlobe) {
        setTimeout(() => {
          window.mapLibreGlobe.init('maplibre-globe-container');
        }, 150);
      }
    }

    // Lazy load database explorer view
    if (pageId === 'database' && window.databaseExplorer) {
      window.databaseExplorer.init();
    }

    // Lazy load P2P Mesh Communication Center view
    if (pageId === 'mesh' && window.meshNetwork) {
      window.meshNetwork.renderMeshUI();
    }

    // Lazy load Volunteer Rescue Network view
    if (pageId === 'volunteers' && window.volunteerModule) {
      window.volunteerModule.init();
    }

    // Lazy load Command Center telemetry view
    if (pageId === 'admin') {
      if (window.virtualSensorEngine) window.virtualSensorEngine.init();
      if (window.acousticBioDemodulator) window.acousticBioDemodulator.init();
      if (window.animalInfrasoundNetwork) window.animalInfrasoundNetwork.renderUI();
      if (window.rescueAdmin) window.rescueAdmin.setCommandViewMode(window.rescueAdmin.currentViewMode || 'simple');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleAuth(event) {
    event.preventDefault();
    const role = document.getElementById('auth-role').value;
    this.currentUserRole = role;
    localStorage.setItem('quakeguard_user_role', role);
    this.applyRolePermissions();
    alert(`Authentication Successful!\nLogged in as ${role.toUpperCase()} with JWT Secure Token.`);
    this.navigate('dashboard');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  appRouter.init();
});

// Expose module globally so `window.appRouter` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.appRouter = appRouter;
