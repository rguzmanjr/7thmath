/* Numlings: pixel-art renderer, the Numling composer, hand-built sprites, and shiny recolors */
'use strict';
/* =========================================================================
   PIXEL ART. Every Numling is a 64x64 sprite assembled from shaded parts (3/4 view, facing right).
   Ellipse parts are lit like 3D forms from the upper left with a 4-tone, hue-shifted ramp; each part
   gets its own outline; a final pass adds a dark outer outline. Sprites are drawn once at startup.
   ========================================================================= */
const PX = 64;
function pxHex(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function pxRgb(c) { return '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function pxMix(a, b, t) { const A = pxHex(a), B = pxHex(b); return pxRgb(A.map((v, i) => v + (B[i] - v) * t)); }
function pxRamp(base) { return [pxMix(base, '#0E0620', 0.74), pxMix(base, '#24124F', 0.5), pxMix(base, '#3A2A78', 0.27), base, pxMix(base, '#FFF7D6', 0.4)]; }
function pxGrid(spec) {
  const W = PX, H = PX, px = Array.from({ length: H }, () => Array(W).fill(null)), owner = Array.from({ length: H }, () => Array(W).fill(-1));
  const Lx = -0.55, Ly = -0.62, Lz = 0.56;
  spec.parts.forEach((p, pi) => {
    const R = pxRamp(p.color), cells = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x + 0.5, Y = y + 0.5; let inside = false, tone = 3;
      if (p.e) {
        const [cx, cy, rx, ry, rot = 0] = p.e, a = rot * Math.PI / 180, n = p.n || 2;
        const dx = X - cx, dy = Y - cy, u = (dx * Math.cos(a) + dy * Math.sin(a)) / rx, v = (-dx * Math.sin(a) + dy * Math.cos(a)) / ry;
        const d = Math.pow(Math.abs(u), n) + Math.pow(Math.abs(v), n);
        if (d <= 1) { inside = true; const e2 = Math.min(1, u * u + v * v), nz = Math.sqrt(Math.max(0, 1 - e2));
          const I = (u * Lx + v * Ly + nz * Lz) + (p.flat || 0);
          tone = I > 0.72 ? 4 : I > 0.3 ? 3 : I > -0.05 ? 2 : 1; }
      } else if (p.poly) {
        const pts = p.poly; let c = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > Y) !== (yj > Y)) && (X < (xj - xi) * (Y - yi) / (yj - yi) + xi)) c = !c; }
        if (c) { inside = true; const mx = pts.reduce((s, q) => s + q[0], 0) / pts.length, my = pts.reduce((s, q) => s + q[1], 0) / pts.length;
          const I = ((X - mx) * Lx + (Y - my) * Ly) / 9 + 0.45 + (p.flat || 0); tone = I > 0.72 ? 4 : I > 0.3 ? 3 : I > -0.05 ? 2 : 1; }
      }
      if (inside && p.clip != null) inside = owner[y][x] === p.clip;
      if (inside) cells.push([x, y, p.tone != null ? p.tone : tone]);
    }
    const set = new Set(cells.map(([x, y]) => y * W + x));
    for (const [x, y, t] of cells) {
      let t2 = t;
      if (p.line !== false && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !set.has((y + dy) * W + (x + dx)))) t2 = 0;
      px[y][x] = R[t2]; owner[y][x] = pi;
    }
  });
  for (const [x, y, c] of spec.dots || []) if (px[y] && x >= 0 && x < W) px[y][x] = c;
  const out = px.map(r => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (px[y][x]) continue; let best = null, lum = 1e9;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = px[y + dy] && px[y + dy][x + dx]; if (!c) continue; const [r, g, b] = pxHex(c); const l = r * .3 + g * .59 + b * .11; if (l < lum) { lum = l; best = c; } }
    if (best) out[y][x] = pxMix(best, '#0B0418', 0.55);
  }
  if (spec.aura) { // final forms glow: a bright ring outside the outline, plus a dithered outer haze
    const ring = out.map(r => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (out[y][x]) continue;
      let near = false, far = false;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const c = out[y + dy] && out[y + dy][x + dx]; if (!c) continue; if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) near = true; else far = true; }
      if (near) ring[y][x] = spec.aura; else if (far && (x + y) % 2 === 0) ring[y][x] = pxMix(spec.aura, '#FFFFFF', 0.35);
    }
    return ring;
  }
  return out;
}

