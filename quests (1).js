/* Numlings: the quest engine (progress, events, rewards, townspeople, Quest Board, daily jobs, Quests screen) */
'use strict';
const Q_BY_ID = {}; QUESTS.forEach(q => (Q_BY_ID[q.id] = q));
const qState = id => G.quests[id];
const isDone = id => qState(id) && qState(id).st === 'done';
function questAvailable(q) {
  return !qState(q.id) && (q.requires || []).every(isDone);
}
const questsFrom = npc => QUESTS.filter(q => q.giver === npc);
// bilingual text helpers for quest data
const qTitle = q => L(q.title, q.titleEs || q.title);
const stepL = st => L(st.text, st.textEs || st.text);
const npcL = id => (id === 'board' ? L('the Quest Board', 'el Tablero de misiones') : L(NPCS[id].name, NPCS[id].nameEs || NPCS[id].name));
function npcMarker(npc) {
  const mine = questsFrom(npc);
  if (mine.some(q => qState(q.id) && qState(q.id).st === 'ready')) return '?';
  if (mine.some(questAvailable)) return '!';
  return '';
}

/* ---------- daily Board Job ---------- */
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function dailyQuest() {
  const day = todayKey();
  if (!G.daily || G.daily.day !== day) G.daily = { day, st: 'offered', p: 0 };
  let h = 0; for (const ch of day + G.trainer) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const step = DAILY_POOL[h % DAILY_POOL.length];
  return { id: 'daily', title: 'Board Job', titleEs: 'Trabajo del tablero', giver: 'board', steps: [step], daily: true, rewards: { xp: 40 + 6 * teamLevel() } };
}

/* ---------- progress ---------- */
const DUNGEON_ORDER = ['easy', 'hard', 'chaos'];
function stepNeed(step) { return step.type === 'objects' ? QUEST_OBJECTS[step.set].spots.length : step.type === 'level' ? step.lv : step.type === 'dungeon' ? 1 : step.count || 1; }
function stepHave(step, qs) {
  switch (step.type) {
    case 'species': return G.caught.size;
    case 'master': return SKILLS.filter(k => skillStatus(k.id).cls === 'mastered').length;
    case 'level': return Math.max(0, ...G.creatures.map(c => c.lv));
    case 'dungeon': return DUNGEON_ORDER.slice(DUNGEON_ORDER.indexOf(step.diff)).some(d => G.dungeon[d].clears > 0) ? 1 : 0;
    case 'objects': return (qs.o || []).length;
    default: return qs.p || 0;
  }
}
function questProgress(q, qs = q.daily ? G.daily : qState(q.id)) {
  if (!qs) return null;
  if (qs.st === 'ready' || qs.st === 'done') { const g = npcL(q.giver); return { done: true, text: qs.st === 'ready' ? L(`Return to ${g.en}`, `Regresa con ${g.es}`.replace('con el Tablero', 'al Tablero')) : L('Complete', 'Completada') }; }
  const step = q.steps[qs.s || 0];
  return { step, have: Math.min(stepHave(step, qs), stepNeed(step)), need: stepNeed(step), text: stepL(step) };
}
function matches(step, type, d) {
  if (step.type !== type) return false;
  if (step.zone && step.zone !== d.zone) return false;
  if (type === 'catch') return (!step.element || SP[d.n].type === step.element) && (!step.n || step.n === d.n);
  if (type === 'battle') {
    if (step.champion && !d.champion) return false;
    if (step.trainer === 'any' && !d.trainer) return false;
    if (step.trainer && step.trainer !== 'any' && step.trainer !== d.trainer) return false;
    return true;
  }
  if (type === 'solve') return d.ok && (!step.topic || step.topic === d.topic) && (!step.skill || step.skill === d.skill) && (!step.firstTry || d.result === 'correct');
  if (type === 'talk') return step.npc === d.npc;
  if (type === 'visit') return step.map === d.map;
  return true;
}
function activeQuests() {
  const list = QUESTS.filter(q => qState(q.id) && qState(q.id).st === 'active').map(q => [q, qState(q.id)]);
  if (G.daily && G.daily.day === todayKey() && G.daily.st === 'active') list.push([dailyQuest(), G.daily]);
  return list;
}
function questEvent(type, d = {}) {
  if (!G || !G.quests) return;
  for (const [q, qs] of activeQuests()) {
    const step = q.steps[qs.s || 0];
    if (step && matches(step, type, d)) qs.p = (qs.p || 0) + 1;
  }
  questRefresh();
}
// Moves quests forward when their current step is complete. Quiet when nothing changed.
function questRefresh() {
  if (!G || !G.quests) return;
  for (const [q, qs] of activeQuests()) {
    let moved = false;
    while (qs.st === 'active' && q.steps[qs.s || 0] && stepHave(q.steps[qs.s || 0], qs) >= stepNeed(q.steps[qs.s || 0])) {
      qs.s = (qs.s || 0) + 1; qs.p = 0; moved = true;
      if (qs.s >= q.steps.length) qs.st = 'ready';
    }
    if (!moved) continue;
    if (q.daily && qs.st === 'ready') { completeQuest(q, true); continue; }
    const T = qTitle(q), g = npcL(q.giver), nx = q.steps[qs.s] ? stepL(q.steps[qs.s]) : null;
    if (typeof toast === 'function') toast(tx(qs.st === 'ready' ? L(`Quest ready: ${T.en}. Return to ${g.en}.`, `Misión lista: ${T.es}. Regresa con ${g.es}.`) : L(`Quest updated: ${T.en}. Next: ${nx.en}.`, `Misión actualizada: ${T.es}. Siguiente: ${nx.es}.`)), 3600);
    if (screen === 'map' && typeof refreshMapQuests === 'function') refreshMapQuests();
  }
}

