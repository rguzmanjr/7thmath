/* Numlings: townspeople, quests, quest objects, daily Board Jobs, titles, and unlockable caps */
'use strict';
/* =========================================================================
   HOW QUESTS WORK
   A quest is a list of steps done in order. When every step is done, the student returns to the giver.
   Step types (add any of these to a new quest):
     { type: 'talk', npc: 'axis' }                          talk to someone
     { type: 'visit', map: 'isles' }                        go to a map
     { type: 'board' }                                      read the Quest Board
     { type: 'catch', count, zone?, element?, n? }          catch Numlings (zone: 'isles' | 'rapids' | 'dungeon'; element: 'blaze' etc.)
     { type: 'species', count }                             have this many different Numlings in the codex
     { type: 'battle', count, zone?, trainer?, champion? }  win battles (trainer: an id like 'i1'; champion: true)
     { type: 'solve', count, topic?, skill?, firstTry? }    answer problems right (topic: 'rational' | 'proportion')
     { type: 'chest', count, zone? }  { type: 'cache', count, zone? }
     { type: 'objects', set: 'beacons' }                    use every quest object in a set (see QUEST_OBJECTS)
     { type: 'dungeon', diff: 'easy' | 'hard' | 'chaos' }   clear the dungeon at this difficulty or harder
     { type: 'evolve', count }                              pass evolution trials
     { type: 'master', count }                              have this many skills at Mastered
     { type: 'level', lv }                                  have a Numling at this level
   Each step has text, which is what the student sees in the quest log.
   requires: quest ids that must be finished first. rewards: { xp, title, cap, gift: { n, lv } }.
   ========================================================================= */
