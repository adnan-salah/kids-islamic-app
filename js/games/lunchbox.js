/* =========================================================
   Game: Lunchbox Builder
   Teaches: healthy eating (Australian Guide to Healthy Eating, made
   simple): fruit, vegetables, a main (grains), dairy, water, and
   "sometimes foods" only once in a while.
   Tap food on the shelf to pack the lunchbox. Kasem checks the list.
   Bands:
     little   - pack a fruit, a vegetable and a drink of water. 2 boxes.
     explorer - fruit, vegetable, main, dairy, water. 2 boxes.
     champion - the same, plus a sport-day or picnic challenge
                with a rule, e.g. no more than one sometimes food. 3 boxes.
   Picking a second sometimes food, or a sugary drink, is a mistake.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, pick } from '../core.js';
import { confetti } from '../fun.js';

/* [emoji, name, group] */
export const FOODS = [
  ['🍎', 'apple', 'fruit'], ['🍌', 'banana', 'fruit'], ['🍇', 'grapes', 'fruit'], ['🍊', 'mandarin', 'fruit'], ['🍓', 'strawberries', 'fruit'], ['🍉', 'watermelon', 'fruit'], ['🥝', 'kiwi fruit', 'fruit'], ['🍐', 'pear', 'fruit'],
  ['🥕', 'carrot sticks', 'veg'], ['🥒', 'cucumber', 'veg'], ['🫑', 'capsicum', 'veg'], ['🍅', 'cherry tomatoes', 'veg'], ['🥦', 'broccoli', 'veg'], ['🌽', 'corn', 'veg'],
  ['🥪', 'sandwich', 'main'], ['🌯', 'chicken wrap', 'main'], ['🍙', 'rice ball', 'main'], ['🫓', 'cheese and za’atar bread', 'main'], ['🥙', 'falafel pita', 'main'], ['🍝', 'pasta salad', 'main'],
  ['🧀', 'cheese', 'dairy'], ['🥛', 'milk', 'dairy'], ['🍶', 'yoghurt', 'dairy'],
  ['💧', 'water bottle', 'water'],
  ['🍩', 'donut', 'treat'], ['🍫', 'chocolate bar', 'treat'], ['🍬', 'lollies', 'treat'], ['🍟', 'chips', 'treat'], ['🧁', 'cupcake', 'treat'], ['🥤', 'fizzy drink', 'fizzy'], ['🧃', 'sugary juice box', 'fizzy'],
];

const GOALS = {
  little: [['fruit', '🍎 A fruit'], ['veg', '🥕 A vegetable'], ['water', '💧 A drink of water']],
  explorer: [['fruit', '🍎 A fruit'], ['veg', '🥕 A vegetable'], ['main', '🥪 A main food'], ['dairy', '🧀 A dairy food'], ['water', '💧 Water']],
};
const CHALLENGES = [
  { say: 'Sport day! Pack a healthy lunch with two fruits.', extra: ['fruit', '🍌 A second fruit'] },
  { say: 'Picnic day! You may add one treat.', extra: null, treatOk: true },
  { say: 'Hot day! Pack a healthy lunch with water.', extra: null },
];

