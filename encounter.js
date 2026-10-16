/* Numlings: themed scenery, wild encounters, and catching */
'use strict';
/* ========================= themed scenery ========================= */
function sceneSVG(zone) {
  const id = 'sc' + (++svgSeq);
  if (zone === 'bluffs') {
    const stones = Array.from({ length: 9 }, (_, i) => `<ellipse cx="${(i * 53 + 20) % 400}" cy="${200 + (i * 17) % 34}" rx="${8 + i % 3 * 3}" ry="${4 + i % 2 * 2}" fill="#9C968C" stroke="#6E6A63" stroke-width="1.2"/>`).join('');
    const flowers = Array.from({ length: 10 }, (_, i) => `<circle cx="${(i * 71) % 400 + 8}" cy="${206 + (i * 13) % 30}" r="2.6" fill="${['#FFFFFF', '#FFD43B', '#B79CFF'][i % 3]}"/>`).join('');
    return `<svg class="scenery" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FCBEA"/><stop offset="1" stop-color="#E8F2F8"/></linearGradient></defs>
      <rect width="400" height="240" fill="url(#${id})"/>
      <g fill="#fff" opacity=".85"><ellipse cx="300" cy="36" rx="30" ry="9"/><ellipse cx="318" cy="30" rx="16" ry="8"/><ellipse cx="70" cy="50" rx="22" ry="7"/></g>
      <path d="M-10 130 L50 60 L90 95 L150 30 L210 92 L260 50 L320 100 L360 66 L410 110 V160 H-10Z" fill="#A7B4C2"/>
      <path d="M150 30 L163 46 L156 46 L150 54 L141 44Z M260 50 L270 62 L258 60Z M50 60 L60 72 L48 70Z" fill="#fff"/>
      <path d="M-10 150 L40 112 L95 140 L140 104 L200 146 L250 116 L300 150 L350 120 L410 146 V200 H-10Z" fill="#B9A688"/>
      <path d="M-10 150 L40 112 L95 140 L140 104 L200 146 L250 116 L300 150 L350 120 L410 146" stroke="#8E7A5C" stroke-width="3" fill="none"/>
      <g transform="translate(318 118)"><path d="M-10 26 L0 4 L10 26Z" fill="#7E7A72" stroke="#4A4740" stroke-width="1.4"/><path d="M-22 4 H22" stroke="#5E5B55" stroke-width="3" stroke-linecap="round"/>
        <path d="M-26 10 Q-20 16 -14 10Z M14 10 Q20 16 26 10Z" fill="#C9C6BC" stroke="#4A4740" stroke-width="1.2"/></g>
      <path d="M0 176 C120 164 260 184 400 170 V240 H0Z" fill="#A9C98A"/>
      <path d="M0 196 C140 186 260 204 400 192 V240 H0Z" fill="#94B874"/>
      ${stones}${flowers}</svg>`;
  }
  if (zone === 'rapids') {
    const pines = Array.from({ length: 14 }, (_, i) => { const x = i * 31 - 6, h = 34 + (i * 37 % 19);
      return `<path d="M${x} 132 L${x + 14} ${132 - h} L${x + 28} 132Z" fill="${i % 2 ? '#2E7D3E' : '#3A8C4A'}"/>`; }).join('');
    const streaks = Array.from({ length: 16 }, (_, i) => `<path class="rapid" d="M${i * 26 + 4} ${148 + (i * 7) % 16} q8 -3 16 0" stroke="#D8F0FF" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join('');
    const flowers = Array.from({ length: 12 }, (_, i) => `<circle cx="${(i * 67) % 400 + 10}" cy="${196 + (i * 23) % 40}" r="3" fill="${['#FF7A9C', '#FFD43B', '#fff'][i % 3]}"/>`).join('');
    return `<svg class="scenery" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B6E3F0"/><stop offset="1" stop-color="#E6F6EA"/></linearGradient></defs>
      <rect width="400" height="240" fill="url(#${id})"/>
      <path d="M-10 120 L60 58 L110 98 L170 40 L240 104 L300 62 L360 100 L410 70 V140 H-10Z" fill="#8FB3C9"/>
      <path d="M160 49 L170 40 L181 51 L174 50 L170 54 L165 49Z M292 69 L300 62 L309 71 L300 72Z" fill="#fff"/>
      ${pines}
      <path d="M0 136 C120 126 260 150 400 132 V176 C260 190 120 168 0 184Z" fill="#2F86C8"/>
      ${streaks}
      <path d="M0 180 C120 166 260 190 400 174 V240 H0Z" fill="#A6D57E"/>
      <path d="M0 200 C140 190 260 210 400 196 V240 H0Z" fill="#96CB6C"/>
      ${flowers}</svg>`;
  }
  const ticks = [-3, -2, -1, 0, 1, 2, 3].map((v, i) => { const x = 56 + i * 48;
    return `<path d="M${x} 214v10" stroke="#8C6A3E" stroke-width="2.5"/><text x="${x}" y="236" text-anchor="middle" font-size="11" font-weight="700" font-family="Lexend, sans-serif" fill="#8C6A3E">${num(v)}</text>`; }).join('');
  return `<svg class="scenery" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CFF2"/><stop offset="1" stop-color="#D5F2FC"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#${id})"/>
    <circle cx="334" cy="40" r="30" fill="#FFF3B0" opacity=".55"/><circle cx="334" cy="40" r="20" fill="#FFE27A"/>
    <g fill="#fff" opacity=".92"><ellipse cx="78" cy="38" rx="28" ry="9"/><ellipse cx="96" cy="31" rx="16" ry="9"/><ellipse cx="210" cy="58" rx="22" ry="7"/><ellipse cx="224" cy="53" rx="12" ry="7"/></g>
    <rect y="104" width="400" height="56" fill="#46AEDD"/>
    <g stroke="#B9E6F8" stroke-width="2.4" fill="none" stroke-linecap="round" class="wave">
      <path d="M20 120 q8 -5 16 0 t16 0"/><path d="M150 132 q8 -5 16 0 t16 0"/><path d="M300 124 q8 -5 16 0 t16 0"/><path d="M90 146 q8 -5 16 0 t16 0"/><path d="M250 148 q8 -5 16 0 t16 0"/></g>
    <ellipse cx="300" cy="106" rx="42" ry="7" fill="#F1DDA6"/>
    <path d="M300 104 Q298 92 303 80" stroke="#8C5A2E" stroke-width="3" fill="none"/>
    <g fill="#3FA34D"><ellipse cx="296" cy="80" rx="9" ry="3" transform="rotate(-20 296 80)"/><ellipse cx="310" cy="80" rx="9" ry="3" transform="rotate(20 310 80)"/><ellipse cx="303" cy="76" rx="3" ry="8"/></g>
    <path d="M0 158 Q200 140 400 158 V240 H0Z" fill="#F1DDA6"/>
    <path d="M0 176 Q200 162 400 176" stroke="#E2C886" stroke-width="3" fill="none"/>
    <path d="M40 219 H360" stroke="#8C6A3E" stroke-width="2.5"/><path d="M360 219 l-8 -5 v10z M40 219 l8 -5 v10z" fill="#8C6A3E"/>
    ${ticks}
    <g fill="#F4A6A0" stroke="#C0706A" stroke-width="1"><path d="M352 186 q6 -10 12 0z"/><path d="M28 196 q5 -8 10 0z"/></g></svg>`;
}
function catchRing(c) {
  const R = 46, C = 2 * Math.PI * R, seg = C / c.need, gap = c.need > 1 ? 7 : 0;
  return `<svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><g>${Array.from({ length: c.need }, (_, i) =>
    `<circle cx="50" cy="50" r="${R}" fill="none" stroke="${i < c.got ? '#FFD43B' : 'rgba(255,255,255,.55)'}" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${seg - gap} ${C}" stroke-dashoffset="${-i * seg}" transform="rotate(-90 50 50)"/>`).join('')}</g></svg>`;
}

/* ========================= encounter / catching ========================= */
function catchPlan(r, shiny = false) {
  const n = RARITY[r].tiers.length, s = CONFIG.catchSeconds[r];
  const misses = CONFIG.catchMissesAllowed + (shiny ? CONFIG.encounters.shinyExtraMiss : 0);
  const time = s >= 120 && s % 60 === 0 ? L(s / 60 + ' minutes', s / 60 + ' minutos') : L(s + ' seconds', s + ' segundos');
  return bi(L(`Solve ${n} problem${n > 1 ? 's' : ''}. ${s ? `You get ${time.en} for each one.` : 'No timer.'} ${misses + 1} misses and it runs away.`,
              `Resuelve ${n} problema${n > 1 ? 's' : ''}. ${s ? `Tienes ${time.es} para cada uno.` : 'Sin tiempo límite.'} Con ${misses + 1} errores se escapa.`));
}
function matchupText(myType, foeType) {
  const m = typeMult(myType, foeType), t = typeMult(foeType, myType);
  if (m > 1) return bi(L('You have the type advantage.', 'Tienes la ventaja de tipo.'));
  if (t > 1) return bi(L('It has the type advantage. Consider switching your lead in Team.', 'Tiene la ventaja de tipo. Considera cambiar a tu líder en Equipo.'));
  return bi(L('Even matchup.', 'Combate parejo.'));
}
const zoneBack = () => tx(W ? L(`Back to ${mapName(W.zone)}`, `Volver a ${mapName(W.zone)}`) : L('Back to zones', 'Volver a las zonas'));
function renderEncounter() {
  const z = ZONES[ctx.zone], w = ctx.wild, s = SP[w.n], ld = lead();
  const enter = ctx.fresh; ctx.fresh = false;
  const owned = G.caught.has(w.n) && ctx.result !== 'caught';
  const full = G.creatures.length >= CONFIG.boxLimit;
  const foeCls = ctx.result === 'caught' ? 'captured' : ctx.result === 'fled' ? 'flee' : 'bob';
  let status = '', actions = '';
  const T = (en, es) => bi(L(en, es)), B = k => t(k);
  if (ctx.result === 'caught') {
    status = `<p class="result-msg">${T(`${w.shiny ? 'A shiny ' : ''}${s.name} joined your collection!`, `¡${s.name}${w.shiny ? ' brillante' : ''} se unió a tu colección!`)}</p>${w.shiny ? `<p>${T('<b>✦ That’s a shiny.</b> It’s marked in your Codex and keeps its colors when it evolves.', '<b>✦ Es brillante.</b> Queda marcado en tu Códex y conserva sus colores cuando evoluciona.')}</p>` : ''}<p>${bi(ctx.joined)}</p>`;
    actions = `<button class="btn primary" data-act="explore-again">${B('keepExploring')}</button><button class="btn" data-act="nav" data-to="team">${B('seeTeam')}</button>`;
  } else if (ctx.result === 'fled') {
    status = `<p class="result-msg">${T(`${s.name} ran off.`, `${s.name} se escapó.`)}</p><p class="muted">${T('No worries. Another one could show up anytime.', 'No te preocupes. Otro puede aparecer en cualquier momento.')}</p>`;
    actions = `<button class="btn primary" data-act="explore-again">${B('keepExploring')}</button>`;
  } else {
    if (ctx.afterBattle) status = `<p class="result-msg">${T(`You won! ${s.name} is still hanging around.`, `¡Ganaste! ${s.name} sigue por aquí.`)}</p>`;
    if (full) status += `<p class="banner">${T(`Your collection is full (${CONFIG.boxLimit}). Release a Numling in Team to make room.`, `Tu colección está llena (${CONFIG.boxLimit}). Libera un Numling en Equipo para hacer espacio.`)}</p>`;
    actions = ctx.catching ? '' : `<button class="btn primary" data-act="try-catch" ${full ? 'disabled' : ''}>${B('catchIt')}</button>
      ${ctx.afterBattle ? '' : `<button class="btn" data-act="start-battle">${B('battle')}</button>`}
      <button class="btn" data-act="explore-again">${ctx.afterBattle ? B('keepExploring') : B('walkAway')}</button>`;
  }
  const card = ctx.result === 'caught' ? `<div class="dexcard"><span class="dexno">No. ${s.n}</span><div class="art-wrap">${artC(w)}</div><b>${w.shiny ? '✦ ' : ''}${s.name}</b>${stars(s.r)}<span class="stamp">${tx(L('Caught', 'Atrapado'))}</span></div>` : '';
  const misses = ctx.catching ? CONFIG.catchMissesAllowed + 1 - ctx.catching.misses : 0;
  return `<div class="enc theme-${ctx.zone}">
    <div class="scene${enter ? ' enter' : ''}${s.r >= 3 ? ' shine r' + s.r : ''}${w.shiny ? ' shiny-scene' : ''}">
      ${sceneSVG(ctx.zone)}
      <span class="scene-tag">${tx(L(`${w.shiny && enter ? '✦ A shiny appeared! ' : ''}Spotted at (${num(w.spot[0])}, ${num(w.spot[1])})`, `${w.shiny && enter ? '✦ ¡Apareció uno brillante! ' : ''}Visto en (${num(w.spot[0])}, ${num(w.spot[1])})`))}</span>
      ${ctx.catching ? `<span class="scene-tag right">${tx(L(`${ctx.catching.got} of ${ctx.catching.need} solved. ${misses} ${misses === 1 ? 'miss' : 'misses'} left.`, `${ctx.catching.got} de ${ctx.catching.need} resueltos. Te ${misses === 1 ? 'queda' : 'quedan'} ${misses} ${misses === 1 ? 'error' : 'errores'}.`))}</span>` : ''}
      <div class="stage"><div class="plat"></div><div class="foe ${foeCls}">${artC(w)}</div>${ctx.catching ? catchRing(ctx.catching) : ''}</div>
      ${card}
    </div>
    <div class="panel enc-info">
      <h2 class="enc-name">${w.shiny ? '<span class="shiny-star" aria-hidden="true">✦</span>' : ''}${s.name}</h2>
      <div class="chips" style="margin-top:6px">${typeChip(s.type)}${w.shiny ? shinyChip : ''}<span class="chip" style="--c:var(--none)">${tx(L(`Catch level ${w.lv}`, `Nivel de captura ${w.lv}`))}</span>${rarityTag(s.r)}${owned ? `<span class="small muted">${tx(L('Already in your codex', 'Ya está en tu códex'))}</span>` : ''}</div>
      ${ctx.result || ctx.catching ? '' : `<ul class="facts">
        ${w.shiny ? `<li><b>${tx(L('Shiny!', '¡Brillante!'))}</b><span>${T(`A rare recolor. Only about 1 in ${Math.round(1 / CONFIG.encounters.shinyChance)} wild Numlings is shiny. You get ${CONFIG.encounters.shinyExtraMiss} extra miss to catch it.`, `Un color raro. Solo 1 de cada ${Math.round(1 / CONFIG.encounters.shinyChance)} Numlings salvajes es brillante. Tienes ${CONFIG.encounters.shinyExtraMiss} error extra para atraparlo.`)}</span></li>` : ''}
        <li><b>${tx(L('To catch', 'Para atraparlo'))}</b><span>${catchPlan(s.r, w.shiny)} ${T(`It joins your team at level ${w.lv}.`, `Se une a tu equipo en el nivel ${w.lv}.`)}</span></li>
        ${ctx.afterBattle ? '' : `<li><b>${tx(L('In battle', 'En combate'))}</b><span>${w.battleLv > w.lv ? T(`It powers up to level ${w.battleLv} to match your team.`, `Sube al nivel ${w.battleLv} para igualar a tu equipo.`) : T(`It fights at level ${w.lv}.`, `Combate en el nivel ${w.lv}.`)}</span></li>`}
        <li><b>${tx(L('Your lead', 'Tu líder'))}</b><span>${T(`${SP[ld.n].name} (${TYPE_LABEL[SP[ld.n].type]}), level ${ld.lv}.`, `${SP[ld.n].name} (${TYPE_LABEL[SP[ld.n].type]}), nivel ${ld.lv}.`)} ${matchupText(SP[ld.n].type, s.type)}</span></li></ul>`}
      ${ctx.catching ? `<p class="note">${T(`Each correct answer tightens the ring. Fill it to catch ${s.name}!`, `Cada respuesta correcta cierra el anillo. ¡Llénalo para atrapar a ${s.name}!`)}</p>` : ''}
      ${status}
      <div class="btn-row">${actions}</div>
    </div>
  </div>`;
}
async function tryCatch() {
  const w = ctx.wild, s = SP[w.n], tiers = RARITY[s.r].tiers, topic = ZONES[ctx.zone].topic;
  const allowed = CONFIG.catchMissesAllowed + (w.shiny ? CONFIG.encounters.shinyExtraMiss : 0), here = ctx;
  here.catching = { got: 0, need: tiers.length, misses: 0 }; render();
  while (here.catching.got < tiers.length && here.catching.misses <= allowed) {
    const c = here.catching, left = allowed - c.misses;
    const pips = `<span class="pips" aria-label="${c.got} of ${tiers.length} solved">${tiers.map((_, i) => `<span class="pip ${i < c.got ? 'on' : ''}"></span>`).join('')}</span>`;
    const res = await askQuestion({ topic, tier: tiers[c.got], seconds: CONFIG.catchSeconds[s.r], autoMs: 1000, theme: ctx.zone, side: true,
      title: L(`Catch ${w.shiny ? 'shiny ' : ''}${s.name}`, `Atrapa a ${s.name}${w.shiny ? ' brillante' : ''}`), head: pips, headArt: artC(w, { label: false }),
      sub: L(`Problem ${c.got + 1} of ${tiers.length}. ${left === 0 ? 'One more miss and it runs away.' : `It runs away after ${left + 1} misses.`}`,
             `Problema ${c.got + 1} de ${tiers.length}. ${left === 0 ? 'Un error más y se escapa.' : `Se escapa después de ${left + 1} errores.`}`) });
    if (solved(res)) c.got++; else c.misses++;
    if (ctx !== here) return;
    render();
    await sleep(350);
  }
  const success = here.catching.got >= tiers.length;
  delete here.catching;
  if (success) {
    const c = addToCollection(w.n, w.lv, !!w.shiny);
    G.stats.caught++; questEvent('catch', { zone: here.zone, n: w.n });
    here.result = 'caught';
    here.joined = G.party.includes(c.uid) ? L('It’s on your team now.', 'Ya está en tu equipo.') : L('Your team is full, so it went to your collection. Swap it in from Team anytime.', 'Tu equipo está lleno, así que se fue a tu colección. Cámbialo desde Equipo cuando quieras.');
  } else here.result = 'fled';
  save(); render();
}
