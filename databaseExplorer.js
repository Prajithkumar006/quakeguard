/* ==========================================================================
   QuakeGuard - Database Explorer Module
   ========================================================================== */

const databaseExplorer = {
  currentCategory: 'historical',

  init() {
    this.renderCategory('historical');
  },

  selectCategory(cat) {
    this.currentCategory = cat;
    this.renderCategory(cat);
  },

  renderCategory(cat) {
    const tableHead = document.getElementById('db-table-head');
    const tableBody = document.getElementById('db-table-body');
    const countBadge = document.getElementById('db-record-count');
    const searchInput = document.getElementById('db-search-input');
    
    if (!tableHead || !tableBody) return;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const lang = window.multiLang ? window.multiLang.currentLang : 'en';

    if (cat === 'historical') {
      const thYear = lang === 'ta' ? 'ஆண்டு' : lang === 'hi' ? 'वर्ष' : 'Year';
      const thEvent = lang === 'ta' ? 'நிகழ்வு / இருப்பிடம்' : lang === 'hi' ? 'घटना / स्थान' : 'Event / Location';
      const thMag = lang === 'ta' ? 'வீச்சு (அளவு)' : lang === 'hi' ? 'तीव्रता' : 'Magnitude';
      const thDepth = lang === 'ta' ? 'ஆழம்' : lang === 'hi' ? 'गहराई' : 'Depth';
      const thCas = lang === 'ta' ? 'பாதிப்புகள்' : lang === 'hi' ? 'हताहत' : 'Casualties';
      const thTsu = lang === 'ta' ? 'சுனாமி எச்சரிக்கை' : lang === 'hi' ? 'सुनामी अलर्ट' : 'Tsunami Alert';
      const thAct = lang === 'ta' ? 'செயல்பாடு' : lang === 'hi' ? 'कार्रवाई' : 'Action';
      const btnMap = lang === 'ta' ? 'வரைபடம்' : lang === 'hi' ? 'नक्शा पिन' : 'Map Pin';

      tableHead.innerHTML = `
        <tr>
          <th>${thYear}</th>
          <th>${thEvent}</th>
          <th>${thMag}</th>
          <th>${thDepth}</th>
          <th>${thCas}</th>
          <th>${thTsu}</th>
          <th>${thAct}</th>
        </tr>
      `;

      const records = quakeDatabase.historicalQuakes.filter(q => 
        !query || q.place.toLowerCase().includes(query) || q.year.toString().includes(query)
      );

      if (countBadge) countBadge.innerText = `${records.length} ${lang === 'ta' ? 'பதிவுகள்' : lang === 'hi' ? 'रिकॉर्ड' : 'Catalog Records'}`;

      tableBody.innerHTML = records.map(r => `
        <tr>
          <td><strong>${r.year}</strong></td>
          <td><span style="font-weight:700;">${r.place}</span><br><small style="color:var(--text-muted);">${r.lat}, ${r.lng}</small></td>
          <td><span class="badge ${r.mag >= 7.0 ? 'badge-danger' : 'badge-warning'}">M ${r.mag.toFixed(1)}</span></td>
          <td>${r.depth} km</td>
          <td style="color:var(--color-red-400); font-weight:700;">${r.casualties}</td>
          <td><span class="badge badge-info">${r.tsunami}</span></td>
          <td><button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="appRouter.navigate('map')">${btnMap}</button></td>
        </tr>
      `).join('');
    }
    else if (cat === 'shelters') {
      const thName = lang === 'ta' ? 'முகாம் பெயர்' : lang === 'hi' ? 'आश्रय का नाम' : 'Shelter Name';
      const thLoc = lang === 'ta' ? 'நகரம் / இருப்பிடம்' : lang === 'hi' ? 'शहर / स्थान' : 'City / Location';
      const thCap = lang === 'ta' ? 'கொள்ளளவு' : lang === 'hi' ? 'क्षमता' : 'Capacity';
      const thWater = lang === 'ta' ? 'தண்ணீர் இருப்பு' : lang === 'hi' ? 'जल भंडार' : 'Water Reserve';
      const thMed = lang === 'ta' ? 'மருத்துவ தரம்' : lang === 'hi' ? 'चिकित्सा रेटिंग' : 'Medical Rating';
      const thPhone = lang === 'ta' ? 'தொலைபேசி' : lang === 'hi' ? 'फ़ोन नंबर' : 'Contact Phone';
      const thAct = lang === 'ta' ? 'செயல்பாடு' : lang === 'hi' ? 'कार्रवाई' : 'Action';
      const btnRoute = lang === 'ta' ? 'பாதை' : lang === 'hi' ? 'मार्ग' : 'Route';

      tableHead.innerHTML = `
        <tr>
          <th>${thName}</th>
          <th>${thLoc}</th>
          <th>${thCap}</th>
          <th>${thWater}</th>
          <th>${thMed}</th>
          <th>${thPhone}</th>
          <th>${thAct}</th>
        </tr>
      `;

      const records = quakeDatabase.shelters.filter(s => 
        !query || s.name.toLowerCase().includes(query) || s.city.toLowerCase().includes(query)
      );

      if (countBadge) countBadge.innerText = `${records.length} ${lang === 'ta' ? 'முகாம்கள்' : lang === 'hi' ? 'आश्रय केंद्र' : 'Shelter Hubs'}`;

      tableBody.innerHTML = records.map(s => `
        <tr>
          <td><strong style="color:var(--color-blue-400);">${s.name}</strong></td>
          <td>${s.city}</td>
          <td><span class="badge badge-info">${s.capacity}</span></td>
          <td style="color:var(--color-success); font-weight:700;">${s.waterStatus}</td>
          <td><span class="badge badge-success">${s.medicalRating}</span></td>
          <td>${s.phone}</td>
          <td><button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="liveMap.showEvacuationRoute([${s.lat}, ${s.lng}]); appRouter.navigate('map');">${btnRoute}</button></td>
        </tr>
      `).join('');
    }
    else if (cat === 'hospitals') {
      const thName = lang === 'ta' ? 'மருத்துவமனை பெயர்' : lang === 'hi' ? 'अस्पताल का नाम' : 'Hospital Name';
      const thRegion = lang === 'ta' ? 'நகரம் / மண்டலம்' : lang === 'hi' ? 'शहर / क्षेत्र' : 'City / Region';
      const thBeds = lang === 'ta' ? 'காலியாக உள்ள படுக்கைகள்' : lang === 'hi' ? 'उपलब्ध बिस्तर' : 'Available Trauma Beds';
      const thLevel = lang === 'ta' ? 'அவசர நிலை' : lang === 'hi' ? 'ट्रॉमा स्तर' : 'Trauma Level';
      const thHelp = lang === 'ta' ? 'உதவி எண்' : lang === 'hi' ? 'हेल्पलाइन' : 'Emergency Helpline';
      const thAct = lang === 'ta' ? 'செயல்பாடு' : lang === 'hi' ? 'कार्रवाई' : 'Action';
      const btnLocate = lang === 'ta' ? 'கண்டறி' : lang === 'hi' ? 'खोजें' : 'Locate';

      tableHead.innerHTML = `
        <tr>
          <th>${thName}</th>
          <th>${thRegion}</th>
          <th>${thBeds}</th>
          <th>${thLevel}</th>
          <th>${thHelp}</th>
          <th>${thAct}</th>
        </tr>
      `;

      const records = quakeDatabase.hospitals.filter(h => 
        !query || h.name.toLowerCase().includes(query) || h.city.toLowerCase().includes(query)
      );

      if (countBadge) countBadge.innerText = `${records.length} ${lang === 'ta' ? 'மருத்துவமனைகள்' : lang === 'hi' ? 'अस्पताल' : 'Trauma Hospitals'}`;

      tableBody.innerHTML = records.map(h => `
        <tr>
          <td><strong style="color:var(--color-red-400);">${h.name}</strong></td>
          <td>${h.city}</td>
          <td><span class="badge badge-success">${h.beds}</span></td>
          <td><span class="badge badge-danger">${h.traumaLevel}</span></td>
          <td><strong>${h.helpline}</strong></td>
          <td><button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="appRouter.navigate('map')">${btnLocate}</button></td>
        </tr>
      `).join('');
    }
    else if (cat === 'faults') {
      const thName = lang === 'ta' ? 'பிளவு மண்டலம்' : lang === 'hi' ? 'फॉल्ट जोन' : 'Fault Zone Name';
      const thType = lang === 'ta' ? 'புவியியல் வகை' : lang === 'hi' ? 'प्रकार' : 'Tectonic Type';
      const thLen = lang === 'ta' ? 'நீளம்' : lang === 'hi' ? 'लंबाई' : 'System Length';
      const thRate = lang === 'ta' ? 'வருடாந்திர நகர்வு' : lang === 'hi' ? 'वार्षिक खिसकाव' : 'Annual Slip Rate';
      const thNodes = lang === 'ta' ? 'அமைவிடங்கள்' : lang === 'hi' ? 'नोड्स' : 'Coordinates Count';

      tableHead.innerHTML = `
        <tr>
          <th>${thName}</th>
          <th>${thType}</th>
          <th>${thLen}</th>
          <th>${thRate}</th>
          <th>${thNodes}</th>
        </tr>
      `;

      const records = quakeDatabase.faultLines.filter(f => 
        !query || f.name.toLowerCase().includes(query) || f.type.toLowerCase().includes(query)
      );

      if (countBadge) countBadge.innerText = `${records.length} ${lang === 'ta' ? 'பிளவு மண்டலங்கள்' : lang === 'hi' ? 'फॉल्ट सिस्टम' : 'Fault Systems'}`;

      tableBody.innerHTML = records.map(f => `
        <tr>
          <td><strong style="color:var(--color-orange-400);">${f.name}</strong></td>
          <td><span class="badge badge-warning">${f.type}</span></td>
          <td>${f.length}</td>
          <td style="color:var(--color-orange-400); font-weight:700;">${f.slipRate}</td>
          <td>${f.coords.length} Geo-Nodes</td>
        </tr>
      `).join('');
    }
  },

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quakeDatabase, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "quakeguard_database_export.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  }
};

// Expose module globally so `window.databaseExplorer` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.databaseExplorer = databaseExplorer;
