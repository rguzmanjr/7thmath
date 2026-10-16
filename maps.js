/* Numlings: zone maps (tile layouts), signs, tile colors, trainers and Champions */
'use strict';
/* =========================================================================
   ZONE MAPS
   Legend: ~ water  . ground  , path / short grass  " tall grass (Numlings hide here)
           f flowers  P palm  T tree  R rock  = bridge (across)  H bridge (up and down)
           S sign  C chest  E exit  @ start
   The map's center is the origin (0, 0) of its coordinate plane.
   ========================================================================= */
const MAPS = {
"isles": [
"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
"~~P..\"\"\"\"~~~~~~~~~~~\"\"\"\"\"P..~~",
"~..\"\"\"\"\"\".N~~~~~~~~\"\"\"\"\"\"\"..~~",
"~..\"\"C\"\"\".=======..\"\"R\"\"\"..S~~",
"~P.\"\"\"\"\".~~~~~~~~~..\"\"\"\"\"...~~",
"~~..f..,,.~~~~~~~~~..\"\"\"\".NP~~",
"~~E.@..,,S~~~~~~~~~~..,,H..~~~",
"~~~..f.,,.~~~~~~~~~~~~~~H~~~~~",
"~~~~..H..~~~~~~~~~~~~~~~H~~~~~",
"~~~~~~H~~~~~~~~~~~~~~~N.H..~~~",
"~~~~~~H~~~~~~~~~~~~~~..\"\"\"\".~~",
"~~~~..H..~~~~~~~~~~~~.\"\"\"\"\"\".~",
"~~~.\"\"\"\"..=======...\"\"\"C\"\"\".~~",
"~~.\"\"\"\"\"\"..~~~~~H~~~.\"\"\"\"\"\"..~",
"~~..\"R\"\"\"..~~~~~H~~~~..\"\"\"\"P.~",
"~~~..\"\"\"\"S.~~~~~H~~~~~.,,,..~~",
"~~~~P.\"\"..~~~~..H.~~~~~~~~~~~~",
"~~~~~~~~~~~~~.K\"\"\"..~~~~~~~~~~",
"~~~~~~~~~~~~~.\"\"C\"\".~~~~~~~~~~",
"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
],
"rapids": [
"TTTTTTTTTTTT~~~~TTTTTTTTTTTTTTTT",
"TT..\"\"\"\"..TT~~~~T..\"\"\"\"\"\"..TTTTT",
"T..\"\"\"\"\"\"\".T~~~T..\"\"\"C\"\"\"\"..TTTT",
"T.\"\"\"C\"\"\"\".,~~~,..\"\"\"\"\"\"\"\"\".TTTT",
"T..\"\"\"\"\".N,,=====,,..\"\"\"\"R..STTT",
"TT..f..,,,,T~~~~T,,,f.N....,.TTT",
"TE.@...S,,.T~~~~T.,,,,ff...,..TT",
"TT..ff..,,TT~~~~TT..,,.....,.TTT",
"T..\"\"\"..,.TT~~~~TT.\"\"\"\".,,,,..TT",
"T.\"\"\"\"\"\".,.R~~~~R..\"\"\"\"\"\".,...TT",
"T.\"\"R\"\"\".,..~~~~,..\"\"\"\"\"\"\"..,.TT",
"T..\"\"\"\".,,,,====,,,,\"\"\"\"\"\"..,.TT",
"TT...f..,.TT~~~~TT..\"\"\"\"..T,.TTT",
"T.\"\"\"\"..N..T~~~~T..f...,.,,,..TT",
"T\"\"\"C\"\".,..T~~~~T....,,,,,\"\"\"\"TT",
"T\"\"\"\"\"\"..S.T~~~~T.,,,..\"\"\"\"\"\"\"TT",
"TT\"\"\"\"..,..T~~~~T.,,..\"\"\"\"R\"\"\"TT",
"TTT....,,,.~~~~~~.,,K..\"\"\"\"\"\"TTT",
"TTTTT..,,,.~~~~~~..,...\"\"C\"\"TTTT",
"TTTTTTTTTTT~~~~~~TTTTTTTTTTTTTTT"
]
};
const MAP_INFO = {
  isles: {
    signs: [
      'Subtracting a negative? Add the opposite instead: 5 − (−3) = 5 + 3 = 8.',
      'Welcome to Integer Isles! These islands sit on a coordinate plane, and the origin (0, 0) is where the two axes cross. Numlings hide in tall grass, and sparkles hide rare ones.',
      'Multiplying or dividing two negatives gives a positive. One negative gives a negative.',
    ],
  },
  rapids: {
    signs: [
      'Percent means “per hundred.” 35% is 35 out of 100, or 0.35.',
      'Welcome to Ratio Rapids! The river runs right down the y-axis. Can you find the origin? Numlings hide in tall grass, and sparkles hide rare ones.',
      'A unit rate is a rate for 1. If 4 tacos cost $10, one taco costs $10 ÷ 4 = $2.50.',
    ],
  },
};
const TILE_THEME = {
  isles: { water: '#46AEDD', foam: '#B9E6F8', ground: '#F1DDA6', speck: '#D9BF83', short: '#A9DA80', short2: '#86C462',
           tall: '#4DAE5B', blade: '#2C7F3E', tree: 'palm', rock: '#A3ABB6' },
  rapids: { water: '#2F86C8', foam: '#D8F0FF', ground: '#B6DD8C', speck: '#94C46A', short: '#DCC08A', short2: '#C3A46B',
            tall: '#3E9C4D', blade: '#1F6630', tree: 'pine', rock: '#97A0AA' },
};
const CAP_COLORS = ['#FFD43B', '#E5533A', '#2E86DE', '#7E57E8', '#22A06B'];

