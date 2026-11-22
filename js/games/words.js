/* =========================================================
   Game: Word Star
   Teaches: spelling, sentences and reading comprehension.
   Bands:
     explorer - (Year 2-3) spell 3 two-syllable words (picture clue),
                build a sentence, then read a short story and answer 2 questions.
     champion - (Year 5) spell 4 tricky words (meaning clue, extra letters),
                build 2 longer sentences, then read a story and answer
                2 questions that need thinking (why, what does it mean).
   Australian spelling is used (neighbour, favourite).
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';
import { runQuiz } from '../quiz.js';

export const EASY = [
  ['rabbit', '🐰'], ['pencil', '✏️'], ['rocket', '🚀'], ['monkey', '🐒'], ['turtle', '🐢'],
  ['garden', '🌻'], ['window', '🪟'], ['planet', '🪐'], ['basket', '🧺'], ['kitten', '🐱'],
  ['dragon', '🐉'], ['camel', '🐪'], ['spider', '🕷️'], ['carrot', '🥕'], ['button', '🔘'],
  ['thunder', '⛈️'], ['chicken', '🐔'], ['football', '⚽'], ['rainbow', '🌈'], ['teacher', '🧑‍🏫'],
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
  ['necessary', 'Needed; you must have it.'],
  ['environment', 'The world around us: air, water, land, plants and animals.'],
  ['immediately', 'Straight away, right now.'],
  ['separate', 'To keep apart.'],
  ['temperature', 'How hot or cold something is.'],
  ['curious', 'Wanting to find out about things.'],
  ['ancient', 'Very, very old.'],
  ['brilliant', 'Very bright, or very clever.'],
  ['experiment', 'A test to find out what happens.'],
  ['continent', 'One of the seven big areas of land on Earth.'],
];
/* Year 5 words for Champions (leaves out the first few easier ones). */
const CHAMPION_WORDS = () => HARD.slice(4);

/* Short sentences for Explorers. */
export const SHORT_SENTENCES = [
  'The cat sat on the warm mat.',
  'My brother likes to play soccer.',
  'We read a book every night.',
  'The bird flew over the tall tree.',
  'Koalas eat gum leaves.',
  'I can count to one hundred.',
];

export const SENTENCES = [
  'After school we went to the beach and built a huge sandcastle.',
  'The astronauts looked down at the blue planet from their spaceship.',
  'Before the race, the drivers checked their tyres carefully.',
  'My grandmother tells the most wonderful stories about her childhood.',
  'The dog ran across the big green park.',
  'Kindness is a beautiful thing.',
  'We say Bismillah before we eat.',
  'The red car went very fast.',
  'Koalas sleep in gum trees all day.',
  'I help my little sister every day.',
  'Bees make honey from flowers.',
  'We should always tell the truth.',
];

/* Longer stories for Champions, with questions that need thinking. */
export const READING_HARD = [
  {
    text: 'The wind howled as Idris climbed the last rocky ridge. His legs ached and his water bottle was almost empty, but he could see the hut at the top. Grandpa had promised the view would be worth it. When Idris finally stood at the summit and saw the valley glowing gold in the sunset, he forgot all about his tired legs.',
    questions: [
      { q: 'How did Idris feel at the end?', options: ['Amazed and happy', 'Angry and bored', 'Scared and lost'], answer: 'Amazed and happy' },
      { q: 'What does “summit” most likely mean?', options: ['The top of a mountain', 'A kind of hut', 'A deep valley'], answer: 'The top of a mountain' },
    ],
  },
  {
    text: 'Every Saturday, Amina’s team trained at the oval even when it rained. Their coach said, “Champions are made when nobody is watching.” At the grand final, the score was tied and the rain was pouring. Amina’s team kept running hard while the other team slowed down. They won by one goal.',
    questions: [
      { q: 'Why did Amina’s team win?', options: ['They had trained hard in the rain', 'The other team did not turn up', 'The coach scored a goal'], answer: 'They had trained hard in the rain' },
      { q: 'What did the coach mean?', options: ['Practice you do on your own makes you great', 'Nobody should watch the game', 'Only play when people are watching'], answer: 'Practice you do on your own makes you great' },
    ],
  },
  {
    text: 'Long ago, scholars in Baghdad built a great library called the House of Wisdom. People came from far away to translate books about the stars, medicine and mathematics. Many ideas we use today, like the word “algebra”, came from the work of Muslim scholars there.',
    questions: [
      { q: 'What was the House of Wisdom?', options: ['A great library', 'A royal palace', 'A big market'], answer: 'A great library' },
      { q: 'Which word comes from the scholars of Baghdad?', options: ['Algebra', 'Football', 'Kangaroo'], answer: 'Algebra' },
    ],
  },
  {
    text: 'Leila noticed that the plants on her windowsill leaned towards the glass. She turned the pots around, and a few days later they were leaning towards the window again. Leila wrote in her notebook: plants grow towards the light.',
    questions: [
      { q: 'Why did the plants lean towards the window?', options: ['To get more light', 'Because the pots were heavy', 'Because it was windy'], answer: 'To get more light' },
      { q: 'What kind of person is Leila?', options: ['Curious, like a scientist', 'Lazy and careless', 'Angry and grumpy'], answer: 'Curious, like a scientist' },
    ],
  },
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
      ? [...shuffle(CHAMPION_WORDS()).slice(0, 4).map(w => () => spell(w[0], null, w[1])),
         ...shuffle(SENTENCES).slice(0, 2).map(s => () => sentence(s)),
         () => reading(pick(READING_HARD))]
      : [...shuffle(EASY).slice(0, 3).map(w => () => spell(w[0], w[1], null)),
         () => sentence(pick(SHORT_SENTENCES)),
         () => reading(pick(READING))];
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
        ? shuffle([...LETTERS].filter(c => !letters.includes(c))).slice(0, 4)
        : shuffle([...LETTERS].filter(c => !letters.includes(c))).slice(0, 2);
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
            speakThen([praise, word], 1600).then(() => { if (root.isConnected) nextStep(); });
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
            speakThen(text, 1600).then(() => { if (root.isConnected) nextStep(); });
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
