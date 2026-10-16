/* Numlings: the explorable map: drawing, movement, encounters, chests, caches, trainers */
'use strict';
const WALKABLE = new Set(['.', ',', '"', 'f', '=', 'H', 'E']);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const STEP_MS = 150;
// Sparkles come back on a real-time clock that's saved, so leaving and re-entering a zone doesn't reset them.
function sparklesAvailable(zone) {
  const S = CONFIG.encounters.sparkles, now = Date.now();
  const used = (G.sparkleUsed[zone] || []).filter(t => now - t < S.refreshMinutes * 60000 && t <= now);
  G.sparkleUsed[zone] = used;
  return Math.max(0, S.count - used.length);
}
function nextSparkleMinutes(zone) {
  const S = CONFIG.encounters.sparkles, used = G.sparkleUsed[zone] || [];
  if (!used.length) return 0;
  return Math.max(1, Math.ceil((Math.min(...used) + S.refreshMinutes * 60000 - Date.now()) / 60000));
}

let W = null; // the current zone visit (not saved; leaving a zone ends the visit)

function initWorld(zone, spawn = null) {
  const rows = MAPS[zone];
  const grid = rows.map(r => r.split(''));
  let sx = 1, sy = 1;
  grid.forEach((row, y) => row.forEach((ch, x) => { if (ch === '@') { sx = x; sy = y; grid[y][x] = '.'; } }));
  if (spawn) [sx, sy] = spawn;
  for (const npc of Object.values(NPCS)) if (npc.map === zone) grid[npc.y][npc.x] = 'V';
  const w = grid[0].length, h = grid.length;
  W = { zone, grid, w, h, ox: Math.floor(w / 2), oy: Math.floor(h / 2), x: sx, y: sy, fx: sx - 1, fy: sy, dir: 'down', fdir: 1,
        opened: new Set(), sparkles: new Set(), quest: null, cool: 3, moving: false, busy: false, path: null, t: 40, cachesFound: 0 };
  if (!WALKABLE.has(grid[W.fy]?.[W.fx])) { W.fx = sx; W.fy = sy; }
  W.kind = MAP_META[zone] ? MAP_META[zone].kind : 'zone';
  placeSparkles(sparklesAvailable(zone));
  newQuest();
  questEvent('visit', { map: zone });
}
const npcAtXY = (x, y) => Object.keys(NPCS).find(id => NPCS[id].map === W.zone && NPCS[id].x === x && NPCS[id].y === y);
// Town travel
function enterTown(opts = {}) {
  const gate = opts.from && MAP_META.town.gates[opts.from];
  initWorld('town', gate ? gate.spawn : null);
  go('map');
  if (!qState('welcome')) setTimeout(() => { if (screen === 'map' && W && W.zone === 'town' && !qState('welcome')) npcTalk('axis'); }, 700);
}
const exploreNav = () => (W ? go('map') : enterTown());
function useGate(x, y) {
  const zone = Object.keys(MAP_META.town.gates).find(z => { const g = MAP_META.town.gates[z].at; return g[0] === x && g[1] === y; });
  if (!zone) return;
  if (!CONFIG.zones[zone]) { say(L(`The gate to ${mapName(zone)} is closed for now. Check back soon!`, `La puerta a ${mapName(zone)} está cerrada por ahora. ¡Vuelve pronto!`)); return; }
  W.busy = true; $('#vp').classList.add('flashing');
  setTimeout(() => { W.busy = false; initWorld(zone); go('map'); toast(tx(L(`Welcome to ${mapName(zone)}!`, `¡Bienvenido a ${mapName(zone)}!`))); }, 450);
}
function useDoor(x, y) {
  const b = MAP_META[W.zone] && MAP_META[W.zone].buildings.find(b => b.door[0] === x && b.door[1] === y); if (!b) return;
  toast(tx(L(b.enter, b.enterEs || b.enter)));
  ({ codex: () => go('codex'), train: () => go('train'), save: () => go('save'), worldmap: () => go('explore'),
     dungeon: () => go('dungeon', { phase: 'lobby', diff: 'easy' }) })[b.action]();
}
/* ---------- quest objects (beacons, planks, …) ---------- */
function questObjects() {
  const out = [];
  if (!W) return out;
  for (const [setId, set] of Object.entries(QUEST_OBJECTS)) {
    if (set.zone !== W.zone) continue;
    const q = QUESTS.find(q => q.steps.some(st => st.type === 'objects' && st.set === setId)); if (!q) continue;
    const qs = qState(q.id); if (!qs) continue;
    const idx = q.steps.findIndex(st => st.type === 'objects' && st.set === setId);
    const active = qs.st === 'active' && (qs.s || 0) === idx;
    set.spots.forEach(([x, y], i) => out.push({ setId, set, i, x, y, q, qs, active, lit: !active || (qs.o || []).includes(i) }));
  }
  return out;
}
const questObjAt = (x, y) => questObjects().find(o => o.x === x && o.y === y);
function questObjSVG(o) {
  if (o.set.kind === 'scale') return `<svg viewBox="0 0 32 40" aria-hidden="true"><ellipse cx="16" cy="37" rx="11" ry="2.6" fill="#000" opacity=".18"/>
    ${o.lit ? '<circle cx="16" cy="14" r="13" fill="#8FD5F2" opacity=".35"/>' : ''}
    <path d="M10 36 L16 18 L22 36Z" fill="#9C9A94" stroke="#1B2848" stroke-width="1.6"/>
    <g transform="rotate(${o.lit ? 0 : -18} 16 16)"><path d="M3 16 H29" stroke="#6B6A66" stroke-width="3" stroke-linecap="round"/>
      <path d="M2 22 Q6 27 10 22Z M22 22 Q26 27 30 22Z" fill="#C9C6BC" stroke="#1B2848" stroke-width="1.3"/><path d="M6 16 L2 22 M6 16 L10 22 M26 16 L22 22 M26 16 L30 22" stroke="#1B2848" stroke-width="1"/></g>
    <circle cx="16" cy="16" r="2.6" fill="${o.lit ? '#FFD43B' : '#4A4F75'}" stroke="#1B2848" stroke-width="1.2"/>
    ${o.lit ? '' : '<text x="16" y="8" text-anchor="middle" font-size="9" font-weight="700" font-family="Lexend, sans-serif" fill="#E5533A">!</text>'}</svg>`;
  if (o.set.kind === 'beacon') return `<svg viewBox="0 0 32 40" aria-hidden="true"><ellipse cx="16" cy="37" rx="10" ry="2.6" fill="#000" opacity=".18"/>
    ${o.lit ? '<circle cx="16" cy="10" r="11" fill="#FFE27A" opacity=".45"/>' : ''}
    <path d="M9 36 L11 18 H21 L23 36Z" fill="#B8BEC9" stroke="#1B2848" stroke-width="1.6"/><rect x="9" y="15" width="14" height="4" rx="1" fill="#8E96A3" stroke="#1B2848" stroke-width="1.4"/>
    <path d="M16 3 L21 10 L16 16 L11 10Z" fill="${o.lit ? '#FFD43B' : '#4A4F75'}" stroke="#1B2848" stroke-width="1.5"/>${o.lit ? '<path d="M13 9 l2 -3" stroke="#fff" stroke-width="1.5"/>' : ''}</svg>`;
  return `<svg viewBox="0 0 32 32" aria-hidden="true">${o.lit ? '<rect x="3" y="11" width="26" height="10" rx="2" fill="#C08A52" stroke="#6B4421" stroke-width="1.6"/><circle cx="7" cy="16" r="1.3" fill="#6B4421"/><circle cx="25" cy="16" r="1.3" fill="#6B4421"/>'
    : '<path d="M3 12 h10 l2 4 l-2 5 H3Z" fill="#C08A52" stroke="#6B4421" stroke-width="1.6"/><path d="M29 12 h-9 l-1 5 l2 4 h8Z" fill="#A87442" stroke="#6B4421" stroke-width="1.6"/>'}
    ${o.lit ? '' : '<text x="16" y="9" text-anchor="middle" font-size="9" font-weight="700" font-family="Lexend, sans-serif" fill="#E5533A">!</text>'}</svg>`;
}
async function useQuestObject(o) {
  const doneL = L(o.set.done, o.set.doneEs || o.set.done);
  if (o.lit) { say(doneL); return; }
  W.busy = true; held.length = 0; W.path = null;
  const topic = ZONES[o.set.zone].topic;
  const res = await askQuestion({ topic, tier: adaptiveTier(topic), theme: W.zone, autoMs: 1200,
    title: { beacon: L('Relight the beacon', 'Vuelve a encender el faro'), plank: L('Fix the plank', 'Repara la tabla'), scale: L('Balance the scale', 'Equilibra la balanza') }[o.set.kind] || L('Solve the lock', 'Resuelve el candado'),
    sub: L(o.set.prompt, o.set.promptEs || o.set.prompt) });
  if (W) W.busy = false;
  if (solved(res)) {
    o.qs.o = [...(o.qs.o || []), o.i]; save();
    const left = o.set.spots.length - o.qs.o.length;
    questRefresh(); drawFx(); burst(o.x, o.y, 'glint');
    say(L(`${doneL.en} ${left ? `${left} more to go.` : 'That was the last one!'}`, `${doneL.es} ${left ? `Te faltan ${left}.` : '¡Era el último!'}`));
  } else say(L('Not quite. Give it another try when you’re ready.', 'Todavía no. Inténtalo otra vez cuando estés listo.'));
}
// Redraw the map (markers over townspeople, quest objects, the quest box) after quest changes.
function refreshMapQuests() { if (screen === 'map' && W) render(); }
const T = (x, y) => (W.grid[y] ? W.grid[y][x] : undefined);
const isWalk = (x, y) => x >= 0 && y >= 0 && x < W.w && y < W.h && WALKABLE.has(T(x, y));
const coordOf = (x, y) => [x - W.ox, W.oy - y];
const fmtPt = (x, y) => { const [a, b] = coordOf(x, y); return `(${num(a)}, ${num(b)})`; };
function tilesWhere(fn) { const out = []; W.grid.forEach((row, y) => row.forEach((ch, x) => { if (fn(ch, x, y)) out.push([x, y]); })); return out; }
function placeSparkles(n) {
  const grass = tilesWhere(ch => ch === '"').filter(([x, y]) => Math.abs(x - W.x) + Math.abs(y - W.y) > 4 && !W.sparkles.has(x + ',' + y));
  while (W.sparkles.size < n && grass.length) W.sparkles.add(grass.splice(ri(0, grass.length - 1), 1)[0].join(','));
}
function newQuest() {
  const spots = tilesWhere((ch, x, y) => WALKABLE.has(ch) && ch !== 'E' && Math.abs(x - W.x) + Math.abs(y - W.y) >= 7 && !(x === W.ox && y === W.oy));
  const [x, y] = pick(spots);
  W.quest = { x, y };
}

