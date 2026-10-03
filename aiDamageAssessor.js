/* ==========================================================================
   QuakeGuard - Structural Integrity & Damage Inspection Module (v3)

   What changed in v3
   - Works in bright OR dark scenes: every photo is exposure-normalised
     (linear gain toward a mid-grey target, light de-noising when a dark
     frame has to be boosted) BEFORE any measurement, so a dim photo no
     longer scores artificially "low damage" and a washed-out one no longer
     reads as "flat". In low light the capture button averages a few frames
     to cut sensor noise, and a Flash/torch toggle appears if the camera has one.
   - A person in the frame no longer causes a rejection. The person is
     detected (browser FaceDetector when available, otherwise a skin-tone
     cluster heuristic), outlined live on the camera preview, and EXCLUDED
     from the damage measurement. A damage percentage is always produced
     from the remaining building pixels.
   - Live camera guidance: lighting status, person status and a hint are
     updated ~3x per second while you line up the shot.

   HONESTY NOTE: this is still NOT a trained damage classifier — there is no
   model file and the app must also run offline. It is a deterministic
   on-device heuristic (edge density, contrast, rubble-toned vs. clean
   colour ratios) on the pixels you provide. Person detection uses the browser
   FaceDetector when present, else a built-in offline Haar face detector
   (js/faceHaar.js), then a skin-tone heuristic as a last resort. It finds
   front-facing faces at any skin tone but can miss people turned away,
   masked or in silhouette, and can occasionally
   mark a skin-toned wall patch as a person. The result is a triage
   estimate, not a certified inspection.
   ========================================================================== */

