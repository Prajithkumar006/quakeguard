/* ==========================================================================
   QuakeGuard - Multi-Language Localization Engine (EN, TA, HI)
   ========================================================================== */

const multiLang = {
  currentLang: 'en',

  translations: {
    en: {
      // Navbar & Global
      brandName: "QuakeGuard",
      versionBadge: "v2.4 Live",
      dashboard: "Home",
      liveMap: "Live Map",
      meshNet: "Offline Chat",
      databaseCatalog: "Records",
      aiPredictor: "Risk Checker",
      damageAi: "Check Damage",
      safetyGuide: "Safety Guide",
      incidentReports: "Reports",
      rescueVolunteers: "Volunteers",
      adminCommand: "Control Center",
      sosEmergency: "EMERGENCY SOS",
      a11yBtnTitle: "Accessibility Settings",
      themeBtnTitle: "Switch Light / Dark Mode",
      userProfileTitle: "My Profile",

      // Accessibility Suite
      a11ySuiteTitle: "Accessibility Tools",
      highContrastBtn: "High Contrast",
      largeTextBtn: "Large Text",
      dyslexiaFontBtn: "Easy-Read Font",
      voiceReaderBtn: "Voice Reader",
      deafStrobeBtn: "Flashing Alert",
      simpleModeBtn: "Simple Mode",
      turnOffAllBtn: "Turn Off All",

      // Ticker & Early Warning
      tickerAlert: "SEISMIC ALERT",
      tickerText: "Live USGS seismic feed active. Monitoring global earthquake activity.",
      testPwaveBtn: "Test Earthquake Warning",
      pwaveHeading: "EARTHQUAKE DETECTED!",
      pwaveSub: "Strong Shaking Arrives In:",
      pwaveAction: "DROP, COVER, AND HOLD ON UNDER A STURDY DESK IMMEDIATELY!",

      // Splash Screen
      splashSub: "Earthquake alerts, risk checks, and emergency help — all in one place.",
      launchDashBtn: "Get Started",
      immediateSosBtn: "Immediate SOS",

      // Auth Page
      authTitle: "Sign In to QuakeGuard",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      roleLabel: "I am a...",
      roleCivilian: "Regular User",
      roleVolunteer: "Volunteer / Medic",
      roleAdmin: "Admin",
      signInBtn: "Sign In",
      googleSignInBtn: "Sign In with Google",

      // Dashboard
      globalEventsToday: "Earthquakes Today",
      maxMag24h: "Strongest Quake (24h)",
      userRiskLevel: "Your Area's Risk",
      sensorsCommandEntryTitle: "Rescue Sensors & Controls",
      sensorsCommandEntryDesc: "Check vibration sensors, heartbeat radar, and heat scanners, and control rescue actions with one click.",
      simSensorBadge: "DEMO",
      openCommandHubBtn: "Open Control Center",
      realTimeSeismic: "Recent Earthquake Activity",
      expandMapBtn: "Expand Map",
      tacticalMapWidgetTitle: "Interactive Live Map",
      tacticalMapWidgetSub: "Drag to move, scroll to zoom, and see live earthquake locations.",
      familySafetyTitle: "Family Safety Circle",
      markSelfSafeBtn: "Mark Myself Safe",
      recentQuakes: "Recent Earthquakes",
      sosPanelTitle: "Emergency SOS",
      sosPanelDesc: "Press to share your location, sound an alarm, and alert rescue teams.",
      triggerSosNow: "TRIGGER SOS NOW",
      manageEmergContactsBtn: "Manage Emergency Contacts",
      p2pMeshTitle: "Offline Messaging",
      p2pMeshDesc: "Send messages to nearby people even without internet or phone signal.",
      openMeshBtn: "Open Offline Chat",
      mutualAidTitle: "Community Help Board",
      mutualAidDesc: "Share or ask for supplies like water, power, or medical items with your neighbors.",
      aiRiskTitle: "Earthquake Risk Estimate",
      aiRiskDesc: "Estimate how strong the shaking could be, based on your location and ground type.",
      runRiskModel: "Check My Risk",
      aiDamageTitle: "Check Building Damage",
      aiDamageDesc: "Upload a photo of a building to get an estimate of how damaged it is.",
      scanPhotoBtn: "Check Photo",

      // Live Map Page
      mapHeaderTitle: "Live Earthquake & Emergency Map",
      mapHeaderSub: "See live earthquakes, fault lines, shelters, hospitals, police, and fire stations near you.",
      mapStyleDark: "🌙 Dark Map",
      mapStyleOsm: "🗺️ Standard Map",
      mapStyleLight: "☀️ Light Map",
      mapStyleTopo: "🏔️ Terrain Map",
      mapStyleVoyager: "🛰️ Street Map",
      fullWorldViewBtn: "🌐 Full World Map",
      mapProviderUsgs: "📡 Live Earthquakes (USGS)",
      mapProviderEmsc: "🌐 Europe Earthquakes (EMSC)",
      mapProviderHist: "📜 Past Earthquakes",
      magFilterAll: "All Magnitudes",
      magFilterMod: "Moderate (4.5+)",
      magFilterMaj: "Major (6.0+)",
      magFilterCat: "Catastrophic (7.5+)",
      shelterToggleBtn: "Shelters",
      hospitalToggleBtn: "Hospitals",
      policeToggleBtn: "Police",
      fireToggleBtn: "Fire",
      faultsToggleBtn: "Faults",
      evacRouteBtn: "Evacuation Route",
      globeTitle: "3D Earth Globe",
      globeSub: "Spin the globe, see earthquake locations, and turn on 3D buildings and terrain by zooming in close.",
      flyIndiaBtn: "📍 Tamil Nadu / India",
      flyCoimbatoreBtn: "📍 Coimbatore / TN",
      flyJapanBtn: "📍 Tokyo / Japan",
      flyUsaBtn: "📍 San Francisco / USA",
      resetGlobeBtn: "🌐 Reset View",

      // Off-Grid P2P Mesh Page
      meshHeading: "Offline Messaging Center",
      meshSub: "Send messages and alerts to nearby devices, even without internet or phone signal.",
      meshPeersCount: "4 Nearby Devices Connected",
      broadcastMsgTitle: "Send a Message",
      broadcastMsgPlaceholder: "Type your message or location to send to nearby devices...",
      relayBroadcastBtn: "Send",
      meshFeedTitle: "Recent Messages",

      // Database Catalog Explorer
      dbHeading: "Earthquake & Facility Records",
      dbSub: "Browse and search earthquake data, past events, and emergency facility locations.",
      dbRecordsCount: "7 Records",
      exportJsonBtn: "Export JSON",
      catHistorical: "Past Earthquakes",
      catShelters: "Shelters",
      catHospitals: "Hospitals",
      catFaults: "Fault Lines",
      dbSearchPlaceholder: "Search by location, year, magnitude, or facility name...",
      searchBtn: "Search",

      // AI Risk Calculator
      aiCalcHeading: "Earthquake Risk Calculator",
      aiCalcDesc: "Enter your location and ground details to estimate how risky an earthquake could be there.",
      latLngLabel: "Location (Latitude / Longitude)",
      faultDistLabel: "Distance to Fault Line (km)",
      depthLabel: "Earthquake Depth (km)",
      soilLabel: "Ground Type",
      soilOptionE: "Soft Soil (Clay / Sandy)",
      soilOptionCD: "Medium Soil (Sand / Gravel)",
      soilOptionAB: "Solid Rock",
      mlAlgoLabel: "Select Attenuation Model (Admin Only)",
      execModelBtn: "Check My Risk",
      readyPrediction: "Ready When You Are",
      clickExecDesc: "Click the button below to get your risk score.",

      // Structural Damage Inspector
      aiDamageHeading: "Building Damage Check",
      aiDamageSub: "Upload a photo of a damaged wall or building, and we'll estimate how serious the damage looks.",
      uploadBoxTitle: "Select or Drop Photo Here",
      uploadBoxSub: "Supports JPG, PNG, WEBP formats",
      testSampleBtn: "Try a Sample Photo",

      // Disaster Preparedness
      safetyHeading: "Earthquake Safety Guide",
      beforeTitle: "BEFORE (Preparation)",
      duringTitle: "DURING (DROP, COVER, HOLD ON)",
      afterTitle: "AFTER (Evacuation)",
      beforeItem1: "Secure heavy furniture and appliances to the wall so they can't fall.",
      beforeItem2: "Establish an emergency family meeting spot and communication plan.",
      beforeItem3: "Maintain a 72-hour emergency kit with water, food, flashlight, and first aid.",
      duringItem1: "DROP down onto your hands and knees immediately.",
      duringItem2: "COVER your head and neck under a sturdy table or desk.",
      duringItem3: "HOLD ON to your shelter until all ground shaking ceases.",
      afterItem1: "Check your home for gas leaks, broken pipes, and electrical hazards.",
      afterItem2: "Evacuate calmly to designated open-air emergency relief shelters.",
      kitTitle: "72-Hour Emergency Kit Checklist",

      // Incident Reports
      reportHeading: "Report an Emergency",
      incTypeLabel: "What Happened?",
      incSeverityLabel: "How Urgent?",
      incDescLabel: "Location & Details",
      incDescPlaceholder: "Describe the location and what's happening...",
      broadcastReportBtn: "Submit Report",
      liveFeedTitle: "Community Reports",

      // Volunteer Network
      volunteerHeading: "Volunteer Rescue Network",
      volunteerSub: "Accept nearby missions, help with medical aid, and support rescue teams.",
      regVolunteerBtn: "Register as Volunteer",
      nearbyMissionsTitle: "Nearby Missions",

      // Command Center
      sensorsCommandHeading: "Control Center",
      sensorsCommandSub: "Sensors that detect survivors, quick emergency controls, and safety announcements.",
      simSensorBannerTitle: "Demo Mode:",
      simSensorBannerText: "The sensor numbers on this page are made up for this demo — there's no real radar or camera hardware connected yet. Everything else in the app (earthquake data, risk score, and photo damage check) is real.",
      easyViewBtnCmd: "Easy View (For Everyone)",
      advTelemetryBtnCmd: "Advanced View",
      quickActionsTitle: "Quick Actions",
      dispatchRescueBtn: "Send Rescue Team",
      soundSirenBtn: "Sound Alarm",
      testShakingBtn: "Test Earthquake Alert",
      broadcastAlertBtn: "Send Emergency Alert",
      cardSeismicTitle: "Ground Shaking Sensor",
      cardVictimsTitle: "Survivor Radar",
      cardThermalTitle: "Heat Camera",
      cardAnimalTitle: "Animal Early Warning",
      publicAdvisoriesTitle: "Safety Announcements",
      broadcastAdvisoryBtn: "Send Safety Announcement",
      autoGenUpdateBtn: "Auto-Create Update",

      // SOS Overlay Modal
      sosAlertTitle: "EMERGENCY SOS SIGNAL ACTIVE",
      sosAlertSub: "Sending your location to emergency responders and sounding an alarm",
      sosDispatchBtn: "CALL 112 NOW",
      sendSmsSosBtn: "Send SOS via SMS",
      muteAlarmBtn: "Mute Siren",
      abortEmergencyBtn: "Cancel SOS",

      // Profile & QR ID
      userProfileHeader: "My Profile",
      medicalIdTitle: "EMERGENCY MEDICAL IDENTIFICATION",
      scanQrNote: "Responders can scan this to see your medical info",

      // Assistant Chatbot
      chatHeaderTitle: "Safety Assistant",
      chatInputPlaceholder: "Type your safety question..."
    },

    ta: {
      // Navbar & Global
      brandName: "குவேக்கிகார்டு",
      versionBadge: "பதிப்பு 2.4 நேரலை",
      dashboard: "முகப்பு",
      liveMap: "நேரலை வரைபடம்",
      meshNet: "P2P மேஷ் நெட்வொர்க்",
      databaseCatalog: "தரவுத்தள பட்டியல்",
      aiPredictor: "ஆபத்து கணிப்பான்",
      damageAi: "சேத ஆய்வு",
      safetyGuide: "பாதுகாப்பு வழிகாட்டி",
      incidentReports: "சம்பவ அறிக்கைகள்",
      rescueVolunteers: "தன்னார்வலர் பிணையம்",
      adminCommand: "சென்சார்கள் & கட்டளை",
      sosEmergency: "அவசர SOS",
      a11yBtnTitle: "அணுகல்தன்மை தேர்வுகளை மாற்று",
      themeBtnTitle: "இருண்ட/வெளிச்ச பயன்முறையை மாற்று",
      userProfileTitle: "பயனர் சுயவிவரம்",

      // Accessibility Suite
      a11ySuiteTitle: "மாற்றுத்திறனாளி உதவித் தொகுப்பு (இயக்கத்தில்)",
      highContrastBtn: "அதிக மாறுபாடு",
      largeTextBtn: "பெரிய எழுத்து",
      dyslexiaFontBtn: "டிஸ்லெக்சியா எழுத்து",
      voiceReaderBtn: "குரல் வாசிப்பான்",
      deafStrobeBtn: "காதுகேளாதோர் ஒளிரும் ஒளி",
      simpleModeBtn: "எளிய பயன்முறை",
      turnOffAllBtn: "அனைத்தையும் அணைக்கவும்",

      // Ticker & Early Warning
      tickerAlert: "நிலநடுக்க எச்சரிக்கை",
      tickerText: "USGS நேரலை நிலநடுக்க தரவு சேகரிக்கப்படுகிறது. உலகளாவிய நடவடிக்கைகளின் நேரலை கண்காணிப்பு.",
      testPwaveBtn: "P-அலை எச்சரிக்கை சோதனை",
      pwaveHeading: "நிலநடுக்க P-அலை கண்டறியப்பட்டது!",
      pwaveSub: "அழிவுகரமான S-அலை நிலநடுக்கம் வரவிருக்கும் நேரம்:",
      pwaveAction: "உடனே உறுதியான மேஜையின் கீழ் அமர்ந்து பிடித்துக் கொள்ளவும்!",

      // Splash Screen
      splashSub: "நேரலை நிலநடுக்க கண்காணிப்பு, ஆபத்து கணிப்பு மற்றும் அவசர உதவி தளம்",
      launchDashBtn: "முகப்பிற்குச் செல்",
      immediateSosBtn: "உடனடி SOS",

      // Auth Page
      authTitle: "குவேக்கிகார்டில் உள்நுழையவும்",
      emailLabel: "மின்னஞ்சல் முகவரி",
      passwordLabel: "கடவுச்சொல்",
      roleLabel: "பயனர் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்",
      roleCivilian: "சாதாரண குடிமகன் கணக்கு",
      roleVolunteer: "பதிவுசெய்த முதலுதவியாளர் / மருத்துவர்",
      roleAdmin: "பேரிடர் மேலாண்மை நிர்வாகி",
      signInBtn: "உள்நுழை",
      googleSignInBtn: "கூகிள் மூலம் உள்நுழை",

      // Dashboard
      globalEventsToday: "இன்றைய நிலநடுக்கங்கள்",
      maxMag24h: "24 மணிநேர அதிகபட்ச வீச்சு",
      userRiskLevel: "உள்ளூர் ஆபத்து நிலை",
      sensorsCommandEntryTitle: "நேரலை உயிர் கண்டறிதல் சென்சார்கள் & கட்டளை மையம்",
      sensorsCommandEntryDesc: "நில அதிர்வு சென்சார்கள், இதயத்துடிப்பு ரேடார் மற்றும் 1-கிளிக் மீட்பு கட்டுப்பாடுகளை எளிதாக சரிபார்க்கவும்.",
      simSensorBadge: "டெமோ",
      openCommandHubBtn: "சென்சார்கள் & கட்டளை மையத்திற்குச் செல்",
      realTimeSeismic: "நேரலை நிலநடுக்க நடவடிக்கை",
      expandMapBtn: "வரைபடத்தை விரிவுபடுத்து",
      tacticalMapWidgetTitle: "நேரலை உத்தி வரைபட விட்ஜெட்",
      tacticalMapWidgetSub: "வரைபடத்தை நகர்த்தவும், பெரிதாக்கவும் மற்றும் நிலநடுக்க மையங்களை ஆராயவும்.",
      familySafetyTitle: "குடும்பப் பாதுகாப்பு வட்டம்",
      markSelfSafeBtn: "நான் பாதுகாப்பாக உள்ளேன்",
      recentQuakes: "சமீபத்திய நிலநடுக்கங்கள்",
      sosPanelTitle: "அவசர SOS பொத்தான்",
      sosPanelDesc: "அழுத்தினால் உங்கள் ஜிபிஎஸ் இருப்பிடம் மீட்புக் குழுவுக்கு அனுப்பப்பட்டு சைரன் ஒலிக்கும்.",
      triggerSosNow: "SOS செயல்படுத்து",
      manageEmergContactsBtn: "அவசர தொடர்புகளை நிர்வகி",
      p2pMeshTitle: "ஆஃப்-கிரிட் P2P மேஷ் நெட்வொர்க்",
      p2pMeshDesc: "செல்போன் சேவை அல்லது இணையம் இன்றி அருகிலுள்ளவர்களுடன் செய்தி பரிமாறவும்.",
      openMeshBtn: "மேஷ் தொடர்பைத் திற",
      mutualAidTitle: "சமூக உதவிப் பலகை",
      mutualAidDesc: "அவசர அத்தியாவசியப் பொருட்களைப் (தண்ணீர், ஜெனரேட்டர், மருந்து) பகிர்ந்து கொள்ளுங்கள்.",
      aiRiskTitle: "நிலநடுக்க ஆபத்து கணிப்பு",
      aiRiskDesc: "பிளவு கோடு தொலைவு மற்றும் மண் தன்மையைக் கொண்டு ஆபத்தைக் கணக்கிடுகிறது.",
      runRiskModel: "ஆபத்தைக் கணக்கிடு",
      aiDamageTitle: "கட்டிட சேத ஆய்வு",
      aiDamageDesc: "கட்டிட புகைப்படத்தைப் பதிவேற்றி சுவர்களின் உறுதித்தன்மையை ஆராயுங்கள்.",
      scanPhotoBtn: "புகைப்படத்தை ஆய்வு செய்",

      // Live Map Page
      mapHeaderTitle: "நேரலை நிலநடுக்க & அவசர வரைபடம்",
      mapHeaderSub: "நிலநடுக்க மையங்கள், பிளவு கோடுகள், முகாம்கள், மருத்துவமனைகள் மற்றும் காவல் நிலையங்களின் நேரலை வரைபடம்.",
      mapStyleDark: "🌙 இருண்ட அவசர வரைபடம் (Mapcn)",
      mapStyleOsm: "🗺️ திறந்த வரைபடம் (OSM)",
      mapStyleLight: "☀️ பிரகாசமான வரைபடம் (Mapcn)",
      mapStyleTopo: "🏔️ நிலப்பரப்பு வரைபடம்",
      mapStyleVoyager: "🛰️ செயற்கைக்கோள் அடுக்கு",
      fullWorldViewBtn: "🌐 முழு உலக வரைபடம்",
      mapProviderUsgs: "📡 USGS நேரலை API",
      mapProviderEmsc: "🌐 EMSC ஐரோப்பா",
      mapProviderHist: "📜 வரலாற்றுப் பதிவுகள்",
      magFilterAll: "அனைத்து அளவுகளும்",
      magFilterMod: "M 4.5+ மிதமான",
      magFilterMaj: "M 6.0+ பெரிய",
      magFilterCat: "M 7.5+ பேரழிவு",
      shelterToggleBtn: "முகாம்கள்",
      hospitalToggleBtn: "மருத்துவமனைகள்",
      policeToggleBtn: "காவல்/மீட்பு",
      fireToggleBtn: "தீயணைப்பு",
      faultsToggleBtn: "பிளவு கோடுகள்",
      evacRouteBtn: "வெளியேற்ற பாதை",
      globeTitle: "3D முப்பரிமாண பூமி வரைபடம் (MapLibre GL v5.24.0)",
      globeSub: "3D பூமியைச் சுழற்றி உலகளாவிய நிலநடுக்க மையங்களை ஆராயுங்கள்.",
      flyIndiaBtn: "📍 தமிழ்நாடு / இந்தியா",
      flyCoimbatoreBtn: "📍 கோயம்புத்தூர் / தநா",
      flyJapanBtn: "📍 டோக்கியோ / ஜப்பான்",
      flyUsaBtn: "📍 சான் பிரான்சிஸ்கோ / அமெரிக்கா",
      resetGlobeBtn: "🌐 உலக வரைபடத்தை மீட்டமை",

      // Off-Grid P2P Mesh Page
      meshHeading: "ஆஃப்-கிரிட் P2P மேஷ் தொடர்பு மையம்",
      meshSub: "இணைய சேவை அல்லது செல்போன் கோபுரம் இன்றி சாதனங்களுக்கு இடையே செய்தி அனுப்பவும்.",
      meshPeersCount: "4 மேஷ் சாதனங்கள் இணைப்பில் உள்ளன",
      broadcastMsgTitle: "மேஷ் செய்தியை ஒளிபரப்பு",
      broadcastMsgPlaceholder: "அவசர செய்தி அல்லது இருப்பிடத்தை தட்டச்சு செய்க...",
      relayBroadcastBtn: "செய்தியை அனுப்பு",
      meshFeedTitle: "நேரலை மேஷ் பிணைய செய்தி ஊட்டம்",

      // Database Catalog Explorer
      dbHeading: "நிலநடுக்க & உள்கட்டமைப்பு தரவுத்தள பட்டியல்",
      dbSub: "நிலநடுக்கப் பதிவுகள், வரலாற்றுத் தரவுகள் மற்றும் அவசர வசதி தரவுத்தளங்களைத் தேடுங்கள்.",
      dbRecordsCount: "7 பதிவுகள்",
      exportJsonBtn: "JSON பதிவிறக்கம்",
      catHistorical: "வரலாற்றுப் பதிவுகள்",
      catShelters: "நிவாரண முகாம்கள்",
      catHospitals: "அவசர மருத்துவமனைகள்",
      catFaults: "பிளவு கோடுகள்",
      dbSearchPlaceholder: "இருப்பிடம், ஆண்டு, அளவு அல்லது பெயர் மூலம் தேடுக...",
      searchBtn: "தேடு",

      // AI Risk Calculator
      aiCalcHeading: "நிலநடுக்க ஆபத்து கணக்கீடு",
      aiCalcDesc: "நில அதிர்வு ஆபத்தை அறிய புவியியல் அளவீடுகளை உள்ளிடவும்.",
      latLngLabel: "அட்சரேகை / தீர்க்கரேகை",
      faultDistLabel: "பிளவு கோடு தொலைவு (கி.மீ)",
      depthLabel: "நிலநடுக்க ஆழம் (கி.மீ)",
      soilLabel: "மண் வகைப்பாடு",
      soilOptionE: "வகை E: மென்மையான களிமண் / நீராகும் மண்",
      soilOptionCD: "வகை C/D: அடர்ந்த மணல் & பருக்கைக் கல்",
      soilOptionAB: "வகை A/B: கடின பாறை / கிரானைட்",
      mlAlgoLabel: "எந்திர கற்றல் வழிமுறையைத் தேர்ந்தெடுக்கவும்",
      execModelBtn: "ஆபத்தைக் கணக்கிடு",
      readyPrediction: "ஆய்வுக்குத் தயார்",
      clickExecDesc: "ஆபத்து அளவை அறிய 'ஆபத்தைக் கணக்கிடு' பொத்தானை அழுத்தவும்.",

      // Structural Damage Inspector
      aiDamageHeading: "கட்டிட சேதப் பரிசோதனை",
      aiDamageSub: "சேதமடைந்த சுவர்கள் அல்லது அடித்தளத்தின் புகைப்படத்தைப் பதிவேற்றவும்.",
      uploadBoxTitle: "புகைப்படத்தைத் தேர்ந்தெடுக்கவும்",
      uploadBoxSub: "JPG, PNG, WEBP கோப்புகளை ஆதரிக்கிறது",
      testSampleBtn: "மாதிரி புகைப்படத்தை சோதிக்கவும்",

      // Disaster Preparedness
      safetyHeading: "பேரிடர் பாதுகாப்பு & உயிர்வாழும் வழிகாட்டிகள்",
      beforeTitle: "முன்பு (தயாரிப்பு)",
      duringTitle: "போது (கீழே அமர், மூடு, பிடி)",
      afterTitle: "பின்பு (வெளியேற்றம்)",
      beforeItem1: "கனமான பொருட்களை சுவர்களில் பலமாகப் பொருத்தவும்.",
      beforeItem2: "குடும்ப அவசர தொடர்பு திட்டத்தை தயார் செய்யுங்கள்.",
      beforeItem3: "72 மணிநேர அவசர பொருட்கள் கிட்டை தயார் நிலையில் வைக்கவும்.",
      duringItem1: "உடனே முழங்காலிட்டு கீழே அமரவும் (DROP).",
      duringItem2: "உறுதியான மேஜையின் கீழ் தலையைப் பாதுகாக்கவும் (COVER).",
      duringItem3: "அதிர்வு நிற்கும் வரை மேஜையைப் பிடித்துக்கொள்ளவும் (HOLD ON).",
      afterItem1: "எரிவாயு கசிவு மற்றும் மின் சேதங்களை கவனமாக சரிபார்க்கவும்.",
      afterItem2: "பாதுகாப்பான திறந்தவெளி மீட்பு முகாம்களுக்குச் செல்லவும்.",
      kitTitle: "72 மணிநேர அவசர கால கிட் சரிபார்ப்புப் பட்டியல்",

      // Incident Reports
      reportHeading: "அவசர சம்பவத்தைப் புகாரளி",
      incTypeLabel: "சம்பவ வகை",
      incSeverityLabel: "அவசர நிலை",
      incDescLabel: "இருப்பிடம் மற்றும் விபரங்கள்",
      incDescPlaceholder: "முகவரி மற்றும் காயமடைந்தவர்களின் விபரங்களை உள்ளிடவும்...",
      broadcastReportBtn: "அறிக்கையை அனுப்பு",
      liveFeedTitle: "நேரலை சம்பவ ஊட்டம்",

      // Volunteer Network
      volunteerHeading: "தன்னார்வலர் மீட்புப் பிணையம்",
      volunteerSub: "அவசர மீட்புப் பணிகளை ஏற்றுக்கொண்டு மருத்துவ உதவிகளை வழங்கவும்.",
      regVolunteerBtn: "தன்னார்வலராகப் பதிவுசெய்",
      nearbyMissionsTitle: "அருகிலுள்ள அவசரப் பணிகள்",

      // Command Center
      sensorsCommandHeading: "சென்சார்கள் & கட்டளை மையம்",
      sensorsCommandSub: "நேரலை உயிர் கண்டறிதல் சென்சார்கள், அவசர கட்டுப்பாடுகள் மற்றும் பொது பாதுகாப்பு அறிவிப்புகள்.",
      simSensorBannerTitle: "டெமோ முறை:",
      simSensorBannerText: "இந்தப் பக்கத்தில் உள்ள சென்சார் எண்கள் இந்த டெமோவுக்காக உருவாக்கப்பட்டவை — இன்னும் உண்மையான ரேடார் அல்லது கேமரா இணைக்கப்படவில்லை. பயன்பாட்டின் மற்ற அனைத்தும் (நிலநடுக்க தரவு, ஆபத்து மதிப்பெண், புகைப்பட சேத பரிசோதனை) உண்மையானவை.",
      easyViewBtnCmd: "எளிய பார்வை (அனைவருக்கும்)",
      advTelemetryBtnCmd: "மேம்பட்ட அளவீடுகள்",
      quickActionsTitle: "விரைவான அவசர நடவடிக்கைகள் (1-கிளிக் கட்டுப்பாடுகள்)",
      dispatchRescueBtn: "மீட்புக் குழுவை அனுப்பு",
      soundSirenBtn: "சென்சார் சைரனை ஒலி",
      testShakingBtn: "நில அதிர்வு எச்சரிக்கையை சோதி",
      broadcastAlertBtn: "அவசர எச்சரிக்கையை ஒளிபரப்பு",
      cardSeismicTitle: "நில அதிர்வு சென்சார்",
      cardVictimsTitle: "இடிபாடுகளின் கீழ் உள்ளவர்களைக் கண்டறியும் ரேடார்",
      cardThermalTitle: "அகச்சிவப்பு வெப்ப கேமரா",
      cardAnimalTitle: "விலங்குகளின் முன் எச்சரிக்கை",
      publicAdvisoriesTitle: "பொது பாதுகாப்பு வழிகாட்டல்கள்",
      broadcastAdvisoryBtn: "சூழ்நிலைக்கு ஏற்ற வழிகாட்டலை அனுப்பு",
      autoGenUpdateBtn: "பாதுகாப்பு புதுப்பிப்பை உருவாக்கு",

      // SOS Overlay Modal
      sosAlertTitle: "SOS அவசர எச்சரிக்கை சமிக்ஞை",
      sosAlertSub: "உங்கள் ஜிபிஎஸ் இருப்பிடம் மீட்புக் குழுவிற்கு அனுப்பப்பட்டு சைரன் ஒலிக்கிறது",
      sosDispatchBtn: "112ஐ இப்போது அழை",
      sendSmsSosBtn: "SMS மூலம் SOS அனுப்பு",
      muteAlarmBtn: "ஒலியை நிறுத்து",
      abortEmergencyBtn: "ரத்து செய்",

      // Profile & QR ID
      userProfileHeader: "பயனர் 0 (சாதாரண குடிமகன்)",
      medicalIdTitle: "அவசர மருத்துவ அடையாளம்",
      scanQrNote: "முதலுதவியாளர்களால் ஸ்கேன் செய்யக்கூடிய மருத்துவ வரலாறு",

      // Assistant Chatbot
      chatHeaderTitle: "பாதுகாப்பு உதவியாளர்",
      chatInputPlaceholder: "உங்கள் கேள்வியைத் தட்டச்சு செய்க..."
    },

    hi: {
      // Navbar & Global
      brandName: "क्वेकगार्ड",
      versionBadge: "संस्करण 2.4 लाइव",
      dashboard: "डैशबोर्ड",
      liveMap: "लाइव नक्शा",
      meshNet: "P2P मेश नेटवर्क",
      databaseCatalog: "डेटाबेस कैटलॉग",
      aiPredictor: "जोखिम कैलकुलेटर",
      damageAi: "क्षति निरीक्षक",
      safetyGuide: "सुरक्षा गाइड",
      incidentReports: "घटना रिपोर्ट",
      rescueVolunteers: "स्वयंसेवक नेटवर्क",
      adminCommand: "सेंसर और कमांड",
      sosEmergency: "आपातकालीन SOS",
      a11yBtnTitle: "पहुंच विकल्पों को बदलें",
      themeBtnTitle: "डार्क/लाइट मोड बदलें",
      userProfileTitle: "उपयोगकर्ता प्रोफ़ाइल",

      // Accessibility Suite
      a11ySuiteTitle: "विकलांगता सहायता सूट (सक्रिय)",
      highContrastBtn: "उच्च कंट्रास्ट",
      largeTextBtn: "बड़ा टेक्स्ट",
      dyslexiaFontBtn: "डिस्लेक्सिया फ़ॉन्ट",
      voiceReaderBtn: "वॉयस रीडर",
      deafStrobeBtn: "बधिर फ़्लैश स्ट्रोब",
      simpleModeBtn: "सरल मोड",
      turnOffAllBtn: "सभी बंद करें",

      // Ticker & Early Warning
      tickerAlert: "भूकंपीय अलर्ट",
      tickerText: "USGS लाइव डेटा सक्रिय। वैश्विक भूकंपीय गतिविधियों की निरंतर निगरानी जारी है।",
      testPwaveBtn: "P-तरंग चेतावनी परीक्षण",
      pwaveHeading: "भूकंपीय P-तरंग पाई गई!",
      pwaveSub: "विनाशकारी S-तरंग का आगमन समय:",
      pwaveAction: "तुरंत एक मजबूत मेज के नीचे झुकें, ढकें और पकड़ें!",

      // Splash Screen
      splashSub: "वास्तविक समय भूकंपीय निगरानी, जोखिम गणना और आपातकालीन प्रतिक्रिया मंच",
      launchDashBtn: "डैशबोर्ड शुरू करें",
      immediateSosBtn: "त्वरित SOS",

      // Auth Page
      authTitle: "क्वेकगार्ड में साइन इन करें",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      roleLabel: "उपयोगकर्ता भूमिका चुनें",
      roleCivilian: "सामान्य नागरिक खाता",
      roleVolunteer: "पंजीकृत प्रथम प्रतिक्रियाकर्ता / चिकित्सक",
      roleAdmin: "आपदा प्रतिक्रिया प्रशासक",
      signInBtn: "साइन इन करें",
      googleSignInBtn: "Google के साथ साइन इन करें",

      // Dashboard
      globalEventsToday: "आज की भूकंपीय घटनाएं",
      maxMag24h: "24 घंटे में अधिकतम तीव्रता",
      userRiskLevel: "स्थानीय जोखिम स्तर",
      sensorsCommandEntryTitle: "लाइव जीवन पहचान सेंसर और कमांड हब",
      sensorsCommandEntryDesc: "भू-कंपन सेंसर, दिल की धड़कन रडार और 1-क्लिक बचाव नियंत्रण आसानी से जांचें।",
      simSensorBadge: "डेमो",
      openCommandHubBtn: "सेंसर और कमांड हब खोलें",
      realTimeSeismic: "वास्तविक समय भूकंपीय गतिविधि",
      expandMapBtn: "नक्शा बढ़ाएं",
      tacticalMapWidgetTitle: "इंटरएक्टिव सामरिक लाइव नक्शा विजेट",
      tacticalMapWidgetSub: "खींचकर पैन करें, ज़ूम करें और भूकंप के केंद्रों का निरीक्षण करें।",
      familySafetyTitle: "पारिवारिक सुरक्षा चक्र",
      markSelfSafeBtn: "मुझे सुरक्षित चिह्नित करें",
      recentQuakes: "नवीनतम भूकंप",
      sosPanelTitle: "आपातकालीन SOS बटन",
      sosPanelDesc: "अपना जीपीएस स्थान भेजने, सायरन बजाने और बचाव दल को सूचित करने के लिए दबाएं।",
      triggerSosNow: "SOS अभी शुरू करें",
      manageEmergContactsBtn: "आपातकालीन संपर्क प्रबंधित करें",
      p2pMeshTitle: "ऑफ़-ग्रिड P2P मेश नेटवर्क",
      p2pMeshDesc: "इंटरनेट या फोन नेटवर्क के बिना आसपास के लोगों से संवाद करें।",
      openMeshBtn: "मेश संचार खोलें",
      mutualAidTitle: "सामुदायिक आपसी सहायता बोर्ड",
      mutualAidDesc: "पड़ोसियों के साथ आपातकालीन वस्तुओं (पानी, जनरेटर, दवाएं) को साझा करें।",
      aiRiskTitle: "भूकंपीय जोखिम गणना",
      aiRiskDesc: "फॉल्ट लाइन की दूरी और मिट्टी के आधार पर जोखिम की गणना करें।",
      runRiskModel: "जोखिम की गणना करें",
      aiDamageTitle: "संरचनात्मक क्षति निरीक्षक",
      aiDamageDesc: "दीवारों की दरारों और स्थिरता का मूल्यांकन करने के लिए फोटो अपलोड करें।",
      scanPhotoBtn: "फोटो की जांच करें",

      // Live Map Page
      mapHeaderTitle: "लाइव भूकंप और आपातकालीन नक्शा",
      mapHeaderSub: "भूकंप केंद्र, फॉल्ट लाइनें, आश्रय स्थल, अस्पताल और पुलिस स्टेशन की लाइव ट्रैकिंग।",
      mapStyleDark: "🌙 डार्क आपातकालीन नक्शा (Mapcn)",
      mapStyleOsm: "🗺️ ओपनस्ट्रीटमैप मानक",
      mapStyleLight: "☀️ लाइट मैपसिन पोजीट्रॉन",
      mapStyleTopo: "🏔️ ओपनटोपो भूभाग",
      mapStyleVoyager: "🛰️ कार्टो वोयाजर परत",
      fullWorldViewBtn: "🌐 संपूर्ण विश्व मानचित्र",
      mapProviderUsgs: "📡 USGS लाइव API",
      mapProviderEmsc: "🌐 EMSC यूरोप",
      mapProviderHist: "📜 ऐतिहासिक कैटलॉग",
      magFilterAll: "सभी तीव्रताएं",
      magFilterMod: "M 4.5+ मध्यम",
      magFilterMaj: "M 6.0+ प्रमुख",
      magFilterCat: "M 7.5+ विनाशकारी",
      shelterToggleBtn: "आश्रय",
      hospitalToggleBtn: "अस्पताल",
      policeToggleBtn: "पुलिस/बचाव",
      fireToggleBtn: "दमकल",
      faultsToggleBtn: "फॉल्ट लाइनें",
      evacRouteBtn: "निकासी मार्ग",
      globeTitle: "3D इंटरएक्टिव पृथ्वी ग्लोब (MapLibre GL v5.24.0)",
      globeSub: "3D ग्लोब को घुमाएं और वैश्विक भूकंप केंद्रों का निरीक्षण करें।",
      flyIndiaBtn: "📍 तमिलनाडु / भारत",
      flyCoimbatoreBtn: "📍 कोयंबटूर / तमिलनाडु",
      flyJapanBtn: "📍 टोक्यो / जापान",
      flyUsaBtn: "📍 सैन फ्रांसिस्को / यूएसए",
      resetGlobeBtn: "🌐 विश्व ग्लोब रीसेट करें",

      // Off-Grid P2P Mesh Page
      meshHeading: "ऑफ़-ग्रिड P2P मेश संचार केंद्र",
      meshSub: "इंटरनेट या मोबाइल नेटवर्क के बिना उपकरणों के बीच संदेश और संकट चेतावनी भेजें।",
      meshPeersCount: "4 मेश उपकरण सीमा में हैं",
      broadcastMsgTitle: "मेश संदेश प्रसारित करें",
      broadcastMsgPlaceholder: "आपातकालीन संदेश या स्थान टाइप करें...",
      relayBroadcastBtn: "संदेश भेजें",
      meshFeedTitle: "लाइव मेश नेटवर्क प्रसारण फ़ीड",

      // Database Catalog Explorer
      dbHeading: "भूकंपीय और बुनियादी ढांचा डेटाबेस कैटलॉग",
      dbSub: "भूकंप लॉग, ऐतिहासिक डेटा और आपातकालीन सुविधा डेटाबेस खोजें।",
      dbRecordsCount: "7 कैटलॉग रिकॉर्ड",
      exportJsonBtn: "JSON निर्यात करें",
      catHistorical: "ऐतिहासिक कैटलॉग",
      catShelters: "राहत आश्रय",
      catHospitals: "ट्रॉमा अस्पताल",
      catFaults: "फॉल्ट लाइनें",
      dbSearchPlaceholder: "स्थान, वर्ष, तीव्रता या नाम से खोजें...",
      searchBtn: "खोजें",

      // AI Risk Calculator
      aiCalcHeading: "भूकंपीय जोखिम कैलकुलेटर",
      aiCalcDesc: "जोखिम स्तर का अनुमान लगाने के लिए भौगोलिक डेटा दर्ज करें।",
      latLngLabel: "अक्षांश / देशांतर",
      faultDistLabel: "फॉल्ट लाइन से दूरी (किमी)",
      depthLabel: "भूकंप की गहराई (किमी)",
      soilLabel: "मिट्टी का वर्गीकरण",
      soilOptionE: "वर्ग E: नरम मिट्टी / द्रवीभूत मिट्टी",
      soilOptionCD: "वर्ग C/D: घनी रेत और बजरी",
      soilOptionAB: "वर्ग A/B: ठोस चट्टान / ग्रेनाइट",
      mlAlgoLabel: "मशीन लर्निंग एल्गोरिदम चुनें",
      execModelBtn: "जोखिम स्कोर निकालें",
      readyPrediction: "विश्लेषण के लिए तैयार",
      clickExecDesc: "अनुमानित जोखिम स्तर देखने के लिए 'जोखिम स्कोर निकालें' पर क्लिक करें।",

      // Structural Damage Inspector
      aiDamageHeading: "संरचनात्मक क्षति निरीक्षण",
      aiDamageSub: "क्षतिग्रस्त दीवारों या नींव की तस्वीरें अपलोड करें।",
      uploadBoxTitle: "फोटो चुनने के लिए क्लिक करें",
      uploadBoxSub: "JPG, PNG, WEBP फ़ाइलों का समर्थन",
      testSampleBtn: "नमूना तस्वीर के साथ जांचें",

      // Disaster Preparedness
      safetyHeading: "आपदा तैयारी और सुरक्षा निर्देश",
      beforeTitle: "पहले (तैयारी)",
      duringTitle: "दौरान (झुकें, ढकें, पकड़ें)",
      afterTitle: "बाद में (सुरक्षित निकासी)",
      beforeItem1: "भारी फर्नीचर और उपकरणों को दीवारों से मजबूती से बांधें।",
      beforeItem2: "परिवार के साथ आपातकालीन संचार योजना तैयार रखें।",
      beforeItem3: "72 घंटे की आपातकालीन किट तैयार रखें।",
      duringItem1: "तुरंत अपने घुटनों के बल झुकें (DROP)।",
      duringItem2: "मजबूत मेज के नीचे सिर को ढकें (COVER)।",
      duringItem3: "कंपन रुकने तक कसकर पकड़ें (HOLD ON)।",
      afterItem1: "गैस रिसाव और बिजली के तारों की सावधानीपूर्वक जांच करें।",
      afterItem2: "सुरक्षित खुले राहत शिविरों में जाएं।",
      kitTitle: "72 घंटे की आपातकालीन किट चेकलिस्ट",

      // Incident Reports
      reportHeading: "आपदा घटना की रिपोर्ट करें",
      incTypeLabel: "घटना का प्रकार",
      incSeverityLabel: "आपातकालीन स्तर",
      incDescLabel: "स्थान और विवरण",
      incDescPlaceholder: "पता और घायलों की संख्या प्रदान करें...",
      broadcastReportBtn: "रिपोर्ट जमा करें",
      liveFeedTitle: "लाइव सामुदायिक फ़ीड",

      // Volunteer Network
      volunteerHeading: "स्वयंसेवक बचाव नेटवर्क",
      volunteerSub: "आपातकालीन अभियानों को स्वीकार करें और चिकित्सा सहायता प्रदान करें।",
      regVolunteerBtn: "स्वयंसेवक के रूप में पंजीकरण करें",
      nearbyMissionsTitle: "निकटतम आपातकालीन अभियान",

      // Command Center
      sensorsCommandHeading: "सेंसर और कमांड हब",
      sensorsCommandSub: "वास्तविक समय सेंसर, आपातकालीन नियंत्रण और सार्वजनिक सुरक्षा सलाह।",
      simSensorBannerTitle: "डेमो मोड:",
      simSensorBannerText: "इस पेज पर सेंसर के आंकड़े केवल डेमो के लिए बनाए गए हैं — अभी कोई असली रडार या कैमरा हार्डवेयर जुड़ा नहीं है। ऐप की बाकी सभी चीज़ें (भूकंप डेटा, जोखिम स्कोर, और फोटो क्षति जांच) असली हैं।",
      easyViewBtnCmd: "आसान दृश्य (सभी के लिए)",
      advTelemetryBtnCmd: "उन्नत टेलीमेट्री",
      quickActionsTitle: "त्वरित आपातकालीन कार्रवाइयां (1-क्लिक नियंत्रण)",
      dispatchRescueBtn: "पीड़ितों के पास बचाव दल भेजें",
      soundSirenBtn: "सेंसर सायरन बजाएं",
      testShakingBtn: "भू-कंपन चेतावनी का परीक्षण करें",
      broadcastAlertBtn: "आपातकालीन चेतावनी प्रसारित करें",
      cardSeismicTitle: "भू-कंपन सेंसर",
      cardVictimsTitle: "मलबे के नीचे उत्तरजीवी रडार",
      cardThermalTitle: "इंफ्रापे़ड हीट कैमरा",
      cardAnimalTitle: "पशु पूर्व चेतावनी",
      publicAdvisoriesTitle: "अनुकूली सार्वजनिक सुरक्षा सलाह",
      broadcastAdvisoryBtn: "स्थिति के अनुसार सलाह प्रसारित करें",
      autoGenUpdateBtn: "सुरक्षा अपडेट स्वचालित रूप से उत्पन्न करें",

      // SOS Overlay Modal
      sosAlertTitle: "SOS आपातकालीन अलर्ट",
      sosAlertSub: "आपका जीपीएस स्थान बचाव दल को भेजा जा रहा है और सायरन बज रहा है",
      sosDispatchBtn: "अभी 112 पर कॉल करें",
      sendSmsSosBtn: "SMS से SOS भेजें",
      muteAlarmBtn: "सायरन बंद करें",
      abortEmergencyBtn: "रद्द करें",

      // Profile & QR ID
      userProfileHeader: "उपयोगकर्ता 0 (सामान्य नागरिक)",
      medicalIdTitle: "आपातकालीन चिकित्सा पहचान",
      scanQrNote: "प्रथम प्रतिक्रियाकर्ताओं द्वारा स्कैन करने योग्य चिकित्सा इतिहास",

      // Assistant Chatbot
      chatHeaderTitle: "सुरक्षा सहायक",
      chatInputPlaceholder: "अपना प्रश्न टाइप करें..."
    }
  },

  setLanguage(langCode) {
    if (this.translations[langCode]) {
      this.currentLang = langCode;
      document.documentElement.setAttribute('lang', langCode);
      console.log(`[QuakeGuard i18n] Language updated to: ${langCode.toUpperCase()}`);
      
      this.applyTranslations();

      if (window.aiVoiceAssistant) {
        window.aiVoiceAssistant.updateLang(langCode);
      }

      this.triggerModuleReRenders();
    }
  },

  applyTranslations() {
    const langDict = this.translations[this.currentLang];
    if (!langDict) return;

    // 1. Text elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (langDict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = langDict[key];
        } else {
          el.innerText = langDict[key];
        }
      }
    });

    // 2. Elements with data-i18n-placeholder
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (langDict[key]) {
        el.placeholder = langDict[key];
      }
    });

    // 3. Elements with data-i18n-title
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (langDict[key]) {
        el.title = langDict[key];
      }
    });
  },

  triggerModuleReRenders() {
    // Re-render dynamic components with newly active language
    if (window.communityReports && typeof window.communityReports.renderFeed === 'function') {
      window.communityReports.renderFeed();
    }
    if (window.mutualAid && typeof window.mutualAid.renderBoard === 'function') {
      window.mutualAid.renderBoard();
    }
    if (window.familyCircle && typeof window.familyCircle.renderMembers === 'function') {
      window.familyCircle.renderMembers();
    }
    if (window.disasterPreparedness && typeof window.disasterPreparedness.renderChecklist === 'function') {
      window.disasterPreparedness.renderChecklist();
    }
    if (window.volunteerModule && typeof window.volunteerModule.renderMissions === 'function') {
      window.volunteerModule.renderMissions();
    }
    if (window.databaseExplorer && typeof window.databaseExplorer.renderCategory === 'function') {
      window.databaseExplorer.renderCategory(window.databaseExplorer.currentCategory);
    }
    if (window.rescueAdmin && typeof window.rescueAdmin.renderAdvisory === 'function') {
      window.rescueAdmin.renderAdvisory();
    }
    if (window.a11yAssistiveEngine && typeof window.a11yAssistiveEngine.updateUI === 'function') {
      window.a11yAssistiveEngine.updateUI();
    }
  },

  getText(key) {
    return (this.translations[this.currentLang] && this.translations[this.currentLang][key]) 
      || this.translations['en'][key] 
      || key;
  }
};

// Expose module globally so `window.multiLang` checks elsewhere (app.js) find it —
// top-level `const`/`let` do NOT attach to `window` the way `var` does.
window.multiLang = multiLang;