function trainerAtXY(x, y) {
  const ch = T(x, y);
  if (ch === 'K') return CHAMPIONS[W.zone];
  if (ch !== 'N') return null;
  const i = tilesWhere(c => c === 'N').findIndex(([a, b]) => a === x && b === y);
  return TRAINERS[W.zone][i] || null;
}
// Trainers' Numlings show up already evolved (even to final forms) once they fight at or above each evolution level.
const trainerTeam = tr => tr.team.map(([n, lv]) => { const ld = scaledLevel(lv, tr.mult, tr.add); while (SP[n].evo && ld >= SP[n].evoLv) n = SP[n].evo; return { n, lv: ld }; });

/* ---------- terrain art ---------- */
function hashXY(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; }
function mapSVG() {
  const P = TILE_THEME[W.zone], S = 32, ink = '#1B2848';
  let base = '', tall = '', chests = '';
  const isWater = (x, y) => ['~', '=', 'H', 'o'].includes(T(x, y));
  for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) {
    const ch = T(x, y), X = x * S, Y = y * S, r = hashXY(x, y);
    const rect = c => `<rect x="${X}" y="${Y}" width="${S}" height="${S}" fill="${c}"/>`;
    if (isWater(x, y)) {
      base += rect(P.water);
      for (const [dx, dy, d] of [[0, -1, `M${X} ${Y + 1.5}h${S}`], [0, 1, `M${X} ${Y + S - 1.5}h${S}`], [-1, 0, `M${X + 1.5} ${Y}v${S}`], [1, 0, `M${X + S - 1.5} ${Y}v${S}`]])
        if (T(x + dx, y + dy) !== undefined && !isWater(x + dx, y + dy)) base += `<path d="${d}" stroke="${P.foam}" stroke-width="3"/>`;
      if (W.zone === 'rapids') { if (r % 2 === 0) base += `<path class="rapid" d="M${X + 6 + r % 12} ${Y + 4 + (r >> 3) % 8} l3 12" stroke="${P.foam}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`; }
      else if (r % 3 === 0) base += `<path class="wave" d="M${X + 5} ${Y + 10 + r % 12} q4 -3.5 8 0 t8 0" stroke="${P.foam}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else if (ch === ',') {
      base += rect(P.short);
      if (r % 2) base += `<circle cx="${X + 6 + r % 20}" cy="${Y + 8 + (r >> 4) % 18}" r="1.6" fill="${P.short2}"/>`;
      base += `<circle cx="${X + 20 - r % 9}" cy="${Y + 24 - (r >> 5) % 9}" r="1.3" fill="${P.short2}"/>`;
    } else if (ch === '"') {
      base += rect(P.tall);
      for (const [bx, by] of [[5, 14], [15, 26], [24, 12], [9, 30], [27, 28]]) {
        const ax = X + bx + (r % 3) - 1, ay = Y + by;
        base += `<path d="M${ax - 4} ${ay} l2 -9 l2 9 m0 0 l2.5 -7 l1.5 7" fill="${P.blade}" stroke="${P.blade}" stroke-width="1.2" stroke-linejoin="round"/>`;
      }
    } else {
      base += rect(P.ground);
      if (r % 3 === 0) base += `<circle cx="${X + 5 + r % 22}" cy="${Y + 6 + (r >> 4) % 20}" r="1.4" fill="${P.speck}"/>`;
      if (r % 5 === 0) base += `<circle cx="${X + 26 - r % 13}" cy="${Y + 26 - (r >> 6) % 14}" r="1.1" fill="${P.speck}"/>`;
    }
    // features drawn on top of the base tile
    if (ch === '=') {
      base += `<rect x="${X}" y="${Y + 6}" width="${S}" height="20" fill="#C08A52"/>` + [0, 6, 12, 18, 24, 30].map(i => `<path d="M${X + i + 2} ${Y + 6}v20" stroke="#8C5A2E" stroke-width="1.4"/>`).join('') +
        `<path d="M${X} ${Y + 6}h${S}M${X} ${Y + 26}h${S}" stroke="#6B4421" stroke-width="2"/>`;
    } else if (ch === 'H') {
      base += `<rect x="${X + 6}" y="${Y}" width="20" height="${S}" fill="#C08A52"/>` + [0, 6, 12, 18, 24, 30].map(i => `<path d="M${X + 6} ${Y + i + 2}h20" stroke="#8C5A2E" stroke-width="1.4"/>`).join('') +
        `<path d="M${X + 6} ${Y}v${S}M${X + 26} ${Y}v${S}" stroke="#6B4421" stroke-width="2"/>`;
    } else if (ch === 'f') {
      for (const [fx, fy, c] of [[8, 10, '#FF7A9C'], [22, 14, '#FFD43B'], [13, 24, '#FFFFFF'], [25, 26, '#FF7A9C']])
        base += `<circle cx="${X + fx}" cy="${Y + fy}" r="3.2" fill="${c}" stroke="${ink}" stroke-width=".6"/><circle cx="${X + fx}" cy="${Y + fy}" r="1" fill="#E58A00"/>`;
    } else if (ch === 'R') {
      tall += `<ellipse cx="${X + 16}" cy="${Y + 28}" rx="13" ry="3" fill="#000" opacity=".15"/><path d="M${X + 4} ${Y + 27} Q${X + 3} ${Y + 12} ${X + 14} ${Y + 8} Q${X + 26} ${Y + 6} ${X + 29} ${Y + 20} Q${X + 30} ${Y + 28} ${X + 4} ${Y + 27}Z" fill="${P.rock}" stroke="#5E6670" stroke-width="1.6"/><path d="M${X + 11} ${Y + 13} q4 -3 8 -1" stroke="#fff" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>`;
    } else if (ch === 'P' || ch === 'T') {
      if (P.tree === 'round') {
        const g1 = r % 2 ? '#3E9650' : '#459B57';
        tall += `<ellipse cx="${X + 16}" cy="${Y + 30}" rx="11" ry="2.6" fill="#000" opacity=".15"/><rect x="${X + 13.5}" y="${Y + 18}" width="5" height="12" rx="1.5" fill="#7A4A23" stroke="#4A2C14" stroke-width="1"/>` +
          `<circle cx="${X + 16}" cy="${Y + 9}" r="13" fill="${g1}" stroke="#1C5428" stroke-width="1.5"/><circle cx="${X + 11}" cy="${Y + 5}" r="5" fill="#6DBE7B" opacity=".8"/>`;
      } else if (P.tree === 'palm') {
        tall += `<ellipse cx="${X + 16}" cy="${Y + 29}" rx="10" ry="2.6" fill="#000" opacity=".15"/><path d="M${X + 15} ${Y + 30} Q${X + 13} ${Y + 16} ${X + 18} ${Y + 4}" stroke="#8C5A2E" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
          [[-14, -2, -25], [14, -3, 25], [-10, 6, -55], [11, 6, 55], [0, -9, 0]].map(([dx, dy, rot]) => `<ellipse cx="${X + 18 + dx * 0.55}" cy="${Y + 4 + dy * 0.55}" rx="9" ry="3.6" transform="rotate(${rot} ${X + 18 + dx * 0.55} ${Y + 4 + dy * 0.55})" fill="#3FA34D" stroke="#246E34" stroke-width="1.2"/>`).join('') +
          `<circle cx="${X + 16}" cy="${Y + 7}" r="2.4" fill="#7A4A23"/><circle cx="${X + 20}" cy="${Y + 7}" r="2.4" fill="#7A4A23"/>`;
      } else {
        const g1 = r % 2 ? '#2E7D3E' : '#357F45', g2 = r % 2 ? '#3E9650' : '#459B57';
        tall += `<ellipse cx="${X + 16}" cy="${Y + 30}" rx="11" ry="2.6" fill="#000" opacity=".15"/><rect x="${X + 14}" y="${Y + 23}" width="4" height="7" fill="#7A4A23"/>` +
          `<path d="M${X + 16} ${Y - 10} L${X + 29} ${Y + 25} L${X + 3} ${Y + 25} Z" fill="${g1}" stroke="#1C5428" stroke-width="1.4" stroke-linejoin="round"/>` +
          `<path d="M${X + 16} ${Y - 10} L${X + 24} ${Y + 10} L${X + 8} ${Y + 10} Z" fill="${g2}"/>`;
      }
    } else if (ch === 'S') {
      tall += `<rect x="${X + 14}" y="${Y + 14}" width="4" height="16" fill="#7A4A23"/><rect x="${X + 4}" y="${Y + 5}" width="24" height="13" rx="2" fill="#D19A62" stroke="#6B4421" stroke-width="1.6"/><path d="M${X + 8} ${Y + 10}h16M${X + 8} ${Y + 14}h11" stroke="#6B4421" stroke-width="1.4"/>`;
    } else if (ch === 'C') {
      const open = W.opened.has(x + ',' + y);
      chests += `<g id="ch-${x}-${y}" class="chest${open ? ' open' : ''}"><ellipse cx="${X + 16}" cy="${Y + 28}" rx="11" ry="2.6" fill="#000" opacity=".15"/>
        <rect x="${X + 6}" y="${Y + 14}" width="20" height="13" rx="2" fill="#A8662F" stroke="#5C3412" stroke-width="1.5"/>
        <rect x="${X + 6}" y="${Y + 18}" width="20" height="3" fill="#F2B731"/>
        <path class="lid" d="M${X + 6} ${Y + 15} v-3 a10 6 0 0 1 20 0 v3 z" fill="#C47A38" stroke="#5C3412" stroke-width="1.5"/>
        <rect x="${X + 14}" y="${Y + 15}" width="4" height="5" rx="1" fill="#F2B731" stroke="#5C3412" stroke-width="1"/></g>`;
    } else if (ch === 'G') {
      const zone = Object.keys(MAP_META.town.gates).find(z => MAP_META.town.gates[z].at[0] === x && MAP_META.town.gates[z].at[1] === y);
      const open = zone && CONFIG.zones[zone];
      tall += `<rect x="${X + 3}" y="${Y - 14}" width="5" height="44" fill="#8C6A3E" stroke="#4A2C14" stroke-width="1.2"/><rect x="${X + 24}" y="${Y - 14}" width="5" height="44" fill="#8C6A3E" stroke="#4A2C14" stroke-width="1.2"/>
        <rect x="${X + 1}" y="${Y - 20}" width="30" height="9" rx="2" fill="${open ? '#FFD43B' : '#9AA3AE'}" stroke="#1B2848" stroke-width="1.4"/>
        <text x="${X + 16}" y="${Y - 13.5}" text-anchor="middle" font-size="6" font-weight="700" font-family="Lexend, sans-serif" fill="#1B2848">${zone ? mapName(zone).split(' ')[0].toUpperCase() : ''}</text>
        ${open ? '' : `<path d="M${X + 8} ${Y + 6}h16M${X + 8} ${Y + 14}h16M${X + 8} ${Y + 22}h16" stroke="#6B4421" stroke-width="3"/>`}`;
    } else if (ch === 'Q') {
      tall += `<rect x="${X + 6}" y="${Y + 18}" width="3" height="12" fill="#6B4421"/><rect x="${X + 23}" y="${Y + 18}" width="3" height="12" fill="#6B4421"/>
        <rect x="${X + 2}" y="${Y + 2}" width="28" height="19" rx="2" fill="#C99560" stroke="#6B4421" stroke-width="1.6"/>
        <rect x="${X + 5}" y="${Y + 5}" width="8" height="10" fill="#FFF8E7" transform="rotate(-6 ${X + 9} ${Y + 10})"/><rect x="${X + 15}" y="${Y + 4}" width="9" height="7" fill="#FFF3B0"/><rect x="${X + 16}" y="${Y + 12}" width="10" height="6" fill="#D8F0FF"/>
        <circle cx="${X + 9}" cy="${Y + 5}" r="1.2" fill="#E5533A"/><circle cx="${X + 19}" cy="${Y + 4}" r="1.2" fill="#E5533A"/>`;
      if (G.daily == null || G.daily.day !== todayKey() || G.daily.st === 'offered') tall += `<g class="alert"><circle cx="${X + 27}" cy="${Y - 2}" r="6.5" fill="#FFD43B" stroke="${ink}" stroke-width="1.4"/><text x="${X + 27}" y="${Y + 2}" text-anchor="middle" font-size="10" font-weight="700" font-family="Lexend, sans-serif" fill="${ink}">!</text></g>`;
    } else if (ch === 'M') {
      tall += `<rect x="${X + 14}" y="${Y + 16}" width="4" height="14" fill="#6B4421"/><rect x="${X + 3}" y="${Y + 3}" width="26" height="16" rx="2" fill="#F6EBD0" stroke="#6B4421" stroke-width="1.6"/>
        <path d="M${X + 6} ${Y + 15} q5 -9 10 -4 t10 -5" stroke="#2168B8" stroke-width="1.8" fill="none"/><circle cx="${X + 11}" cy="${Y + 10}" r="2" fill="#E5533A"/><circle cx="${X + 23}" cy="${Y + 7}" r="2" fill="#22804A"/>`;
    } else if (ch === 'V') {
      const id = npcAtXY(x, y), npc = NPCS[id], mark = npcMarker(id);
      tall += `<svg x="${X}" y="${Y - 4}" width="${S}" height="${S}" viewBox="0 0 32 32" overflow="visible">${trainerInner('down', npc.cap, npc.shirt, false)}</svg>`;
      if (mark) tall += `<g class="alert"><circle cx="${X + 27}" cy="${Y - 2}" r="6.5" fill="${mark === '?' ? '#5BCB88' : '#FFD43B'}" stroke="${ink}" stroke-width="1.4"/><text x="${X + 27}" y="${Y + 2}" text-anchor="middle" font-size="10" font-weight="700" font-family="Lexend, sans-serif" fill="${ink}">${mark}</text></g>`;
    } else if (ch === 'N' || ch === 'K') {
      const tr = trainerAtXY(x, y);
      const fresh = tr && !G.trainerWins.has(tr.id);
      tall += `<svg x="${X}" y="${Y - 4}" width="${S}" height="${S}" viewBox="0 0 32 32" overflow="visible">${trainerInner('down', tr.cap, tr.shirt, tr.champion)}</svg>`;
      if (fresh) tall += `<g class="alert"><circle cx="${X + 27}" cy="${Y - 2}" r="6.5" fill="#FFD43B" stroke="${ink}" stroke-width="1.4"/><text x="${X + 27}" y="${Y + 2}" text-anchor="middle" font-size="10" font-weight="700" font-family="Lexend, sans-serif" fill="${ink}">!</text></g>`;
    } else if (ch === 'E') {
      tall += `<path d="M${X + 8} ${Y + 30} V${Y + 4}" stroke="#6B4421" stroke-width="2.5"/><path d="M${X + 9} ${Y + 5} L${X + 26} ${Y + 10} L${X + 9} ${Y + 15} Z" fill="#FFD43B" stroke="${ink}" stroke-width="1.4"/><text x="${X + 18}" y="${Y + 26}" text-anchor="middle" font-size="7.5" font-weight="700" font-family="Lexend, sans-serif" fill="${ink}">EXIT</text>`;
    }
  }
  if (MAP_META[W.zone] && MAP_META[W.zone].buildings) for (const b of MAP_META[W.zone].buildings) {
    const [x0, y0, x1, y1] = b.rect, X = x0 * S, Y = y0 * S, BW = (x1 - x0 + 1) * S, BH = (y1 - y0 + 1) * S, wallTop = Y + Math.min(BH * 0.38, 40);
    let win = '';
    for (let x = x0; x <= x1; x++) if (x !== b.door[0]) win += `<rect x="${x * S + 9}" y="${Y + BH - 26}" width="14" height="12" rx="2" fill="#BFE3F8" stroke="#1B2848" stroke-width="1.3"/><path d="M${x * S + 16} ${Y + BH - 26}v12" stroke="#1B2848" stroke-width="1"/>`;
    const dx = b.door[0] * S;
    tall += `<rect x="${X + 2}" y="${wallTop}" width="${BW - 4}" height="${Y + BH - wallTop}" fill="${b.wall}" stroke="#1B2848" stroke-width="2"/>${win}
      <path d="M${X - 6} ${wallTop + 6} L${X + 12} ${Y - 6} H${X + BW - 12} L${X + BW + 6} ${wallTop + 6}Z" fill="${b.roof}" stroke="#1B2848" stroke-width="2" stroke-linejoin="round"/>
      <path d="M${X + 4} ${wallTop - 4} H${X + BW - 4}" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
      <rect x="${dx + 7}" y="${Y + BH - 26}" width="18" height="26" rx="3" fill="#7A4A23" stroke="#1B2848" stroke-width="1.6"/><circle cx="${dx + 21}" cy="${Y + BH - 12}" r="1.6" fill="#FFD43B"/>
      <rect x="${X + BW / 2 - b.label.length * 3.4 - 6}" y="${wallTop - 2}" width="${b.label.length * 6.8 + 12}" height="13" rx="3" fill="#FFF8E7" stroke="#1B2848" stroke-width="1.4"/>
      <text x="${X + BW / 2}" y="${wallTop + 8}" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Lexend, sans-serif" fill="#1B2848">${LANG === 'es' && b.labelEs ? b.labelEs : b.label}</text>`;
  }
  if (W.zone === 'town') { const fx = (W.ox + 0.5) * S, fy = (W.oy + 0.5) * S;
    tall += `<circle cx="${fx}" cy="${fy}" r="38" fill="none" stroke="#B8BEC9" stroke-width="7"/><circle cx="${fx}" cy="${fy}" r="38" fill="none" stroke="#1B2848" stroke-width="1.5"/>
      <rect x="${fx - 7}" y="${fy - 20}" width="14" height="26" rx="3" fill="#D5DAE2" stroke="#1B2848" stroke-width="1.5"/><path d="M${fx} ${fy - 20} q-10 -14 -18 2 M${fx} ${fy - 20} q10 -14 18 2" stroke="#9ED8F5" stroke-width="2.5" fill="none" class="wave"/>
      <text x="${fx}" y="${fy + 26}" text-anchor="middle" font-size="9" font-weight="700" font-family="Lexend, sans-serif" fill="#1B2848" paint-order="stroke" stroke="#fff" stroke-width="3">(0, 0)</text>`; }
  // graph paper lines + coordinate axes through the origin
  let grid = '';
  for (let x = 1; x < W.w; x++) grid += `<path d="M${x * S} 0V${W.h * S}"/>`;
  for (let y = 1; y < W.h; y++) grid += `<path d="M0 ${y * S}H${W.w * S}"/>`;
  const ax = (W.ox + 0.5) * S, ay = (W.oy + 0.5) * S;
  let axes = `<path d="M4 ${ay}H${W.w * S - 6}M${ax} ${W.h * S - 4}V6" stroke="${ink}" stroke-width="2.5"/>
    <path d="M${W.w * S - 2} ${ay} l-9 -5 v10z M${ax} 2 l-5 9 h10z" fill="${ink}"/>`;
  for (let x = 0; x < W.w; x++) { const cx = (x + 0.5) * S, v = x - W.ox; axes += `<path d="M${cx} ${ay - 4}v8" stroke="${ink}" stroke-width="2"/>`; if (v && v % 5 === 0) axes += `<text class="axlab" x="${cx}" y="${ay + 17}">${num(v)}</text>`; }
  for (let y = 0; y < W.h; y++) { const cy = (y + 0.5) * S, v = W.oy - y; axes += `<path d="M${ax - 4} ${cy}h8" stroke="${ink}" stroke-width="2"/>`; if (v && v % 5 === 0) axes += `<text class="axlab" x="${ax - 8}" y="${cy + 4}" text-anchor="end">${num(v)}</text>`; }
  axes += `<text class="axlab" x="${ax - 6}" y="${ay + 17}" text-anchor="end">0</text><text class="axlab big" x="${W.w * S - 14}" y="${ay - 10}">x</text><text class="axlab big" x="${ax + 12}" y="18">y</text>`;
  return `<svg class="terrain" viewBox="0 0 ${W.w * S} ${W.h * S}" preserveAspectRatio="none" aria-hidden="true">${base}<g class="gridlines">${grid}</g>${tall}${chests}<g class="axes">${axes}</g></svg>`;
}