/* ---------- face pieces and the belly-symbol font ---------- */
const PINK = '#FF6F8E', INKP = '#140B26', WHP = '#FFFFFF', CLAWP = '#FFF3DC';
function pxEye(x, y, iris, w = 5, h = 8) {
  const d = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if ((j === 0 || j === h - 1) && (i === 0 || i === w - 1)) continue;
    const edge = j === 0 || j === h - 1 || i === 0 || i === w - 1;
    d.push([x + i, y + j, edge || j === 1 ? INKP : j >= h - Math.ceil(h / 2) ? iris : '#241540']);
  }
  d.push([x + 1, y + 2, WHP], [x + 1, y + 3, WHP]); if (w > 3) d.push([x + 2, y + 2, WHP]); if (w > 4) d.push([x + w - 2, y + h - 3, '#CFE4FF']);
  return d;
}
const GLYPH = {
  '+': [' # ', '###', ' # '], '−': ['###'], '×': ['# #', ' # ', '# #'], '÷': [' # ', '   ', '###', '   ', ' # '], '=': ['###', '   ', '###'],
  '.': ['##', '##'], '±': [' # ', '###', ' # ', '   ', '###'], '|': ['#', '#', '#', '#', '#'], 'x': ['# #', ' # ', '# #'],
  '⇄': ['  # ', '####', '    ', '####', ' #  '], '0': ['###', '# #', '# #', '# #', '###'], '∞': [' # # ', '# # #', ' # # '],
  ':': ['#', ' ', '#'], '1': [' # ', '## ', ' # ', ' # ', '###'], '2': ['###', '  #', '###', '#  ', '###'], '3': ['###', '  #', '###', '  #', '###'],
  '%': ['#  #', '  # ', ' #  ', '#  #'], '⤢': ['  ##', '   #', '  # ', '#   ', '##  '], '$': [' ###', '# # ', ' ## ', '  ##', '### '],
  '↑': [' # ', '###', ' # ', ' # ', ' # '], 'k': ['#  ', '# #', '## ', '# #', '# #'], '/': ['  #', '  #', ' # ', '#  ', '#  '],
  'I': ['###', ' # ', ' # ', ' # ', '###'], '≡': ['###', '   ', '###', '   ', '###'], '∝': [' ## #', '#  # ', ' ## #'],
  'Σ': ['####', '#   ', ' #  ', '#   ', '####'], 'a': ['###', '  #', '###', '# #', '###'], '²': ['## ', ' # ', '###'],
  '‰': ['#  # ', '  #  ', ' #   ', '# # #'], 'm': ['## # ', '# # #', '# # #'],
  '▦': ['# # #', '     ', '# # #', '     ', '# # #'], '!': ['#', '#', '#', ' ', '#'],
  '>': ['#  ', ' # ', '  #', ' # ', '#  '], '<': ['  #', ' # ', '#  ', ' # ', '  #'],
  '≥': ['#  ', ' # ', '#  ', '   ', '###'], '≤': ['  #', ' # ', '  #', '   ', '###'], '?': ['## ', '  #', ' # ', '   ', ' # '],
};
function pxText(str, cx, cy, col) {
  const gl = [...str].map(ch => GLYPH[ch] || GLYPH['+']);
  const width = gl.reduce((s, g) => s + g[0].length, 0) + gl.length - 1;
  let x = Math.round(cx - width / 2); const d = [];
  for (const g of gl) { const top = Math.round(cy - g.length / 2); g.forEach((row, j) => [...row].forEach((c, i) => { if (c === '#') d.push([x + i, top + j, col]); })); x += g[0].length + 1; }
  return d;
}

// A thick stroke along a centerline, as one polygon (so it gets a single clean outline). Tapers to w1.
function pxStroke(pts, w0, w1) {
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    const w = (w0 + (w1 - w0) * i / (pts.length - 1)) / 2;
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  return L.concat(R.reverse());
}

