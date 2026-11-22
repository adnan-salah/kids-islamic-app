/* =========================================================
   Game: Word Star
   Teaches: spelling, sentences and reading comprehension.
   Bands:
     explorer - spell 5 short words from letter tiles (picture clue).
     champion - spell 3 harder words (meaning clue), build 2 sentences,
                then read a short story and answer 2 questions.
   Australian spelling is used (neighbour, favourite).
   ========================================================= */
import { el, speak, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';
import { runQuiz } from '../quiz.js';

export const EASY = [
  ['cat', '🐱'], ['sun', '☀️'], ['moon', '🌙'], ['star', '⭐'], ['book', '📖'],
  ['fish', '🐟'], ['ball', '⚽'], ['cake', '🎂'], ['tree', '🌳'], ['duck', '🦆'],
  ['camel', '🐪'], ['apple', '🍎'], ['house', '🏠'], ['water', '💧'], ['happy', '😊'],
];

export const HARD = [
  ['honest', 'Always telling the truth.'],
  ['patient', 'Waiting calmly, without complaining.'],
  ['grateful', 'Feeling thankful.'],
  ['neighbour', 'Someone who lives next door.'],
  ['forgive', 'To let it go when someone says sorry.'],
  ['generous', 'Happy to share and give.'],
  ['journey', 'A long trip.'],
  ['believe', 'To have faith that something is true.'],
  ['library', 'A place full of books you can borrow.'],
  ['beautiful', 'Very lovely to look at.'],
  ['knowledge', 'What you learn and know.'],
  ['favourite', 'The one you like best.'],
];

export const SENTENCES = [
  'The dog ran across the big green park.',
  'Kindness is a beautiful thing.',
  'We say Bismillah before we eat.',
  'The red car went very fast.',
  'Koalas sleep in gum trees all day.',
  'I help my little sister every day.',
  'Bees make honey from flowers.',
  'We should always tell the truth.',
];

export const READING = [
  {
    text: 'Zara wanted to grow a sunflower. She planted a seed in a pot and gave it water every morning. She put the pot near a sunny window. After a few weeks, a tall yellow flower opened up. Zara was so proud!',
    questions: [
      { q: 'What did Zara want to grow?', options: ['A sunflower', 'A tomato', 'An apple tree'], answer: 'A sunflower' },
      { q: 'Why did she put the pot near the window?', options: ['So it got sunlight', 'So it stayed cold', 'So nobody saw it'], answer: 'So it got sunlight' },
    ],
  },
  {
    text: 'Leo’s soccer team was losing 2 to 1. Just before the end, Leo passed the ball to his friend Sam instead of shooting. Sam scored! The game ended in a draw, and the coach said Leo was a great team player.',
    questions: [
      { q: 'What was the score before Sam’s goal?', options: ['2 to 1', '3 to 0', '1 to 1'], answer: '2 to 1' },
      { q: 'Why did the coach praise Leo?', options: ['He passed to a team mate', 'He scored three goals', 'He ran the fastest'], answer: 'He passed to a team mate' },
    ],
  },
  {
    text: 'Hamza found a wallet on the way to the masjid. Inside was some money and a card with a name on it. Hamza gave the wallet to the imam, who gave it back to its owner. The owner smiled and made dua for Hamza.',
    questions: [
      { q: 'Where was Hamza going?', options: ['To the masjid', 'To school', 'To the park'], answer: 'To the masjid' },
      { q: 'What did Hamza do with the wallet?', options: ['He gave it to the imam', 'He kept the money', 'He threw it away'], answer: 'He gave it to the imam' },
    ],
  },
  {
    text: 'Maryam’s grandmother was sick, so Maryam made her a card. She drew flowers on it and wrote: Get well soon, Nana. I love you. Nana put the card next to her bed and said it made her feel much better.',
    questions: [
      { q: 'Who was sick?', options: ['Maryam’s grandmother', 'Maryam’s teacher', 'Maryam’s brother'], answer: 'Maryam’s grandmother' },
      { q: 'What did Maryam draw on the card?', options: ['Flowers', 'Cars', 'Fish'], answer: 'Flowers' },
    ],
  },
];

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export default {
  id: 'words',
  title: 'Word Star',
  emoji: '🌟',
  bands: ['explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    let mistakes = 0;
    const steps = band === 'champion'
      ? [...shuffle(HARD).slice(0, 3).map(w => () => spell(w[0], null, w[1])),
         ...shuffle(SENTENCES).slice(0, 2).map(s => () => sentence(s)),
         () => reading(pick(READING))]
      : shuffle(EASY).slice(0, 5).map(w => () => spell(w[0], w[1], null));
    let si = 0;
    steps[0]();

    function nextStep() {
      si++;
      if (si < steps.length) steps[si]();
      else ctx.finish(mistakes <= 2 ? 3 : 2, 'You are a Word Star!');
    }

    function progress() {
      return el('div', { class: 'dots' }, steps.map((_, i) =>
        el('span', { class: i < si ? 'dot done' : i === si ? 'dot now' : 'dot' })));
    }

    /* Spell a word by tapping letters in order. */
    function spell(word, emoji, clue) {
      const say = clue ? `Spell the word that means: ${clue}` : 'Spell the word!';
      const letters = [...word];
      const extras = band === 'champion'
        ? shuffle([...LETTERS].filter(c => !letters.includes(c))).slice(0, 3) : [];
      let at = 0;
      const slots = letters.map(() => el('span', { class: 'word-slot' }));
      const tiles = shuffle([...letters, ...extras]).map(c => {
        const t = el('button', { class: 'letter-tile', onclick: () => tap(c, t) }, c);
        return t;
      });
      root.replaceChildren(...[
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak([say, word]) }, '🔊'),
          el('p', {}, clue ? `Spell the word that means: ${clue}` : 'Spell the word!')),
        emoji ? el('div', { class: 'question-pic' }, emoji) : null,
        el('div', { class: 'word-slots' }, slots),
        el('div', { class: 'letter-tiles' }, tiles),
        progress()].filter(Boolean));
      speak([say, word]);

      function tap(c, t) {
        if (at >= letters.length || t.disabled) return;
        if (c === letters[at]) {
          sfx.tap();
          slots[at].textContent = c;
          slots[at].classList.add('filled');
          t.disabled = true;
          at++;
          if (at === letters.length) {
            sfx.right();
            const praise = pick(PRAISE);
            toast(praise);
            speak([praise, word]);
            setTimeout(nextStep, 1600);
          }
        } else {
          mistakes++;
          sfx.tryAgain();
          wiggle(t);
        }
      }
    }

    /* Build a sentence by tapping words in order. */
    function sentence(text) {
      const words = text.split(' ');
      let at = 0;
      const line = el('div', { class: 'sentence-line' });
      const tiles = shuffle(words.map((w, i) => ({ w, i }))).map(({ w, i }) => {
        const t = el('button', { class: 'word-tile', onclick: () => tap(i, t) }, w);
        return t;
      });
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Put the words in the right order.') }, '🔊'),
          el('p', {}, 'Put the words in the right order.')),
        line,
        el('div', { class: 'letter-tiles' }, tiles),
        progress());
      speak('Put the words in the right order.');

      function tap(i, t) {
        if (t.disabled) return;
        // Accept any tile with the same word, in case a word appears twice.
        if (words[i] === words[at]) {
          sfx.tap();
          line.append(el('span', { class: 'placed-word' }, words[i]));
          t.disabled = true;
          at++;
          if (at === words.length) {
            sfx.right();
            toast(pick(PRAISE));
            speak(text);
            setTimeout(nextStep, 2600);
          }
        } else {
          mistakes++;
          sfx.tryAgain();
          wiggle(t);
        }
      }
    }

    /* Read a short story, then answer questions about it. */
    function reading(item) {
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Read it to me', onclick: () => speak(item.text) }, '🔊'),
          el('p', {}, 'Read the story, then tap Ready.')),
        el('div', { class: 'story-page reading' }, el('p', {}, item.text)),
        el('div', { class: 'row' },
          el('button', { class: 'big-btn', onclick: () => {
            const qs = item.questions.map(x => ({ prompt: x.q, options: x.options, answer: x.answer, pic: '📖' }));
            runQuiz(root, qs, m => { mistakes += m; nextStep(); });
          } }, '✅ Ready')),
        progress());
      speak('Read the story, then tap Ready.');
    }
  },
};