function trainerInner(dir, cap, shirt, crown) {
  const ink = '#1B2848', skin = '#C98B5E';
  const side = dir === 'left' || dir === 'right';
  const flip = dir === 'left' ? ' transform="translate(32 0) scale(-1 1)"' : '';
  let face = '';
  if (dir === 'down') face = `<circle cx="13.6" cy="12.6" r="1.2" fill="${ink}"/><circle cx="18.4" cy="12.6" r="1.2" fill="${ink}"/><path d="M14.5 15.3 q1.5 1.2 3 0" stroke="${ink}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  if (side) face = `<circle cx="19.6" cy="12.6" r="1.2" fill="${ink}"/>`;
  const brim = dir === 'down' ? `<ellipse cx="16" cy="10.4" rx="7.4" ry="1.7" fill="${cap}" stroke="${ink}" stroke-width="1"/>`
    : side ? `<path d="M19 9.6 h6.5 a1.4 1.4 0 0 1 0 2.2 H19z" fill="${cap}" stroke="${ink}" stroke-width="1"/>` : '';
  const pack = dir === 'up' ? `<rect x="10.5" y="15.5" width="11" height="9" rx="2.5" fill="#E5533A" stroke="${ink}" stroke-width="1"/>` : side ? `<rect x="7.5" y="16" width="5" height="8" rx="2" fill="#E5533A" stroke="${ink}" stroke-width="1"/>` : '';
  const crownSvg = crown ? `<path d="M10.5 4.6 L12 0.8 L14.2 3.4 L16 0 L17.8 3.4 L20 0.8 L21.5 4.6 Z" fill="#F2B731" stroke="${ink}" stroke-width=".9" stroke-linejoin="round"/>` : '';
  return `<g${flip}>
    <ellipse cx="16" cy="29.5" rx="8" ry="2.2" fill="#000" opacity=".18"/>
    <rect x="12" y="23" width="3.4" height="6" rx="1.2" fill="#2B3A5C"/><rect x="16.6" y="23" width="3.4" height="6" rx="1.2" fill="#2B3A5C"/>
    <rect x="9.5" y="14.5" width="13" height="10.5" rx="4" fill="${shirt}" stroke="${ink}" stroke-width="1.1"/>
    ${pack}
    <circle cx="16" cy="11.5" r="6.3" fill="${skin}" stroke="${ink}" stroke-width="1.1"/>
    <path d="M9.7 10.6 a6.3 6.3 0 0 1 12.6 0 z" fill="${cap}" stroke="${ink}" stroke-width="1.1"/>
    ${brim}${face}${crownSvg}</g>`;
}
function trainerSVG(dir, cap, shirt, crown) {
  return `<svg viewBox="0 0 32 32" class="trainer" aria-hidden="true" style="overflow:visible">${trainerInner(dir, cap || G.capColor || CAP_COLORS[G.cap || 0], shirt || '#2168B8', crown)}</svg>`;
}

/* ---------- map screen ---------- */
function renderMap() {
  const name = mapName(W.zone), town = W.kind === 'town', tl = trackedLine();
  return `<div class="map-top">
    <div><h2>${name}</h2><p class="small muted">${bi(town ? L('Walk into doors, gates, the Quest Board, and people to interact. People with a <b>!</b> have a quest for you, and <b>?</b> means you can turn one in.', 'Camina hacia puertas, entradas, el Tablero de misiones y personas para interactuar. La gente con un <b>!</b> tiene una misión para ti, y <b>?</b> significa que puedes entregar una.')
      : L('Arrow keys or WASD to move, or tap a spot to walk there. Tall grass hides Numlings, and sparkles hide rare ones.', 'Usa las flechas o WASD para moverte, o toca un lugar para caminar hasta ahí. La hierba alta esconde Numlings, y los destellos esconden a los raros.'))}</p></div>
    ${town ? `<button class="btn" data-act="world-map">${t('worldMap')}</button>` : `<button class="btn" data-act="leave-zone">${t('backToTown')}</button>`}</div>
  <div class="hud">
    <div class="hud-box"><span class="small">${tx(UI.youreAt)}</span><b id="hud-pos"></b></div>
    <div class="hud-box quest"><span class="small">${tx(UI.cacheAt)}</span><b id="hud-quest"></b></div>
    ${town ? '' : `<div class="hud-box"><span class="small">${tx(UI.sparkles)}</span><b id="hud-spark"></b></div>`}
    ${tl ? `<button class="hud-box hud-track" data-act="nav" data-to="quests"><span class="small">${tx(UI.quest)}</span><b id="hud-track">${esc(tl)}</b></button>` : ''}
  </div>
  <div class="viewport mt-${W.zone}" id="vp" tabindex="0" aria-label="${name} map. Use the arrow keys to move.">
    <div class="layer" id="layer">${mapSVG()}<div id="fx"></div>
      <div class="actor follower" id="follower"></div><div class="actor player" id="player"></div></div>
    <div class="say" id="say" hidden role="status"><p id="say-text"></p><div class="say-btns" id="say-btns"></div></div>
    <div class="dpad" aria-label="Move">
      <button data-dir="up" aria-label="Up">▲</button><button data-dir="left" aria-label="Left">◀</button>
      <button data-dir="right" aria-label="Right">▶</button><button data-dir="down" aria-label="Down">▼</button></div>
    <div class="flash" aria-hidden="true"></div>
  </div>`;
}
function setupMap() {
  const vp = $('#vp'); if (!vp || !W) return;
  const t = Math.max(32, Math.min(54, Math.floor(vp.clientWidth / 12)));
  W.t = t;
  const layer = $('#layer');
  layer.style.width = W.w * t + 'px'; layer.style.height = W.h * t + 'px';
  vp.style.setProperty('--t', t + 'px');
  const top = vp.getBoundingClientRect().top + window.scrollY;
  const avail = window.innerHeight - (top - window.scrollY) - 96;
  vp.style.height = Math.max(300, Math.min(avail, W.h * t)) + 'px';
  vp.classList.add('no-anim');
  $('#player').innerHTML = trainerSVG(W.dir);
  const ld = lead(); $('#follower').innerHTML = ld ? artC(ld, { label: false, flip: W.fdir > 0 }) : '';
  placeActors(); drawFx(); updateHUD();
  requestAnimationFrame(() => requestAnimationFrame(() => vp.classList.remove('no-anim')));
}
function placeActors() {
  const t = W.t, vp = $('#vp'); if (!vp) return;
  const p = $('#player'), f = $('#follower');
  p.style.transform = `translate(${W.x * t}px, ${W.y * t - t * 0.18}px)`;
  f.style.transform = `translate(${W.fx * t + t * 0.08}px, ${W.fy * t - t * 0.02}px)`;
  p.classList.toggle('in-grass', T(W.x, W.y) === '"');
  f.classList.toggle('in-grass', T(W.fx, W.fy) === '"');
  const vw = vp.clientWidth, vh = vp.clientHeight;
  const cx = Math.max(0, Math.min(W.w * t - vw, W.x * t + t / 2 - vw / 2));
  const cy = Math.max(0, Math.min(W.h * t - vh, W.y * t + t / 2 - vh / 2));
  $('#layer').style.transform = `translate(${-cx}px, ${-cy}px)`;
}
function drawFx() {
  const fx = $('#fx'); if (!fx) return;
  const t = W.t;
  const objs = questObjects().map(o => `<span class="qobj${o.lit ? ' lit' : ''}" style="left:${o.x * t}px;top:${o.y * t - t * 0.25}px;width:${t}px;height:${t * 1.25}px">${questObjSVG(o)}</span>`).join('');
  fx.innerHTML = [...W.sparkles].map(k => { const [x, y] = k.split(',').map(Number);
    return `<span class="sparkle" style="left:${x * t}px;top:${y * t}px"><i></i><i></i><i></i></span>`; }).join('') + objs;
}
function updateHUD() {
  const p = $('#hud-pos'), q = $('#hud-quest'), sk = $('#hud-spark');
  const avail = sparklesAvailable(W.zone);
  if (W.sparkles.size < avail) { placeSparkles(avail); drawFx(); }  // a sparkle came back while you were exploring
  if (sk) sk.textContent = tx(W.sparkles.size ? L(`${W.sparkles.size} on this map`, `${W.sparkles.size} en este mapa`) : L(`Next in ${nextSparkleMinutes(W.zone)} min`, `Otro en ${nextSparkleMinutes(W.zone)} min`));
  const tk = $('#hud-track'); if (tk) { const tl = trackedLine(); if (tl) tk.textContent = tl; }
  if (p) p.textContent = fmtPt(W.x, W.y);
  if (q) q.textContent = W.quest ? fmtPt(W.quest.x, W.quest.y) : tx(UI.noneRightNow);
}
let sayActions = [];
function say(text, actions = null) {
  const box = $('#say'); if (!box) return;
  $('#say-text').innerHTML = bi(isPair(text) ? L(esc(text.en), esc(text.es)) : esc(text));
  sayActions = actions || [{ label: UI.ok, fn: hideSay }];
  const lab = v => (isPair(v) ? (LANG === 'both' && v.en !== v.es ? `${v.en} / ${v.es}` : tx(v)) : v);
  $('#say-btns').innerHTML = sayActions.map((a, i) => `<button class="btn ${a.primary ? 'primary' : ''}" data-say="${i}">${lab(a.label)}</button>`).join('');
  box.hidden = false;
}
const hideSay = () => { const b = $('#say'); if (b) b.hidden = true; };
function burst(x, y, cls) {
  const fx = $('#fx'); if (!fx) return;
  const el = document.createElement('span'); el.className = cls;
  el.style.left = x * W.t + 'px'; el.style.top = y * W.t + 'px';
  fx.appendChild(el); setTimeout(() => el.remove(), 700);
}

/* ---------- movement ---------- */
const held = [];
function setDir(dir) {
  if (W.dir === dir) return;
  W.dir = dir; const p = $('#player'); if (p) p.innerHTML = trainerSVG(dir);
}
function tryStep(dx, dy) {
  if (!W || W.moving || W.busy) return false;
  setDir(dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');
  const nx = W.x + dx, ny = W.y + dy, ch = T(nx, ny);
  if (ch === 'S') { W.path = null; readSign(nx, ny); return false; }
  if (ch === 'C') { W.path = null; openChest(nx, ny); return false; }
  if (ch === 'N' || ch === 'K') { W.path = null; talkTrainer(nx, ny); return false; }
  if (ch === 'V') { W.path = null; npcTalk(npcAtXY(nx, ny)); return false; }
  if (ch === 'D') { W.path = null; useDoor(nx, ny); return false; }
  if (ch === 'G') { W.path = null; useGate(nx, ny); return false; }
  if (ch === 'Q') { W.path = null; openBoard(); return false; }
  if (ch === 'M') { W.path = null; go('explore'); return false; }
  const qo = questObjAt(nx, ny);
  if (qo) { W.path = null; useQuestObject(qo); return false; }
  if (!isWalk(nx, ny)) { W.path = null; const p = $('#player'); p.classList.remove('bonk'); void p.offsetWidth; p.classList.add('bonk'); return false; }
  hideSay();
  if (W.x !== W.fx) { W.fdir = W.x > W.fx ? 1 : -1; const ld = lead(); if (ld) $('#follower').innerHTML = artC(ld, { label: false, flip: W.fdir > 0 }); }
  W.fx = W.x; W.fy = W.y; W.x = nx; W.y = ny; W.moving = true;
  placeActors(); updateHUD();
  setTimeout(() => { if (!W) return; W.moving = false; land(); }, STEP_MS);
  return true;
}
function land() {
  if (screen !== 'map' || !W) return;
  const ch = T(W.x, W.y), key = W.x + ',' + W.y;
  W.cool--;
  if (ch === 'E') { leaveZone(); return; }
  if (W.quest && W.x === W.quest.x && W.y === W.quest.y) { digCache(); return; }
  if (W.sparkles.has(key)) {
    W.sparkles.delete(key); (G.sparkleUsed[W.zone] = G.sparkleUsed[W.zone] || []).push(Date.now()); save();
    drawFx(); updateHUD(); startEncounter(true); return;
  }
  if (ch === '"') {
    burst(W.x, W.y, 'rustle');
    if (W.cool <= 0 && Math.random() < CONFIG.encounters.grassRate) { startEncounter(false); return; }
  }
  pump();
}
function pump() {
  if (!W || W.moving || W.busy || screen !== 'map') return;
  const d = held[held.length - 1];
  if (d) { const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d]; tryStep(dx, dy); return; }
  if (W.path && W.path.length) {
    const [nx, ny] = W.path.shift();
    if (!tryStep(nx - W.x, ny - W.y)) W.path = null;
  }
}
function findPath(tx, ty) {
  const target = T(tx, ty); if (target === undefined) return null;
  const interact = 'SCNKVDGQM'.includes(target) || !!questObjAt(tx, ty);
  const objs = new Set(questObjects().map(o => o.y * W.w + o.x));
  if (!interact && !isWalk(tx, ty)) return null;
  const k = (x, y) => y * W.w + x, prev = new Map([[k(W.x, W.y), null]]), q = [[W.x, W.y]];
  while (q.length) {
    const [x, y] = q.shift(); if (x === tx && y === ty) break;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy, kk = k(nx, ny), isT = nx === tx && ny === ty;
      if (prev.has(kk)) continue;
      if (!((isWalk(nx, ny) && !objs.has(kk)) || (isT && interact))) continue;
      if (T(nx, ny) === 'E' && !isT) continue;
      prev.set(kk, [x, y]); q.push([nx, ny]);
    }
  }
  if (!prev.has(k(tx, ty))) return null;
  const path = []; let cur = [tx, ty];
  while (cur && !(cur[0] === W.x && cur[1] === W.y)) { path.unshift(cur); cur = prev.get(k(cur[0], cur[1])); }
  return path;
}

/* ---------- things on the map ---------- */
function readSign(x, y) {
  const signs = tilesWhere(ch => ch === 'S'), i = signs.findIndex(([a, b]) => a === x && b === y);
  const info = MAP_INFO[W.zone];
  say(info.signs[i] ? L(info.signs[i], (info.signsEs || [])[i] || info.signs[i]) : L('The writing has worn away.', 'Las letras se borraron con el tiempo.'));
}
async function openChest(x, y) {
  const key = x + ',' + y;
  if (W.opened.has(key)) { say(L('This chest is empty. More chests fill up the next time you visit.', 'Este cofre está vacío. Los cofres se vuelven a llenar la próxima vez que vengas.')); return; }
  W.busy = true; held.length = 0;
  const ld = lead(), xp = 12 + ld.lv * 2;
  const res = await askQuestion({ topic: ZONES[W.zone].topic, tier: adaptiveTier(ZONES[W.zone].topic), theme: W.zone, autoMs: 1300, allowSkip: true,
    title: { en: 'Locked chest', es: 'Cofre cerrado' }, sub: { en: `Solve the lock to open it. ${SP[ld.n].name} earns ${xp} XP if you get it.`, es: `Resuelve el candado para abrirlo. ${SP[ld.n].name} gana ${xp} XP si lo logras.` },
    onResult: ok => { if (!ok) return { en: ' The lock stayed shut, but you can try again.', es: ' El candado sigue cerrado, pero puedes intentarlo otra vez.' }; const ups = addXp(ld, xp);
      return { en: ` The chest pops open! ${SP[ld.n].name} earned ${xp} XP.${ups.length ? ` It reached level ${ld.lv}!` : ''}${evoReady(ld, ups)}`,
               es: ` ¡El cofre se abre! ${SP[ld.n].name} ganó ${xp} XP.${ups.length ? ` ¡Llegó al nivel ${ld.lv}!` : ''}${evoReadyEs(ld, ups)}` }; } });
  W.busy = false;
  if (solved(res)) { questEvent('chest', { zone: W.zone }); W.opened.add(key); const g = $(`#ch-${x}-${y}`); if (g) g.classList.add('open'); burst(x, y, 'glint'); save(); }
}
function digCache() {
  const ld = lead(), xp = 10 + ld.lv * 2, spot = fmtPt(W.x, W.y);
  const ups = addXp(ld, xp); W.cachesFound++; save(); questEvent('cache', { zone: W.zone });
  burst(W.x, W.y, 'glint');
  say(L(`You found the math cache at ${spot}! ${SP[ld.n].name} earned ${xp} XP.${ups.length ? ` It reached level ${ld.lv}!` : ''}${evoReady(ld, ups)} A new cache is buried somewhere else.`,
        `¡Encontraste el tesoro matemático en ${spot}! ${SP[ld.n].name} ganó ${xp} XP.${ups.length ? ` ¡Llegó al nivel ${ld.lv}!` : ''}${evoReadyEs(ld, ups)} Hay un nuevo tesoro enterrado en otro lugar.`));
  newQuest(); updateHUD();
}
function talkTrainer(x, y) {
  const tr = trainerAtXY(x, y); if (!tr) return;
  const zname = ZONES[W.zone].name;
  if (tr.champion) {
    const left = TRAINERS[W.zone].filter(t => !G.trainerWins.has(t.id)).length;
    if (left) { say(L(`${tr.name}: Beat every trainer in ${zname} first, then come find me. ${left} to go!`, `${tr.nameEs || tr.name}: Primero vence a todos los entrenadores de ${zname} y luego búscame. ¡Te faltan ${left}!`)); return; }
  }
  const team = trainerTeam(tr), top = Math.max(...team.map(f => f.lv));
  const beaten = G.trainerWins.has(tr.id), line = trL(tr, beaten ? 'again' : 'hi');
  say(L(`${tr.name}: ${line.en} (Team of ${team.length}, up to level ${top})`, `${tr.nameEs || tr.name}: ${line.es} (Equipo de ${team.length}, hasta el nivel ${top})`), [
    { label: UI.battleBang, primary: true, fn: () => startTrainerBattle(tr) },
    { label: UI.notNow, fn: hideSay },
  ]);
}
function startTrainerBattle(tr) {
  hideSay(); W.busy = true; W.path = null; held.length = 0;
  const vp = $('#vp'); vp.classList.add('flashing');
  setTimeout(() => { W.busy = false; startBattle({ zone: W.zone, foes: trainerTeam(tr), trainer: tr }); }, 750);
}
function startEncounter(rare) {
  W.busy = true; W.path = null; held.length = 0;
  const vp = $('#vp'); vp.classList.add('flashing');
  setTimeout(() => {
    const wild = rare ? rollWild(W.zone, 3, CONFIG.encounters.sparkles.weights) : rollWild(W.zone, 1);
    wild.spot = coordOf(W.x, W.y);
    wild.battleLv = scaledLevel(wild.lv, CONFIG.scaling.wild[W.zone], ri(-1, 1) + (SP[wild.n].r >= 4 ? 1 : 0));
    G.seen.add(wild.n); save();
    W.busy = false; W.cool = 4;
    go('encounter', { zone: W.zone, wild, rare, fresh: true });
  }, 750);
}
function leaveZone() {
  const from = W.zone, name = mapName(from);
  held.length = 0; enterTown({ from }); toast(`You left ${name}. Back in Origin Town.`);
}

