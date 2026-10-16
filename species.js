/* Numlings: every Numling: base forms, evolutions, final forms, dungeon residents */
'use strict';
/* ========================= species ========================= */
// base = [hp, attack, defense, speed]. n = codex number (never change these once students have saves).
const SPECIES = [
  { n: 1, id: 'kindlit', name: 'Kindlit', type: 'blaze', r: 2, zone: 'starter', base: [50, 55, 45, 52], move: 'Ember Sum',
    look: { body: 'round', color: '#F07A3E', belly: '#FFD9B3', ears: 'flame', tail: 'flame', eyes: 'big', sym: '+' },
    note: 'Its tail flame burns brighter every time it adds something up.' },
  { n: 2, id: 'ripplet', name: 'Ripplet', type: 'tide', r: 2, zone: 'starter', base: [56, 48, 52, 46], move: 'Equal Splash',
    look: { body: 'pear', color: '#3E9BE8', belly: '#CFE9FF', ears: 'fin', tail: 'fin', eyes: 'big', sym: '=' },
    note: 'Keeps both sides of every puddle perfectly level.' },
  { n: 3, id: 'sprigg', name: 'Sprigg', type: 'grove', r: 2, zone: 'starter', base: [52, 50, 50, 50], move: 'Vine Multiply',
    look: { body: 'tall', color: '#4DB86A', belly: '#D9F6CB', ears: 'leaf', tail: 'leaf', eyes: 'dot', sym: '×' },
    note: 'Every leaf it grows doubles the size of the next one.' },

  { n: 4, id: 'pluskit', name: 'Pluskit', type: 'grove', r: 1, zone: 'isles', base: [44, 42, 40, 46], move: 'Leaf Add',
    look: { body: 'round', color: '#94CF52', belly: '#F0FFD9', ears: 'pointy', tail: 'leaf', eyes: 'dot', sym: '+' },
    note: 'A fox kit that collects positive numbers like acorns.' },
  { n: 5, id: 'minusnail', name: 'Minusnail', type: 'tide', r: 1, zone: 'isles', base: [50, 36, 52, 30], move: 'Shell Subtract',
    look: { body: 'long', color: '#6FA8DC', belly: '#DDEBF7', ears: 'antenna', tail: 'curl', eyes: 'sleepy', sym: MINUS },
    note: 'Slow and steady. It takes away one step at a time.' },
  { n: 6, id: 'dotfly', name: 'Dotfly', type: 'volt', r: 1, zone: 'isles', base: [38, 44, 36, 56], move: 'Dot Zap',
    look: { body: 'round', color: '#B79CFF', belly: '#EEE6FF', ears: 'antenna', wings: true, eyes: 'big', sym: '.' },
    note: 'Leaves a trail of decimal points everywhere it flies.' },
  { n: 7, id: 'signet', name: 'Signet', type: 'tide', r: 2, zone: 'isles', base: [48, 46, 46, 50], move: 'Sign Swap',
    look: { body: 'tall', color: '#EEF3FA', belly: '#D3E0F2', ears: 'crest', wings: true, eyes: 'dot', sym: '±' },
    note: 'Flips from positive to negative with a single wing beat.' },
  { n: 8, id: 'absolark', name: 'Absolark', type: 'volt', r: 2, zone: 'isles', base: [44, 54, 40, 56], move: 'Distance Dive',
    look: { body: 'round', color: '#9D7BEA', belly: '#F1EBFF', ears: 'crest', wings: true, tail: 'zigzag', eyes: 'angry', sym: '|x|' },
    note: 'Only cares how far you are from zero, never which direction.' },
  { n: 9, id: 'opposum', name: 'Opposum', type: 'grove', r: 2, zone: 'isles', base: [56, 44, 48, 40], move: 'Opposite Day',
    look: { body: 'pear', color: '#A9A2B8', belly: '#EDE9F2', ears: 'round', tail: 'curl', eyes: 'sleepy', sym: '⇄' },
    note: 'Plays dead at the opposite of zero. Which is still zero.' },
  { n: 10, id: 'decimole', name: 'Decimole', type: 'grove', r: 2, zone: 'isles', base: [54, 50, 52, 34], move: 'Point Dig',
    look: { body: 'square', color: '#8C6A52', belly: '#E8D3C2', ears: 'round', eyes: 'sleepy', sym: '.' },
    note: 'Digs tunnels exactly one tenth as wide as the last one.' },
  { n: 11, id: 'quotter', name: 'Quotter', type: 'tide', r: 3, zone: 'isles', base: [58, 60, 52, 58], move: 'Quotient Current',
    look: { body: 'long', color: '#9C7A5B', belly: '#F1DFC9', ears: 'round', tail: 'fin', eyes: 'big', sym: '÷' },
    note: 'Shares every catch evenly and always checks for a remainder.' },
  { n: 12, id: 'productoad', name: 'Productoad', type: 'grove', r: 3, zone: 'isles', base: [64, 58, 60, 44], move: 'Product Pounce',
    look: { body: 'pear', color: '#5E9E4F', belly: '#E3F2C5', eyes: 'big', pattern: 'spots', sym: '×' },
    note: 'Two negatives make it happy. It just knows.' },
  { n: 13, id: 'zeroquill', name: 'Zeroquill', type: 'blaze', r: 4, zone: 'isles', base: [64, 72, 58, 68], move: 'Zero Pair Blast',
    look: { body: 'round', color: '#D9483B', belly: '#FFE0D6', ears: 'spikes', tail: 'flame', eyes: 'angry', sym: '0' },
    note: 'Pairs every positive quill with a negative one.' },
  { n: 14, id: 'infinidrake', name: 'Infinidrake', type: 'blaze', r: 5, zone: 'isles', base: [80, 84, 72, 76], move: 'Endless Flare',
    look: { body: 'tall', color: '#3A2E6E', belly: '#FFC857', ears: 'horns', wings: true, tail: 'flame', eyes: 'angry', sym: '∞' },
    note: 'Nobody has ever counted to the end of its tail.' },

  { n: 15, id: 'ratling', name: 'Ratling', type: 'volt', r: 1, zone: 'rapids', base: [42, 46, 40, 54], move: 'Ratio Nibble',
    look: { body: 'round', color: '#B8B1A6', belly: '#F2EEE8', ears: 'round', tail: 'curl', eyes: 'dot', sym: ':' },
    note: 'Always eats seeds and berries in a 2 to 3 ratio.' },
  { n: 16, id: 'unipup', name: 'Unipup', type: 'blaze', r: 1, zone: 'rapids', base: [48, 46, 44, 48], move: 'Per-One Fetch',
    look: { body: 'pear', color: '#F2A65A', belly: '#FFE9CF', ears: 'long', tail: 'curl', eyes: 'big', sym: '1' },
    note: 'Fetches exactly one of everything, then asks what it cost.' },
  { n: 17, id: 'percentipede', name: 'Percentipede', type: 'grove', r: 1, zone: 'rapids', base: [46, 44, 46, 46], move: 'Hundred Step',
    look: { body: 'long', color: '#6DBE7B', belly: '#E0F7E4', ears: 'antenna', pattern: 'stripes', eyes: 'dot', sym: '%' },
    note: 'Has exactly 100 legs and counts them every morning to be sure.' },
  { n: 18, id: 'scalefin', name: 'Scalefin', type: 'tide', r: 1, zone: 'rapids', base: [46, 46, 42, 52], move: 'Scale Wave',
    look: { body: 'long', color: '#3FB7C9', belly: '#D5F4F8', ears: 'fin', tail: 'fin', eyes: 'big', sym: '⤢' },
    note: 'Grows and shrinks, but its shape never changes.' },
  { n: 19, id: 'taxtle', name: 'Taxtle', type: 'tide', r: 2, zone: 'rapids', base: [62, 44, 62, 30], move: 'Tax Shell',
    look: { body: 'square', color: '#4E9A7A', belly: '#DFF1E7', eyes: 'sleepy', pattern: 'spots', sym: '$' },
    note: 'Adds 8.25% to every snack it carries home.' },
  { n: 20, id: 'markupine', name: 'Markupine', type: 'grove', r: 2, zone: 'rapids', base: [50, 56, 50, 40], move: 'Markup Spike',
    look: { body: 'round', color: '#8E6C4E', belly: '#F3E2CF', ears: 'spikes', eyes: 'angry', sym: '↑' },
    note: 'Its quills grow by a percent every time someone buys something.' },
  { n: 21, id: 'constantern', name: 'Constantern', type: 'volt', r: 2, zone: 'rapids', base: [44, 50, 42, 60], move: 'Steady Glide',
    look: { body: 'tall', color: '#E3EAF2', belly: '#FFFFFF', ears: 'crest', wings: true, tail: 'zigzag', eyes: 'dot', sym: 'k' },
    note: 'Flies at the exact same speed. Every. Single. Time.' },
  { n: 22, id: 'slopelope', name: 'Slopelope', type: 'blaze', r: 3, zone: 'rapids', base: [60, 62, 52, 62], move: 'Rise Over Run',
    look: { body: 'tall', color: '#D98A4A', belly: '#FBE3CC', ears: 'horns', tail: 'curl', eyes: 'big', sym: '/' },
    note: 'Climbs 3 feet for every 4 feet it runs.' },
  { n: 23, id: 'intrestrel', name: 'Intrestrel', type: 'volt', r: 3, zone: 'rapids', base: [56, 64, 50, 64], move: 'Interest Strike',
    look: { body: 'round', color: '#7A5CD6', belly: '#ECE5FF', ears: 'crest', wings: true, tail: 'zigzag', eyes: 'angry', sym: 'I' },
    note: 'Saves its energy and gets a little stronger every year.' },
  { n: 24, id: 'equivalynx', name: 'Equivalynx', type: 'blaze', r: 4, zone: 'rapids', base: [66, 72, 60, 72], move: 'Equal Pounce',
    look: { body: 'pear', color: '#E8B24A', belly: '#FFF1CF', ears: 'pointy', tail: 'curl', pattern: 'spots', eyes: 'angry', sym: '≡' },
    note: 'Can spot the twin of any fraction from a mile away.' },
  { n: 25, id: 'ratiosaur', name: 'Ratiosaur', type: 'tide', r: 5, zone: 'rapids', base: [86, 80, 76, 70], move: 'Proportion Tide',
    look: { body: 'long', color: '#2E5FA8', belly: '#CFE0FA', ears: 'spikes', tail: 'fin', eyes: 'angry', sym: '∝' },
    note: 'Every part of it is in perfect proportion to every other part.' },
];
// Dungeon-exclusive: joins the team the first time a student clears the Dungeon of Multiplia on Chaos.
SPECIES.push({ n: 68, id: 'multitaur', name: 'Multitaur', type: 'blaze', r: 5, zone: 'dungeon', base: [84, 88, 76, 74], move: 'Times Table Stampede',
  look: { body: 'tall', huge: true, color: '#8A3B26', belly: '#EBCBA6', ears: 'horns', mane: '#3A2018', armor: '#B8C2D6', tail: 'zigzag', eyes: 'angry', sym: '×', gem: '#FFD43B', aura: '#FFC15A' },
  note: 'Guards the Dungeon of Multiplia. It only bows to trainers who know their facts by heart.' });

