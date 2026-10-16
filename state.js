/* Numlings: game state, XP and levels, save codes, and browser saving */
'use strict';
/* ========================= game state ========================= */
let G = null; // the save
const STORE_KEY = 'numlings-save-v1';
const storageOK = (() => { try { localStorage.setItem('__nl', '1'); localStorage.removeItem('__nl'); return true; } catch (e) { return false; } })();

function freshState(name) {
  return { trainer: name, cap: 0, created: Date.now(), creatures: [], party: [], seen: new Set(), caught: new Set(),
    stats: { answered: 0, correct: 0, topics: { rational: [0, 0], proportion: [0, 0] }, won: 0, caught: 0, trials: [0, 0] }, nextUid: 1,
    badges: new Set(), trainerWins: new Set(), shinies: new Set(), sparkleUsed: {},
    dungeon: { easy: dgBlank(), hard: dgBlank(), chaos: dgBlank(), taur: 0 }, skills: {},
    quests: {}, tracked: null, daily: null, titles: new Set(), title: '', caps: new Set(), capColor: '' };
}
// Dungeon records per difficulty: best facts in one run, clears, fastest clear (seconds), best streak, best average (tenths of a second)
function dgBlank() { return { best: 0, clears: 0, fastest: 0, streak: 0, avg: 0 }; }
function newCreature(n, lv, shiny) { const c = { uid: G.nextUid++, n, lv, xp: 0 }; if (shiny) c.shiny = true; return c; }
const byUid = uid => G.creatures.find(c => c.uid === uid);
const lead = () => byUid(G.party[0]);
const xpNext = lv => 10 + lv * 6;
// The strongest Numling on the team sets the difficulty of every battle.
const teamLevel = () => Math.max(1, ...G.party.map(byUid).filter(Boolean).map(c => c.lv));
// Opponent level = team level boosted by the multiplier. The boost ramps in over levels 1–15 so brand-new
// players aren't swamped, then applies in full. Never below the opponent's own listed level; capped at 50.
function scaledLevel(base, mult, add = 0) {
  const L = teamLevel();
  return Math.min(50, Math.max(base, Math.round(L + (mult - 1) * L * Math.min(1, L / 15) + add)));
}
function stats(c) {
  const sp = SP[c.n], b = sp.base, L = c.lv, m = sp.stage === 3 ? 1.3 : sp.stage === 2 ? 1.15 : 1; // evolved forms get +15%, final forms +30% on every stat
  return { hp: Math.round((Math.floor(b[0] * 2 * L / 100) + 2 * L + 24) * m), atk: Math.round((Math.floor(b[1] * 2 * L / 100) + 5) * m),
           def: Math.round((Math.floor(b[2] * 2 * L / 100) + 5) * m), spd: Math.round((Math.floor(b[3] * 2 * L / 100) + 5) * m) };
}
function addXp(c, amount) {
  const ups = [];
  c.xp += amount;
  while (c.lv < 50 && c.xp >= xpNext(c.lv)) { c.xp -= xpNext(c.lv); c.lv++; ups.push(c.lv); }
  if (c.lv >= 50) c.xp = 0;
  return ups;
}
// Text to add after a level-up message when a Numling just reached its evolution level.
function evoReady(c, ups) {
  const sp = SP[c.n];
  if (!sp.evo || !ups || !ups.length || c.lv < sp.evoLv || c.lv - ups.length >= sp.evoLv) return '';
  return ` ${sp.name} is ready for its evolution trial! Find it in Team.`;
}
// Spanish version of the same message, for screens that show both languages
function evoReadyEs(c, ups) { return evoReady(c, ups) ? ` ¡${SP[c.n].name} está listo para su prueba de evolución! Búscalo en Equipo.` : ''; }
const canEvolve = c => !!SP[c.n].evo && c.lv >= SP[c.n].evoLv;
/* ---------- skill mastery ----------
   Each skill keeps: a = attempts, c = right on the first try, h = right with a hint,
   r = the last 12 results as a string (2 = first try, 1 = with a hint, 0 = missed).
   Mastery is the average of the recent results, where a hinted answer counts half. */
