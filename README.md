# Noor Learning

A safe, offline-friendly Islamic learning app for children aged 3 to 9, built for Android tablets.
No ads, no tracking, no purchases, no links out. Progress is saved on the tablet only.

## Games so far
| Game | Ages | Teaches |
| --- | --- | --- |
| Quran Practice | 3, 6, 7, 9 | Short surahs: listen, repeat x3, record yourself, parent awards the badge |
| Wudu Steps | 3, 6, 7, 9 | Cleanliness and the order of wudu |
| Dua Time | 3, 6, 7, 9 | Everyday duas with their meanings |
| Good Manners | 3, 6, 7, 9 | Akhlaq and Adab through everyday choices |
| Prophet Stories | 3, 6, 7, 9 | Nuh, Yunus, Ibrahim, Musa; plus Seerah stories for age 9 |
| Pillars Quest | 6, 7, 9 | The Five Pillars of Islam |
| Letter Match | 3, 6, 7 | The 28 Arabic letters |
| Masjid Maths | 3, 6, 7, 9 | Counting, sums, times tables, word problems |

Every 10 stars unlocks a sticker in the child's sticker book (tap the star count).

## Sources
- Quran text: [quran-json](https://github.com/risan/quran-json) 3.1.2 (CC-BY-4.0): Uthmani text from The Noble Qur'an Encyclopedia, transliteration from Tanzil.net. Stored in `data/quran.js`, never typed by hand.
- Recitation: Sheikh Mishary Rashid Alafasy, streamed per ayah from everyayah.com (needs internet).
- Arabic font: Amiri Quran (SIL Open Font License), in `fonts/`.
- Duas and stories: please have a parent or teacher check the wording before children use them.

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