export default {
  id: 'lunchbox',
  title: 'Lunchbox Builder',
  emoji: '🍱',
  bands: ['little', 'explorer', 'champion'],
  noBuddy: true, // needs the whole screen

  start(ctx) {
    const { root, band } = ctx;
    const boxes = band === 'champion' ? 3 : 2;
    let box = 0, mistakes = 0;
    next();

    function next() {
      const challenge = band === 'champion' && box > 0 ? CHALLENGES[box === 1 ? 0 : pick([1, 2])] : null;
      const goals = [...(band === 'little' ? GOALS.little : GOALS.explorer)];
      if (challenge?.extra) goals.push(challenge.extra);
      const need = goals.map(([g]) => g);
      const packed = [];
      let treats = 0;
      // The shelf: enough of each group, plus some sometimes foods.
      const groups = ['fruit', 'veg', 'main', 'dairy', 'water', 'treat', 'fizzy'];
      const per = { fruit: 3, veg: 2, main: 2, dairy: 2, water: 1, treat: band === 'little' ? 2 : 3, fizzy: 1 };
      const shelf = shuffle(groups.flatMap(g => shuffle(FOODS.filter(f => f[2] === g)).slice(0, per[g])));
      const say = challenge ? challenge.say : band === 'little'
        ? 'Pack a fruit, a vegetable and water in the lunchbox!'
        : 'Pack a healthy lunchbox! Tick off everything on the list.';

      const list = el('ul', { class: 'lunch-list' });
      const lunch = el('div', { class: 'lunchbox' });
      const shelfEl = el('div', { class: 'food-shelf' }, shelf.map(f => {
        const b = el('button', { class: 'food', 'aria-label': f[1], onclick: () => take(f, b) },
          el('span', { class: 'emoji' }, f[0]), el('span', { class: 'label' }, f[1]));
        return b;
      }));
      const doneBtn = el('button', { class: 'big-btn', onclick: check }, '✅ Packed!');
      drawList();
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(say) }, '🔊'),
          el('p', {}, say)),
        el('div', { class: 'lunch-layout' },
          el('div', { class: 'lunch-side' }, lunch, list, doneBtn),
          shelfEl));
      speak(say);

      function have(g) { return packed.filter(f => f[2] === g).length; }
      function drawList() {
        const counts = {};
        list.replaceChildren(...goals.map(([g, label]) => {
          counts[g] = (counts[g] || 0) + 1;
          const ok = have(g) >= counts[g];
          return el('li', { class: ok ? 'ok' : '' }, `${ok ? '✅' : '⬜'} ${label}`);
        }));
        lunch.replaceChildren(...packed.map(f => el('button', { class: 'pop-in', 'aria-label': `Take out the ${f[1]}`, onclick: () => putBack(f) }, f[0])));
      }

      function putBack(f) { // a full box with something missing used to leave no way on
        packed.splice(packed.indexOf(f), 1);
        if (f[2] === 'treat') treats--;
        const b = shelfEl.children[shelf.indexOf(f)];
        b.disabled = false; b.classList.remove('taken');
        sfx.pop(); drawList();
      }
      function take(f, b) {
        if (packed.length >= 7) { toast('The lunchbox is full! Tap a food in the lunchbox to take it out.', 3500); return; }
        const g = f[2];
        if (g === 'fizzy') {
          mistakes++;
          sfx.tryAgain({ q: 'Pack a healthy lunchbox', answer: 'water instead of a sugary drink' });
          wiggle(b);
          toast('Too much sugar! Water is the best drink.', 2500);
          speak('Too much sugar! Water is the best drink.');
          return;
        }
        if (g === 'treat') {
          if (!(challenge?.treatOk) || treats >= 1) {
            mistakes++;
            sfx.tryAgain({ q: 'Pack a healthy lunchbox', answer: 'a healthy food instead of a sometimes food' });
            wiggle(b);
            const line = challenge?.treatOk ? 'Only one sometimes food today!' : 'That is a sometimes food. Choose an everyday food!';
            toast(line, 2500); speak(line);
            return;
          }
          treats++;
        }
        sfx.pop();
        packed.push(f);
        b.disabled = true; b.classList.add('taken');
        drawList();
        const need2 = goals.filter(([gg]) => gg === g).length;
        if (have(g) <= need2 && need.includes(g)) sfx.right({ q: 'Pack a healthy lunchbox' });
      }

      function check() {
        const counts = {};
        const missing = goals.filter(([g]) => { counts[g] = (counts[g] || 0) + 1; return have(g) < counts[g]; });
        if (missing.length) {
          const line = `Something is missing: ${missing[0][1].replace(/^\S+ /, '').toLowerCase()}.`;
          toast(line, 2500); speak(line);
          list.classList.remove('flash'); void list.offsetWidth; list.classList.add('flash');
          return;
        }
        sfx.win(); confetti({ count: 80 });
        box++;
        speakThen('Yum! A healthy lunchbox!', 1400).then(() => {
          if (!root.isConnected) return;
          if (box < boxes) next();
          else ctx.finish(band === 'little' || mistakes <= 1 ? 3 : 2, 'You know how to eat healthy!');
        });
      }
    }
  },
};
