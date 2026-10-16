/* Numlings: question generators (English and Spanish), the skill catalog, adaptive selection, and answer checking */
'use strict';
/* =========================================================================
   Every generator returns:
     { html, answer, answerText, explain, hint, mistakes: [{ v, msg }], long? }
   Any text a student reads is a pair, L(english, spanish), so both languages always describe the same numbers.
   hint      : a first step that doesn't give away the answer (shown after a first miss)
   mistakes  : common wrong answers and what they usually mean. If a student types one of these,
               the game names the mistake instead of just saying "not quite."
   A generic "right size, wrong sign" check is added automatically to every number question.
   ========================================================================= */
const Q = {};
const mk = (v, msg) => ({ v, msg });
const signRuleL = (a, b) => ((a < 0) === (b < 0)
  ? L('Same signs give a positive answer.', 'Signos iguales dan un resultado positivo.')
  : L('Different signs give a negative answer.', 'Signos diferentes dan un resultado negativo.'));

/* ---------- rational numbers (7.3A, 7.3B) ---------- */
Q.intAddSub = () => {
  const a = nz(-20, 20), b = nz(-20, 20), add = Math.random() < 0.5;
  const ans = add ? a + b : a - b, A = Math.abs(a), B = Math.abs(b), hi = Math.max(A, B), lo = Math.min(A, B);
  let ex, hint; const mistakes = [];
  if (!add) {
    ex = L(`Subtracting is adding the opposite: ${num(a)} ${MINUS} ${paren(b)} = ${num(a)} + ${paren(-b)} = ${num(ans)}.`,
           `Restar es sumar el opuesto: ${num(a)} ${MINUS} ${paren(b)} = ${num(a)} + ${paren(-b)} = ${num(ans)}.`);
    hint = L(`Change the subtraction to adding the opposite: ${num(a)} + ${paren(-b)}.`, `Cambia la resta a sumar el opuesto: ${num(a)} + ${paren(-b)}.`);
    if (b < 0) mistakes.push(mk(a + b, L(`Subtracting a negative is the same as adding a positive: ${num(a)} ${MINUS} ${paren(b)} = ${num(a)} + ${B}.`,
                                         `Restar un negativo es lo mismo que sumar un positivo: ${num(a)} ${MINUS} ${paren(b)} = ${num(a)} + ${B}.`)));
    else mistakes.push(mk(a + b, L(`You added. This problem subtracts ${b}, which means adding ${paren(-b)}.`, `Sumaste. Este problema resta ${b}, que es lo mismo que sumar ${paren(-b)}.`)));
  } else if ((a < 0) === (b < 0)) {
    ex = L(`Same signs: add ${A} + ${B} and keep the sign. The answer is ${num(ans)}.`, `Mismo signo: suma ${A} + ${B} y conserva el signo. La respuesta es ${num(ans)}.`);
    hint = L(`Both numbers have the same sign. Add ${A} + ${B}, then keep that sign.`, `Los dos números tienen el mismo signo. Suma ${A} + ${B} y conserva ese signo.`);
  } else {
    ex = L(`Different signs: subtract ${hi} ${MINUS} ${lo} and keep the sign of the number farther from zero. The answer is ${num(ans)}.`,
           `Signos diferentes: resta ${hi} ${MINUS} ${lo} y conserva el signo del número más lejano del cero. La respuesta es ${num(ans)}.`);
    hint = L(`The signs are different, so subtract the sizes: ${hi} ${MINUS} ${lo}. Which number is farther from zero? Its sign wins.`,
             `Los signos son diferentes, así que resta los valores absolutos: ${hi} ${MINUS} ${lo}. ¿Cuál número está más lejos del cero? Su signo gana.`);
    mistakes.push(mk(Math.sign(ans || 1) * (A + B), L(`When the signs are different, subtract the sizes (${hi} ${MINUS} ${lo}) instead of adding them.`,
                                                       `Cuando los signos son diferentes, resta los valores absolutos (${hi} ${MINUS} ${lo}) en lugar de sumarlos.`)));
  }
  return { html: `${num(a)} ${add ? '+' : MINUS} ${paren(b)}`, answer: ans, answerText: num(ans), explain: ex, hint, mistakes };
};
Q.intMulDiv = () => {
  const a = nzBig(-12, 12), b = nzBig(-12, 12);
  if (Math.random() < 0.5) {
    const ans = a * b;
    return { html: `${num(a)} × ${paren(b)}`, answer: ans, answerText: num(ans),
      explain: L(`${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ans)}. ${signRuleL(a, b).en} The answer is ${num(ans)}.`,
                 `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ans)}. ${signRuleL(a, b).es} La respuesta es ${num(ans)}.`),
      hint: L(`First multiply the sizes: ${Math.abs(a)} × ${Math.abs(b)}. Then decide the sign: are the signs the same or different?`,
              `Primero multiplica los valores absolutos: ${Math.abs(a)} × ${Math.abs(b)}. Luego decide el signo: ¿los signos son iguales o diferentes?`),
      mistakes: [mk(a + b, L('You added the numbers. This one asks you to multiply.', 'Sumaste los números. Este problema pide multiplicar.'))] };
  }
  const p = a * b;
  return { html: `${num(p)} ÷ ${paren(b)}`, answer: a, answerText: num(a),
    explain: L(`${Math.abs(p)} ÷ ${Math.abs(b)} = ${Math.abs(a)}. ${signRuleL(p, b).en} The answer is ${num(a)}.`,
               `${Math.abs(p)} ÷ ${Math.abs(b)} = ${Math.abs(a)}. ${signRuleL(p, b).es} La respuesta es ${num(a)}.`),
    hint: L(`Divide the sizes: ${Math.abs(p)} ÷ ${Math.abs(b)}. Then use the sign rule: same signs give a positive, different signs give a negative.`,
            `Divide los valores absolutos: ${Math.abs(p)} ÷ ${Math.abs(b)}. Luego usa la regla de los signos: signos iguales dan positivo y signos diferentes dan negativo.`),
    mistakes: [] };
};
Q.decimal = () => {
  let A; do { A = ri(11, 99) * sgn(); } while (A % 10 === 0);
  const op = pick(['+', MINUS, '×']);
  if (op === '×') {
    const b = nzBig(-9, 9), ans = (A * b) / 10;
    return { html: `${num(A / 10)} × ${paren(b)}`, answer: ans, answerText: num(ans),
      explain: L(`${Math.abs(A / 10)} × ${Math.abs(b)} = ${num(Math.abs(ans))}. ${signRuleL(A, b).en} The answer is ${num(ans)}.`,
                 `${Math.abs(A / 10)} × ${Math.abs(b)} = ${num(Math.abs(ans))}. ${signRuleL(A, b).es} La respuesta es ${num(ans)}.`),
      hint: L(`Multiply ${Math.abs(A)} × ${Math.abs(b)} as whole numbers, then put back one decimal place.`,
              `Multiplica ${Math.abs(A)} × ${Math.abs(b)} como números enteros y luego vuelve a poner un lugar decimal.`),
      mistakes: [mk(ans * 10, L('Check the decimal point. The problem has one decimal place, so the answer needs one too.', 'Revisa el punto decimal. El problema tiene un lugar decimal, así que la respuesta también necesita uno.')),
                 mk(ans / 10, L('Check the decimal point. You moved it one place too far.', 'Revisa el punto decimal. Lo moviste un lugar de más.'))] };
  }
  let B; do { B = ri(11, 99) * sgn(); } while (B % 10 === 0);
  const ans = op === '+' ? (A + B) / 10 : (A - B) / 10;
  const ex = op === MINUS ? L(`Add the opposite: ${num(A / 10)} + ${paren(-B / 10)} = ${num(ans)}.`, `Suma el opuesto: ${num(A / 10)} + ${paren(-B / 10)} = ${num(ans)}.`)
    : L(`Line up the decimal points and use the sign rules for adding: ${num(A / 10)} + ${paren(B / 10)} = ${num(ans)}.`,
        `Alinea los puntos decimales y usa las reglas de los signos para sumar: ${num(A / 10)} + ${paren(B / 10)} = ${num(ans)}.`);
  const mistakes = [];
  if (op === MINUS) mistakes.push(mk((A + B) / 10, L(`Subtracting means adding the opposite: ${num(A / 10)} + ${paren(-B / 10)}.`, `Restar es sumar el opuesto: ${num(A / 10)} + ${paren(-B / 10)}.`)));
  return { html: `${num(A / 10)} ${op} ${paren(B / 10)}`, answer: ans, answerText: num(ans), explain: ex, mistakes,
    hint: op === MINUS ? L(`Rewrite it as adding the opposite: ${num(A / 10)} + ${paren(-B / 10)}. Then use the integer sign rules.`,
                           `Escríbelo como sumar el opuesto: ${num(A / 10)} + ${paren(-B / 10)}. Luego usa las reglas de los signos de los enteros.`)
      : L('Line up the decimal points. If the signs are different, subtract the sizes and keep the sign of the larger one.',
          'Alinea los puntos decimales. Si los signos son diferentes, resta los valores absolutos y conserva el signo del mayor.') };
};
Q.fracAddSub = () => {
  const dens = [2, 3, 4, 5, 6, 8, 10, 12];
  let d1, d2; do { d1 = pick(dens); d2 = pick(dens); } while (lcm(d1, d2) > 24);
  let n1 = nz(-(d1 - 1), d1 - 1), n2 = ri(1, d2 - 1) * sgn();
  [n1, d1] = simp(n1, d1); [n2, d2] = simp(n2, d2);
  const add = Math.random() < 0.5, Lc = lcm(d1, d2), m1 = n1 * Lc / d1, m2 = n2 * Lc / d2, rn = add ? m1 + m2 : m1 - m2;
  const mistakes = [], simple = fracText(rn, Lc).split(' (')[0];
  if (d1 !== d2) mistakes.push(mk((add ? n1 + n2 : n1 - n2) / (d1 + d2), L(`Don’t add the denominators. Rewrite both fractions with a common denominator (${Lc}) first, then combine only the numerators.`,
                                                                          `No sumes los denominadores. Primero escribe las dos fracciones con un denominador común (${Lc}) y luego combina solo los numeradores.`)));
  mistakes.push(mk((add ? n1 + n2 : n1 - n2) / Lc, L(`Close! When you change a denominator to ${Lc}, change the numerator too, by the same factor.`,
                                                     `¡Casi! Cuando cambias un denominador a ${Lc}, también cambia el numerador por el mismo factor.`)));
  return { html: `${fracHTML(n1, d1)} ${add ? '+' : MINUS} ${pfracHTML(n2, d2)}`, answer: rn / Lc, answerText: fracText(rn, Lc), mistakes,
    explain: L(`Use a common denominator of ${Lc}: ${raw(m1, Lc)} ${add ? '+' : MINUS} ${praw(m2, Lc)} = ${raw(rn, Lc)}, which simplifies to ${simple}.`,
               `Usa un denominador común de ${Lc}: ${raw(m1, Lc)} ${add ? '+' : MINUS} ${praw(m2, Lc)} = ${raw(rn, Lc)}, que se simplifica a ${simple}.`),
    hint: L(`Find a common denominator. ${Lc} works for both ${d1} and ${d2}. Rewrite each fraction with ${Lc} on the bottom.`,
            `Busca un denominador común. ${Lc} sirve para ${d1} y para ${d2}. Escribe cada fracción con ${Lc} abajo.`) };
};
Q.twoStep = () => {
  if (Math.random() < 0.5) {
    const a = nz(-10, 10), b = nz(-6, 6), c = nz(-6, 6), ans = a + b * c;
    return { html: `${num(a)} + ${paren(b)} × ${paren(c)}`, answer: ans, answerText: num(ans),
      explain: L(`Multiply first: ${paren(b)} × ${paren(c)} = ${num(b * c)}. Then ${num(a)} + ${paren(b * c)} = ${num(ans)}.`,
                 `Primero multiplica: ${paren(b)} × ${paren(c)} = ${num(b * c)}. Luego ${num(a)} + ${paren(b * c)} = ${num(ans)}.`),
      hint: L(`Order of operations: multiply ${paren(b)} × ${paren(c)} before you add.`, `Orden de las operaciones: multiplica ${paren(b)} × ${paren(c)} antes de sumar.`),
      mistakes: [mk((a + b) * c, L('You worked left to right. Multiplication comes before addition, so multiply first.', 'Trabajaste de izquierda a derecha. La multiplicación va antes que la suma, así que multiplica primero.'))] };
  }
  const c = nzBig(-6, 6), q = nz(-8, 8), b = nz(-10, 10), a = q * c + b;
  return { html: `(${num(a)} ${MINUS} ${paren(b)}) ÷ ${paren(c)}`, answer: q, answerText: num(q),
    explain: L(`Parentheses first: ${num(a)} ${MINUS} ${paren(b)} = ${num(a - b)}. Then ${num(a - b)} ÷ ${paren(c)} = ${num(q)}.`,
               `Primero los paréntesis: ${num(a)} ${MINUS} ${paren(b)} = ${num(a - b)}. Luego ${num(a - b)} ÷ ${paren(c)} = ${num(q)}.`),
    hint: L(`Start inside the parentheses: ${num(a)} ${MINUS} ${paren(b)}. Remember, subtracting means adding the opposite.`,
            `Empieza dentro de los paréntesis: ${num(a)} ${MINUS} ${paren(b)}. Recuerda, restar es sumar el opuesto.`),
    mistakes: [mk((a + b) / c, L(`Inside the parentheses, subtracting ${paren(b)} means adding ${paren(-b)}.`, `Dentro de los paréntesis, restar ${paren(b)} es sumar ${paren(-b)}.`))] };
};
Q.decimalDiv = () => {
  const D = ri(2, 9) * sgn(), q = nzBig(-12, 12);
  return { html: `${num(q * D / 10)} ÷ ${paren(D / 10)}`, answer: q, answerText: num(q),
    explain: L(`Multiply both numbers by 10 to clear the decimal: ${num(q * D)} ÷ ${paren(D)} = ${num(q)}.`, `Multiplica los dos números por 10 para quitar el decimal: ${num(q * D)} ÷ ${paren(D)} = ${num(q)}.`),
    hint: L(`Move the decimal point one place right in both numbers: ${num(q * D)} ÷ ${paren(D)}.`, `Mueve el punto decimal un lugar a la derecha en los dos números: ${num(q * D)} ÷ ${paren(D)}.`),
    mistakes: [mk(q / 10, L('Move the decimal point in both numbers by the same amount. That makes this a whole-number division.', 'Mueve el punto decimal la misma cantidad de lugares en los dos números. Así se convierte en una división de números enteros.')),
               mk(q * 10, L('Check the decimal point. Move it the same number of places in both numbers.', 'Revisa el punto decimal. Muévelo la misma cantidad de lugares en los dos números.'))] };
};
Q.fracMulDiv = () => {
  let d1 = pick([2, 3, 4, 5, 6, 8]), n1 = (ri(0, 2) * d1 + ri(1, d1 - 1)) * sgn();
  let d2 = pick([2, 3, 4, 5, 6, 8, 9, 10]), n2 = ri(1, d2 - 1) * sgn();
  [n1, d1] = simp(n1, d1); [n2, d2] = simp(n2, d2);
  const mul = Math.random() < 0.5;
  const rn = mul ? n1 * n2 : n1 * d2 * Math.sign(n2), rd = mul ? d1 * d2 : d1 * Math.abs(n2), simple = fracText(rn, rd).split(' (')[0];
  const sr = signRuleL(n1, n2);
  const ex = mul
    ? L(`Write any mixed number as an improper fraction, then multiply straight across: ${praw(n1, d1)} × ${praw(n2, d2)} = ${raw(rn, rd)} = ${simple}. ${sr.en}`,
        `Escribe cualquier número mixto como fracción impropia y luego multiplica en línea recta: ${praw(n1, d1)} × ${praw(n2, d2)} = ${raw(rn, rd)} = ${simple}. ${sr.es}`)
    : L(`Multiply by the reciprocal: ${praw(n1, d1)} × ${praw(Math.sign(n2) * d2, Math.abs(n2))} = ${raw(rn, rd)} = ${simple}. ${sr.en}`,
        `Multiplica por el recíproco: ${praw(n1, d1)} × ${praw(Math.sign(n2) * d2, Math.abs(n2))} = ${raw(rn, rd)} = ${simple}. ${sr.es}`);
  const mistakes = mul ? [] : [mk((n1 * n2) / (d1 * d2), L('To divide by a fraction, multiply by its reciprocal. Flip the second fraction, then multiply.', 'Para dividir entre una fracción, multiplica por su recíproco. Voltea la segunda fracción y luego multiplica.'))];
  const whole = Math.abs(n1) > d1;
  return { html: `${mixedHTML(n1, d1)} ${mul ? '×' : '÷'} ${pfracHTML(n2, d2)}`, answer: rn / rd, answerText: fracText(rn, rd), explain: ex, mistakes,
    hint: L(`${whole ? `Rewrite the mixed number as an improper fraction: ${raw(n1, d1)}. ` : ''}${mul ? 'Multiply the numerators, then the denominators.' : `Keep the first fraction, change ÷ to ×, and flip the second: ${raw(Math.sign(n2) * d2, Math.abs(n2))}.`}`,
            `${whole ? `Escribe el número mixto como fracción impropia: ${raw(n1, d1)}. ` : ''}${mul ? 'Multiplica los numeradores y luego los denominadores.' : `Deja la primera fracción, cambia ÷ por × y voltea la segunda: ${raw(Math.sign(n2) * d2, Math.abs(n2))}.`}`) };
};
Q.word = () => {
  const k = ri(0, 4);
  if (k === 0) {
    const t0 = -ri(3, 15), up = ri(8, 25), down = ri(5, 20), ans = t0 + up - down;
    return { long: true, answer: ans, answerText: `${num(ans)}°F`,
      html: L(`At 6 a.m. it was ${num(t0)}°F. The temperature rose ${up}°F by noon, then dropped ${down}°F by midnight. What was the temperature at midnight?`,
              `A las 6 a.m. la temperatura era de ${num(t0)}°F. Subió ${up}°F para el mediodía y luego bajó ${down}°F para la medianoche. ¿Cuál era la temperatura a la medianoche?`),
      explain: L(`${num(t0)} + ${up} ${MINUS} ${down} = ${num(ans)}°F.`, `${num(t0)} + ${up} ${MINUS} ${down} = ${num(ans)}°F.`),
      hint: L(`Start at ${num(t0)}. Rising means add ${up}. Dropping means subtract ${down}.`, `Empieza en ${num(t0)}. Subir significa sumar ${up}. Bajar significa restar ${down}.`),
      mistakes: [mk(t0 + up + down, L(`A drop means the temperature goes down, so subtract the ${down}.`, `Bajar significa que la temperatura disminuye, así que resta los ${down}.`)),
                 mk(-t0 + up - down, L(`The starting temperature is negative: ${num(t0)}°F.`, `La temperatura inicial es negativa: ${num(t0)}°F.`))] };
  }
  if (k === 1) {
    const start = -ri(20, 60), rate = pick([0.5, 1.5, 2.5, 3.5]); let t;
    do { t = ri(2, 10); } while (rate * t > -start);
    const ans = start + rate * t;
    return { long: true, answer: ans, answerText: num(ans),
      html: L(`A diver is at ${num(start)} feet. She rises ${rate} feet per second for ${t} seconds. What is her new elevation, in feet?`,
              `Una buceadora está a ${num(start)} pies. Sube ${rate} pies por segundo durante ${t} segundos. ¿Cuál es su nueva elevación, en pies?`),
      explain: L(`Rising adds: ${num(start)} + ${rate} × ${t} = ${num(start)} + ${num(rate * t)} = ${num(ans)} feet.`, `Subir es sumar: ${num(start)} + ${rate} × ${t} = ${num(start)} + ${num(rate * t)} = ${num(ans)} pies.`),
      hint: L(`First find how far she rises: ${rate} × ${t}. Rising moves her toward the surface, so add that to ${num(start)}.`,
              `Primero calcula cuánto sube: ${rate} × ${t}. Subir la acerca a la superficie, así que súmalo a ${num(start)}.`),
      mistakes: [mk(start - rate * t, L('Rising means going up, toward 0. Add the distance instead of subtracting it.', 'Subir significa ir hacia arriba, hacia el 0. Suma la distancia en lugar de restarla.')),
                 mk(rate * t, L(`That’s how far she rose. Add it to her starting elevation, ${num(start)}.`, `Eso es lo que subió. Súmalo a su elevación inicial, ${num(start)}.`))] };
  }
  if (k === 2) {
    const bal = ri(20, 60) + pick([0, 0.25, 0.5, 0.75]), n = ri(2, 4), price = ri(9, 22) + pick([0.25, 0.5, 0.75]);
    const ans = round2(bal - n * price);
    return { long: true, answer: ans, answerText: money(ans),
      html: L(`Jordan has ${money(bal)} in a bank account and buys ${n} items that cost ${money(price)} each. What is the balance now? Use a negative number if the account is overdrawn.`,
              `Jordan tiene ${money(bal)} en una cuenta bancaria y compra ${n} artículos que cuestan ${money(price)} cada uno. ¿Cuál es el saldo ahora? Usa un número negativo si la cuenta queda en sobregiro.`),
      explain: L(`${money(bal)} ${MINUS} ${n} × ${money(price)} = ${money(bal)} ${MINUS} ${money(n * price)} = ${money(ans)}.`, `${money(bal)} ${MINUS} ${n} × ${money(price)} = ${money(bal)} ${MINUS} ${money(n * price)} = ${money(ans)}.`),
      hint: L(`Find the total cost first: ${n} × ${money(price)}. Then subtract it from ${money(bal)}.`, `Primero calcula el costo total: ${n} × ${money(price)}. Luego réstalo de ${money(bal)}.`),
      mistakes: [mk(round2(bal - price), L(`Jordan bought ${n} items, so multiply the price by ${n} first.`, `Jordan compró ${n} artículos, así que primero multiplica el precio por ${n}.`)),
                 mk(round2(n * price - bal), L('Start with the balance and subtract the cost. If the cost is bigger, the answer is negative.', 'Empieza con el saldo y resta el costo. Si el costo es mayor, la respuesta es negativa.'))] };
  }
  if (k === 3) {
    const loss = ri(2, 8), plays = ri(2, 4), gain = ri(5, 25), ans = -loss * plays + gain;
    return { long: true, answer: ans, answerText: num(ans),
      html: L(`A football team loses ${loss} yards on each of ${plays} plays, then gains ${gain} yards on the next play. What is the team's total change in yards?`,
              `Un equipo de fútbol americano pierde ${loss} yardas en cada una de ${plays} jugadas y luego gana ${gain} yardas en la siguiente jugada. ¿Cuál es el cambio total del equipo en yardas?`),
      explain: L(`${plays} × (${MINUS}${loss}) + ${gain} = ${num(-loss * plays)} + ${gain} = ${num(ans)} yards.`, `${plays} × (${MINUS}${loss}) + ${gain} = ${num(-loss * plays)} + ${gain} = ${num(ans)} yardas.`),
      hint: L(`A loss is negative. Find ${plays} × (${MINUS}${loss}) first, then add the ${gain}-yard gain.`, `Una pérdida es negativa. Primero calcula ${plays} × (${MINUS}${loss}) y luego suma la ganancia de ${gain} yardas.`),
      mistakes: [mk(loss * plays + gain, L(`Losing yards is a negative change. Each loss is ${MINUS}${loss}.`, `Perder yardas es un cambio negativo. Cada pérdida es ${MINUS}${loss}.`)),
                 mk(-loss + gain, L(`The team lost ${loss} yards on each of ${plays} plays, so multiply first.`, `El equipo perdió ${loss} yardas en cada una de ${plays} jugadas, así que multiplica primero.`))] };
  }
  const start = -ri(15, 60), rate = ri(2, 6), t = ri(3, 9), ans = start - rate * t;
  return { long: true, answer: ans, answerText: num(ans),
    html: L(`A submarine is at ${num(start)} meters. It goes down ${rate} meters per minute for ${t} minutes. What is its new elevation, in meters?`,
            `Un submarino está a ${num(start)} metros. Baja ${rate} metros por minuto durante ${t} minutos. ¿Cuál es su nueva elevación, en metros?`),
    explain: L(`Going down subtracts: ${num(start)} ${MINUS} ${rate} × ${t} = ${num(start)} ${MINUS} ${rate * t} = ${num(ans)} meters.`, `Bajar es restar: ${num(start)} ${MINUS} ${rate} × ${t} = ${num(start)} ${MINUS} ${rate * t} = ${num(ans)} metros.`),
    hint: L(`Find how far it goes down: ${rate} × ${t}. Going down makes the elevation more negative.`, `Calcula cuánto baja: ${rate} × ${t}. Bajar hace que la elevación sea más negativa.`),
    mistakes: [mk(start + rate * t, L('Going down makes the elevation more negative, so subtract.', 'Bajar hace que la elevación sea más negativa, así que resta.')),
               mk(-rate * t, L(`That’s how far it went down. Start from ${num(start)}.`, `Eso es lo que bajó. Empieza desde ${num(start)}.`))] };
};

