/* =========================================================
   Game: Pillars Quest
   Teaches: the Five Pillars of Islam.
   Each right answer builds one golden pillar. Five pillars
   finish the house.
   Bands:
     explorer - picture and description; pick the pillar's name.
     champion - harder questions about each pillar.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';

export const PILLARS = [
  { id: 'shahadah', name: 'Shahadah', short: 'Shahadah', emoji: '☝️',
    describe: 'We say: there is no god but Allah, and Muhammad (peace be upon him) is His Messenger.',
    say: 'We say: there is no god but Allah, and Muhammad, peace be upon him, is His Messenger.' },
  { id: 'salah', name: 'Salah (Prayer)', short: 'Salah', emoji: '🕌',
    describe: 'We pray to Allah five times every day.' },
  { id: 'zakah', name: 'Zakah (Charity)', short: 'Zakah', emoji: '🤝',
    describe: 'We give some of our money to people in need.' },
  { id: 'sawm', name: 'Sawm (Fasting)', short: 'Sawm', emoji: '🌙',
    describe: 'We fast in the month of Ramadan.' },
  { id: 'hajj', name: 'Hajj', short: 'Hajj', emoji: '🕋',
    describe: 'We travel to the Kaaba in Makkah, once in our life if we are able.' },
];

/* Champions: two questions per pillar; one is picked at random each game. */
export const HARD = {
  shahadah: [
    { q: 'What does the Shahadah mean?', options: ['There is no god but Allah, and Muhammad (peace be upon him) is His Messenger', 'Allah is the Most Merciful', 'All praise is for Allah'], answer: 0 },
    { q: 'Which is the first Pillar of Islam?', options: ['Shahadah', 'Salah', 'Hajj'], answer: 0 },
  ],
  salah: [
    { q: 'How many fard (must-do) prayers are there each day?', options: ['5', '3', '7'], answer: 0 },
    { q: 'Which prayer is prayed just after sunset?', options: ['Maghrib', 'Fajr', 'Asr'], answer: 0 },
  ],
  zakah: [
    { q: 'How much Zakah is paid on savings kept for a whole year?', options: ['2.5%', '10%', '50%'], answer: 0 },
    { q: 'Who receives Zakah?', options: ['People in need', 'Only our friends', 'Shops'], answer: 0 },
  ],
  sawm: [
    { q: 'When do we fast in Ramadan?', options: ['From dawn (Fajr) until sunset (Maghrib)', 'From lunch until dinner', 'All day and all night'], answer: 0 },
    { q: 'What is the meal before dawn called?', options: ['Suhoor', 'Iftar', 'Eid'], answer: 0 },
  ],
  hajj: [
    { q: 'How many times must a Muslim do Hajj, if they are able?', options: ['Once in their life', 'Every year', 'Every month'], answer: 0 },
    { q: 'In which city is Hajj performed?', options: ['Makkah', 'Madinah', 'Damascus'], answer: 0 },
  ],
};

/* Text for the speech voice: swap the ﷺ symbol for the words. */
const forVoice = t => t.replace(/ﷺ/g, ', peace be upon him,');

export default {
  id: 'pillars',
  title: 'Pillars Quest',
  emoji: '🏛️',
  bands: ['explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    let round = 0;
    let mistakes = 0;

    // The building stays on screen; pillars grow as rounds are won.
    const dome = el('div', { class: 'dome', style: 'opacity:0' }, '🕌');
    const pillarEls = PILLARS.map(p => el('div', { class: 'pillar' }, p.short));
    const building = el('div', { class: 'building' },
      dome, el('div', { class: 'roof' }), el('div', { class: 'pillars' }, pillarEls));

    const area = el('div', { style: 'display:flex;flex-direction:column;gap:1.25rem' });
    root.append(building, area);
    showRound();

    function showRound() {
      const pillar = PILLARS[round];
      let question, options, correct, voice;

      if (band === 'champion') {
        const item = pick(HARD[pillar.id]);
        question = item.q;
        correct = item.options[item.answer];
        options = shuffle(item.options);
        voice = forVoice(question);
      } else {
        question = pillar.describe;
        correct = pillar.name;
        const others = shuffle(PILLARS.filter(p => p !== pillar)).slice(0, 2).map(p => p.name);
        options = shuffle([correct, ...others]);
        voice = (pillar.say || pillar.describe) + ' Which pillar is this?';
      }

      const optionBox = el('div', { class: 'options' });
      optionBox.append(...options.map(opt => {
        const b = el('button', { class: 'option', onclick: () => answer(opt, b) }, opt);
        return b;
      }));

      area.replaceChildren(...[
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(voice) }, '🔊'),
          el('p', {}, band === 'champion' ? question : `${question} Which pillar is this?`)),
        band === 'champion' ? null : el('div', { class: 'question-pic' }, pillar.emoji),
        optionBox,
      ].filter(Boolean));
      speak(voice);

      function answer(opt, btn) {
        if (optionBox.dataset.locked) return; // already answered this round
        if (opt === correct) {
          optionBox.dataset.locked = '1';
          sfx.right();
          btn.classList.add('right');
          pillarEls[round].classList.add('built');
          const praise = pick(PRAISE);
          toast(praise);
          round++;
          speakThen([praise, `You built the pillar of ${pillar.short}.`], 1800)
            .then(() => { if (root.isConnected) round < PILLARS.length ? showRound() : complete(); });
        } else {
          mistakes++;
          sfx.tryAgain();
          wiggle(btn);
          toast('Try again!');
        }
      }
    }

    function complete() {
      dome.style.opacity = '1';
      area.replaceChildren(el('div', { class: 'prompt' },
        el('p', {}, 'You built all Five Pillars of Islam!')));
      const stars = mistakes === 0 ? 3 : 2;
      speakThen('MashaAllah! You built all five pillars of Islam!', 2000)
        .then(() => ctx.finish(stars, 'You built the house of Islam!'));
    }
  },
};
