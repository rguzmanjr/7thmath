/* Numlings: modals, toasts, and the question popup */
'use strict';
/* ========================= modals, toasts ========================= */
const isTouchOnly = () => matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
function openModal(html, cls = '', ovCls = '') {
  const root = $('#modal-root');
  const ov = document.createElement('div');
  ov.className = 'overlay' + (isTouchOnly() ? ' touch' : '') + (ovCls ? ' ' + ovCls : '');
  ov.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  root.appendChild(ov);
  document.body.style.overflow = 'hidden';
  return ov;
}
function closeModal(ov) {
  ov.remove();
  if (!$('#modal-root').children.length) document.body.style.overflow = '';
}
function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}
function confirmBox(msg, okLabel = 'Yes', danger = false) {
  return new Promise(res => {
    const ov = openModal(`<p style="font-size:1.1rem;margin-top:0">${msg}</p>
      <div class="btn-row"><button class="btn ${danger ? 'danger' : 'primary'}" data-c="ok">${okLabel}</button><button class="btn" data-c="no">Cancel</button></div>`);
    ov.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      closeModal(ov); res(b.dataset.c === 'ok');
    });
    setTimeout(() => $('[data-c="no"]', ov).focus(), 30);
  });
}

/* ========================= the question popup =========================
   opt: { topic, tier, skill?, seconds, title, sub, head, headArt, allowSkip, allowStop, autoMs, support?, onResult(ok, withHint)->string }
   title, sub and onResult's text can be plain strings or L(english, spanish) pairs.
   resolves: 'correct' (first try) | 'assisted' (right after a hint) | 'wrong' | 'skip' | 'stop'
   With support on, a first wrong answer gets a hint (and names the mistake when it can tell), then one more try.
   The EN / ES / EN + ES switch in the corner relabels the question instantly without losing the timer or what was typed. */