/* ---------- the composer: design traits → parts ---------- */
const PX_IRIS = { blaze: '#D9531B', tide: '#1D5FD8', grove: '#15803D', volt: '#7C3AED' };
const FIRE = '#FF9A2E', FIRE_HI = '#FFE27A', LEAF = '#58C26C', LEAF2 = '#3FA34D', BOLT = '#FFD43B';
function pxCompose(sp) {
  const L = sp.look, parts = [], dots = [];
  const C = L.color, Bl = L.belly, dark = pxMix(C, '#2A1550', 0.3), darker = pxMix(C, '#1A0E36', 0.45);
  const G = { round: [31, 40, 17, 17], pear: [31, 41, 16, 17.5], tall: [32, 39, 13, 20], long: [35, 47, 20, 11.5], square: [31, 41, 17, 17] }[L.body];
  let [cx, cy, rx, ry] = G;
  if (L.big) { rx *= 1.12; ry *= 1.1; cy -= 2; }
  if (L.huge) { // final forms fill the frame
    const [fx2, fy2] = L.body === 'tall' ? [1.2, 1.0] : L.body === 'long' ? [1.1, 1.25] : [1.2, 1.12];
    rx *= fx2; ry *= fy2; cy = Math.min(cy, 58.5 - ry);
  }
  const long = L.body === 'long', top = cy - ry, bot = cy + ry;
  const add = p => (parts.push(p), parts.length - 1);
  // wings (behind everything)
  const WC = L.wingColor || Bl;
  if (L.wings === 'big') {
    add({ poly: [[cx + rx * 0.15, cy - ry * 0.55], [cx + rx * 0.6, cy - ry * 1.45], [cx + rx * 1.15, cy - ry * 1.3], [cx + rx * 0.95, cy - ry * 0.85], [cx + rx * 1.1, cy - ry * 0.6], [cx + rx * 0.5, cy - ry * 0.3]], color: pxMix(WC, '#3A2A78', 0.25) });
    const wp = [[cx - rx * 0.1, cy - ry * 0.4], [cx - rx * 0.9, cy - ry * 1.4], [cx - rx * 1.42, cy - ry * 1.25], [cx - rx * 1.32, cy - ry * 0.75], [cx - rx * 1.45, cy - ry * 0.35], [cx - rx * 1.2, cy - ry * 0.12], [cx - rx * 1.32, cy + ry * 0.25], [cx - rx * 0.5, cy + ry * 0.15]];
    add({ poly: wp, color: WC });
    for (const [a, b] of [[1, 0], [3, 0], [5, 0]]) add({ poly: pxStroke([[cx - rx * 0.35, cy - ry * 0.2], [(wp[a][0] * 2 + cx - rx * 0.35) / 3, (wp[a][1] * 2 + cy - ry * 0.2) / 3]], 2.2, 1), color: pxMix(WC, '#2A1550', 0.35), line: false, tone: 2 });
  } else if (L.wings) {
    add({ poly: [[cx - rx * 0.2, cy - ry * 0.45], [cx - rx * 1.15, cy - ry * 1.15], [cx - rx * 1.5, cy - ry * 0.6], [cx - rx * 1.2, cy - ry * 0.42], [cx - rx * 1.38, cy - ry * 0.05], [cx - rx * 0.55, cy + ry * 0.1]], color: WC });
    add({ poly: [[cx + rx * 0.25, cy - ry * 0.55], [cx + rx * 0.85, cy - ry * 1.25], [cx + rx * 1.1, cy - ry * 0.75], [cx + rx * 0.6, cy - ry * 0.35]], color: pxMix(WC, '#3A2A78', 0.25) });
  }
  // tail
  const ox = long ? cx - rx * 0.92 : cx - rx * 0.78, oy = long ? cy - 1 : cy + ry * 0.35;
  switch (L.tail) {
    case 'flame':
      add({ poly: [[ox + 3, oy + 4], [ox - 4, oy + 2], [ox - 8, oy - 4], [ox - 5, oy - 8], [ox - 1, oy - 3], [ox + 4, oy - 2]], color: C });
      add({ poly: [[ox - 9, oy - 5], [ox - 13, oy - 13], [ox - 11, oy - 20], [ox - 8, oy - 15], [ox - 6, oy - 23], [ox - 3, oy - 16], [ox, oy - 18], [ox - 2, oy - 9], [ox - 5, oy - 4]], color: FIRE, flat: .2 });
      add({ poly: [[ox - 8, oy - 7], [ox - 9, oy - 13], [ox - 7, oy - 12], [ox - 5, oy - 17], [ox - 3, oy - 9]], color: FIRE_HI, line: false, tone: 4 }); break;
    case 'leaf': add({ poly: [[ox + 4, oy + 1], [ox - 6, oy - 2], [ox - 13, oy - 11], [ox - 4, oy - 10], [ox + 3, oy - 5]], color: LEAF }); break;
    case 'fin': add({ poly: [[ox + 4, oy - 2], [ox - 10, oy - 11], [ox - 11, oy + 4], [ox - 7, oy + 10], [ox + 4, oy + 4]], color: dark }); break;
    case 'zigzag': add({ poly: [[ox + 3, oy], [ox - 4, oy - 6], [ox - 2, oy - 7], [ox - 10, oy - 17], [ox - 3, oy - 10], [ox - 5, oy - 9], [ox + 4, oy - 3]], color: BOLT, flat: .2 }); break;
    case 'fan':
      for (const ang of [-38, -8, 22]) {
        const a = ang * Math.PI / 180, rot = ([x, y]) => [ox + x * Math.cos(a) - y * Math.sin(a), oy + x * Math.sin(a) + y * Math.cos(a)];
        add({ poly: [[3, 1], [-6, 4], [-14, 1], [-18, -4], [-12, -5], [-4, -3], [3, -2]].map(rot), color: C });
        add({ poly: [[-14, 0], [-18, -4], [-13, -4]].map(rot), color: Bl, line: false, tone: 4 });
      } break;
    case 'curl': add({ poly: pxStroke([[3, 2], [-2, 3], [-7, 1], [-10, -3], [-10, -8], [-7, -11], [-3, -10], [-2, -7]].map(([dx, dy]) => [ox + dx, oy + dy]), 5.2, 3), color: C }); break;
  }
  // head features (behind the body)
  const tx = cx + rx * 0.05, ty = top;
  const horn = '#F3E6C8', horn2 = '#D2BF93';
  const headFeature = kind => { switch (kind) {
    case 'pointy':
      add({ poly: [[tx + 5, ty + 6], [tx + 12, ty - 9], [tx + 15, ty + 7]], color: dark });
      add({ poly: [[tx - 11, ty + 7], [tx - 8, ty - 12], [tx + 1, ty + 4]], color: C });
      add({ poly: [[tx - 8, ty + 4], [tx - 7, ty - 6], [tx - 2, ty + 3]], color: Bl, line: false, tone: 3 }); break;
    case 'round':
      add({ e: [tx + 11, ty + 4, 4.5, 4.5], color: dark });
      add({ e: [tx - 8, ty + 3, 5.6, 5.6], color: C }); add({ e: [tx - 8, ty + 4, 2.6, 2.6], color: Bl, line: false, tone: 3 }); break;
    case 'long':
      add({ e: [tx + 6, ty - 5, 3.4, 9, 18], color: dark }); add({ e: [tx - 6, ty - 5, 4, 10.5, -14], color: C }); add({ e: [tx - 6, ty - 4, 1.6, 6.5, -14], color: Bl, line: false, tone: 3 }); break;
    case 'horns':
      add({ poly: [[tx + 6, ty + 4], [tx + 2, ty - 8], [tx - 1, ty - 14], [tx + 7, ty - 7], [tx + 11, ty + 4]], color: horn2 });
      add({ poly: [[tx - 3, ty + 5], [tx - 13, ty - 3], [tx - 18, ty - 12], [tx - 9, ty - 6], [tx + 3, ty + 3]], color: horn }); break;
    case 'antenna':
      for (const [x1, y1, x2, y2, col] of [[tx + 5, ty + 2, tx + 9, ty - 9, dark], [tx - 3, ty + 2, tx - 8, ty - 10, C]]) {
        add({ poly: [[x1, y1], [x2, y2], [x2 + 2, y2 + 1], [x1 + 2, y1]], color: darker, line: false, tone: 1 });
        add({ e: [x2 + 1, y2 - 1, 3, 3], color: col });
      } break;
    case 'leaf':
      add({ poly: [[tx + 1, ty + 2], [tx + 7, ty - 12], [tx + 12, ty - 11], [tx + 8, ty + 1]], color: LEAF2 });
      add({ poly: [[tx - 1, ty + 3], [tx - 8, ty - 8], [tx - 7, ty - 13], [tx + 1, ty - 9], [tx + 2, ty + 1]], color: LEAF }); break;
    case 'flame':
      add({ poly: [[tx - 8, ty + 4], [tx - 10, ty - 7], [tx - 5, ty - 3], [tx - 2, ty - 13], [tx + 2, ty - 4], [tx + 7, ty - 9], [tx + 7, ty + 4]], color: FIRE, flat: .25 });
      add({ poly: [[tx - 4, ty + 3], [tx - 4, ty - 3], [tx - 1, ty - 1], [tx + 1, ty - 7], [tx + 3, ty + 2]], color: FIRE_HI, line: false, tone: 4 }); break;
    case 'fin': add({ poly: [[tx - 7, ty + 5], [tx - 3, ty - 12], [tx + 10, ty - 2], [tx + 5, ty + 5]], color: dark }); break;
    case 'crest':
      add({ e: [tx + 4, ty - 4, 2.4, 7, -5], color: darker }); add({ e: [tx - 1, ty - 6, 2.6, 8, -22], color: dark }); add({ e: [tx - 6, ty - 3, 2.6, 7, -40], color: dark }); break;
    case 'spikes':
      for (let k = 0; k < 5; k++) { const th = (205 + k * 22) * Math.PI / 180, bx = cx + rx * Math.cos(th), by = cy + ry * Math.sin(th), nx = Math.cos(th), ny = Math.sin(th);
        add({ poly: [[bx - ny * 3.2 - nx, by + nx * 3.2 - ny], [bx + nx * 8, by + ny * 8], [bx + ny * 3.2 - nx, by - nx * 3.2 - ny]], color: k > 3 ? darker : dark }); } break;
      case 'horn1':
      add({ poly: [[tx + 1, ty + 5], [tx + 7, ty - 15], [tx + 6, ty + 5]], color: '#F6EBD0', flat: .2 });
      dots.push([Math.round(tx + 5), Math.round(ty - 6), '#C9B07E'], [Math.round(tx + 4), Math.round(ty - 2), '#C9B07E'], [Math.round(tx + 6), Math.round(ty - 10), '#C9B07E']); break;
    case 'antlers': {
      const A1 = '#EAD9B2', A2 = '#C2AD7E';
      add({ poly: pxStroke([[tx + 5, ty + 3], [tx + 8, ty - 5], [tx + 12, ty - 12]], 3, 2), color: A2 });
      add({ poly: pxStroke([[tx + 8, ty - 5], [tx + 13, ty - 6]], 2.2, 1.6), color: A2 });
      add({ poly: pxStroke([[tx - 2, ty + 3], [tx - 6, ty - 4], [tx - 11, ty - 10], [tx - 14, ty - 15]], 3.4, 2.2), color: A1 });
      add({ poly: pxStroke([[tx - 6, ty - 4], [tx - 3, ty - 11]], 2.4, 1.6), color: A1 });
      add({ poly: pxStroke([[tx - 11, ty - 10], [tx - 8, ty - 16]], 2.2, 1.6), color: A1 });
      add({ poly: pxStroke([[tx - 11, ty - 10], [tx - 17, ty - 9]], 2.2, 1.6), color: A1 }); break; }
  } };
  if (L.mane) for (let k = 0; k < 7; k++) { // fur ruff around the back of the head
    const th = (165 + k * 22) * Math.PI / 180, bx = cx + rx * 0.95 * Math.cos(th), by = cy - ry * 0.25 + ry * 0.8 * Math.sin(th), nx = Math.cos(th), ny = Math.sin(th);
    add({ poly: [[bx - ny * 4, by + nx * 4], [bx + nx * 9, by + ny * 9], [bx + ny * 4, by - nx * 4]], color: k % 2 ? L.mane : pxMix(L.mane, '#3A2A78', 0.18) });
  }
  if (L.ears2) headFeature(L.ears2);
  headFeature(L.ears);
  // back feet
  const feetBack = long ? [cx - rx * 0.6, cx + rx * 0.05] : [cx - rx * 0.42];
  for (const fx of feetBack) add({ e: [fx, bot - 1, 5.2, 4], color: darker });
  // body + belly + patterns
  const bi = add({ e: [cx, cy, rx, ry], n: L.body === 'square' ? 3.4 : 2, color: C });
  const bx0 = cx + rx * (long ? 0.28 : 0.22), by0 = cy + ry * (long ? 0.38 : 0.32);
  add({ e: [bx0 + 1, by0 + 1, rx * (long ? 0.5 : 0.58), ry * (long ? 0.55 : 0.6)], n: L.body === 'square' ? 3 : 2, color: Bl, clip: bi, line: false });
  if (L.pattern === 'spots') for (const [u, v, r] of [[-0.55, -0.15, 2.8], [-0.3, 0.55, 2.3], [0.55, -0.45, 2.1], [-0.72, 0.3, 2.2]]) add({ e: [cx + u * rx, cy + v * ry, r, r], color: darker, clip: bi, line: false, tone: 2 });
  if (L.pattern === 'stripes') for (let k = 0; k < 3; k++) add({ e: [cx - rx * 0.62 + k * 5, cy - ry * 0.5 + k * 1.5, 1.4, 5, 28], color: darker, clip: bi, line: false, tone: 1 });
  // front feet and arm
  const feetFront = long ? [cx - rx * 0.25, cx + rx * 0.45] : [cx + rx * 0.3];
  for (const fx of feetFront) { add({ e: [fx, bot + 1, 6.2, 4.2], color: dark }); dots.push([Math.round(fx) - 2, Math.round(bot) + 4, CLAWP], [Math.round(fx) + 1, Math.round(bot) + 4, CLAWP], [Math.round(fx) + 4, Math.round(bot) + 3, CLAWP]); }
  if (!long) { add({ e: [cx + rx * 0.9, cy + ry * 0.18, 3.4, 5.4, -30], color: C }); dots.push([Math.round(cx + rx * 0.9) + 2, Math.round(cy + ry * 0.18) + 5, CLAWP]); }
  if (L.armor) {
    const M = L.armor === true ? '#B8C2D6' : L.armor;
    add({ e: [cx + rx * 0.72, cy + ry * 0.1, rx * 0.26, ry * 0.15, -20], color: M, flat: .1 });
    add({ e: [cx - rx * 0.62, cy - ry * 0.12, rx * 0.26, ry * 0.18, 20], color: pxMix(M, '#3A2A78', 0.2) });
    for (let k = 0; k < 2; k++) dots.push([Math.round(cx + rx * 0.72 - 2 + k * 3), Math.round(cy + ry * 0.08), pxMix(M, '#FFFFFF', 0.6)]);
  }
  if (L.pattern === 'stars') for (const [u, v] of [[-0.55, -0.2], [-0.25, -0.65], [0.62, -0.5], [-0.7, 0.35], [0.15, -0.45]]) {
    const x = Math.round(cx + u * rx), y = Math.round(cy + v * ry);
    dots.push([x, y, '#FFFFFF'], [x - 1, y, '#DDEBFF'], [x + 1, y, '#DDEBFF'], [x, y - 1, '#DDEBFF'], [x, y + 1, '#DDEBFF']);
  }
  // face
  const fx = cx + rx * (long ? 0.5 : 0.22), fyC = cy - ry * (L.body === 'tall' ? 0.42 : long ? 0.15 : 0.32);
  const big = L.eyes === 'big', ew = big ? 5 : 4, eh = big ? 8 : 6;
  const ex = Math.round(fx - 7), ex2 = Math.round(fx + 3), ey = Math.round(fyC - eh / 2), iris = PX_IRIS[sp.type];
  if (L.eyes === 'sleepy') {
    for (const [x0, wdt] of [[ex, 5], [ex2, 4]]) { for (let i = 0; i < wdt; i++) dots.push([x0 + i, ey + 4 + (i === 0 || i === wdt - 1 ? 0 : 1), INKP]); dots.push([x0 - 1, ey + 3, INKP]); }
  } else {
    dots.push(...pxEye(ex, ey, iris, ew, eh), ...pxEye(ex2, ey, iris, ew - 1, eh));
    if (L.eyes === 'angry') { for (let i = 0; i < 5; i++) dots.push([ex + i, ey - 2 + (i > 2 ? 1 : 0), INKP]); for (let i = 0; i < 4; i++) dots.push([ex2 + i, ey - 1 - (i > 1 ? 1 : 0), INKP]); }
  }
  const my = ey + eh + 2, mx = Math.round(fx - 2);
  dots.push([mx, my, INKP], [mx + 1, my + 1, INKP], [mx + 2, my + 1, INKP], [mx + 3, my, INKP]);
  if (L.eyes === 'angry') dots.push([mx + 2, my + 2, WHP]);
  dots.push([ex - 1, my - 1, PINK], [ex, my - 1, PINK], [ex2 + ew, my - 2, PINK]);
  // gem, belly symbol, body glint
  if (L.gem) add({ poly: [[fx - 2, ey - 8], [fx + 1, ey - 5], [fx - 2, ey - 2], [fx - 5, ey - 5]], color: L.gem, flat: .35 });
  if (L.crown) {
    const kx = tx + 1, ky = ty + 3;
    add({ poly: [[kx - 7, ky + 2], [kx - 7, ky - 5], [kx - 4, ky - 1], [kx - 1, ky - 8], [kx + 2, ky - 1], [kx + 5, ky - 5], [kx + 5, ky + 2]], color: '#F2B731', flat: .25 });
    dots.push([Math.round(kx - 1), Math.round(ky - 1), '#E5533A'], [Math.round(kx - 1), Math.round(ky), '#E5533A']);
  }
  dots.push(...pxText(L.sym || '', bx0 + 1, by0 + 2, pxMix(Bl, '#2A1A48', 0.72)));
  const gx = Math.round(cx - rx * 0.5), gy = Math.round(cy - ry * 0.62);
  dots.push([gx, gy, '#FFF6E0'], [gx + 1, gy - 1, '#FFF6E0'], [gx + 2, gy - 1, '#FFF6E0']);
  return { parts, dots, aura: L.aura || null };
}

