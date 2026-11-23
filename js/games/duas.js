/* =========================================================
   Game: Dua Time
   Teaches: short everyday duas.
   Tap a moment of the day, hear the dua, say it, earn a star.
   Learn 3 duas to finish a round.
   Duas are shown in transliteration with their meaning. They are
   well-known duas from the Sunnah (as collected in Hisn al-Muslim) and
   one from the Quran (17:24). PARENT: please check the wording you
   want your children to learn before they use this game.
   The tablet's English voice can't pronounce Arabic well, so it reads
   the meaning. A parent's own recordings can replace this later.
   ========================================================= */
import { el, speak, sfx, toast } from '../core.js';

export const DUAS = [
  { id: 'eat', emoji: '🍽️', when: 'Before eating', dua: 'Bismillah', meaning: 'In the name of Allah.', little: true },
  { id: 'ate', emoji: '😋', when: 'After eating', dua: 'Alhamdulillah', meaning: 'All praise is for Allah.', little: true },
  { id: 'sleep', emoji: '🛏️', when: 'Before sleeping', dua: 'Bismika Allahumma amutu wa ahya', meaning: 'In Your name, O Allah, I die and I live.', little: true },
  { id: 'sneeze', emoji: '🤧', when: 'When you sneeze', dua: 'Alhamdulillah', meaning: 'All praise is for Allah. Others reply: Yarhamuk Allah, may Allah have mercy on you.', little: true },
  { id: 'wake', emoji: '🌅', when: 'Waking up', dua: 'Alhamdu lillahil-ladhi ahyana ba‘da ma amatana wa ilayhin-nushur', meaning: 'All praise is for Allah, who gave us life after making us die, and to Him is the return.' },
  { id: 'home', emoji: '🚪', when: 'Leaving home', dua: 'Bismillah, tawakkaltu ‘alallah, wa la hawla wa la quwwata illa billah', meaning: 'In the name of Allah, I trust in Allah, and there is no power and no strength except with Allah.' },
  { id: 'toiletIn', emoji: '🚻', when: 'Going into the toilet', dua: 'Allahumma inni a‘udhu bika minal-khubuthi wal-khaba’ith', meaning: 'O Allah, I seek safety with You from evil and evil things.' },
  { id: 'toiletOut', emoji: '🧼', when: 'Coming out of the toilet', dua: 'Ghufranak', meaning: 'I ask You for forgiveness.' },
  { id: 'masjid', emoji: '🕌', when: 'Going into the masjid', dua: 'Allahummaf-tah li abwaba rahmatik', meaning: 'O Allah, open the doors of Your mercy for me.' },
  { id: 'parents', emoji: '👨‍👩‍👧', when: 'For Mum and Dad', dua: 'Rabbir-hamhuma kama rabbayani saghira', meaning: 'My Lord, have mercy on them, as they cared for me when I was small. (Quran 17:24)' },
];

const GOAL = 3; // duas to learn in one round

export default {
  id: 'duas',
  noStats: true, // listen and learn, no wrong answers
  title: 'Dua Time',
  emoji: '🤲',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const list = band === 'little' ? DUAS.filter(d => d.little) : DUAS;
    const learned = new Set();
    menu();

    function menu() {
      const left = GOAL - learned.size;
      const text = `Pick a time of day to learn its dua. ${left} more to go!`;
      const say = ['Pick a time of day to learn its dua.', `${left} more to go!`];
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(say) }, '🔊'),
          el('p', {}, text)),
        el('div', { class: 'tile-grid' }, list.map(d =>
          el('button', { class: `tile ${learned.has(d.id) ? 'done-tile' : ''}`, style: 'min-height:10rem', onclick: () => { sfx.tap(); show(d); } },
            el('span', { class: 'emoji' }, d.emoji),
            el('span', { class: 'label', style: 'font-size:1.4rem' }, d.when),
            learned.has(d.id) ? el('span', { class: 'sub' }, '⭐ Learned') : null))),
      );
      speak(say);
    }

    function show(d) {
      const voice = `${d.when}, we say: ${d.dua}. It means: ${d.meaning}`;
      root.replaceChildren(
        el('div', { class: 'dua-card' },
          el('div', { class: 'emoji' }, d.emoji),
          el('p', { class: 'note', style: 'font-size:1.5rem;margin:0' }, d.when),
          el('p', { class: 'dua-translit' }, d.dua),
          el('p', { class: 'dua-meaning' }, d.meaning)),
        el('div', { class: 'row' },
          el('button', { class: 'big-btn secondary', onclick: () => speak(voice) }, '🔊 Listen'),
          el('button', { class: 'big-btn', onclick: () => said(d) }, '🗣️ I said it!'),
          el('button', { class: 'big-btn secondary', onclick: menu }, '⬅️ Back')),
      );
      speak(voice);
    }

    function said(d) {
      sfx.right();
      learned.add(d.id);
      toast('MashaAllah! ⭐');
      if (learned.size >= GOAL) {
        setTimeout(() => ctx.finish(3, 'You learned 3 duas!'), 1000);
      } else {
        setTimeout(menu, 1000);
      }
    }
  },
};
