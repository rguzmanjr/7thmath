# Numlings

A creature-collecting math game for 7th grade (TEKS 7.3, 7.4, 7.5C, 7.13E).
Open `index.html` to play. It works on GitHub Pages and straight from your computer.

## Where things live

| File | What's in it | Edit it when you want to… |
|---|---|---|
| `js/config.js` | **Teacher settings** | lock zones, change timers, encounter and shiny rates, trial difficulty, dungeon rules |
| `data/zones.js` | Types, rarity tiers, zones (names, levels, TEKS) | rename a zone or change its level range |
| `data/species.js` | Every Numling: stats, looks, evolutions, dungeon residents | add or adjust a Numling |
| `data/questions.js` | Question generators and answer checking | add a new kind of problem |
| `data/maps.js` | Map layouts (zones and Origin Town), signs, buildings, gates, trainers, Champions | edit a map, a sign, or a trainer's team |
| `data/quests.js` | Townspeople, quests, quest objects, daily Board Jobs, unlockable caps | add or change a quest |
| `css/style.css` | All styles | change colors or layout |
| `js/…` | The game engine (state, saving, map, battles, dungeon, screens) | usually nothing |

## Languages (English, Español, EN + ES)

Students choose English, Spanish, or both on the title screen, the new-game screen, the Save page, or with the
EN / ES / EN + ES switch inside any question. In EN + ES mode, problems, hints, and explanations show English with
Spanish underneath. The choice is remembered on that device. All math content is translated, along with quests,
townspeople, trainers, signs, and the main screens. Numling, move, and zone names stay the same in both languages.

When you write a new problem type, wrap every sentence a student reads in L('English', 'Español'), for example
hint: L('Divide both sides by 3.', 'Divide los dos lados entre 3.'). Quests and townspeople take Spanish in fields
ending in Es (titleEs, offerEs, finishEs, textEs, idleEs).

## Quests

Quests live in `data/quests.js`. Each one is a short list of steps done in order, then the student returns to the
person who gave it. The step types are listed at the top of that file (talk, visit, catch, battle, solve, chests,
caches, quest objects, dungeon clears, evolutions, mastered skills, levels). A new quest looks like this:

```js
{ id: 'tax-time', title: 'Tax Time', giver: 'omar', requires: ['bridge'],
  offer: 'The shop keeps getting sales tax wrong. Can you help?',
  steps: [{ type: 'solve', count: 5, skill: 'sales-tax', text: 'Solve 5 sales tax problems' },
          { type: 'catch', count: 1, zone: 'rapids', text: 'Catch a Numling in Ratio Rapids' }],
  finish: 'Perfect math! The shop owes you one.',
  rewards: { xp: 120, title: 'Tax Expert' } },
```

Students find quests by talking to townspeople with a **!** over their heads (a **?** means a quest is ready to turn
in). A new daily Board Job appears on the Quest Board every day. To add a townsperson, add them to `NPCS` with a map
and a spot that isn't on a path.

## Teacher dashboard (`teacher.html`)

Open `teacher.html` (for example rguzmanjr.github.io/7thmath/numlings/teacher.html) to see your class by TEKS skill:
a heatmap of every student and skill, the skills to reteach next, ready-made small groups, a report for each student,
and a CSV download for PLC data. Codes are decoded in your browser and never sent anywhere.
Press **Try a sample class** to explore it before students turn anything in.

### One-time setup so students can turn in progress

1. Make a Google Form with short-answer questions: **Name**, **Period** (if you teach several), and **Save code**.
2. In the Form's ⋮ menu choose **Get pre-filled link**, type `CODE` in the Save code box, press **Get link**, and copy it.
3. In `js/config.js`, paste it here: `turnIn: { url: 'https://docs.google.com/forms/…entry.123456=CODE' },`
4. Students now see **Turn in my progress** on the Save page. It opens your Form with their code already filled in.
5. When you want data: open the Form's responses in Google Sheets, select the rows (the header row is fine), copy,
   and paste them into the dashboard. If a student turns in more than once, only the newest is used.