/* ---------- input ---------- */
const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
document.addEventListener('keydown', e => {
  if (screen !== 'map' || !W || $('#modal-root').children.length) return;
  if (e.target.matches && e.target.matches('input, textarea, select')) return;
  const d = KEYDIR[e.key];
  if (!d) { if ((e.key === 'Enter' || e.key === ' ') && !$('#say').hidden && !e.target.closest('#say')) { e.preventDefault(); (sayActions.find(a => a.primary) || sayActions[0] || { fn: hideSay }).fn(); } return; }
  e.preventDefault(); W.path = null;
  if (!held.includes(d)) held.push(d);
  pump();
});
document.addEventListener('keyup', e => { const d = KEYDIR[e.key]; if (d) { const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); } });
window.addEventListener('blur', () => (held.length = 0));
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.dpad [data-dir]'); if (!b || screen !== 'map' || !W) return;
  e.preventDefault(); W.path = null; hideSay();
  const d = b.dataset.dir; if (!held.includes(d)) held.push(d);
  b.setPointerCapture?.(e.pointerId);
  pump();
});
const releasePad = e => { const b = e.target.closest && e.target.closest('.dpad [data-dir]'); if (b) { const i = held.indexOf(b.dataset.dir); if (i >= 0) held.splice(i, 1); } };
document.addEventListener('pointerup', releasePad);
document.addEventListener('pointercancel', releasePad);
document.addEventListener('click', e => {
  if (screen !== 'map' || !W) return;
  const sb = e.target.closest('[data-say]');
  if (sb) { const a = sayActions[+sb.dataset.say]; if (a) a.fn(); return; }
  const vp = e.target.closest('#vp');
  if (!vp || e.target.closest('.dpad, .say')) return;
  const r = $('#layer').getBoundingClientRect();
  const tx = Math.floor((e.clientX - r.left) / W.t), ty = Math.floor((e.clientY - r.top) / W.t);
  if (W.busy) return;
  const path = findPath(tx, ty);
  if (!path || !path.length) { burst(tx, ty, 'nope'); return; }
  burst(tx, ty, 'target');
  held.length = 0; W.path = path; hideSay(); pump();
});
window.addEventListener('resize', () => { if (screen === 'map' && W) setupMap(); });