const NPCS = {
  axis: { name: 'Professor Axis', nameEs: 'Profesor Axis', map: 'town', x: 7, y: 8, cap: '#F3F4F6', shirt: '#E9EEF5',
    idle: 'This whole town sits on a coordinate plane. The fountain is the origin, (0, 0). Clever, right?',
    idleEs: 'Todo este pueblo está sobre un plano de coordenadas. La fuente es el origen, (0, 0). Ingenioso, ¿verdad?' },
  lina: { name: 'Keeper Lina', nameEs: 'Guardiana Lina', map: 'town', x: 3, y: 8, cap: '#2E86DE', shirt: '#1F9E9A',
    idle: 'The west gate leads to Integer Isles. Bring a jacket. The temperature there can go negative.',
    idleEs: 'La puerta del oeste lleva a Integer Isles. Trae una chamarra. Allá la temperatura puede ser negativa.' },
  omar: { name: 'Builder Omar', nameEs: 'Constructor Omar', map: 'town', x: 26, y: 8, cap: '#F2B731', shirt: '#E5533A',
    idle: 'Measure twice, cut once. That’s proportional reasoning, kid.',
    idleEs: 'Mide dos veces y corta una. Eso es razonamiento proporcional.' },
  rho: { name: 'Gatekeeper Rho', nameEs: 'Portero Rho', map: 'town', x: 17, y: 5, cap: '#26293F', shirt: '#4A4163',
    idle: 'The Dungeon of Multiplia is through that door. The Multitaur only respects quick multipliers.',
    idleEs: 'La Mazmorra de Multiplia está detrás de esa puerta. El Multitauro solo respeta a quienes multiplican rápido.' },
  median: { name: 'Tutor Median', nameEs: 'Tutor Median', map: 'town', x: 21, y: 8, cap: '#7E57E8', shirt: '#22A06B',
    idle: 'Mastery isn’t about being fast. It’s about being right again and again.',
    idleEs: 'Dominar algo no es ser rápido. Es acertar una y otra vez.' },
  sol: { name: 'Guide Sol', nameEs: 'Guía Sol', map: 'town', x: 13, y: 18, cap: '#FB923C', shirt: '#8C6A3E',
    idle: 'The south gate leads up to Balance Bluffs. Up there, every step is an equation.',
    idleEs: 'La puerta del sur sube a Balance Bluffs. Allá arriba, cada paso es una ecuación.' },
  pi: { name: 'Little Pi', nameEs: 'La pequeña Pi', map: 'town', x: 10, y: 12, cap: '#F472B6', shirt: '#FFD43B',
    idle: 'I can say 3.14159265… that’s all I know so far. Can you go further?',
    idleEs: 'Puedo decir 3.14159265… es todo lo que sé por ahora. ¿Tú puedes decir más?' },
};
// Quest objects appear on a map while their quest is active. Using one asks a math problem.
const QUEST_OBJECTS = {
  beacons: { kind: 'beacon', label: 'beacon', zone: 'isles', spots: [[2, 4], [26, 3], [18, 17]],
    prompt: 'This beacon’s crystal has gone dark. Solve the lock to relight it.', done: 'The beacon blazes back to life!',
    promptEs: 'El cristal de este faro se apagó. Resuelve el candado para encenderlo.', doneEs: '¡El faro vuelve a brillar!' },
  scales: { kind: 'scale', label: 'balance scale', zone: 'bluffs', spots: [[2, 3], [15, 18], [28, 3]],
    prompt: 'This stone balance scale is tipped. Solve the problem to balance it.', done: 'The scale settles perfectly level!',
    promptEs: 'Esta balanza de piedra está inclinada. Resuelve el problema para equilibrarla.', doneEs: '¡La balanza queda perfectamente nivelada!' },
  planks: { kind: 'plank', label: 'broken plank', zone: 'rapids', spots: [[19, 3], [17, 11], [18, 14]],
    prompt: 'A broken plank. Measure it right to fix it.', done: 'Fixed! The plank fits perfectly.',
    promptEs: 'Una tabla rota. Mídela bien para repararla.', doneEs: '¡Reparada! La tabla queda perfecta.' },
};
const QUESTS = [
  { id: 'welcome', title: 'Welcome to Origin', titleEs: 'Bienvenida a Origin', offerEs: '¡Bienvenido a Origin Town! Estudio a los Numlings y me vendría bien un ayudante. Primero, revisa el Tablero de misiones junto a la fuente y luego atrapa un Numling en Integer Isles. La puerta del oeste te lleva allá.', finishEs: '¡Eres un natural! Toma esta gorra. Todo entrenador necesita su estilo.', giver: 'axis',
    offer: 'Welcome to Origin Town, trainer! I study Numlings, and I could use a helper. First, check the Quest Board by the fountain, then catch a Numling in Integer Isles. The west gate takes you there.',
    steps: [{ type: 'board', text: 'Read the Quest Board by the fountain', textEs: 'Lee el Tablero de misiones junto a la fuente' },
            { type: 'catch', count: 1, zone: 'isles', text: 'Catch a Numling in Integer Isles', textEs: 'Atrapa un Numling en Integer Isles' }],
    finish: 'You’re a natural! Here, take this cap. Every trainer needs a look.',
    rewards: { xp: 40, cap: '#14B8A6', title: 'Rookie Trainer' } },
  { id: 'research', title: 'Field Research', titleEs: 'Investigación de campo', offerEs: 'Mi códex tiene más páginas en blanco de las que quisiera. ¿Puedes encontrar 4 tipos diferentes de Numlings y resolver 10 problemas en el camino? Las matemáticas mueven todo aquí.', finishEs: '¡Datos maravillosos! Te estás convirtiendo en un verdadero investigador.', giver: 'axis', requires: ['welcome'],
    offer: 'My codex has more blank pages than I’d like. Can you find 4 different kinds of Numlings and solve 10 problems along the way? Math powers everything here.',
    steps: [{ type: 'species', count: 4, text: 'Have 4 different Numlings in your codex', textEs: 'Ten 4 Numlings diferentes en tu códex' },
            { type: 'solve', count: 10, text: 'Solve 10 problems', textEs: 'Resuelve 10 problemas' }],
    finish: 'Wonderful data! You’re becoming a real researcher.',
    rewards: { xp: 80, title: 'Field Researcher' } },
  { id: 'beacons', title: 'The Dim Beacons', titleEs: 'Los faros apagados', offerEs: 'Los faros de Integer Isles se apagaron y los barcos no encuentran el camino. Cada uno tiene un candado que necesita matemáticas con enteros. ¿Puedes encender los tres?', finishEs: '¡Desde aquí veo los tres! Los marineros te lo van a agradecer mucho.', giver: 'lina', requires: ['welcome'],
    offer: 'The beacons on Integer Isles have gone dark, and ships can’t find their way. Each one has a lock that needs integer math. Can you relight all three?',
    steps: [{ type: 'objects', set: 'beacons', text: 'Relight the 3 beacons on Integer Isles', textEs: 'Enciende los 3 faros de Integer Isles' },
            { type: 'battle', count: 1, zone: 'isles', trainer: 'any', text: 'Beat a trainer on Integer Isles', textEs: 'Vence a un entrenador en Integer Isles' }],
    finish: 'I can see all three from here! The sailors will be so grateful.',
    rewards: { xp: 120, title: 'Beacon Keeper', cap: '#F472B6' } },
  { id: 'vega', title: 'Champion of the Isles', titleEs: 'Campeona de las Islas', offerEs: 'La Capitana Vega protege las Islas. Vence a todos los entrenadores de allá y aceptará tu desafío. Si ganas, el Legendario de las Islas podría empezar a aparecer.', finishEs: '¿Venciste a Vega? ¡Todo el pueblo habla de eso!', giver: 'lina', requires: ['beacons'],
    offer: 'Captain Vega guards the Isles. Beat every trainer there, and she’ll accept your challenge. Win, and the Isles’ Legendary may start to roam.',
    steps: [{ type: 'battle', count: 1, zone: 'isles', champion: true, text: 'Defeat Captain Vega, Champion of Integer Isles', textEs: 'Vence a la Capitana Vega, Campeona de Integer Isles' }],
    finish: 'You beat Vega? The whole town is talking about it!',
    rewards: { xp: 200, title: 'Isles Champion', cap: '#F2B731' } },
  { id: 'bridge', title: 'Bridge Over Ratio Rapids', titleEs: 'El puente de Ratio Rapids', offerEs: 'El sendero de Ratio Rapids tiene tres tablas rotas. Para reparar cada una se necesita la medida correcta. Después, demuestra que el sendero es seguro ganando 2 combates allá.', finishEs: 'Firme como una roca. ¡Tienes cerebro de constructor!', giver: 'omar', requires: ['welcome'],
    offer: 'The trail through Ratio Rapids has three broken planks. Fixing each one takes the right measurement. After that, prove the trail is safe by winning 2 battles out there.',
    steps: [{ type: 'objects', set: 'planks', text: 'Fix the 3 broken planks in Ratio Rapids', textEs: 'Repara las 3 tablas rotas de Ratio Rapids' },
            { type: 'battle', count: 2, zone: 'rapids', text: 'Win 2 battles in Ratio Rapids', textEs: 'Gana 2 combates en Ratio Rapids' }],
    finish: 'Solid as a rock. You’ve got a builder’s brain!',
    rewards: { xp: 150, title: 'Bridge Builder', cap: '#26293F' } },
  { id: 'rivera', title: 'Champion of the Rapids', titleEs: 'Campeón de los Rápidos', offerEs: 'El Entrenador Rivera manda en los Rápidos. Vence a todos los entrenadores de allá y luego reta al Entrenador.', finishEs: 'Rivera nunca había perdido un combate de razones. ¡Hasta ahora!', giver: 'omar', requires: ['bridge'],
    offer: 'Coach Rivera runs the Rapids. Beat every trainer there, then take on the Coach.',
    steps: [{ type: 'battle', count: 1, zone: 'rapids', champion: true, text: 'Defeat Coach Rivera, Champion of Ratio Rapids', textEs: 'Vence al Entrenador Rivera, Campeón de Ratio Rapids' }],
    finish: 'Rivera’s never lost a ratio battle before. Until now!',
    rewards: { xp: 220, title: 'Rapids Champion', cap: '#F3F4F6' } },
  { id: 'dungeon', title: 'Into Multiplia', titleEs: 'Hacia Multiplia', offerEs: '¿Crees que eres rápido? Supera la Mazmorra de Multiplia en cualquier dificultad y te llamaré Luchador de Datos.', finishEs: 'Nada mal. Nada mal. Ahora intenta el modo Caos…', giver: 'rho', requires: ['welcome'],
    offer: 'Think you’re quick? Clear the Dungeon of Multiplia on any difficulty and I’ll call you a Fact Fighter.',
    steps: [{ type: 'dungeon', diff: 'easy', text: 'Clear the Dungeon of Multiplia', textEs: 'Supera la Mazmorra de Multiplia' }],
    finish: 'Not bad. Not bad at all. Now try Chaos…',
    rewards: { xp: 100, title: 'Fact Fighter' } },
  { id: 'mastery', title: 'Mastery Matters', titleEs: 'El dominio importa', offerEs: 'Practica hasta que algo sea realmente tuyo. Lleva 3 destrezas al nivel Dominado. Puedes ver tus destrezas en el Gimnasio.', finishEs: '¡Tres destrezas dominadas! Ese es el tipo de progreso que dura.', giver: 'median', requires: ['welcome'],
    offer: 'Practice until something is truly yours. Get 3 skills to Mastered. You can see your skills in the Training Gym.',
    steps: [{ type: 'master', count: 3, text: 'Get 3 skills to Mastered (check Training)', textEs: 'Lleva 3 destrezas a Dominado (revisa Entrenar)' }],
    finish: 'Three skills mastered! That’s the kind of progress that lasts.',
    rewards: { xp: 150, title: 'Scholar', cap: '#84CC16' } },
  { id: 'scales', title: 'The Tipped Scales', titleEs: 'Las balanzas inclinadas', offerEs: 'Arriba en Balance Bluffs, tres balanzas de piedra se inclinaron. Cada una solo se equilibra cuando resuelves su ecuación. Luego atrapa 2 Numlings que viven allá arriba.', finishEs: '¡Las tres balanzas están niveladas! La montaña ya se siente más tranquila.', giver: 'sol', requires: ['welcome'],
    offer: 'Up on Balance Bluffs, three stone scales have tipped over. Each one only balances when you solve its equation. Then catch 2 Numlings that live up there.',
    steps: [{ type: 'objects', set: 'scales', text: 'Balance the 3 stone scales on Balance Bluffs', textEs: 'Equilibra las 3 balanzas de piedra de Balance Bluffs' },
            { type: 'catch', count: 2, zone: 'bluffs', text: 'Catch 2 Numlings on Balance Bluffs', textEs: 'Atrapa 2 Numlings en Balance Bluffs' }],
    finish: 'All three scales are level! The mountain feels calmer already.',
    rewards: { xp: 160, title: 'Equation Explorer', cap: '#0EA5E9' } },
  { id: 'mora', title: 'Champion of the Bluffs', titleEs: 'Campeona de los Riscos', offerEs: 'La Sabia Mora te espera en la cima de los Riscos. Vence a los tres entrenadores del sendero, luego sube y desafíala.', finishEs: '¿Llegaste a la cima y venciste a Mora? ¡Legendario!', giver: 'sol', requires: ['scales'],
    offer: 'Summit Sage Mora waits at the top of the Bluffs. Beat the three trainers on the trail, then climb up and challenge her.',
    steps: [{ type: 'battle', count: 1, zone: 'bluffs', champion: true, text: 'Defeat Summit Sage Mora, Champion of Balance Bluffs', textEs: 'Vence a la Sabia Mora, Campeona de Balance Bluffs' }],
    finish: 'You reached the summit and beat Mora? Legendary!',
    rewards: { xp: 240, title: 'Bluffs Champion', cap: '#FB923C' } },
  { id: 'sides', title: 'Both Sides Now', titleEs: 'Los dos lados', offerEs: 'Una desigualdad es como una ecuación con un giro. Resuelve 12 problemas de Balance Bluffs y luego 5 desigualdades de dos pasos. ¡Cuidado con los negativos!', finishEs: 'Mantuviste los dos lados en equilibrio, incluso al invertir signos. ¡Impresionante!', giver: 'median', requires: ['welcome'],
    offer: 'An inequality is like an equation with a twist. Solve 12 Balance Bluffs problems, then 5 two-step inequalities. Watch for negatives!',
    steps: [{ type: 'solve', count: 12, topic: 'equations', text: 'Solve 12 Balance Bluffs problems', textEs: 'Resuelve 12 problemas de Balance Bluffs' },
            { type: 'solve', count: 5, skill: 'ineq-two-step', text: 'Solve 5 two-step inequalities', textEs: 'Resuelve 5 desigualdades de dos pasos' }],
    finish: 'You kept both sides in balance, even with the sign flips. Impressive!',
    rewards: { xp: 140, title: 'Balance Master' } },
  { id: 'evolve', title: 'Growing Up', titleEs: 'Creciendo', offerEs: 'Los Numlings que entrenan mucho pueden evolucionar. Pasa una prueba de evolución con uno de los tuyos. ¡Quiero verlo!', finishEs: '¡Increíble! Voy a escribir sobre esto en mi próximo artículo.', giver: 'axis', requires: ['research'],
    offer: 'Numlings that train hard can evolve. Pass an evolution trial with one of yours. I want to see it happen!',
    steps: [{ type: 'evolve', count: 1, text: 'Pass an evolution trial', textEs: 'Pasa una prueba de evolución' }],
    finish: 'Incredible! I’ll write about this in my next paper.',
    rewards: { xp: 150, title: 'Evolution Expert' } },
];
// Daily Board Jobs: one new job each day at the Quest Board. Rewards grow with the team's level.
const DAILY_POOL = [
  { type: 'solve', count: 15, text: 'Solve 15 problems', textEs: 'Resuelve 15 problemas' },
  { type: 'solve', count: 10, firstTry: true, text: 'Solve 10 problems on the first try', textEs: 'Resuelve 10 problemas al primer intento' },
  { type: 'catch', count: 3, text: 'Catch 3 Numlings', textEs: 'Atrapa 3 Numlings' },
  { type: 'battle', count: 3, text: 'Win 3 battles', textEs: 'Gana 3 combates' },
  { type: 'chest', count: 2, text: 'Open 2 chests', textEs: 'Abre 2 cofres' },
  { type: 'cache', count: 1, text: 'Dig up a math cache', textEs: 'Desentierra un tesoro matemático' },
  { type: 'solve', count: 8, topic: 'rational', text: 'Solve 8 Integer Isles problems', textEs: 'Resuelve 8 problemas de Integer Isles' },
  { type: 'solve', count: 8, topic: 'proportion', text: 'Solve 8 Ratio Rapids problems', textEs: 'Resuelve 8 problemas de Ratio Rapids' },
  { type: 'solve', count: 8, topic: 'equations', text: 'Solve 8 Balance Bluffs problems', textEs: 'Resuelve 8 problemas de Balance Bluffs' },
];
// Extra caps a student can unlock (the first five come with every new game).
const CAP_UNLOCKS = ['#14B8A6', '#F472B6', '#F2B731', '#26293F', '#F3F4F6', '#84CC16', '#0EA5E9', '#FB923C'];