/* ---------- proportionality (7.4A–E, 7.5C, 7.13E) ---------- */
Q.unitRate = () => {
  if (Math.random() < 0.6) {
    const [pl, one, plEs, oneEs, g] = pick([['tacos', 'taco', 'tacos', 'taco', 'o'], ['notebooks', 'notebook', 'cuadernos', 'cuaderno', 'o'], ['bags of chips', 'bag of chips', 'bolsas de papitas', 'bolsa de papitas', 'a'],
      ['bottles of water', 'bottle of water', 'botellas de agua', 'botella de agua', 'a'], ['packs of gum', 'pack of gum', 'paquetes de chicle', 'paquete de chicle', 'o']]);
    const per = pick([0.75, 1.25, 1.5, 2, 2.25, 2.5, 3, 3.5]), n = ri(3, 8), total = per * n;
    return { long: true, answer: per, answerText: money(per),
      html: L(`${n} ${pl} cost ${money(total)}. What is the cost of 1 ${one}?`, `${n} ${plEs} cuestan ${money(total)}. ¿Cuánto cuesta ${g === 'a' ? 'una' : 'un'} ${oneEs}?`),
      explain: L(`Unit rate means "for 1." ${money(total)} ÷ ${n} = ${money(per)} per ${one}.`, `Tasa unitaria significa "por 1." ${money(total)} ÷ ${n} = ${money(per)} por ${oneEs}.`),
      hint: L(`To find the cost of 1, divide the total cost by the number of ${pl}.`, `Para hallar el costo de 1, divide el costo total entre el número de ${plEs}.`),
      mistakes: [mk(round2(total * n), L('Divide, don’t multiply. The cost of 1 is less than the total.', 'Divide, no multipliques. El costo de 1 es menor que el total.')),
                 mk(round2(n / total), L(`Put the total cost first: ${money(total)} ÷ ${n}.`, `Pon primero el costo total: ${money(total)} ÷ ${n}.`))] };
  }
  const [what, unit, per, whatEs, unitEs, unitArt, perEs, perArt, perOneEs] = pick([
    ['A car travels', 'miles', 'hours', 'Un carro recorre', 'millas', 'las', 'horas', 'las', 'hora'],
    ['A printer prints', 'pages', 'minutes', 'Una impresora imprime', 'páginas', 'las', 'minutos', 'los', 'minuto'],
    ['A pump moves', 'gallons', 'minutes', 'Una bomba mueve', 'galones', 'los', 'minutos', 'los', 'minuto']]);
  const rate = ri(12, 70), t = ri(2, 6), one = per.slice(0, -1), cuantos = unitArt === 'las' ? 'Cuántas' : 'Cuántos';
  return { long: true, answer: rate, answerText: num(rate),
    html: L(`${what} ${rate * t} ${unit} in ${t} ${per} at a steady rate. How many ${unit} is that per ${one}?`, `${whatEs} ${rate * t} ${unitEs} en ${t} ${perEs} a una tasa constante. ¿${cuantos} ${unitEs} son por ${perOneEs}?`),
    explain: L(`${rate * t} ÷ ${t} = ${rate} ${unit} per ${one}.`, `${rate * t} ÷ ${t} = ${rate} ${unitEs} por ${perOneEs}.`),
    hint: L(`"Per ${one}" means for 1 ${one}. Divide the ${unit} by the ${per}.`, `"Por ${perOneEs}" significa en 1 ${perOneEs}. Divide ${unitArt} ${unitEs} entre ${perArt} ${perEs}.`),
    mistakes: [mk(rate * t * t, L(`Divide by ${t}, don’t multiply.`, `Divide entre ${t}, no multipliques.`))] };
};
Q.equivRatio = () => {
  let a, b; do { a = ri(1, 8); b = ri(a + 1, 12); } while (gcd(a, b) !== 1);
  const m = ri(2, 6), x = `<span class="fr"><span class="fn">x</span><span class="fd">${b * m}</span></span>`, ask = L('What is x?', '¿Cuánto vale x?');
  if (Math.random() < 0.5) {
    const top = `<span class="fr"><span class="fn">${a}</span><span class="fd">${b}</span></span> = ${x}<br>`;
    return { html: L(`${top}<span class="small">${ask.en}</span>`, `${top}<span class="small">${ask.es}</span>`), answer: a * m, answerText: num(a * m),
      explain: L(`${b} × ${m} = ${b * m}, so multiply the top by ${m} too: ${a} × ${m} = ${a * m}.`, `${b} × ${m} = ${b * m}, así que también multiplica el numerador por ${m}: ${a} × ${m} = ${a * m}.`),
      hint: L(`What do you multiply ${b} by to get ${b * m}? Do the same to the top.`, `¿Por cuánto multiplicas ${b} para obtener ${b * m}? Haz lo mismo con el numerador.`),
      mistakes: [mk(a + (b * m - b), L(`Equivalent ratios scale by multiplying, not adding. ${b} was multiplied by ${m}.`, `Las razones equivalentes se obtienen multiplicando, no sumando. ${b} se multiplicó por ${m}.`))] };
  }
  const top = `<span class="fr"><span class="fn">${a}</span><span class="fd">${b}</span></span> = <span class="fr"><span class="fn">${a * m}</span><span class="fd">x</span></span><br>`;
  return { html: L(`${top}<span class="small">${ask.en}</span>`, `${top}<span class="small">${ask.es}</span>`), answer: b * m, answerText: num(b * m),
    explain: L(`${a} × ${m} = ${a * m}, so multiply the bottom by ${m} too: ${b} × ${m} = ${b * m}.`, `${a} × ${m} = ${a * m}, así que también multiplica el denominador por ${m}: ${b} × ${m} = ${b * m}.`),
    hint: L(`What do you multiply ${a} by to get ${a * m}? Do the same to the bottom.`, `¿Por cuánto multiplicas ${a} para obtener ${a * m}? Haz lo mismo con el denominador.`),
    mistakes: [mk(b + (a * m - a), L(`Equivalent ratios scale by multiplying, not adding. ${a} was multiplied by ${m}.`, `Las razones equivalentes se obtienen multiplicando, no sumando. ${a} se multiplicó por ${m}.`))] };
};
Q.easyPercent = () => {
  const p = pick([10, 20, 25, 50, 75]), f = { 10: '1/10', 20: '1/5', 25: '1/4', 50: '1/2', 75: '3/4' }[p];
  const unit = 100 / gcd(p, 100), n = unit * ri(2, 14), ans = p * n / 100;
  return { html: L(`What is ${p}% of ${n}?`, `¿Cuánto es el ${p}% de ${n}?`), answer: ans, answerText: num(ans),
    explain: L(`${p}% is the same as ${f}. ${f} of ${n} is ${num(ans)}.`, `El ${p}% es lo mismo que ${f}. ${f} de ${n} es ${num(ans)}.`),
    hint: L(`${p}% is the same as the fraction ${f}. What is ${f} of ${n}?`, `El ${p}% es lo mismo que la fracción ${f}. ¿Cuánto es ${f} de ${n}?`),
    mistakes: [mk(p * n, L('Percent means "per hundred," so divide by 100.', 'Por ciento significa "por cada cien," así que divide entre 100.')),
               mk(n - ans, L(`That’s what’s left after taking ${p}%. The question asks for the ${p}% itself.`, `Eso es lo que queda después de quitar el ${p}%. La pregunta pide el ${p}% en sí.`))] };
};
Q.constantK = () => {
  const k = pick([2, 3, 4, 5, 6, 1.5, 2.5, 0.5, 0.25]);
  const pool = k === 0.25 ? [4, 8, 12, 16, 20] : [2, 4, 6, 8, 10, 12];
  const xs = []; while (xs.length < 3) { const v = pick(pool); if (!xs.includes(v)) xs.push(v); }
  xs.sort((p, q) => p - q);
  const tbl = `<table class="qtable"><tr><th>x</th>${xs.map(v => `<td>${v}</td>`).join('')}</tr><tr><th>y</th>${xs.map(v => `<td>${num(v * k)}</td>`).join('')}</tr></table>`;
  return { long: true, answer: k, answerText: k < 1 ? `${num(k)} (or ${k === 0.5 ? '1/2' : '1/4'})` : k % 1 ? `${num(k)} (or ${k * 2}/2)` : num(k),
    html: L(`y is proportional to x.${tbl}What is the constant of proportionality, k, in y = kx?`, `y es proporcional a x.${tbl}¿Cuál es la constante de proporcionalidad, k, en y = kx?`),
    explain: L(`k = y ÷ x. Using the first column: ${num(xs[0] * k)} ÷ ${xs[0]} = ${num(k)}. Every column gives the same k.`, `k = y ÷ x. Con la primera columna: ${num(xs[0] * k)} ÷ ${xs[0]} = ${num(k)}. Todas las columnas dan la misma k.`),
    hint: L('Pick any column and divide y by x.', 'Escoge cualquier columna y divide y entre x.'),
    mistakes: [mk(1 / k, L('k = y ÷ x, not x ÷ y. Put y on top.', 'k = y ÷ x, no x ÷ y. Pon y arriba.')),
               mk(xs[1] * k - xs[0] * k, L('That’s how much y changes between columns. Divide y by x instead.', 'Eso es lo que cambia y entre columnas. Mejor divide y entre x.'))] };
};
Q.percentOf = () => {
  const p = pick([5, 15, 30, 35, 40, 45, 60, 65, 85]), n = 20 * ri(1, 20), ans = p * n / 100;
  return { html: L(`What is ${p}% of ${n}?`, `¿Cuánto es el ${p}% de ${n}?`), answer: ans, answerText: num(ans),
    explain: L(`${p}% = ${num(p / 100)}. ${num(p / 100)} × ${n} = ${num(ans)}.`, `${p}% = ${num(p / 100)}. ${num(p / 100)} × ${n} = ${num(ans)}.`),
    hint: L(`Write ${p}% as a decimal (${num(p / 100)}), then multiply by ${n}. Or find 10% first and build from there.`, `Escribe el ${p}% como decimal (${num(p / 100)}) y luego multiplica por ${n}. O calcula primero el 10% y parte de ahí.`),
    mistakes: [mk(p * n, L(`Percent means "per hundred," so ${p}% is ${num(p / 100)}, not ${p}.`, `Por ciento significa "por cada cien," así que el ${p}% es ${num(p / 100)}, no ${p}.`)),
               mk(n / p, L(`Multiply by ${p}% instead of dividing.`, `Multiplica por el ${p}% en lugar de dividir.`))] };
};
Q.salesTax = () => {
  const [item, itemEs] = pick([['pair of headphones', 'Unos audífonos cuestan'], ['jacket', 'Una chaqueta cuesta'], ['video game', 'Un videojuego cuesta'], ['backpack', 'Una mochila cuesta'], ['pair of sneakers', 'Unos tenis cuestan']]);
  const price = 4 * ri(5, 30), tax = round2(price * 0.0825), total = round2(price + tax);
  return { long: true, answer: total, answerText: money(total),
    html: L(`A ${item} costs ${money(price)}. With 8.25% sales tax, what is the total cost?`, `${itemEs} ${money(price)}. Con un impuesto sobre las ventas del 8.25%, ¿cuál es el costo total?`),
    explain: L(`Tax: 0.0825 × ${money(price)} = ${money(tax)}. Total: ${money(price)} + ${money(tax)} = ${money(total)}.`, `Impuesto: 0.0825 × ${money(price)} = ${money(tax)}. Total: ${money(price)} + ${money(tax)} = ${money(total)}.`),
    hint: L(`Find the tax first: 8.25% = 0.0825, so multiply 0.0825 × ${money(price)}. Then add it to the price.`, `Primero calcula el impuesto: 8.25% = 0.0825, así que multiplica 0.0825 × ${money(price)}. Luego súmalo al precio.`),
    mistakes: [mk(tax, L('That’s just the tax. Add it to the price for the total cost.', 'Eso es solo el impuesto. Súmalo al precio para obtener el costo total.')),
               mk(round2(price + 8.25), L(`8.25% of the price isn’t $8.25. Multiply ${money(price)} × 0.0825.`, `El 8.25% del precio no es $8.25. Multiplica ${money(price)} × 0.0825.`))] };
};
Q.tip = () => {
  const bill = ri(14, 64), p = pick([15, 20]), tip = round2(bill * p / 100);
  return { long: true, answer: tip, answerText: money(tip),
    html: L(`A family's dinner costs ${money(bill)}. How much is a ${p}% tip?`, `La cena de una familia cuesta ${money(bill)}. ¿De cuánto es una propina del ${p}%?`),
    explain: L(`${p}% = ${num(p / 100)}. ${num(p / 100)} × ${money(bill)} = ${money(tip)}.`, `${p}% = ${num(p / 100)}. ${num(p / 100)} × ${money(bill)} = ${money(tip)}.`),
    hint: p === 20 ? L('Find 10% by moving the decimal one place left, then double it.', 'Calcula el 10% moviendo el punto decimal un lugar a la izquierda y luego duplícalo.')
      : L('Find 10%, then add half of that 10% to get 15%.', 'Calcula el 10% y luego suma la mitad de ese 10% para obtener el 15%.'),
    mistakes: [mk(round2(bill + tip), L('The question asks for just the tip, not the total.', 'La pregunta pide solo la propina, no el total.')),
               mk(round2(bill * p), L(`${p}% means ${num(p / 100)}. Divide by 100.`, `El ${p}% significa ${num(p / 100)}. Divide entre 100.`))] };
};
Q.scale = () => {
  const s = pick([2, 4, 5, 8, 10]), d = ri(3, 14) / 2, ans = d * s;
  return { long: true, answer: ans, answerText: num(ans),
    html: L(`On a floor plan, 1 inch represents ${s} feet. A room is ${num(d)} inches long on the plan. How long is the real room, in feet?`,
            `En un plano, 1 pulgada representa ${s} pies. Un cuarto mide ${num(d)} pulgadas de largo en el plano. ¿Cuánto mide el cuarto real, en pies?`),
    explain: L(`Each inch is ${s} feet, so ${num(d)} × ${s} = ${num(ans)} feet.`, `Cada pulgada es ${s} pies, así que ${num(d)} × ${s} = ${num(ans)} pies.`),
    hint: L(`Every 1 inch on the plan is ${s} real feet. How many groups of ${s} do ${num(d)} inches make?`, `Cada pulgada del plano son ${s} pies reales. ¿Cuántos grupos de ${s} forman ${num(d)} pulgadas?`),
    mistakes: [mk(d / s, L(`Each inch stands for ${s} feet, so the real room is bigger. Multiply.`, `Cada pulgada representa ${s} pies, así que el cuarto real es más grande. Multiplica.`)),
               mk(d + s, L('Scale drawings multiply, they don’t add.', 'Los dibujos a escala se multiplican, no se suman.'))] };
};
Q.convert = () => {
  const [fact, from, to, rate, factEs, fromEs, toEs, toF, fromF] = pick([
    ['1 inch = 2.54 centimeters', 'inches', 'centimeters', 2.54, '1 pulgada = 2.54 centímetros', 'pulgadas', 'centímetros', false, true],
    ['1 mile ≈ 1.6 kilometers', 'miles', 'kilometers', 1.6, '1 milla ≈ 1.6 kilómetros', 'millas', 'kilómetros', false, true],
    ['1 kilogram ≈ 2.2 pounds', 'kilograms', 'pounds', 2.2, '1 kilogramo ≈ 2.2 libras', 'kilogramos', 'libras', true, false]]);
  const n = ri(2, 12), ans = round2(n * rate);
  return { long: true, answer: ans, answerText: num(ans),
    html: L(`Use ${fact}. About how many ${to} are in ${n} ${from}?`, `Usa ${factEs}. ¿Aproximadamente ${toF ? 'cuántas' : 'cuántos'} ${toEs} hay en ${n} ${fromEs}?`),
    explain: L(`Multiply by the conversion rate: ${n} × ${rate} = ${num(ans)} ${to}.`, `Multiplica por la tasa de conversión: ${n} × ${rate} = ${num(ans)} ${toEs}.`),
    hint: L(`Each 1 of the ${from} is ${rate} ${to}. You have ${n} of them.`, `${fromF ? 'Cada una de las' : 'Cada uno de los'} ${fromEs} equivale a ${rate} ${toEs}. Tienes ${n}.`),
    mistakes: [mk(round2(n / rate), L(`Each one of the ${from} equals ${rate} ${to}, so multiply.`, `${fromF ? 'Cada una de las' : 'Cada uno de los'} ${fromEs} equivale a ${rate} ${toEs}, así que multiplica.`))] };
};
Q.percentChange = () => {
  const orig = 20 * ri(2, 15), p = pick([10, 20, 25, 30, 40, 50, 60, 75]), inc = Math.random() < 0.5;
  const nw = inc ? orig + orig * p / 100 : orig - orig * p / 100, diff = Math.abs(nw - orig);
  const game = Math.random() < 0.5;
  const ctx = game ? L(`A game's price went from ${money(orig)} to ${money(nw)}.`, `El precio de un juego pasó de ${money(orig)} a ${money(nw)}.`)
    : L(`A school club's followers went from ${orig} to ${nw}.`, `Los seguidores de un club escolar pasaron de ${orig} a ${nw}.`);
  return { long: true, answer: p, answerText: `${p}%`,
    html: L(`${ctx.en} What is the percent ${inc ? 'increase' : 'decrease'}? Answer as a percent.`, `${ctx.es} ¿Cuál es el porcentaje de ${inc ? 'aumento' : 'disminución'}? Responde con un porcentaje.`),
    explain: L(`Find the change, then divide by the original amount: ${num(diff)} ÷ ${orig} = ${num(p / 100)} = ${p}%.`, `Halla el cambio y luego divide entre la cantidad original: ${num(diff)} ÷ ${orig} = ${num(p / 100)} = ${p}%.`),
    hint: L(`First find the change: ${num(diff)}. Then divide by the original amount, ${orig}.`, `Primero halla el cambio: ${num(diff)}. Luego divide entre la cantidad original, ${orig}.`),
    mistakes: [mk(diff, L('That’s the amount of change. Divide it by the original amount to get a percent.', 'Esa es la cantidad que cambió. Divídela entre la cantidad original para obtener el porcentaje.')),
               mk(round2(diff / nw * 100), L('Divide by the original amount (where it started), not the new amount.', 'Divide entre la cantidad original (donde empezó), no entre la cantidad nueva.')),
               mk(p / 100, L(`You found the decimal. Write it as a percent: ${num(p / 100)} = ${p}%.`, `Encontraste el decimal. Escríbelo como porcentaje: ${num(p / 100)} = ${p}%.`))] };
};
Q.discountTax = () => {
  const d = pick([20, 25, 50]), orig = { 20: 20, 25: 16, 50: 8 }[d] * ri(2, 8);
  const sale = orig * (1 - d / 100), tax = round2(sale * 0.0825), total = round2(sale + tax);
  return { long: true, answer: total, answerText: money(total),
    html: L(`Sneakers cost ${money(orig)} and are on sale for ${d}% off. Then 8.25% sales tax is added to the sale price. What is the final cost?`,
            `Unos tenis cuestan ${money(orig)} y tienen ${d}% de descuento. Luego se agrega un impuesto sobre las ventas del 8.25% al precio de oferta. ¿Cuál es el costo final?`),
    explain: L(`Sale price: ${money(orig)} ${MINUS} ${d}% = ${money(sale)}. Tax: 0.0825 × ${money(sale)} = ${money(tax)}. Total: ${money(total)}.`,
               `Precio de oferta: ${money(orig)} ${MINUS} ${d}% = ${money(sale)}. Impuesto: 0.0825 × ${money(sale)} = ${money(tax)}. Total: ${money(total)}.`),
    hint: L(`Two steps. First take ${d}% off ${money(orig)} to get the sale price. Then add 8.25% tax to that sale price.`,
            `Dos pasos. Primero quita el ${d}% a ${money(orig)} para obtener el precio de oferta. Luego agrega el 8.25% de impuesto a ese precio.`),
    mistakes: [mk(sale, L('That’s the sale price. Now add the 8.25% sales tax.', 'Ese es el precio de oferta. Ahora agrega el impuesto sobre las ventas del 8.25%.')),
               mk(round2(sale + orig * 0.0825), L('The tax is figured on the sale price, not the original price.', 'El impuesto se calcula sobre el precio de oferta, no sobre el precio original.')),
               mk(round2(orig * d / 100), L(`That’s the discount. Subtract it from ${money(orig)}.`, `Ese es el descuento. Réstalo de ${money(orig)}.`))] };
};
Q.markup = () => {
  const cost = 2 * ri(4, 30), p = pick([25, 40, 50, 60, 75, 100]), price = round2(cost * (1 + p / 100));
  return { long: true, answer: price, answerText: money(price),
    html: L(`A store buys a hoodie for ${money(cost)} and marks the price up ${p}%. What is the selling price?`, `Una tienda compra una sudadera en ${money(cost)} y le aumenta el precio un ${p}%. ¿Cuál es el precio de venta?`),
    explain: L(`Markup: ${num(p / 100)} × ${money(cost)} = ${money(cost * p / 100)}. Selling price: ${money(cost)} + ${money(cost * p / 100)} = ${money(price)}.`,
               `Aumento: ${num(p / 100)} × ${money(cost)} = ${money(cost * p / 100)}. Precio de venta: ${money(cost)} + ${money(cost * p / 100)} = ${money(price)}.`),
    hint: L(`Find ${p}% of ${money(cost)}. That’s the markup. Add it to the cost.`, `Calcula el ${p}% de ${money(cost)}. Ese es el aumento. Súmalo al costo.`),
    mistakes: [mk(round2(cost * p / 100), L('That’s the markup amount. Add it to the cost for the selling price.', 'Esa es la cantidad del aumento. Súmala al costo para obtener el precio de venta.')),
               mk(round2(cost - cost * p / 100), L('A markup raises the price. Add instead of subtracting.', 'Un aumento sube el precio. Suma en lugar de restar.'))] };
};
Q.fracRate = () => {
  let d1 = pick([2, 3, 4, 5, 8]), n1 = ri(1, d1 - 1), d2 = pick([2, 3, 4, 6]), n2 = ri(1, d2 - 1);
  [n1, d1] = simp(n1, d1); [n2, d2] = simp(n2, d2);
  const rn = n1 * d2, rd = d1 * n2, name = pick(['Maya', 'Diego', 'Ana', 'Luis']), simple = fracText(rn, rd).split(' (')[0];
  return { long: true, answer: rn / rd, answerText: fracText(rn, rd),
    html: L(`${name} walks ${fracHTML(n1, d1)} mile in ${fracHTML(n2, d2)} hour. At this rate, how many miles does ${name} walk in 1 hour?`,
            `${name} camina ${fracHTML(n1, d1)} de milla en ${fracHTML(n2, d2)} de hora. A este paso, ¿cuántas millas camina ${name} en 1 hora?`),
    explain: L(`Divide distance by time: ${raw(n1, d1)} ÷ ${raw(n2, d2)} = ${raw(n1, d1)} × ${raw(d2, n2)} = ${simple} miles per hour.`,
               `Divide la distancia entre el tiempo: ${raw(n1, d1)} ÷ ${raw(n2, d2)} = ${raw(n1, d1)} × ${raw(d2, n2)} = ${simple} millas por hora.`),
    hint: L(`Miles per hour means miles ÷ hours: ${raw(n1, d1)} ÷ ${raw(n2, d2)}. To divide by a fraction, multiply by its reciprocal.`,
            `Millas por hora significa millas ÷ horas: ${raw(n1, d1)} ÷ ${raw(n2, d2)}. Para dividir entre una fracción, multiplica por su recíproco.`),
    mistakes: [mk((n2 * d1) / (d2 * n1), L('Put miles on top: miles ÷ hours.', 'Pon las millas arriba: millas ÷ horas.')),
               mk((n1 * n2) / (d1 * d2), L('You multiplied. Miles per hour means dividing miles by hours.', 'Multiplicaste. Millas por hora significa dividir las millas entre las horas.'))] };
};
Q.findWhole = () => {
  const p = pick([10, 20, 25, 30, 40, 50, 60, 75]), whole = (100 / gcd(p, 100)) * ri(2, 12), part = p * whole / 100;
  return { html: L(`${part} is ${p}% of what number?`, `${part} es el ${p}% de ¿qué número?`), answer: whole, answerText: num(whole),
    explain: L(`${part} ÷ ${num(p / 100)} = ${whole}. Check: ${p}% of ${whole} is ${part}.`, `${part} ÷ ${num(p / 100)} = ${whole}. Comprueba: el ${p}% de ${whole} es ${part}.`),
    hint: L(`${part} is only part of the number, so the number is bigger. Divide ${part} by ${num(p / 100)}.`, `${part} es solo una parte del número, así que el número es mayor. Divide ${part} entre ${num(p / 100)}.`),
    mistakes: [mk(round2(part * p / 100), L(`You found ${p}% of ${part}. Instead, ${part} is ${p}% of the mystery number, so divide.`, `Calculaste el ${p}% de ${part}. Pero ${part} es el ${p}% del número desconocido, así que divide.`))] };
};
Q.simpleInterest = () => {
  const P = 100 * ri(2, 20), r = pick([2, 3, 4, 5, 6]), t = ri(2, 6), I = P * r * t / 100;
  return { long: true, answer: I, answerText: money(I),
    html: L(`You put ${money(P)} in a savings account that earns ${r}% simple interest per year. How much interest do you earn in ${t} years?`,
            `Depositas ${money(P)} en una cuenta de ahorros que gana ${r}% de interés simple al año. ¿Cuánto interés ganas en ${t} años?`),
    explain: L(`I = Prt = ${money(P)} × ${num(r / 100)} × ${t} = ${money(I)}.`, `I = Prt = ${money(P)} × ${num(r / 100)} × ${t} = ${money(I)}.`),
    hint: L(`Use I = Prt. P is ${money(P)}, r is ${r}% written as a decimal, and t is ${t}.`, `Usa I = Prt. P es ${money(P)}, r es ${r}% escrito como decimal y t es ${t}.`),
    mistakes: [mk(P + I, L('That’s the total in the account. The question asks for just the interest.', 'Ese es el total en la cuenta. La pregunta pide solo el interés.')),
               mk(P * r * t, L(`Write the rate as a decimal: ${r}% = ${num(r / 100)}.`, `Escribe la tasa como decimal: ${r}% = ${num(r / 100)}.`)),
               mk(P * r / 100, L(`That’s one year of interest. Multiply by ${t} years.`, `Ese es el interés de un año. Multiplica por ${t} años.`))] };
};

