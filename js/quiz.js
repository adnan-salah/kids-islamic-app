/* =========================================================
   quiz.js: a shared "question and answer" runner used by
   several games (letters, manners, maths, stories).

   runQuiz(root, questions, onDone)
     questions: [{
       prompt:  'Text shown at the top',
       say:     'Text read aloud (defaults to prompt)',
       pic:     'Big emoji or text shown above the options' (optional),
       picNode: an element to show instead of pic, e.g. a clock (optional),
       picClass:'extra CSS class for pic' (optional),
       options: ['A', 'B', 'C'],   // labels shown on buttons
       answer:  'A',               // the right label
       optionClass: 'CSS class for option buttons' (optional),
       explain: 'Said after a right answer' (optional),
     }]
     onDone(mistakes) is called after the last question.
   A wrong answer:
   - with hearts (older children): the right answer lights up and is
     explained, then the next question comes. The miss costs a heart.
   - without hearts (the youngest): the wrong choice fades, the right one
     gently pulses, and the child taps it. Nothing is lost.
   The youngest also get picture-first answers: a big emoji above the
   word, and counting dots under small numbers.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, pick, PRAISE, praiseFor } from './core.js';

export function runQuiz(root, questions, onDone, { shuffleOptions = true } = {}) {
  let qi = 0;
  let mistakes = 0;
  show();

  function show() {
    const q = questions[qi];
    const voice = q.say || q.prompt;
    const dots = el('div', { class: 'dots' }, questions.map((_, i) =>
      el('span', { class: i < qi ? 'dot done' : i === qi ? 'dot now' : 'dot' })));
    const box = el('div', { class: 'options' });
    const opts = shuffleOptions ? shuffle(q.options) : q.options;
    const little = document.body.dataset.band === 'little';
    const buttons = new Map();
    box.append(...opts.map(label => {
      const b = el('button', { class: `option ${q.optionClass || ''}`, onclick: () => answer(label, b) }, little ? pictureFirst(label) : label);
      buttons.set(label, b);
      return b;
    }));
    root.replaceChildren(...[
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(voice) }, '🔊'),
        el('p', {}, q.prompt)),
      q.picNode ? el('div', { class: 'question-pic' }, q.picNode)
        : q.pic ? el('div', { class: `question-pic ${q.picClass || ''}` }, q.pic) : null,
      box,
      dots,
    ].filter(Boolean));
    speak(voice);

    function answer(label, btn) {
      if (box.dataset.locked) return;
      if (label === q.answer) {
        box.dataset.locked = '1';
        sfx.right();
        btn.classList.add('right');
        const praise = praiseFor(q.prompt, q.say, q.answer, q.explain);
        toast(praise);
        // Wait for Miriam to finish before the next question starts.
        speakThen([praise, q.explain], 1500).then(() => {
          if (!box.isConnected) return; // child left the game
          qi++;
          qi < questions.length ? show() : onDone(mistakes);
        });
      } else {
        if (btn.classList.contains('wrong')) return;
        mistakes++;
        const hearts = Boolean(document.querySelector('.topbar .hearts'));
        sfx.tryAgain({ q: q.prompt, answer: q.answer });
        wiggle(btn);
        btn.classList.add('wrong');
        const rightBtn = buttons.get(q.answer);
        if (!hearts) {
          // No hearts: point at the right answer and let the child tap it.
          rightBtn?.classList.add('hint');
          toast('Try again!');
          return;
        }
        // Hearts: show and explain the right answer, then move on.
        box.dataset.locked = '1';
        rightBtn?.classList.add('right', 'shown');
        toast(`The answer is ${q.answer}`, 2600);
        speakThen(q.explain ? [q.explain] : [], 2400).then(() => {
          if (!box.isConnected) return; // out of hearts, or the child left
          qi++;
          qi < questions.length ? show() : onDone(mistakes);
        });
      }
    }
  }
}

/* For the youngest: a big picture above the word, or counting dots under a small number. */
function pictureFirst(label) {
  const text = String(label);
  const m = text.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s+(.+)$/u);
  if (m) return [el('span', { class: 'opt-pic' }, m[1]), el('span', { class: 'opt-word' }, m[2])];
  if (/^\d+$/.test(text) && +text >= 1 && +text <= 10) {
    return [el('span', { class: 'opt-num' }, text),
      el('span', { class: 'opt-dots', 'aria-hidden': 'true' }, Array.from({ length: +text }, () => el('i')))];
  }
  return text;
}

/* Stars for any quiz: finishing earns 2, no mistakes earns 3. */
export const starsFrom = (mistakes, band) => (band === 'little' || mistakes === 0 ? 3 : 2);
