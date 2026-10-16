/* Numlings: battles against wild Numlings, trainers, and Champions */
'use strict';
/* ========================= battle =========================
   Opponent levels scale with the team's best Numling (see CONFIG.scaling and TRAINERS). */
const MOVE_BUMP = { name: 'Bump', type: 'none', power: 45 };
const movesOf = c => [MOVE_BUMP, { name: SP[c.n].move, type: SP[c.n].type, power: SP[c.n].stage === 3 ? 95 : SP[c.n].stage === 2 ? 80 : 65 }];
function fighter(c) { const st = stats(c); return { c, st, hp: st.hp, max: st.hp }; }
// Battle questions follow the student's own skill level in this zone (not their Numlings' levels).
// Champions ask one tier above what the student is working on.
function battleQ(topic, champ) {
  const tier = adaptiveTier(topic, champ ? 1 : 0);
  return { tier, seconds: CONFIG.battleSeconds[tier] };
}
const foeNameL = (b, f = b.foe) => (b.trainer ? L(`${b.trainer.short}’s ${SP[f.c.n].name}`, `${SP[f.c.n].name} de ${b.trainer.short}`)
  : L(`${f.c.shiny ? 'Shiny wild' : 'Wild'} ${SP[f.c.n].name}`, `${SP[f.c.n].name} ${f.c.shiny ? 'brillante ' : ''}salvaje`));