/* ---------- CPU trainers ----------
   Each N on a map is the next trainer in its zone's list (reading left to right, top to bottom); K is the Champion.
   team: [codex number, lowest level]. mult/add: every Numling on the trainer's team fights at
   about max(its listed level, student's best level × mult + add), capped at 50 (see scaledLevel).
   These were tuned in simulation so a student answering ~70% right usually wins and ~30% usually doesn't. */
const TRAINERS = {
  isles: [
    { id: 'i1', name: 'Beachcomber Rosa', short: 'Rosa', cap: '#E5533A', shirt: '#F28C38', mult: 1.4, add: 0, team: [[4, 3]],
      hi: 'I just found a perfect shell, so I’m in a great mood. Want a quick battle? I only brought one Numling.', again: 'Back for another round?', beat: 'Wow, your team is sharp!' },
    { id: 'i2', name: 'Diver Marco', short: 'Marco', cap: '#2E86DE', shirt: '#1F9E9A', mult: 1.3, add: 0, team: [[5, 5], [7, 5]],
      hi: 'I dive below sea level every day, so my Numlings love negative numbers. Ready?', again: 'Rematch? I’ve been practicing my integers.', beat: 'You took that from zero to hero.' },
    { id: 'i3', name: 'Sailor Kai', short: 'Kai', cap: '#FFFFFF', shirt: '#2B3A5C', mult: 1.25, add: 0, team: [[6, 5], [8, 6], [9, 6]],
      hi: 'Fair winds, trainer! Three Numlings against yours. Let’s go!', again: 'The tide’s back in. Battle again?', beat: 'You sailed right past me!' },
  ],
  rapids: [
    { id: 'r1', name: 'Hiker Luis', short: 'Luis', cap: '#22A06B', shirt: '#8C6A3E', mult: 1.45, add: 0, team: [[15, 9], [16, 9]],
      hi: 'I hike 3 miles every hour. That’s my unit rate! Battle me on the way?', again: 'Same trail, same rate. Rematch?', beat: 'You’re moving faster than my unit rate!' },
    { id: 'r2', name: 'Angler Mei', short: 'Mei', cap: '#7E57E8', shirt: '#2E86DE', mult: 1.4, add: 0, team: [[18, 10], [19, 10]],
      hi: 'The fish here bite at a constant rate, and so do my Numlings!', again: 'The fish are biting again. Battle?', beat: 'Hooked, line, and sinker. Nice work.' },
    { id: 'r3', name: 'Ranger Tomás', short: 'Tomás', cap: '#E5533A', shirt: '#4E7A3A', mult: 1.1, add: 0, team: [[17, 10], [20, 11], [21, 11]],
      hi: 'I keep these woods in perfect proportion. Show me what your team can do!', again: 'Ready for another patrol?', beat: 'That was 100% impressive.' },
  ],
};
const CHAMPIONS = {
  isles: { id: 'ic', name: 'Captain Vega', short: 'Vega', cap: '#FFD43B', shirt: '#B73232', mult: 1.15, add: 1, champion: true, team: [[10, 8], [12, 8], [13, 9]],
    hi: 'I’m the Champion of Integer Isles. Positive or negative, my team never backs down. Ready?', again: 'Back to defend your title? Let’s go!', beat: 'You’ve earned this badge, Champion.' },
  rapids: { id: 'rc', name: 'Coach Rivera', short: 'Rivera', cap: '#2B3A5C', shirt: '#22A06B', mult: 1.05, add: 1, champion: true, team: [[22, 13], [23, 13], [24, 14]],
    hi: 'Welcome to the end of the Rapids. My team’s ratios are perfect. Let’s see yours!', again: 'Want a rematch with the Champion?', beat: 'Now that’s proportional reasoning. The badge is yours!' },
};
const allTrainerIds = () => [...Object.values(TRAINERS).flat(), ...Object.values(CHAMPIONS)].map(t => t.id);

