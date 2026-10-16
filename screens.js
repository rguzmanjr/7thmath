/* Numlings: router, navigation, title, new game, and the zone list */
'use strict';
/* ========================= router ========================= */
let screen = 'title', ctx = {};
const HUB = ['explore', 'quests', 'team', 'codex', 'train', 'save'];
const NAV_ON = [...HUB, 'map', 'dungeon'];
function go(s, c = {}) { screen = s; ctx = c; render(); window.scrollTo(0, 0); }
function render() {
  const app = $('#app');
  const fn = { title: renderTitle, newgame: renderNewGame, explore: renderExplore, map: renderMap, quests: renderQuests, encounter: renderEncounter, battle: renderBattle, trial: renderTrial, dungeon: renderDungeon,
               team: renderTeam, codex: renderCodex, train: renderTrain, save: renderSave }[screen];
  app.innerHTML = fn();
  renderNav();
  if (screen === 'map') setupMap();
}
const ICONS = {
  quests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6"/><path d="M6 3a2 2 0 0 0-2 2v1h4V5a2 2 0 0 0-2-2zM6 21a2 2 0 0 1-2-2v-1h4v1a2 2 0 0 1-2 2"/><path d="M10 9h5M10 13h5"/></svg>',
  explore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="15" rx="7" ry="6"/><circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/><path d="M7 10L6 4l4 4M17 10l1-6-4 4"/></svg>',
  codex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6M9 12h4"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/></svg>',
};
function renderNav() {
  const nav = $('#nav');
  if (!NAV_ON.includes(screen) || (screen === 'dungeon' && ctx.phase === 'run')) { nav.hidden = true; return; }
  const cur = screen === 'map' || screen === 'dungeon' ? 'explore' : screen;
  nav.hidden = false;
  nav.innerHTML = HUB.map(s => `<button data-act="nav" data-to="${s}" ${s === cur ? 'aria-current="page"' : ''}>${ICONS[s]}<span>${tx(UI['nav_' + s])}</span></button>`).join('');
}
const openZones = () => Object.keys(ZONES).filter(z => CONFIG.zones[z]);
const storageBanner = () => storageOK ? '' : `<div class="banner">${bi(L('<b>This browser isn’t saving your game automatically.</b> Before you close this page, go to Save and copy your save code.', '<b>Este navegador no está guardando tu juego automáticamente.</b> Antes de cerrar esta página, ve a Guardar y copia tu código.'))}</div>`;

/* ========================= title ========================= */
function renderTitle() {
  const saved = loadLocal();
  const pts = [[1, -4, 1], [2, 3, 2], [3, 1, -2]]; // [species, x, y] on a plane from x = -6..6, y = -3..3
  const plots = pts.map(([n, x, y]) => [n, `${(x + 6) / 12 * 100}%`, `${(3 - y) / 6 * 100}%`, `(${num(x)}, ${num(y)})`]);
  return `<section class="title">
    <h1 class="logo" aria-label="Numlings">${'Numlings'.split('').map(ch => `<span aria-hidden="true">${ch}</span>`).join('')}</h1>
    <p class="tagline">${bi(UI.tagline)}</p>
    <div class="plane" aria-hidden="true"><div class="ticks x"></div><div class="ticks y"></div><div class="ax x"></div><div class="ax y"></div>
      ${plots.map(([n, x, y, lab]) => `<figure class="plot bob" style="left:${x};top:${y}">${art(n, { label: false })}<figcaption>${lab}</figcaption></figure>`).join('')}
    </div>
    <div class="title-actions">
      ${saved ? `<button class="btn primary" data-act="continue">${t('continueAs')} ${esc(saved.trainer)}</button>` : ''}
      <button class="btn ${saved ? '' : 'primary'}" data-act="to-new">${t('newGame')}</button>
      <button class="btn" data-act="load-code-title">${t('haveCode')}</button>
    </div>
    <div class="title-lang"><span class="small muted">Language / Idioma</span>${langSwitch()}</div>
    ${storageOK ? '' : '<p class="small muted" style="max-width:40ch">This browser won’t save automatically. You’ll get a save code to keep your progress.</p>'}
  </section>`;
}

