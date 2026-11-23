/* =========================================================
   Game: Corner Shop
   Teaches: using real Australian money: coins and notes, paying the
   exact amount, and (Champions) working out change.
   Tap coins and notes to put them on the counter, tap one on the
   counter to take it back, then tap Pay.
   Bands:
     little   - $1 and $2 coins, whole-dollar prices up to $5.
                The total on the counter is shown. 4 rounds.
     explorer - all coins and $5 and $10 notes, prices like $3.50.
                No total shown: count it yourself! 5 rounds.
     champion - prices like $7.85, and "give the change" rounds.
                Bonus tip when they use the fewest coins. 6 rounds.
   Amounts are kept in cents so the maths is exact.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, pick } from '../core.js';
import { confetti } from '../fun.js';

const MONEY = [
  { c: 5, label: '5c', kind: 'coin silver small' }, { c: 10, label: '10c', kind: 'coin silver' },
  { c: 20, label: '20c', kind: 'coin silver big' }, { c: 50, label: '50c', kind: 'coin silver big fifty' },
  { c: 100, label: '$1', kind: 'coin gold' }, { c: 200, label: '$2', kind: 'coin gold small' },
  { c: 500, label: '$5', kind: 'note pink' }, { c: 1000, label: '$10', kind: 'note blue' }, { c: 2000, label: '$20', kind: 'note red' },
];
const ITEMS = [['🍎', 'apple'], ['🥛', 'milk'], ['🍞', 'bread'], ['🧃', 'juice'], ['🍦', 'ice cream'], ['📒', 'notebook'], ['🖍️', 'crayons'], ['⚽', 'ball'], ['🧸', 'teddy'], ['🍌', 'bananas'], ['🧀', 'cheese'], ['🪁', 'kite'], ['🍯', 'honey'], ['🥚', 'eggs']];
export const money = c => (c % 100 === 0 ? `$${c / 100}` : c < 100 ? `${c}c` : `$${(c / 100).toFixed(2)}`);

/* The fewest coins and notes that make an amount. */
function fewest(c, allowed) {
  let n = 0;
  for (const m of [...allowed].sort((a, b) => b.c - a.c)) { n += Math.floor(c / m.c); c %= m.c; }
  return n;
}

export default {
  id: 'shop',
  title: 'Corner Shop',
  emoji: '🏪',
  bands: ['little', 'explorer', 'champion'],
  noBuddy: true, // needs the whole screen

  start(ctx) {
    const { root, band } = ctx;
    const allowed = band === 'little' ? MONEY.filter(m => m.c === 100 || m.c === 200)
      : band === 'explorer' ? MONEY.filter(m => m.c <= 1000) : MONEY;
    const rounds = { little: 4, explorer: 5, champion: 6 }[band];
    const items = shuffle(ITEMS).slice(0, rounds);
    let round = 0, mistakes = 0;
    next();

    function priceFor() {
      if (band === 'little') return 100 * (1 + Math.floor(Math.random() * 5));
      if (band === 'explorer') return 50 * (2 + Math.floor(Math.random() * 15)) + pick([0, 0, 20, 30]);
      return 5 * (60 + Math.floor(Math.random() * 300));
    }

    function next() {
      const [pic, name] = items[round];
      const price = priceFor();
      const change = band === 'champion' && round % 2 === 1;
      const paid = change ? (price < 1000 ? 1000 : 2000) : 0;
      const target = change ? paid - price : price;
      const tray = [];
      const say = change
        ? 'A customer pays with a note. Give them the right change!'
        : band === 'little' ? 'Pay for it with the coins!' : 'Pay the exact amount. Tap the coins and notes.';
      const counter = el('div', { class: 'counter' });
      const total = el('p', { class: 'counter-total' });
      const drawTray = () => {
        counter.replaceChildren(...tray.map((m, k) => el('button', { class: m.kind, onclick: () => { tray.splice(k, 1); sfx.tap(); drawTray(); } }, m.label)));
        total.textContent = `${round + 1} of ${items.length} · ` + (band === 'little' ? `On the counter: ${money(tray.reduce((t, m) => t + m.c, 0))}` : tray.length ? 'Tap a coin on the counter to take it back.' : 'The counter is empty.');
      };
      drawTray();
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(say) }, '🔊'),
          el('p', {}, say)),
        el('div', { class: 'shop-item' },
          el('span', { class: 'emoji' }, pic),
          el('div', {},
            el('div', { class: 'label' }, name),
            el('div', { class: 'price-tag' }, money(price)),
            change ? el('div', { class: 'paid-with' }, `Paid with ${money(paid)}. Change = ?`) : null)),
        counter,
        el('div', { class: 'row center shop-pay' }, total, el('button', { class: 'big-btn', onclick: pay }, change ? '🤝 Give change' : '💳 Pay')),
        el('div', { class: 'wallet' }, allowed.map(m => el('button', { class: m.kind, onclick: () => { if (tray.length < 20) { tray.push(m); sfx.pop(); drawTray(); } } }, m.label))));
      speak(say);

      function pay() {
        const sum = tray.reduce((t, m) => t + m.c, 0);
        const q = change ? `Change from ${money(paid)} for ${money(price)}` : `Pay ${money(price)}`;
        if (sum !== target) {
          mistakes++;
          sfx.tryAgain({ q, answer: money(target) });
          wiggle(counter);
          const line = sum < target ? 'Not enough yet. Add some more!' : 'That is too much. Take some back!';
          toast(`${line} (${money(sum)})`, 2500);
          speak(line);
          return;
        }
        sfx.right({ q });
        confetti({ count: 50 });
        const best = fewest(target, allowed);
        const line = band === 'champion' && tray.length > best
          ? `Right! Tip: you could do it with just ${best}.`
          : change ? 'Right change! Thank you!' : 'Paid! Thank you!';
        toast(line, 2200);
        speakThen(line.startsWith('Right! Tip') ? 'Right! You could use fewer coins next time.' : line, 1400).then(() => {
          if (!root.isConnected) return;
          round++;
          if (round < items.length) next();
          else ctx.finish(band === 'little' || mistakes === 0 ? 3 : 2, 'You are a money master!');
        });
      }
    }
  },
};
