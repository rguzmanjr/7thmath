/* Numlings: the original vector art (used only if pixel sprites cannot be drawn) */
'use strict';
/* ========================= creature art (original SVG) ========================= */
function shade(hex, amt) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  let [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  [r, g, b] = [r, g, b].map(c => Math.round((t - c) * p + c));
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}
const BODY = {
  round: { cx: 60, cy: 72, w: 34, h: 30 },
  tall: { cx: 60, cy: 68, w: 27, h: 37 },
  pear: { cx: 60, cy: 72, w: 33, h: 32 },
  long: { cx: 60, cy: 79, w: 44, h: 23 },
  square: { cx: 60, cy: 72, w: 33, h: 31 },
};
let svgSeq = 0;
function creatureSVG(sp, opt = {}) {
  const L = sp.look, B0 = BODY[L.body];
  const B = L.big ? { cx: B0.cx, cy: B0.cy - 3, w: B0.w * 1.12, h: B0.h * 1.1 } : B0;
  const { cx, cy, w, h } = B, top = cy - h, bot = cy + h;
  const sil = opt.sil;
  const C = sil ? 'currentColor' : L.color;
  const Bl = sil ? 'currentColor' : L.belly;
  const dark = sil ? 'currentColor' : shade(L.color, -0.22);
  const edge = sil ? 'currentColor' : shade(L.color, -0.45);
  const fire = sil ? 'currentColor' : '#FFAE3B', fireIn = sil ? 'currentColor' : '#FFE27A';
  const leaf = sil ? 'currentColor' : '#58C26C', bolt = sil ? 'currentColor' : '#FFD43B';
  const sw = `stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"`;
  let back = '', front = '';

  // wings
  if (L.wings) for (const s of [-1, 1]) {
    back += `<ellipse cx="${cx + s * (w + 6)}" cy="${cy - 6}" rx="15" ry="9" transform="rotate(${s * -28} ${cx + s * (w + 6)} ${cy - 6})" fill="${Bl}" ${sw}/>`;
  }
  // tail
  const bx = cx + w * 0.85, by = cy + h * 0.3;
  switch (L.tail) {
    case 'flame': back += `<path d="M${bx - 4} ${by + 4} C${bx + 10} ${by} ${bx + 14} ${by - 12} ${bx + 12} ${by - 26} C${bx + 26} ${by - 14} ${bx + 28} ${by + 4} ${bx + 14} ${by + 10} Z" fill="${fire}" ${sw}/>
        <path d="M${bx + 4} ${by + 4} C${bx + 12} ${by} ${bx + 14} ${by - 8} ${bx + 14} ${by - 14} C${bx + 20} ${by - 6} ${bx + 20} ${by + 4} ${bx + 12} ${by + 6} Z" fill="${fireIn}"/>`; break;
    case 'leaf': back += `<path d="M${bx - 4} ${by} C${bx + 8} ${by - 16} ${bx + 22} ${by - 18} ${bx + 30} ${by - 12} C${bx + 22} ${by + 2} ${bx + 10} ${by + 6} ${bx - 4} ${by} Z" fill="${leaf}" ${sw}/>
        <path d="M${bx} ${by} L${bx + 24} ${by - 11}" stroke="${edge}" stroke-width="1.5" fill="none"/>`; break;
    case 'fin': back += `<path d="M${bx - 6} ${by - 4} L${bx + 22} ${by - 18} Q${bx + 15} ${by} ${bx + 22} ${by + 14} Z" fill="${dark}" ${sw}/>`; break;
    case 'zigzag': back += `<path d="M${bx - 4} ${by} L${bx + 12} ${by - 10} L${bx + 8} ${by - 13} L${bx + 22} ${by - 28} L${bx + 16} ${by - 9} L${bx + 21} ${by - 7} Z" fill="${bolt}" ${sw}/>`; break;
    case 'curl': back += `<path d="M${bx - 6} ${by} C${bx + 14} ${by + 4} ${bx + 24} ${by - 12} ${bx + 14} ${by - 20} C${bx + 6} ${by - 24} ${bx + 2} ${by - 12} ${bx + 10} ${by - 10}" fill="none" stroke="${edge}" stroke-width="8" stroke-linecap="round"/>
        <path d="M${bx - 6} ${by} C${bx + 14} ${by + 4} ${bx + 24} ${by - 12} ${bx + 14} ${by - 20} C${bx + 6} ${by - 24} ${bx + 2} ${by - 12} ${bx + 10} ${by - 10}" fill="none" stroke="${C}" stroke-width="4" stroke-linecap="round"/>`; break;
  }
  // ears / head features
  const ear = L.ears;
  for (const s of [-1, 1]) {
    if (ear === 'pointy') {
      back += `<path d="M${cx + s * w * 0.2} ${top + 10} L${cx + s * w * 0.78} ${top - 17} L${cx + s * w * 0.88} ${top + 18} Z" fill="${C}" ${sw}/>
               <path d="M${cx + s * w * 0.4} ${top + 10} L${cx + s * w * 0.74} ${top - 7} L${cx + s * w * 0.78} ${top + 14} Z" fill="${Bl}"/>`;
    } else if (ear === 'round') {
      back += `<circle cx="${cx + s * w * 0.62}" cy="${top + 6}" r="10" fill="${C}" ${sw}/><circle cx="${cx + s * w * 0.62}" cy="${top + 7}" r="5" fill="${Bl}"/>`;
    } else if (ear === 'long') {
      back += `<ellipse cx="${cx + s * w * 0.72}" cy="${top + 12}" rx="7" ry="17" transform="rotate(${s * 32} ${cx + s * w * 0.72} ${top + 12})" fill="${dark}" ${sw}/>`;
    } else if (ear === 'horns') {
      const hb = sil ? 'currentColor' : '#F3E6C8';
      back += `<path d="M${cx + s * w * 0.25} ${top + 8} Q${cx + s * w * 0.95} ${top - 2} ${cx + s * w * 0.8} ${top - 22} Q${cx + s * w * 0.6} ${top - 6} ${cx + s * w * 0.1} ${top + 12} Z" fill="${hb}" ${sw}/>`;
    } else if (ear === 'antenna') {
      const x1 = cx + s * w * 0.22, x2 = cx + s * w * 0.5;
      back += `<path d="M${x1} ${top + 6} Q${x1 + s * 2} ${top - 8} ${x2} ${top - 16}" stroke="${edge}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="${x2}" cy="${top - 16}" r="4.5" fill="${C}" ${sw}/>`;
    }
  }
  if (ear === 'leaf') back += `<path d="M${cx} ${top + 6} C${cx - 16} ${top - 8} ${cx - 8} ${top - 28} ${cx + 4} ${top - 26} C${cx + 10} ${top - 14} ${cx + 8} ${top - 2} ${cx} ${top + 6} Z" fill="${leaf}" ${sw}/><path d="M${cx} ${top + 4} L${cx - 1} ${top - 20}" stroke="${edge}" stroke-width="1.5"/>`;
  if (ear === 'flame') back += `<path d="M${cx - 10} ${top + 8} C${cx - 16} ${top - 6} ${cx - 6} ${top - 12} ${cx - 3} ${top - 28} C${cx + 6} ${top - 16} ${cx + 16} ${top - 10} ${cx + 10} ${top + 8} Z" fill="${fire}" ${sw}/><path d="M${cx - 4} ${top + 6} C${cx - 6} ${top - 4} ${cx - 2} ${top - 8} ${cx} ${top - 16} C${cx + 4} ${top - 8} ${cx + 8} ${top - 4} ${cx + 4} ${top + 6} Z" fill="${fireIn}"/>`;
  if (ear === 'fin') back += `<path d="M${cx - 12} ${top + 8} Q${cx - 4} ${top - 22} ${cx + 14} ${top - 16} Q${cx + 8} ${top - 2} ${cx + 12} ${top + 8} Z" fill="${dark}" ${sw}/>`;
  if (ear === 'crest') for (const i of [-1, 0, 1]) {
    const ex = cx + i * 8, ey = top - 5 + Math.abs(i) * 4;
    back += `<ellipse cx="${ex}" cy="${ey}" rx="4.5" ry="12" transform="rotate(${i * 22} ${ex} ${ey + 8})" fill="${dark}" ${sw}/>`;
  }
  if (ear === 'spikes') for (const i of [-2, -1, 0, 1, 2]) {
    const x = cx + i * w * 0.3, y = top + i * i * 3 + 6;
    back += `<path d="M${x - 6} ${y + 4} L${x + i * 3} ${y - 16} L${x + 6} ${y + 4} Z" fill="${dark}" ${sw}/>`;
  }

  // body
  let body;
  if (L.body === 'square') body = `<rect x="${cx - w}" y="${top}" width="${2 * w}" height="${2 * h}" rx="18" fill="${C}" ${sw}/>`;
  else if (L.body === 'pear') body = `<path d="M${cx} ${top} C${cx + w * 0.7} ${top} ${cx + w * 0.78} ${cy - h * 0.3} ${cx + w * 0.95} ${cy + h * 0.25} C${cx + w * 1.1} ${cy + h * 0.85} ${cx + w * 0.6} ${bot} ${cx} ${bot} C${cx - w * 0.6} ${bot} ${cx - w * 1.1} ${cy + h * 0.85} ${cx - w * 0.95} ${cy + h * 0.25} C${cx - w * 0.78} ${cy - h * 0.3} ${cx - w * 0.7} ${top} ${cx} ${top} Z" fill="${C}" ${sw}/>`;
  else body = `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${h}" fill="${C}" ${sw}/>`;

  // feet
  for (const s of [-1, 1]) back += `<ellipse cx="${cx + s * w * 0.42}" cy="${bot - 1}" rx="8" ry="5" fill="${dark}" ${sw}/>`;

  front += `<ellipse cx="${cx}" cy="${cy + h * 0.36}" rx="${w * 0.6}" ry="${h * 0.5}" fill="${Bl}"/>`;
  if (L.pattern === 'spots' && !sil) {
    front += [[-0.72, 0.05, 4.5], [0.7, -0.2, 5], [0.6, 0.42, 3.5], [-0.45, -0.62, 3]].map(([dx, dy, r]) => `<circle cx="${cx + dx * w}" cy="${cy + dy * h}" r="${r}" fill="${dark}" opacity=".7"/>`).join('');
  }
  if (L.pattern === 'stripes' && !sil) {
    for (const s of [-1, 1]) for (const k of [0, 1, 2])
      front += `<path d="M${cx + s * w * 0.92} ${cy - 6 + k * 8} L${cx + s * w * 0.66} ${cy - 4 + k * 8}" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
  }
  if (!sil) {
    // belly symbol
    const sym = L.sym || '';
    const fs = sym.length >= 3 ? h * 0.36 : sym.length === 2 ? h * 0.44 : h * 0.58;
    front += `<text x="${cx}" y="${cy + h * 0.38}" text-anchor="middle" dominant-baseline="central" font-family="Lexend, Segoe UI, sans-serif" font-weight="700" font-size="${fs.toFixed(1)}" fill="${shade(L.color, -0.5)}" opacity=".78">${esc(sym)}</text>`;
    // face
    const ey = L.body === 'tall' ? cy - h * 0.38 : L.body === 'long' ? cy - h * 0.3 : cy - h * 0.3;
    const edx = L.body === 'long' ? w * 0.26 : w * 0.36;
    const ink = '#1B2848';
    for (const s of [-1, 1]) {
      const ex = cx + s * edx;
      if (L.eyes === 'big') front += `<circle cx="${ex}" cy="${ey}" r="7" fill="#fff" stroke="${ink}" stroke-width="1.5"/><circle cx="${ex + 1}" cy="${ey + 1.5}" r="4" fill="${ink}"/><circle cx="${ex + 2.4}" cy="${ey - 0.4}" r="1.5" fill="#fff"/>`;
      else if (L.eyes === 'sleepy') front += `<path d="M${ex - 5} ${ey} Q${ex} ${ey + 4.5} ${ex + 5} ${ey}" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      else if (L.eyes === 'angry') front += `<circle cx="${ex}" cy="${ey + 1}" r="4" fill="${ink}"/><circle cx="${ex + 1.3}" cy="${ey - 0.3}" r="1.3" fill="#fff"/><path d="M${ex - 6 * s * -1} ${ey - 9} L${ex + 6 * s * -1} ${ey - 5}" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
      else front += `<circle cx="${ex}" cy="${ey}" r="3.8" fill="${ink}"/><circle cx="${ex + 1.2}" cy="${ey - 1.2}" r="1.3" fill="#fff"/>`;
      front += `<ellipse cx="${cx + s * (edx + 7)}" cy="${ey + 9}" rx="4.5" ry="2.6" fill="#FF7A8A" opacity=".45"/>`;
    }
    front += `<path d="M${cx - 4} ${ey + 8} Q${cx} ${ey + 12} ${cx + 4} ${ey + 8}" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (L.gem) front += `<path d="M${cx} ${ey - 16} l5 6 l-5 6 l-5 -6z" fill="${L.gem}" stroke="${edge}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${cx - 1.5} ${ey - 12} l1.5 -2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  const shadow = `<ellipse cx="${cx}" cy="${bot + 7}" rx="${w * 0.85}" ry="4.5" fill="#000" opacity=".13"/>`;
  const flip = opt.flip ? ` transform="translate(120 0) scale(-1 1)"` : '';
  const label = opt.label === false ? 'aria-hidden="true"' : `role="img" aria-label="${esc(sil ? 'Unknown Numling' : sp.name)}"`;
  return `<svg class="art${sil ? ' sil' + (opt.faint ? ' faint' : '') : ''}" viewBox="-8 -6 136 126" ${label}><g${flip}>${sil ? '' : shadow}${back}${body}${front}</g></svg>`;
}