/* ---------- Origin Town ----------
   Town legend (on top of the zone legend): B building wall, D door, G gate to a zone, Q Quest Board,
   M world-map stand, o fountain (the fountain is the origin, (0, 0)). Townspeople are placed from NPCS. */
MAPS.town = ["TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "T..........BBBBBBBBB.........T", "T.BBBBBB.T.BBBBBBBBBT.BBBBBB.T", "T.BBBBBB...BBBBBBBBB..BBBBBB.T", "T.BBBBBB...BBBBDBBBB..BBBBBB.T", "T.BBBDBB.....S.,......BBDBBB.T", "TT...,...T.....,....T...,...TT", "T..ff,......,,,,,,,.....,ff..T", "T....,.....fQ,,,,,M.....,....T", "T,,,,,,,,,,,,,ooo,,,,,,,,,,,,T", "G,,,,,,,,,,,,,ooo,,,,,,,,,,,,G", "T.S..,......,,ooo,,.....,..S.T", "T....,.....f,,,,,,,f....,....T", "TT...,......,,,@,,,.....,...TT", "T..BBBBB..T....,...T..BBBBB..T", "T..BBBBBff...f.,.f..ffBBBBB..T", "T..BBDBB....T..,..T...BBDBB..T", "T....,,,,,,,,,,,,,,,,,,,,....T", "T.T......T.....,.....T.....T.T", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"];
MAP_INFO.town = { signs: [
  'North: the Dungeon of Multiplia. Only quick multipliers make it out with a crest.',
  'West gate: Integer Isles. Positive, negative, and everything in between.',
  'East gate: Ratio Rapids. Rates, ratios, and percents.',
] };
TILE_THEME.town = { water: '#5DB7E8', foam: '#D8F0FF', ground: '#A8D98A', speck: '#8CC46E', short: '#DCCFB4', short2: '#C4B596',
  tall: '#4DAE5B', blade: '#2C7F3E', tree: 'round', rock: '#A3ABB6' };
