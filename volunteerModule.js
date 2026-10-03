/* ==========================================================================
   QuakeGuard - Volunteer Rescue Mission Module & Registration Engine
   ========================================================================== */

const volunteerModule = {
  activeTab: 'register', // 'register' or 'login'
  currentVolunteer: JSON.parse(localStorage.getItem('quakeguard_volunteer_user') || 'null'),

  missions: [
    { id: "m1", title: "Medical First Responder Needed", location: "District 4 Relief Station", distance: "0.8 km away", urgency: "Immediate", status: "Open" },
    { id: "m2", title: "Water Supply & Blanket Distribution", location: "Central Park Safe Haven", distance: "1.4 km away", urgency: "High Priority", status: "Open" },
    { id: "m3", title: "Debris Clearing Assistance", location: "Grand Ave Junction", distance: "2.1 km away", urgency: "Moderate", status: "Open" }
  ],

  init() {
    this.renderMissions();
    this.updateVolunteerHeaderUI();
  },

  openRegisterModal() {
    const modal = document.getElementById('volunteer-modal-overlay');
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeRegisterModal() {
    const modal = document.getElementById('volunteer-modal-overlay');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  switchAuthTab(tab) {
    this.activeTab = tab;
    const regTabBtn = document.getElementById('vol-tab-reg');
    const logTabBtn = document.getElementById('vol-tab-log');
    const regForm = document.getElementById('vol-form-register');
    const logForm = document.getElementById('vol-form-login');

    if (tab === 'register') {
      regTabBtn.classList.add('btn-primary');
      regTabBtn.classList.remove('btn-outline');
      logTabBtn.classList.add('btn-outline');
      logTabBtn.classList.remove('btn-primary');
      regForm.style.display = 'block';
      logForm.style.display = 'none';
    } else {
      logTabBtn.classList.add('btn-primary');
      logTabBtn.classList.remove('btn-outline');
      regTabBtn.classList.add('btn-outline');
      regTabBtn.classList.remove('btn-primary');
      logForm.style.display = 'block';
      regForm.style.display = 'none';
    }
  },

  handleRegister(event) {
    event.preventDefault();
    const fullName = document.getElementById('vol-reg-name').value.trim();
    const contactInfo = document.getElementById('vol-reg-contact').value.trim();
    const password = document.getElementById('vol-reg-password').value;
    const skill = document.getElementById('vol-reg-skill').value;

    if (!fullName || !contactInfo || !password) {
      alert("Please fill in all required registration fields.");
      return;
    }

    const volunteerData = {
      name: fullName,
      contact: contactInfo,
      skill: skill,
      registeredAt: new Date().toLocaleDateString()
    };

    this.currentVolunteer = volunteerData;
    localStorage.setItem('quakeguard_volunteer_user', JSON.stringify(volunteerData));
    localStorage.setItem('quakeguard_user_role', 'volunteer');

    if (window.appRouter) {
      window.appRouter.currentUserRole = 'volunteer';
      window.appRouter.applyRolePermissions();
    }

    this.closeRegisterModal();
    this.updateVolunteerHeaderUI();
    alert(`Volunteer Registration Successful!\nWelcome ${fullName}. You are now registered as an Active First Responder (${skill}).`);
  },

  handleLogin(event) {
    event.preventDefault();
    const contactInfo = document.getElementById('vol-log-contact').value.trim();
    const password = document.getElementById('vol-log-password').value;

    if (!contactInfo || !password) {
      alert("Please enter your email/phone and password.");
      return;
    }

    const volunteerData = {
      name: contactInfo.includes('@') ? contactInfo.split('@')[0] : "Responder",
      contact: contactInfo,
      skill: "Emergency Field Responder",
      registeredAt: new Date().toLocaleDateString()
    };

    this.currentVolunteer = volunteerData;
    localStorage.setItem('quakeguard_volunteer_user', JSON.stringify(volunteerData));
    localStorage.setItem('quakeguard_user_role', 'volunteer');

    if (window.appRouter) {
      window.appRouter.currentUserRole = 'volunteer';
      window.appRouter.applyRolePermissions();
    }

    this.closeRegisterModal();
    this.updateVolunteerHeaderUI();
    alert(`Volunteer Sign In Successful!\nLogged in as ${volunteerData.name}. Dispatch status set to ONLINE.`);
  },

  logoutVolunteer() {
    this.currentVolunteer = null;
    localStorage.removeItem('quakeguard_volunteer_user');
    localStorage.setItem('quakeguard_user_role', 'user');

    if (window.appRouter) {
      window.appRouter.currentUserRole = 'user';
      window.appRouter.applyRolePermissions();
    }

    this.updateVolunteerHeaderUI();
    alert("Signed out from Volunteer Rescue Network.");
  },

  updateVolunteerHeaderUI() {
    const statusBox = document.getElementById('volunteer-status-box');
    if (!statusBox) return;

    if (this.currentVolunteer) {
      const signOutText = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'வெளியேறு' : window.multiLang.currentLang === 'hi' ? 'साइन आउट' : 'Sign Out') : 'Sign Out';
      const regVolText = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'பதிவுசெய்த தன்னார்வலர் - ஆன்லைனில்' : window.multiLang.currentLang === 'hi' ? 'पंजीकृत स्वयंसेवक - ऑनलाइन' : 'REGISTERED VOLUNTEER - ONLINE') : 'REGISTERED VOLUNTEER - ONLINE';

      statusBox.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid var(--color-success); border-radius: 12px; padding: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="badge badge-success" style="margin-bottom: 0.25rem;"><i class="fa-solid fa-circle-check"></i> ${regVolText}</span>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">${this.currentVolunteer.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${this.currentVolunteer.contact} | Skill: <strong>${this.currentVolunteer.skill}</strong></div>
          </div>
          <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="volunteerModule.logoutVolunteer()">
            ${signOutText} <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      `;
    } else {
      statusBox.innerHTML = '';
    }
  },

  renderMissions() {
    const container = document.getElementById('volunteer-missions-list');
    if (!container) return;

    const acceptText = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'மீட்புப் பணியை ஏற்றுக்கொள்' : window.multiLang.currentLang === 'hi' ? 'बचाव अभियान स्वीकार करें' : 'Accept Rescue Mission') : 'Accept Rescue Mission';
    const activeText = window.multiLang ? (window.multiLang.currentLang === 'ta' ? 'பணி செயல்படுகிறது (பயணத்தில்)' : window.multiLang.currentLang === 'hi' ? 'अभियान सक्रिय (मार्ग में)' : 'Mission Active (En Route)') : 'Mission Active (En Route)';

    container.innerHTML = this.missions.map(m => {
      const buttonLabel = m.status === 'Accepted' ? activeText : acceptText;
      return `
        <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span class="badge badge-warning">${m.urgency}</span>
              <span style="font-size: 0.8rem; color: var(--color-teal-400); font-weight: 600;">${m.distance}</span>
            </div>
            <h4 style="font-weight: 700; margin-bottom: 0.5rem;">${m.title}</h4>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
              <i class="fa-solid fa-location-dot"></i> ${m.location}
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%; font-size: 0.85rem;" onclick="volunteerModule.acceptMission('${m.id}')">
            ${buttonLabel} <i class="fa-solid fa-check"></i>
          </button>
        </div>
      `;
    }).join('');
  },

  acceptMission(id) {
    if (!this.currentVolunteer) {
      alert("Please Register or Sign In as a Volunteer before accepting emergency missions.");
      this.openRegisterModal();
      return;
    }

    const m = this.missions.find(x => x.id === id);
    if (m) {
      m.status = 'Accepted';
      this.renderMissions();
      alert(`Rescue Mission "${m.title}" Accepted by ${this.currentVolunteer.name}!\nGPS Navigation Route loaded to your device.`);
    }
  }
};

// Expose module globally so `window.volunteerModule` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.volunteerModule = volunteerModule;