function recordAnswer(topic, result, skill) {
  const ok = result === true || result === 'correct' || result === 'assisted';
  const s = G.stats; s.answered++; if (ok) s.correct++;
  if (!s.topics[topic]) s.topics[topic] = [0, 0];
  s.topics[topic][0]++; if (ok) s.topics[topic][1]++;
  if (skill) {
    const k = G.skills[skill] || (G.skills[skill] = { a: 0, c: 0, h: 0, r: '' });
    k.a++; if (result === 'correct' || result === true) k.c++; else if (result === 'assisted') k.h++;
    k.r = (k.r + (result === 'correct' || result === true ? '2' : result === 'assisted' ? '1' : '0')).slice(-12);
  }
  if (typeof questEvent === 'function') questEvent('solve', { topic, skill, ok, result });
}
function skillMastery(id) {
  const k = G && G.skills && G.skills[id]; if (!k || !k.r) return null;
  const rec = k.r.slice(-10); let sum = 0;
  for (const ch of rec) sum += ch === '2' ? 1 : ch === '1' ? 0.5 : 0;
  return sum / rec.length;
}
function skillStatus(id) {
  const k = G.skills[id], m = skillMastery(id);
  if (m == null) return { label: 'Not tried yet', cls: 'new', m: 0 };
  if (k.r.length < 4) return { label: 'Getting started', cls: 'start', m };
  if (m >= 0.8 && k.r.length >= 5) return { label: 'Mastered', cls: 'mastered', m };
  if (m >= 0.5) return { label: 'Practicing', cls: 'practicing', m };
  return { label: 'Learning', cls: 'learning', m };
}
// The tier a student is ready for in a topic: they move up once the tier below is solid.
function workingTier(topic) {
  const A = CONFIG.adaptive; let t = 1;
  while (t < 3) {
    const tried = skillsFor(topic, t).filter(s => G.skills[s.id]);
    const attempts = tried.reduce((n, s) => n + G.skills[s.id].r.length, 0);
    const avg = tried.length ? tried.reduce((n, s) => n + skillMastery(s.id), 0) / tried.length : 0;
    if (attempts >= A.minAttempts && avg >= A.promoteAt) t++; else break;
  }
  if (t > 1) { // step back down if the current tier is going badly
    const tried = skillsFor(topic, t).filter(s => G.skills[s.id]);
    const recent = tried.reduce((n, s) => n + Math.min(10, G.skills[s.id].r.length), 0);
    const avg = tried.length ? tried.reduce((n, s) => n + skillMastery(s.id), 0) / tried.length : 1;
    if (recent >= A.minAttempts && avg < A.demoteAt) t--;
  }
  return t;
}
// Mostly the working tier, with an occasional review question (a tier down) or stretch question (a tier up).
function adaptiveTier(topic, bump = 0) {
  const A = CONFIG.adaptive, base = workingTier(topic), r = Math.random();
  let t = base;
  if (r < A.review && base > 1) t = base - 1; else if (r < A.review + A.stretch && base < 3) t = base + 1;
  return Math.max(1, Math.min(3, t + bump));
}
const solved = r => r === 'correct' || r === 'assisted';
function addToCollection(n, lv, shiny = false) {
  const c = newCreature(n, lv, shiny);
  G.creatures.push(c);
  G.seen.add(n); G.caught.add(n); if (shiny) G.shinies.add(n);
  if (G.party.length < CONFIG.partySize) G.party.push(c.uid);
  return c;
}

/* ---------- save codes ----------
   Format: NL1.<check>.<payload>. The payload is base64url JSON; the check is a hash with a salt.
   The check stops casual editing of codes. It is not real security. */
function toB64(str) {
  const bytes = new TextEncoder().encode(str); let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  const bin = atob(s); return new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));
}
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36).padStart(7, '0');
}
const B32 = '0123456789abcdefghijklmnopqrstuv';
function setToStr(set) {
  let bits = ''; for (let n = 1; n <= MAX_DEX; n++) bits += set.has(n) ? '1' : '0';
  while (bits.length % 5) bits += '0';
  let out = ''; for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}