/* ========================= new game ========================= */
function renderNewGame() {
  const pickN = ctx.starter || 0;
  const T = (en, es) => bi(L(en, es));
  return `<button class="btn ghost back" data-act="to-title">${tx(L('Back', 'Atrás'))}</button>
  <div class="t-bar" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2>${tx(L('Start your codex', 'Empieza tu códex'))}</h2>${langSwitch()}</div>
  <div class="stack" style="margin-top:16px">
    <div class="field"><label for="tname">${T('Trainer nickname', 'Apodo de entrenador')}</label>
      <input id="tname" class="text-in" maxlength="16" autocomplete="off" value="${esc(ctx.name || '')}" placeholder="${tx(L('Like Captain Pi', 'Como Capitán Pi'))}">
      <span class="small muted">${T('Use a nickname, not your real name. Letters, numbers, and spaces only.', 'Usa un apodo, no tu nombre real. Solo letras, números y espacios.')}</span></div>
    <div><h3 style="margin-bottom:10px">${T('Choose your first Numling', 'Escoge tu primer Numling')}</h3>
      <div class="starters">${[1, 2, 3].map(n => {
        const s = SP[n];
        return `<button class="starter" data-act="pick-starter" data-n="${n}" aria-pressed="${pickN === n}">
          <div class="art-wrap bob">${art(n)}</div>
          <h3>${s.name}</h3><div class="chips" style="justify-content:center;margin:4px 0">${typeChip(s.type)}</div>
          <p class="small muted">${s.note}</p></button>`;
      }).join('')}</div></div>
    <div><h3 style="margin-bottom:10px">${T('Pick your cap', 'Escoge tu gorra')}</h3>
      <div class="choice-row">${CAP_COLORS.map((c, i) => `<button class="cap-pick" data-act="pick-cap" data-c="${i}" aria-pressed="${(ctx.cap || 0) === i}" aria-label="Cap color ${i + 1}" style="--cap:${c}"><span></span></button>`).join('')}</div></div>
    <p class="small muted">${T('Types matter in battle: Blaze beats Grove, Grove beats Volt, Volt beats Tide, and Tide beats Blaze.', 'Los tipos importan en combate: Blaze vence a Grove, Grove vence a Volt, Volt vence a Tide y Tide vence a Blaze.')}</p>
    <div><button class="btn primary" data-act="start-game">${tx(L('Start', 'Empezar'))}</button></div>
  </div>`;
}

/* ========================= explore ========================= */
function renderExplore() {
  const ld = lead();
  return `${storageBanner()}
  <button class="btn ghost back" data-act="to-town">Back to Origin Town</button>
  <div class="page-head"><h2>World map</h2>
    <div class="lead-mini"><span class="mini">${artC(ld, { label: false })}</span>Lead: ${SP[ld.n].name}, level ${ld.lv}</div></div>
  <div class="zones">${Object.entries(ZONES).map(([id, z]) => {
    const open = CONFIG.zones[id];
    const pool = BASE_SPECIES.filter(s => s.zone === id), got = pool.filter(s => G.caught.has(s.n)).length;
    return `<button class="zone" style="--c:${z.color}" data-act="enter-zone" data-zone="${id}" ${open ? '' : 'disabled'}>
      <span class="band"></span>
      <span><h3>${z.name}</h3><span class="muted">${z.skill}</span>
        <span class="meta"><span>TEKS ${z.teks}</span><span>Catch levels ${z.levels[0]}–${z.levels[1]}</span><span>${got} of ${pool.length} caught</span><span>${TRAINERS[id].filter(t => G.trainerWins.has(t.id)).length} of ${TRAINERS[id].length} trainers beaten</span>${G.badges.has(id) ? '<span class="badge-tag">Champion badge earned. The Legendary is roaming!</span>' : CONFIG.encounters.legendaryNeedsBadge ? '<span>Beat the Champion to unlock this zone’s Legendary</span>' : ''}</span></span>
      <span class="go">${!open ? 'Opens soon' : W && W.zone === id ? 'Continue' : 'Explore'}</span></button>`;
  }).join('')}</div>
  <h3 class="dg-head">Dungeons</h3>
  <button class="zone dungeon-card" style="--c:#2B2440" data-act="dungeon-open">
    <span class="band"></span>
    <span><h3>The Dungeon of Multiplia</h3><span class="muted">Multiplication facts against the clock. Easy gives you 7 seconds per fact, Hard and Chaos give you 5.</span>
      <span class="meta"><span class="crest-row">${['easy', 'hard', 'chaos'].map(d => crestSVG(d, G.dungeon[d].clears > 0)).join('')}</span>${G.dungeon.taur ? '<span>Multitaur earned</span>' : '<span>Clear Chaos to earn the Multitaur</span>'}</span></span>
    <span class="go">Enter</span></button>`;
}
function rollWild(zone, minR = 1, weightsBy = CONFIG.encounters.weights) {
  const E = CONFIG.encounters;
  const legendaryOpen = !E.legendaryNeedsBadge || G.badges.has(zone);
  let pool = SPECIES.filter(s => s.zone === zone && s.r >= minR && !s.evolved && (s.r < 5 || legendaryOpen) && (weightsBy[s.r] || 0) > 0);
  if (!pool.length) pool = SPECIES.filter(s => s.zone === zone && !s.evolved && s.r === 3);
  const counts = {}; pool.forEach(s => (counts[s.r] = (counts[s.r] || 0) + 1));
  const weights = pool.map(s => (weightsBy[s.r] || 0) / counts[s.r]);
  let x = Math.random() * weights.reduce((a, b) => a + b, 0), sp = pool[0];
  for (let i = 0; i < pool.length; i++) { x -= weights[i]; if (x <= 0) { sp = pool[i]; break; } }
  const [lo, hi] = ZONES[zone].levels;
  return { n: sp.n, lv: Math.min(50, ri(lo, hi) + (sp.r >= 4 ? 2 : 0)), spot: [0, 0], shiny: Math.random() < E.shinyChance };
}
function enterZone(zone) {
  if (!W || W.zone !== zone) initWorld(zone);
  go('map');
}
