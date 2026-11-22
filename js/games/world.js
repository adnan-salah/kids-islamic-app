/* =========================================================
   Game: Science Lab
   Teaches: science: animals, the human body, weather and seasons,
   space, materials, forces, nature and Australia.
   Bands:
     little   - easy picture questions, 2 choices.
     explorer - level 2 and some level 3 questions (Year 2-4).
     champion - level 3 and level 4 questions (Year 4-6).
   In every question, options[0] is the right answer
   (the quiz mixes them up on screen).
   ========================================================= */
import { shuffle } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

export const LEVEL1 = [
  { q: 'Which animal says moo?', options: ['🐄 Cow', '🐱 Cat'] },
  { q: 'Which one is a circle?', options: ['🔵 Circle', '🟥 Square'] },
  { q: 'Which one is a triangle?', options: ['🔺 Triangle', '⭐ Star'] },
  { q: 'Which one is big?', options: ['🐘 Elephant', '🐭 Mouse'] },
  { q: 'Which one grows on a tree?', options: ['🍎 Apple', '🥚 Egg'] },
  { q: 'Which baby animal is a chick?', options: ['🐤 Chick', '🐶 Puppy'] },
  { q: 'What do we wear on our feet?', options: ['👟 Shoes', '🧢 Cap'] },
  { q: 'Which one is yellow?', options: ['🍌 Banana', '🍇 Grapes'] },
  { q: 'Which one do we see in the day?', options: ['☀️ Sun', '🌙 Moon'] },
  { q: 'Which animal lives in the ocean?', options: ['🐳 Whale', '🦁 Lion'] },
  { q: 'Which one is hot?', options: ['☕ Hot tea', '🍦 Ice cream'] },
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

/* Year 5-6 science for Champions. */
export const LEVEL4 = [
  { q: 'What are the three states of matter?', options: ['Solid, liquid, gas', 'Hot, warm, cold', 'Rock, water, air'], pic: '🧪', why: 'Ice is a solid, water is a liquid, and steam is a gas.' },
  { q: 'When water turns into a gas, it is called…', options: ['Evaporation', 'Freezing', 'Melting'], pic: '♨️', why: 'Puddles dry up because the water evaporates.' },
  { q: 'When water vapour cools and turns back into drops, it is called…', options: ['Condensation', 'Evaporation', 'Erosion'], pic: '💧', why: 'That is why a cold glass gets wet on the outside.' },
  { q: 'What do plants take in from the air to make their food?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen'], pic: '🌿', why: 'Plants use carbon dioxide, water and sunlight to make food. This is photosynthesis.' },
  { q: 'In a food chain, grass → rabbit → fox, what is the rabbit?', options: ['A herbivore (plant eater)', 'A producer', 'A carnivore (meat eater)'], pic: '🐇', why: 'The rabbit eats plants, and the fox eats the rabbit.' },
  { q: 'Which force pulls things down towards the Earth?', options: ['Gravity', 'Magnetism', 'Friction'], pic: '🍎', why: 'Gravity makes things fall when you drop them.' },
  { q: 'Which force slows down a ball rolling on grass?', options: ['Friction', 'Gravity', 'Electricity'], pic: '⚽', why: 'Friction happens when two surfaces rub together.' },
  { q: 'Which material lets electricity flow through it?', options: ['Copper wire', 'Plastic', 'Wood'], pic: '🔌', why: 'Metals like copper are conductors. Plastic is an insulator.' },
  { q: 'Which material will a magnet pick up?', options: ['An iron nail', 'A plastic spoon', 'A rubber band'], pic: '🧲', why: 'Magnets attract iron and steel.' },
  { q: 'How long does it take the Earth to go once around the Sun?', options: ['About 365 days', 'One day', 'One month'], pic: '🌍', why: 'That is one year. The Earth spins once each day.' },
  { q: 'Why does the Moon seem to change shape?', options: ['We see different parts of it lit by the Sun', 'It shrinks and grows', 'Clouds cover it'], pic: '🌗', why: 'These shapes are called the phases of the Moon.' },
  { q: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Saturn'], pic: '🔴' },
  { q: 'How many planets are in our solar system?', options: ['8', '9', '12'], pic: '🪐' },
  { q: 'What is the Sun?', options: ['A star', 'A planet', 'A moon'], pic: '☀️', why: 'The Sun is our closest star.' },
  { q: 'Which part of the body controls everything you do?', options: ['The brain', 'The stomach', 'The lungs'], pic: '🧠' },
  { q: 'What carries blood away from the heart?', options: ['Arteries', 'Bones', 'Muscles'], pic: '❤️', why: 'Arteries carry blood out. Veins bring it back.' },
  { q: 'Which animal group has feathers?', options: ['Birds', 'Reptiles', 'Mammals'], pic: '🪶' },
  { q: 'Animals that are awake at night are called…', options: ['Nocturnal', 'Herbivores', 'Mammals'], pic: '🦉', why: 'Possums and owls are nocturnal.' },
  { q: 'What is it called when rock is slowly worn away by wind and water?', options: ['Erosion', 'Evaporation', 'Pollution'], pic: '🏜️', why: 'Erosion shaped places like Uluru over millions of years.' },
  { q: 'Which of these is a renewable energy source?', options: ['Solar power', 'Coal', 'Petrol'], pic: '🔆', why: 'Sunlight will not run out, so it is renewable.' },
  { q: 'Light travels in…', options: ['Straight lines', 'Circles', 'Zig-zags only'], pic: '🔦', why: 'That is why shadows form.' },
  { q: 'Sound is made by things that…', options: ['Vibrate', 'Shine', 'Melt'], pic: '🥁', why: 'A drum skin vibrates when you hit it.' },
  { q: 'An animal\'s special feature that helps it survive is called an…', options: ['Adaptation', 'Habitat', 'Experiment'], pic: '🐪', why: 'A camel\'s hump storing fat is an adaptation for the desert.' },
  { q: 'Which is a fair test? Testing which paper towel soaks up most water by…', options: ['Using the same amount of water each time', 'Using more water for one towel', 'Changing towels and water together'], pic: '🔬', why: 'In a fair test, you only change one thing.' },
];

const toQuiz = item => {
  const answer = item.options[0];
  return { prompt: item.q, options: item.options, answer, pic: item.pic, explain: item.why, optionClass: item.pic ? '' : 'pic-opt' };
};

export default {
  id: 'world',
  title: 'Science Lab',
  emoji: '🔬',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    let items;
    // About one year ahead: Explorers get Year 2-3 and some Year 4 science,
    // Champions get Year 4 and Year 5-6 science.
    if (band === 'little') items = shuffle(LEVEL1).slice(0, 6); // picture answers, as Little Stars can't read yet
    else if (band === 'explorer') items = shuffle([...shuffle(LEVEL2).slice(0, 6), ...shuffle(LEVEL3).slice(0, 4)]);
    else items = shuffle([...shuffle(LEVEL3).slice(0, 4), ...shuffle(LEVEL4).slice(0, 8)]);
    runQuiz(root, items.map(toQuiz), mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are a World Explorer!'));
  },
};