/* ---------- accepting and finishing ---------- */
function acceptQuest(id) {
  if (id === 'daily') { dailyQuest(); G.daily.st = 'active'; G.daily.s = 0; G.daily.p = 0; }
  else G.quests[id] = { st: 'active', s: 0, p: 0, o: [] };
  if (!G.tracked || !qState(G.tracked) || qState(G.tracked).st === 'done') G.tracked = id;
  questRefresh(); save();
}
// Spanish titles students can earn (the English title is what's saved)
const TITLE_ES = { 'Rookie Trainer': 'Entrenador novato', 'Field Researcher': 'Investigador de campo', 'Beacon Keeper': 'Guardián de faros', 'Isles Champion': 'Campeón de las Islas',
  'Bridge Builder': 'Constructor de puentes', 'Rapids Champion': 'Campeón de los Rápidos', 'Fact Fighter': 'Luchador de datos', 'Scholar': 'Erudito', 'Evolution Expert': 'Experto en evolución',
  'Equation Explorer': 'Explorador de ecuaciones', 'Bluffs Champion': 'Campeón de los Riscos', 'Balance Master': 'Maestro del equilibrio' };
const titleL = ti => L(ti, TITLE_ES[ti] || ti);
function rewardText(r) {
  const en = [], es = [];
  if (r.xp) { en.push(`+${r.xp} XP`); es.push(`+${r.xp} XP`); }
  if (r.title) { en.push(`the title “${r.title}”`); es.push(`el título “${titleL(r.title).es}”`); }
  if (r.cap) { en.push('a new cap color'); es.push('un nuevo color de gorra'); }
  if (r.gift) { en.push(`a ${SP[r.gift.n].name}`); es.push(`un ${SP[r.gift.n].name}`); }
  return tx(L(en.join(', '), es.join(', ')));
}
function completeQuest(q, auto = false) {
  const qs = q.daily ? G.daily : qState(q.id), r = q.rewards || {};
  qs.st = 'done';
  const notes = [];
  const ld = lead();
  if (r.xp && ld) { const ups = addXp(ld, r.xp); notes.push(L(`${SP[ld.n].name} earned ${r.xp} XP.${ups.length ? ` It reached level ${ld.lv}!` : ''}${evoReady(ld, ups)}`, `${SP[ld.n].name} ganó ${r.xp} XP.${ups.length ? ` ¡Llegó al nivel ${ld.lv}!` : ''}${evoReadyEs(ld, ups)}`)); }
  if (r.title) { G.titles.add(r.title); if (!G.title) G.title = r.title; notes.push(L(`New title: “${r.title}.” Choose it in Quests.`, `Nuevo título: “${titleL(r.title).es}.” Escógelo en Misiones.`)); }
  if (r.cap) { G.caps.add(r.cap); notes.push(L('New cap color unlocked! Change it in Quests.', '¡Nuevo color de gorra! Cámbialo en Misiones.')); }
  if (r.gift) { addToCollection(r.gift.n, r.gift.lv); notes.push(L(`${SP[r.gift.n].name} joined you!`, `¡${SP[r.gift.n].name} se unió a ti!`)); }
  if (G.tracked === q.id) { const next = activeQuests()[0]; G.tracked = next ? next[0].id : null; }
  save();
  const all = L(notes.map(n => n.en).join(' '), notes.map(n => n.es).join(' '));
  if (auto) toast(tx(L(`Board Job done! ${all.en}`, `¡Trabajo del tablero terminado! ${all.es}`)), 4500);
  return all;
}

