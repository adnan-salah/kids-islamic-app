# Noor Learning

A safe, offline-friendly Islamic learning app for children aged 3 to 9, built for Android tablets.
No ads, no tracking, no purchases, no links out. Progress is saved on the tablet only.

## Games so far
| Game | Ages | Teaches |
| --- | --- | --- |
| Wudu Steps | 3, 6, 7, 9 | Cleanliness and the order of wudu |
| Pillars Quest | 6, 7, 9 | The Five Pillars of Islam |

## Parent area
Hold the ⚙️ button on the "Who's playing?" screen for 2 seconds, then answer the sum.
There you can set each child's name, picture and age group.

## How it's built
Plain HTML, CSS and JavaScript. No build step, nothing to install.
- `index.html`: the page
- `js/app.js`: screens and navigation
- `js/core.js`: saving progress, speech, sounds, helpers
- `js/games/`: one file per game; add new games to `js/games/index.js`

To try it on a computer: run `python3 -m http.server` in this folder and open http://localhost:8000.
