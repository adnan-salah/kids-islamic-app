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
   Wrong answers never end the game: the child just tries again.
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
    box.append(...opts.map(label => {
      const b = el('button', { class: `option ${q.optionClass || ''}`, onclick: () => answer(label, b) }, label);
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
        mistakes++;
        sfx.tryAgain({ answer: q.answer });
        wiggle(btn);
        toast('Try again!');
      }
    }
  }
}

/* Stars for any quiz: finishing earns 2, no mistakes earns 3. */
export const starsFrom = (mistakes, band) => (band === 'little' || mistakes === 0 ? 3 : 2);
