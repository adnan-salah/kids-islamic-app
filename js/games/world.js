/* =========================================================
   Game: World Explorer
   Teaches: science and the world: animals, the human body,
   weather and seasons, space, nature and Australia.
   Bands:
     little   - easy picture questions, 2 choices.
     explorer - level 2 questions, 3 choices.
     champion - level 2 and 3 questions, 3 choices.
   In every question, options[0] is the right answer
   (the quiz mixes them up on screen).
   ========================================================= */
import { shuffle } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

export const LEVEL1 = [
  { q: 'Which animal says moo?', options: ['🐄 Cow', '🐱 Cat'] },
  { q: 'Which animal says woof?', options: ['🐶 Dog', '🐑 Sheep'] },
  { q: 'Which one lives in the sea?', options: ['🐟 Fish', '🐶 Dog'] },
  { q: 'Which one can fly?', options: ['🐦 Bird', '🐢 Turtle'] },
  { q: 'Which animal hops?', options: ['🦘 Kangaroo', '🐄 Cow'] },
  { q: 'What do we see in the sky at night?', options: ['🌙 Moon', '🌈 Rainbow'] },
  { q: 'What do we use to see?', options: ['👀 Eyes', '👂 Ears'] },
  { q: 'What do we use to hear?', options: ['👂 Ears', '👃 Nose'] },
  { q: 'What do we use when it rains?', options: ['☂️ Umbrella', '🕶️ Sunglasses'] },
  { q: 'Which one is cold?', options: ['🧊 Ice', '🔥 Fire'] },
];

export const LEVEL2 = [
  { q: 'Where does a koala sleep?', options: ['In a gum tree', 'In the sea', 'In a cave'], pic: '🐨', why: 'Koalas live in gum trees and eat gum leaves.' },
  { q: 'What do bees make?', options: ['Honey', 'Milk', 'Bread'], pic: '🐝', why: 'Bees make honey from the nectar in flowers.' },
  { q: 'How many legs does a spider have?', options: ['8', '6', '4'], pic: '🕷️', why: 'Spiders have 8 legs.' },
  { q: 'How many legs does an insect have?', options: ['6', '8', '10'], pic: '🐞', why: 'All insects have 6 legs.' },
  { q: 'What is the biggest planet?', options: ['Jupiter', 'Earth', 'Mars'], pic: '🪐', why: 'Jupiter is the biggest planet in our solar system.' },
  { q: 'What do we call water falling from the clouds?', options: ['Rain', 'Wind', 'Sunshine'], pic: '🌧️', why: 'Rain falls from clouds when the water drops get heavy.' },
  { q: 'Which part of your body pumps blood?', options: ['Heart', 'Lungs', 'Stomach'], pic: '❤️', why: 'Your heart pumps blood all around your body.' },
  { q: 'What do we breathe with?', options: ['Lungs', 'Heart', 'Bones'], pic: '🫁', why: 'Your lungs fill with air when you breathe in.' },
  { q: 'In Australia, which month is in summer?', options: ['December', 'July', 'June'], pic: '☀️', why: 'In Australia, summer is December, January and February.' },
  { q: 'What colour do blue and yellow make?', options: ['Green', 'Purple', 'Orange'], pic: '🎨', why: 'Blue and yellow mixed together make green.' },
  { q: 'What is a baby frog called?', options: ['A tadpole', 'A puppy', 'A chick'], pic: '🐸', why: 'Frogs start life as tadpoles in the water.' },
  { q: 'What do plants need to grow?', options: ['Water and sunlight', 'Sand and wind', 'Ice and snow'], pic: '🌱', why: 'Plants need water and sunlight to grow.' },
];

export const LEVEL3 = [
  { q: 'What is the capital city of Australia?', options: ['Canberra', 'Sydney', 'Melbourne'], pic: '🇦🇺', why: 'Canberra is the capital. Parliament House is there.' },
  { q: 'How many states does Australia have?', options: ['6', '8', '5'], pic: '🗺️', why: 'Australia has 6 states and 2 main territories.' },
  { q: 'Which planet is closest to the Sun?', options: ['Mercury', 'Venus', 'Earth'], pic: '☀️', why: 'Mercury is the closest planet to the Sun.' },
  { q: 'What causes day and night?', options: ['The Earth spinning', 'The Sun turning off', 'Clouds covering the Sun'], pic: '🌍', why: 'The Earth spins around once every day, so we face the Sun and then away from it.' },
  { q: 'At what temperature does water boil?', options: ['100°C', '50°C', '0°C'], pic: '♨️', why: 'Water boils at 100 degrees Celsius.' },
  { q: 'At what temperature does water freeze?', options: ['0°C', '10°C', '100°C'], pic: '🧊', why: 'Water turns to ice at 0 degrees Celsius.' },
  { q: 'Which mammal lays eggs?', options: ['Platypus', 'Kangaroo', 'Koala'], pic: '🥚', why: 'The platypus and the echidna are mammals that lay eggs.' },
  { q: 'What gas do we need to breathe in to live?', options: ['Oxygen', 'Carbon dioxide', 'Helium'], pic: '💨', why: 'Our bodies need oxygen from the air.' },
  { q: 'Which is the largest ocean?', options: ['Pacific', 'Indian', 'Atlantic'], pic: '🌊', why: 'The Pacific Ocean is the largest ocean on Earth.' },
  { q: 'Which state is the Great Barrier Reef in?', options: ['Queensland', 'Tasmania', 'Victoria'], pic: '🐠', why: 'The Great Barrier Reef is off the coast of Queensland.' },
  { q: 'About how many bones does an adult have?', options: ['206', '26', '2,000'], pic: '🦴', why: 'An adult skeleton has 206 bones.' },
  { q: 'What do caterpillars turn into?', options: ['Butterflies', 'Spiders', 'Bees'], pic: '🐛', why: 'A caterpillar makes a cocoon and comes out as a butterfly.' },
];

const toQuiz = item => {
  const answer = item.options[0];
  return { prompt: item.q, options: item.options, answer, pic: item.pic, explain: item.why, optionClass: item.pic ? '' : 'pic-opt' };
};

export default {
  id: 'world',
  title: 'World Explorer',
  emoji: '🌏',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    let items;
    if (band === 'little') items = shuffle(LEVEL1).slice(0, 5);
    else if (band === 'explorer') items = shuffle(LEVEL2).slice(0, 8);
    else items = shuffle([...shuffle(LEVEL2).slice(0, 3), ...shuffle(LEVEL3).slice(0, 5)]);
    runQuiz(root, items.map(toQuiz), mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are a World Explorer!'));
  },
};