/* ---------- hand-built sprites (these override the composer) ---------- */
const INK = INKP, WH = WHP, CLAW = CLAWP;
function protoEye(x, y, iris, w = 5, h = 8) { // rounded eye: dark lid on top, iris low, two highlights
  const d = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const corner = (j === 0 || j === h - 1) && (i === 0 || i === w - 1);
    if (corner) continue;
    const edge = j === 0 || j === h - 1 || i === 0 || i === w - 1;
    d.push([x + i, y + j, edge || j === 1 ? INK : j >= h - 4 ? iris : '#241540']);
  }
  d.push([x + 1, y + 2, WH], [x + 2, y + 2, WH], [x + 1, y + 3, WH]);
  if (w > 4) d.push([x + w - 2, y + h - 3, '#CFE4FF']);
  return d;
}
function protoSym(x, y, rows, col) { const d = []; rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === '#') d.push([x + i, y + j, col]); })); return d; }
const PLUS = [' # ', '###', ' # '], EQ = ['###', '   ', '###'], TIMES = ['# #', ' # ', '# #'], SIGMA = ['####', '#   ', ' #  ', '#   ', '####'];
const protoMouth = (x, y) => [[x, y, INK], [x + 1, y + 1, INK], [x + 2, y + 1, INK], [x + 3, y, INK]];
const protoClaws = (pts) => pts.map(([x, y]) => [x, y, CLAW]);
const PX_HAND = {};
PX_HAND[1] = { name: 'Kindlit', parts: [
  { poly: [[17,46],[10,44],[6,38],[9,34],[13,39],[18,40]], color: '#E8682F' },
  { poly: [[7,37],[3,29],[5,22],[8,27],[10,19],[13,26],[16,24],[14,33],[11,38]], color: '#FF9A2E', flat: .2 },
  { poly: [[8,35],[7,29],[9,27],[10,31],[12,28],[12,35]], color: '#FFE27A', line: false, tone: 4 },
  { e: [24, 57, 5.5, 4], color: '#B9481D' },
  { e: [32, 40, 18, 17.5], color: '#F07A3E' },
  { e: [37, 46, 10, 10.5], color: '#FFD9B3', clip: 4, line: false },
  { e: [39, 58, 6.5, 4.2], color: '#E26A30' },
  { e: [47, 45, 3.6, 5.5, -30], color: '#F07A3E' },
  { poly: [[24,25],[22,15],[27,19],[30,9],[34,18],[39,13],[39,25]], color: '#FF9A2E', flat: .25 },
  { poly: [[28,24],[28,18],[31,20],[33,15],[35,23]], color: '#FFE27A', line: false, tone: 4 },
], dots: [...protoEye(33, 29, '#D9531B', 5, 8), ...protoEye(43, 29, '#D9531B', 4, 8), ...protoMouth(38, 39), [31, 39, '#FF6F8E'], [32, 39, '#FF6F8E'], [47, 38, '#FF6F8E'],
  ...protoSym(35, 47, PLUS, '#A8582E'), ...protoClaws([[37, 61], [40, 61], [43, 60], [50, 49]]), [24, 29, '#FFF3D6'], [25, 28, '#FFF3D6'], [26, 28, '#FFF3D6']] };
