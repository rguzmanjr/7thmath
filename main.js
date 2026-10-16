/* Numlings: button actions and startup (loads last) */
'use strict';
/* ========================= actions ========================= */
const ACT = {
  nav: t => (t.dataset.to === 'explore' ? exploreNav() : go(t.dataset.to)),
  lang: t => { const nm = $('#tname'); if (nm) ctx.name = nm.value; setLang(t.dataset.l); render(); },
  'to-town': () => (W && W.zone === 'town' ? go('map') : enterTown()),
  'world-map': () => go('explore'),
  'q-track': t => { G.tracked = t.dataset.q; save(); render(); toast('Tracking this quest on the map.'); },
  'q-cap': t => { G.capColor = t.dataset.c; save(); render(); },
  'q-title': t => { G.title = t.dataset.t; save(); render(); toast(`Your title is now “${G.title}.”`); },
  'to-title': () => go('title'),
  'to-new': async () => {
    if (loadLocal() && !(await confirmBox('Starting a new game will replace the game saved in this browser. Copy your save code first if you want to keep it.', 'Start a new game', true))) return;
    go('newgame', {});
  },
  continue: () => { G = loadLocal(); W = null; if (G) enterTown(); else toast('No saved game found in this browser.'); },
  'load-code-title': () => promptLoadCode(),
  'pick-starter': t => { ctx.name = $('#tname').value; ctx.starter = +t.dataset.n; render(); },
  'start-game': () => {
    const name = $('#tname').value.replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
    if (!name) { toast('Type a trainer nickname first.'); $('#tname').focus(); return; }
    if (!ctx.starter) { toast('Choose your first Numling.'); return; }
    G = freshState(name);
    G.cap = ctx.cap || 0;
    addToCollection(ctx.starter, 5);
    const starterName = SP[ctx.starter].name;
    save(); enterTown(); toast(tx(L(`${starterName} joined your team!`, `¡${starterName} se unió a tu equipo!`)));
  },
  'enter-zone': t => enterZone(t.dataset.zone),
  'explore-again': () => (W ? go('map') : enterTown()),
  'leave-zone': () => leaveZone(),
  'pick-cap': t => { ctx.name = $('#tname').value; ctx.cap = +t.dataset.c; render(); },
  'try-catch': () => tryCatch(),
  'start-battle': () => startBattle({ zone: ctx.zone, foes: [{ n: ctx.wild.n, lv: ctx.wild.battleLv, shiny: ctx.wild.shiny }], wild: ctx.wild }),
  'catch-after': () => { const z = ctx.zone, w = ctx.wild; go('encounter', { zone: z, wild: w, afterBattle: true }); },
  move: t => battleTurn({ move: +t.dataset.i }),
  swap: t => battleTurn({ swap: +t.dataset.i }),
  run: () => {
    const tr = ctx.trainer;
    toast(tr ? `You can battle ${tr.short} again anytime.` : 'You got away safely.');
    W ? go('map') : enterTown();
  },
  detail: t => showDetail(+t.dataset.uid),
  species: t => showSpecies(+t.dataset.n),
  'train-topic': t => { ctx.topic = t.dataset.t; ctx.summary = ''; render(); },
  'train-tier': t => { ctx.tier = +t.dataset.t; ctx.skill = null; ctx.summary = ''; render(); },
  'train-skill': t => { ctx.skill = t.dataset.s || null; ctx.summary = ''; render(); },
  'train-go': () => runTraining(),
  'dungeon-open': () => go('dungeon', { phase: 'lobby', diff: 'easy' }),
  'dg-diff': t => { ctx.diff = t.dataset.d; render(); },
  'dg-start': () => startDungeon(),
  'dg-catch': () => startDgCatch(),
  'dg-letgo': () => { const q = ctx.queue.shift(); ctx.catchMsg = `You let ${SP[q.n].name} go.`; render(); },
  'dg-lobby': () => go('dungeon', { phase: 'lobby', diff: ctx.diff }),
  'dg-quit': async () => { const r = ctx.run; if (!r) return; r.busy = true; cancelAnimationFrame(dgTimer);
    const isCatch = r.mode === 'catch';
    if (await confirmBox(isCatch ? `Stop trying to catch ${SP[r.guard].name}? It will escape.` : 'Leave the dungeon? Your run ends here.', isCatch ? 'Let it escape' : 'Leave', true)) { isCatch ? dgCatchEnd(false) : dgEnd(false, true); }
    else { r.busy = false; dgNext(); } },
  'trial-start': () => { ctx.cfg = null; runTrial(); },
  'train-this': () => go('train', { uid: ctx.uid, tier: 3 }),
  'turn-in': async () => {
    save(); const code = encodeSave(G), url = CONFIG.turnIn.url;
    try { await navigator.clipboard.writeText(code); } catch (e) { /* the form link still carries the code */ }
    const link = url.includes('CODE') ? url.replace('CODE', encodeURIComponent(code)) : url;
    window.open(link, '_blank', 'noopener');
    toast(url.includes('CODE') ? 'Your code is filled in. Press Submit on the form.' : 'Code copied. Paste it into the form, then press Submit.', 4500);
  },
  'show-code': () => { ctx.showCode = true; render(); setTimeout(() => $('#codeOut')?.select(), 30); },
  'copy-code': async () => {
    const box = $('#codeOut'); box.select();
    try { await navigator.clipboard.writeText(box.value); toast('Save code copied.'); }
    catch (e) { try { document.execCommand('copy'); toast('Save code copied.'); } catch (e2) { toast('Select the code and copy it yourself.'); } }
  },
  'load-code': async () => {
    const v = $('#codeIn').value; if (!v.trim()) { toast('Paste a save code first.'); return; }
    let st; try { st = decodeSave(v); } catch (err) { toast(err.message, 4000); return; }
    if (!(await confirmBox(`Load ${esc(st.trainer)}’s game? It will replace the game on this device.`, 'Load game'))) return;
    G = st; W = null; save(); enterTown(); toast(`Welcome back, ${G.trainer}!`);
  },
  reset: async () => {
    if (!(await confirmBox('Start over? Your current game will be erased from this browser. Copy your save code first if you might want it back.', 'Erase and start over', true))) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    G = null; W = null; go('newgame', {});
  },
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t || t.disabled || !$('#app').contains(t) && !$('#nav').contains(t)) return;
  const f = ACT[t.dataset.act]; if (f) f(t, e);
});
document.addEventListener('change', e => {
  if (e.target.dataset.change === 'train-uid') { ctx.uid = +e.target.value; ctx.summary = ''; render(); }
});

/* ========================= boot ========================= */
buildSprites();
G = loadLocal();
go('title');