/* ---------- equations and inequalities (7.10A, 7.10B, 7.11A, 7.11B) ----------
   Two extra answer kinds live here:
     kind: 'ineq'   answer { sym, val }, the student taps <, >, ≤ or ≥ and types the number (x ___ number)
     kind: 'choice' options [{ html, ok, msg }], the student taps one; msg explains a wrong pick
   Inequality questions also give ineq: { flip, strict, value } messages for the common mistakes. */
const V = (v = 'x') => `<i class="var">${v}</i>`;
const SYM = { '<': '&lt;', '>': '&gt;', '<=': '≤', '>=': '≥' };
const symText = s => ({ '<': '<', '>': '>', '<=': '≤', '>=': '≥' })[s];
const flipSym = s => ({ '<': '>', '>': '<', '<=': '>=', '>=': '<=' })[s];
const strictSwap = s => ({ '<': '<=', '<=': '<', '>': '>=', '>=': '>' })[s];
const term = (a, v = 'x') => (a === 1 ? V(v) : a === -1 ? `${MINUS}${V(v)}` : `${num(a)}${V(v)}`);
const plusC = c => (c === 0 ? '' : c > 0 ? ` + ${c}` : ` ${MINUS} ${Math.abs(c)}`);
const fracX = (a, v = 'x') => `<span class="fr"><span class="fn">${V(v)}</span><span class="fd">${a}</span></span>`;
const undoL = b => (b > 0 ? L(`subtract ${b}`, `resta ${b}`) : L(`add ${-b}`, `suma ${-b}`));
const opText = b => (b > 0 ? `+ ${b}` : `${MINUS} ${-b}`);
// A number line showing x (sym) v. Used in questions and in explanations.
function numberLineSVG(v, sym, opts = {}) {
  const lo = v - 5, hi = v + 5, W = 300, X = t => 20 + (t - lo) / (hi - lo) * (W - 40);
  const closed = sym === '<=' || sym === '>=', right = sym === '>' || sym === '>=';
  let ticks = '';
  for (let t = lo; t <= hi; t++) ticks += `<path d="M${X(t)} 30v10" stroke="currentColor" stroke-width="1.6"/><text x="${X(t)}" y="56" text-anchor="middle" font-size="11" fill="currentColor">${num(t)}</text>`;
  const x0 = X(v), x1 = right ? W - 8 : 8;
  return `<svg class="nline${opts.small ? ' small' : ''}" viewBox="0 0 ${W} 62" role="img" aria-label="x ${symText(sym)} ${num(v)}">
    <path d="M6 35H${W - 6}" stroke="currentColor" stroke-width="1.8"/><path d="M${W - 4} 35 l-8 -5 v10z M4 35 l8 -5 v10z" fill="currentColor"/>${ticks}
    <path d="M${x0} 35H${x1}" stroke="#2168B8" stroke-width="6" stroke-linecap="round"/><path d="M${right ? W - 2 : 2} 35 l${right ? -12 : 12} -8 v16z" fill="#2168B8"/>
    <circle cx="${x0}" cy="35" r="7" fill="${closed ? '#2168B8' : '#FFFFFF'}" stroke="#2168B8" stroke-width="3"/></svg>`;
}
const ineqText = (s, v, x = 'x') => `${x} ${symText(s)} ${num(v)}`;
const opsFor = s => ({ '<': L('less than', 'menor que'), '>': L('greater than', 'mayor que'), '<=': L('less than or equal to', 'menor o igual que'), '>=': L('greater than or equal to', 'mayor o igual que') })[s];
function shuffleOpts(opts) { for (let i = opts.length - 1; i > 0; i--) { const j = ri(0, i); [opts[i], opts[j]] = [opts[j], opts[i]]; } return opts; }

