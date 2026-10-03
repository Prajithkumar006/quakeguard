/* ==========================================================================
   QuakeGuard - Emergency Safety Assistant & Multi-Language Voice Model

   Every topic below can hold either a single string or an array of a few
   differently-worded variants; generateBotResponse() picks one at random
   each time via _pick(). English has multiple variants per topic so
   repeated questions don't read back the exact same sentence verbatim —
   Tamil/Hindi keep a single carefully-worded version per topic rather
   than risk a second, lower-quality machine-translated variant.
   ========================================================================== */

const aiVoiceAssistant = {
  activeLang: 'en',
  _lastTopic: null,

  knowledgeBase: {
    en: {
      shelter: [
        "The nearest relief shelters in Tamil Nadu are Rajaji Relief Hub Chennai (13.0827, 80.2707) and Coimbatore Relief Station (11.0168, 76.9558). In Japan, Tokyo Disaster Prevention Center (35.689, 139.691) is active with full reserves.",
        "Closest shelters right now: Rajaji Relief Hub in Chennai and the Coimbatore Relief Station, both stocked and open. If you're near Japan, Tokyo Disaster Prevention Center also has full reserves.",
        "You've got shelter options in Chennai (Rajaji Relief Hub) and Coimbatore (Coimbatore Relief Station), plus Tokyo Disaster Prevention Center if you're in Japan — all currently active."
      ],
      during: [
        "During ground shaking: DROP down onto your hands and knees immediately, COVER your head and neck under a sturdy table or desk, and HOLD ON until all shaking ceases.",
        "Right now, remember Drop, Cover, Hold On: get low on your hands and knees, tuck under something sturdy to protect your head and neck, and hang on until it stops.",
        "If the ground is shaking: drop immediately, get your head and neck covered under solid furniture, and hold on tight — don't move until the shaking fully stops."
      ],
      kit: [
        "72-Hour Survival Kit essentials: 3 gallons of water per person, non-perishable canned food, first aid kit, flashlight, battery radio, whistle, and emergency ID card.",
        "For a 72-hour kit, pack: 3 gallons of water per person, canned/non-perishable food, a first aid kit, flashlight, battery-powered radio, a whistle, and ID.",
        "A solid emergency kit covers 3 days: water (3 gallons/person), shelf-stable food, first aid supplies, a flashlight, a radio, a whistle to signal for help, and identification."
      ],
      sos: [
        "Emergency numbers: Call 108 for Medical/Ambulance in India, 100 for Police, 101 for Fire. In Japan call 119 for Fire/Ambulance and 110 for Police. In US call 911.",
        "Need to call for help? India: 108 (Medical), 100 (Police), 101 (Fire). Japan: 119 (Fire/Ambulance), 110 (Police). US: 911 covers everything.",
        "Emergency lines — India: 108 medical, 100 police, 101 fire. Japan: 119 fire/ambulance, 110 police. United States: 911."
      ],
      sensors: [
        "QuakeGuard Virtual Sensors active: Geophone P-wave early warning, Micro-Doppler rubble motion radar, and FLIR Infrared Thermal Heat Matrix detecting human body temperature (36.8°C).",
        "Active sensors right now: a geophone for P-wave early warning, Micro-Doppler radar for detecting motion under rubble, and a thermal (FLIR) sensor tuned to human body heat.",
        "Sensor status: P-wave geophone (early warning), Micro-Doppler rubble-motion radar, and infrared thermal detection — all monitoring."
      ],
      tsunami: [
        "Tsunami Protocol: If near the coast during a strong tremor, move immediately inland to high ground at least 30 meters above sea level. Do not wait for official sirens.",
        "If you're on the coast and feel strong shaking: don't wait for a siren — head inland and uphill to at least 30 meters above sea level right away.",
        "Tsunami safety: strong coastal shaking is itself the warning. Move to high ground (30m+ above sea level) immediately, sirens or not."
      ],
      after: [
        "After shaking stops: Inspect for gas leaks, turn off main gas and electrical switches, check for structural wall cracks, and evacuate calmly.",
        "Once it's stopped: check for gas leaks by smell, shut off the main gas and electrical switches, look for wall cracks, then evacuate calmly.",
        "Post-quake checklist: gas leak check, main gas/electrical shutoff, inspect walls for cracking, then a calm, orderly evacuation."
      ],
      predict: [
        "The AI Seismic Predictor combines a few physics-based attenuation models (distance, focal depth, soil type) to estimate a 0-100 hazard index — it's a formula-driven estimate, not a trained machine-learning model.",
        "The Seismic Predictor page runs several ground-motion attenuation formulas (accounting for fault distance, depth, and soil) and turns the result into a 0-100 risk score.",
        "That risk score you see on the Predictor page comes from physics-based attenuation math on your fault distance, depth, and soil inputs — not from a trained AI model."
      ],
      volunteer: [
        "Want to help? Head to the Volunteer Network page to register your skills (medical, search & rescue, logistics) and get matched to nearby response teams.",
        "You can sign up as a volunteer on the Volunteer Network page — list your skills and availability and you'll be matched with a local response team."
      ],
      mentalHealth: [
        "It's normal to feel shaken (literally) after an event like this. Once immediate safety needs are handled, reaching out to a counselor or a trusted person to talk it through really does help.",
        "Emotional aftershocks are real too — once you and your family are physically safe, it's worth talking to someone (a counselor, a friend, a community support line) about how you're feeling."
      ],
      children: [
        "For kids: keep instructions simple (Drop, Cover, Hold On works for them too), keep them close during aftershocks, and reassure them calmly — children pick up on adult stress quickly.",
        "With children present: stick to simple, calm instructions, keep them within reach during aftershocks, and try to stay visibly calm yourself — it helps them stay calmer too."
      ],
      power: [
        "If the power is out: avoid candles (fire/gas risk), use flashlights instead, and keep the fridge closed to preserve food. Report downed lines to authorities and stay well clear of them.",
        "No power? Use flashlights, not candles (gas leak + fire risk), keep the fridge shut, and stay far away from any downed power lines — report them, don't approach."
      ],
      default: "QuakeGuard Safety Assistant active: Remember to Drop, Cover, and Hold On! Ask me about nearby shelters, survival kits, emergency numbers, seismic sensors, volunteering, or aftercare.",
      fallback: [
        "I didn't quite catch that. I can help with: shelters, survival kits, emergency numbers, what to do during/after shaking, tsunami safety, volunteering, or coping afterward — try asking about one of those.",
        "Not sure I follow — try asking me about shelters, an emergency kit, emergency numbers, tsunami safety, what to do during or after a quake, or how to volunteer."
      ]
    },

    ta: {
      shelter: "தமிழ்நாட்டின் அருகிலுள்ள நிவாரண முகாம்கள்: ராஜாஜி நிவாரண மையம் சென்னை (13.0827, 80.2707) மற்றும் கோயம்பத்தூர் முகாம் (11.0168, 76.9558). ஜப்பானில் டோக்கியோ அவசர மையம் தயார் நிலையில் உள்ளது.",
      during: "நிலநடுக்கத்தின் போது: உடனே முழங்காலிட்டு கீழே அமரவும் (DROP), உறுதியான மேஜையின் கீழ் தலை மூடவும் (COVER), நகராமல் பிடித்துக்கொள்ளவும் (HOLD ON).",
      kit: "72 மணிநேர அவசர கிட்: நபருக்கு 3 கேலன் நீர், பதிவு செய்யப்பட்ட உணவுகள், முதலுதவி பெட்டி, டார்ச் லைட், ரேடியோ, விசில் மற்றும் அவசர அடையாள அட்டை.",
      sos: "அவசர எண்கள்: இந்தியாவில் மருத்துவ உதவிக்கு 108, காவல்துறைக்கு 100, தீயணைப்புக்கு 101 ஐ அழைக்கவும். ஜப்பானில் 119/110.",
      sensors: "க்வேக்கிகார்ட் சென்சார்கள்: P-அலை முன் எச்சரிக்கை ஜியோஃபோன், ரடார் இயக்க சென்சார் மற்றும் மனித உடல் வெப்பநிலையைக் (36.8°C) கண்டறியும் FLIR தெர்மல் சென்சார் செயல்பாடு.",
      tsunami: "சுனாமி எச்சரிக்கை: கடற்கரை அருகில் இருக்கும்போது நிலநடுக்கம் ஏற்பட்டால், உடனடியாக 30 மீட்டருக்கும் அதிகமான உயரமான நிலப்பகுதிக்கு செல்லவும்.",
      after: "நிலநடுக்கத்திற்குப் பிறகு: கேஸ் கசிவு உள்ளதா எனப் பார்க்கவும், மின் இணைப்பைத் துண்டிக்கவும், சுவர்களில் விரிசல்கள் உள்ளதா எனப் பரிசோதிக்கவும்.",
      predict: "நிலநடுக்க கணிப்பு பக்கம் தூரம், ஆழம், தரை வகை ஆகியவற்றின் அடிப்படையில் இயற்பியல் கணக்கீடுகள் மூலம் 0-100 ஆபத்து குறியீட்டைத் தருகிறது — இது பயிற்சி பெற்ற AI மாடல் அல்ல.",
      default: "QuakeGuard பாதுகாப்பு உதவி: கீழே அமர்ந்து (Drop), மூடி (Cover), பிடித்துக்கொள்ளுங்கள் (Hold On)! முகாம், அவசர எண்கள் அல்லது சென்சார்கள் பற்றி கேட்கவும்.",
      fallback: "அது எனக்குப் புரியவில்லை. முகாம்கள், அவசர கிட், அவசர எண்கள், நிலநடுக்கத்தின் போது/பின் என்ன செய்வது, அல்லது சுனாமி பாதுகாப்பு பற்றி கேட்கவும்."
    },

    hi: {
      shelter: "तमिलनाडु में निकटतम आश्रय राजाजी राहत केंद्र चेन्नई (13.0827, 80.2707) और कोयंबटूर राहत स्टेशन हैं। जापान में टोक्यो राहत केंद्र सक्रिय है।",
      during: "कंपन के दौरान: तुरंत घुटनों के बल झुकें (DROP), मजबूत मेज के नीचे सिर ढकें (COVER), और कसकर पकड़ें (HOLD ON)।",
      kit: "72 घंटे की सुरक्षा किट: प्रति व्यक्ति 3 गैलन पानी, सूखा भोजन, प्राथमिक चिकित्सा किट, टॉर्च, रेडियो और सीटी।",
      sos: "आपातकालीन नंबर: भारत में एम्बुलेंस के लिए 108, पुलिस के लिए 100, अग्निशामक के लिए 101 डायल करें। जापान में 119/110।",
      sensors: "सक्रिय सेंसर: भू-ध्वनि P-तरंग पूर्व चेतावनी, मलबे रडार सेंसर और मानव शरीर के तापमान (36.8°C) का पता लगाने वाला FLIR थर्मल सेंसर।",
      tsunami: "सुनामी नियम: तट के पास तेज कंपन होने पर तुरंत कम से कम 30 मीटर ऊंची जमीन की ओर जाएं।",
      after: "कंपन रुकने के बाद: गैस रिसाव की जांच करें, मुख्य बिजली स्विच बंद करें और क्षतिग्रस्त इमारतों से बाहर निकलें।",
      predict: "भूकंप पूर्वानुमान पेज दूरी, गहराई और मिट्टी के प्रकार के आधार पर भौतिकी-आधारित गणना से 0-100 जोखिम स्कोर देता है — यह कोई प्रशिक्षित AI मॉडल नहीं है।",
      default: "QuakeGuard सुरक्षा सहायक: ड्रॉप, कवर और होल्ड ऑन का पालन करें! आश्रयों, सुरक्षा किट या आपातकालीन नंबरों के बारे में पूछें।",
      fallback: "मुझे यह समझ नहीं आया। आश्रयों, सुरक्षा किट, आपातकालीन नंबरों, भूकंप के दौरान/बाद क्या करें, या सुनामी सुरक्षा के बारे में पूछें।"
    }
  },

  _pick(entry) {
    if (Array.isArray(entry)) return entry[Math.floor(Math.random() * entry.length)];
    return entry;
  },

  updateLang(code) {
    this.activeLang = code;
  },

  toggleChatWindow() {
    const win = document.getElementById('ai-chat-window');
    if (win) {
      win.classList.toggle('active');
      if (win.classList.contains('active')) this._addWelcomeChips();
    }
  },

  // Site-specific topics only this website can answer (its own shelters, pages, sensors).
  // These stay local; everything else in English goes to the AI server when it is reachable.
  _siteSpecific(t) {
    return /\b(shelters?|relief (hub|station|camp)s?|camps?|sensors?|radar|geophone|volunteers?|predictor|risk score|hazard index|community (reports?|feed)|citizen feed|family (circle|safety)|mutual aid)\b/i.test(t);
  },

  async sendMessage() {
    const input = document.getElementById('chat-input-text');
    const msgText = input.value.trim();
    if (!msgText) return;

    this.appendMessage(msgText, 'user');
    input.value = '';

    let reply = null;
    if (this.activeLang === 'en' && !this._siteSpecific(msgText) && window.aiBackend) {
      const typing = this._showTyping();
      reply = await window.aiBackend.ask(msgText);
      typing.remove();
    } else {
      await new Promise(r => setTimeout(r, 350));
    }

    if (reply && reply.answer) {
      this.appendMessage(reply.answer, 'bot', { question: msgText, thoughts: reply.thoughts, ai: true });
      this.speakText(reply.answer);
      return;
    }

    // AI server not used or unreachable -> the on-device brain (offlineBrain.js):
    // 70 vetted safety topics, calculators, quake-database and nearest-facility lookups,
    // and Tamil / Hindi answers. Works with no internet at all.
    let local = null;
    if (window.offlineBrain) {
      try { local = await window.offlineBrain.answer(msgText, { lang: this.activeLang, deferSiteSpecific: true }); }
      catch (e) { console.warn('[QuakeGuard offline brain] failed, using keyword fallback:', e); }
    }
    if (local && local.answer) {
      this.appendMessage(local.answer, 'bot', { local: true, source: local.source, chips: local.chips });
      this.speakText(local.answer);
      return;
    }
    // Site-specific topics (shelter lists, sensors, volunteers...) and anything the brain left open
    const response = this.generateBotResponse(msgText.toLowerCase());
    this.appendMessage(response, 'bot', { local: true });
    this.speakText(response);
  },

  // Tappable starter questions (shown in the first chat message and after unclear answers)
  starterChips: ['What should I do during an earthquake?', 'Nearest shelter', 'Nearest hospital', 'Biggest earthquake in India', 'What goes in an emergency kit?', 'How strong is magnitude 6?'],

  _chipRow(chips) {
    const row = document.createElement('div');
    row.className = 'chat-chips';
    chips.forEach(text => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = text;
      b.onclick = () => { const i = document.getElementById('chat-input-text'); if (i) { i.value = text; this.sendMessage(); } };
      row.appendChild(b);
    });
    return row;
  },

  _addWelcomeChips() {
    const box = document.getElementById('ai-chat-messages');
    if (!box || box.querySelector('.chat-chips') || this.activeLang !== 'en') return;
    const first = box.querySelector('.chat-msg.bot');
    if (first) first.appendChild(this._chipRow(this.starterChips));
  },

  _showTyping() {
    const container = document.getElementById('ai-chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot chat-typing';
    div.textContent = '\u2026';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  },

  generateBotResponse(text) {
    const kb = this.knowledgeBase[this.activeLang] || this.knowledgeBase['en'];
    const pick = (key) => this._pick(kb[key]);

    // 1. Situation-aware specific emergency intent matches
    if (text.includes('trapped') || text.includes('rubble') || text.includes('stuck') || text.includes('சிக்கி') || text.includes('फंसा')) {
      return "🚨 [AI Trapped Survivor Protocol]: Protect your face with clothing. Tap rhythmically 3 times on concrete or metal pipes (... --- ...) so our Micro-Doppler & Bio-Sonar sensors lock onto your position. Rescue teams are active!";
    }

    if (text.includes('gas') || text.includes('fire') || text.includes('leak') || text.includes('smell') || text.includes('கசிவு') || text.includes('रिसना')) {
      return "🔥 [AI Gas & Fire Hazard Protocol]: Shut off main gas valves immediately! Do NOT ignite open flames or turn on electrical switches. Evacuate occupants to open air upwind.";
    }

    if (text.includes('bleed') || text.includes('injured') || text.includes('hurt') || text.includes('wound') || text.includes('காயம்') || text.includes('घायल')) {
      return "🚑 [AI Medical Triage Protocol]: Apply firm, continuous pressure to wounds with a clean cloth. Keep the person warm. Call 108 immediately and do not move victims if spinal injury is suspected.";
    }

    if (text.includes('family') || text.includes('relative') || text.includes('child') || text.includes('kid') || text.includes('குடும்பம்') || text.includes('परिवार')) {
      if (text.includes('kid') || text.includes('child') || text.includes('children')) return pick('children');
      return "👨‍👩‍👧‍👦 [AI Family Safety Protocol]: Open the Family Safety Circle on your home dashboard to mark yourself SAFE and broadcast offline P2P mesh GPS location to your family members.";
    }

    if (text.includes('food') || text.includes('water') || text.includes('hunger') || text.includes('உணவு') || text.includes('पानी') || text.includes('भोजन')) {
      return "🍞 [AI Relief Supply Protocol]: Clean drinking water, food rations, and medical beds are available at Rajaji Relief Hub. You can also share/request supplies on the Community Mutual Aid Board!";
    }

    // 2. Standard knowledge base matches (now with varied phrasing per call)
    if (text.includes('shelter') || text.includes('camp') || text.includes('முகாம்') || text.includes('आश्रय')) return pick('shelter');
    if (text.includes('during') || text.includes('shake') || text.includes('போது') || text.includes('दौरान') || text.includes('protocol')) return pick('during');
    if (text.includes('kit') || text.includes('supply') || text.includes('கிட்') || text.includes('किट')) return pick('kit');
    if (text.includes('sos') || text.includes('call') || text.includes('phone') || text.includes('எண்') || text.includes('नंबर') || text.includes('police') || text.includes('doctor')) return pick('sos');
    if (text.includes('sensor') || text.includes('radar') || text.includes('thermal') || text.includes('சென்சார்') || text.includes('सेंसर')) return pick('sensors');
    if (text.includes('tsunami') || text.includes('ocean') || text.includes('sea') || text.includes('சுனாமி') || text.includes('सुनामी')) return pick('tsunami');
    if (text.includes('after') || text.includes('aftershock') || text.includes('பின்பு') || text.includes('बाद')) return pick('after');
    if (text.includes('predict') || text.includes('risk') || text.includes('score') || text.includes('கணிப்பு') || text.includes('पूर्वा')) return pick('predict');
    if (text.includes('volunteer') || text.includes('help out') || text.includes('rescue team')) return pick('volunteer');
    if (text.includes('scared') || text.includes('anxious') || text.includes('stress') || text.includes('afraid') || text.includes('cope') || text.includes('trauma')) return pick('mentalHealth');
    if (text.includes('power') || text.includes('electric') || text.includes('blackout') || text.includes('outage')) return pick('power');

    if (text.includes('advisory') || text.includes('report') || text.includes('people') || text.includes('feed') || text.includes('அறிக்கை') || text.includes('रिपोर्ट')) {
      const reports = (window.communityReports && window.communityReports.reports) ? window.communityReports.reports : [];
      if (reports.length > 0) {
        const top = reports[0];
        return `[AI Live Citizen Feed Sync]: Latest report near ${top.loc}: "${top.desc}" (Severity: ${top.severity}). Emergency command has dispatched Search & Rescue teams.`;
      }
    }

    // 3. First message in the session gets the friendly overview; genuinely
    // unmatched follow-ups get an honest "didn't understand" instead of
    // silently repeating that same overview as if it were the answer.
    if (!this._lastTopic) {
      this._lastTopic = 'default';
      return kb['default'];
    }
    return this._pick(kb['fallback']) || kb['default'];
  },

  appendMessage(text, sender, meta) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    const body = document.createElement('div');
    body.innerText = text;
    div.appendChild(body);

    if (meta && meta.ai) {
      if (meta.thoughts && meta.thoughts.length) {
        const det = document.createElement('details');
        det.className = 'chat-thinking';
        const sum = document.createElement('summary');
        sum.textContent = 'Thinking';
        det.appendChild(sum);
        meta.thoughts.forEach(t => { const p = document.createElement('div'); p.textContent = t; det.appendChild(p); });
        div.appendChild(det);
      }
      const fb = document.createElement('div');
      fb.className = 'chat-feedback';
      [['\ud83d\udc4d', true], ['\ud83d\udc4e', false]].forEach(([icon, val]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = icon;
        b.title = val ? 'Helpful' : 'Not helpful';
        b.onclick = () => { window.aiBackend.feedback(meta.question, text, val); fb.textContent = 'Thanks for the feedback'; };
        fb.appendChild(b);
      });
      div.appendChild(fb);
    }
    if (meta && meta.local && !meta.ai) {
      const tag = document.createElement('div');
      tag.className = 'chat-source';
      tag.textContent = meta.source === 'tool' ? 'Calculated / looked up on this device' : (navigator.onLine ? 'Answered on this device' : 'Answered offline on this device');
      div.appendChild(tag);
    }
    if (meta && meta.chips && meta.chips.length) div.appendChild(this._chipRow(meta.chips));
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  startVoiceInput() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      const langMap = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN' };
      recognition.lang = langMap[this.activeLang] || 'en-US';

      recognition.onstart = () => {
        console.log('[QuakeGuard Voice Assistant] Listening...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chat-input-text').value = transcript;
        this.sendMessage();
      };

      recognition.start();
    } else {
      alert('Voice Speech Input supported on Chrome, Edge, and Mobile Browsers.');
    }
  },

  speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN' };
      utterance.lang = langMap[this.activeLang] || 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }
};

// Expose module globally so `window.aiVoiceAssistant` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.aiVoiceAssistant = aiVoiceAssistant;
