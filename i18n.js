/* Numlings: languages. English, Spanish (Español), or both (English with Spanish underneath). */
'use strict';
const LANG_KEY = 'numlings-lang';
let LANG = (() => { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { return 'en'; } })();
function setLang(l) { LANG = ['en', 'es', 'both'].includes(l) ? l : 'en'; try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {} document.documentElement.lang = LANG === 'es' ? 'es' : 'en'; }
// A bilingual pair. Everything a student reads in a question is one of these.
const L = (en, es) => ({ en, es });
const isPair = v => v && typeof v === 'object' && 'en' in v && 'es' in v;
// One language only (Both mode shows English here); for short labels, titles, and plain text.
const tx = v => (isPair(v) ? (LANG === 'es' ? v.es : v.en) : v);
// For reading text: in Both mode, English first with the Spanish underneath.
function bi(v) {
  if (!isPair(v)) return v == null ? '' : v;
  if (LANG === 'es') return v.es;
  if (LANG === 'both' && v.es !== v.en) return `${v.en}<span class="es-line" lang="es">${v.es}</span>`;
  return v.en;
}
// Buttons and labels. In Both mode a label reads "English / Español".
const UI = {
  checkAnswer: L('Check answer', 'Revisar'), hint: L('Hint', 'Pista'), skip: L('Skip', 'Saltar'), endTraining: L('End training', 'Terminar'),
  continue: L('Continue', 'Continuar'), correct: L('Correct!', '¡Correcto!'), gotIt: L('You got it!', '¡Lo lograste!'), notQuite: L('Not quite.', 'Todavía no.'),
  timesUp: L('Time’s up.', 'Se acabó el tiempo.'), notYet: L('Not yet.', 'Todavía no.'), tryOnce: L('Try once more.', 'Inténtalo una vez más.'),
  takeAnother: L('Take another look.', 'Vuelve a revisar.'), niceHint: L('Nice work using the hint.', 'Buen trabajo usando la pista.'),
  answerIs: L('The answer is', 'La respuesta es'), whatHappened: L('What happened:', 'Qué pasó:'), howToSolve: L('How to solve it:', 'Cómo resolverlo:'),
  yourAnswer: L('Your answer', 'Tu respuesta'), number: L('Number', 'Número'), space: L('space', 'espacio'),
  typeHelp: L('Negatives, decimals, fractions like 3/4, and mixed numbers like 1 1/2 all work.', 'Puedes usar negativos, decimales, fracciones como 3/4 y números mixtos como 1 1/2.'),
  ineqHelp: L('Tap the symbol, then type the number. Your answer reads like x > 4.', 'Toca el símbolo y luego escribe el número. Tu respuesta se lee como x > 4.'),
  typeNumber: L('Type a number, like −4, 2.5, or 3/4.', 'Escribe un número, como −4, 2.5 o 3/4.'), tapSymbol: L('Tap <, >, ≤, or ≥ first.', 'Primero toca <, >, ≤ o ≥.'),
  secondsLeft: L('seconds left', 'segundos'), left: L('left', 'restantes'), language: L('Language', 'Idioma'),
  // navigation and common buttons
  nav_explore: L('Explore', 'Explorar'), nav_quests: L('Quests', 'Misiones'), nav_team: L('Team', 'Equipo'), nav_codex: L('Codex', 'Códex'), nav_train: L('Train', 'Entrenar'), nav_save: L('Save', 'Guardar'),
  newGame: L('New game', 'Juego nuevo'), haveCode: L('I have a save code', 'Tengo un código'), continueAs: L('Continue as', 'Continuar como'),
  tagline: L('Solve math problems to catch, train, and battle creatures.', 'Resuelve problemas de matemáticas para atrapar, entrenar y combatir criaturas.'),
  catchIt: L('Catch it', 'Atrápalo'), battle: L('Battle', 'Combatir'), walkAway: L('Walk away', 'Irse'), keepExploring: L('Keep exploring', 'Seguir explorando'),
  seeTeam: L('See your team', 'Ver tu equipo'), backToTown: L('Back to town', 'Volver al pueblo'), worldMap: L('World map', 'Mapa del mundo'),
  accept: L('Accept', 'Aceptar'), notNow: L('Not now', 'Ahora no'), ok: L('OK', 'OK'), battleBang: L('Battle!', '¡A combatir!'),
  runAway: L('Run away', 'Huir'), giveUp: L('Give up', 'Rendirse'), youWon: L('You won!', '¡Ganaste!'), trainTeam: L('Train your team', 'Entrena a tu equipo'),
  critTitle: L('Critical hit chance', 'Oportunidad de golpe crítico'), guardTitle: L('Guard', 'Defensa'),
  youreAt: L('You’re at', 'Estás en'), cacheAt: L('Math cache at', 'Tesoro en'), sparkles: L('Sparkles', 'Destellos'), quest: L('Quest', 'Misión'),
  noneRightNow: L('None right now', 'Ninguno por ahora'),
};
const t = k => { const v = UI[k]; if (!v) return k; return LANG === 'both' && v.en !== v.es ? `${v.en} / ${v.es}` : tx(v); };
// The three-way switch used on the title screen, the Save page, and inside every question.
const langSwitch = (act = 'lang') => `<div class="lang-switch" role="group" aria-label="Language / Idioma">${[['en', 'EN'], ['es', 'ES'], ['both', 'EN + ES']].map(([k, lab]) =>
  `<button type="button" data-act="${act}" data-l="${k}" aria-pressed="${LANG === k}" ${k === 'es' ? 'lang="es"' : ''}>${lab}</button>`).join('')}</div>`;
document.documentElement.lang = LANG === 'es' ? 'es' : 'en';