/* ---------- townspeople ---------- */
function npcTalk(id) {
  const npc = NPCS[id], nm = npcL(id);
  questEvent('talk', { npc: id });
  const ready = questsFrom(id).find(q => qState(q.id) && qState(q.id).st === 'ready');
  if (ready) {
    const notes = completeQuest(ready);
    refreshMapQuests();
    say(L(`${nm.en}: ${ready.finish} ${notes.en}`, `${nm.es}: ${ready.finishEs || ready.finish} ${notes.es}`));
    return;
  }
  const offer = questsFrom(id).find(questAvailable);
  if (offer) {
    const rw = offer.rewards;
    say(L(`${nm.en}: ${offer.offer} (Reward: ${rewardIn('en', rw)})`, `${nm.es}: ${offer.offerEs || offer.offer} (Premio: ${rewardIn('es', rw)})`), [
      { label: UI.accept, primary: true, fn: () => { acceptQuest(offer.id); refreshMapQuests(); const T = qTitle(offer), p = questProgress(offer).text;
        say(L(`${nm.en}: Great! I’ve added “${T.en}” to your Quests. ${p.en}.`, `${nm.es}: ¡Genial! Agregué “${T.es}” a tus Misiones. ${p.es}.`)); } },
      { label: UI.notNow, fn: hideSay },
    ]);
    return;
  }
  const active = questsFrom(id).find(q => qState(q.id) && qState(q.id).st === 'active');
  if (active) { const p = questProgress(active), T = qTitle(active), n = p.need > 1 ? ` (${p.have}/${p.need})` : '';
    say(L(`${nm.en}: How’s “${T.en}” going? ${p.text.en}${n}.`, `${nm.es}: ¿Cómo va “${T.es}”? ${p.text.es}${n}.`)); return; }
  say(L(`${nm.en}: ${npc.idle}`, `${nm.es}: ${npc.idleEs || npc.idle}`));
}
function rewardIn(lang, r) { const keep = LANG; LANG = lang; const out = rewardText(r); LANG = keep; return out; }
function openBoard() {
  questEvent('board');
  const dq = dailyQuest(), dp = questProgress(dq, G.daily.st === 'offered' ? null : G.daily), job = stepL(dq.steps[0]);
  const avail = QUESTS.filter(questAvailable);
  const T = (en, es) => bi(L(en, es));
  const ov = openModal(`<h2>${T('Quest Board', 'Tablero de misiones')}</h2>
    <div class="board-job"><b>${T('Today’s Board Job', 'Trabajo del tablero de hoy')}</b><p>${T(`${job.en}. Reward: +${dq.rewards.xp} XP. A new job is posted every day.`, `${job.es}. Premio: +${dq.rewards.xp} XP. Cada día hay un trabajo nuevo.`)}</p>
      ${G.daily.st === 'offered' ? `<button class="btn primary" data-b="daily">${tx(L('Take the job', 'Aceptar el trabajo'))}</button>` : G.daily.st === 'done' ? `<p class="small"><b>${T('Done for today.', 'Listo por hoy.')}</b> ${T('Come back tomorrow for a new job.', 'Regresa mañana por un trabajo nuevo.')}</p>` : `<p class="small">${T(`In progress: ${dp.have} of ${dp.need}.`, `En progreso: ${dp.have} de ${dp.need}.`)}</p>`}</div>
    <h3 style="margin-top:14px">${T('Townspeople who need help', 'Gente del pueblo que necesita ayuda')}</h3>
    ${avail.length ? `<ul class="board-list">${avail.map(q => { const qt = qTitle(q), g = npcL(q.giver); return `<li><b>${bi(qt)}</b><span class="small">${T(`Talk to ${g.en}. Reward: ${rewardIn('en', q.rewards)}.`, `Habla con ${g.es}. Premio: ${rewardIn('es', q.rewards)}.`)}</span></li>`; }).join('')}</ul>`
      : `<p class="small muted">${T('Nobody right now. Finish your current quests to unlock more.', 'Nadie por ahora. Termina tus misiones actuales para desbloquear más.')}</p>`}
    <div class="btn-row"><button class="btn" data-b="log">${tx(L('Open my quests', 'Ver mis misiones'))}</button><button class="btn ghost" data-b="close">${tx(L('Close', 'Cerrar'))}</button></div>`);
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-b]'); if (!b) return;
    if (b.dataset.b === 'daily') { acceptQuest('daily'); closeModal(ov); toast(tx(L(`Board Job taken: ${job.en}.`, `Trabajo aceptado: ${job.es}.`))); refreshMapQuests(); return; }
    closeModal(ov);
    if (b.dataset.b === 'log') go('quests');
  });
}