// Dungeon of Multiplia residents (they appear only after a clear). Factorgoyle is the rare one.
SPECIES.push(
  { n: 69, id: 'timesbat', name: 'Timesbat', type: 'volt', r: 2, zone: 'dungeon', base: [48, 54, 44, 60], move: 'Echo Multiply',
    look: { body: 'round', color: '#5B4A8C', belly: '#C9BDF0', ears: 'pointy', wings: true, wingColor: '#8C7BC4', eyes: 'big', sym: '×' },
    note: 'Hangs upside down in the dungeon and squeaks out times tables in the dark.' },
  { n: 70, id: 'arraystone', name: 'Arraystone', type: 'grove', r: 2, zone: 'dungeon', base: [64, 50, 62, 30], move: 'Array Slam',
    look: { body: 'square', color: '#8A8F9C', belly: '#C9CED8', ears: 'spikes', pattern: 'spots', eyes: 'sleepy', sym: '▦' },
    note: 'Built from stones stacked in perfect rows and columns. 3 rows of 4 is always 12.' },
  { n: 71, id: 'factorch', name: 'Factorch', type: 'blaze', r: 2, zone: 'dungeon', base: [46, 58, 42, 56], move: 'Fact Flare',
    look: { body: 'tall', color: '#8A5530', belly: '#EBCCA2', ears: 'flame', tail: 'flame', eyes: 'big', sym: '!' },
    note: 'Lights the dungeon halls. It burns brighter with every fact you know by heart.' },
  { n: 72, id: 'skipskink', name: 'Skipskink', type: 'tide', r: 2, zone: 'dungeon', base: [50, 50, 48, 58], move: 'Skip Count',
    look: { body: 'long', color: '#3FA7A0', belly: '#D2F2EE', ears: 'crest', tail: 'curl', pattern: 'stripes', eyes: 'big', sym: '+3' },
    note: 'Skips across the dungeon pools in jumps of 3: 3, 6, 9, 12…' },
  { n: 73, id: 'factorgoyle', name: 'Factorgoyle', type: 'tide', r: 3, zone: 'dungeon', base: [66, 68, 62, 64], move: 'Prime Factor Storm',
    look: { body: 'tall', big: true, color: '#6E7690', belly: '#B8C0D6', ears: 'horns', wings: 'big', wingColor: '#4A5068', tail: 'zigzag', eyes: 'angry', sym: '×', gem: '#8FD5F2' },
    note: 'A rare gargoyle that wakes only for strong trainers. It breaks every number into its factors.' },
);