// Every map: its display name and kind. Zones get their names from ZONES; the town is a hub with buildings and gates.
const MAP_META = {
  town: { name: 'Origin Town', kind: 'town',
    buildings: [
      { id: 'lab', label: 'CODEX LAB', rect: [2, 2, 7, 5], door: [5, 5], wall: '#F3EAD7', roof: '#C0503A', action: 'codex', enter: 'You step into the Codex Lab.' },
      { id: 'dungeon', label: 'DUNGEON HALL', rect: [11, 1, 19, 4], door: [15, 4], wall: '#8E86A6', roof: '#3B3256', action: 'dungeon', enter: 'You head down into the Dungeon of Multiplia…' },
      { id: 'gym', label: 'TRAINING GYM', rect: [22, 2, 27, 5], door: [24, 5], wall: '#E8F1F8', roof: '#2168B8', action: 'train', enter: 'You step into the Training Gym.' },
      { id: 'home', label: 'HOME', rect: [3, 14, 7, 16], door: [5, 16], wall: '#FBE9D0', roof: '#22804A', action: 'save', enter: 'Home sweet home. Your trainer card is on the wall.' },
      { id: 'mapper', label: 'MAP HOUSE', rect: [22, 14, 26, 16], door: [24, 16], wall: '#F2E3F5', roof: '#7E57E8', action: 'worldmap', enter: 'The Map Maker unrolls a map of every zone.' },
    ],
    gates: { isles: { at: [0, 10], spawn: [1, 10] }, rapids: { at: [29, 10], spawn: [28, 10] } } },
};
const mapName = id => (ZONES[id] ? ZONES[id].name : MAP_META[id] ? MAP_META[id].name : id);

/* ---------- Balance Bluffs ---------- */
MAPS.bluffs = ["RTTTTTTTTTTTTTETTTTTTTTTTTTTTR", "RT\"\"\"\"\"\"\"\"\"...@...\"\"\"\"\"\"\"\"\"\"TR", "R.\"\"\"\"\"\"\"\"\"..S,...\"\"\"\"\"\"\"\"C\".R", "R.\"\"\"\"\"\"\"\"\"NT.,.T.\"\"\"\"\"\"\"\"\"\".R", "R.\"\"\"\",,,,,,,,,,,,,,,,,\"\"\"\"\".R", "RRRRRR,RRRRRRRRRRRRRRR,RRRRRRR", "R.\"\"\"\",,,,,,,,.....R..,,,,,,.R", "RT\"\"\"\"\"S\"\"\"\"\",..~~~~~~...T,..R", "R.\"\"\"\"\"\"\"\"\"\"\",T.~~~~~~..N.,.TR", "R.\"C\"\"\"\"\"\"\"\"\",..~~~~~~....,..R", "R.\"\"\"\"\"\"\"\"\"\"\",,.f......ff.,R.R", "RRR,RRRRRRRRRR,RRRRRRRRRRR,RRR", "R..,,,,,,,,,,,,,,,,,,,,,,,,..R", "RT.,.N..ffT....S\"\"\"\",\"\"\"C\".T.R", "R..,R.......f..\"\"\"\"\",\"\"\"\"\"...R", "R..,,,,,RRRRRRRRRRRR,RRRRRRRRR", "R.\"\"\"\"\"\"\"\"\"R\"f.f....,,.......R", "R.\"\"\"\"\"\"\"T\"\"\".T...T..,,,,,K,,R", "R.\"\"\"\"\"\"\"\"\"\"\"...............TR", "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR"];
MAP_INFO.bluffs = { signs: [
  'Welcome to Balance Bluffs! Every equation is a balance: whatever you do to one side, do to the other. Numlings hide in the tall grass.',
  'Multiplying or dividing both sides by a negative number? Flip the inequality sign!',
  'On a number line, an open circle means the number isn’t included (< or >). A filled circle means it is (≤ or ≥).',
] };
TILE_THEME.bluffs = { water: '#5AA8D6', foam: '#D8F0FF', ground: '#D8C7A3', speck: '#B9A57F', short: '#BDB3A0', short2: '#9E9482',
  tall: '#6FA35A', blade: '#3F6E33', tree: 'pine', rock: '#8E8A84' };