/* ---------- the Quests screen ---------- */
function questCard(q, qs) {
  const p = questProgress(q, qs), T = (en, es) => bi(L(en, es)), g = npcL(q.giver);
  const steps = q.steps.map((st, i) => `<li class="${i < (qs.s || 0) || qs.st !== 'active' ? 'ok' : i === (qs.s || 0) ? 'now' : ''}">${bi(stepL(st))}${i === (qs.s || 0) && qs.st === 'active' && p.need > 1 ? ` (${p.have}/${p.need})` : ''}</li>`).join('');
  return `<div class="quest-card ${qs.st} ${G.tracked === q.id ? 'tracked' : ''}">
    <div class="quest-top"><b>${bi(qTitle(q))}</b>${qs.st === 'ready' ? `<span class="chip" style="--c:var(--good)">${tx(L('Ready to turn in', 'Lista para entregar'))}</span>` : ''}${G.tracked === q.id ? `<span class="chip" style="--c:var(--tide)">${tx(L('Tracking', 'Siguiendo'))}</span>` : ''}</div>
    <ol class="quest-steps">${steps}${qs.st !== 'done' && !q.daily ? `<li class="${qs.st === 'ready' ? 'now' : ''}">${T(`Return to ${g.en}`, `Regresa con ${g.es}`)}</li>` : ''}</ol>
    ${q.daily ? `<p class="small">${T('Finishes on its own. A new job is posted every day.', 'Se completa sola. Cada día hay un trabajo nuevo.')}</p>` : ''}
    <p class="small muted">${T(`From ${g.en}. Reward: ${rewardIn('en', q.rewards)}.`, `De ${g.es}. Premio: ${rewardIn('es', q.rewards)}.`)}</p>
    ${qs.st === 'active' && G.tracked !== q.id ? `<button class="btn small" data-act="q-track" data-q="${q.id}">${tx(L('Track this quest', 'Seguir esta misión'))}</button>` : ''}</div>`;
}
function renderQuests() {
  const act = activeQuests(), ready = QUESTS.filter(q => qState(q.id) && qState(q.id).st === 'ready');
  const avail = QUESTS.filter(questAvailable), done = QUESTS.filter(q => isDone(q.id));
  const caps = [...CAP_COLORS, ...CAP_UNLOCKS.filter(c => G.caps.has(c))], T = (en, es) => bi(L(en, es));
  return `<div class="page-head"><h2>${tx(L('Quests', 'Misiones'))}</h2><span class="muted">${tx(L(`${done.length} of ${QUESTS.length} quests complete`, `${done.length} de ${QUESTS.length} misiones completadas`))}</span></div>
  <div class="stack">
    ${ready.length ? `<div class="panel"><h3>${T('Ready to turn in', 'Listas para entregar')}</h3><div class="quest-grid">${ready.map(q => questCard(q, qState(q.id))).join('')}</div></div>` : ''}
    <div class="panel"><h3>${T('In progress', 'En progreso')}</h3>${act.length ? `<div class="quest-grid">${act.map(([q, qs]) => questCard(q, qs)).join('')}</div>` : `<p class="muted">${T('No active quests. Talk to people with a <b>!</b> over their heads in Origin Town, or check the Quest Board by the fountain.', 'No tienes misiones activas. Habla con la gente que tiene un <b>!</b> sobre la cabeza en Origin Town, o revisa el Tablero de misiones junto a la fuente.')}</p>`}</div>
    ${avail.length ? `<div class="panel"><h3>${T('Available', 'Disponibles')}</h3><ul class="board-list">${avail.map(q => { const g = npcL(q.giver); return `<li><b>${bi(qTitle(q))}</b><span class="small">${T(`Talk to ${g.en} in Origin Town. Reward: ${rewardIn('en', q.rewards)}.`, `Habla con ${g.es} en Origin Town. Premio: ${rewardIn('es', q.rewards)}.`)}</span></li>`; }).join('')}</ul></div>` : ''}
    <div class="panel"><h3>${T('Your look', 'Tu estilo')}</h3>
      <p class="small muted">${T('Quests unlock new caps and titles. Your title shows on your trainer card.', 'Las misiones desbloquean gorras y títulos nuevos. Tu título aparece en tu tarjeta de entrenador.')}</p>
      <b class="small">${tx(L('Cap', 'Gorra'))}</b><div class="choice-row" style="margin:6px 0 12px">${caps.map(c => `<button class="cap-pick" data-act="q-cap" data-c="${c}" aria-pressed="${(G.capColor || CAP_COLORS[G.cap || 0]) === c}" aria-label="Cap color" style="--cap:${c}"><span></span></button>`).join('')}</div>
      <b class="small">${tx(L('Title', 'Título'))}</b><div class="choice-row" style="margin-top:6px">${G.titles.size ? [...G.titles].map(ti => `<button class="choice" data-act="q-title" data-t="${esc(ti)}" aria-pressed="${G.title === ti}">${esc(tx(titleL(ti)))}</button>`).join('') : `<span class="small muted">${T('Finish a quest to earn your first title.', 'Termina una misión para ganar tu primer título.')}</span>`}</div></div>
    ${done.length ? `<div class="panel"><h3>${T('Completed', 'Completadas')}</h3><ul class="board-list">${done.map(q => `<li><b>${bi(qTitle(q))}</b><span class="small">${rewardText(q.rewards)}</span></li>`).join('')}</ul></div>` : ''}
  </div>`;
}
// Small objective box on the map for the tracked quest.
function trackedLine() {
  if (!G.tracked) { const a = activeQuests()[0]; if (a) G.tracked = a[0].id; }
  const q = G.tracked === 'daily' ? dailyQuest() : Q_BY_ID[G.tracked];
  if (!q) return null;
  const qs = q.daily ? G.daily : qState(q.id); if (!qs || qs.st === 'done') return null;
  const p = questProgress(q, qs);
  return `${tx(qTitle(q))}: ${tx(p.text)}${!p.done && p.need > 1 ? ` (${p.have}/${p.need})` : ''}`;
}
