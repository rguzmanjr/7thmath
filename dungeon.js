/* Numlings: the Dungeon of Multiplia */
'use strict';
/* =========================================================================
   DUNGEON OF MULTIPLIA. Multiplication facts against the clock.
   Easy: the 2–12 chart, 7 s. Hard: the toughest chart facts, 5 s. Chaos: 13s–16s, 5 s.
   Each floor's guardian has perFloor HP; every correct fact is a hit. Misses and timeouts cost a heart.
   Answers check themselves as soon as enough digits are typed.
   ========================================================================= */
const DG = {
  easy: { label: 'Easy', crest: 'Bronze', color: '#C98B4E', blurb: 'Every fact on the 2–12 multiplication chart.' },
  hard: { label: 'Hard', crest: 'Silver', color: '#9FB0C8', blurb: 'The toughest chart facts: 6s, 7s, 8s, 9s and 12s.' },
  chaos: { label: 'Chaos', crest: 'Gold', color: '#F2B731', blurb: 'The 13s, 14s, 15s and 16s. Mental math only.' },
};
function dgFact(diff, floor, used) {
  const last = floor === CONFIG.dungeons.multiplia.floors;
  for (let tries = 0; tries < 40; tries++) {
    let a, b;
    if (diff === 'easy') { a = ri(2, 12); b = ri(2, 12); }
    else if (diff === 'hard') { const tough = [6, 7, 8, 9, 12]; a = pick(tough); b = Math.random() < 0.7 ? pick([...tough, 11]) : ri(3, 12); }
    else { a = ri(13, 16); b = last && Math.random() < 0.35 ? ri(13, 16) : ri(last ? 6 : 2, 12); }
    if (Math.random() < 0.5) [a, b] = [b, a];
    const key = Math.min(a, b) + 'x' + Math.max(a, b);
    if (used.has(key) && tries < 39) continue;
    used.add(key); return { a, b, ans: a * b };
  }
}
const heartSVG = on => `<svg viewBox="0 0 14 12" class="heart ${on ? 'on' : ''}" aria-hidden="true"><path d="M2 0h3v1h1v1h2V1h1V0h3v1h1v1h1v4h-1v1h-1v1h-1v1h-1v1H9v1H8v1H6v-1H5v-1H4V9H3V8H2V7H1V6H0V2h1V1h1z"/></svg>`;
const fmtSec = s => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s} s`);
function crestSVG(diff, earned) {
  const c = DG[diff].color;
  return `<svg viewBox="0 0 40 46" class="crest ${earned ? 'on' : ''}" aria-hidden="true"><path d="M20 2 L37 8 V22 C37 33 29 40 20 44 C11 40 3 33 3 22 V8Z" fill="${earned ? c : 'none'}" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
    <path d="M13 15 L27 29 M27 15 L13 29" stroke="${earned ? '#1B2848' : 'currentColor'}" stroke-width="4" stroke-linecap="round"/></svg>`;
}
function renderDungeon() {
  const D = CONFIG.dungeons.multiplia, rec = G.dungeon;
  if (ctx.phase === 'run') return dungeonFrame();
  if (ctx.phase === 'result') return dungeonResult();
  const rows = Object.entries(DG).map(([k, d]) => { const r = rec[k];
    return `<button class="dg-mode ${ctx.diff === k ? 'sel' : ''}" data-act="dg-diff" data-d="${k}" aria-pressed="${ctx.diff === k}">
      <span class="crest-wrap">${crestSVG(k, r.clears > 0)}</span>
      <span><b>${d.label}</b><span class="small">${D.seconds[k]} seconds per fact. ${d.blurb}</span>
      <span class="small dg-rec">${r.clears ? `${d.crest} crest earned. Fastest clear ${fmtSec(r.fastest)}. Best streak ${r.streak}.` : r.best ? `Best run: ${r.best} of ${D.floors * D.perFloor} facts.` : 'Not attempted yet.'}</span></span></button>`; }).join('');
  if (!ctx.diff) ctx.diff = 'easy';
  return `<div class="dungeon-lobby"><button class="btn ghost back" data-act="nav" data-to="explore">Back to zones</button>
    <div class="dg-hero">${torch()}<div><h2>The Dungeon of Multiplia</h2>
      <p>Multiplication facts against the clock. Each of the ${D.floors} floors has a guardian with ${D.perFloor} HP, and every correct fact is a hit. You have ${D.hearts} hearts for the whole run. A wrong answer or running out of time costs one.</p>
      <p class="small">No Enter key needed. Your answer checks itself as soon as you type it. The Multitaur waits on floor ${D.floors}.</p>
      <p class="small">After every clear, one of the dungeon’s Numlings blocks the exit. One of them is rare. A perfect run, with no misses, can summon a shiny.</p></div>${torch()}</div>
    <div class="dg-modes">${rows}</div>
    <div class="btn-row"><button class="btn primary" data-act="dg-start">Enter on ${DG[ctx.diff].label}</button></div>
    ${rec.taur ? '' : `<p class="small muted">Clear Chaos and the Multitaur will join your team.</p>`}</div>`;
}
const torch = () => `<span class="torch" aria-hidden="true"><i></i></span>`;
function dungeonFrame() {
  const r = ctx.run, D = CONFIG.dungeons.multiplia, isCatch = r.mode === 'catch';
  const title = isCatch ? `Catch ${r.shiny ? 'the shiny ' : ''}${SP[r.guard].name}: ${r.secs} seconds per fact` : `Floor ${r.floor} of ${r.floors}${r.floor === r.floors ? ': the Multitaur' : ''}`;
  return `<div class="dungeon-run${isCatch ? ' catching' : ''}">
    <div class="dg-top">
      <span class="dg-floor">${title}</span>
      <span class="dg-hearts" aria-label="${r.hearts} hearts left">${Array.from({ length: r.maxHearts }, (_, i) => heartSVG(i < r.hearts)).join('')}</span>
      <span class="dg-streak" id="dg-streak">${r.streak >= 3 ? `Streak ${r.streak}` : ''}</span>
    </div>
    <div class="dg-hall">${torch()}
      <div class="dg-guard ${isCatch ? 'resident' : r.floor === r.floors ? 'boss' : 'shade'}" id="dg-guard">${art(r.guard, { label: false, faceLeft: true, shiny: r.shiny })}
        <div class="dg-hp${isCatch ? ' catch' : ''}" id="dg-hp">${Array.from({ length: r.perFloor }, (_, i) => `<i class="${i < r.perFloor - r.hits ? 'on' : ''}"></i>`).join('')}</div></div>
      ${torch()}</div>
    <div class="dg-fact" id="dg-fact" aria-live="polite">${r.fact ? `${r.fact.a} × ${r.fact.b}` : ''}</div>
    <div class="dg-timer"><i id="dg-bar"></i></div>
    <input class="dg-input" id="dg-input" inputmode="${isTouchOnly() ? 'none' : 'numeric'}" autocomplete="off" aria-label="Your answer" maxlength="3">
    <div class="dg-flash" id="dg-flash" aria-live="assertive"></div>
    <div class="keypad dg-pad${isTouchOnly() ? ' show' : ''}">${['7', '8', '9', '4', '5', '6', '1', '2', '3', 'back', '0'].map(k => `<button type="button" data-dk="${k}" aria-label="${k === 'back' ? 'Delete' : k}">${k === 'back' ? '⌫' : k}</button>`).join('')}</div>
    <div class="btn-row"><button class="btn ghost" data-act="dg-quit">Leave the dungeon</button></div>
  </div>`;
}
function dungeonResult() {
  const r = ctx.run, D = CONFIG.dungeons.multiplia, total = D.floors * D.perFloor;
  const answered = r.correct + r.misses, acc = answered ? Math.round(r.correct / answered * 100) : 0;
  const avg = r.correct ? (r.timeSum / r.correct / 1000).toFixed(1) : '0.0';
  return `<div class="dungeon-lobby"><div class="dg-hero">${torch()}<div>
    <h2>${r.cleared ? `${DG[r.diff].label} cleared!` : r.quit ? 'You left the dungeon.' : `Defeated on floor ${r.floor}.`}</h2>
    ${r.cleared ? `<p><b>${DG[r.diff].crest} crest${r.firstClear ? ' earned' : ''}!</b> ${r.misses === 0 ? `<b>Perfect run!</b> All ${total} facts with no misses.` : `You answered ${total} facts with only ${r.misses} miss${r.misses === 1 ? '' : 'es'}.`}</p>` : `<p>${r.correct} of ${total} facts. ${r.quit ? '' : 'Every run makes you faster. Try again!'}</p>`}
    </div>${torch()}</div>
    <div class="card-stats dg-stats">
      <div><b>${r.correct}</b>facts right</div><div><b>${acc}%</b>accuracy</div><div><b>${r.bestStreak}</b>best streak</div>
      <div><b>${avg} s</b>average per fact</div>${r.cleared ? `<div><b>${fmtSec(Math.round(r.elapsed / 1000))}</b>clear time</div>` : ''}</div>
    ${r.records.length ? `<p class="dg-new">New personal best: ${r.records.join(', ')}.</p>` : ''}
    ${r.rewards.map(x => `<p>${x}</p>`).join('')}
    ${ctx.catchMsg ? `<p class="dg-catchmsg">${ctx.catchMsg}</p>` : ''}
    ${dgEncounterPanel()}
    <div class="btn-row"><button class="btn ${ctx.queue && ctx.queue.length ? '' : 'primary'}" data-act="dg-start">Run it again</button><button class="btn" data-act="dg-lobby">Change difficulty</button><button class="btn ghost" data-act="nav" data-to="explore">Back to zones</button></div></div>`;
}
function dgEncounterPanel() {
  const q = ctx.queue && ctx.queue[0]; if (!q) return '';
  const D = CONFIG.dungeons.multiplia, sp = SP[q.n], secs = q.shiny ? D.shinySeconds : D.seconds[ctx.diff];
  const owned = G.caught.has(q.n);
  return `<div class="dg-encounter${q.shiny ? ' shiny-scene' : ''}">
    <div class="dg-enc-art bob">${art(q.n, { shiny: q.shiny, faceLeft: true })}</div>
    <div><p class="result-msg">${q.shiny ? `✦ A shiny ${sp.name} appeared!` : `A ${sp.name} blocks the exit!`}</p>
      <div class="chips">${typeChip(sp.type)}${q.shiny ? shinyChip : ''}${rarityTag(sp.r)}${owned ? '<span class="small">Already in your codex</span>' : '<span class="small">New!</span>'}</div>
      <p class="small">${q.shiny ? `Your perfect run summoned a shiny. It’s fast, so you only get ${secs} seconds per fact. Answer ${D.catchFacts} facts to catch it.` : `To catch it, answer ${D.catchFacts} facts with ${secs} seconds each.`} ${D.catchMisses + 1} misses and it escapes. It joins you at level ${D.catchLevel[ctx.diff]}.</p>
      <div class="btn-row"><button class="btn primary" data-act="dg-catch">Catch it</button><button class="btn ghost" data-act="dg-letgo">Let it go</button></div></div></div>`;
}
let dgTimer = null;
function dgGuard(floor) {
  const D = CONFIG.dungeons.multiplia;
  if (floor === D.floors) return 68;
  return pick(BASE_SPECIES.filter(s => s.zone !== 'dungeon' && s.r <= 4)).n;
}
function startDungeon() {
  const D = CONFIG.dungeons.multiplia, diff = ctx.diff || 'easy';
  ctx = { phase: 'run', diff, run: { mode: 'run', diff, floor: 1, floors: D.floors, perFloor: D.perFloor, maxHearts: D.hearts, secs: D.seconds[diff],
    hits: 0, hearts: D.hearts, streak: 0, bestStreak: 0, correct: 0, misses: 0, timeSum: 0,
    used: new Set(), start: performance.now(), guard: dgGuard(1), fact: null, busy: false } };
  screen = 'dungeon'; render(); window.scrollTo(0, 0);
  dgNext();
}
function dgNext() {
  const r = ctx.run, D = CONFIG.dungeons.multiplia; if (!r || ctx.phase !== 'run') return;
  r.fact = dgFact(r.diff, r.mode === 'catch' ? 1 : r.floor, r.used); r.busy = false;
  const f = $('#dg-fact'), inp = $('#dg-input'); if (!f || !inp) return;
  f.textContent = `${r.fact.a} × ${r.fact.b}`; f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop');
  inp.value = ''; if (!isTouchOnly()) inp.focus();
  const secs = r.secs, t0 = performance.now(), bar = $('#dg-bar'), token = r.fact;
  r.factStart = t0;
  cancelAnimationFrame(dgTimer);
  const tick = () => {
    if (ctx.phase !== 'run' || ctx.run !== r || r.fact !== token || r.busy) return;
    const left = Math.max(0, 1 - (performance.now() - t0) / (secs * 1000));
    bar.style.width = (left * 100) + '%'; bar.classList.toggle('low', left < 0.3);
    if (left <= 0) { dgAnswer(null); return; }
    dgTimer = requestAnimationFrame(tick);
  };
  dgTimer = requestAnimationFrame(tick);
}
function dgInput() {
  const r = ctx.run; if (!r || r.busy || !r.fact) return;
  const inp = $('#dg-input'), v = inp.value.replace(/\D/g, ''); inp.value = v;
  const want = String(r.fact.ans);
  if (v === want) dgAnswer(true);
  else if (v.length >= want.length) dgAnswer(false);
}
async function dgAnswer(ok) {
  const r = ctx.run, D = CONFIG.dungeons.multiplia; if (!r || r.busy) return;
  r.busy = true; cancelAnimationFrame(dgTimer);
  const here = ctx, flash = $('#dg-flash'), guard = $('#dg-guard');
  if (ok) {
    r.correct++; r.hits++; r.streak++; r.bestStreak = Math.max(r.bestStreak, r.streak); r.timeSum += performance.now() - r.factStart;
    const pips = $('#dg-hp').children; if (pips[r.perFloor - r.hits]) pips[r.perFloor - r.hits].classList.remove('on');
    guard.classList.remove('hit'); void guard.offsetWidth; guard.classList.add('hit');
    $('#dg-streak').textContent = r.streak >= 3 ? `Streak ${r.streak}` : '';
    flash.className = 'dg-flash good'; flash.textContent = r.streak >= 5 && r.streak % 5 === 0 ? `${r.streak} in a row!` : 'Hit!';
    await sleep(260);
  } else {
    r.misses++; r.hearts--; r.streak = 0;
    $('#dg-streak').textContent = '';
    const hearts = document.querySelectorAll('.dg-hearts .heart'); if (hearts[r.hearts]) hearts[r.hearts].classList.remove('on');
    const run = $('.dungeon-run'); run.classList.remove('hurt'); void run.offsetWidth; run.classList.add('hurt');
    flash.className = 'dg-flash bad'; flash.textContent = `${ok === null ? 'Too slow! ' : ''}${r.fact.a} × ${r.fact.b} = ${r.fact.ans}`;
    await sleep(1300);
  }
  if (ctx !== here) return;
  flash.textContent = ''; flash.className = 'dg-flash';
  if (r.mode === 'catch') {
    if (r.hearts <= 0) { dgCatchEnd(false); return; }
    if (r.hits >= r.perFloor) { dgCatchEnd(true); return; }
    dgNext(); return;
  }
  if (r.hearts <= 0) { dgEnd(false); return; }
  if (r.hits >= r.perFloor) {
    if (r.floor >= r.floors) { dgEnd(true); return; }
    r.floor++; r.hits = 0; r.guard = dgGuard(r.floor); r.fact = null;
    render();
    const f = $('#dg-fact'); f.textContent = r.floor === r.floors ? 'The Multitaur appears!' : `Floor ${r.floor}`; f.classList.add('banner');
    await sleep(1100); if (ctx !== here) return;
    f.classList.remove('banner');
  }
  dgNext();
}
function dgEnd(cleared, quit = false) {
  cancelAnimationFrame(dgTimer);
  const r = ctx.run, D = CONFIG.dungeons.multiplia, rec = G.dungeon[r.diff];
  r.cleared = cleared; r.quit = quit; r.elapsed = performance.now() - r.start; r.records = []; r.rewards = [];
  const avgT = r.correct ? Math.round(r.timeSum / r.correct / 100) : 0;
  if (r.correct > rec.best) { if (rec.best) r.records.push('most facts'); rec.best = r.correct; }
  if (r.bestStreak > rec.streak) { if (rec.streak) r.records.push('longest streak'); rec.streak = r.bestStreak; }
  if (cleared) {
    const secs = Math.round(r.elapsed / 1000);
    r.firstClear = rec.clears === 0; rec.clears++;
    if (!rec.fastest || secs < rec.fastest) { if (rec.fastest) r.records.push('fastest clear'); rec.fastest = secs; }
    if (avgT && (!rec.avg || avgT < rec.avg)) { if (rec.avg) r.records.push('fastest average'); rec.avg = avgT; }
    if (r.diff === 'chaos' && !G.dungeon.taur) {
      G.dungeon.taur = 1;
      const c = addToCollection(68, 30);
      r.rewards.push(`<b>The Multitaur bows to you and joins your ${G.party.includes(c.uid) ? 'team' : 'collection'}!</b> Only trainers who clear Chaos can earn it.`);
    }
  }
  const ld = lead(), xp = r.correct * (r.diff === 'chaos' ? 4 : r.diff === 'hard' ? 3 : 2) + (cleared ? { easy: 40, hard: 70, chaos: 120 }[r.diff] : 0);
  if (ld && xp) { const ups = addXp(ld, xp); r.rewards.push(`${SP[ld.n].name} earned ${xp} XP.${ups.length ? ` It reached level ${ld.lv}!` : ''}${evoReady(ld, ups)}`); }
  // Dungeon residents: one blocks the exit after every clear; perfect runs may summon a shiny too.
  ctx.queue = [];
  if (cleared) {
    ctx.queue.push({ n: dgRollResident(), shiny: false });
    if (r.misses === 0 && Math.random() < D.shinyChance) ctx.queue.push({ n: dgRollResident(), shiny: true });
    ctx.queue.forEach(q => G.seen.add(q.n));
  }
  ctx.catchMsg = null; ctx.main = r;
  questRefresh(); save();
  ctx.phase = 'result'; render(); window.scrollTo(0, 0);
}
function dgRollResident() { const D = CONFIG.dungeons.multiplia; return Math.random() < D.rareChance ? D.rare : pick(D.monsters); }
function startDgCatch() {
  const D = CONFIG.dungeons.multiplia, q = ctx.queue && ctx.queue[0]; if (!q) return;
  const diff = ctx.diff, secs = q.shiny ? D.shinySeconds : D.seconds[diff];
  ctx.phase = 'run';
  ctx.run = { mode: 'catch', diff, shiny: q.shiny, guard: q.n, floor: 1, floors: 1, perFloor: D.catchFacts, maxHearts: D.catchMisses + 1, secs,
    hits: 0, hearts: D.catchMisses + 1, streak: 0, bestStreak: 0, correct: 0, misses: 0, timeSum: 0, used: new Set(), start: performance.now(), fact: null, busy: false };
  render(); window.scrollTo(0, 0); dgNext();
}
function dgCatchEnd(ok) {
  cancelAnimationFrame(dgTimer);
  const D = CONFIG.dungeons.multiplia, cr = ctx.run, q = ctx.queue.shift(), sp = SP[q.n];
  if (ok) {
    if (G.creatures.length >= CONFIG.boxLimit) ctx.catchMsg = `You caught ${sp.name}, but your collection is full. Release a Numling in Team to make room next time.`;
    else {
      const c = addToCollection(q.n, D.catchLevel[cr.diff], q.shiny); G.stats.caught++; questEvent('catch', { zone: 'dungeon', n: q.n });
      ctx.catchMsg = `<b>${q.shiny ? '✦ The shiny ' : ''}${sp.name} joined your ${G.party.includes(c.uid) ? 'team' : 'collection'}!</b>${sp.n === D.rare ? ' That’s the rare one. Only about 1 clear in 10 brings it out.' : ''}`;
    }
  } else ctx.catchMsg = `${q.shiny ? 'The shiny ' : ''}${sp.name} slipped away into the dark. Clear the dungeon again for another chance.`;
  ctx.run = ctx.main; ctx.phase = 'result'; save(); render(); window.scrollTo(0, 0);
}
document.addEventListener('input', e => { if (e.target.id === 'dg-input') dgInput(); });
document.addEventListener('click', e => {
  const k = e.target.closest('[data-dk]'); if (!k || screen !== 'dungeon') return;
  const inp = $('#dg-input'); if (!inp) return;
  inp.value = k.dataset.dk === 'back' ? inp.value.slice(0, -1) : inp.value + k.dataset.dk;
  dgInput(); if (!isTouchOnly()) inp.focus();
});
