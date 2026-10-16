/* Numlings: the teacher dashboard. Everything runs in this browser; no student data is sent anywhere. */
'use strict';
const T_KEY = 'numlings-teacher-v1';
const CODE_RE = /NL1\.[0-9a-z]+\.[A-Za-z0-9_-]+/;
const ZONE_OF_TOPIC = Object.fromEntries(Object.values(ZONES).map(z => [z.topic, z.name]));
const TIER_NAME = ['', 'Warm-up', 'On level', 'Challenge'];
let CLASS = [], SKIPPED = [], NOCODE = 0;
const TV = { period: 'all', topic: 'all', sort: 'name', group: null, detail: null };

/* ---------- mastery (same rules as the game) ---------- */
function kMastery(k) { if (!k || !k.r) return null; const rec = k.r.slice(-10); let s = 0; for (const ch of rec) s += ch === '2' ? 1 : ch === '1' ? 0.5 : 0; return s / rec.length; }
function kStatus(k) {
  const m = kMastery(k);
  if (m == null) return { label: 'Not tried', cls: 'new', m: null };
  if (k.r.length < 4) return { label: 'Getting started', cls: 'start', m };
  if (m >= 0.8 && k.r.length >= 5) return { label: 'Mastered', cls: 'mastered', m };
  if (m >= 0.5) return { label: 'Practicing', cls: 'practicing', m };
  return { label: 'Learning', cls: 'learning', m };
}
function summarize(st) {
  let a = 0, c = 0, h = 0, mastered = 0, tried = 0, mSum = 0;
  for (const sk of SKILLS) {
    const k = st.skills[sk.id]; if (!k) continue;
    a += k.a; c += k.c; h += k.h; tried++;
    const s = kStatus(k); if (s.cls === 'mastered') mastered++; if (s.m != null) mSum += s.m;
  }
  return { attempts: a, firstTry: a ? c / a : null, hintRate: a ? h / a : null, withHelp: a ? (c + h) / a : null, mastered, tried, avgMastery: tried ? mSum / tried : null };
}

/* ---------- reading pasted codes or Google Form rows ---------- */
function splitCells(line) {
  if (line.includes('\t')) return line.split('\t');
  const out = []; let cur = '', q = false;
  for (const ch of line) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; }
  out.push(cur); return out;
}
const isTime = c => (/\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}/.test(c) && /\d:\d\d/.test(c)) || /^\d{1,2}:\d\d(:\d\d)?\s*(am|pm)?$/i.test(c);
const isPeriod = c => /^(period|per\.?|p|pd\.?)?\s*\d{1,2}(st|nd|rd|th)?(\s*period)?$/i.test(c.trim());
function parseClass(text) {
  const byKey = new Map(); SKIPPED = []; NOCODE = 0;
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const m = line.match(CODE_RE);
    if (!m) { if (/NL1/.test(line)) SKIPPED.push({ line: i + 1, why: 'The code is cut off or damaged.' }); else NOCODE++; return; }
    let st; try { st = decodeSave(m[0]); } catch (e) { SKIPPED.push({ line: i + 1, why: e.message }); return; }
    const cells = splitCells(line.replace(m[0], '')).map(c => c.replace(/^"|"$/g, '').trim()).filter(Boolean);
    const email = cells.find(c => /@/.test(c));
    const periodCell = cells.find(isPeriod);
    const nameCell = cells.find(c => !isTime(c) && !isPeriod(c) && !/@/.test(c) && /[a-z]/i.test(c));
    const name = nameCell || (email ? email.split('@')[0] : st.trainer);
    const period = periodCell ? periodCell.replace(/\D/g, '') : '';
    const key = (email || name).toLowerCase() + '|' + period;
    const row = { key, name, period, email: email || '', trainer: st.trainer, st, sum: summarize(st), line: i + 1 };
    const prev = byKey.get(key);
    if (!prev || (st.lastPlayed || 0) >= (prev.st.lastPlayed || 0)) byKey.set(key, row);
  });
  CLASS = [...byKey.values()];
}