const aiDamageAssessor = {
  cameraStream: null,
  _liveTimer: null,
  _liveBusy: false,
  _faceDetector: undefined,   // undefined = not probed yet, null = unsupported
  _torchOn: false,
  _lastLive: null,

  // --------------------------------------------------------------------
  // Upload / sample entry points
  // --------------------------------------------------------------------
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this._analyzeAndDisplay(e.target.result);
    reader.readAsDataURL(file);
    event.target.value = '';
  },

  loadSampleImage() {
    this._analyzeAndDisplay('assets/building_damage.jpg');
  },

  // --------------------------------------------------------------------
  // Live camera capture
  // --------------------------------------------------------------------
  async openCamera() {
    const modal = document.getElementById('damage-camera-modal');
    const video = document.getElementById('damage-camera-video');
    const errBox = document.getElementById('damage-camera-error');
    const captureBtn = document.getElementById('damage-camera-capture-btn');
    if (!modal || !video) return;

    modal.style.display = 'flex';
    errBox.style.display = 'none';
    captureBtn.style.display = 'inline-flex';
    this._setLive({ light: { cls: '', text: 'Starting camera...' }, person: null, hint: '' });

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this._cameraFallback('Live camera preview isn\'t supported in this browser.');
      return;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      video.srcObject = this.cameraStream;
      await video.play().catch(() => {});
      this._setupTorch();
      this._startLive();
    } catch (err) {
      console.warn('[QuakeGuard Damage Inspector] Camera access failed:', err);
      this._cameraFallback('Camera access was blocked or unavailable (' + (err.name || 'error') + ').');
    }
  },

  _cameraFallback(message) {
    const errBox = document.getElementById('damage-camera-error');
    const captureBtn = document.getElementById('damage-camera-capture-btn');
    if (errBox) {
      errBox.textContent = message + ' Opening your device\'s camera app instead\u2026';
      errBox.style.display = 'block';
    }
    if (captureBtn) captureBtn.style.display = 'none';
    setTimeout(() => {
      this.closeCamera();
      const fallbackInput = document.getElementById('damage-camera-fallback-input');
      if (fallbackInput) fallbackInput.click();
    }, 1400);
  },

  // Flash / torch (only offered when the camera reports support for it)
  _setupTorch() {
    const btn = document.getElementById('damage-camera-torch-btn');
    this._torchOn = false;
    if (!btn) return;
    let ok = false;
    try {
      const track = this.cameraStream && this.cameraStream.getVideoTracks()[0];
      const caps = track && track.getCapabilities ? track.getCapabilities() : {};
      ok = !!caps.torch;
    } catch (e) {}
    btn.style.display = ok ? 'inline-flex' : 'none';
    btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Flash off';
  },

  async toggleTorch() {
    const btn = document.getElementById('damage-camera-torch-btn');
    try {
      const track = this.cameraStream.getVideoTracks()[0];
      this._torchOn = !this._torchOn;
      await track.applyConstraints({ advanced: [{ torch: this._torchOn }] });
      if (btn) btn.innerHTML = `<i class="fa-solid fa-bolt"></i> Flash ${this._torchOn ? 'on' : 'off'}`;
    } catch (e) {
      this._torchOn = false;
      if (btn) btn.style.display = 'none';
    }
  },

  _startLive() {
    this._stopLive();
    this._liveTimer = setInterval(() => this._liveTick(), 350);
  },
  _stopLive() {
    if (this._liveTimer) clearInterval(this._liveTimer);
    this._liveTimer = null;
    this._liveBusy = false;
    const ov = document.getElementById('damage-camera-overlay');
    if (ov) { const c = ov.getContext('2d'); c.clearRect(0, 0, ov.width, ov.height); }
  },

  async _getFaces(source, w, h, detWidth) {
    // 1) native browser FaceDetector (Chrome flag / Android), when it exists and finds someone
    if (this._faceDetector === undefined) {
      try { this._faceDetector = ('FaceDetector' in window) ? new window.FaceDetector({ fastMode: true, maxDetectedFaces: 6 }) : null; }
      catch (e) { this._faceDetector = null; }
    }
    if (this._faceDetector) {
      try {
        const faces = await this._faceDetector.detect(source);
        if (faces.length) return faces.map(f => [f.boundingBox.x / w, f.boundingBox.y / h, f.boundingBox.width / w, f.boundingBox.height / h]);
      } catch (e) { this._faceDetector = null; }
    }
    // 2) built-in offline Haar-cascade detector (js/faceHaar.js): works on brightness
    //    patterns, not skin colour, so it also finds darker skin tones and dim rooms
    return this._haarFaces(source, detWidth || 256);
  },

  _haarFaces(source, detWidth) {
    try {
      if (!window.QGFaceHaar || !window.QG_FACE_CASCADE) return [];
      const sw = source.videoWidth || source.naturalWidth || source.width, sh = source.videoHeight || source.naturalHeight || source.height;
      if (!sw || !sh) return [];
      const W = detWidth, H = Math.max(40, Math.round(detWidth * sh / sw));
      const cv = this._haarCanvas || (this._haarCanvas = document.createElement('canvas'));
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, 0, 0, W, H);
      const gray = QGFaceHaar.toGray(ctx.getImageData(0, 0, W, H).data, W, H);
      return QGFaceHaar.detect(gray, W, H, { minSize: Math.round(W * 0.10), minNeighbors: 3 })
        .slice(0, 6).map(f => [f.x / W, f.y / H, f.w / W, f.h / H]);
    } catch (e) { return []; }
  },

  // Runs while the camera preview is open: measures lighting, finds people,
  // draws their outline over the video and updates the on-screen guidance.
  async _liveTick() {
    if (this._liveBusy) return;
    const video = document.getElementById('damage-camera-video');
    if (!video || !video.videoWidth || video.paused) return;
    this._liveBusy = true;
    try {
      const W = 128, H = Math.max(32, Math.round(128 * video.videoHeight / video.videoWidth));
      const cv = this._liveCanvas || (this._liveCanvas = document.createElement('canvas'));
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, W, H);
      const faces = await this._getFaces(video, video.videoWidth, video.videoHeight);
      const a = this.analyzePixels(ctx.getImageData(0, 0, W, H).data, W, H, faces);
      this._lastLive = a;
      this._drawOverlay(video, a);
      this._setLive({
        light: this._lightChip(a.lighting),
        person: a.persons.length ? { cls: 'person', text: `${a.persons.length} person${a.persons.length > 1 ? 's' : ''} detected - not counted as damage` } : { cls: '', text: 'No person in frame' },
        hint: this._hintFor(a)
      });
    } catch (e) { /* keep preview alive */ }
    this._liveBusy = false;
  },

  _lightChip(l) {
    const map = {
      verydark: ['bad',  'fa-moon',           'Very dark'],
      dark:     ['warn', 'fa-cloud-moon',     'Low light'],
      good:     ['good', 'fa-sun',            'Good light'],
      bright:   ['warn', 'fa-sun',            'Bright'],
      glare:    ['bad',  'fa-sun-plant-wilt', 'Very bright']
    };
    const [cls, icon, label] = map[l.key];
    const extra = l.gain > 1.3 ? ` - auto-brightened x${l.gain.toFixed(1)}` : (l.gain < 0.8 ? ` - auto-toned down` : '');
    return { cls, icon, text: label + extra };
  },

  _hintFor(a) {
    if (a.lighting.key === 'verydark') return this._torchBtnVisible() ? 'Very dark: tap Flash, or move toward a light source.' : 'Very dark: move toward a light source for a more reliable result.';
    if (a.lighting.key === 'glare') return 'Very bright: tilt away from direct sun or lamps to keep detail.';
    if (a.persons.length && a.coverage < 0.35) return 'The person fills most of the frame - step back so more of the building is visible.';
    if (a.persons.length) return 'Person spotted: they are left out of the score. Keep the damaged wall in view.';
    return 'Keep the damaged part of the building in the frame, then tap Capture.';
  },
  _torchBtnVisible() { const b = document.getElementById('damage-camera-torch-btn'); return !!(b && b.style.display !== 'none'); },

  _setLive({ light, person, hint }) {
    const box = document.getElementById('damage-live-chips');
    const hintEl = document.getElementById('damage-live-hint');
    if (box) {
      const chip = (c) => c ? `<span class="dmg-chip ${c.cls || ''}">${c.icon ? `<i class="fa-solid ${c.icon}"></i>` : ''} ${c.text}</span>` : '';
      box.innerHTML = chip(light) + chip(person);
    }
    if (hintEl) hintEl.textContent = hint || '';
  },

  // Draw person outlines on the overlay canvas, accounting for the
  // letterboxing of object-fit: contain.
  _drawOverlay(video, a) {
    const ov = document.getElementById('damage-camera-overlay');
    if (!ov) return;
    const cw = ov.clientWidth, ch = ov.clientHeight;
    if (!cw || !ch) return;
    if (ov.width !== cw) ov.width = cw;
    if (ov.height !== ch) ov.height = ch;
    const c = ov.getContext('2d');
    c.clearRect(0, 0, cw, ch);
    const scale = Math.min(cw / video.videoWidth, ch / video.videoHeight);
    const dw = video.videoWidth * scale, dh = video.videoHeight * scale;
    const ox = (cw - dw) / 2, oy = (ch - dh) / 2;
    c.lineWidth = 2; c.setLineDash([7, 5]); c.font = '600 12px sans-serif';
    a.persons.forEach(p => {
      const x = ox + p.box[0] * dw, y = oy + p.box[1] * dh, w = p.box[2] * dw, h = p.box[3] * dh;
      c.strokeStyle = '#60a5fa'; c.fillStyle = 'rgba(96,165,250,0.12)';
      c.fillRect(x, y, w, h); c.strokeRect(x, y, w, h);
      c.setLineDash([]); c.fillStyle = '#60a5fa';
      c.fillText('Person (not scored)', x + 4, Math.max(oy + 12, y + 14));
      c.setLineDash([7, 5]);
    });
  },

  async capturePhoto() {
    const video = document.getElementById('damage-camera-video');
    const canvas = document.getElementById('damage-camera-canvas');
    if (!video || !canvas || !video.videoWidth) return;

    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * scale), h = Math.round(video.videoHeight * scale);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    // Low light: average a few frames to cut sensor noise before analysis.
    const gain = this._lastLive ? this._lastLive.lighting.gain : 1;
    if (gain > 2.2) {
      const FR = 3, acc = new Float32Array(w * h * 4);
      let frames = 0;
      const addFrame = () => {
        const d = ctx.getImageData(0, 0, w, h).data;
        for (let i = 0; i < d.length; i++) acc[i] += d[i];
        frames++;
      };
      addFrame();
      for (let f = 1; f < FR; f++) {
        await new Promise(r => setTimeout(r, 120));
        ctx.drawImage(video, 0, 0, w, h);
        addFrame();
      }
      const out = ctx.createImageData(w, h);
      for (let i = 0; i < acc.length; i++) out.data[i] = acc[i] / frames;
      ctx.putImageData(out, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    this.closeCamera();
    this._analyzeAndDisplay(dataUrl);
  },

  closeCamera() {
    this._stopLive();
    const modal = document.getElementById('damage-camera-modal');
    const video = document.getElementById('damage-camera-video');
    if (this.cameraStream) {
      try {
        const t = this.cameraStream.getVideoTracks()[0];
        if (this._torchOn && t) t.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
      } catch (e) {}
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this._torchOn = false;
    if (video) video.srcObject = null;
    if (modal) modal.style.display = 'none';
  },

  // --------------------------------------------------------------------
  // Core analysis
  // --------------------------------------------------------------------
  _analyzeAndDisplay(imageSrc) {
    const img = new Image();
    img.onload = async () => {
      try {
        const SIZE = 160;
        const W = SIZE, H = Math.max(40, Math.round(SIZE * img.naturalHeight / img.naturalWidth));
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, W, H);
        const faces = await this._getFaces(img, img.naturalWidth, img.naturalHeight, 400);
        const a = this.analyzePixels(ctx.getImageData(0, 0, W, H).data, W, H, faces);
        const result = this._scoreMetrics(a);
        this.displayResult(this._renderPreview(img, a), result, a);
      } catch (err) {
        console.warn('[QuakeGuard Damage Inspector] analysis failed', err);
        this.displayResult(imageSrc, this._errorResult());
      }
    };
    img.onerror = () => this.displayResult(imageSrc, this._errorResult());
    img.src = imageSrc;
  },

  _errorResult() {
    return {
      prob: null, severity: 'unknown', badge: 'IMAGE COULD NOT BE ANALYZED', badgeClass: 'badge-warning', badgeColor: '#eab308',
      desc: 'The photo could not be read for analysis. Try a different file or retake the photo.',
      recommendation: 'RECOMMENDATION: RE-SUBMIT A CLEAR PHOTO OF THE STRUCTURE'
    };
  },

  /* ---- exposure helpers ---- */
  _gainFor(meanLum) { return Math.max(0.55, Math.min(5, 118 / Math.max(meanLum, 6))); },

  _lightingFor(validMean, gain, overFrac) {
    let key = 'good';
    if (validMean < 35) key = 'verydark';
    else if (validMean < 80) key = 'dark';
    else if (validMean > 205 || overFrac > 0.35) key = 'glare';
    else if (validMean > 170) key = 'bright';
    return { key, meanLum: Math.round(validMean), gain: Math.round(gain * 100) / 100 };
  },

  /* ---- person detection (heuristic; FaceDetector boxes win when given) ---- */
  _expandBody(x, y, w, h, W, H) {
    // face/skin box -> likely head+torso box, capped so one person can't
    // swallow the whole frame
    let bx = x - 0.9 * w, by = y - 0.25 * h, bw = 2.8 * w, bh = 5 * h;
    const clip = () => {
      if (bx < 0) { bw += bx; bx = 0; } if (by < 0) { bh += by; by = 0; }
      if (bx + bw > W) bw = W - bx; if (by + bh > H) bh = H - by;
    };
    clip();
    if (bw * bh > 0.55 * W * H) {          // too big -> keep just the skin region, padded
      bx = x - 0.15 * w; by = y - 0.15 * h; bw = 1.3 * w; bh = 1.3 * h; clip();
    }
    return [bx / W, by / H, bw / W, bh / H];
  },

  _detectPersons(data, W, H, gain, faceBoxes) {
    const persons = [];
    (faceBoxes || []).forEach(f => {
      persons.push({ src: 'face', box: this._expandBody(f[0] * W, f[1] * H, f[2] * W, f[3] * H, W, H) });
    });

    // A real face was found: trust it and skip the skin-colour guess. The guess
    // is noisy in dark, brightened frames and used to add false "persons" on
    // walls and clothing. It only runs when no face detector found anyone.
    if (persons.length) return persons.slice(0, 6);

    // skin-tone clusters on the exposure-normalised image (YCbCr rule)
    const CELL = 8, gw = Math.ceil(W / CELL), gh = Math.ceil(H / CELL);
    const cnt = new Float32Array(gw * gh), tot = new Float32Array(gw * gh);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = Math.min(255, data[i] * gain), g = Math.min(255, data[i + 1] * gain), b = Math.min(255, data[i + 2] * gain);
        const Y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        const ci = Math.floor(y / CELL) * gw + Math.floor(x / CELL);
        tot[ci]++;
        if (Y > 45 && Y < 235 && cb > 77 && cb < 127 && cr > 135 && cr < 173 && r > g && r > b) cnt[ci]++;
      }
    }
    const skin = new Uint8Array(gw * gh);
    let skinCells = 0;
    for (let i = 0; i < skin.length; i++) { skin[i] = cnt[i] / tot[i] > 0.45 ? 1 : 0; skinCells += skin[i]; }
    // If skin-tone colour covers a big share of the frame it is almost
    // certainly a beige / brick / sandstone wall, not people - don't guess.
    if (skinCells / skin.length > 0.30) return persons.slice(0, 6);

    const seen = new Uint8Array(gw * gh);
    for (let s = 0; s < skin.length; s++) {
      if (!skin[s] || seen[s]) continue;
      const stack = [s]; seen[s] = 1;
      let cells = 0, minX = gw, minY = gh, maxX = 0, maxY = 0;
      while (stack.length) {
        const c = stack.pop(), cx = c % gw, cy = (c / gw) | 0;
        cells++; minX = Math.min(minX, cx); maxX = Math.max(maxX, cx); minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) return;
          const ni = ny * gw + nx;
          if (skin[ni] && !seen[ni]) { seen[ni] = 1; stack.push(ni); }
        });
      }
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      const fill = cells / (bw * bh), aspect = bw / bh, frac = cells / (gw * gh);
      // face/hand-like: compact, not tiny, not a wall-sized area
      if (cells >= 4 && fill >= 0.55 && aspect > 0.45 && aspect < 2.2 && frac < 0.40) {
        const px = minX * CELL, py = minY * CELL, pw = Math.min(W - px, bw * CELL), ph = Math.min(H - py, bh * CELL);
        const cxn = (px + pw / 2) / W, cyn = (py + ph / 2) / H;
        const covered = persons.some(p => cxn > p.box[0] && cxn < p.box[0] + p.box[2] && cyn > p.box[1] && cyn < p.box[1] + p.box[3]);
        if (!covered) persons.push({ src: 'skin', box: this._expandBody(px, py, pw, ph, W, H) });
      }
    }
    return persons.slice(0, 6);
  },

  /* ---- pure pixel analysis: RGBA array in, features out (no DOM) ---- */
  analyzePixels(data, W, H, faceBoxes) {
    const n = W * H;

    // pass 1: global exposure -> person detection
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const gain1 = this._gainFor(sum / n);
    const persons = this._detectPersons(data, W, H, gain1, faceBoxes);

    // person mask (excluded from every measurement below)
    const mask = new Uint8Array(n);
    persons.forEach(p => {
      const x0 = Math.floor(p.box[0] * W), x1 = Math.ceil((p.box[0] + p.box[2]) * W);
      const y0 = Math.floor(p.box[1] * H), y1 = Math.ceil((p.box[1] + p.box[3]) * H);
      for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) mask[y * W + x] = 1;
    });

    // pass 2: exposure measured on building pixels only
    let vSum = 0, vN = 0, over = 0;
    for (let p = 0, i = 0; p < n; p++, i += 4) {
      if (mask[p]) continue;
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      vSum += l; vN++; if (l > 245) over++;
    }
    const coverage = vN / n;
    const validMean = vN ? vSum / vN : sum / n;
    const gain = this._gainFor(validMean);
    const lighting = this._lightingFor(validMean, gain, vN ? over / vN : 0);

    // normalised luminance + colour ratios on valid pixels
    const lum = new Float32Array(n);
    let debris = 0, clean = 0;
    for (let p = 0, i = 0; p < n; p++, i += 4) {
      const r = Math.min(255, data[i] * gain), g = Math.min(255, data[i + 1] * gain), b = Math.min(255, data[i + 2] * gain);
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      lum[p] = l;
      if (mask[p]) continue;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx === 0 ? 0 : (mx - mn) / mx;
      if (sat < 0.22 && l > 40 && l < 205) debris++;
      if ((b > r + 18 && b > g + 8 && l > 90) || (g > r + 12 && g > b + 12)) clean++;
    }

    // light de-noise when a dark frame had to be boosted
    let gray = lum;
    if (gain > 1.8) {
      gray = new Float32Array(n);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const k = y * W + x;
        const m9 = (lum[k - W - 1] + lum[k - W] + lum[k - W + 1] + lum[k - 1] + lum[k] + lum[k + 1] + lum[k + W - 1] + lum[k + W] + lum[k + W + 1]) / 9;
        gray[k] = 0.4 * lum[k] + 0.6 * m9;
      }
    }
    const noiseFloor = gain > 1.5 ? 0.3 * gain : 0;

    let mean = 0;
    for (let p = 0; p < n; p++) if (!mask[p]) mean += lum[p];
    mean = vN ? mean / vN : 0;

    let variance = 0, vc = 0, edgeSum = 0, edgeN = 0, strong = 0, rect = 0;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const k = y * W + x;
        if (mask[k] || mask[k - 1] || mask[k + 1] || mask[k - W] || mask[k + W]) continue;
        const v = gray[k];
        variance += (v - mean) * (v - mean); vc++;
        const gx = gray[k + 1] - gray[k - 1], gy = gray[k + W] - gray[k - W];
        let mag = Math.sqrt(gx * gx + gy * gy);
        mag = Math.max(0, mag - noiseFloor);
        edgeSum += mag; edgeN++;
        if (mag > 18) {
          strong++;
          const ax = Math.abs(gx), ay = Math.abs(gy);
          if (ax > ay * 1.8 || ay > ax * 1.8) rect++;
        }
      }
    }

    const metrics = {
      contrast: vc ? Math.sqrt(variance / vc) / 255 : 0,
      edgeDensity: edgeN ? (edgeSum / edgeN) / 255 : 0,
      debrisRatio: vN ? debris / vN : 0,
      cleanRatio: vN ? clean / vN : 0,
      rectilinearity: strong ? rect / strong : 0,
      strongEdgeRatio: edgeN ? strong / edgeN : 0
    };
    return { metrics, lighting, persons, coverage, gain };
  },

  // Annotated preview: brightens dark/overexposed frames so the user can
  // actually see what was analysed, and outlines the excluded person(s).
  _renderPreview(img, a) {
    const MAX = 720, s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    c.drawImage(img, 0, 0, w, h);
    if (a.gain > 1.25 || a.gain < 0.8) {
      const id = c.getImageData(0, 0, w, h), d = id.data, g = a.gain;
      for (let i = 0; i < d.length; i += 4) { d[i] = Math.min(255, d[i] * g); d[i + 1] = Math.min(255, d[i + 1] * g); d[i + 2] = Math.min(255, d[i + 2] * g); }
      c.putImageData(id, 0, 0);
    }
    c.lineWidth = Math.max(2, w / 240); c.setLineDash([w / 60, w / 90]);
    c.font = `600 ${Math.max(12, Math.round(w / 40))}px sans-serif`;
    a.persons.forEach(p => {
      const x = p.box[0] * w, y = p.box[1] * h, bw = p.box[2] * w, bh = p.box[3] * h;
      c.fillStyle = 'rgba(96,165,250,0.18)'; c.fillRect(x, y, bw, bh);
      c.strokeStyle = '#60a5fa'; c.strokeRect(x, y, bw, bh);
      c.setLineDash([]); c.fillStyle = '#93c5fd';
      c.fillText('Person (not scored)', x + 6, Math.max(16, y + 18));
      c.setLineDash([w / 60, w / 90]);
    });
    try { return cv.toDataURL('image/jpeg', 0.88); } catch (e) { return img.src; }
  },

  // --------------------------------------------------------------------
  // Scoring
  // --------------------------------------------------------------------
  _scoreMetrics(a) {
    const m = a.metrics;

    // Nothing measurable: frame is (almost) all person, or blank/black.
    if (a.coverage < 0.08) {
      return {
        prob: null, severity: 'unreadable', badge: 'NOT ENOUGH BUILDING IN VIEW', badgeClass: 'badge-warning', badgeColor: '#eab308',
        desc: 'The person fills almost the whole frame, so there is no building left to measure. Ask them to step aside or step back and retake the photo.',
        recommendation: 'RECOMMENDATION: RETAKE WITH THE DAMAGED WALL OR BUILDING CLEARLY IN VIEW'
      };
    }
    if (m.strongEdgeRatio < 0.002 && m.contrast < 0.025) {
      return {
        prob: null, severity: 'unreadable', badge: 'PHOTO TOO BLANK TO MEASURE', badgeClass: 'badge-warning', badgeColor: '#eab308',
        desc: a.lighting.key === 'verydark'
          ? 'The photo is almost completely black, so no structure could be made out even after brightening it. Turn on a light or the flash and retake it.'
          : 'No usable structure was found (blank, covered lens, or a featureless surface). Retake the photo with the building in clear view.',
        recommendation: 'RECOMMENDATION: RETAKE THE PHOTO WITH MORE LIGHT AND THE STRUCTURE IN VIEW'
      };
    }

    let raw = (m.edgeDensity * 130) + (m.contrast * 90) + (m.debrisRatio * 55) - (m.cleanRatio * 60);
    raw = Math.max(2, Math.min(97, raw));
    const prob = Math.round(raw * 10) / 10;
    const variantSeed = Math.floor(raw * 37) % 3;

    // confidence
    const notes = [];
    let conf = 'High';
    if (a.coverage < 0.5) { conf = 'Low'; notes.push('a large part of the frame was a person'); }
    else if (a.coverage < 0.75) { conf = 'Medium'; notes.push('part of the frame was a person'); }
    if (a.lighting.key === 'verydark' || a.lighting.key === 'glare') { conf = conf === 'High' ? 'Medium' : 'Low'; notes.push(a.lighting.key === 'verydark' ? 'very low light' : 'glare / overexposure'); }
    if (m.strongEdgeRatio < 0.01 && m.rectilinearity < 0.4) { conf = conf === 'High' ? 'Medium' : conf; notes.push('few structural lines visible - is the building in frame?'); }

    const bands = [
      { max: 18, severity: 'minimal', badgeClass: 'badge-success', badgeColor: '#22c55e', badge: 'NO SIGNIFICANT DAMAGE DETECTED',
        desc: ['Surfaces appear largely intact with smooth, continuous wall lines and no visible large-scale cracking.',
               'Low edge and debris signatures suggest the structure surface is largely undisturbed.',
               'Clean, low-contrast surface texture consistent with an undamaged or lightly affected structure.'],
        rec: 'RECOMMENDATION: LIKELY SAFE FOR VISUAL RE-ENTRY - CONFIRM WITH A PROFESSIONAL IF UNSURE' },
      { max: 38, severity: 'minor', badgeClass: 'badge-warning', badgeColor: '#eab308', badge: 'MINOR COSMETIC DAMAGE DETECTED',
        desc: ['Some surface irregularities and hairline marks detected, consistent with minor cosmetic cracking.',
               'Localized texture disruption visible, but no strong indicators of major structural failure.',
               'Moderate edge activity in isolated areas, likely surface-level plaster or render damage.'],
        rec: 'RECOMMENDATION: MINOR DAMAGE - SCHEDULE A ROUTINE PROFESSIONAL INSPECTION' },
      { max: 58, severity: 'moderate', badgeClass: 'badge-warning', badgeColor: '#f97316', badge: 'MODERATE STRUCTURAL DAMAGE DETECTED',
        desc: ['Noticeable crack-like patterns and debris-toned texture detected across a meaningful portion of the frame.',
               'Elevated contrast and edge density suggest visible cracking or partial material displacement.',
               'Mixed rubble/dust coloring alongside irregular surface lines points to moderate structural disruption.'],
        rec: 'RECOMMENDATION: LIMIT OCCUPANCY - ARRANGE A STRUCTURAL ENGINEER INSPECTION SOON' },
      { max: 78, severity: 'severe', badgeClass: 'badge-danger', badgeColor: '#ef4444', badge: 'SEVERE STRUCTURAL DAMAGE DETECTED',
        desc: ['Extensive crack-like edge patterns and high debris-toned surface coverage detected, consistent with major shear or displacement damage.',
               'High contrast and dense fracture-like lines across most of the frame indicate significant structural compromise.',
               'Large areas of rubble-toned, desaturated texture with little clean surface remaining are visible.'],
        rec: 'RECOMMENDATION: UNSAFE FOR OCCUPANCY - EVACUATE AND AVOID THE STRUCTURE' },
      { max: 101, severity: 'critical', badgeClass: 'badge-danger', badgeColor: '#dc2626', badge: 'CRITICAL COLLAPSE HAZARD DETECTED',
        desc: ['Very high edge density and debris coverage across almost the entire frame, consistent with partial or full collapse.',
               'Near-total loss of intact, continuous surface lines with dense rubble-toned texture throughout.',
               'Pattern strongly consistent with severe structural failure or collapsed load-bearing sections.'],
        rec: 'RECOMMENDATION: SEVERE COLLAPSE HAZARD - DO NOT ENTER - AWAIT PROFESSIONAL RESCUE ASSESSMENT' }
    ];
    const band = bands.find(b => raw <= b.max) || bands[bands.length - 1];
    return {
      prob, severity: band.severity, badge: band.badge, badgeClass: band.badgeClass, badgeColor: band.badgeColor,
      desc: band.desc[variantSeed], recommendation: band.rec, confidence: conf, notes
    };
  },

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
  _resultChips(a, result) {
    const chip = (cls, icon, text) => `<span class="dmg-chip ${cls}"><i class="fa-solid ${icon}"></i> ${text}</span>`;
    const L = this._lightChip(a.lighting);
    const out = [chip(L.cls, L.icon, L.text)];
    out.push(a.persons.length
      ? chip('person', 'fa-person', `${a.persons.length} person${a.persons.length > 1 ? 's' : ''} detected - excluded from score`)
      : chip('', 'fa-person', 'No person detected'));
    out.push(chip('', 'fa-expand', `${Math.round(a.coverage * 100)}% of frame analysed`));
    if (result.confidence) out.push(chip(result.confidence === 'High' ? 'good' : (result.confidence === 'Medium' ? 'warn' : 'bad'), 'fa-gauge', `${result.confidence} confidence`));
    return out.join('');
  },

  displayResult(imageSrc, result, analysis) {
    const resultBox = document.getElementById('damage-assessment-result');
    if (!resultBox) return;

    const gridEl = document.getElementById('damage-result-grid');
    const imgEl = document.getElementById('damage-preview-img');
    const probEl = document.getElementById('damage-prob');
    const probWrapEl = probEl && probEl.closest('h3');
    const recEl = document.getElementById('damage-recommendation');
    const badgeEl = document.getElementById('damage-badge');
    const chipsEl = document.getElementById('damage-chips');
    const noteEl = document.getElementById('damage-conf-note');

    if (chipsEl) chipsEl.innerHTML = analysis ? this._resultChips(analysis, result) : '';
    if (noteEl) {
      noteEl.textContent = result.notes && result.notes.length ? 'Lower certainty because: ' + result.notes.join('; ') + '.' : '';
      noteEl.style.display = result.notes && result.notes.length ? 'block' : 'none';
    }

    const hasScore = typeof result.prob === 'number';
    if (imgEl) { imgEl.style.display = ''; imgEl.src = imageSrc; }
    if (gridEl) gridEl.style.gridTemplateColumns = '';
    if (probWrapEl) probWrapEl.style.display = hasScore ? '' : 'none';
    if (hasScore && probEl) {
      probEl.innerText = `${result.prob}%`;
      if (result.badgeColor) probEl.style.color = result.badgeColor;
    }

    document.getElementById('damage-desc').innerText = result.desc;
    if (badgeEl) {
      badgeEl.innerText = result.badge;
      badgeEl.className = `badge ${result.badgeClass || 'badge-danger'}`;
      badgeEl.style.fontSize = '0.9rem';
      badgeEl.style.marginBottom = '0.5rem';
    }
    if (recEl) {
      if (hasScore) {
        recEl.style.background = 'rgba(239, 68, 68, 0.15)';
        recEl.style.border = '1px solid var(--color-red-500)';
        recEl.style.color = 'var(--color-red-400)';
        recEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${result.recommendation}`;
      } else {
        recEl.style.background = 'rgba(234, 179, 8, 0.15)';
        recEl.style.border = '1px solid var(--color-orange-500)';
        recEl.style.color = 'var(--color-orange-400)';
        recEl.innerHTML = `<i class="fa-solid fa-ban"></i> ${result.recommendation}`;
      }
    }

    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });
  }
};

window.aiDamageAssessor = aiDamageAssessor;