TRAINERS.bluffs = [
  { id: 'b1', name: 'Climber Ines', short: 'Ines', cap: '#E5533A', shirt: '#8C6A3E', mult: 1.4, add: 0, team: [[74, 10], [75, 10]],
    hi: 'Every climb is a balance between push and pull. Battle me?', again: 'Back for another climb?', beat: 'You’ve got great balance!' },
  { id: 'b2', name: 'Hiker Theo', short: 'Theo', cap: '#22A06B', shirt: '#2E86DE', mult: 1.3, add: 0, team: [[76, 11], [77, 11]],
    hi: 'I solve for x on every switchback. Let’s battle!', again: 'Another round on the trail?', beat: 'You solved that one fast.' },
  { id: 'b3', name: 'Ranger Pilar', short: 'Pilar', cap: '#7E57E8', shirt: '#4E7A3A', mult: 1.25, add: 0, team: [[78, 12], [79, 12], [80, 13]],
    hi: 'These cliffs are steep, but my team keeps its footing. Let’s see yours!', again: 'Ready to test your footing again?', beat: 'Steady as a mountain goat. Well done!' },
];
CHAMPIONS.bluffs = { id: 'bc', name: 'Summit Sage Mora', short: 'Mora', cap: '#F2B731', shirt: '#3B3256', mult: 1.15, add: 1, champion: true, team: [[81, 15], [82, 15], [83, 16]],
  hi: 'You’ve climbed all the way to the summit. Let’s see if your team is truly balanced.', again: 'The summit is always open for a rematch.', beat: 'Perfect balance. The Bluffs Badge is yours.' };
// the south gate in Origin Town leads to the Bluffs
MAPS.town[19] = MAPS.town[19].slice(0, 15) + 'G' + MAPS.town[19].slice(16);
MAP_META.town.gates.bluffs = { at: [15, 19], spawn: [15, 18] };

