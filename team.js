/* Numlings: team, collection, codex, and training */
'use strict';
/* ========================= team ========================= */
function renderTeam() {
  const party = G.party.map(byUid);
  const slots = [];
  for (let i = 0; i < CONFIG.partySize; i++) {
    const c = party[i];
    slots.push(c ? `<button class="slot" data-act="detail" data-uid="${c.uid}">${i === 0 ? '<span class="lead-tag">Lead</span>' : ''}
      <div class="art-wrap">${artC(c)}</div><b>${c.shiny ? '✦ ' : ''}${SP[c.n].name}</b><div class="small muted">Level ${c.lv}</div>${canEvolve(c) ? '<span class="evo-tag">Ready to evolve</span>' : ''}</button>`
      : `<div class="slot empty">Open spot. Pick a Numling below to add it.</div>`);
  }
  const sorted = [...G.creatures].sort((a, b) => b.lv - a.lv || a.n - b.n);
  return `${storageBanner()}<div class="page-head"><h2>Your team</h2></div>
  <p class="muted">Your lead battles first. Up to ${CONFIG.partySize} Numlings can be on your team.</p>
  <div class="party" style="margin-top:12px">${slots.join('')}</div>
  <div class="section"><h3>Collection (${G.creatures.length} of ${CONFIG.boxLimit})</h3>
  <div class="tile-grid">${sorted.map(c => `<button class="tile ${G.party.includes(c.uid) ? 'in-party' : ''}" data-act="detail" data-uid="${c.uid}">
    <div class="art-wrap">${artC(c)}</div>${c.shiny ? '✦ ' : ''}${SP[c.n].name}<span class="lv">Level ${c.lv}${G.party.includes(c.uid) ? ', on team' : ''}</span>${canEvolve(c) ? '<span class="evo-tag">Ready to evolve</span>' : ''}</button>`).join('')}</div></div>`;
}
function statRows(st) {
  const rows = [['HP', st.hp], ['Attack', st.atk], ['Defense', st.def], ['Speed', st.spd]];
  const top = Math.max(...rows.map(r => r[1]));
  return rows.map(([k, v]) => `<div class="statrow"><span>${k}</span><b>${v}</b><span class="statbar"><i style="width:${Math.round(v / top * 100)}%"></i></span></div>`).join('');
}
function showDetail(uid) {
  const c = byUid(uid); if (!c) return;
  const s = SP[c.n], st = stats(c), inParty = G.party.includes(uid), isLead = G.party[0] === uid;
  const partyFull = G.party.length >= CONFIG.partySize;
  const ov = openModal(`<div class="detail-top"><div class="bob">${artC(c)}</div>
      <div><h2>${s.name}</h2><div class="chips" style="margin:6px 0">${typeChip(s.type)}${c.shiny ? shinyChip : ''}${rarityTag(s.r)}</div>
      <b>Level ${c.lv}</b>${c.lv < 50 ? `<div class="xpbar" role="progressbar" aria-label="XP" aria-valuemin="0" aria-valuemax="${xpNext(c.lv)}" aria-valuenow="${c.xp}"><i style="width:${Math.round(c.xp / xpNext(c.lv) * 100)}%"></i></div><span class="small muted">${c.xp} of ${xpNext(c.lv)} XP to level ${c.lv + 1}</span>` : '<span class="small muted">Max level</span>'}</div></div>
    <p class="note">${s.note}</p>
    <div class="stack" style="gap:6px">${statRows(st)}</div>
    <p class="small" style="margin-top:12px"><b>Moves:</b> Bump (Normal) and ${s.move} (${TYPE_LABEL[s.type]})</p>
    ${s.evo ? `<p class="small evo-line">${canEvolve(c) ? `<b>Ready to evolve!</b> Pass the evolution trial to transform ${s.name}.` : `<b>Evolves at level ${s.evoLv}</b> after passing ${s.stage === 2 ? 'the final evolution trial' : 'an evolution trial'}. ${s.evoLv - c.lv} level${s.evoLv - c.lv === 1 ? '' : 's'} to go.`}</p>` : s.evolved ? `<p class="small evo-line">${s.stage === 3 ? '<b>Final form.</b> ' : ''}Evolved from ${SP[s.from].name}.</p>` : `<p class="small evo-line">${s.name} doesn’t evolve. It’s already one of a kind.</p>`}
    <div class="btn-row">
      ${canEvolve(c) ? `<button class="btn primary" data-d="evolve">${s.stage === 2 ? 'Start final evolution trial' : 'Start evolution trial'}</button>` : ''}
      ${inParty && !isLead ? '<button class="btn primary" data-d="lead">Make lead</button>' : ''}
      ${!inParty ? `<button class="btn primary" data-d="add" ${partyFull ? 'disabled' : ''}>${partyFull ? 'Team is full' : 'Add to team'}</button>` : ''}
      ${inParty && G.party.length > 1 ? '<button class="btn" data-d="remove">Remove from team</button>' : ''}
      <button class="btn" data-d="train">Train</button>
      ${G.creatures.length > 1 && !(inParty && G.party.length === 1) ? '<button class="btn danger" data-d="release">Release</button>' : ''}
      <button class="btn ghost" data-d="close">Close</button>
    </div>`);
  ov.addEventListener('click', async e => {
    const b = e.target.closest('[data-d]'); if (!b || b.disabled) return;
    const a = b.dataset.d;
    if (a === 'close') { closeModal(ov); return; }
    if (a === 'lead') { G.party = [uid, ...G.party.filter(u => u !== uid)]; toast(`${s.name} is your lead now.`); }
    if (a === 'add') { G.party.push(uid); toast(tx(L(`${s.name} joined your team.`, `${s.name} se unió a tu equipo.`))); }
    if (a === 'remove') G.party = G.party.filter(u => u !== uid);
    if (a === 'train') { closeModal(ov); go('train', { uid }); return; }
    if (a === 'evolve') { closeModal(ov); go('trial', { uid, phase: 'intro' }); return; }
    if (a === 'release') {
      closeModal(ov);
      if (!(await confirmBox(`Release ${s.name} (level ${c.lv})? This can’t be undone.`, 'Release', true))) { showDetail(uid); return; }
      G.creatures = G.creatures.filter(x => x.uid !== uid); G.party = G.party.filter(u => u !== uid);
      save(); render(); toast(`${s.name} was released.`); return;
    }
    save(); closeModal(ov); render();
  });
}

