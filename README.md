# Math 7 Arcade

Arcade games for practicing the Grade 7 Texas math TEKS.

The games, the hub, the score codes and the leaderboard are **Kody Spitz's Spitz Arcade** (spitz-math.github.io), used with credit.
This copy swaps in a new question bank (`games/questions.js`) with 15 sets written for 7th grade:

| Set | TEKS |
|---|---|
| Rational number operations | 7.3A |
| Rational number problems | 7.3B |
| Sets of numbers | 7.2 |
| Rates & proportionality | 7.4A–C |
| Percents | 7.4D |
| Converting units | 7.4E |
| Scale drawings & similar figures | 7.5A, 7.5C |
| Circles | 7.5B, 7.9B |
| Area & volume | 7.8A, 7.9A, 7.9C, 7.9D |
| Equations & inequalities | 7.10A–B, 7.11A–B |
| Angle relationships | 7.11C |
| Probability | 7.6A, C–E, H–I |
| Linear relationships | 7.7A |
| Personal finance | 7.13A–E |
| Data & samples | 7.6G, 7.12A–C |

**Topple** (`games/topple.html`) is a new puzzle game built for this arcade: roll a block across tiles and stand it in the hole.
Right answers charge moves, and gold switches build bridges after a right answer. Its 10 levels are listed at the top of its script
(`LEVELS`), and each one has been checked solvable.

**Chalk Clash** (`games/chalk_clash.html`) is a lane battle on a chalkboard number line. Right answers give energy to send
triangles, squares and circles at the rival fort; shapes pop into chalk dust instead of getting hurt. Students can build a protractor
tower, evolve to 3D solids, and charge an eraser sweep with answer streaks. Each round's rival is tougher; difficulty was tuned
by simulating thousands of matches at different answering speeds and accuracy.

**Gremlin Hall** (`games/gremlin_hall.html`) is a wave-survival game in the school gym. School supplies fire on their own
while students dodge math gremlins. Between waves, every choice on the cork board needs a right answer: study for stickers, heal,
level up gear, or build bookshelf walls and goo or stapler turrets. Wrong answers add gremlins (and elites) to the next wave.
It ranks by waves survived, has no time limit, and reloading during a wave ends the run so waves can't be retried.

Every question is generated fresh, and each one is checked before students see it: the right answer must pass an
independent check, no wrong answer may pass it, and every wrong answer carries a short explanation.

## Put it online (GitHub Pages, free)
1. Make a free account at github.com, then click **New repository**. Name it something like `math7-arcade` and make it **Public**.
2. On the new repo page, click **uploading an existing file**, drag in everything inside this folder (not the folder itself), and click **Commit changes**.
3. Go to **Settings → Pages**. Under *Branch*, pick **main** and **/(root)**, then **Save**.
4. After a minute your arcade is live at `https://YOUR-USERNAME.github.io/math7-arcade/`. Share that link with students.

Pages for you (not linked from the student hub): `teacher.html` (check score codes, post the leaderboard) and
`teacher-preview.html` (see sample questions, answers and feedback for any set).

## Your settings
- `games/scorecode.js` → `FORM.url`: your Google Form for score codes (students type name + code).
- `index.html` → `SUGGEST.url`: optional Google Form for bug reports and game ideas.
- `games/catalog.js` → `UNLOCK`: optional drip release of games by date.
- `teacher.html`: checks score codes and posts the leaderboard to `data/leaderboard.json` in this repo.