const foeName = (b, f = b.foe) => tx(foeNameL(b, f));
function startBattle({ zone, foes, wild = null, trainer = null }) {
  const team = G.party.map(byUid).map(fighter);
  const fs = foes.map(f => fighter({ n: f.n, lv: f.lv, shiny: !!f.shiny }));
  const b = { team, ai: 0, foes: fs, fi: 0, foe: fs[0], trainer, used: new Set([team[0].c.uid]),
    log: trainer ? L(`${trainer.name} sends out ${SP[fs[0].c.n].name}!`, `¡${trainer.nameEs || trainer.name} envía a ${SP[fs[0].c.n].name}!`) : L(`A wild ${SP[fs[0].c.n].name} wants to battle!`, `¡Un ${SP[fs[0].c.n].name} salvaje quiere combatir!`),
    busy: false, over: null, anim: null, dmg: null, rewards: [] };
  ctx = { zone, wild, trainer, battle: b };
  screen = 'battle'; render(); window.scrollTo(0, 0);
}
function hpCard(b, f, foe) {
  const pct = Math.round(f.hp / f.max * 100);
  const dots = foe && b.trainer ? `<span class="teamdots" aria-label="${b.foes.filter(x => x.hp > 0).length} of ${b.foes.length} left">${b.foes.map(x => `<i class="${x.hp > 0 ? 'on' : ''}"></i>`).join('')}</span>` : '';
  return `<div class="hpcard"><div class="nm"><span>${foe ? foeName(b, f) : SP[f.c.n].name}</span><span class="small">Lv ${f.c.lv}</span></div>
    <div class="chips">${typeChip(SP[f.c.n].type)}${dots}</div>
    <div class="hpbar ${pct <= 25 ? 'low' : pct <= 55 ? 'mid' : ''}" role="progressbar" aria-label="HP" aria-valuemin="0" aria-valuemax="${f.max}" aria-valuenow="${f.hp}"><i style="width:${pct}%"></i></div>
    <div class="hpnum">${f.hp} / ${f.max} HP</div></div>`;
}
function renderBattle() {
  const b = ctx.battle, me = b.team[b.ai], foe = b.foe, tr = b.trainer;
  const dmg = (who) => b.dmg && b.dmg.who === who ? `<span class="dmg ${b.dmg.crit ? 'crit' : ''}">${MINUS}${b.dmg.n}</span>` : '';
  const cls = (who) => [b.anim === 'me' && who === 'me' ? 'lunge-me' : '', b.anim === 'foe' && who === 'foe' ? 'lunge-foe' : '',
    b.anim === 'foe' && who === 'me' ? 'hit' : '', b.anim === 'me' && who === 'foe' ? 'hit' : ''].join(' ');
  let controls;
  if (b.over === 'won') {
    const more = tr ? `<button class="btn primary" data-act="explore-again">${zoneBack()}</button>`
      : `<button class="btn primary" data-act="catch-after">${tx(L(`Try to catch ${SP[foe.c.n].name}`, `Intenta atrapar a ${SP[foe.c.n].name}`))}</button><button class="btn" data-act="explore-again">${t('keepExploring')}</button>`;
    controls = `<div class="panel"><p class="result-msg">${t('youWon')}</p>${b.rewards.map(r => `<p>${bi(r)}</p>`).join('')}<div class="btn-row">${more}</div></div>`;
  } else if (b.over === 'lost') {
    controls = `<div class="panel"><p class="result-msg">${bi(tr ? L(`${tr.short} wins this time.`, `${tr.short} gana esta vez.`) : L('Your team needs a rest.', 'Tu equipo necesita descansar.'))}</p>
      <p>${bi(L(`Everyone is healed and ready to go again. ${tr ? `${tr.short} will be right where you left them.` : ''} Training is a good way to get stronger.`, `Todos están curados y listos otra vez. ${tr ? `${tr.short} te estará esperando en el mismo lugar.` : ''} Entrenar es una buena forma de hacerte más fuerte.`))}</p>
      <div class="btn-row"><button class="btn primary" data-act="nav" data-to="train">${t('trainTeam')}</button><button class="btn" data-act="explore-again">${zoneBack()}</button></div></div>`;
  } else {
    const dis = b.busy ? 'disabled' : '';
    const score = m => m.power * typeMult(m.type, SP[foe.c.n].type) * (m.type === SP[me.c.n].type ? 1.2 : 1);
    const best = score(movesOf(me.c)[1]) >= score(movesOf(me.c)[0]) ? 1 : 0;
    const bench = b.team.map((f, i) => i === b.ai || f.hp <= 0 ? '' :
      `<button class="btn" data-act="swap" data-i="${i}" ${dis}><span class="mini">${artC(f.c, { label: false })}</span>${tx(L(`Switch to ${SP[f.c.n].name}`, `Cambiar a ${SP[f.c.n].name}`))}</button>`).join('');
    controls = `<div class="moves">${movesOf(me.c).map((m, i) => {
      const eff = typeMult(m.type, SP[foe.c.n].type);
      return `<button class="btn move ${i === best ? 'primary' : ''}" data-act="move" data-i="${i}" ${dis}>${m.name}<small>${tx(L(`${TYPE_LABEL[m.type]} move${eff > 1 ? ', strong against this foe' : eff < 1 ? ', weak against this foe' : ''}`, `Movimiento ${TYPE_LABEL[m.type]}${eff > 1 ? ', fuerte contra este rival' : eff < 1 ? ', débil contra este rival' : ''}`))}</small></button>`;
    }).join('')}</div>
    <div class="bench">${bench}<button class="btn ghost" data-act="run" ${dis}>${tr ? t('giveUp') : t('runAway')}</button></div>`;
  }
  const banner = tr ? `<div class="vs-banner${tr.champion ? ' champ' : ''}"><span class="trainer-face">${trainerSVG('down', tr.cap, tr.shirt, tr.champion)}</span><span><b>${tx(L(tr.name, tr.nameEs || tr.name))}</b><span class="small">${tr.champion ? tx(L(`${ZONES[ctx.zone].name} Champion`, `Campeón de ${ZONES[ctx.zone].name}`)) : tx(L('Trainer battle', 'Combate de entrenador'))}</span></span></div>` : '';
  return `${banner}<div class="arena theme-${ctx.zone}">${sceneSVG(ctx.zone)}
    <div class="side foe">${hpCard(b, foe, true)}<div class="art-wrap plat-wrap ${cls('foe')} ${foe.hp <= 0 ? 'faint' : 'bob'}">${artC(foe.c, { faceLeft: true })}${dmg('foe')}</div></div>
    <div class="side me"><div class="art-wrap plat-wrap ${cls('me')} ${me.hp <= 0 ? 'faint' : 'bob'}">${artC(me.c, { flip: true })}${dmg('me')}</div>${hpCard(b, me, false)}</div>
  </div>
  <p class="log" aria-live="polite">${bi(b.log)}</p>
  ${controls}`;
}
function damage(att, def, move, crit, guard) {
  const ld = att.c.lv;
  const base = Math.floor(((2 * ld / 5 + 2) * move.power * att.st.atk / def.st.def) / 50) + 2;
  const stab = move.type === SP[att.c.n].type ? 1.2 : 1;
  const eff = typeMult(move.type, SP[def.c.n].type);
  const n = Math.max(1, Math.round(base * stab * eff * (crit ? 1.8 : 1) * (guard ? 0.4 : 1) * (0.9 + Math.random() * 0.2)));
  return { n, eff };
}
const effL = e => (e > 1 ? L(' It’s a strong hit!', ' ¡Es un golpe fuerte!') : e < 1 ? L(' It’s a weak hit.', ' Es un golpe débil.') : L('', ''));
async function show(b, log, anim = null, dmg = null, wait = 750) {
  b.log = log; b.anim = anim; b.dmg = dmg; render();
  await sleep(wait);
  b.anim = null; b.dmg = null;
}
async function playerAttack(b, move) {
  const me = b.team[b.ai], foe = b.foe, name = SP[me.c.n].name;
  b.log = L(`${name} gets ready to use ${move.name}…`, `${name} se prepara para usar ${move.name}…`); render();
  const q = battleQ(ZONES[ctx.zone].topic, b.trainer && b.trainer.champion);
  const res = await askQuestion({ topic: ZONES[ctx.zone].topic, tier: q.tier, seconds: q.seconds, allowSkip: true, autoMs: 800, theme: ctx.zone, low: true, battle: true,
    title: UI.critTitle, sub: L(`Answer correctly and ${name}’s ${move.name} becomes a critical hit.`, `Responde bien y ${move.name} de ${name} será un golpe crítico.`) });
  const crit = solved(res);
  const d = damage(me, foe, move, crit, false);
  foe.hp = Math.max(0, foe.hp - d.n);
  await show(b, L(`${name} used ${move.name}.${crit ? ' Critical hit!' : ''}${effL(d.eff).en}`, `${name} usó ${move.name}.${crit ? ' ¡Golpe crítico!' : ''}${effL(d.eff).es}`), 'me', { who: 'foe', n: d.n, crit });
}
async function foeAttack(b) {
  const me = b.team[b.ai], foe = b.foe, fnL = foeNameL(b), fname = fnL.en;
  const ms = movesOf(foe.c), sig = ms[1];
  const move = typeMult(sig.type, SP[me.c.n].type) < 1 && Math.random() < 0.6 ? ms[0] : sig;
  b.log = L(`${fnL.en} is about to use ${move.name}!`, `¡${fnL.es} va a usar ${move.name}!`); render();
  const q = battleQ(ZONES[ctx.zone].topic, b.trainer && b.trainer.champion);
  const res = await askQuestion({ topic: ZONES[ctx.zone].topic, tier: q.tier, seconds: q.seconds, allowSkip: true, autoMs: 800, theme: ctx.zone, low: true, battle: true,
    title: UI.guardTitle, sub: L(`Answer correctly to block most of the damage from ${move.name}.`, `Responde bien para bloquear casi todo el daño de ${move.name}.`) });
  const guard = solved(res);
  const d = damage(foe, me, move, false, guard);
  me.hp = Math.max(0, me.hp - d.n);
  await show(b, L(`${fnL.en} used ${move.name}.${guard ? ' Guarded! Most of the damage was blocked.' : ''}${effL(d.eff).en}`, `${fnL.es} usó ${move.name}.${guard ? ' ¡Defendido! Bloqueaste casi todo el daño.' : ''}${effL(d.eff).es}`), 'foe', { who: 'me', n: d.n, crit: false });
}
// returns 'over' when the battle ended, 'switched' when a new Numling came in (the turn ends), or false
async function checkFaints(b) {
  if (b.foe.hp <= 0) {
    if (b.fi < b.foes.length - 1) {
      { const f0 = foeNameL(b); await show(b, L(`${f0.en} is worn out.`, `${f0.es} está agotado.`), null, null, 900); }
      b.fi++; b.foe = b.foes[b.fi];
      await show(b, L(`${b.trainer.short} sends out ${SP[b.foe.c.n].name}!`, `¡${b.trainer.short} envía a ${SP[b.foe.c.n].name}!`), null, null, 900);
      return 'switched';
    }
    await winBattle(b); return 'over';
  }
  const me = b.team[b.ai];
  if (me.hp <= 0) {
    const next = b.team.findIndex(f => f.hp > 0);
    if (next < 0) { b.over = 'lost'; b.busy = false; b.log = L(`${SP[me.c.n].name} is worn out.`, `${SP[me.c.n].name} está agotado.`); save(); render(); return 'over'; }
    await show(b, `${SP[me.c.n].name} is worn out.`, null, null, 900);
    b.ai = next; b.used.add(b.team[next].c.uid);
    await show(b, `Go, ${SP[b.team[next].c.n].name}!`, null, null, 700);
    return 'switched';
  }
  return false;
}
async function winBattle(b) {
  const tr = b.trainer, first = tr && !G.trainerWins.has(tr.id);
  let amount = b.foes.reduce((sum, f) => sum + 6 + f.c.lv * 4 + RARITY[SP[f.c.n].r].xp, 0);
  if (first) amount = Math.round(amount * 1.5);
  b.rewards = [];
  if (tr) b.rewards.push(L(`${tr.name}: “${tr.beat}”`, `${tr.nameEs || tr.name}: “${tr.beatEs || tr.beat}”`));
  for (const uid of b.used) {
    const c = byUid(uid); if (!c) continue;
    const ups = addXp(c, amount);
    b.rewards.push(L(`${SP[c.n].name} earned ${amount} XP${first ? ' (first-win bonus included)' : ''}.${ups.length ? ` It reached level ${c.lv}!` : ''}${evoReady(c, ups)}`,
                     `${SP[c.n].name} ganó ${amount} XP${first ? ' (incluye el bono por primera victoria)' : ''}.${ups.length ? ` ¡Llegó al nivel ${c.lv}!` : ''}${evoReadyEs(c, ups)}`));
  }
  if (tr) {
    G.trainerWins.add(tr.id);
    if (tr.champion && !G.badges.has(ctx.zone)) { G.badges.add(ctx.zone); b.rewards.push(L(`<b>You earned the ${ZONES[ctx.zone].name} Badge!</b> It’s on your trainer card in Save.`, `<b>¡Ganaste la insignia de ${ZONES[ctx.zone].name}!</b> Está en tu tarjeta de entrenador en Guardar.`)); }
    else if (!tr.champion && first) {
      const left = TRAINERS[ctx.zone].filter(t => !G.trainerWins.has(t.id)).length;
      b.rewards.push(left ? L(`${left} more trainer${left > 1 ? 's' : ''} to beat before the Champion will battle you.`, `Te ${left > 1 ? 'faltan' : 'falta'} ${left} entrenador${left > 1 ? 'es' : ''} por vencer antes de que el Campeón combata contigo.`)
        : L(`You’ve beaten every trainer here. The ${ZONES[ctx.zone].name} Champion is waiting!`, `Venciste a todos los entrenadores de aquí. ¡El Campeón de ${ZONES[ctx.zone].name} te espera!`));
    }
  }
  G.stats.won++; questEvent('battle', { zone: ctx.zone, trainer: tr ? tr.id : null, champion: !!(tr && tr.champion) }); save();
  { const f0 = foeNameL(b); b.log = L(`${f0.en} is worn out.`, `${f0.es} está agotado.`); }
  b.over = 'won'; b.busy = false; render();
}
async function battleTurn(action) {
  const b = ctx.battle; if (!b || b.busy || b.over) return;
  b.busy = true; render();
  if (action.swap != null) {
    b.ai = action.swap; b.used.add(b.team[b.ai].c.uid);
    await show(b, `Go, ${SP[b.team[b.ai].c.n].name}!`, null, null, 700);
    await foeAttack(b);
    if ((await checkFaints(b)) === 'over') return;
  } else {
    const me = b.team[b.ai], foe = b.foe;
    const move = movesOf(me.c)[action.move];
    const meFirst = me.st.spd > foe.st.spd || (me.st.spd === foe.st.spd && Math.random() < 0.5);
    for (const side of meFirst ? ['me', 'foe'] : ['foe', 'me']) {
      if (side === 'me') await playerAttack(b, move); else await foeAttack(b);
      const r = await checkFaints(b);
      if (r === 'over') return;
      if (r === 'switched') break;
    }
  }
  b.busy = false; b.log = L(`What will ${SP[b.team[b.ai].c.n].name} do?`, `¿Qué hará ${SP[b.team[b.ai].c.n].name}?`); render();
}