// Balance Bluffs residents (equations and inequalities)
SPECIES.push(
  { n: 74, id: 'exolotl', name: 'Exolotl', type: 'tide', r: 1, zone: 'bluffs', base: [46, 44, 44, 50], move: 'Unknown Splash',
    look: { body: 'long', color: '#F4A3C4', belly: '#FFE4EF', ears: 'crest', tail: 'fin', eyes: 'big', sym: 'x' },
    note: 'Nobody knows its value until they solve for it. It likes it that way.' },
  { n: 75, id: 'balancub', name: 'Balancub', type: 'grove', r: 1, zone: 'bluffs', base: [52, 44, 50, 40], move: 'Even Swipe',
    look: { body: 'round', color: '#9C6B44', belly: '#E9CFAE', ears: 'round', eyes: 'big', sym: '=' },
    note: 'Always keeps both paws full of the same number of berries.' },
  { n: 76, id: 'isolizard', name: 'Isolizard', type: 'blaze', r: 1, zone: 'bluffs', base: [42, 50, 40, 54], move: 'Isolate Flame',
    look: { body: 'tall', color: '#E2683A', belly: '#FFD9B8', ears: 'crest', tail: 'curl', eyes: 'dot', sym: 'x' },
    note: 'Gets the variable all by itself on one side, then guards it.' },
  { n: 77, id: 'gatorling', name: 'Gatorling', type: 'tide', r: 2, zone: 'bluffs', base: [52, 54, 48, 42], move: 'Greater Chomp',
    look: { body: 'long', color: '#4F9A55', belly: '#DDEFB8', ears: 'spikes', tail: 'fin', eyes: 'angry', sym: '>' },
    note: 'Its mouth always opens toward the bigger number. Always.' },
  { n: 78, id: 'undosloth', name: 'Undosloth', type: 'grove', r: 2, zone: 'bluffs', base: [60, 42, 54, 28], move: 'Inverse Nap',
    look: { body: 'pear', color: '#8E9A7A', belly: '#E3E6D3', ears: 'round', pattern: 'stripes', eyes: 'sleepy', sym: '⇄' },
    note: 'Slowly undoes everything in reverse order. It never rushes a solution.' },
  { n: 79, id: 'solvowlet', name: 'Solvowlet', type: 'volt', r: 2, zone: 'bluffs', base: [44, 52, 42, 58], move: 'Hoot of Inquiry',
    look: { body: 'round', color: '#7D6BB8', belly: '#E6DEFF', ears: 'pointy', wings: true, eyes: 'big', sym: '?' },
    note: 'Asks “what number makes this true?” about everything it sees.' },
  { n: 80, id: 'balamb', name: 'Balamb', type: 'blaze', r: 2, zone: 'bluffs', base: [54, 46, 52, 40], move: 'Fleece Balance',
    look: { body: 'round', color: '#F2E6CC', belly: '#FFFFFF', ears: 'long', pattern: 'spots', eyes: 'dot', sym: '=' },
    note: 'Its wool weighs exactly the same on both sides.' },
  { n: 81, id: 'coefficat', name: 'Coefficat', type: 'volt', r: 3, zone: 'bluffs', base: [56, 66, 50, 64], move: 'Coefficient Claw',
    look: { body: 'tall', color: '#E8B04A', belly: '#FFF0CC', ears: 'pointy', tail: 'curl', pattern: 'stripes', eyes: 'angry', sym: '3x' },
    note: 'Always multiplies whatever is right next to it.' },
  { n: 82, id: 'equalibex', name: 'Equalibex', type: 'grove', r: 3, zone: 'bluffs', base: [64, 60, 62, 52], move: 'Cliff Balance',
    look: { body: 'tall', color: '#B9A58A', belly: '#EFE6D6', ears: 'horns', eyes: 'big', sym: '=' },
    note: 'Balances on the thinnest cliff ledges without ever tipping over.' },
  { n: 83, id: 'boundragon', name: 'Boundragon', type: 'blaze', r: 4, zone: 'bluffs', base: [66, 74, 60, 68], move: 'Boundary Blaze',
    look: { body: 'tall', big: true, color: '#C0392B', belly: '#FFD6A0', ears: 'horns', wings: true, tail: 'flame', eyes: 'angry', sym: '≥' },
    note: 'Guards the boundary point. It decides whether the circle is open or closed.' },
  { n: 84, id: 'equilibrion', name: 'Equilibrion', type: 'volt', r: 5, zone: 'bluffs', base: [82, 82, 76, 74], move: 'Perfect Equilibrium',
    look: { body: 'round', big: true, color: '#E3C35A', belly: '#FFF4CF', ears: 'round', mane: '#B5762C', tail: 'zigzag', eyes: 'angry', sym: '=', gem: '#8FD5F2' },
    note: 'The legendary keeper of the Bluffs. When it roars, every equation balances.' },
);

