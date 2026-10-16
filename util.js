/* Numlings: small math and HTML helpers used everywhere */
'use strict';
/* ========================= small helpers ========================= */
const MINUS = '\u2212';
const $ = (s, el = document) => el.querySelector(s);
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
const nzBig = (a, b) => { let v = 0; while (Math.abs(v) < 2) v = ri(a, b); return v; }; // no 0, 1, -1
const sgn = () => (Math.random() < 0.5 ? -1 : 1);
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const round2 = n => Math.round(n * 100) / 100;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function num(n) {
  const r = Math.round(n * 1e4) / 1e4;
  return (r < 0 ? MINUS : '') + String(Math.abs(r));
}
const paren = n => (n < 0 ? `(${num(n)})` : num(n));
const money = n => (n < -0.0001 ? MINUS : '') + '$' + Math.abs(round2(n)).toFixed(2);
function simp(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; }
const terminates = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
function fracHTML(n, d) {
  [n, d] = simp(n, d);
  if (d === 1) return num(n);
  return `${n < 0 ? MINUS : ''}<span class="fr"><span class="fn">${Math.abs(n)}</span><span class="fd">${d}</span></span>`;
}
const pfracHTML = (n, d) => (n < 0 ? `(${fracHTML(n, d)})` : fracHTML(n, d));
function mixedHTML(n, d) {
  [n, d] = simp(n, d);
  const a = Math.abs(n), w = Math.floor(a / d), r = a % d;
  if (d === 1 || w === 0) return fracHTML(n, d);
  return `${n < 0 ? MINUS : ''}${w}<span class="fr"><span class="fn">${r}</span><span class="fd">${d}</span></span>`;
}
const raw = (n, d) => `${n < 0 ? MINUS : ''}${Math.abs(n)}/${d}`;
const praw = (n, d) => (n < 0 ? `(${raw(n, d)})` : raw(n, d));
function fracText(n, d) {
  [n, d] = simp(n, d);
  if (d === 1) return num(n);
  let s = raw(n, d);
  const a = Math.abs(n);
  if (a > d) s += ` (or ${n < 0 ? MINUS : ''}${Math.floor(a / d)} ${a % d}/${d})`;
  else if (terminates(d)) s += ` (or ${num(n / d)})`;
  return s;
}
function signRule(a, b) {
  return (a < 0) === (b < 0) ? 'Same signs give a positive answer.' : 'Different signs give a negative answer.';
}