PX_HAND[2] = { name: 'Ripplet', parts: [
  { poly: [[16,44],[4,36],[3,50],[8,55],[17,50]], color: '#2C7FD0' },
  { e: [24, 57, 5.5, 4], color: '#1F5E9E' },
  { e: [32, 41, 17, 17.5], color: '#3E9BE8' },
  { e: [37, 47, 10, 10.5], color: '#CFE9FF', clip: 2, line: false },
  { e: [39, 58, 6.5, 4.2], color: '#3589D6' },
  { poly: [[45,44],[53,46],[50,51],[44,49]], color: '#2C7FD0' },
  { poly: [[25,26],[29,10],[42,20],[37,25]], color: '#2C7FD0' },
], dots: [...protoEye(33, 30, '#1D5FD8', 5, 8), ...protoEye(43, 30, '#1D5FD8', 4, 8), ...protoMouth(38, 40), [31, 40, '#FF6F8E'], [32, 40, '#FF6F8E'], [47, 39, '#FF6F8E'],
  ...protoSym(35, 48, EQ, '#3D6491'), ...protoClaws([[37, 61], [40, 61], [43, 60]]), [23, 30, '#E8F4FF'], [24, 29, '#E8F4FF'], [25, 29, '#E8F4FF']] };
PX_HAND[3] = { name: 'Sprigg', parts: [
  { poly: [[18,46],[8,42],[3,34],[11,35],[18,40]], color: '#4FBF63' },
  { e: [26, 58, 5, 4], color: '#2E7D3E' },
  { e: [33, 40, 14, 19], color: '#4DB86A' },
  { e: [37, 46, 8.5, 11.5], color: '#D9F6CB', clip: 2, line: false },
  { e: [39, 59, 6, 4], color: '#3FA05A' },
  { e: [45, 44, 3, 5.5, -30], color: '#4DB86A' },
  { poly: [[31,23],[24,13],[25,8],[32,12],[34,21]], color: '#58C26C' },
  { poly: [[33,21],[39,8],[44,9],[40,20]], color: '#3FA34D' },
], dots: [...protoEye(33, 28, '#15803D', 5, 7), ...protoEye(42, 28, '#15803D', 4, 7), ...protoMouth(37, 37), [31, 37, '#FF6F8E'], [32, 37, '#FF6F8E'], [46, 36, '#FF6F8E'],
  ...protoSym(35, 46, TIMES, '#3F7A3A'), ...protoClaws([[37, 62], [40, 62], [43, 61]]), [27, 27, '#F2FFE8'], [27, 28, '#F2FFE8'], [28, 26, '#F2FFE8']] };
