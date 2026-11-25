# Willow Woods, step 1 (setup) Implementation Plan

**Goal:** Every child sees a Willow Woods card on their home screen that opens a map of six friends ("coming soon"), at the version that fits their age.

**Architecture:** One new game module (`js/games/woods/`) registered as its own subject, so it reuses the existing profile, stars, back button and end screen. The version (T, A, B, C) comes from one pure function over the child record.

**Tech stack:** Plain HTML, CSS and ES modules. No build step, no new dependencies.

**Spec:** "Spark Island: revised brief and design" (approved 25 Nov 2026; renamed Willow Woods).

## Global constraints
- No lives, no timers, no failing for version T. No text on screen for version T.
- The home screen and the map fit 1280 x 800 without scrolling.
- Nothing personal in the repo: birth month lives in local storage only.
- Praise phrases only where relevant: none in this game.

## Review focus
- Child with no birth month: falls back to their age group (little T, explorer B, champion C).
- Birth month in the future or garbage: ignored, same fallback.
- Parent override beats age.
- Nine subject cards still fit one landscape screen; profiles with fewer cards unchanged.
- Leaving the game returns to the home screen, not a one-tile subject page.

## Task 1: version from age
- Files: `js/games/woods/bands.js`, test `tools/woods-test.mjs`.
- Produces: `WOODS_BANDS`, `ageFrom(birth, now)`, `woodsBand(child, now)` returning 'T' | 'A' | 'B' | 'C'. Ages 3-4 T, 5-6 A, 7-8 B, 9+ C.
- Verify: `node tools/woods-test.mjs` prints `woods bands ok`.

## Task 2: card, map and parent controls
- Files: `js/games/woods/index.js`, `js/games/index.js`, `js/app.js`, `css/style.css`.
- Subject `{ id: 'woods', name: 'Willow Woods', bg: 'world', games: [woods] }`, first in `SUBJECTS`. A subject with one game opens that game directly, and leaving it returns to the home screen.
- Map: six round spots on a path, each with a red "!" (still needs help). Tap says the friend's name and "coming soon".
- Parent area: birth month input (`child.birth`, "YYYY-MM") and version select (`child.woodsBand`).
- Verify in a browser at 1280 x 800: for a little, explorer and champion profile, the card shows, the map opens at T, B and C, nothing scrolls, no page errors.
