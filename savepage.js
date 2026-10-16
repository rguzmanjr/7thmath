/* Numlings: the Save page and trainer card */
'use strict';
/* ========================= save page ========================= */
function renderSave() {
  const s = G.stats, acc = s.answered ? Math.round(s.correct / s.answered * 100) : 0;
  const since = new Date(G.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const topicRows = Object.keys(ZONES).map(z => {
    const t = ZONES[z].topic, [a, c] = s.topics[t] || [0, 0], p = a ? Math.round(c / a * 100) : 0;
    return `<div class="topicrow"><span>${ZONES[z].name}</span><span class="statbar"><i style="width:${p}%"></i></span><span>${a ? p + '%' : 'None yet'}</span></div>`;
  }).join('');
  return `<div class="page-head"><h2>Save</h2></div>
  <div class="stack">
    <div class="panel"><h3>${esc(G.trainer)}${G.title ? `<span class="trainer-title">${esc(G.title)}</span>` : ''}</h3><span class="small muted">Trainer since ${since}. ${QUESTS.filter(q => isDone(q.id)).length} of ${QUESTS.length} quests complete.</span>
      <div class="card-stats">
        <div><b>${s.correct}</b>problems solved</div><div><b>${acc}%</b>accuracy</div>
        <div><b>${G.caught.size}/${SPECIES.length}</b>codex caught</div><div><b>${s.won}</b>battles won</div>
        <div><b>${G.trainerWins.size}</b>trainers beaten</div>
        <div><b>${SKILLS.filter(k => skillStatus(k.id).cls === 'mastered').length}/${SKILLS.length}</b>skills mastered</div>
        <div><b>${s.trials[1]}/${s.trials[0]}</b>evolution trials passed</div>
        <div><b>${G.creatures.filter(c => c.shiny).length}</b>shinies caught</div></div>
      <div style="margin-top:14px"><b class="small">Dungeon of Multiplia</b><div class="badges">${['easy', 'hard', 'chaos'].map(d => { const r = G.dungeon[d];
        return `<span class="badge ${r.clears ? 'on' : ''}" style="--c:${DG[d].color}"><span class="crest-wrap">${crestSVG(d, r.clears > 0)}</span>${DG[d].label}<small>${r.clears ? `Fastest ${fmtSec(r.fastest)}, ${(r.avg / 10).toFixed(1)} s per fact` : r.best ? `Best: ${r.best} facts` : 'Not yet'}</small></span>`; }).join('')}</div></div>
      <div style="margin-top:14px"><b class="small">Badges</b><div class="badges">${Object.entries(ZONES).map(([id, z]) => `<span class="badge ${G.badges.has(id) ? 'on' : ''}" style="--c:${z.color}"><i aria-hidden="true">★</i>${z.name}<small>${G.badges.has(id) ? 'Earned' : 'Not yet'}</small></span>`).join('')}</div></div>
      <div style="margin-top:14px"><b class="small">Accuracy by zone</b>${topicRows}</div></div>

    ${CONFIG.turnIn && CONFIG.turnIn.url ? `<div class="panel turnin"><h3>Turn in your progress</h3>
      <p>Your teacher uses this to see which skills you’ve mastered. It copies your save code and opens your class form.</p>
      <div class="btn-row"><button class="btn primary" data-act="turn-in">Turn in my progress</button></div></div>` : ''}

    <div class="panel"><h3>${tx(L('Language', 'Idioma'))}</h3>
      <p class="small muted">${bi(L('Choose English, Spanish, or both. With both, every problem, hint, and explanation shows English with Spanish underneath. You can also switch inside any question.', 'Escoge inglés, español o los dos. Con los dos, cada problema, pista y explicación aparece en inglés con el español abajo. También puedes cambiar dentro de cualquier pregunta.'))}</p>
      ${langSwitch()}</div>

    <div class="panel"><h3>Saving on this device</h3>
      ${storageOK ? `<p>Your game saves automatically in this browser on this device.</p>` : `<p><b>This browser can’t save automatically.</b> Copy your save code below before you close the page, or your progress will be lost.</p>`}
      ${storageOK && !lastSaveOK ? '<p class="banner">The last save didn’t go through. Copy your save code to be safe.</p>' : ''}</div>

    <div class="panel"><h3>Play on another device</h3>
      <p>Copy your save code, then on the other device choose <b>I have a save code</b> and paste it. Your code changes as you play, so copy a new one each time you switch.</p>
      ${ctx.showCode ? `<textarea class="codebox" id="codeOut" readonly aria-label="Your save code">${encodeSave(G)}</textarea>
        <div class="btn-row"><button class="btn primary" data-act="copy-code">Copy code</button></div>`
        : `<div class="btn-row"><button class="btn primary" data-act="show-code">Show my save code</button></div>`}</div>

    <div class="panel"><h3>Load a save code</h3><p class="small muted">This replaces the game on this device with the game in the code.</p>
      <textarea class="codebox" id="codeIn" aria-label="Paste a save code" placeholder="Paste a code that starts with NL1."></textarea>
      <div class="btn-row"><button class="btn" data-act="load-code">Load this code</button></div></div>

    <div><button class="btn danger" data-act="reset">Start over with a new game</button></div>
  </div>`;
}
function promptLoadCode() {
  const ov = openModal(`<h2>Load a save code</h2><p>Paste the code you copied from your other device.</p>
    <textarea class="codebox" id="codeModal" aria-label="Save code" placeholder="Paste a code that starts with NL1."></textarea>
    <p class="q-warn" id="codeErr"></p>
    <div class="btn-row"><button class="btn primary" data-d="load">Load game</button><button class="btn" data-d="close">Cancel</button></div>`);
  setTimeout(() => $('#codeModal', ov).focus(), 30);
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    if (b.dataset.d === 'close') { closeModal(ov); return; }
    try { G = decodeSave($('#codeModal', ov).value); W = null; save(); closeModal(ov); enterTown(); toast(`Welcome back, ${G.trainer}!`); }
    catch (err) { $('#codeErr', ov).textContent = err.message; }
  });
}