Q.eqOneStep = () => {
  const k = ri(0, 2), x = nz(-12, 12), solve = L(`Solve for ${V()}:`, `Resuelve para ${V()}:`);
  if (k === 0) {
    const a = nz(-15, 15), b = x + a, eq = `${V()}${plusC(a)} = ${num(b)}`;
    return { html: L(`${solve.en} ${eq}`, `${solve.es} ${eq}`), answer: x, answerText: num(x),
      explain: L(`${a > 0 ? `Subtract ${a}` : `Add ${-a}`} on both sides: ${V()} = ${num(b)} ${a > 0 ? MINUS : '+'} ${Math.abs(a)} = ${num(x)}.`,
                 `${a > 0 ? `Resta ${a}` : `Suma ${-a}`} en los dos lados: ${V()} = ${num(b)} ${a > 0 ? MINUS : '+'} ${Math.abs(a)} = ${num(x)}.`),
      hint: L(`What’s being done to ${V()}? ${a > 0 ? `It’s adding ${a}, so subtract ${a} from both sides.` : `It’s subtracting ${-a}, so add ${-a} to both sides.`}`,
              `¿Qué se le hace a ${V()}? ${a > 0 ? `Se le suma ${a}, así que resta ${a} en los dos lados.` : `Se le resta ${-a}, así que suma ${-a} en los dos lados.`}`),
      mistakes: [mk(b + a, L(`You did the same operation instead of the opposite. To undo ${a > 0 ? `+ ${a}, subtract ${a}` : `${MINUS} ${-a}, add ${-a}`}.`,
                             `Hiciste la misma operación en lugar de la opuesta. Para deshacer ${a > 0 ? `+ ${a}, resta ${a}` : `${MINUS} ${-a}, suma ${-a}`}.`))] };
  }
  if (k === 1) {
    const a = nzBig(-9, 9), b = a * x, eq = `${term(a)} = ${num(b)}`;
    return { html: L(`${solve.en} ${eq}`, `${solve.es} ${eq}`), answer: x, answerText: num(x),
      explain: L(`${term(a)} means ${num(a)} times ${V()}, so divide both sides by ${paren(a)}: ${V()} = ${num(b)} ÷ ${paren(a)} = ${num(x)}.`,
                 `${term(a)} significa ${num(a)} por ${V()}, así que divide los dos lados entre ${paren(a)}: ${V()} = ${num(b)} ÷ ${paren(a)} = ${num(x)}.`),
      hint: L(`${term(a)} means ${num(a)} × ${V()}. Undo multiplying by dividing both sides by ${paren(a)}.`, `${term(a)} significa ${num(a)} × ${V()}. Deshaz la multiplicación dividiendo los dos lados entre ${paren(a)}.`),
      mistakes: [mk(b - a, L(`${term(a)} means multiply, not add. Divide both sides by ${paren(a)}.`, `${term(a)} significa multiplicar, no sumar. Divide los dos lados entre ${paren(a)}.`)),
                 mk(b * a, L(`To undo multiplying by ${paren(a)}, divide by it.`, `Para deshacer la multiplicación por ${paren(a)}, divide entre ese número.`))] };
  }
  const a = nzBig(-8, 8), b = nz(-9, 9), xx = a * b, eq = `${fracX(a < 0 ? `(${num(a)})` : a)} = ${num(b)}`;
  return { html: L(`${solve.en} ${eq}`, `${solve.es} ${eq}`), answer: xx, answerText: num(xx),
    explain: L(`${V()} is divided by ${paren(a)}, so multiply both sides by ${paren(a)}: ${V()} = ${num(b)} × ${paren(a)} = ${num(xx)}.`,
               `${V()} está dividida entre ${paren(a)}, así que multiplica los dos lados por ${paren(a)}: ${V()} = ${num(b)} × ${paren(a)} = ${num(xx)}.`),
    hint: L(`${V()} is being divided by ${paren(a)}. Undo it by multiplying both sides by ${paren(a)}.`, `${V()} se divide entre ${paren(a)}. Deshazlo multiplicando los dos lados por ${paren(a)}.`),
    mistakes: [mk(b / a, L(`To undo dividing by ${paren(a)}, multiply by it instead.`, `Para deshacer la división entre ${paren(a)}, multiplica por ese número.`))] };
};
Q.eqCheck = () => {
  const a = nzBig(-6, 6), x = nz(-8, 8), b = nz(-12, 12), c = a * x + b;
  const yes = Math.random() < 0.5, v = yes ? x : x + pick([-2, -1, 1, 2]);
  const lhs = a * v + b, eq = `${term(a)}${plusC(b)} = ${num(c)}`, sub = `${paren(a)}(${num(v)})${plusC(b)} = ${num(lhs)}`;
  return { kind: 'choice', html: L(`Is ${V()} = ${num(v)} a solution of ${eq}?`, `¿Es ${V()} = ${num(v)} una solución de ${eq}?`),
    options: [{ html: L('Yes', 'Sí'), ok: yes, msg: L(`Substitute ${num(v)} for ${V()}: ${sub}, which is not ${num(c)}.`, `Sustituye ${V()} por ${num(v)}: ${sub}, que no es ${num(c)}.`) },
              { html: L('No', 'No'), ok: !yes, msg: L(`Substitute ${num(v)} for ${V()}: ${sub}. That equals ${num(c)}, so it is a solution.`, `Sustituye ${V()} por ${num(v)}: ${sub}. Eso es igual a ${num(c)}, así que sí es una solución.`) }],
    answerText: yes ? L('Yes', 'Sí') : L('No', 'No'),
    explain: L(`Substitute: ${sub}. ${lhs === c ? `Both sides equal ${num(c)}, so yes, it’s a solution.` : `${num(lhs)} ≠ ${num(c)}, so no, it isn’t a solution.`}`,
               `Sustituye: ${sub}. ${lhs === c ? `Los dos lados son iguales a ${num(c)}, así que sí es una solución.` : `${num(lhs)} ≠ ${num(c)}, así que no es una solución.`}`),
    hint: L(`Replace ${V()} with ${num(v)}, work out the left side, and see if it equals ${num(c)}.`, `Reemplaza ${V()} por ${num(v)}, resuelve el lado izquierdo y fíjate si es igual a ${num(c)}.`) };
};
Q.eqTwoStep = () => {
  const x = nz(-10, 10), solve = L(`Solve for ${V()}:`, `Resuelve para ${V()}:`);
  if (Math.random() < 0.65) {
    const a = nzBig(-9, 9), b = nz(-15, 15), c = a * x + b, eq = `${term(a)}${plusC(b)} = ${num(c)}`, u = undoL(b);
    return { html: L(`${solve.en} ${eq}`, `${solve.es} ${eq}`), answer: x, answerText: num(x),
      explain: L(`Step 1: ${u.en} on both sides: ${term(a)} = ${num(c - b)}. Step 2: divide both sides by ${paren(a)}: ${V()} = ${num(x)}.`,
                 `Paso 1: ${u.es} en los dos lados: ${term(a)} = ${num(c - b)}. Paso 2: divide los dos lados entre ${paren(a)}: ${V()} = ${num(x)}.`),
      hint: L(`Undo the ${opText(b)} first, then undo the multiplying by ${paren(a)}.`, `Primero deshaz el ${opText(b)} y luego deshaz la multiplicación por ${paren(a)}.`),
      mistakes: [mk((c + b) / a, L(`In step 1, use the opposite operation: ${u.en}.`, `En el paso 1, usa la operación opuesta: ${u.es}.`)),
                 mk(c / a - b, L('Undo the adding or subtracting first, then the multiplying. Work backward from the outside.', 'Primero deshaz la suma o la resta y después la multiplicación. Trabaja de afuera hacia adentro.')),
                 mk((c - b) * a, L(`${term(a)} means multiply, so undo it by dividing by ${paren(a)}.`, `${term(a)} significa multiplicar, así que deshazlo dividiendo entre ${paren(a)}.`))] };
  }
  const a = pick([2, 3, 4, 5]), q = nz(-8, 8), b = nz(-10, 10), c = q + b, xx = q * a, eq = `${fracX(a)}${plusC(b)} = ${num(c)}`, u = undoL(b);
  return { html: L(`${solve.en} ${eq}`, `${solve.es} ${eq}`), answer: xx, answerText: num(xx),
    explain: L(`Step 1: ${u.en}: ${fracX(a)} = ${num(c - b)}. Step 2: multiply both sides by ${a}: ${V()} = ${num(xx)}.`, `Paso 1: ${u.es}: ${fracX(a)} = ${num(c - b)}. Paso 2: multiplica los dos lados por ${a}: ${V()} = ${num(xx)}.`),
    hint: L(`Undo the ${opText(b)} first. Then ${V()} is divided by ${a}, so multiply by ${a}.`, `Primero deshaz el ${opText(b)}. Luego ${V()} está dividida entre ${a}, así que multiplica por ${a}.`),
    mistakes: [mk((c - b) / a, L(`${V()} is divided by ${a}, so multiply by ${a} to undo it.`, `${V()} está dividida entre ${a}, así que multiplica por ${a} para deshacerlo.`)),
               mk((c + b) * a, L(`In step 1, use the opposite operation: ${u.en}.`, `En el paso 1, usa la operación opuesta: ${u.es}.`)),
               mk(c * a - b, L('Undo the adding or subtracting first.', 'Primero deshaz la suma o la resta.'))] };
};
const solveL = L('Solve:', 'Resuelve:');
Q.ineqOneStep = () => {
  const s = pick(['<', '>', '<=', '>=']), v = nz(-10, 10), nl = numberLineSVG(v, s, { small: true }), keep = L(`Keep the same symbol: the problem uses ${symText(s)}.`, `Conserva el mismo símbolo: el problema usa ${symText(s)}.`);
  if (Math.random() < 0.5) {
    const a = nz(-12, 12), c = v + a, iq = `${V()}${plusC(a)} ${SYM[s]} ${num(c)}`, u = undoL(a);
    return { kind: 'ineq', html: L(`${solveL.en} ${iq}`, `${solveL.es} ${iq}`), answer: { sym: s, val: v }, answerText: ineqText(s, v),
      explain: L(`${u.en[0].toUpperCase() + u.en.slice(1)} on both sides. The sign stays the same: ${ineqText(s, v)}.${nl}`, `${u.es[0].toUpperCase() + u.es.slice(1)} en los dos lados. El signo se queda igual: ${ineqText(s, v)}.${nl}`),
      hint: L(`Solve it like an equation: ${u.en} on both sides. Adding or subtracting never flips the sign.`, `Resuélvela como una ecuación: ${u.es} en los dos lados. Sumar o restar nunca invierte el signo.`),
      ineq: { flip: L('Adding or subtracting doesn’t flip the inequality sign. Keep it the same.', 'Sumar o restar no invierte el signo de desigualdad. Déjalo igual.'), strict: keep,
              value: L(`Check the number. ${u.en[0].toUpperCase() + u.en.slice(1)} on both sides.`, `Revisa el número. ${u.es[0].toUpperCase() + u.es.slice(1)} en los dos lados.`) } };
  }
  const a = pick([2, 3, 4, 5, 6]), c = a * v, iq = `${term(a)} ${SYM[s]} ${num(c)}`;
  return { kind: 'ineq', html: L(`${solveL.en} ${iq}`, `${solveL.es} ${iq}`), answer: { sym: s, val: v }, answerText: ineqText(s, v),
    explain: L(`Divide both sides by ${a}. ${a} is positive, so the sign stays the same: ${ineqText(s, v)}.${nl}`, `Divide los dos lados entre ${a}. ${a} es positivo, así que el signo se queda igual: ${ineqText(s, v)}.${nl}`),
    hint: L(`Divide both sides by ${a}. Dividing by a positive number keeps the sign the same.`, `Divide los dos lados entre ${a}. Dividir entre un número positivo no cambia el signo.`),
    ineq: { flip: L(`You only flip the sign when you multiply or divide by a negative. ${a} is positive.`, `Solo inviertes el signo cuando multiplicas o divides entre un negativo. ${a} es positivo.`), strict: keep,
            value: L(`Divide ${num(c)} by ${a}.`, `Divide ${num(c)} entre ${a}.`) } };
};
Q.ineqGraph = () => {
  const s = pick(['<', '>', '<=', '>=']), v = nz(-7, 7), filled = s.length > 1, right = s.includes('>'), nl = numberLineSVG(v, s);
  return { kind: 'ineq', long: true, html: L(`Which inequality does this number line show?${nl}`, `¿Qué desigualdad muestra esta recta numérica?${nl}`), answer: { sym: s, val: v }, answerText: ineqText(s, v),
    explain: L(`The circle is ${filled ? 'filled' : 'open'}, so ${num(v)} is ${filled ? '' : 'not '}included. The arrow points ${right ? 'right, toward greater' : 'left, toward smaller'} numbers. So it’s ${ineqText(s, v)}.`,
               `El círculo está ${filled ? 'relleno' : 'abierto'}, así que ${num(v)} ${filled ? 'sí' : 'no'} está incluido. La flecha apunta hacia la ${right ? 'derecha, hacia números mayores' : 'izquierda, hacia números menores'}. Entonces es ${ineqText(s, v)}.`),
    hint: L('Look at the circle first: open means < or >, filled means ≤ or ≥. Then look at which way the arrow points.', 'Primero mira el círculo: abierto significa < o >, relleno significa ≤ o ≥. Luego fíjate hacia dónde apunta la flecha.'),
    ineq: { flip: L(`The arrow points ${right ? 'right, toward greater numbers, so use > or ≥' : 'left, toward smaller numbers, so use < or ≤'}.`, `La flecha apunta hacia la ${right ? 'derecha, hacia números mayores, así que usa > o ≥' : 'izquierda, hacia números menores, así que usa < o ≤'}.`),
            strict: L(`Look at the circle. ${filled ? 'It’s filled in, so the number is included: use ≤ or ≥.' : 'It’s open, so the number is not included: use < or >.'}`, `Mira el círculo. ${filled ? 'Está relleno, así que el número está incluido: usa ≤ o ≥.' : 'Está abierto, así que el número no está incluido: usa < o >.'}`),
            value: L('The circle sits on the boundary number. Read it from the number line.', 'El círculo está sobre el número límite. Léelo en la recta numérica.') } };
};
Q.eqWrite = () => {
  const k = ri(0, 3);
  let html, opts, explain;
  if (k === 0) {
    let s0, r; do { s0 = ri(5, 30); r = ri(3, 9); } while (s0 === r); const t = s0 + r * ri(3, 9);
    html = L(`Ana has $${s0} saved. She saves $${r} each week. Which equation finds ${V('w')}, the number of weeks until she has $${t}?`, `Ana tiene $${s0} ahorrados. Ahorra $${r} cada semana. ¿Qué ecuación encuentra ${V('w')}, el número de semanas hasta que tenga $${t}?`);
    opts = [{ html: `${r}${V('w')} + ${s0} = ${t}`, ok: true },
            { html: `${s0}${V('w')} + ${r} = ${t}`, msg: L(`The $${r} happens every week, so it goes with ${V('w')}. The $${s0} is only added once.`, `Los $${r} se repiten cada semana, así que van con ${V('w')}. Los $${s0} se suman solo una vez.`) },
            { html: `${r}${V('w')} ${MINUS} ${s0} = ${t}`, msg: L(`She already has $${s0}, so it’s added, not subtracted.`, `Ella ya tiene $${s0}, así que se suman, no se restan.`) },
            { html: `${r} + ${s0}${V('w')} = ${t}`, msg: L(`Each week adds $${r}, so it’s $${r} times ${V('w')}.`, `Cada semana agrega $${r}, así que es $${r} por ${V('w')}.`) }];
    explain = L(`$${r} per week times ${V('w')} weeks, plus the $${s0} she starts with, equals $${t}: ${r}${V('w')} + ${s0} = ${t}.`, `$${r} por semana por ${V('w')} semanas, más los $${s0} con los que empieza, es igual a $${t}: ${r}${V('w')} + ${s0} = ${t}.`);
  } else if (k === 1) {
    let f, r; do { f = ri(3, 8); r = ri(2, 4); } while (f === r); const t = f + r * ri(4, 12);
    html = L(`A taxi charges $${f} plus $${r} per mile. A ride costs $${t}. Which equation finds ${V('m')}, the number of miles?`, `Un taxi cobra $${f} más $${r} por milla. Un viaje cuesta $${t}. ¿Qué ecuación encuentra ${V('m')}, el número de millas?`);
    opts = [{ html: `${r}${V('m')} + ${f} = ${t}`, ok: true },
            { html: `${f}${V('m')} + ${r} = ${t}`, msg: L(`The $${r} is charged for each mile, so it goes with ${V('m')}.`, `Los $${r} se cobran por cada milla, así que van con ${V('m')}.`) },
            { html: `${r}${V('m')} ${MINUS} ${f} = ${t}`, msg: L(`The $${f} is added to the bill, not taken away.`, `Los $${f} se suman a la cuenta, no se restan.`) },
            { html: `(${r} + ${f})${V('m')} = ${t}`, msg: L(`The $${f} is charged once, not every mile.`, `Los $${f} se cobran una sola vez, no en cada milla.`) }];
    explain = L(`$${r} per mile times ${V('m')} miles, plus the $${f} starting fee: ${r}${V('m')} + ${f} = ${t}.`, `$${r} por milla por ${V('m')} millas, más la tarifa inicial de $${f}: ${r}${V('m')} + ${f} = ${t}.`);
  } else if (k === 2) {
    const n = pick([3, 4]), tip = ri(1, 3), each = ri(6, 12);
    html = L(`${n} friends split the cost of a pizza equally. Then each one adds a $${tip} tip. Each friend pays $${each} in all. Which equation finds ${V('p')}, the cost of the pizza?`,
             `${n} amigos se dividen el costo de una pizza en partes iguales. Luego cada uno agrega $${tip} de propina. Cada amigo paga $${each} en total. ¿Qué ecuación encuentra ${V('p')}, el costo de la pizza?`);
    opts = [{ html: `${fracX(n, 'p')} + ${tip} = ${each}`, ok: true },
            { html: `${n}${V('p')} + ${tip} = ${each}`, msg: L(`Splitting equally means dividing the pizza by ${n}, not multiplying.`, `Dividir en partes iguales significa dividir la pizza entre ${n}, no multiplicar.`) },
            { html: `${fracX(n, 'p')} ${MINUS} ${tip} = ${each}`, msg: L('Each friend adds a tip, so it’s added, not subtracted.', 'Cada amigo agrega una propina, así que se suma, no se resta.') },
            { html: `<span class="fr"><span class="fn">${V('p')} + ${tip}</span><span class="fd">${n}</span></span> = ${each}`, msg: L(`Each friend adds their own $${tip}. It isn’t split ${n} ways.`, `Cada amigo agrega sus propios $${tip}. No se dividen entre ${n}.`) }];
    explain = L(`Each friend’s share is ${V('p')} ÷ ${n}, then they add $${tip}: ${V('p')}/${n} + ${tip} = ${each}.`, `La parte de cada amigo es ${V('p')} ÷ ${n} y luego agregan $${tip}: ${V('p')}/${n} + ${tip} = ${each}.`);
  } else {
    const g = ri(3, 9), left = ri(15, 40);
    html = L(`Leo doubles his collection of trading cards, then gives away ${g} cards. Now he has ${left}. Which equation finds ${V('n')}, the number of cards he started with?`,
             `Leo duplica su colección de tarjetas y luego regala ${g} tarjetas. Ahora tiene ${left}. ¿Qué ecuación encuentra ${V('n')}, el número de tarjetas con el que empezó?`);
    opts = [{ html: `2${V('n')} ${MINUS} ${g} = ${left}`, ok: true },
            { html: `2${V('n')} + ${g} = ${left}`, msg: L('Giving cards away takes them away, so subtract.', 'Regalar tarjetas es quitarlas, así que resta.') },
            { html: `2(${V('n')} ${MINUS} ${g}) = ${left}`, msg: L('He doubles first, then gives cards away. The doubling happens before the subtracting.', 'Primero duplica y luego regala tarjetas. La duplicación pasa antes de la resta.') },
            { html: `${fracX(2, 'n')} ${MINUS} ${g} = ${left}`, msg: L('Doubling means multiplying by 2, not dividing.', 'Duplicar significa multiplicar por 2, no dividir.') }];
    explain = L(`Double the starting number (2${V('n')}), then subtract the ${g} he gave away: 2${V('n')} ${MINUS} ${g} = ${left}.`, `Duplica el número inicial (2${V('n')}) y luego resta las ${g} que regaló: 2${V('n')} ${MINUS} ${g} = ${left}.`);
  }
  return { kind: 'choice', long: true, html, options: shuffleOpts(opts), answerText: opts.find(o => o.ok).html, explain,
    hint: L('Find the part that repeats or changes (it goes with the variable) and the part that happens just once (the constant).', 'Busca la parte que se repite o cambia (va con la variable) y la parte que pasa solo una vez (la constante).') };
};
Q.ineqTwoStep = () => {
  const s = pick(['<', '>', '<=', '>=']), v = nz(-8, 8), neg = Math.random() < 0.5;
  const a = neg ? -pick([2, 3, 4, 5]) : pick([2, 3, 4, 5]), b = nz(-12, 12), c = a * v + b, u = undoL(b);
  const sol = neg ? flipSym(s) : s, iq = `${term(a)}${plusC(b)} ${SYM[s]} ${num(c)}`, nl = numberLineSVG(v, sol, { small: true });
  return { kind: 'ineq', html: L(`${solveL.en} ${iq}`, `${solveL.es} ${iq}`), answer: { sym: sol, val: v }, answerText: ineqText(sol, v),
    explain: L(`Step 1: ${u.en}: ${term(a)} ${symText(s)} ${num(c - b)}. Step 2: divide by ${paren(a)}${neg ? ', and because it’s negative, flip the sign' : ''}: ${ineqText(sol, v)}.${nl}`,
               `Paso 1: ${u.es}: ${term(a)} ${symText(s)} ${num(c - b)}. Paso 2: divide entre ${paren(a)}${neg ? ' y, como es negativo, invierte el signo' : ''}: ${ineqText(sol, v)}.${nl}`),
    hint: L(`Undo the ${opText(b)} first, then divide by ${paren(a)}.${neg ? ' Watch out: dividing by a negative number flips the sign.' : ''}`, `Primero deshaz el ${opText(b)} y luego divide entre ${paren(a)}.${neg ? ' Cuidado: dividir entre un número negativo invierte el signo.' : ''}`),
    ineq: { flip: neg ? L(`You divided by ${num(a)}, a negative number, so flip the inequality sign.`, `Dividiste entre ${num(a)}, un número negativo, así que invierte el signo de desigualdad.`)
                      : L(`You only flip the sign when you divide by a negative. ${a} is positive.`, `Solo inviertes el signo cuando divides entre un negativo. ${a} es positivo.`),
            strict: L(`Keep ${s.length > 1 ? 'the “or equal to” part (≤ or ≥)' : 'it strict (< or >)'}, just like the problem.`, `Conserva ${s.length > 1 ? 'la parte de “o igual” (≤ o ≥)' : 'la desigualdad estricta (< o >)'}, igual que en el problema.`),
            value: L(`Check your steps: ${u.en}, then divide by ${paren(a)}.`, `Revisa tus pasos: ${u.es} y luego divide entre ${paren(a)}.`) } };
};
Q.eqWord = () => {
  const k = ri(0, 3);
  if (k === 0) {
    const f = pick([20, 25, 30, 40]), m = pick([10, 12, 15, 20]), n = ri(2, 10), t = f + m * n;
    return { long: true, answer: n, answerText: num(n),
      html: L(`A gym charges a $${f} sign-up fee plus $${m} per month. Maria paid $${t} in all. How many months did she pay for?`, `Un gimnasio cobra una cuota de inscripción de $${f} más $${m} por mes. María pagó $${t} en total. ¿Por cuántos meses pagó?`),
      explain: L(`${m}${V('m')} + ${f} = ${t}. Subtract ${f}: ${m}${V('m')} = ${t - f}. Divide by ${m}: ${V('m')} = ${n} months.`, `${m}${V('m')} + ${f} = ${t}. Resta ${f}: ${m}${V('m')} = ${t - f}. Divide entre ${m}: ${V('m')} = ${n} meses.`),
      hint: L(`Write it as ${m}${V('m')} + ${f} = ${t}. Undo the sign-up fee first.`, `Escríbelo como ${m}${V('m')} + ${f} = ${t}. Primero deshaz la cuota de inscripción.`),
      mistakes: [mk(round2(t / m - f), L('Take away the one-time sign-up fee first, then divide by the monthly cost.', 'Primero quita la cuota de inscripción (que se paga una vez) y luego divide entre el costo mensual.')),
                 mk(round2((t + f) / m), L(`The $${f} fee is part of what she paid, so subtract it.`, `La cuota de $${f} es parte de lo que pagó, así que réstala.`)),
                 mk(round2(t / m), L(`Don’t forget the $${f} sign-up fee. Subtract it before dividing.`, `No olvides la cuota de inscripción de $${f}. Réstala antes de dividir.`))] };
  }
  if (k === 1) {
    const n = pick([3, 4, 5]), off = pick([5, 8, 10, 12]), each = ri(9, 25), t = n * each - off;
    return { long: true, answer: each, answerText: money(each),
      html: L(`Mario buys ${n} shirts that cost the same amount and uses a $${off} coupon. He pays $${t}. How much does one shirt cost, in dollars?`, `Mario compra ${n} camisas del mismo precio y usa un cupón de $${off}. Paga $${t}. ¿Cuánto cuesta una camisa, en dólares?`),
      explain: L(`${n}${V('s')} ${MINUS} ${off} = ${t}. Add ${off}: ${n}${V('s')} = ${t + off}. Divide by ${n}: ${V('s')} = $${each}.`, `${n}${V('s')} ${MINUS} ${off} = ${t}. Suma ${off}: ${n}${V('s')} = ${t + off}. Divide entre ${n}: ${V('s')} = $${each}.`),
      hint: L(`Write it as ${n}${V('s')} ${MINUS} ${off} = ${t}. The coupon was subtracted, so add it back first.`, `Escríbelo como ${n}${V('s')} ${MINUS} ${off} = ${t}. El cupón se restó, así que primero súmalo de nuevo.`),
      mistakes: [mk(round2((t - off) / n), L(`The coupon lowered the price, so add the $${off} back before dividing.`, `El cupón bajó el precio, así que vuelve a sumar los $${off} antes de dividir.`)),
                 mk(round2(t / n), L(`Don’t forget the $${off} coupon. Add it back first.`, `No olvides el cupón de $${off}. Primero súmalo de nuevo.`))] };
  }
  if (k === 2) {
    const start = ri(40, 90), per = pick([3, 4, 5, 6]), d = ri(3, 9), left = start - per * d;
    return { long: true, answer: d, answerText: num(d),
      html: L(`A phone battery is at ${start}%. It drops ${per}% every hour. After how many hours will it be at ${left}%?`, `La batería de un teléfono está al ${start}%. Baja ${per}% cada hora. ¿Después de cuántas horas estará al ${left}%?`),
      explain: L(`${start} ${MINUS} ${per}${V('h')} = ${left}. Subtract ${start}: ${MINUS}${per}${V('h')} = ${left - start}. Divide by ${MINUS}${per}: ${V('h')} = ${d} hours.`, `${start} ${MINUS} ${per}${V('h')} = ${left}. Resta ${start}: ${MINUS}${per}${V('h')} = ${left - start}. Divide entre ${MINUS}${per}: ${V('h')} = ${d} horas.`),
      hint: L(`Write it as ${start} ${MINUS} ${per}${V('h')} = ${left}. How much did it drop in all?`, `Escríbelo como ${start} ${MINUS} ${per}${V('h')} = ${left}. ¿Cuánto bajó en total?`),
      mistakes: [mk(round2((start + left) / per), L('Find how much the battery dropped: subtract the ending percent from the starting percent.', 'Halla cuánto bajó la batería: resta el porcentaje final del porcentaje inicial.')),
                 mk(start - left, L(`That’s how much it dropped in all. Divide by ${per}% per hour.`, `Eso es lo que bajó en total. Divide entre ${per}% por hora.`))] };
  }
  const n = pick([2, 3, 4]), each = ri(4, 12), extra = ri(3, 15), t = n * each + extra;
  return { long: true, answer: each, answerText: money(each),
    html: L(`Kim buys ${n} identical notebooks and a $${extra} backpack. She spends $${t}. How much does each notebook cost, in dollars?`, `Kim compra ${n} cuadernos iguales y una mochila de $${extra}. Gasta $${t}. ¿Cuánto cuesta cada cuaderno, en dólares?`),
    explain: L(`${n}${V('b')} + ${extra} = ${t}. Subtract ${extra}: ${n}${V('b')} = ${t - extra}. Divide by ${n}: ${V('b')} = $${each}.`, `${n}${V('b')} + ${extra} = ${t}. Resta ${extra}: ${n}${V('b')} = ${t - extra}. Divide entre ${n}: ${V('b')} = $${each}.`),
    hint: L(`Write it as ${n}${V('b')} + ${extra} = ${t}. Take away the backpack first.`, `Escríbelo como ${n}${V('b')} + ${extra} = ${t}. Primero quita la mochila.`),
    mistakes: [mk(round2((t + extra) / n), L(`Subtract the $${extra} backpack, don’t add it.`, `Resta la mochila de $${extra}, no la sumes.`)),
               mk(round2(t / n), L(`Take away the $${extra} backpack before dividing.`, `Quita la mochila de $${extra} antes de dividir.`)),
               mk(t - extra, L(`That’s what all ${n} notebooks cost together. Divide by ${n}.`, `Eso es lo que cuestan los ${n} cuadernos juntos. Divide entre ${n}.`))] };
};
Q.ineqWrite = () => {
  const k = ri(0, 2);
  let html, opts, explain;
  if (k === 0) {
    const budget = pick([40, 50, 60]), each = pick([8, 10, 12]), ship = ri(3, 7);
    html = L(`You can spend at most $${budget}. Shirts cost $${each} each, plus $${ship} shipping for the whole order. Which inequality shows ${V('s')}, the number of shirts you can buy?`,
             `Puedes gastar como máximo $${budget}. Las camisas cuestan $${each} cada una, más $${ship} de envío por todo el pedido. ¿Qué desigualdad muestra ${V('s')}, el número de camisas que puedes comprar?`);
    opts = [{ html: `${each}${V('s')} + ${ship} ≤ ${budget}`, ok: true },
            { html: `${each}${V('s')} + ${ship} ≥ ${budget}`, msg: L('“At most” means you can’t go over, so use ≤.', '“Como máximo” significa que no te puedes pasar, así que usa ≤.') },
            { html: `${each}${V('s')} + ${ship} &lt; ${budget}`, msg: L(`“At most $${budget}” includes spending exactly $${budget}, so use ≤, not <.`, `“Como máximo $${budget}” incluye gastar exactamente $${budget}, así que usa ≤, no <.`) },
            { html: `${ship}${V('s')} + ${each} ≤ ${budget}`, msg: L(`Each shirt costs $${each}, so $${each} goes with ${V('s')}. Shipping is charged once.`, `Cada camisa cuesta $${each}, así que los $${each} van con ${V('s')}. El envío se cobra una sola vez.`) }];
    explain = L(`Total cost is ${each}${V('s')} + ${ship}. “At most” means less than or equal to: ${each}${V('s')} + ${ship} ≤ ${budget}.`, `El costo total es ${each}${V('s')} + ${ship}. “Como máximo” significa menor o igual que: ${each}${V('s')} + ${ship} ≤ ${budget}.`);
  } else if (k === 1) {
    const goal = pick([100, 120, 150]), per = pick([5, 8, 10]); let have; do { have = ri(10, 40); } while (have === per);
    html = L(`Sam has $${have} and earns $${per} for each lawn he mows. He wants at least $${goal}. Which inequality shows ${V('L')}, the number of lawns he needs to mow?`,
             `Sam tiene $${have} y gana $${per} por cada jardín que poda. Quiere tener por lo menos $${goal}. ¿Qué desigualdad muestra ${V('L')}, el número de jardines que necesita podar?`);
    opts = [{ html: `${per}${V('L')} + ${have} ≥ ${goal}`, ok: true },
            { html: `${per}${V('L')} + ${have} ≤ ${goal}`, msg: L('“At least” means that amount or more, so use ≥.', '“Por lo menos” significa esa cantidad o más, así que usa ≥.') },
            { html: `${per}${V('L')} + ${have} &gt; ${goal}`, msg: L(`“At least $${goal}” includes exactly $${goal}, so use ≥, not >.`, `“Por lo menos $${goal}” incluye exactamente $${goal}, así que usa ≥, no >.`) },
            { html: `${have}${V('L')} + ${per} ≥ ${goal}`, msg: L(`He earns $${per} per lawn, so $${per} goes with ${V('L')}.`, `Gana $${per} por jardín, así que los $${per} van con ${V('L')}.`) }];
    explain = L(`Money earned (${per}${V('L')}) plus what he has (${have}) must be at least ${goal}: ${per}${V('L')} + ${have} ≥ ${goal}.`, `El dinero que gana (${per}${V('L')}) más lo que tiene (${have}) debe ser por lo menos ${goal}: ${per}${V('L')} + ${have} ≥ ${goal}.`);
  } else {
    const cap = pick([20, 24, 30]), per = pick([2, 3, 4]); let on; do { on = ri(2, 6); } while (on === per);
    html = L(`An elevator can carry fewer than ${cap} people. ${on} people are already on, and people get on in groups of ${per}. Which inequality shows ${V('g')}, the number of groups that can still get on?`,
             `Un elevador puede llevar menos de ${cap} personas. Ya hay ${on} personas adentro y la gente sube en grupos de ${per}. ¿Qué desigualdad muestra ${V('g')}, el número de grupos que todavía pueden subir?`);
    opts = [{ html: `${per}${V('g')} + ${on} &lt; ${cap}`, ok: true },
            { html: `${per}${V('g')} + ${on} ≤ ${cap}`, msg: L(`“Fewer than ${cap}” means ${cap} is not allowed, so use <.`, `“Menos de ${cap}” significa que ${cap} no está permitido, así que usa <.`) },
            { html: `${per}${V('g')} + ${on} &gt; ${cap}`, msg: L('“Fewer than” means less, so the symbol opens toward the smaller side: <.', '“Menos de” significa menor, así que el símbolo es <.') },
            { html: `${on}${V('g')} + ${per} &lt; ${cap}`, msg: L(`Each group has ${per} people, so ${per} goes with ${V('g')}.`, `Cada grupo tiene ${per} personas, así que el ${per} va con ${V('g')}.`) }];
    explain = L(`People on the elevator: ${per}${V('g')} + ${on}. “Fewer than” means less than: ${per}${V('g')} + ${on} < ${cap}.`, `Personas en el elevador: ${per}${V('g')} + ${on}. “Menos de” significa menor que: ${per}${V('g')} + ${on} < ${cap}.`);
  }
  return { kind: 'choice', long: true, html, options: shuffleOpts(opts), answerText: opts.find(o => o.ok).html, explain,
    hint: L('“At most” is ≤, “at least” is ≥, “fewer than” or “less than” is <, and “more than” is >. Then check which number goes with the variable.',
            '“Como máximo” es ≤, “por lo menos” es ≥, “menos de” es <, y “más de” es >. Luego revisa qué número va con la variable.') };
};
Q.ineqCheck = () => {
  const s = pick(['<', '>', '<=', '>=']), a = pick([2, 3, 4, 5]), v = nz(-6, 6), b = nz(-10, 10), c = a * v + b;
  const holds = t => ({ '<': a * t + b < c, '>': a * t + b > c, '<=': a * t + b <= c, '>=': a * t + b >= c })[s];
  const right = s.includes('>') ? v + ri(1, 3) : v - ri(1, 3);
  const pool = [v, v + (s.includes('>') ? -2 : 2), v + (s.includes('>') ? -4 : 4)];
  const good = holds(v) ? (Math.random() < 0.5 ? v : right) : right;
  const wrongs = [...new Set(pool.filter(t => !holds(t)))].slice(0, 3);
  while (wrongs.length < 3) { const t = s.includes('>') ? v - ri(3, 9) : v + ri(3, 9); if (!holds(t) && !wrongs.includes(t)) wrongs.push(t); }
  const op = opsFor(s), iq = `${term(a)}${plusC(b)} ${SYM[s]} ${num(c)}`;
  const opts = [{ html: num(good), ok: true }, ...wrongs.map(t => ({ html: num(t),
    msg: t === v ? L(`Substitute ${num(v)}: ${paren(a)}(${num(v)})${plusC(b)} = ${num(c)}. That makes both sides equal, but the inequality needs ${op.en} ${num(c)}${s.length > 1 ? '' : ', not equal'}.`,
                     `Sustituye ${num(v)}: ${paren(a)}(${num(v)})${plusC(b)} = ${num(c)}. Eso hace que los dos lados sean iguales, pero la desigualdad necesita que sea ${op.es} ${num(c)}${s.length > 1 ? '' : ', no igual'}.`)
      : L(`Substitute ${num(t)}: ${a}(${paren(t)})${plusC(b)} = ${num(a * t + b)}, which is not ${op.en} ${num(c)}.`, `Sustituye ${num(t)}: ${a}(${paren(t)})${plusC(b)} = ${num(a * t + b)}, que no es ${op.es} ${num(c)}.`) }))];
  return { kind: 'choice', html: L(`Which value of ${V()} makes ${iq} true?`, `¿Qué valor de ${V()} hace que ${iq} sea verdadera?`), options: shuffleOpts(opts), answerText: num(good),
    explain: L(`Substitute ${num(good)}: ${a}(${paren(good)})${plusC(b)} = ${num(a * good + b)}, which is ${op.en} ${num(c)}. True!`, `Sustituye ${num(good)}: ${a}(${paren(good)})${plusC(b)} = ${num(a * good + b)}, que es ${op.es} ${num(c)}. ¡Verdadera!`),
    hint: L(`Try each choice: put it in for ${V()}, work out the left side, and compare it to ${num(c)}.`, `Prueba cada opción: ponla en lugar de ${V()}, resuelve el lado izquierdo y compáralo con ${num(c)}.`) };
};

