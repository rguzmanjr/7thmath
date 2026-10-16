/* Numlings: TEACHER SETTINGS. Edit the values below to tune the game for your class. */
'use strict';
/* =========================================================================
   NUMLINGS — teacher settings. Edit these, then re-upload the file.
   ========================================================================= */
const CONFIG = {
  // Set a zone to false to lock it for every student (e.g. until you teach that unit).
  zones: { isles: true, rapids: true, bluffs: true },
  // Seconds for battle (crit + guard) questions, by difficulty tier.
  battleSeconds: { 1: 30, 2: 45, 3: 75 },
  // Level scaling. Every battle rises to meet the strongest Numling on the student's team,
  // so training never lets anyone steamroll. Catch levels stay low no matter what.
  // An opponent fights at about: team's best level × multiplier (never below its own level).
  // The multiplier eases in over levels 1–15 so new players aren't swamped.
  //   wild: multiplier for wild battles in each zone
  //   Trainers and Champions each have their own multiplier (mult) in the map section.
  scaling: { wild: { isles: 1.15, rapids: 1.15, bluffs: 1.15 } },
  catchSeconds: { 1: 0, 2: 0, 3: 120, 4: 120, 5: 150 }, // per problem, by rarity (0 = no timer)
  catchMissesAllowed: 1,                           // 1 = the creature runs off on the 2nd miss
  // Evolution trials. A student whose Numling reaches its evolution level can take the trial
  // as many times as they want. Students who get about 70% of hard problems right pass
  // about 60% of the time with these settings. Easier: lower needed or raise seconds.
  evolution: { questions: 7, needed: 5, seconds: 60, tiers: [2, 2, 3, 3, 3, 3, 3],
    // The final evolution (second stage → final form) is tougher: all hardest-tier problems.
    // Students at about 70% on hard problems pass this about 55% of the time; about 80% pass it about 80% of the time.
    final: { questions: 8, needed: 6, seconds: 75, tiers: [3, 3, 3, 3, 3, 3, 3, 3] } },
  // Encounters and the grind. Rarity weights are relative: a Rare (13) shows up about 13 times as often as
  // a total of 100. Each tier's share is split evenly among that tier's Numlings in the zone.
  encounters: {
    grassRate: 0.12,                                  // chance of an encounter per tall-grass step
    weights: { 1: 50, 2: 30, 3: 13, 4: 5, 5: 2 },     // Common, Uncommon, Rare, Epic, Legendary
    sparkles: { count: 3, refreshMinutes: 20, weights: { 3: 85, 4: 13, 5: 2 } }, // sparkles are always Rare or better
    legendaryNeedsBadge: true,                        // a zone's Legendary appears only after its Champion is beaten
    shinyChance: 0.05,                                // chance any wild Numling is a shiny recolor
    shinyExtraMiss: 1,                                // shinies allow this many extra misses when catching
  },
  // Dungeons: timed fact challenges. Each run is floors × perFloor correct answers; hearts are shared across the run.
  dungeons: { multiplia: { floors: 5, perFloor: 8, hearts: 3, seconds: { easy: 7, hard: 5, chaos: 5 },
    // After every clear, one of the dungeon's Numlings blocks the exit. The rare one shows up rareChance of the time.
    // A perfect run (no misses) has shinyChance of an extra encounter with a shiny, which needs shinySeconds per fact.
    monsters: [69, 70, 71, 72], rare: 73, rareChance: 0.10, shinyChance: 0.10, shinySeconds: 4,
    catchFacts: 5, catchMisses: 1, catchLevel: { easy: 12, hard: 18, chaos: 26 } } },
  // Math support. A first wrong answer shows a hint (and names the mistake when the game can tell), then allows one
  // more try. Answers that needed a hint count as "with help" in the skill records. Evolution trials and the
  // dungeon never give hints, because those are mastery tests.
  support: { hints: true, inBattles: true },
  // Focus skills: skill ids from data/questions.js that the game should practice more right now,
  // for example ['percent-change', 'discount-tax']. Leave the list empty for a balanced mix.
  focusSkills: [],
  // Adaptive difficulty: a student moves up a tier in a zone's skills once they get promoteAt of the tier below
  // right (with at least minAttempts recent tries), and steps back down if the current tier drops under demoteAt.
  // review/stretch: how often a question comes from one tier below or above, for review and growth.
  // Battles, chests, and "Just right" training use this. Catching, trials, and the dungeon have their own rules.
  adaptive: { promoteAt: 0.75, demoteAt: 0.4, minAttempts: 6, review: 0.15, stretch: 0.15 },
  // Turning in progress. Paste a Google Form "prefilled link" here and students get a Turn in my progress button
  // on the Save page. In your Form, add a short-answer question for the save code, choose Get pre-filled link,
  // type CODE in that question, copy the link, and paste it below. The game swaps CODE for the student's code.
  // Leave url empty to hide the button. Then paste the Form's responses into teacher.html.
  turnIn: { url: '' },
  partySize: 3,
  boxLimit: 60,
  // Changing this makes every existing save code invalid. Only change it to wipe codes on purpose.
  saveSalt: 'cms-math7-numlings',
};
