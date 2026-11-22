/* =========================================================
   Game: Arabic Letter Match
   Teaches: the 28 Arabic letters, the first step to reading the Quran.
   Bands:
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

export default {
  id: 'letters',
  title: 'Letter Match',
  emoji: '🔤',
  bands: ['little', 'explorer'],

  start(ctx) {
    const { root, band } = ctx;
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