/* =========================================================================
   SKILL CATALOG. Each skill is one kind of problem, tagged with its TEKS.
   topic: which zone's math it belongs to. tier: 1 = warm-up, 2 = on level, 3 = challenge.
   label is English (also used on the teacher dashboard); es is the Spanish name students see.
   Use these ids in CONFIG.focusSkills to make the game practice them more.
   ========================================================================= */
const SKILLS = [
  { id: 'int-addsub', label: 'Adding and subtracting integers', es: 'Sumar y restar enteros', teks: '7.3A', topic: 'rational', tier: 1, gen: Q.intAddSub },
  { id: 'int-muldiv', label: 'Multiplying and dividing integers', es: 'Multiplicar y dividir enteros', teks: '7.3A', topic: 'rational', tier: 1, gen: Q.intMulDiv },
  { id: 'dec-ops', label: 'Operations with negative decimals', es: 'Operaciones con decimales negativos', teks: '7.3A', topic: 'rational', tier: 2, gen: Q.decimal },
  { id: 'frac-addsub', label: 'Adding and subtracting fractions', es: 'Sumar y restar fracciones', teks: '7.3A', topic: 'rational', tier: 2, gen: Q.fracAddSub },
  { id: 'order-ops', label: 'Order of operations with integers', es: 'Orden de las operaciones con enteros', teks: '7.3A', topic: 'rational', tier: 2, gen: Q.twoStep },
  { id: 'dec-div', label: 'Dividing decimals', es: 'Dividir decimales', teks: '7.3A', topic: 'rational', tier: 2, gen: Q.decimalDiv },
  { id: 'frac-muldiv', label: 'Multiplying and dividing fractions', es: 'Multiplicar y dividir fracciones', teks: '7.3A', topic: 'rational', tier: 3, gen: Q.fracMulDiv },
  { id: 'rational-word', label: 'Rational number word problems', es: 'Problemas verbales con números racionales', teks: '7.3B', topic: 'rational', tier: 3, gen: Q.word },
  { id: 'unit-rate', label: 'Unit rates', es: 'Tasas unitarias', teks: '7.4B', topic: 'proportion', tier: 1, gen: Q.unitRate },
  { id: 'equiv-ratio', label: 'Equivalent ratios', es: 'Razones equivalentes', teks: '7.4D', topic: 'proportion', tier: 1, gen: Q.equivRatio },
  { id: 'percent-benchmark', label: 'Benchmark percents (10%, 25%, 50%)', es: 'Porcentajes de referencia (10%, 25%, 50%)', teks: '7.4D', topic: 'proportion', tier: 1, gen: Q.easyPercent },
  { id: 'constant-k', label: 'Constant of proportionality', es: 'Constante de proporcionalidad', teks: '7.4C', topic: 'proportion', tier: 2, gen: Q.constantK },
  { id: 'percent-of', label: 'Percent of a number', es: 'Porcentaje de un número', teks: '7.4D', topic: 'proportion', tier: 2, gen: Q.percentOf },
  { id: 'sales-tax', label: 'Sales tax', es: 'Impuesto sobre las ventas', teks: '7.4D', topic: 'proportion', tier: 2, gen: Q.salesTax },
  { id: 'tip', label: 'Tips', es: 'Propinas', teks: '7.4D', topic: 'proportion', tier: 2, gen: Q.tip },
  { id: 'scale', label: 'Scale drawings', es: 'Dibujos a escala', teks: '7.5C', topic: 'proportion', tier: 2, gen: Q.scale },
  { id: 'convert', label: 'Converting units', es: 'Conversión de unidades', teks: '7.4E', topic: 'proportion', tier: 2, gen: Q.convert },
  { id: 'percent-change', label: 'Percent increase and decrease', es: 'Porcentaje de aumento y disminución', teks: '7.4D', topic: 'proportion', tier: 3, gen: Q.percentChange },
  { id: 'discount-tax', label: 'Discounts with tax', es: 'Descuentos con impuesto', teks: '7.4D', topic: 'proportion', tier: 3, gen: Q.discountTax },
  { id: 'markup', label: 'Markups', es: 'Aumentos de precio', teks: '7.4D', topic: 'proportion', tier: 3, gen: Q.markup },
  { id: 'frac-rate', label: 'Unit rates with fractions', es: 'Tasas unitarias con fracciones', teks: '7.4B', topic: 'proportion', tier: 3, gen: Q.fracRate },
  { id: 'find-whole', label: 'Finding the whole from a percent', es: 'Hallar el total a partir de un porcentaje', teks: '7.4D', topic: 'proportion', tier: 3, gen: Q.findWhole },
  { id: 'simple-interest', label: 'Simple interest', es: 'Interés simple', teks: '7.13E', topic: 'proportion', tier: 3, gen: Q.simpleInterest },
  { id: 'eq-one-step', label: 'One-step equations', es: 'Ecuaciones de un paso', teks: '7.11A', topic: 'equations', tier: 1, gen: Q.eqOneStep },
  { id: 'eq-check', label: 'Checking solutions to equations', es: 'Comprobar soluciones de ecuaciones', teks: '7.11B', topic: 'equations', tier: 1, gen: Q.eqCheck },
  { id: 'eq-two-step', label: 'Two-step equations', es: 'Ecuaciones de dos pasos', teks: '7.11A', topic: 'equations', tier: 2, gen: Q.eqTwoStep },
  { id: 'ineq-one-step', label: 'One-step inequalities', es: 'Desigualdades de un paso', teks: '7.11A', topic: 'equations', tier: 2, gen: Q.ineqOneStep },
  { id: 'ineq-graph', label: 'Inequalities on a number line', es: 'Desigualdades en la recta numérica', teks: '7.10B', topic: 'equations', tier: 2, gen: Q.ineqGraph },
  { id: 'eq-write', label: 'Writing equations from situations', es: 'Escribir ecuaciones a partir de situaciones', teks: '7.10A', topic: 'equations', tier: 2, gen: Q.eqWrite },
  { id: 'ineq-two-step', label: 'Two-step inequalities', es: 'Desigualdades de dos pasos', teks: '7.11A', topic: 'equations', tier: 3, gen: Q.ineqTwoStep },
  { id: 'eq-word', label: 'Equation word problems', es: 'Problemas verbales con ecuaciones', teks: '7.11A', topic: 'equations', tier: 3, gen: Q.eqWord },
  { id: 'ineq-write', label: 'Writing inequalities from situations', es: 'Escribir desigualdades a partir de situaciones', teks: '7.10A', topic: 'equations', tier: 3, gen: Q.ineqWrite },
  { id: 'ineq-check', label: 'Checking solutions to inequalities', es: 'Comprobar soluciones de desigualdades', teks: '7.11B', topic: 'equations', tier: 3, gen: Q.ineqCheck },
];
const SKILL = {}; SKILLS.forEach(s => (SKILL[s.id] = s));
const skillsFor = (topic, tier) => SKILLS.filter(s => s.topic === topic && (tier == null || s.tier === tier));
const skillName = sk => L(sk.label, sk.es);

