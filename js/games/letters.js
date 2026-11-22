/* =========================================================
   Game: Arabic Letter Match
   Teaches: the 28 Arabic letters, the first step to reading the Quran.
   Bands:
     champion - read letters with short vowels (fatha, kasra, damma).
     little   - "Find the same shape": match a letter to its twin.
     explorer - see a letter, pick its name; then see a name, pick the letter.
   Letter names use simple English spellings children are usually taught.
   ========================================================= */
import { shuffle } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

export const LETTERS = [
  ['ا', 'Alif'], ['ب', 'Baa'], ['ت', 'Taa'], ['ث', 'Thaa'], ['ج', 'Jeem'],
  ['ح', 'Ḥaa'], ['خ', 'Khaa'], ['د', 'Daal'], ['ذ', 'Dhaal'], ['ر', 'Raa'],
  ['ز', 'Zay'], ['س', 'Seen'], ['ش', 'Sheen'], ['ص', 'Ṣaad'], ['ض', 'Ḍaad'],
  ['ط', 'Ṭaa'], ['ظ', 'Ẓaa'], ['ع', 'ʿAyn'], ['غ', 'Ghayn'], ['ف', 'Faa'],
  ['ق', 'Qaaf'], ['ك', 'Kaaf'], ['ل', 'Laam'], ['م', 'Meem'], ['ن', 'Noon'],
  ['ه', 'Haa'], ['و', 'Waw'], ['ي', 'Yaa'],
].map(([char, name]) => ({ char, name }));

/* Pick wrong options that don't look or sound too alike, so it stays fair. */
function distractors(letter, count) {
  // "Ṭaa" and "Taa" (or "Ḥaa" and "Haa") count as the same sound here.
  const plain = s => s.normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase();
  const similarName = l => plain(l.name) === plain(letter.name);
  return shuffle(LETTERS.filter(l => l !== letter && !similarName(l))).slice(0, count);
}

/* Champions: the short vowels (harakat), the next step to reading Quran.
   Fatha = a, kasra = i, damma = u. Letters chosen have clear sounds. */
const HARAKAT = [
  { mark: '\u064E', name: 'fatha', v: 'a' },
  { mark: '\u0650', name: 'kasra', v: 'i' },
  { mark: '\u064F', name: 'damma', v: 'u' },
];
const SOUNDS = { 'ب': 'b', 'ت': 't', 'د': 'd', 'ر': 'r', 'ز': 'z', 'س': 's', 'ف': 'f', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ج': 'j', 'ش': 'sh' };
function harakatQuestions() {
  const letters = shuffle(Object.keys(SOUNDS)).slice(0, 10);
  return letters.map((c, i) => {
    const h = HARAKAT[i % 3];
    const say = SOUNDS[c] + h.v;
    if (i % 2 === 0) {
      return {
        prompt: 'How do you read this?',
        pic: c + h.mark, picClass: 'big-letter',
        options: HARAKAT.map(x => SOUNDS[c] + x.v),
        answer: say,
        explain: `The ${h.name} makes the “${h.v}” sound: ${say}.`,
      };
    }
    return {
      prompt: `Which one says “${say}”?`,
      options: HARAKAT.map(x => c + x.mark),
      optionClass: 'letter',
      answer: c + h.mark,
      explain: `The ${h.name} makes the “${h.v}” sound.`,
    };
  });
}

export default {
  id: 'letters',
  title: 'Letter Match',
  emoji: '🔤',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    if (band === 'champion') {
      runQuiz(root, harakatQuestions(), mistakes =>
        ctx.finish(starsFrom(mistakes, band), 'You can read Arabic sounds!'));
      return;
    }
    const picks = shuffle(LETTERS).slice(0, band === 'little' ? 6 : 8);

    const questions = picks.map((letter, n) => {
      if (band === 'little') {
        return {
          prompt: 'Find the same shape!',
          pic: letter.char, picClass: 'big-letter',
          options: [letter, ...distractors(letter, 2)].map(l => l.char),
          optionClass: 'letter',
          answer: letter.char,
          explain: `That is ${letter.name}.`,
        };
      }
      // Explorers: first half letter -> name, second half name -> letter.
      if (n < picks.length / 2) {
        return {
          prompt: 'What is this letter called?',
          pic: letter.char, picClass: 'big-letter',
          options: [letter, ...distractors(letter, 2)].map(l => l.name),
          answer: letter.name,
        };
      }
      return {
        prompt: `Find the letter ${letter.name}.`,
        options: [letter, ...distractors(letter, 2)].map(l => l.char),
        optionClass: 'letter',
        answer: letter.char,
      };
    });

    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You know your Arabic letters!'));
  },
};
