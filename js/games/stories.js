/* =========================================================
   Game: Prophet Story Cards
   Teaches: stories of the Prophets (peace be upon them) and the Seerah.
   A short story told page by page and read aloud, then questions.
   No people or faces are ever shown: only scenery and objects.
   Stories follow the Quran and well-known Seerah; Quran references
   are given in comments where a line comes straight from an ayah.
   Bands:
     little   - 4 Prophet stories, 1 easy question.
     explorer - 4 Prophet stories, 2 questions.
     champion - also 2 Seerah stories, 3 questions.
   ========================================================= */
import { el, speak, sfx } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

const STORIES = [
  {
    id: 'nuh', title: 'Nuh and the Ark', emoji: '🚢',
    pages: [
      ['🌧️', 'Prophet Nuh (peace be upon him) asked his people to worship only Allah. He asked them for a very, very long time.'],
      ['🏘️', 'Most people would not listen. Only a few believed.'],
      ['🪵🚢', 'Allah told Nuh to build a big ship, called the ark.'],
      ['🐘🦒🐑', 'Nuh took the believers onto the ark, with a pair of each kind of animal.'],
      ['🌊🚢', 'A great flood came. Allah kept everyone on the ark safe.'],
    ],
    questions: [
      { prompt: 'What did Nuh build?', options: ['🚢 A big ship', '🏠 A house', '🗼 A tower'], answer: '🚢 A big ship' },
      { prompt: 'Who kept the people on the ark safe?', options: ['Allah', 'The animals', 'The rain'], answer: 'Allah' },
      // Quran 29:14: "a thousand years minus fifty"
      { prompt: 'The Quran tells us Nuh stayed with his people for…', options: ['950 years', '10 years', '50 years'], answer: '950 years' },
    ],
  },
  {
    id: 'yunus', title: 'Yunus and the Big Fish', emoji: '🐋',
    pages: [
      ['🏘️', 'Prophet Yunus (peace be upon him) left his people because they would not listen, before Allah told him to go.'],
      ['⛵🌩️', 'He got onto a boat, and a big storm came.'],
      ['🌊🐋', 'Yunus went into the sea, and a big fish swallowed him!'],
      ['🌑', 'Inside the dark fish, Yunus made dua: There is no god but You, glory be to You, I have done wrong.'], // Quran 21:87
      ['🏝️🌱', 'Allah heard him. The fish left him on the shore, and Allah made a plant grow to give him shade.'],
    ],
    questions: [
      { prompt: 'What swallowed Yunus?', options: ['🐋 A big fish', '🐘 An elephant', '🦅 A bird'], answer: '🐋 A big fish' },
      { prompt: 'What did Yunus do inside the fish?', options: ['He made dua to Allah', 'He went to sleep', 'He shouted'], answer: 'He made dua to Allah' },
      { prompt: 'What does this story teach us?', options: ['Allah always hears us when we turn to Him', 'Never go on a boat', 'Fish are dangerous'], answer: 'Allah always hears us when we turn to Him' },
    ],
  },
  {
    id: 'ibrahim', title: 'Ibrahim and the Fire', emoji: '🔥',
    pages: [
      ['🗿', 'The people of Prophet Ibrahim (peace be upon him) prayed to statues made of stone and wood.'],
      ['🗿❌', 'Ibrahim told them: these statues can’t hear you or help you. Only Allah can.'],
      ['🔨', 'One day, he broke the statues, all except the biggest one.'],
      ['🔥🔥🔥', 'The people were very angry, and threw Ibrahim into a huge fire.'],
      ['❄️🌸', 'Allah said: O fire, be cool and safe for Ibrahim! And the fire did not hurt him.'], // Quran 21:69
    ],
    questions: [
      { prompt: 'What did Allah tell the fire?', options: ['❄️ Be cool and safe', '🔥 Burn hotter', '💨 Blow away'], answer: '❄️ Be cool and safe' },
      { prompt: 'Who did Ibrahim say we should worship?', options: ['Only Allah', 'The statues', 'The sun'], answer: 'Only Allah' },
      { prompt: 'Which statue did Ibrahim leave unbroken?', options: ['The biggest one', 'The smallest one', 'None of them'], answer: 'The biggest one' },
    ],
  },
  {
    id: 'musa', title: 'Musa and the Sea', emoji: '🌊',
    pages: [
      ['👑', 'Firaun was a cruel king in Egypt who hurt the Children of Israel.'],
      ['🌙', 'Allah told Prophet Musa (peace be upon him) to lead the believers out of Egypt at night.'],
      ['🌊', 'They reached the sea, and Firaun’s army was coming behind them.'],
      ['🪵', 'Musa trusted Allah. Allah told him to strike the sea with his stick.'],
      ['🌊🛤️🌊', 'The sea split in two, with a dry path in the middle! The believers crossed safely.'],
    ],
    questions: [
      { prompt: 'What happened to the sea?', options: ['🌊🛤️🌊 It split in two', '🧊 It froze', '☀️ It dried up slowly'], answer: '🌊🛤️🌊 It split in two' },
      { prompt: 'What did Musa do when the army came?', options: ['He trusted Allah', 'He ran away alone', 'He gave up'], answer: 'He trusted Allah' },
      { prompt: 'Who was the cruel king?', options: ['Firaun', 'Musa', 'Nuh'], answer: 'Firaun' },
    ],
  },
  {
    id: 'amin', title: 'Al-Amin, the Trustworthy', emoji: '🕋', champion: true,
    pages: [
      ['🕋', 'Before he became a Prophet, Muhammad (peace be upon him) was known in Makkah as Al-Amin: the trustworthy one.'],
      ['🧱', 'When the Kaaba was being rebuilt, the tribes argued about who would put the Black Stone back in its place.'],
      ['🚪', 'They agreed that the next man to walk in would decide. It was Muhammad (peace be upon him).'],
      ['🧣', 'He put the stone on a cloth, and asked a leader from every tribe to hold the edge and lift it together.'],
      ['🤝', 'Then he placed the stone himself. Everyone was happy, and a fight was avoided.'],
    ],
    questions: [
      { prompt: 'What did the people of Makkah call him?', options: ['Al-Amin, the trustworthy', 'The strong one', 'The rich one'], answer: 'Al-Amin, the trustworthy' },
      { prompt: 'How did he stop the tribes from fighting?', options: ['Every tribe lifted the cloth together', 'He chose his own tribe', 'He left the stone on the ground'], answer: 'Every tribe lifted the cloth together' },
      { prompt: 'What can we learn from this story?', options: ['Be honest and fair, and bring people together', 'Always win arguments', 'Stay away from others'], answer: 'Be honest and fair, and bring people together' },
    ],
  },
  {
    id: 'hijrah', title: 'The Hijrah to Madinah', emoji: '🐪', champion: true,
    pages: [
      ['🌙', 'The leaders of Makkah tried to hurt the Prophet (peace be upon him) and the Muslims. Allah allowed them to move to Madinah. This journey is called the Hijrah.'],
      ['🐪🏜️', 'The Prophet left at night with his best friend, Abu Bakr.'],
      ['⛰️', 'They hid in the cave of Thawr for three days while people searched for them.'],
      ['💚', 'Abu Bakr was worried. The Prophet said: Do not be sad, Allah is with us.'], // Quran 9:40
      ['🌴🏡', 'They reached Madinah safely, and the people welcomed them with great joy.'],
    ],
    questions: [
      { prompt: 'Who travelled with the Prophet on the Hijrah?', options: ['Abu Bakr', 'Firaun', 'Nuh'], answer: 'Abu Bakr' },
      { prompt: 'Which city did they travel to?', options: ['Madinah', 'Egypt', 'Makkah'], answer: 'Madinah' },
      { prompt: 'What did the Prophet say to Abu Bakr in the cave?', options: ['Do not be sad, Allah is with us', 'Let’s go back home', 'We should hide forever'], answer: 'Do not be sad, Allah is with us' },
    ],
  },
];