/* ========================= codex ========================= */
function renderCodex() {
  const groups = [['starter', 'Starters'], ...Object.entries(ZONES).map(([id, z]) => [id, z.name]), ['stage2', 'Evolved forms'], ['stage3', 'Final forms'], ['dungeon', 'Dungeon']];
  const cyc = TYPES.map(t => typeChip(t)).join(' <span aria-hidden="true">→</span> ') + ' <span aria-hidden="true">→</span> ' + typeChip('blaze');
  return `<div class="page-head"><h2>Codex</h2><span class="muted">${G.caught.size} of ${SPECIES.length} caught, ${G.seen.size} seen, ${G.shinies.size} shiny</span></div>
  <div class="panel"><b>Type matchups.</b> Each type is strong against the next one.
    <div class="cycle" style="margin-top:8px" aria-label="Blaze beats Grove, Grove beats Volt, Volt beats Tide, Tide beats Blaze">${cyc}</div></div>
  ${groups.map(([id, label]) => `<div class="section"><h3>${label}</h3><div class="tile-grid">${(id === 'stage2' ? SPECIES.filter(s => s.stage === 2) : id === 'stage3' ? SPECIES.filter(s => s.stage === 3) : BASE_SPECIES.filter(s => s.zone === id)).map(s => {
    const caught = G.caught.has(s.n), seen = G.seen.has(s.n);
    if (caught) return `<button class="tile${G.shinies.has(s.n) ? ' has-shiny' : ''}" data-act="species" data-n="${s.n}">${G.shinies.has(s.n) ? '<span class="shiny-badge" aria-label="Shiny found">✦</span>' : ''}<span class="dexno">No. ${s.n}</span><div class="art-wrap">${art(s.n)}</div>${s.name}${stars(s.r)}</button>`;
    return `<div class="tile locked"><span class="dexno">No. ${s.n}</span><div class="art-wrap">${art(s.n, { sil: true, faint: !seen })}</div>${seen ? s.name : '???'}${seen ? stars(s.r) : ''}</div>`;
  }).join('')}</div></div>`).join('')}`;
}
function showSpecies(n) {
  const s = SP[n];
  const where = s.evolved ? `${s.stage === 3 ? 'Final form. ' : ''}Evolves from ${SP[s.from].name} at level ${SP[s.from].evoLv} by passing ${s.stage === 3 ? 'the final evolution trial' : 'an evolution trial'}. Never found in the wild.`
    : (s.zone === 'starter' ? 'A starter Numling.' : s.zone === 'dungeon' ? (s.n === 68 ? 'Joins your team the first time you clear the Dungeon of Multiplia on Chaos. Never found in the wild.' : `Lives in the Dungeon of Multiplia and blocks the exit after a clear${s.n === CONFIG.dungeons.multiplia.rare ? '. The rare one: it appears after about 1 clear in 10' : ''}. Perfect runs can summon a shiny.`) : `Found in ${ZONES[s.zone].name}. ${catchPlan(s.r)}`) +
      (s.evo ? ` Evolves at level ${s.evoLv} into ${G.caught.has(s.evo) ? SP[s.evo].name : 'a form you haven’t discovered yet'}.` : '');
  const nextLine = s.evolved && s.evo ? ` At level ${s.evoLv} it can reach its final form, ${G.caught.has(s.evo) ? SP[s.evo].name : 'a form you haven’t discovered yet'}.` : '';
  const sh = G.shinies.has(n);
  const ov = openModal(`<div class="detail-top"><div class="bob">${art(n)}</div><div><span class="dexno">No. ${n}</span><h2>${s.name}</h2>
    <div class="chips" style="margin-top:6px">${typeChip(s.type)}${rarityTag(s.r)}</div></div></div>
    <p class="note">${s.note}</p><p class="small">${where}${nextLine}${s.r === 5 && CONFIG.encounters.legendaryNeedsBadge && ZONES[s.zone] ? ` Appears only after you earn the ${ZONES[s.zone].name} Badge.` : ''}</p>
    <div class="shiny-row">${sh ? `<div class="mini-shiny">${art(n, { shiny: true })}</div><p class="small"><b>✦ Shiny found!</b> You’ve caught the shiny version of ${s.name}.</p>` : `<div class="mini-shiny">${art(n, { sil: true })}</div><p class="small muted">Shiny version not found yet. Shinies are rare recolors of wild Numlings.</p>`}</div><p class="small"><b>Signature move:</b> ${s.move}</p>
    <div class="btn-row"><button class="btn" data-d="close">Close</button></div>`);
  ov.addEventListener('click', e => { if (e.target.closest('[data-d]')) closeModal(ov); });
}