/* ---------- Spanish text for signs, trainers, Champions, and buildings ---------- */
MAP_INFO.isles.signsEs = [
  '¿Restar un negativo? Mejor suma el opuesto: 5 − (−3) = 5 + 3 = 8.',
  '¡Bienvenido a Integer Isles! Estas islas están sobre un plano de coordenadas, y el origen (0, 0) es donde se cruzan los dos ejes. Los Numlings se esconden en la hierba alta, y los destellos esconden a los raros.',
  'Multiplicar o dividir dos negativos da un positivo. Un solo negativo da un negativo.',
];
MAP_INFO.rapids.signsEs = [
  'Por ciento significa “por cada cien.” 35% es 35 de 100, o 0.35.',
  '¡Bienvenido a Ratio Rapids! El río corre justo por el eje y. ¿Puedes encontrar el origen? Los Numlings se esconden en la hierba alta, y los destellos esconden a los raros.',
  'Una tasa unitaria es una tasa por 1. Si 4 tacos cuestan $10, un taco cuesta $10 ÷ 4 = $2.50.',
];
MAP_INFO.town.signsEs = [
  'Norte: la Mazmorra de Multiplia. Solo quienes multiplican rápido salen con un escudo.',
  'Puerta del oeste: Integer Isles. Positivos, negativos y todo lo que hay en medio.',
  'Puerta del este: Ratio Rapids. Tasas, razones y porcentajes.',
];
MAP_INFO.bluffs.signsEs = [
  '¡Bienvenido a Balance Bluffs! Cada ecuación es una balanza: lo que hagas de un lado, hazlo del otro. Los Numlings se esconden en la hierba alta.',
  '¿Multiplicas o divides los dos lados entre un número negativo? ¡Invierte el signo de desigualdad!',
  'En una recta numérica, un círculo abierto significa que el número no está incluido (< o >). Un círculo relleno significa que sí (≤ o ≥).',
];
// [name, hi, again, beat] in Spanish, by trainer id
const TRAINER_ES = {
  i1: ['Recolectora Rosa', 'Acabo de encontrar una concha perfecta, así que estoy de buen humor. ¿Un combate rápido? Solo traje un Numling.', '¿Vienes por otra ronda?', '¡Guau, tu equipo es muy listo!'],
  i2: ['Buzo Marco', 'Buceo bajo el nivel del mar todos los días, así que a mis Numlings les encantan los números negativos. ¿Listo?', '¿Revancha? He estado practicando mis enteros.', 'Pasaste de cero a héroe.'],
  i3: ['Marinero Kai', '¡Buen viento, entrenador! Tres Numlings contra los tuyos. ¡Vamos!', 'La marea volvió. ¿Combatimos otra vez?', '¡Me pasaste navegando!'],
  r1: ['Excursionista Luis', 'Camino 3 millas cada hora. ¡Esa es mi tasa unitaria! ¿Combatimos en el camino?', 'Mismo sendero, misma tasa. ¿Revancha?', '¡Vas más rápido que mi tasa unitaria!'],
  r2: ['Pescadora Mei', 'Aquí los peces pican a una tasa constante, ¡y mis Numlings también!', 'Los peces están picando otra vez. ¿Combatimos?', 'Caí redondito. Buen trabajo.'],
  r3: ['Guardabosques Tomás', 'Mantengo este bosque en perfecta proporción. ¡Muéstrame lo que puede hacer tu equipo!', '¿Listo para otra patrulla?', 'Eso fue 100% impresionante.'],
  ic: ['Capitana Vega', 'Soy la Campeona de Integer Isles. Positivo o negativo, mi equipo nunca se rinde. ¿Listo?', '¿Vienes a defender tu título? ¡Vamos!', 'Te ganaste esta insignia, Campeón.'],
  rc: ['Entrenador Rivera', 'Bienvenido al final de los Rápidos. Las razones de mi equipo son perfectas. ¡Veamos las tuyas!', '¿Quieres la revancha con el Campeón?', '¡Eso sí es razonamiento proporcional! La insignia es tuya.'],
  b1: ['Escaladora Inés', 'Cada subida es un equilibrio entre empujar y jalar. ¿Combatimos?', '¿Vienes por otra subida?', '¡Tienes muy buen equilibrio!'],
  b2: ['Excursionista Theo', 'Resuelvo para x en cada curva del sendero. ¡A combatir!', '¿Otra ronda en el sendero?', 'Lo resolviste rapidísimo.'],
  b3: ['Guardabosques Pilar', 'Estos riscos son empinados, pero mi equipo no pierde el paso. ¡Veamos el tuyo!', '¿Listo para probar tu equilibrio otra vez?', 'Firme como una cabra de montaña. ¡Bien hecho!'],
  bc: ['Sabia Mora', 'Subiste hasta la cima. Veamos si tu equipo está realmente en equilibrio.', 'La cima siempre está abierta para una revancha.', 'Equilibrio perfecto. La insignia de los Riscos es tuya.'],
};
for (const tr of [...Object.values(TRAINERS).flat(), ...Object.values(CHAMPIONS)]) {
  const es = TRAINER_ES[tr.id]; if (!es) continue;
  [tr.nameEs, tr.hiEs, tr.againEs, tr.beatEs] = es;
}
// trainer and Champion text as pairs, for dialogue
const trL = (tr, k) => L(tr[k], tr[k + 'Es'] || tr[k]);
Object.assign(MAP_META.town.buildings.find(b => b.id === 'lab'), { labelEs: 'CÓDEX', enterEs: 'Entras al Laboratorio del Códex.' });
Object.assign(MAP_META.town.buildings.find(b => b.id === 'dungeon'), { labelEs: 'MAZMORRA', enterEs: 'Bajas a la Mazmorra de Multiplia…' });
Object.assign(MAP_META.town.buildings.find(b => b.id === 'gym'), { labelEs: 'GIMNASIO', enterEs: 'Entras al Gimnasio de Entrenamiento.' });
Object.assign(MAP_META.town.buildings.find(b => b.id === 'home'), { labelEs: 'CASA', enterEs: 'Hogar, dulce hogar. Tu tarjeta de entrenador está en la pared.' });
Object.assign(MAP_META.town.buildings.find(b => b.id === 'mapper'), { labelEs: 'MAPAS', enterEs: 'El cartógrafo extiende un mapa de todas las zonas.' });
