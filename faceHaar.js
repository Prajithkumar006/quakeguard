/* ==========================================================================
   QuakeGuard - offline face detector (Viola-Jones / Haar cascade, pure JS)

   Why: the browser FaceDetector API is missing in most browsers, and a
   skin-colour rule cannot find people with darker skin, covered skin or
   people in dim light. This detector looks at brightness patterns only
   (eyes darker than cheeks, etc.), so skin colour does not matter, and it
   needs no internet: the cascade is in js/faceCascade.js.

   Usage: QGFaceHaar.detect(grayUint8, W, H) -> [{x,y,w,h}] in pixels.
   ========================================================================== */
const QGFaceHaar = {
  /* RGBA -> grayscale (Uint8) */
  toGray(rgba, W, H) {
    const g = new Uint8Array(W * H);
    for (let p = 0, i = 0; p < g.length; p++, i += 4)
      g[p] = (rgba[i] * 77 + rgba[i + 1] * 150 + rgba[i + 2] * 29) >> 8;
    return g;
  },

  /* mild automatic brightening for dark frames (keeps contrast patterns) */
  _normalise(gray) {
    let s = 0;
    for (let i = 0; i < gray.length; i++) s += gray[i];
    const mean = s / gray.length;
    if (mean >= 90) return gray;
    const gain = Math.min(3, 110 / Math.max(mean, 8));
    const out = new Uint8Array(gray.length);
    for (let i = 0; i < gray.length; i++) out[i] = Math.min(255, gray[i] * gain);
    return out;
  },

  /* bilinear resize of a Uint8 grayscale image */
  _resize(src, W, H, nw, nh) {
    const out = new Float32Array(nw * nh), fx = W / nw, fy = H / nh;
    for (let y = 0; y < nh; y++) {
      const sy = Math.min(H - 1.001, (y + 0.5) * fy - 0.5), y0 = Math.max(0, sy | 0), wy = Math.max(0, sy - y0);
      for (let x = 0; x < nw; x++) {
        const sx = Math.min(W - 1.001, (x + 0.5) * fx - 0.5), x0 = Math.max(0, sx | 0), wx = Math.max(0, sx - x0);
        const i = y0 * W + x0;
        out[y * nw + x] = (src[i] * (1 - wx) + src[i + 1] * wx) * (1 - wy) + (src[i + W] * (1 - wx) + src[i + W + 1] * wx) * wy;
      }
    }
    return out;
  },

  detect(gray, W, H, opts) {
    const C = window.QG_FACE_CASCADE;
    if (!C) return [];
    opts = opts || {};
    const minSize = Math.max(20, opts.minSize || 24);
    const maxSize = Math.min(W, H, opts.maxSize || 1e9);
    const scaleStep = opts.scaleStep || 1.15;
    const minNeighbors = opts.minNeighbors == null ? 3 : opts.minNeighbors;
    gray = this._normalise(gray);
    const stages = C.stages, feats = C.feats, nStages = stages.length, WIN = C.w;
    const INNER = WIN - 2, INNER_AREA = INNER * INNER;
    const hits = [];

    // image pyramid: shrink the picture, keep the 20x20 window fixed (exact feature geometry)
    for (let f = minSize / WIN; f * WIN <= maxSize; f *= scaleStep) {
      const nw = Math.floor(W / f), nh = Math.floor(H / f);
      if (nw < WIN + 1 || nh < WIN + 1) break;
      const img = f === 1 ? gray : this._resize(gray, W, H, nw, nh);
      const IW = nw + 1;
      const sum = new Float64Array(IW * (nh + 1)), sq = new Float64Array(IW * (nh + 1));
      for (let y = 1; y <= nh; y++) {
        let rs = 0, rq = 0;
        for (let x = 1; x <= nw; x++) {
          const v = img[(y - 1) * nw + (x - 1)];
          rs += v; rq += v * v;
          sum[y * IW + x] = sum[(y - 1) * IW + x] + rs;
          sq[y * IW + x] = sq[(y - 1) * IW + x] + rq;
        }
      }
      for (let y = 0; y + WIN <= nh; y++) {
        for (let x = 0; x + WIN <= nw; x++) {
          const a = (y + 1) * IW + x + 1, b = a + INNER, c = a + INNER * IW, d = c + INNER;
          const wsum = sum[d] - sum[b] - sum[c] + sum[a];
          const wsq = sq[d] - sq[b] - sq[c] + sq[a];
          const mean = wsum / INNER_AREA;
          const std = Math.sqrt(Math.max(0, wsq / INNER_AREA - mean * mean));
          if (std < 6) continue;                     // flat patch (wall, black bar)
          const norm = std * INNER_AREA;
          let ok = true;
          for (let st = 0; st < nStages && ok; st++) {
            const trees = stages[st][1];
            let acc = 0;
            for (let t = 0; t < trees.length; t++) {
              const nodes = trees[t][0], leaves = trees[t][1];
              let idx = 0, nd;
              do {
                nd = nodes[idx];
                const rects = feats[nd[2]];
                let v = 0;
                for (let k = 0; k < rects.length; k++) {
                  const r = rects[k];
                  const p = (y + r[1]) * IW + x + r[0];
                  const q = p + r[2], u = p + r[3] * IW;
                  v += (sum[u + r[2]] - sum[q] - sum[u] + sum[p]) * r[4];
                }
                idx = (v < nd[3] * norm) ? nd[0] : nd[1];
              } while (idx > 0);
              acc += leaves[-idx];
            }
            if (acc < stages[st][0]) ok = false;
          }
          if (ok) hits.push({ x: x * f, y: y * f, w: WIN * f, h: WIN * f });
        }
      }
    }
    return this._group(hits, minNeighbors);
  },

  /* merge overlapping hits; drop clusters with too few neighbours */
  _group(hits, minN) {
    const n = hits.length, label = new Int32Array(n).fill(-1);
    let nc = 0;
    const near = (a, b) => {
      const d = 0.2 * (Math.min(a.w, b.w) + 0) ;
      return Math.abs(a.x - b.x) <= d && Math.abs(a.y - b.y) <= d && Math.abs(a.w - b.w) <= 0.4 * Math.min(a.w, b.w) + d;
    };
    for (let i = 0; i < n; i++) {
      if (label[i] >= 0) continue;
      label[i] = nc; const q = [i];
      while (q.length) {
        const k = q.pop();
        for (let j = 0; j < n; j++) if (label[j] < 0 && near(hits[k], hits[j])) { label[j] = nc; q.push(j); }
      }
      nc++;
    }
    const acc = [];
    for (let c = 0; c < nc; c++) acc.push({ x: 0, y: 0, w: 0, n: 0 });
    for (let i = 0; i < n; i++) { const a = acc[label[i]]; a.x += hits[i].x; a.y += hits[i].y; a.w += hits[i].w; a.n++; }
    const out = acc.filter(a => a.n >= minN).map(a => ({ x: a.x / a.n, y: a.y / a.n, w: a.w / a.n, h: a.w / a.n, n: a.n }));
    // keep strongest; drop boxes mostly inside a stronger one
    out.sort((p, q) => q.n - p.n);
    const keep = [];
    out.forEach(o => {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      if (!keep.some(k => cx > k.x && cx < k.x + k.w && cy > k.y && cy < k.y + k.h)) keep.push(o);
    });
    return keep;
  }
};
window.QGFaceHaar = QGFaceHaar;