/* ---------- views ---------- */
const pct = x => (x == null ? '' : Math.round(x * 100) + '%');
const ago = t => { if (!t) return 'Unknown'; const d = Math.floor((Date.now() - t) / 86400000); return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`; };
const shown = () => CLASS.filter(s => TV.period === 'all' || s.period === TV.period);
const shownSkills = () => SKILLS.filter(k => TV.topic === 'all' || k.topic === TV.topic);
function skillClassStats(sk, list) {
  const st = { tried: 0, mastered: 0, practicing: 0, learning: 0, start: 0, notTried: 0, mSum: 0, mN: 0, a: 0, c: 0, h: 0 };
  for (const s of list) {
    const k = s.st.skills[sk.id], ks = kStatus(k);
    if (ks.cls === 'new') { st.notTried++; continue; }
    st.tried++; st[ks.cls]++; st.a += k.a; st.c += k.c; st.h += k.h;
    if (k.r.length >= 3) { st.mSum += ks.m; st.mN++; }
  }
  st.avg = st.mN ? st.mSum / st.mN : null; st.firstTry = st.a ? st.c / st.a : null; st.hint = st.a ? st.h / st.a : null;
  return st;
}
function sortedStudents(list) {
  const by = { name: (a, b) => a.name.localeCompare(b.name), mastery: (a, b) => (a.sum.avgMastery ?? -1) - (b.sum.avgMastery ?? -1),
    activity: (a, b) => b.st.stats.answered - a.st.stats.answered, recent: (a, b) => (a.st.lastPlayed || 0) - (b.st.lastPlayed || 0) }[TV.sort];
  return [...list].sort(by);
}
function renderLoad() {
  return `<div class="panel t-load">
    <h2>Load your class</h2>
    <p>Paste save codes, one per line, or copy rows straight from your Google Form responses sheet (names, periods, and timestamps are fine). If a student turned in more than once, only their newest code is used.</p>
    <textarea id="t-in" class="codebox t-in" placeholder="Paste here. Each line just needs a code that starts with NL1." aria-label="Save codes or Form responses"></textarea>
    <div class="btn-row"><button class="btn primary" data-t="load">Load class</button>
      <label class="btn">Open a CSV file<input type="file" id="t-file" accept=".csv,.tsv,.txt" hidden></label>
      <button class="btn" data-t="sample">Try a sample class</button>
      ${CLASS.length ? '<button class="btn danger" data-t="forget">Forget this class data</button>' : ''}</div>
    <p class="small muted">Everything stays in this browser. Codes are decoded right here and never sent anywhere. The class you load is remembered on this computer until you choose Forget.</p>
    ${SKIPPED.length || NOCODE ? `<p class="small">${CLASS.length} student${CLASS.length === 1 ? '' : 's'} loaded.${NOCODE ? ` ${NOCODE} line${NOCODE === 1 ? '' : 's'} had no code (probably headers).` : ''}${SKIPPED.length ? ` <b>${SKIPPED.length} code${SKIPPED.length === 1 ? ' was' : 's were'} skipped:</b> ${SKIPPED.slice(0, 6).map(s => `line ${s.line} (${s.why})`).join('; ')}${SKIPPED.length > 6 ? '…' : ''}` : ''}</p>` : ''}
  </div>`;
}
function renderOverview(list) {
  const n = list.length, sums = list.map(s => s.sum);
  const avg = f => { const v = sums.map(f).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const answered = list.reduce((a, s) => a + s.st.stats.answered, 0);
  const inactive = list.filter(s => s.st.lastPlayed && Date.now() - s.st.lastPlayed > 7 * 86400000).length;
  return `<div class="card-stats t-cards">
    <div><b>${n}</b>students</div><div><b>${answered.toLocaleString()}</b>problems answered</div>
    <div><b>${pct(avg(s => s.firstTry))}</b>right on the first try</div><div><b>${pct(avg(s => s.hintRate))}</b>of answers used a hint</div>
    <div><b>${avg(s => s.mastered) == null ? 0 : avg(s => s.mastered).toFixed(1)}</b>skills mastered on average</div>
    <div><b>${inactive}</b>haven’t played in 7+ days</div></div>`;
}
function renderReteach(list) {
  const rows = shownSkills().map(sk => ({ sk, st: skillClassStats(sk, list) })).filter(r => r.st.mN >= 2);
  const next = [...rows].sort((a, b) => a.st.avg - b.st.avg).slice(0, 5);
  if (!next.length) return `<div class="panel"><h3>Reteach next</h3><p class="muted">Not enough data yet. Once a few students have tried a skill at least 3 times, the weakest skills show up here.</p></div>`;
  return `<div class="panel"><h3>Reteach next</h3><p class="small muted">The skills your class is weakest on, among students who’ve tried them at least 3 times. Tap one to see its small group.</p>
    <div class="t-reteach">${next.map(({ sk, st }) => `<button class="t-skillcard" data-t="group" data-s="${sk.id}">
      <b>${sk.label}</b><span class="small">TEKS ${sk.teks}, ${ZONE_OF_TOPIC[sk.topic]}</span>
      <span class="t-split"><i class="learning" style="flex:${st.learning}"></i><i class="practicing" style="flex:${st.practicing + st.start}"></i><i class="mastered" style="flex:${st.mastered}"></i></span>
      <span class="small">${st.learning} learning, ${st.practicing + st.start} practicing, ${st.mastered} mastered. Class mastery ${pct(st.avg)}.</span></button>`).join('')}</div></div>`;
}
function renderHeatmap(list) {
  const sks = shownSkills();
  const head = sks.map(sk => `<th class="t-col ${sk.topic}" title="${esc(sk.label)} (TEKS ${sk.teks})"><span>${esc(sk.label)}</span></th>`).join('');
  const body = sortedStudents(list).map(s => `<tr><th class="t-name"><button class="linkish" data-t="detail" data-k="${esc(s.key)}">${esc(s.name)}</button>${s.period ? `<small>Period ${esc(s.period)}</small>` : ''}</th>
    <td class="t-num">${s.sum.mastered}</td>
    ${sks.map(sk => { const k = s.st.skills[sk.id], ks = kStatus(k);
      return `<td class="t-cell ${ks.cls}" title="${esc(s.name)}: ${esc(sk.label)}. ${ks.label}${k ? `, ${k.c + k.h} of ${k.a} right${k.h ? `, ${k.h} with a hint` : ''}` : ''}">${ks.m == null ? '' : Math.round(ks.m * 100)}</td>`; }).join('')}</tr>`).join('');
  return `<div class="panel"><div class="t-bar"><h3>Class by skill</h3>
      <label class="small">Sort <select class="text-in t-sel" data-tc="sort">
        ${[['name', 'Name'], ['mastery', 'Needs the most help'], ['activity', 'Most problems'], ['recent', 'Longest since playing']].map(([v, l]) => `<option value="${v}" ${TV.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <p class="small muted">Each cell is a student’s recent mastery of a skill (0 to 100). Hints count half. Hover a cell for details, or tap a name for the full report.</p>
    <div class="t-legend small"><span class="t-cell learning">Learning</span><span class="t-cell start">Getting started</span><span class="t-cell practicing">Practicing</span><span class="t-cell mastered">Mastered</span><span class="t-cell new">Not tried</span></div>
    <div class="t-scroll"><table class="t-heat"><thead><tr><th class="t-name">Student</th><th class="t-num" title="Skills mastered">★</th>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
}
function renderGroups(list) {
  const sk = SKILL[TV.group] || shownSkills()[0];
  const opts = SKILLS.map(k => `<option value="${k.id}" ${k.id === sk.id ? 'selected' : ''}>${esc(k.label)} (${k.teks})</option>`).join('');
  const buckets = { learning: [], start: [], practicing: [], new: [], mastered: [] };
  for (const s of list) buckets[kStatus(s.st.skills[sk.id]).cls].push(s);
  const st = skillClassStats(sk, list);
  const col = (cls, title, note) => `<div class="t-group ${cls}"><b>${title} (${buckets[cls].length})</b><span class="small muted">${note}</span>
    <p>${buckets[cls].length ? buckets[cls].sort((a, b) => a.name.localeCompare(b.name)).map(s => esc(s.name)).join(', ') : '<span class="muted">Nobody</span>'}</p>
    ${buckets[cls].length ? `<button class="btn ghost small" data-t="copy" data-names="${esc(buckets[cls].map(s => s.name).join(', '))}">Copy names</button>` : ''}</div>`;
  return `<div class="panel"><div class="t-bar"><h3>Small groups</h3><select class="text-in t-sel" data-tc="group" aria-label="Skill">${opts}</select></div>
    <p class="small muted">${st.tried} of ${list.length} students have tried this skill. First try: ${pct(st.firstTry) || 'n/a'}. Hint use: ${pct(st.hint) || 'n/a'}. Tip: add its id <code>${sk.id}</code> to focusSkills in js/config.js to make the game practice it more.</p>
    <div class="t-groups">${col('learning', 'Reteach group', 'Under 50% recently')}${col('start', 'Just started', 'Fewer than 4 tries')}${col('practicing', 'Practicing', '50 to 79%')}${col('mastered', 'Mastered', '80% or better')}${col('new', 'Not tried yet', 'No attempts')}</div></div>`;
}
function renderDetail(s) {
  const st = s.st, sum = s.sum, d = st.dungeon;
  const rows = SKILLS.map(sk => { const k = st.skills[sk.id], ks = kStatus(k);
    return `<tr><td>${esc(sk.label)}<small>TEKS ${sk.teks}, ${TIER_NAME[sk.tier]}</small></td><td class="t-cell ${ks.cls}">${ks.label}</td><td>${ks.m == null ? '' : pct(ks.m)}</td>
      <td>${k ? `${k.c} of ${k.a}` : ''}</td><td>${k ? k.h : ''}</td><td class="t-recent">${k ? [...k.r].map(ch => `<i class="r${ch}"></i>`).join('') : ''}</td></tr>`; }).join('');
  return `<div class="t-detail panel"><div class="t-bar"><div><h2>${esc(s.name)}</h2><span class="small muted">${s.period ? `Period ${esc(s.period)}. ` : ''}Trainer nickname: ${esc(s.trainer)}. Last played: ${ago(st.lastPlayed)}.</span></div>
      <button class="btn" data-t="close">Back to class</button></div>
    <div class="card-stats"><div><b>${st.stats.answered}</b>problems answered</div><div><b>${pct(sum.firstTry) || 'n/a'}</b>right on the first try</div>
      <div><b>${pct(sum.hintRate) || 'n/a'}</b>used a hint</div><div><b>${sum.mastered}/${SKILLS.length}</b>skills mastered</div>
      <div><b>${st.stats.trials[1]}/${st.stats.trials[0]}</b>evolution trials passed</div>
      <div><b>${['easy', 'hard', 'chaos'].filter(x => d[x].clears).map(x => x[0].toUpperCase() + x.slice(1)).join(', ') || 'None'}</b>dungeon clears</div>
      <div><b>${st.caught.size}</b>Numlings in codex</div><div><b>${st.badges.size}</b>badges</div>
      <div><b>${Object.values(st.quests || {}).filter(q => q.st === 'done').length}/${QUESTS.length}</b>quests complete</div></div>
    <div class="t-scroll"><table class="t-skilltable"><thead><tr><th>Skill</th><th>Status</th><th>Recent mastery</th><th>First try</th><th>With a hint</th><th>Last 12 (oldest to newest)</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small muted">In “Last 12,” green is right on the first try, gold is right after a hint, and red is a miss.</p></div>`;
}
function renderDash() {
  const app = document.getElementById('t-app');
  const periods = [...new Set(CLASS.map(s => s.period).filter(Boolean))].sort((a, b) => a - b);
  if (TV.period !== 'all' && !periods.includes(TV.period)) TV.period = 'all';
  const list = shown();
  if (TV.detail) { const s = CLASS.find(x => x.key === TV.detail); if (s) { app.innerHTML = renderDetail(s); window.scrollTo(0, 0); return; } TV.detail = null; }
  app.innerHTML = `${renderLoad()}
    ${CLASS.length ? `<div class="t-filters">
      ${periods.length ? `<label>Period <select class="text-in t-sel" data-tc="period"><option value="all">All periods</option>${periods.map(p => `<option value="${p}" ${TV.period === p ? 'selected' : ''}>Period ${p}</option>`).join('')}</select></label>` : ''}
      <label>Skills <select class="text-in t-sel" data-tc="topic"><option value="all">All skills</option>${Object.entries(ZONE_OF_TOPIC).map(([t, z]) => `<option value="${t}" ${TV.topic === t ? 'selected' : ''}>${z} skills</option>`).join('')}</select></label>
      <button class="btn" data-t="csv">Download CSV</button><button class="btn" data-t="print">Print</button></div>
      ${renderOverview(list)}${renderReteach(list)}${renderHeatmap(list)}${renderGroups(list)}` : `<div class="panel"><h3>Setting up turn-ins (one time)</h3><ol class="t-steps">
        <li>Make a Google Form with a short-answer question like “Name” (and “Period” if you teach several), plus one called “Save code.”</li>
        <li>In the Form menu, choose <b>Get pre-filled link</b>, type <b>CODE</b> in the Save code question, and copy the link.</li>
        <li>Paste that link into <code>turnIn: { url: '…' }</code> in <code>js/config.js</code>. Students now get a <b>Turn in my progress</b> button on the Save page that fills in their code for them.</li>
        <li>When you want data, open the Form’s responses in Google Sheets, select the rows, copy, and paste them above.</li></ol></div>`}`;
}

/* ---------- actions ---------- */
function loadText(text, remember = true) {
  parseClass(text);
  if (remember) { try { if (CLASS.length) localStorage.setItem(T_KEY, text); } catch (e) {} }
  TV.detail = null; renderDash();
}
function csvExport() {
  const sks = SKILLS, q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Name', 'Period', 'Email', 'Trainer nickname', 'Last played', 'Problems answered', 'First-try %', 'Hint %', 'Skills mastered',
    ...sks.flatMap(k => [`${k.label} (${k.teks}) mastery %`, `${k.label} status`])];
  const lines = sortedStudents(shown()).map(s => [s.name, s.period, s.email, s.trainer, s.st.lastPlayed ? new Date(s.st.lastPlayed).toLocaleDateString() : '',
    s.st.stats.answered, s.sum.firstTry == null ? '' : Math.round(s.sum.firstTry * 100), s.sum.hintRate == null ? '' : Math.round(s.sum.hintRate * 100), s.sum.mastered,
    ...sks.flatMap(k => { const ks = kStatus(s.st.skills[k.id]); return [ks.m == null ? '' : Math.round(ks.m * 100), ks.label]; })].map(q).join(','));
  const blob = new Blob([[head.map(q).join(','), ...lines].join('\r\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `numlings-class-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
}
function sampleClass() {
  const names = ['Ana G.', 'Luis M.', 'Sofia R.', 'Diego P.', 'Valeria T.', 'Mateo L.', 'Camila H.', 'Santiago C.', 'Isabella V.', 'Emiliano S.', 'Ximena O.', 'Adrian F.',
    'Renata D.', 'Joaquin B.', 'Mia A.', 'Gael N.', 'Victoria E.', 'Sebastian Q.', 'Natalia K.', 'Daniel J.', 'Regina W.', 'Andres Y.', 'Paula Z.', 'Leo U.'];
  const rows = ['Timestamp\tName\tPeriod\tSave code'];
  names.forEach((nm, i) => {
    const st = freshState(nm.split(' ')[0]); st.creatures.push({ uid: 1, n: 1 + (i % 3), lv: 5 + (i % 9), xp: 0 }); st.party = [1]; st.caught.add(st.creatures[0].n);
    const skill = 0.35 + (i % 7) * 0.09 + Math.random() * 0.1;
    const G0 = G; G = st;
    for (const sk of SKILLS) {
      if (sk.tier === 3 && Math.random() < 0.5 - skill * 0.3) continue;
      const tries = ri(0, 12);
      const p = Math.max(0.05, Math.min(0.97, skill - (sk.tier - 1) * 0.12 + (sk.id === 'percent-change' || sk.id === 'frac-addsub' ? -0.25 : 0)));
      for (let t = 0; t < tries; t++) { const r = Math.random(); recordAnswer(sk.topic, r < p ? 'correct' : r < p + 0.15 ? 'assisted' : 'wrong', sk.id); }
    }
    G = G0; st.lastPlayed = Date.now() - ri(0, 10) * 86400000;
    rows.push(`10/${ri(1, 15)}/2026 ${ri(8, 15)}:${String(ri(0, 59)).padStart(2, '0')}:00\t${nm}\t${i % 3 === 0 ? 2 : i % 3 === 1 ? 4 : 6}\t${encodeSave(st)}`);
  });
  document.getElementById('t-in').value = rows.join('\n');
  loadText(rows.join('\n'), false);
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  const a = b.dataset.t;
  if (a === 'load') loadText(document.getElementById('t-in').value);
  if (a === 'sample') sampleClass();
  if (a === 'forget') { try { localStorage.removeItem(T_KEY); } catch (e2) {} CLASS = []; SKIPPED = []; NOCODE = 0; renderDash(); }
  if (a === 'detail') { TV.detail = b.dataset.k; renderDash(); }
  if (a === 'close') { TV.detail = null; renderDash(); }
  if (a === 'group') { TV.group = b.dataset.s; renderDash(); document.querySelector('.t-groups')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  if (a === 'copy') { try { await navigator.clipboard.writeText(b.dataset.names); b.textContent = 'Copied'; } catch (e2) { b.textContent = 'Select and copy the names'; } }
  if (a === 'csv') csvExport();
  if (a === 'print') window.print();
});
document.addEventListener('change', e => {
  const k = e.target.dataset.tc; if (k) { TV[k] = e.target.value; renderDash(); return; }
  if (e.target.id === 't-file' && e.target.files[0]) { const r = new FileReader(); r.onload = () => { document.getElementById('t-in').value = r.result; loadText(r.result); }; r.readAsText(e.target.files[0]); }
});
(function boot() {
  let saved = null; try { saved = localStorage.getItem(T_KEY); } catch (e) {}
  if (saved) parseClass(saved);
  renderDash();
  if (saved) document.getElementById('t-in').value = saved;
})();