function askQuestion(opt) {
  return new Promise(resolve => {
    const q = makeQuestion(opt.topic, opt.tier, opt.skill);
    const secs = opt.seconds || 0;
    const support = opt.support !== false && CONFIG.support.hints && (CONFIG.support.inBattles || !opt.battle);
    const keypad = `<div class="keypad">${['7', '8', '9', 'back', '4', '5', '6', '-', '1', '2', '3', '/', '0', '.'].map(k => `<button type="button" data-k="${k}" aria-label="${k === 'back' ? 'Delete' : k === '-' ? 'Negative sign' : k}">${k === 'back' ? '⌫' : k === '-' ? MINUS : k}</button>`).join('')}
          <button type="button" class="wide2" data-k=" " data-ui="space">${t('space')}</button></div>`;
    const ov = openModal(`
      <div class="q-head">${opt.headArt ? `<span class="q-art">${opt.headArt}</span>` : ''}<h2 class="q-title"></h2>${opt.head || ''}${langSwitch('qlang')}</div>
      <p class="q-sub"></p>
      ${secs ? `<div class="timer" role="progressbar" aria-label="Time left" aria-valuemin="0" aria-valuemax="${secs}"><i></i></div><div class="timer-num"></div>` : ''}
      <div class="q-text${q.long ? ' long' : ''}"></div>
      <div class="q-teks"></div>
      <div class="q-coach" aria-live="polite"></div>
      <div class="q-entry">
        ${q.kind === 'choice' ? `<div class="q-choices">${q.options.map((o, i) => `<button type="button" class="btn q-opt" data-opt="${i}"></button>`).join('')}</div><div class="q-warn" aria-live="polite"></div>` : `
        ${q.kind === 'ineq' ? `<div class="q-ineq"><span class="q-var">${V()}</span><div class="sym-row" role="group" aria-label="Inequality symbol">${['<', '>', '<=', '>='].map(sy => `<button type="button" class="sym" data-sym="${sy}" aria-pressed="false">${SYM[sy]}</button>`).join('')}</div></div>` : ''}
        <input class="q-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" ${isTouchOnly() ? 'inputmode="none"' : 'inputmode="text"'}>
        <p class="q-hint" data-ui="${q.kind === 'ineq' ? 'ineqHelp' : 'typeHelp'}"></p>
        <div class="q-warn" aria-live="polite"></div>${keypad}`}
        <div class="btn-row">
          ${q.kind === 'choice' ? '' : '<button class="btn primary" data-q="submit" data-ui="checkAnswer"></button>'}
          ${support ? '<button class="btn" data-q="hint" data-ui="hint"></button>' : ''}
          ${opt.allowSkip ? '<button class="btn" data-q="skip" data-ui="skip"></button>' : ''}
          ${opt.allowStop ? '<button class="btn" data-q="stop" data-ui="endTraining"></button>' : ''}
        </div>
      </div>
      <div class="q-fb" aria-live="polite"></div>`, 'q-sheet', [opt.theme ? 'qt-' + opt.theme : '', opt.low ? 'low' : '', opt.side ? 'side' : ''].join(' ').trim());
    const input = $('.q-input', ov), warn = $('.q-warn', ov), fbBox = $('.q-fb', ov), coach = $('.q-coach', ov);
    let done = false, timerId = null, autoId = null, tries = 0, hinted = false, firstMistake = null, sym = null, picked = null;
    let coachState = null, fbState = null, warnKey = null;
    const current = () => (q.kind === 'choice' ? { opt: picked } : q.kind === 'ineq' ? { sym, text: input.value } : input.value);
    // (re)draw every piece of text in the current language
    function paint() {
      $('.q-title', ov).innerHTML = bi(opt.title);
      const sub = $('.q-sub', ov); sub.innerHTML = bi(opt.sub || ''); sub.hidden = !opt.sub;
      $('.q-text', ov).innerHTML = bi(q.html);
      $('.q-teks', ov).innerHTML = `TEKS ${q.teks}: ${bi(q.skillLabel)}`;
      ov.querySelectorAll('[data-ui]').forEach(el => (el.innerHTML = t(el.dataset.ui)));
      ov.querySelectorAll('[data-opt]').forEach(b => (b.innerHTML = bi(q.options[+b.dataset.opt].html)));
      if (input) { input.placeholder = tx(UI[q.kind === 'ineq' ? 'number' : 'yourAnswer']); input.setAttribute('aria-label', input.placeholder); }
      if (warnKey) warn.textContent = t(warnKey);
      if (coachState) drawCoach();
      if (fbState) drawFb();
      ov.querySelectorAll('[data-act="qlang"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.l === LANG));
    }
    if (secs) {
      const bar = $('.timer i', ov), wrap = $('.timer', ov), lab = $('.timer-num', ov), t0 = performance.now();
      const tick = () => {
        const leftS = Math.max(0, secs - (performance.now() - t0) / 1000);
        bar.style.width = (leftS / secs * 100) + '%';
        wrap.classList.toggle('low', leftS / secs < 0.25);
        wrap.setAttribute('aria-valuenow', Math.ceil(leftS));
        const sl = Math.ceil(leftS);
        lab.textContent = sl >= 60 ? `${Math.floor(sl / 60)}:${String(sl % 60).padStart(2, '0')} ${tx(UI.left)}` : `${sl} ${tx(UI.secondsLeft)}`;
        if (leftS <= 0) finish('timeout');
      };
      tick(); timerId = setInterval(tick, 100);
    }
    const end = result => { if (autoId) clearTimeout(autoId); closeModal(ov); resolve(result); };
    function drawCoach() {
      const m = coachState.mistake;
      coach.innerHTML = `<div class="coach">${m ? `<p class="coach-mistake"><b>${t('notYet')}</b> ${bi(m)}</p>` : coachState.afterMiss ? `<p class="coach-mistake"><b>${t('notYet')}</b> ${t('takeAnother')}</p>` : ''}
        <p><b>${t('hint')}:</b> ${bi(q.hint)}</p>${coachState.afterMiss ? `<p class="small">${t('tryOnce')}</p>` : ''}</div>`;
    }
    function showHint(mistakeMsg) {
      hinted = true;
      const hb = $('[data-q="hint"]', ov); if (hb) hb.remove();
      coachState = { mistake: mistakeMsg, afterMiss: tries > 0 }; drawCoach();
    }
    function drawFb() {
      const f = fbState, extra = bi(f.extra || '');
      if (f.result === 'correct') fbBox.innerHTML = `<div class="fb good"><strong>${t('correct')}</strong>${extra}</div><div class="btn-row"><button class="btn primary" data-q="next">${t('continue')}</button></div>`;
      else if (f.result === 'assisted') fbBox.innerHTML = `<div class="fb good"><strong>${t('gotIt')}</strong>${t('niceHint')}${extra}<p class="explain">${bi(q.explain)}</p></div><div class="btn-row"><button class="btn primary" data-q="next">${t('continue')}</button></div>`;
      else fbBox.innerHTML = `<div class="fb bad"><strong>${f.timeout ? t('timesUp') : t('notQuite')}</strong>${t('answerIs')} ${bi(q.answerText)}.${extra}
          ${f.why ? `<p class="explain"><b>${t('whatHappened')}</b> ${bi(f.why)}</p>` : ''}<p class="explain"><b>${t('howToSolve')}</b> ${bi(q.explain)}</p></div>
          <div class="btn-row"><button class="btn primary" data-q="next">${t('continue')}</button></div>`;
    }
    function finish(kind) {
      if (done) return;
      if (kind === 'hint') { showHint(null); if (input) input.focus(); return; }
      if (kind === 'submit') {
        const chk = checkAnswer(q, current());
        if (!chk.valid) {
          warnKey = q.kind === 'ineq' && !sym ? 'tapSymbol' : 'typeNumber'; warn.textContent = t(warnKey);
          if (input) { input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake'); input.focus(); }
          return;
        }
        if (!chk.right && support && tries === 0) {   // first miss: coach, then let them try again
          tries = 1; firstMistake = chk.msg;
          showHint(firstMistake);
          if (q.kind === 'choice') { const b = $(`[data-opt="${picked}"]`, ov); if (b) { b.disabled = true; b.classList.add('wrong'); } picked = null; }
          else { input.value = ''; input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake'); setTimeout(() => input.focus(), 30); }
          return;
        }
      }
      done = true; clearInterval(timerId);
      ov.querySelectorAll('.timer, .timer-num').forEach(el => (el.hidden = true));
      if (kind === 'skip' || kind === 'stop') { end(kind); return; }
      const final = kind === 'submit' ? checkAnswer(q, current()) : { right: false };
      const right = !!final.right;
      const result = right ? (hinted || tries ? 'assisted' : 'correct') : 'wrong';
      const lastMistake = kind === 'submit' && !right ? final.msg : null;
      recordAnswer(opt.topic, result, q.skill);
      const extra = opt.onResult ? opt.onResult(right, result === 'assisted') || '' : '';
      save();
      $('.q-entry', ov).hidden = true; coach.innerHTML = ''; coachState = null;
      fbState = { result, extra, timeout: kind === 'timeout', why: lastMistake || firstMistake }; drawFb();
      if (result === 'correct' && opt.autoMs) autoId = setTimeout(() => end('correct'), opt.autoMs);
      if (result === 'assisted' && opt.autoMs) autoId = setTimeout(() => end('assisted'), opt.autoMs + 1500);
      fbBox.dataset.result = result;
      setTimeout(() => { const b = $('[data-q="next"]', ov); if (b) b.focus(); }, 30);
    }
    ov.addEventListener('click', e => {
      const lb = e.target.closest('[data-act="qlang"]');
      if (lb) { setLang(lb.dataset.l); paint(); return; }
      const so = e.target.closest('[data-sym]');
      if (so) { sym = so.dataset.sym; ov.querySelectorAll('[data-sym]').forEach(b => b.setAttribute('aria-pressed', b === so)); warnKey = null; warn.textContent = ''; if (!isTouchOnly()) input.focus(); return; }
      const op = e.target.closest('[data-opt]');
      if (op && !op.disabled && !done) { picked = +op.dataset.opt; finish('submit'); return; }
      const k = e.target.closest('[data-k]');
      if (k) {
        const v = k.dataset.k;
        if (v === 'back') input.value = input.value.slice(0, -1); else input.value += v;
        warnKey = null; warn.textContent = '';
        if (!isTouchOnly()) input.focus();
        return;
      }
      const b = e.target.closest('[data-q]'); if (!b) return;
      const a = b.dataset.q;
      if (a === 'next') end(fbBox.dataset.result);
      else finish(a);
    });
    paint();
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); finish('submit'); return; }
        if (q.kind === 'ineq' && ['<', '>'].includes(e.key)) { e.preventDefault(); const b = $(`[data-sym="${e.key}"]`, ov); if (b) b.click(); }
      });
      input.addEventListener('input', () => { warnKey = null; warn.textContent = ''; });
      setTimeout(() => input.focus(), 40);
    } else setTimeout(() => { const b = $('.q-opt', ov); if (b) b.focus(); }, 40);
  });
}