function strToSet(str) {
  const set = new Set(); let bits = '';
  for (const ch of String(str)) { const v = B32.indexOf(ch); if (v < 0) throw new Error('bad set'); bits += v.toString(2).padStart(5, '0'); }
  for (let i = 0; i < bits.length; i++) if (bits[i] === '1' && SP[i + 1]) set.add(i + 1);
  return set;
}
function encodeSave(st) {
  const idx = new Map(st.creatures.map((c, i) => [c.uid, i]));
  const s = st.stats;
  const o = { v: 1, t: st.trainer, k: st.cap || 0, d: Math.floor(st.created / 1000),
    c: st.creatures.map(c => (c.shiny ? [c.n, c.lv, c.xp, 1] : [c.n, c.lv, c.xp])), p: st.party.map(u => idx.get(u)),
    se: setToStr(st.seen), ca: setToStr(st.caught), b: [...st.badges], tw: [...st.trainerWins], sh: setToStr(st.shinies),
    lp: Math.floor((st.lastPlayed || Date.now()) / 1000),
    tp: Object.fromEntries(Object.entries(st.stats.topics || {}).filter(([t]) => t !== 'rational' && t !== 'proportion')),
    q: Object.fromEntries(Object.entries(st.quests || {}).map(([id, v]) => [id, [{ active: 1, ready: 2, done: 3 }[v.st] || 1, v.s || 0, v.p || 0, (v.o || []).join('')]])),
    qt: st.tracked || 0, qd: st.daily ? [st.daily.day, { offered: 0, active: 1, done: 3 }[st.daily.st] || 0, st.daily.s || 0, st.daily.p || 0] : 0,
    ti: [...(st.titles || [])], tt: st.title || '', cp: [...(st.caps || [])], cc: st.capColor || '',
    sk: Object.fromEntries(Object.entries(st.skills || {}).map(([id, k]) => [id, [k.a, k.c, k.h, k.r]])),
    dg: ['easy', 'hard', 'chaos'].map(d => { const r = st.dungeon[d]; return [r.best, r.clears, r.fastest, r.streak, r.avg]; }).concat([[st.dungeon.taur]]),
    sp: Object.fromEntries(Object.entries(st.sparkleUsed || {}).map(([z, ts]) => [z, ts.map(t => Math.floor(t / 1000))])),
    st: [s.answered, s.correct, s.topics.rational[0], s.topics.rational[1], s.topics.proportion[0], s.topics.proportion[1], s.won, s.caught, s.trials[0], s.trials[1]] };
  const payload = toB64(JSON.stringify(o));
  return `NL1.${hash(CONFIG.saveSalt + payload)}.${payload}`;
}
function decodeSave(code) {
  code = String(code).replace(/\s+/g, '');
  const parts = code.split('.');
  if (parts.length !== 3 || parts[0] !== 'NL1') throw new Error('That doesn’t look like a Numlings save code. Codes start with NL1.');
  if (hash(CONFIG.saveSalt + parts[2]) !== parts[1]) throw new Error('This code was changed or copied incompletely. Copy the whole code and try again.');
  let o; try { o = JSON.parse(fromB64(parts[2])); } catch (e) { throw new Error('This code is damaged. Copy the whole code and try again.'); }
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  if (o.v !== 1 || typeof o.t !== 'string' || !Array.isArray(o.c) || !o.c.length || o.c.length > CONFIG.boxLimit + 5) throw new Error('This code is damaged.');
  const st = freshState(o.t.slice(0, 16));
  st.created = int(o.d, 0, 1e11) ? o.d * 1000 : Date.now();
  st.cap = int(o.k, 0, 9) ? o.k : 0;
  for (const c of o.c) {
    if (!Array.isArray(c) || !SP[c[0]] || !int(c[1], 1, 50) || !int(c[2], 0, 10000)) throw new Error('This code is damaged.');
    const rec = { uid: st.nextUid++, n: c[0], lv: c[1], xp: c[2] }; if (c[3] === 1) rec.shiny = true;
    st.creatures.push(rec);
  }
  const party = [];
  for (const i of Array.isArray(o.p) ? o.p : []) if (int(i, 0, st.creatures.length - 1) && !party.includes(st.creatures[i].uid) && party.length < CONFIG.partySize) party.push(st.creatures[i].uid);
  st.party = party.length ? party : [st.creatures[0].uid];
  st.seen = strToSet(o.se || ''); st.caught = strToSet(o.ca || '');
  st.creatures.forEach(c => { st.caught.add(c.n); st.seen.add(c.n); });
  st.caught.forEach(n => st.seen.add(n));
  const zoneIds = Object.keys(ZONES), trainerIds = allTrainerIds();
  st.badges = new Set((Array.isArray(o.b) ? o.b : []).filter(z => zoneIds.includes(z)));
  st.trainerWins = new Set((Array.isArray(o.tw) ? o.tw : []).filter(t => trainerIds.includes(t)));
  st.shinies = strToSet(o.sh || ''); st.creatures.forEach(c => { if (c.shiny) st.shinies.add(c.n); });
  st.lastPlayed = int(o.lp, 0, 1e11) ? o.lp * 1000 : 0;
  const QIDS = typeof QUESTS !== 'undefined' ? QUESTS.map(q => q.id) : [];
  st.quests = {};
  if (o.q && typeof o.q === 'object') for (const [id, v] of Object.entries(o.q)) {
    if (!QIDS.includes(id) || !Array.isArray(v)) continue;
    st.quests[id] = { st: { 1: 'active', 2: 'ready', 3: 'done' }[v[0]] || 'active', s: int(v[1], 0, 50) ? v[1] : 0, p: int(v[2], 0, 1e5) ? v[2] : 0,
      o: typeof v[3] === 'string' ? [...v[3]].map(Number).filter(n => n >= 0 && n < 10) : [] };
  }
  st.tracked = (typeof o.qt === 'string' && (QIDS.includes(o.qt) || o.qt === 'daily')) ? o.qt : null;
  st.daily = Array.isArray(o.qd) && typeof o.qd[0] === 'string' ? { day: o.qd[0].slice(0, 12), st: { 0: 'offered', 1: 'active', 3: 'done' }[o.qd[1]] || 'offered', s: int(o.qd[2], 0, 5) ? o.qd[2] : 0, p: int(o.qd[3], 0, 1e5) ? o.qd[3] : 0 } : null;
  const clean = (a, max) => (Array.isArray(a) ? a.filter(x => typeof x === 'string').map(x => x.slice(0, max)) : []);
  st.titles = new Set(clean(o.ti, 40)); st.title = typeof o.tt === 'string' && st.titles.has(o.tt) ? o.tt : '';
  st.caps = new Set(clean(o.cp, 7).filter(c => /^#[0-9a-f]{6}$/i.test(c)));
  st.capColor = typeof o.cc === 'string' && /^#[0-9a-f]{6}$/i.test(o.cc) ? o.cc : '';
  st.skills = {};
  if (o.sk && typeof o.sk === 'object') for (const [id, v] of Object.entries(o.sk)) {
    if (!SKILL[id] || !Array.isArray(v)) continue;
    const r = typeof v[3] === 'string' ? v[3].replace(/[^012]/g, '').slice(-12) : '';
    st.skills[id] = { a: int(v[0], 0, 1e6) ? v[0] : 0, c: int(v[1], 0, 1e6) ? v[1] : 0, h: int(v[2], 0, 1e6) ? v[2] : 0, r };
  }
  st.dungeon = { easy: dgBlank(), hard: dgBlank(), chaos: dgBlank(), taur: 0 };
  if (Array.isArray(o.dg)) ['easy', 'hard', 'chaos'].forEach((d, i) => { const a = Array.isArray(o.dg[i]) ? o.dg[i] : []; const v = k => (int(a[k], 0, 1e6) ? a[k] : 0);
    st.dungeon[d] = { best: v(0), clears: v(1), fastest: v(2), streak: v(3), avg: v(4) }; });
  if (Array.isArray(o.dg) && Array.isArray(o.dg[3]) && o.dg[3][0] === 1) st.dungeon.taur = 1;
  st.sparkleUsed = {};
  if (o.sp && typeof o.sp === 'object') for (const z of zoneIds) if (Array.isArray(o.sp[z])) st.sparkleUsed[z] = o.sp[z].filter(t => int(t, 0, 1e11)).slice(-10).map(t => t * 1000);
  const a = Array.isArray(o.st) ? o.st.map(v => (int(v, 0, 1e7) ? v : 0)) : [];
  st.stats = { answered: a[0] || 0, correct: a[1] || 0, topics: { rational: [a[2] || 0, a[3] || 0], proportion: [a[4] || 0, a[5] || 0] }, won: a[6] || 0, caught: a[7] || 0, trials: [a[8] || 0, a[9] || 0] };
  if (o.tp && typeof o.tp === 'object') for (const [t, v] of Object.entries(o.tp)) if (Array.isArray(v) && int(v[0], 0, 1e7) && int(v[1], 0, 1e7)) st.stats.topics[t] = [v[0], v[1]];
  return st;
}
let lastSaveOK = storageOK;
function save() {
  if (!G || !storageOK) return;
  G.lastPlayed = Date.now();
  try { localStorage.setItem(STORE_KEY, encodeSave(G)); lastSaveOK = true; } catch (e) { lastSaveOK = false; }
}
function loadLocal() {
  if (!storageOK) return null;
  try { const code = localStorage.getItem(STORE_KEY); return code ? decodeSave(code) : null; } catch (e) { return null; }
}
