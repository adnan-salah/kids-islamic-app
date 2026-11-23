/* =========================================================
   Game: Wudu Steps
   Teaches: cleanliness and the order of wudu.
   Bands:
     little   - every step is shown in order; the next one glows. Tap it.
     explorer - cards are shuffled; tap them in the right order.
     champion - same, plus Bismillah at the start and a few
                "did you know" questions at the end.
   Order used (common Sunni teaching for children):
     Bismillah, hands, mouth, nose, face, arms (right first),
     head, ears, feet (right first). Each washing step is done 3 times.
   ========================================================= */
import { el, speak, sfx, toast, wiggle, shuffle, pick, PRAISE } from '../core.js';

export const STEPS = [
  { id: 'bismillah', emoji: '🤲', label: 'Say Bismillah', say: 'First, make your intention and say Bismillah.' },
  { id: 'hands',     emoji: '👐', label: 'Hands',  say: 'Wash your hands, three times.' },
  { id: 'mouth',     emoji: '👄', label: 'Mouth',  say: 'Rinse your mouth, three times.' },
  { id: 'nose',      emoji: '👃', label: 'Nose',   say: 'Rinse your nose, three times.' },
  { id: 'face',      emoji: '😊', label: 'Face',   say: 'Wash your face, three times.' },
  { id: 'arms',      emoji: '💪', label: 'Arms',   say: 'Wash your arms up to the elbows, right arm first, three times.' },
  { id: 'head',      emoji: '💆', label: 'Head',   say: 'Wipe over your head with wet hands.' },
  { id: 'ears',      emoji: '👂', label: 'Ears',   say: 'Wipe your ears.' },
  { id: 'feet',      emoji: '🦶', label: 'Feet',   say: 'Wash your feet up to the ankles, right foot first, three times.' },
];

/* Extra questions for the Champions band, asked after the order is done. */
export const QUIZ = [
  { q: 'How many times do we wash each part, like hands and face?', options: ['1 time', '3 times', '10 times'], answer: '3 times' },
  { q: 'Which side do we wash first, for arms and feet?', options: ['Right', 'Left', 'It does not matter'], answer: 'Right' },
  { q: 'Which parts do we wipe, instead of washing?', options: ['Head and ears', 'Hands and feet', 'Face and arms'], answer: 'Head and ears' },
  { q: 'Why do we make wudu?', options: ['To be clean and ready for Salah', 'To cool down', 'Only when we are dirty'], answer: 'To be clean and ready for Salah' },
];

export default {
  id: 'wudu',
  noBuddy: true, // needs the width
  title: 'Wudu Steps',
  emoji: '💧',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    // Little Stars and Explorers start at hands; Champions also place Bismillah.
    const steps = band === 'champion' ? STEPS : STEPS.slice(1);
    let next = 0;          // index of the step the child must find next
    let mistakes = 0;

    const intro = band === 'little'
      ? 'Let’s make wudu! Tap the step that is glowing.'
      : 'Put the wudu steps in the right order. What comes first?';

    const promptText = el('p', {}, intro);
    const prompt = el('div', { class: 'prompt' },
      el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(next === 0 ? intro : 'What comes next?') }, '🔊'),
      promptText,
    );

    // Slots show the steps placed so far (not used in Little Stars mode).
    const slots = steps.map((s, i) => el('div', { class: 'slot' }, String(i + 1)));
    const slotRow = band === 'little' ? null : el('div', { class: 'slots' }, slots);

    // Cards: in order for Little Stars, shuffled for everyone else.
    const order = band === 'little' ? steps : shuffle(steps);
    const cards = order.map(step => {
      const card = el('button', { class: 'card', onclick: () => choose(step, card) },
        el('span', { class: 'emoji' }, step.emoji),
        el('span', { class: 'label' }, step.label),
      );
      return card;
    });
    const cardGrid = el('div', { class: 'cards' }, cards);

    root.append(...[prompt, slotRow, cardGrid].filter(Boolean));
    speak(intro);
    highlight();

    // Little Stars: make the next correct card glow.
    function highlight() {
      if (band !== 'little') return;
      cards.forEach(c => c.classList.remove('glow'));
      cards[next]?.classList.add('glow');
    }

    function choose(step, card) {
      // Ignore taps once finished, or on a step already done.
      if (next >= steps.length || card.classList.contains('done')) return;
      if (step.id === steps[next].id) {
        sfx.right();
        speak(step.say);
        if (band === 'little') {
          card.classList.add('done');
        } else {
          card.classList.add('used');
          const slot = slots[next];
          slot.classList.add('filled');
          slot.replaceChildren(el('span', { class: 'emoji' }, step.emoji), step.label);
        }
        next++;
        highlight();
        if (next === steps.length) {
          setTimeout(() => (band === 'champion' ? quiz() : finish()), 2600);
        } else if (band !== 'little') {
          promptText.textContent = `${pick(PRAISE)} What comes next?`;
        }
      } else {
        mistakes++;
        sfx.tryAgain();
        wiggle(card);
        toast('Try again!');
      }
    }

    // Champions: 3 random "did you know" questions after the order.
    function quiz() {
      const questions = shuffle(QUIZ).slice(0, 3);
      let qi = 0;
      showQuestion();

      function showQuestion() {
        const item = questions[qi];
        root.replaceChildren();
        const qText = el('p', {}, item.q);
        root.append(
          el('div', { class: 'prompt' },
            el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(item.q) }, '🔊'),
            qText),
          el('div', { class: 'question-pic' }, '💧'),
          el('div', { class: 'options' }, shuffle(item.options).map(opt => {
            const b = el('button', { class: 'option', onclick: () => answer(opt, b) }, opt);
            return b;
          })),
        );
        speak(item.q);
      }

      function answer(opt, btn) {
        if (btn.closest('.options').dataset.locked) return; // already answered
        if (opt === questions[qi].answer) {
          btn.closest('.options').dataset.locked = '1';
          sfx.right();
          btn.classList.add('right');
          toast(pick(PRAISE));
          qi++;
          setTimeout(() => (qi < questions.length ? showQuestion() : finish()), 1200);
        } else {
          mistakes++;
          sfx.tryAgain();
          wiggle(btn);
          toast('Try again!');
        }
      }
    }

    function finish() {
      // Finishing always earns at least 2 stars. No mistakes earns 3.
      // Little Stars always get 3: they are learning, not being tested.
      const stars = band === 'little' || mistakes === 0 ? 3 : 2;
      ctx.finish(stars, 'You know how to make wudu!');
    }
  },
};