/* ---------- evolutions ----------
   [from, codex number, name, move, look, field note]. Evolved forms never appear in the wild.
   They keep the type, rarity and zone of the form they came from, with about 22% higher stats. */
const EVO_LEVEL = { starter: 16, 1: 16, 2: 20, 3: 26 };
const EVOLUTIONS = [
  [1, 26, 'Summiflare', 'Sigma Inferno', { body: 'round', big: true, color: '#E45A2A', belly: '#FFD0A0', ears: 'flame', tail: 'flame', wings: true, eyes: 'angry', sym: 'Σ', gem: '#FFD43B' }, 'Adds every flame it has ever made into one roaring blaze.'],
  [2, 27, 'Tidequation', 'Balance Surge', { body: 'pear', big: true, color: '#2C7FD0', belly: '#C4E3FF', ears: 'crest', tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: '=', gem: '#8FD5F2' }, 'Balances whole tides. Both sides always match.'],
  [3, 28, 'Arborithm', 'Algorithm Bloom', { body: 'tall', big: true, color: '#3A9E57', belly: '#D2F2C2', ears: 'leaf', tail: 'leaf', wings: true, pattern: 'spots', eyes: 'big', sym: '×', gem: '#9BE07A' }, 'Follows a step-by-step rule to grow one new branch every day.'],
  [4, 29, 'Foxitive', 'Positive Pounce', { body: 'tall', big: true, color: '#7DBE3E', belly: '#EEFFD4', ears: 'pointy', tail: 'leaf', eyes: 'angry', sym: '+', gem: '#FFD43B' }, 'Only moves in the positive direction. It never backs up.'],
  [5, 30, 'Deductoise', 'Deduction Slam', { body: 'square', big: true, color: '#4F86BF', belly: '#D6E6F6', ears: 'spikes', tail: 'curl', pattern: 'spots', eyes: 'sleepy', sym: MINUS, gem: '#8FD5F2' }, 'Its shell is a fortress built from everything it ever subtracted.'],
  [6, 31, 'Decimoth', 'Place Value Flash', { body: 'tall', big: true, color: '#9A7BF0', belly: '#EFE8FF', ears: 'antenna', wings: true, pattern: 'spots', eyes: 'big', sym: '.', gem: '#FFD43B' }, 'The dots on its wings line up in perfect place value.'],
  [7, 32, 'Cygnegative', 'Opposite Wing', { body: 'tall', big: true, color: '#3A3F5C', belly: '#8E93B3', ears: 'crest', wings: true, eyes: 'angry', sym: MINUS, gem: '#FF7A9C' }, 'A black swan that turns every number into its opposite.'],
  [8, 33, 'Magnitalon', 'Magnitude Dive', { body: 'tall', big: true, color: '#7C55D9', belly: '#E8DEFF', ears: 'crest', wings: true, tail: 'zigzag', eyes: 'angry', sym: '|x|', gem: '#FFD43B' }, 'Dives straight to the distance from zero and never misses.'],
  [9, 34, 'Inversum', 'Inverse Strike', { body: 'pear', big: true, color: '#8A82A0', belly: '#E4DFEC', ears: 'pointy', tail: 'curl', pattern: 'stripes', eyes: 'big', sym: MINUS + 'a', gem: '#9BE07A' }, 'Every number it touches meets its additive inverse. Poof: zero.'],
  [10, 35, 'Millimole', 'Thousandths Dig', { body: 'square', big: true, color: '#6E5240', belly: '#E2C9B5', ears: 'spikes', tail: 'curl', pattern: 'spots', eyes: 'angry', sym: '.01', gem: '#FFD43B' }, 'Digs tunnels all the way down to the thousandths place.'],
  [11, 36, 'Quotitan', 'Quotient Flood', { body: 'long', big: true, color: '#7E5E43', belly: '#EBD3B8', ears: 'round', tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: '÷', gem: '#8FD5F2' }, 'Splits a whole river into equal shares without spilling a drop.'],
  [12, 37, 'Exponentoad', 'Power Leap', { body: 'pear', big: true, color: '#3F8A3A', belly: '#D9F0B0', ears: 'horns', pattern: 'spots', eyes: 'angry', sym: 'x²', gem: '#FFD43B' }, 'Multiplies itself by itself whenever it gets excited.'],
  [15, 38, 'Ratiodent', 'Ratio Rush', { body: 'tall', big: true, color: '#9C9488', belly: '#EFE9E0', ears: 'round', tail: 'zigzag', eyes: 'angry', sym: '2:3', gem: '#FFD43B' }, 'Keeps every snack pile in a perfect 2 to 3 ratio. Or else.'],
  [16, 39, 'Unihound', 'Unit Chase', { body: 'tall', big: true, color: '#C9702A', belly: '#FFE3C4', ears: 'pointy', tail: 'flame', pattern: 'spots', eyes: 'angry', sym: '1', gem: '#FFD43B' }, 'Can track down the price of one of anything, anywhere.'],
  [17, 40, 'Permillipede', 'Per Mille March', { body: 'long', big: true, color: '#4FA85F', belly: '#D6F4DC', ears: 'horns', tail: 'zigzag', pattern: 'stripes', eyes: 'angry', sym: '‰', gem: '#FFD43B' }, 'Upgraded from 100 legs to 1,000. Still counts them every morning.'],
  [18, 41, 'Dilatuna', 'Dilation Wave', { body: 'long', big: true, color: '#2A9CB0', belly: '#C7EEF5', ears: 'fin', tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: '×2', gem: '#8FD5F2' }, 'Doubles its size in a blink, and every part grows the same.'],
  [19, 42, 'Tortax', 'Tax Fortress', { body: 'square', big: true, color: '#357A5E', belly: '#D2EBDD', ears: 'spikes', pattern: 'spots', eyes: 'angry', sym: '$', gem: '#FFD43B' }, 'Its shell holds every cent of sales tax it has ever collected.'],
  [20, 43, 'Profitspine', 'Profit Spike', { body: 'round', big: true, color: '#73553B', belly: '#EBD6C0', ears: 'spikes', tail: 'zigzag', eyes: 'angry', sym: '↑%', gem: '#FFD43B' }, 'Each quill is marked up 50% sharper than the last one.'],
  [21, 44, 'Albatrate', 'Constant Gale', { body: 'round', big: true, color: '#C9D8EA', belly: '#FFFFFF', ears: 'fin', wings: true, tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: 'k', gem: '#FFD43B' }, 'Glides across the whole ocean at one unchanging rate.'],
  [22, 45, 'Gradilope', 'Gradient Charge', { body: 'tall', big: true, color: '#C2703A', belly: '#F6D9BD', ears: 'horns', tail: 'flame', eyes: 'angry', sym: 'm', gem: '#FFD43B' }, 'Measures the steepness of every hill, then charges straight up it.'],
  [23, 46, 'Compoundor', 'Compound Strike', { body: 'tall', big: true, color: '#5E40B8', belly: '#E2D8FF', ears: 'crest', wings: true, tail: 'zigzag', pattern: 'spots', eyes: 'angry', sym: '%', gem: '#FFD43B' }, 'Earns interest on its interest and gets stronger every year.'],
  [74, 85, 'Solvolotl', 'Variable Wave', { body: 'long', big: true, color: '#E58BB4', belly: '#FFD9EA', ears: 'crest', tail: 'fin', pattern: 'spots', eyes: 'angry', sym: 'x', gem: '#8FD5F2' }, 'Its frilly gills twitch when an equation is close to solved.'],
  [75, 86, 'Balanbear', 'Scale Slam', { body: 'round', big: true, color: '#8A5A36', belly: '#E3C3A0', ears: 'round', eyes: 'angry', sym: '=', gem: '#9BE07A' }, 'Lifts the same weight with both arms every single morning.'],
  [76, 87, 'Isolizord', 'Isolation Burn', { body: 'tall', big: true, color: '#D4552A', belly: '#FFCFA8', ears: 'spikes', tail: 'curl', pattern: 'stripes', eyes: 'angry', sym: 'x', gem: '#FFD43B' }, 'Burns away every term until only the variable is left.'],
  [77, 88, 'Greatergator', 'Greater Bite', { body: 'long', big: true, color: '#3E8A47', belly: '#D2E9A8', ears: 'spikes', tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: '>', gem: '#FFD43B' }, 'Bigger jaws, bigger numbers. It always chooses the greater side.'],
  [78, 89, 'Reversloth', 'Reverse Order', { body: 'pear', big: true, color: '#7F8C6B', belly: '#DDE1CB', ears: 'round', pattern: 'stripes', eyes: 'sleepy', sym: '⇄', gem: '#9BE07A' }, 'Works backward through any problem, one inverse at a time.'],
  [79, 90, 'Solvowl', 'Solution Screech', { body: 'round', big: true, color: '#6A58A8', belly: '#DED4FA', ears: 'pointy', wings: true, eyes: 'big', sym: '?', gem: '#FFD43B' }, 'Can spot the value of x from across the whole valley.'],
  [80, 91, 'Libraram', 'Libra Charge', { body: 'round', big: true, color: '#EDE0C2', belly: '#FFFFFF', ears: 'horns', pattern: 'spots', eyes: 'angry', sym: '=', gem: '#F472B6' }, 'Its curled horns are shaped like the two pans of a balance.'],
  [81, 92, 'Coefficougar', 'Multiply Pounce', { body: 'tall', big: true, color: '#D99A3A', belly: '#FFE8BD', ears: 'pointy', tail: 'curl', pattern: 'stripes', eyes: 'angry', sym: '3x', gem: '#FFD43B' }, 'Pounces on any number standing next to a variable.'],
  [82, 93, 'Altibex', 'Altitude Leap', { body: 'tall', big: true, color: '#A58F70', belly: '#E8DCC8', ears: 'horns', tail: 'curl', eyes: 'angry', sym: '=', gem: '#8FD5F2' }, 'Climbs higher every time it keeps an equation balanced.'],
];
{
  const byN = {}; SPECIES.forEach(s => (byN[s.n] = s));
  for (const [from, n, name, move, look, note] of EVOLUTIONS) {
    const b = byN[from];
    b.evo = n; b.evoLv = EVO_LEVEL[b.zone === 'starter' ? 'starter' : b.r];
    SPECIES.push({ n, id: name.toLowerCase(), name, type: b.type, r: b.r, zone: b.zone, from, evolved: true,
      base: b.base.map(v => Math.round(v * 1.22)), move, look, note });
  }
}
/* ---------- final forms (third stage) ----------
   [from (a second-stage form), codex number, name, move, look, field note]. Final forms are the payoff for a
   whole evolution line: they fill the frame, glow, and add wings, manes, armor, crowns, horns or extra tails. */