export default {
  id: 'stories',
  title: 'Prophet Stories',
  emoji: '📜',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const list = STORIES.filter(s => band === 'champion' || !s.champion);
    const qCount = { little: 1, explorer: 2, champion: 3 }[band];

    // Choose a story.
    const intro = 'Pick a story to hear.';
    root.replaceChildren(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(intro) }, '🔊'),
        el('p', {}, intro)),
      el('div', { class: 'tile-grid' }, list.map(s =>
        el('button', { class: 'tile', onclick: () => { sfx.tap(); tell(s); } },
          el('span', { class: 'emoji' }, s.emoji),
          el('span', { class: 'label', style: 'font-size:1.5rem' }, s.title)))),
    );
    speak(intro);

    function tell(story) {
      let page = 0;
      draw();

      function draw() {
        const [scene, text] = story.pages[page];
        const last = page === story.pages.length - 1;
        root.replaceChildren(
          el('div', { class: 'story-page' },
            el('div', { class: 'scene' }, scene),
            el('p', {}, text),
            el('div', { class: 'dots' }, story.pages.map((_, i) =>
              el('span', { class: i < page ? 'dot done' : i === page ? 'dot now' : 'dot' })))),
          el('div', { class: 'row' },
            el('button', { class: 'big-btn secondary', onclick: () => speak(text) }, '🔊 Again'),
            page > 0 ? el('button', { class: 'big-btn secondary', onclick: () => { page--; draw(); } }, '◀ Back') : null,
            el('button', { class: 'big-btn', onclick: () => (last ? quiz() : (page++, draw())) }, last ? 'Questions ▶' : 'Next ▶')),
        );
        speak(text);
      }

      function quiz() {
        const questions = story.questions.slice(0, qCount);
        runQuiz(root, questions, mistakes =>
          ctx.finish(starsFrom(mistakes, band), `You learned the story of ${story.title}!`));
      }
    }
  },
};