## After you change something

1. Upload the changed files to GitHub.
2. In `index.html`, raise `const VERSION = 1;` to `2` (then 3, 4…) and upload `index.html` too.
   This makes every browser load the new files instead of an old saved copy.

Student saves are stored per website (rguzmanjr.github.io), so moving or updating the game keeps everyone's progress.

## Focus skills

To make the game practice certain skills more this week, list their ids in focusSkills in js/config.js, for example: focusSkills: ['ineq-two-step', 'eq-write']. Students see a "Class focus" tag on those skills in Training.

| Skill id | Skill | TEKS | Zone | Tier |
|---|---|---|---|---|
| `int-addsub` | Adding and subtracting integers | 7.3A | Integer Isles | Warm-up |
| `int-muldiv` | Multiplying and dividing integers | 7.3A | Integer Isles | Warm-up |
| `dec-ops` | Operations with negative decimals | 7.3A | Integer Isles | On level |
| `frac-addsub` | Adding and subtracting fractions | 7.3A | Integer Isles | On level |
| `order-ops` | Order of operations with integers | 7.3A | Integer Isles | On level |
| `dec-div` | Dividing decimals | 7.3A | Integer Isles | On level |
| `frac-muldiv` | Multiplying and dividing fractions | 7.3A | Integer Isles | Challenge |
| `rational-word` | Rational number word problems | 7.3B | Integer Isles | Challenge |
| `unit-rate` | Unit rates | 7.4B | Ratio Rapids | Warm-up |
| `equiv-ratio` | Equivalent ratios | 7.4D | Ratio Rapids | Warm-up |
| `percent-benchmark` | Benchmark percents (10%, 25%, 50%) | 7.4D | Ratio Rapids | Warm-up |
| `constant-k` | Constant of proportionality | 7.4C | Ratio Rapids | On level |
| `percent-of` | Percent of a number | 7.4D | Ratio Rapids | On level |
| `sales-tax` | Sales tax | 7.4D | Ratio Rapids | On level |
| `tip` | Tips | 7.4D | Ratio Rapids | On level |
| `scale` | Scale drawings | 7.5C | Ratio Rapids | On level |
| `convert` | Converting units | 7.4E | Ratio Rapids | On level |
| `percent-change` | Percent increase and decrease | 7.4D | Ratio Rapids | Challenge |
| `discount-tax` | Discounts with tax | 7.4D | Ratio Rapids | Challenge |
| `markup` | Markups | 7.4D | Ratio Rapids | Challenge |
| `frac-rate` | Unit rates with fractions | 7.4B | Ratio Rapids | Challenge |
| `find-whole` | Finding the whole from a percent | 7.4D | Ratio Rapids | Challenge |
| `simple-interest` | Simple interest | 7.13E | Ratio Rapids | Challenge |
| `eq-one-step` | One-step equations | 7.11A | Balance Bluffs | Warm-up |
| `eq-check` | Checking solutions to equations | 7.11B | Balance Bluffs | Warm-up |
| `eq-two-step` | Two-step equations | 7.11A | Balance Bluffs | On level |
| `ineq-one-step` | One-step inequalities | 7.11A | Balance Bluffs | On level |
| `ineq-graph` | Inequalities on a number line | 7.10B | Balance Bluffs | On level |
| `eq-write` | Writing equations from situations | 7.10A | Balance Bluffs | On level |
| `ineq-two-step` | Two-step inequalities | 7.11A | Balance Bluffs | Challenge |
| `eq-word` | Equation word problems | 7.11A | Balance Bluffs | Challenge |
| `ineq-write` | Writing inequalities from situations | 7.10A | Balance Bluffs | Challenge |
| `ineq-check` | Checking solutions to inequalities | 7.11B | Balance Bluffs | Challenge |