PX_HAND[26] = { name: 'Summiflare', parts: [
  { poly: [[18,34],[8,22],[9,10],[13,18],[16,6],[20,16],[25,10],[25,28]], color: '#FF8A2E', flat: .3 },
  { poly: [[15,48],[8,46],[3,39],[6,33],[10,38],[16,41]], color: '#D64A22' },
  { poly: [[4,37],[1,27],[4,20],[7,26],[9,17],[12,25],[14,23],[12,33],[8,38]], color: '#FF9A2E', flat: .2 },
  { e: [23, 58, 6, 4.5], color: '#9E3A16' },
  { e: [32, 39, 20, 19.5], color: '#E45A2A' },
  { e: [37, 46, 11, 12], color: '#FFD0A0', clip: 4, line: false },
  { e: [40, 59, 7, 4.5], color: '#CC4E22' },
  { e: [50, 45, 4, 6, -30], color: '#E45A2A' },
  { poly: [[22,22],[19,10],[25,15],[28,4],[33,14],[38,6],[42,22]], color: '#FF9A2E', flat: .25 },
  { poly: [[27,21],[27,14],[30,17],[33,10],[35,20]], color: '#FFE27A', line: false, tone: 4 },
  { poly: [[38,22],[41,18],[44,22],[41,26]], color: '#FFD43B', flat: .35 },
], dots: [...protoEye(33, 28, '#C2410C', 5, 8), ...protoEye(44, 28, '#C2410C', 4, 8), [32, 27, INK], [33, 26, INK], [34, 26, INK], [35, 26, INK], [36, 27, INK], [44, 26, INK], [45, 26, INK], [46, 27, INK],
  ...protoMouth(39, 38), [41, 39, WH], [31, 37, '#FF6F8E'], [32, 37, '#FF6F8E'], [48, 36, '#FF6F8E'],
  ...protoSym(34, 46, SIGMA, '#99401F'), ...protoClaws([[37, 62], [40, 62], [44, 61], [53, 49], [52, 50]]), [20, 27, '#FFF3D6'], [21, 26, '#FFF3D6'], [22, 25, '#FFF3D6']] };