/* =========================================================================
   QUESTION SELECTION. Within a topic and tier, the game leans toward:
   your focus skills (CONFIG.focusSkills), skills this student is weak on, and skills they haven't tried yet.
   Mastered skills still come up now and then for review.
   ========================================================================= */
let lastQ = '';
function pickSkill(topic, tier) {
  const pool = skillsFor(topic, tier);
  if (!pool.length) return skillsFor(topic)[0];
  const focus = CONFIG.focusSkills || [];
  const weights = pool.map(s => {
    const m = typeof skillMastery === 'function' ? skillMastery(s.id) : null;
    let w = m == null ? 2 : 1 + (1 - m) * 2;          // untried: 2, weak: up to 3, mastered: 1
    if (focus.includes(s.id)) w += 3;
    return w;
  });
  let x = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { x -= weights[i]; if (x <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
const SIGN_MSG = L('So close! The size of your answer is right, but the sign isn’t. Should the answer be positive or negative?',
                   '¡Casi! El valor absoluto de tu respuesta es correcto, pero el signo no. ¿La respuesta debe ser positiva o negativa?');
function makeQuestion(topic, tier, skillId = null) {
  let q, sk, tries = 0;
  do {
    sk = skillId && SKILL[skillId] ? SKILL[skillId] : pickSkill(topic, tier);
    q = sk.gen(); tries++;
  } while (tx(q.html) === lastQ && tries < 6);
  lastQ = tx(q.html);
  q.skill = sk.id; q.teks = sk.teks; q.skillLabel = skillName(sk); q.topic = sk.topic;
  q.hint = q.hint || L('Reread the problem and work it one step at a time.', 'Vuelve a leer el problema y resuélvelo paso por paso.');
  q.kind = q.kind || 'number';
  if (q.kind === 'number') {
    // drop "mistakes" that happen to equal the real answer, and add the generic sign check
    q.mistakes = (q.mistakes || []).filter(m => isFinite(m.v) && Math.abs(m.v - q.answer) > 0.006);
    if (Math.abs(q.answer) > 0.006 && !q.mistakes.some(m => Math.abs(m.v + q.answer) <= 0.006)) q.mistakes.push(mk(-q.answer, SIGN_MSG));
  } else q.mistakes = [];
  // answer text as a pair: fractions read "(or 1 1/4)" in English and "(o 1 1/4)" in Spanish
  if (typeof q.answerText === 'string') q.answerText = L(q.answerText, q.answerText.replace(' (or ', ' (o '));
  return q;
}
function findMistake(q, input) {
  const v = parseAnswer(input); if (isNaN(v)) return null;
  const m = q.mistakes.find(m => Math.abs(m.v - v) <= 0.006);
  return m ? m.msg : null;
}
/* One checker for every answer kind.
   input: a typed string (number), { sym, text } (ineq), or { opt } (choice).
   returns { valid, right, msg } where msg names the mistake when the game can tell. */
function checkAnswer(q, input) {
  if (q.kind === 'choice') {
    const o = q.options[input.opt]; if (!o) return { valid: false };
    return { valid: true, right: !!o.ok, msg: o.ok ? null : o.msg || null };
  }
  if (q.kind === 'ineq') {
    const v = parseAnswer(input.text || '');
    if (!input.sym || isNaN(v)) return { valid: false };
    const A = q.answer, valOk = Math.abs(v - A.val) <= 0.006, symOk = input.sym === A.sym;
    if (valOk && symOk) return { valid: true, right: true };
    let msg = null;
    if (valOk && (input.sym === flipSym(A.sym) || input.sym === strictSwap(flipSym(A.sym)))) msg = q.ineq.flip;
    else if (valOk && input.sym === strictSwap(A.sym)) msg = q.ineq.strict;
    else if (symOk && Math.abs(v + A.val) <= 0.006 && A.val !== 0) msg = L('The sign of your number is off. Should it be positive or negative?', 'El signo de tu número no es correcto. ¿Debe ser positivo o negativo?');
    else if (symOk) msg = q.ineq.value;
    return { valid: true, right: false, msg };
  }
  if (isNaN(parseAnswer(input))) return { valid: false };
  return { valid: true, right: isRight(q.answer, input), msg: isRight(q.answer, input) ? null : findMistake(q, input) };
}

/* ========================= answer checking ========================= */
function parseAnswer(rawIn) {
  let s = String(rawIn).toLowerCase()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[$,%°]/g, '')
    .replace(/[a-záéíóúñ]+/g, ' ')
    .replace(/-\s+/g, '-')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.startsWith('+')) s = s.slice(1);
  let m;
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return parseFloat(s);
  if ((m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/))) {
    const v = +m[2] + (+m[3] / +m[4]);
    return +m[4] === 0 ? NaN : (m[1] ? -v : v);
  }
  if ((m = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/))) {
    const d = parseFloat(m[2]);
    return d === 0 ? NaN : parseFloat(m[1]) / d;
  }
  return NaN;
}
const isRight = (ans, input) => { const v = parseAnswer(input); return !isNaN(v) && Math.abs(v - ans) <= 0.006; };
