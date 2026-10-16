/* Numlings: types, rarity tiers, and zones (zone names, levels, TEKS) */
'use strict';
/* ========================= types, rarity, zones ========================= */
// Each type is strong against the next one in this loop: Blaze → Grove → Volt → Tide → Blaze
const TYPES = ['blaze', 'grove', 'volt', 'tide'];
const TYPE_LABEL = { blaze: 'Blaze', grove: 'Grove', volt: 'Volt', tide: 'Tide', none: 'Normal' };
function typeMult(atk, def) {
  if (atk === 'none') return 1;
  const i = TYPES.indexOf(atk), j = TYPES.indexOf(def);
  if ((i + 1) % 4 === j) return 1.5;
  if ((j + 1) % 4 === i) return 0.67;
  return 1;
}
const typeChip = t => `<span class="chip" style="--c:var(--${t})">${TYPE_LABEL[t]}</span>`;

const RARITY = {
  1: { label: 'Common', tiers: [1], weight: 50, xp: 0 },
  2: { label: 'Uncommon', tiers: [1, 2], weight: 30, xp: 4 },
  3: { label: 'Rare', tiers: [2, 2], weight: 13, xp: 8 },
  4: { label: 'Epic', tiers: [2, 3, 3], weight: 5, xp: 14 },
  5: { label: 'Legendary', tiers: [3, 3, 3], weight: 2, xp: 22 },
};
const stars = r => `<span class="stars" aria-hidden="true">${'★'.repeat(r)}</span>`;
const RARITY_ES = { 1: 'Común', 2: 'Poco común', 3: 'Raro', 4: 'Épico', 5: 'Legendario' };
const rarityTag = r => `<span class="chips">${stars(r)}<span class="small">${typeof LANG !== 'undefined' && LANG === 'es' ? RARITY_ES[r] : RARITY[r].label}</span></span>`;

const ZONES = {
  isles: { name: 'Integer Isles', topic: 'rational', color: 'var(--tide)', levels: [2, 6],
           teks: '7.3A, 7.3B', skill: 'Adding, subtracting, multiplying, and dividing positive and negative numbers, decimals, and fractions.' },
  rapids: { name: 'Ratio Rapids', topic: 'proportion', color: 'var(--grove)', levels: [6, 11],
            teks: '7.4A–E, 7.5C, 7.13E', skill: 'Unit rates, proportions, percents, sales tax, tips, and interest.' },
};
ZONES.bluffs = { name: 'Balance Bluffs', topic: 'equations', color: '#A0784A', levels: [10, 16],
  teks: '7.10A–B, 7.11A–B', skill: 'One- and two-step equations and inequalities: solving, graphing, writing, and checking solutions.' };
const TOPIC_LABEL = { rational: 'Integer Isles skills', proportion: 'Ratio Rapids skills', equations: 'Balance Bluffs skills' };
