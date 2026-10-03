/* ==========================================================================
   QuakeGuard - Community Incident Reporting System & Live Crowd Feed
   ========================================================================== */

const communityReports = {
  reports: [
    {
      id: "r1",
      type: "Building Structural Crack",
      severity: "Critical",
      desc: "Major diagonal shear wall fracture on 4th floor apartment building near Mount Road.",
      time: "8 mins ago",
      loc: "Anna Salai, Chennai, Tamil Nadu",
      author: "Kavitha R.",
      verifications: 24,
      status: "First Responder En Route",
      replies: [
        { user: "Dr. Alex (Medic)", text: "Medical team dispatched to Anna Salai location." },
        { user: "Vol-Team #4", text: "Building evacuation initiated by local first responders." }
      ]
    },
    {
      id: "r2",
      type: "Injured Civilians Requiring Aid",
      severity: "Critical",
      desc: "2 civilians trapped under fallen brick masonry. Need extrication tools & medical first aid.",
      time: "15 mins ago",
      loc: "District 4 Community Market, Coimbatore, TN",
      author: "Suresh Kumar",
      verifications: 42,
      status: "Search & Rescue Dispatched",
      replies: [
        { user: "SAR K9 Squad", text: "Micro-Doppler radar probe deployed at scene." }
      ]
    },
    {
      id: "r3",
      type: "Road Blockage / Debris",
      severity: "High",
      desc: "Concrete overpass debris blocking 2 lanes of ECR highway towards Nagapattinam.",
      time: "28 mins ago",
      loc: "East Coast Road (ECR), Nagapattinam, TN",
      author: "Arun V.",
      verifications: 19,
      status: "Verifying Hazard",
      replies: [
        { user: "TNFRS Crew", text: "Heavy JCB extrication vehicle en route to clear debris." }
      ]
    },
    {
      id: "r4",
      type: "Gas / Fire Hazard",
      severity: "Critical",
      desc: "Natural gas line rupture near Tokyo Station underground shopping arcade.",
      time: "35 mins ago",
      loc: "Chiyoda City, Tokyo, Japan",
      author: "Kenji Sato",
      verifications: 56,
      status: "Fire Battalion On Scene",
      replies: [
        { user: "Tokyo Fire Dept", text: "Main gas shutoff valve secured. Area isolated." }
      ]
    },
    {
      id: "r5",
      type: "Shelter Capacity Alert",
      severity: "Moderate",
      desc: "Rajaji Community Relief Hub has 800 open emergency beds and clean drinking water.",
      time: "50 mins ago",
      loc: "Chennai Central Relief Hub, TN",
      author: "Vol-Coordinator Priya",
      verifications: 31,
      status: "Shelter Operational",
      replies: [
        { user: "Citizen Aid", text: "Food packets and blankets arriving via relief truck." }
      ]
    }
  ],

  renderFeed() {
    const container = document.getElementById('community-feed-list');
    if (!container) return;

    const colors = { Critical: '#ef4444', High: '#f59e0b', Moderate: '#3b82f6' };

    container.innerHTML = this.reports.map(r => {
      const color = colors[r.severity] || '#3b82f6';
      const note = r.replies && r.replies.length ? r.replies[0] : null;
      return `
        <div style="background: var(--bg-surface); padding: 1rem 1.1rem; border-radius: 12px; border: 1px solid var(--border-color); border-left: 4px solid ${color};">
          <div style="display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.78rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.3rem;">
            <span style="color: ${color}; text-transform: uppercase;">${r.severity} · ${r.type}</span>
            <span>${r.time}</span>
          </div>
          <p style="font-size: 0.95rem; margin: 0 0 0.4rem; color: var(--text-primary); font-weight: 500;">${r.desc}</p>
          <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
            <i class="fa-solid fa-location-dot"></i> ${r.loc}
          </div>
          ${note ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.6rem;"><strong>${note.user}:</strong> ${note.text}</div>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;" onclick="communityReports.upvoteReport('${r.id}')">
              <i class="fa-solid fa-thumbs-up"></i> Verify (${r.verifications})
            </button>
            <span style="font-size: 0.78rem; color: var(--color-teal-400); font-weight: 600;">${r.status}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  upvoteReport(id) {
    const r = this.reports.find(x => x.id === id);
    if (r) {
      r.verifications++;
      this.renderFeed();
    }
  },

  generateAiSituationReply(type, severity, desc) {
    let adviceText = "";
    let dispatchText = "";
    const lowerDesc = desc.toLowerCase();

    if (type.includes("Building") || type.includes("Collapse") || lowerDesc.includes("crack") || lowerDesc.includes("wall")) {
      adviceText = "AI Safety Instruction: Structural shear damage detected. Step 50 meters away from masonry walls. Do not use elevators or stairwells with visible cracks.";
      dispatchText = "Search & Rescue Unit #4 and Structural Engineers en route to inspect loading integrity.";
    } else if (type.includes("Injured") || lowerDesc.includes("hurt") || lowerDesc.includes("bleeding") || lowerDesc.includes("trapped")) {
      adviceText = "AI Medical Instruction: Keep victims quiet and warm. Apply firm pressure to bleeding wounds with clean cloth. Do not move victims with suspected neck/spine trauma.";
      dispatchText = "Emergency Medical Triage Team & Ambulance 108 dispatched to reported GPS location.";
    } else if (type.includes("Gas") || type.includes("Fire") || lowerDesc.includes("leak") || lowerDesc.includes("smoke")) {
      adviceText = "AI Hazard Instruction: Shut off main gas valves immediately. Do NOT ignite open flames or flip electrical switches. Evacuate upwind.";
      dispatchText = "Fire Battalion Squad notified. Utility shutoff team dispatched.";
    } else {
      adviceText = "AI Road Clearance Instruction: Debris hazard logged on central navigation pathfinder. Rerouting emergency traffic.";
      dispatchText = "Heavy extrication JCB equipment en route to clear path.";
    }

    return [
      { user: "🤖 QuakeGuard AI Situation Responder", text: adviceText },
      { user: "🚑 Command Dispatch", text: dispatchText }
    ];
  },

  submitReport(event) {
    event.preventDefault();
    const type = document.getElementById('rep-type').value;
    const severity = document.getElementById('rep-severity').value;
    const desc = document.getElementById('rep-desc').value;

    const replies = this.generateAiSituationReply(type, severity, desc);

    const newReport = {
      id: `r${Date.now()}`,
      type,
      severity,
      desc,
      time: "Just now",
      loc: "User GPS Coordinates (Chennai / Local)",
      author: "Verified Citizen User 0",
      verifications: 1,
      status: "AI Situation Responder Active",
      replies: replies
    };

    this.reports.unshift(newReport);
    this.renderFeed();
    document.getElementById('rep-desc').value = '';

  }
};

// Expose module globally so `window.communityReports` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.communityReports = communityReports;