/* ========================= training ========================= */
const TRAIN_TIERS = { 1: { label: 'Warm-up', es: 'Calentamiento', xp: 5 }, 2: { label: 'Standard', es: 'Estándar', xp: 9 }, 3: { label: 'Challenge', es: 'Reto', xp: 14 } };
const tierL = n => L(TRAIN_TIERS[n].label, TRAIN_TIERS[n].es);
const STATUS_ES = { new: 'Sin intentar', start: 'Empezando', mastered: 'Dominado', practicing: 'Practicando', learning: 'Aprendiendo' };
const statusL = st => L(st.label, STATUS_ES[st.cls]);
const TOPIC_ES = { rational: 'Destrezas de Integer Isles', proportion: 'Destrezas de Ratio Rapids', equations: 'Destrezas de Balance Bluffs' };
const topicL = tp => L(TOPIC_LABEL[tp], TOPIC_ES[tp] || TOPIC_LABEL[tp]);
// Training XP grows with level so higher levels stay reachable: +5% per level. Answers that needed a hint earn half.
const trainXp = (tier, lv) => Math.round(TRAIN_TIERS[tier].xp * (1 + lv / 20));
const STATUS_ORDER = { learning: 0, start: 1, practicing: 2, new: 3, mastered: 4 };
function skillRows(topic) {
  return skillsFor(topic).map(sk => {
    const st = skillStatus(sk.id), k = G.skills[sk.id], focus = (CONFIG.focusSkills || []).includes(sk.id);
    return `<button class="skill-row ${ctx.skill === sk.id ? 'sel' : ''}" data-act="train-skill" data-s="${sk.id}" aria-pressed="${ctx.skill === sk.id}">
      <span class="skill-name">${bi(skillName(sk))}${focus ? ` <span class="focus-tag">${tx(L('Class focus', 'Enfoque de la clase'))}</span>` : ''}<small>TEKS ${sk.teks}. ${tx([null, L('Warm-up', 'Calentamiento'), L('On level', 'A nivel'), L('Challenge', 'Reto')][sk.tier])}.</small></span>
      <span class="skill-bar"><i class="${st.cls}" style="width:${Math.round(st.m * 100)}%"></i></span>
      <span class="skill-status ${st.cls}">${tx(statusL(st))}${k ? `<small>${tx(L(`${k.c + k.h} of ${k.a} right${k.h ? `, ${k.h} with a hint` : ''}`, `${k.c + k.h} de ${k.a} correctas${k.h ? `, ${k.h} con pista` : ''}`))}</small>` : ''}</span></button>`;
  }).join('');
}
function renderTrain() {
  if (!ctx.uid || !byUid(ctx.uid)) ctx.uid = G.party[0];
  const topics = openZones().map(z => ZONES[z].topic);
  if (!ctx.topic || (ctx.topic !== 'mixed' && !topics.includes(ctx.topic))) ctx.topic = topics[0];
  if (ctx.tier == null) ctx.tier = 0; // 0 = adaptive
  if (ctx.skill && (!SKILL[ctx.skill] || (ctx.topic !== 'mixed' && SKILL[ctx.skill].topic !== ctx.topic))) ctx.skill = null;
  const c = byUid(ctx.uid), s = SP[c.n];
  const opts = [...G.creatures].sort((a, b) => (G.party.includes(b.uid) - G.party.includes(a.uid)) || b.lv - a.lv)
    .map(x => `<option value="${x.uid}" ${x.uid === c.uid ? 'selected' : ''}>${SP[x.n].name}, Lv ${x.lv}${G.party.includes(x.uid) ? ', team' : ''}</option>`).join('');
  const showTopics = ctx.topic === 'mixed' ? topics : [ctx.topic];
  const wt = ctx.topic === 'mixed' ? null : workingTier(ctx.topic);
  const T = (en, es) => bi(L(en, es));
  return `<div class="page-head"><h2>${tx(L('Training', 'Entrenamiento'))}</h2></div>
  <p class="muted">${T('Every correct answer gives XP. Harder problems give more, and 3 in a row starts a streak bonus. Stuck? Tap Hint. Hinted answers earn half XP.', 'Cada respuesta correcta da XP. Los problemas más difíciles dan más, y 3 seguidas activan un bono de racha. ¿Atorado? Toca Pista. Las respuestas con pista ganan la mitad de XP.')}</p>
  ${ctx.summary ? `<div class="panel" style="margin:14px 0;border-color:var(--good)"><b>${tx(L('Session done.', 'Sesión terminada.'))}</b> ${bi(ctx.summary)}</div>` : ''}
  <div class="stack" style="margin-top:14px">
    <div class="panel" style="display:grid;grid-template-columns:110px 1fr;gap:14px;align-items:center">
      <div class="bob">${artC(c)}</div>
      <div class="field" style="max-width:none"><label for="tsel">${tx(L('Numling to train', 'Numling para entrenar'))}</label>
        <select id="tsel" class="text-in" data-change="train-uid">${opts}</select>
        ${c.lv < 50 ? `<div class="xpbar"><i style="width:${Math.round(c.xp / xpNext(c.lv) * 100)}%"></i></div><span class="small muted">${tx(L(`Level ${c.lv}: ${c.xp} of ${xpNext(c.lv)} XP to level ${c.lv + 1}`, `Nivel ${c.lv}: ${c.xp} de ${xpNext(c.lv)} XP para el nivel ${c.lv + 1}`))}</span>` : `<span class="small muted">${tx(L('Max level', 'Nivel máximo'))}</span>`}</div>
    </div>
    <div><h3 style="margin-bottom:8px">${tx(L('Zone skills', 'Destrezas por zona'))}</h3><div class="choice-row">
      ${topics.map(tp => `<button class="choice" data-act="train-topic" data-t="${tp}" aria-pressed="${ctx.topic === tp}">${tx(topicL(tp))}</button>`).join('')}
      ${topics.length > 1 ? `<button class="choice" data-act="train-topic" data-t="mixed" aria-pressed="${ctx.topic === 'mixed'}">${tx(L('Mixed', 'Mezcla'))}</button>` : ''}</div></div>
    <div><h3 style="margin-bottom:8px">${tx(L('Difficulty', 'Dificultad'))}</h3><div class="choice-row">
      <button class="choice" data-act="train-tier" data-t="0" aria-pressed="${ctx.tier === 0 && !ctx.skill}">${tx(L('Just right', 'A tu medida'))}<small>${tx(L(`Adapts to you${wt ? `, now ${TRAIN_TIERS[wt].label.toLowerCase()}` : ''}`, `Se adapta a ti${wt ? `, ahora ${TRAIN_TIERS[wt].es.toLowerCase()}` : ''}`))}</small></button>
      ${[1, 2, 3].map(n => `<button class="choice" data-act="train-tier" data-t="${n}" aria-pressed="${ctx.tier === n && !ctx.skill}">${tx(tierL(n))}<small>${tx(L(`+${trainXp(n, c.lv)} XP each`, `+${trainXp(n, c.lv)} XP cada una`))}</small></button>`).join('')}</div></div>
    <div><button class="btn primary" data-act="train-go">${ctx.skill ? esc(tx(L(`Practice ${SKILL[ctx.skill].label.toLowerCase()}`, `Practicar: ${SKILL[ctx.skill].es.toLowerCase()}`))) : esc(tx(L(`Start training ${s.name}`, `Entrenar a ${s.name}`)))}</button>
      ${ctx.skill ? `<button class="btn ghost" data-act="train-skill" data-s="">${tx(L('Clear skill choice', 'Quitar la destreza'))}</button>` : ''}</div>
    <div class="panel"><h3>${tx(L('Your skills', 'Tus destrezas'))}</h3><p class="small muted">${T('Tap a skill to practice just that one.', 'Toca una destreza para practicar solo esa.')}</p>
      ${showTopics.map(tp => `<div class="skill-group"><b class="small">${tx(topicL(tp))}</b>${skillRows(tp)}</div>`).join('')}</div>
  </div>`;
}
async function runTraining() {
  const c = byUid(ctx.uid), name = SP[c.n].name, topics = openZones().map(z => ZONES[z].topic);
  let streak = 0, total = 0, right = 0, hinted = 0, asked = 0; const startLv = c.lv;
  for (;;) {
    const sk = ctx.skill ? SKILL[ctx.skill] : null;
    const topic = sk ? sk.topic : ctx.topic === 'mixed' ? pick(topics) : ctx.topic;
    const tier = sk ? sk.tier : ctx.tier || adaptiveTier(topic);
    const res = await askQuestion({ topic, tier, skill: sk ? sk.id : null, seconds: 0, allowStop: true, autoMs: 1300,
      title: sk ? skillName(sk) : L(`Training ${name}`, `Entrenando a ${name}`), sub: L(`${streak >= 3 ? `Streak of ${streak}! Bonus XP is on.` : `Streak: ${streak}.`} This session: +${total} XP.`, `${streak >= 3 ? `¡Racha de ${streak}! Tienes XP extra.` : `Racha: ${streak}.`} En esta sesión: +${total} XP.`),
      onResult: (ok, withHint) => {
        if (!ok) { streak = 0; return ''; }
        if (!withHint) streak++;
        const xp = Math.max(1, Math.round(trainXp(tier, c.lv) * (streak >= 3 && !withHint ? 1.5 : 1) * (withHint ? 0.5 : 1)));
        const ups = addXp(c, xp); total += xp;
        return L(` +${xp} XP for ${name}.${ups.length ? ` ${name} reached level ${c.lv}!` : ''}${evoReady(c, ups)}`, ` +${xp} XP para ${name}.${ups.length ? ` ¡${name} llegó al nivel ${c.lv}!` : ''}${evoReadyEs(c, ups)}`);
      } });
    if (res === 'stop') break;
    asked++; if (res === 'correct') right++; if (res === 'assisted') hinted++;
  }
  ctx.summary = asked ? L(`${right + hinted} of ${asked} right${hinted ? ` (${hinted} with a hint)` : ''}. ${name} earned ${total} XP${c.lv > startLv ? ` and went from level ${startLv} to ${c.lv}` : ''}.`,
                         `${right + hinted} de ${asked} correctas${hinted ? ` (${hinted} con pista)` : ''}. ${name} ganó ${total} XP${c.lv > startLv ? ` y subió del nivel ${startLv} al ${c.lv}` : ''}.`) : '';
  save(); render();
}