const pxSpec = sp => PX_HAND[sp.n] || pxCompose(sp);

/* ---------- shiny recolors ----------
   A shiny keeps its design but rotates the hue of its body, belly, wings, mane and aura.
   Fire, gold, eyes and outlines keep their colors so it still reads as the same Numling. */
function pxHsl(hex) { let [r, g, b] = pxHex(hex).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l]; }
function pxFromHsl(h, s, l) { h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return pxRgb([r + m, g + m, b + m].map(v => v * 255)); }
function pxShift(hex, deg, satBoost = 1) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const [h, s, l] = pxHsl(hex);
  if (s < 0.2) return pxFromHsl((deg * 1.7 + 20) % 360, l > 0.85 ? 0.55 : 0.45, l > 0.85 ? Math.min(l, 0.84) : l); // grays and whites get a real tint
  return pxFromHsl(h + deg, Math.min(1, Math.max(0.28, s * satBoost)), l);
}
const SHINY_KEEP = new Set(['#FF9A2E', '#FFE27A', '#FF8A2E', '#FFD43B', '#F2B731', '#FFF3DC', '#FFF6E0', '#F3E6C8', '#D2BF93', '#F6EBD0', '#EAD9B2', '#C2AD7E']);
const SHINY_SHIFTS = [150, 200, 120, 245, 75, 300, 175, 55, 220];
// Every stage of a line shares its base form's shiny colors.
const pxRoot = sp => { let s = sp; while (s.from) s = SP[s.from]; return s.n; };
const shinyShift = sp => SHINY_SHIFTS[pxRoot(sp) % SHINY_SHIFTS.length];
function pxShinySpec(sp) {
  const d = shinyShift(sp);
  if (PX_HAND[sp.n]) {
    const h = PX_HAND[sp.n];
    return { parts: h.parts.map(p => (SHINY_KEEP.has(p.color.toUpperCase()) ? p : { ...p, color: pxShift(p.color, d, 1.1) })), dots: h.dots, aura: h.aura };
  }
  const L = { ...sp.look };
  for (const k of ['color', 'belly', 'wingColor', 'mane', 'aura']) if (L[k]) L[k] = pxShift(L[k], d, k === 'belly' ? 1 : 1.1);
  if (typeof L.armor === 'string' && !SHINY_KEEP.has(L.armor.toUpperCase())) L.armor = pxShift(L.armor, d);
  return pxCompose({ ...sp, look: L });
}
