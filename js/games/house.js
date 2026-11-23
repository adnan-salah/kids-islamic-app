/* =========================================================
   Game: My Little House
   Teaches: everyday life skills: healthy habits, safety,
   kindness, a little science, and a little Islam.
   A toy house with 6 rooms. Tap a room, answer its question,
   and a kitten moves into that room. Fill the whole house!
   Bands:
     little   - 2 answer choices.
     explorer - 3 answer choices.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, pick, PRAISE, praiseFor } from '../core.js';

/* Each room: options[0] is always the right answer (they are shuffled on screen).
   The third option is only shown to Explorers. */
export const ROOMS = [
  { id: 'kitchen', emoji: '🍳', name: 'Kitchen', pet: '🐱', qs: [
    { q: 'Which snack is best for growing strong?', options: ['An apple', 'Lollies', 'Chips'], why: 'Fruit gives your body vitamins.' },
    { q: 'What do we do before we eat?', options: ['Wash our hands', 'Jump on the bed', 'Watch TV'], why: 'Washing hands washes the germs away.' },
  ] },
  { id: 'bathroom', emoji: '🛁', name: 'Bathroom', pet: '🐈', qs: [
    { q: 'How long should we brush our teeth?', options: ['2 minutes', '2 seconds', '2 hours'], why: 'Two minutes, morning and night, keeps teeth clean.' },
    { q: 'What helps keep us clean?', options: ['Soap and water', 'Mud', 'Glue'], why: 'Soap and water wash away dirt and germs.' },
  ] },
  { id: 'bedroom', emoji: '🛏️', name: 'Bedroom', pet: '😺', qs: [
    { q: 'Why do we need a good sleep?', options: ['To grow and feel happy', 'To get hungry', 'To make noise'], why: 'Sleep helps your body grow and your brain learn.' },
    { q: 'Before sleeping, Muslims say a dua. It starts with…', options: ['Bismika Allahumma', 'Good morning', 'Happy birthday'], why: 'Bismika Allahumma amutu wa ahya: in Your name, O Allah, I die and I live.' },
  ] },
  { id: 'lounge', emoji: '🛋️', name: 'Lounge room', pet: '😸', qs: [
    { q: 'Your little brother is crying. What do you do?', options: ['Give him a cuddle', 'Laugh at him', 'Take his toy'], why: 'Being kind makes everyone feel better.' },
    { q: 'Your toys are all over the floor. What do you do?', options: ['Tidy them up', 'Leave them', 'Hide them under the couch'], why: 'Tidying up helps the whole family.' },
  ] },
  { id: 'door', emoji: '🚪', name: 'Front door', pet: '😻', qs: [
    { q: 'Someone you don’t know knocks on the door. What do you do?', options: ['Get a grown-up', 'Open the door', 'Go outside with them'], why: 'Always get a grown-up. Never open the door to strangers.' },
    { q: 'When Muslims come home, we say…', options: ['Assalamu alaikum', 'Goodbye', 'Oops'], why: 'Assalamu alaikum means peace be upon you.' },
  ] },
  { id: 'garden', emoji: '🌻', name: 'Garden', pet: '🐾', qs: [
    { q: 'What do plants need to grow?', options: ['Water and sunlight', 'Lollies', 'Toys'], why: 'Plants drink water and use sunlight to make food.' },
    { q: 'Which animal makes honey?', options: ['A bee', 'A cow', 'A fish'], why: 'Bees make honey from the nectar in flowers.' },
  ] },
];

export default {
  id: 'house',
  title: 'My Little House',
  emoji: '🏡',
  bands: ['little', 'explorer'],

  start(ctx) {
    const { root, band } = ctx;
    const nOpts = band === 'little' ? 2 : 3;
    const done = new Set();
    let mistakes = 0;
    house();

    function house() {
      const left = ROOMS.length - done.size;
      const say = left === ROOMS.length
        ? 'Tap a room to help the kittens move in!'
        : 'Tap another room!';
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(say) }, '🔊'),
          el('p', {}, say)),
        el('div', { class: 'toy-house' },
          el('div', { class: 'toy-roof' }, '🏡'),
          el('div', { class: 'toy-rooms' }, ROOMS.map(r =>
            el('button', { class: `toy-room ${done.has(r.id) ? 'lived' : ''}`, onclick: () => { if (!done.has(r.id)) { sfx.tap(); room(r); } } },
              el('span', { class: 'emoji' }, done.has(r.id) ? r.pet : r.emoji),
              el('span', { class: 'label' }, r.name),
              done.has(r.id) ? el('span', { class: 'sub' }, '⭐') : null)))));
      speak(say);
    }

    function room(r) {
      const item = pick(r.qs);
      const right = item.options[0];
      const shown = shuffle(item.options.slice(0, nOpts));
      const box = el('div', { class: 'options' }, shown.map(opt => {
        const b = el('button', { class: 'option', 'data-opt': opt, onclick: () => answer(opt, b) }, opt);
        return b;
      }));
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(item.q) }, '🔊'),
          el('p', {}, item.q)),
        el('div', { class: 'question-pic' }, r.emoji),
        box,
        el('div', { class: 'row' }, el('button', { class: 'big-btn secondary', onclick: house }, '⬅️ Back')));
      speak([r.name, item.q]);

      function answer(opt, b) {
        if (box.dataset.locked) return;
        if (opt === right) {
          box.dataset.locked = '1';
          sfx.right();
          b.classList.add('right');
          const praise = praiseFor(item.q, item.why);
          toast(praise);
          done.add(r.id);
          speakThen([praise, item.why], 1500).then(() => {
            if (!root.isConnected) return;
            if (done.size === ROOMS.length) {
              sfx.win();
              ctx.finish(band === 'little' || mistakes <= 2 ? 3 : 2, 'The kittens love their new house!');
            } else house();
          });
        } else {
          mistakes++;
          sfx.tryAgain();
          wiggle(b);
          toast('Try again!');
          // The 3-year-old gets shown the right one after a miss.
          if (band === 'little') [...box.children].find(x => x.dataset.opt === right)?.classList.add('hint');
        }
      }
    }
  },
};
