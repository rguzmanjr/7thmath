/* Numlings: evolution trials */
'use strict';
/* ========================= evolution trials ========================= */
const trialCfg = c => (SP[c.n].stage === 2 ? CONFIG.evolution.final : CONFIG.evolution);
const isFinalTrial = c => SP[c.n].stage === 2;
function trialTopic(c) {
  const z = SP[c.n].zone;
  if (ZONES[z]) return ZONES[z].topic;
  return pick(openZones().map(id => ZONES[id].topic)); // starters: any open zone's skills
}
function trialZone(c) { const z = SP[c.n].zone; return ZONES[z] ? z : (openZones()[0] || 'isles'); }
function trialTrack() {
  const c = byUid(ctx.uid), E = ctx.cfg || trialCfg(c), r = ctx.results || [];
  return `<div class="track" aria-label="${r.filter(x => x).length} right, ${r.filter(x => !x).length} missed">${Array.from({ length: E.questions }, (_, i) =>
    `<span class="slot-q ${i < r.length ? (r[i] ? 'ok' : 'miss') : ''}">${i < r.length ? (r[i] ? '✓' : '✗') : i + 1}</span>`).join('')}
    <span class="need">Need ${E.needed}</span></div>`;
}
function statLine(a, b) {
  const rows = [['HP', 'hp'], ['Attack', 'atk'], ['Defense', 'def'], ['Speed', 'spd']];
  return rows.map(([lab, k]) => `<div class="statrow"><span>${lab}</span><b>${b[k]}</b><span class="gain">+${b[k] - a[k]}</span></div>`).join('');
}
function renderTrial() {
  const c = byUid(ctx.uid), E = ctx.cfg || trialCfg(c), zone = trialZone(c);
  const sp = SP[c.n], fin = ctx.cfg ? ctx.cfg === CONFIG.evolution.final : isFinalTrial(c);
  const right = (ctx.results || []).filter(x => x).length;
  let scene = '', panel = '';
  if (ctx.phase === 'evolving' || ctx.phase === 'passed') {
    const before = SP[ctx.fromN];
    scene = `<div class="stage evo-stage"><div class="rays"></div>
      ${ctx.phase === 'evolving' ? `<div class="foe evo-old">${art(before.n, { shiny: c.shiny })}</div>` : ''}
      <div class="foe evo-new ${ctx.phase === 'passed' ? 'bob' : ''}">${artC(c)}</div></div>`;
    panel = ctx.phase === 'evolving' ? `<p class="result-msg">What’s happening to ${before.name}?</p>` :
      `<p class="result-msg">${before.name} evolved into ${sp.name}!</p>${sp.stage === 3 ? '<p><b>Final form reached.</b> This is the strongest a Numling can become.</p>' : ''}
      <p>You got ${right} of ${E.questions} hard problems right. That’s real mastery.</p>
      <div class="stack" style="gap:6px;margin:10px 0">${statLine(ctx.oldStats, stats(c))}</div>
      <p class="small"><b>New signature move:</b> ${sp.move} (${TYPE_LABEL[sp.type]}). It hits harder than ${before.move}.</p>
      ${ctx.xp ? `<p class="small muted">${sp.name} also earned ${ctx.xp} XP during the trial.</p>` : ''}
      <div class="btn-row"><button class="btn primary" data-act="nav" data-to="team">See your team</button><button class="btn" data-act="species" data-n="${sp.n}">Codex entry</button></div>`;
  } else {
    scene = `<div class="stage duo"><div class="foe bob">${artC(c)}</div><span class="arrow" aria-hidden="true">→</span><div class="foe mystery">${art(sp.evo, { sil: true })}</div></div>`;
    if (ctx.phase === 'failed') {
      const short = E.needed - right;
      panel = `<p class="result-msg">${short === 1 ? `${right} of ${E.needed}. So close!` : `${right} of ${E.needed} needed.`}</p>
        <p>${short === 1 ? 'One more right answer and it would have evolved.' : 'These are the hardest problems in the game. Train on Challenge, then try again.'} You can retry as many times as you like, and every attempt brings new problems.</p>
        ${ctx.xp ? `<p class="small muted">${sp.name} still earned ${ctx.xp} XP from this attempt.</p>` : ''}
        ${trialTrack()}
        <div class="btn-row"><button class="btn primary" data-act="trial-start">Try again</button><button class="btn" data-act="train-this">Train first</button><button class="btn ghost" data-act="nav" data-to="team">Back to team</button></div>`;
    } else if (ctx.phase === 'running') {
      panel = `<p class="result-msg">Trial in progress</p><p>${right} right so far.</p>${trialTrack()}`;
    } else {
      panel = `<p class="result-msg">${sp.name} is ready ${fin ? 'for its final evolution' : 'to evolve'}.</p>
        ${fin ? '<p><b>Final trial.</b> Every problem is from the hardest tier, so this one takes real skill.</p>' : ''}
        <p>Prove you’ve mastered ${ZONES[sp.zone] ? ZONES[sp.zone].name : 'your zone'} skills. You’ll get ${E.questions} hard problems with ${E.seconds} seconds each. Get ${E.needed} right and ${sp.name} evolves. The trial ends after ${E.questions - E.needed + 1} misses.</p>
        <p class="small muted">Retry as many times as you need. Every correct answer earns XP, even if the trial doesn’t pass.</p>
        ${trialTrack()}
        <div class="btn-row"><button class="btn primary" data-act="trial-start">Start the trial</button><button class="btn ghost" data-act="nav" data-to="team">Not yet</button></div>`;
    }
  }
  return `<div class="enc theme-${zone}">
    <div class="scene trial-scene">${sceneSVG(zone)}<span class="scene-tag">${fin ? 'Final evolution trial' : 'Evolution trial'}</span>${scene}</div>
    <div class="panel enc-info"><h2 class="enc-name">${ctx.phase === 'evolving' ? SP[ctx.fromN].name : sp.name}</h2>
      <div class="chips" style="margin:6px 0 4px">${typeChip(sp.type)}<span class="chip" style="--c:var(--none)">Level ${c.lv}</span></div>${panel}</div>
  </div>`;
}
async function runTrial() {
  const c = byUid(ctx.uid); if (!c || !canEvolve(c)) { go('team'); return; }
  const E = trialCfg(c), here = ctx, zone = trialZone(c);
  here.cfg = E; here.results = []; here.xp = 0; here.phase = 'running';
  G.stats.trials[0]++; save(); render();
  const maxMiss = E.questions - E.needed;
  while (here.results.length < E.questions) {
    const right = here.results.filter(x => x).length, miss = here.results.length - right;
    if (right >= E.needed || miss > maxMiss) break;
    const i = here.results.length, tier = E.tiers[i] || 3;
    const res = await askQuestion({ topic: trialTopic(c), tier, seconds: E.seconds, theme: zone, side: true, autoMs: 1100, support: false,
      title: E === CONFIG.evolution.final ? L('Final evolution trial', 'Prueba de evolución final') : L('Evolution trial', 'Prueba de evolución'), headArt: artC(c, { label: false }),
      head: `<span class="pips">${Array.from({ length: E.questions }, (_, k) => `<span class="pip ${k < i ? (here.results[k] ? 'on' : 'off') : ''}"></span>`).join('')}</span>`,
      sub: L(`Problem ${i + 1} of ${E.questions}. ${right} right, ${miss} missed. Need ${E.needed}.`, `Problema ${i + 1} de ${E.questions}. ${right} correctas, ${miss} errores. Necesitas ${E.needed}.`),
      onResult: ok => { if (!ok) return ''; const xp = trainXp(tier, c.lv); addXp(c, xp); here.xp += xp; return ` +${xp} XP.`; } });
    if (ctx !== here) return;
    here.results.push(res === 'correct');
    render(); await sleep(300);
  }
  const passed = here.results.filter(x => x).length >= E.needed;
  if (!passed) { here.phase = 'failed'; save(); render(); return; }
  here.fromN = c.n; here.oldStats = stats(c);
  c.n = SP[c.n].evo; G.seen.add(c.n); G.caught.add(c.n); if (c.shiny) G.shinies.add(c.n); G.stats.trials[1]++; questEvent('evolve'); save();
  here.phase = 'evolving'; render();
  await sleep(matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 2400);
  if (ctx !== here) return;
  here.phase = 'passed'; render();
}