const EVO_LEVEL_FINAL = { starter: 34, 1: 34, 2: 38, 3: 42 };
const AURA = { blaze: '#FFC15A', tide: '#86DCFF', grove: '#A8F28F', volt: '#D9C2FF' };
const FINALS = [
  [26, 47, 'Sigmagnus', 'Infinite Series', { body: 'round', huge: true, color: '#D9431F', belly: '#FFCB96', ears: 'flame', ears2: 'horns', wings: 'big', wingColor: '#FF9A2E', tail: 'flame', armor: '#E8B04A', eyes: 'angry', sym: 'Σ', gem: '#FFD43B' }, 'Adds up an endless series of flames. The total keeps growing forever.'],
  [27, 48, 'Abyssolve', 'Deep Equation', { body: 'long', huge: true, color: '#1E5FAE', belly: '#BFE0FF', ears: 'fin', ears2: 'crest', tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: '=', gem: '#8FD5F2' }, 'Sleeps at the bottom of the ocean until an equation needs balancing.'],
  [28, 49, 'Fractaloak', 'Fractal Canopy', { body: 'tall', huge: true, color: '#2E7D3E', belly: '#CDEFC0', ears: 'leaf', mane: '#58C26C', tail: 'leaf', armor: '#8A5D36', pattern: 'spots', eyes: 'big', sym: '×', gem: '#9BE07A' }, 'Every branch is a smaller copy of the whole tree, all the way down.'],
  [29, 50, 'Kitsumma', 'Ninefold Sum', { body: 'tall', huge: true, color: '#6FB52F', belly: '#F0FFD9', ears: 'pointy', mane: '#EEFFD4', tail: 'fan', eyes: 'angry', sym: '+', gem: '#FFD43B', crown: true }, 'Each of its tails holds a positive number. Together they add up to legend.'],
  [30, 51, 'Deficitadel', 'Fortress Subtract', { body: 'square', huge: true, color: '#3B6EA5', belly: '#D2E4F6', ears: 'spikes', tail: 'curl', armor: '#9FB0C8', pattern: 'spots', eyes: 'sleepy', sym: MINUS, gem: '#8FD5F2', crown: true }, 'A walking castle. Anything that attacks it gets subtracted.'],
  [31, 52, 'Decimonarch', 'Place Value Storm', { body: 'tall', huge: true, color: '#8C67EE', belly: '#F1EAFF', ears: 'antenna', wings: 'big', wingColor: '#FFB86B', pattern: 'spots', eyes: 'big', sym: '.', gem: '#FFD43B', crown: true }, 'Its wings show every place value from millions down to millionths.'],
  [32, 53, 'Negasus', 'Polarity Charge', { body: 'tall', huge: true, color: '#26293F', belly: '#8E93B3', ears: 'horn1', mane: '#B8BDE0', wings: 'big', wingColor: '#4A4F75', eyes: 'angry', sym: '±', gem: '#FF7A9C' }, 'One beat of its wings flips every number in the sky to its opposite.'],
  [33, 54, 'Vectoraptor', 'Vector Strike', { body: 'tall', huge: true, color: '#5B37C9', belly: '#E3D8FF', ears: 'crest', ears2: 'horns', wings: 'big', tail: 'zigzag', armor: '#C9B8F5', eyes: 'angry', sym: '|x|', gem: '#FFD43B' }, 'Knows exactly how far and exactly which way. It never misses twice.'],
  [34, 55, 'Zerossum', 'Zero Sum', { body: 'pear', huge: true, color: '#6C6585', belly: '#E2DDEC', ears: 'pointy', mane: '#D8D2E6', tail: 'fan', pattern: 'stripes', eyes: 'big', sym: '0', gem: '#9BE07A' }, 'Pairs every number with its opposite until the whole battlefield equals zero.'],
  [35, 56, 'Megamole', 'Scientific Notation', { body: 'square', huge: true, color: '#5A4130', belly: '#E0C5AE', ears: 'spikes', tail: 'curl', armor: '#C9A46A', pattern: 'spots', eyes: 'angry', sym: 'x²', gem: '#FFD43B' }, 'Digs to the millionths place, then writes it all in scientific notation.'],
  [36, 57, 'Divisorca', 'Long Division', { body: 'long', huge: true, color: '#22314F', belly: '#F2F6FA', ears: 'fin', ears2: 'spikes', tail: 'fin', pattern: 'spots', eyes: 'angry', sym: '÷', gem: '#8FD5F2' }, 'Divides the whole ocean into equal shares, with no remainder.'],
  [37, 58, 'Factorialisk', 'Factorial Fury', { body: 'pear', huge: true, color: '#2F6E2B', belly: '#D5EEAA', ears: 'horns', ears2: 'crest', mane: '#7FC25A', pattern: 'spots', eyes: 'angry', sym: 'x²', gem: '#FFD43B', crown: true }, 'Multiplies every number below its own. Its power grows ridiculously fast.'],
  [38, 59, 'Phiraxis', 'Golden Ratio', { body: 'tall', huge: true, color: '#C8A14A', belly: '#FFF2C9', ears: 'round', mane: '#FFE9A8', tail: 'zigzag', eyes: 'angry', sym: '2:3', gem: '#E5533A', crown: true }, 'Everything about it follows the golden ratio, from whiskers to tail.'],
  [39, 60, 'Rateweiler', 'Rate Rampage', { body: 'tall', huge: true, color: '#A8501E', belly: '#F2C48A', ears: 'pointy', mane: '#5A2A12', tail: 'flame', armor: '#C9CED8', eyes: 'angry', sym: '1', gem: '#FFD43B' }, 'Guards the price of one. No one overcharges while it’s around.'],
  [40, 61, 'Millionpede', 'Million March', { body: 'long', huge: true, color: '#2F8C47', belly: '#D2F1D9', ears: 'horns', ears2: 'antenna', tail: 'zigzag', pattern: 'stripes', armor: '#A7D8B4', eyes: 'angry', sym: '‰', gem: '#FFD43B' }, 'Parts per million? It has a million parts. It counts every one.'],
  [41, 62, 'Dilatodon', 'Scale Factor', { body: 'long', huge: true, color: '#1D7F93', belly: '#C2EDF5', ears: 'fin', ears2: 'spikes', tail: 'fin', pattern: 'stripes', eyes: 'angry', sym: '×2', gem: '#8FD5F2' }, 'Dilates itself to any size it wants. Every part scales perfectly.'],
  [42, 63, 'Tributoise', 'Treasury Wall', { body: 'square', huge: true, color: '#2A6249', belly: '#CFE9DB', ears: 'spikes', armor: '#F2B731', pattern: 'spots', eyes: 'angry', sym: '$', gem: '#FFD43B', crown: true }, 'Carries a vault on its back. Every cent is counted twice.'],
  [43, 64, 'Capitalpine', 'Capital Gains', { body: 'round', huge: true, color: '#5A3F2A', belly: '#EBD4BC', ears: 'spikes', mane: '#E8C27A', tail: 'zigzag', eyes: 'angry', sym: '↑%', gem: '#FFD43B', crown: true }, 'Its golden quills are worth more every single day.'],
  [44, 65, 'Constellatross', 'Constant Orbit', { body: 'round', huge: true, color: '#7C98C9', belly: '#FFFFFF', ears: 'fin', wings: 'big', wingColor: '#F4F7FF', tail: 'fin', pattern: 'stars', eyes: 'angry', sym: 'k', gem: '#FFD43B' }, 'Flies at one constant rate across the night sky, mapping the stars.'],
  [45, 66, 'Derivastag', 'Instant Slope', { body: 'tall', huge: true, color: '#A65A2C', belly: '#F6D9BD', ears: 'antlers', mane: '#F6D9BD', tail: 'flame', eyes: 'angry', sym: 'm', gem: '#FFD43B' }, 'Can tell the steepness of any hill at any single instant.'],
  [46, 67, 'Exponix', 'Exponential Rise', { body: 'tall', huge: true, color: '#4A2C9E', belly: '#E0D4FF', ears: 'crest', ears2: 'flame', wings: 'big', wingColor: '#FF9A2E', tail: 'flame', eyes: 'angry', sym: '%', gem: '#FFD43B', crown: true }, 'Every time it rises, it rises faster. Nothing has ever caught it.'],
  [85, 94, 'Axiomotl', 'Axiom Tide', { body: 'long', huge: true, color: '#D6609A', belly: '#FFD2E6', ears: 'crest', ears2: 'spikes', tail: 'fin', pattern: 'stars', eyes: 'angry', sym: 'x', gem: '#8FD5F2', crown: true }, 'Knows every unknown. The stars on its skin are solutions it has found.'],
  [86, 95, 'Equilibear', 'Equilibrium Maul', { body: 'round', huge: true, color: '#6E4426', belly: '#DDB894', ears: 'round', mane: '#4A2C14', armor: '#C9CED8', eyes: 'angry', sym: '=', gem: '#9BE07A', crown: true }, 'So perfectly balanced that nothing can knock it over.'],
  [87, 96, 'Isolagon', 'Solitary Inferno', { body: 'tall', huge: true, color: '#B83E1E', belly: '#FFC79A', ears: 'horns', ears2: 'crest', wings: 'big', wingColor: '#FF9A2E', tail: 'flame', eyes: 'angry', sym: 'x', gem: '#FFD43B' }, 'A dragon that clears every term away with one breath.'],
  [88, 97, 'Greatestgator', 'Greatest Crunch', { body: 'long', huge: true, color: '#2F7A3A', belly: '#C9E39A', ears: 'spikes', ears2: 'horns', tail: 'fin', armor: '#A7D8B4', pattern: 'stripes', eyes: 'angry', sym: '≥', gem: '#FFD43B' }, 'Greater, greater, greatest. Nothing in the Bluffs is bigger.'],
  [89, 98, 'Inversloth', 'Total Inverse', { body: 'pear', huge: true, color: '#6F7D5C', belly: '#D9DDC6', ears: 'round', mane: '#A9B48E', tail: 'curl', eyes: 'sleepy', sym: '⇄', gem: '#9BE07A', crown: true }, 'Undoes any operation ever done, in perfect reverse order.'],
  [90, 99, 'Solvoracle', 'Oracle of Solutions', { body: 'tall', huge: true, color: '#55449A', belly: '#D6CBF7', ears: 'pointy', ears2: 'crest', wings: 'big', wingColor: '#B9A8F0', pattern: 'stars', eyes: 'big', sym: '?', gem: '#FFD43B', crown: true }, 'Sees the solution to every equation before it is even written.'],
  [91, 100, 'Ramquation', 'Ram of Equality', { body: 'round', huge: true, color: '#E5D3A8', belly: '#FFFFFF', ears: 'horns', mane: '#FFFFFF', armor: '#F2B731', eyes: 'angry', sym: '=', gem: '#F472B6' }, 'Charges straight down the equals sign and never loses its balance.'],
  [92, 101, 'Coefficheetah', 'Coefficient Dash', { body: 'tall', huge: true, color: '#E0A640', belly: '#FFEFC9', ears: 'pointy', tail: 'curl', pattern: 'spots', mane: '#C27A1E', eyes: 'angry', sym: '3x', gem: '#FFD43B' }, 'The fastest multiplier alive. Every number it touches gets bigger.'],
  [93, 102, 'Apexibex', 'Apex Summit', { body: 'tall', huge: true, color: '#8E7656', belly: '#E3D5BE', ears: 'horns', ears2: 'crest', mane: '#EFE6D6', eyes: 'angry', sym: '=', gem: '#8FD5F2', crown: true }, 'Stands on the highest peak, where every equation is in perfect balance.'],
];
{
  const byN = {}; SPECIES.forEach(s => (byN[s.n] = s));
  SPECIES.forEach(s => (s.stage = s.evolved ? 2 : 1));
  for (const [from, n, name, move, look, note] of FINALS) {
    const b = byN[from], root = byN[b.from];
    b.evo = n; b.evoLv = EVO_LEVEL_FINAL[root.zone === 'starter' ? 'starter' : root.r];
    look.aura = AURA[b.type];
    SPECIES.push({ n, id: name.toLowerCase(), name, type: b.type, r: b.r, zone: b.zone, from, evolved: true, stage: 3,
      base: b.base.map(v => Math.round(v * 1.18)), move, look, note });
  }
}
const SP = {}; SPECIES.forEach(s => (SP[s.n] = s));
const BASE_SPECIES = SPECIES.filter(s => !s.evolved);
const MAX_DEX = Math.max(...SPECIES.map(s => s.n));
