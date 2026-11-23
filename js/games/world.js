/* =========================================================
   Game: Science Lab
   Teaches: science: animals, the human body, weather and seasons,
   space, materials, forces, nature and Australia.
   Bands:
     little   - easy picture questions, 2 choices.
     explorer - level 2 and some level 3 questions (Year 2-4).
     champion - level 4 and level 5 questions (Year 5-6).
   Each child gets questions they have not seen first (fresh.js).
   In every question, options[0] is the right answer
   (the quiz mixes them up on screen).
   ========================================================= */
import { shuffle } from '../core.js';
import { freshPick } from '../fresh.js';
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
  { q: 'Which animal is a mammal?', options: ['Dolphin', 'Shark', 'Octopus'], pic: '🐬', why: 'Dolphins breathe air and feed their babies milk, so they are mammals.' },
  { q: 'What do caterpillars eat?', options: ['Leaves', 'Rocks', 'Fish'], pic: '🐛', why: 'Caterpillars munch on leaves so they can grow.' },
  { q: 'Which sense do we use to smell?', options: ['Nose', 'Ears', 'Hands'], pic: '👃', why: 'We smell with our nose.' },
  { q: 'What is ice made of?', options: ['Frozen water', 'Frozen milk', 'Glass'], pic: '🧊', why: 'Ice is water that has frozen solid.' },
  { q: 'What does a thermometer measure?', options: ['How hot or cold it is', 'How long something is', 'How heavy something is'], pic: '🌡️', why: 'A thermometer measures temperature.' },
  { q: 'Which animal can change colour to hide?', options: ['Chameleon', 'Elephant', 'Horse'], pic: '🦎', why: 'Chameleons change colour to blend in.' },
  { q: 'Where do fish breathe from?', options: ['Gills', 'Lungs', 'Ears'], pic: '🐟', why: 'Fish take oxygen from the water with their gills.' },
  { q: 'What do seeds grow into?', options: ['Plants', 'Rocks', 'Animals'], pic: '🌱', why: 'A seed grows roots and a shoot, and becomes a plant.' },
  { q: 'Which season comes after winter?', options: ['Spring', 'Summer', 'Autumn'], pic: '🌸', why: 'Spring comes after winter. Flowers start to bloom.' },
  { q: 'What helps a magnet stick to the fridge?', options: ['The fridge door has metal', 'Glue', 'The fridge is cold'], pic: '🧲', why: 'Magnets stick to some metals, like steel.' },
  { q: 'Which baby animal is a joey?', options: ['A baby kangaroo', 'A baby cow', 'A baby duck'], pic: '🦘', why: 'Baby kangaroos are called joeys. They live in their mum\'s pouch.' },
  { q: 'What protects your brain?', options: ['Your skull', 'Your hair', 'Your skin'], pic: '💀', why: 'Your skull is a strong bone that protects your brain.' },
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
  { q: 'Which part of a plant takes in water from the soil?', options: ['The roots', 'The petals', 'The leaves'], pic: '🌿', why: 'Roots soak up water and hold the plant in the ground.' },
  { q: 'What is the hottest planet?', options: ['Venus', 'Mercury', 'Mars'], pic: '🔥', why: 'Venus is hottest because its thick clouds trap the heat.' },
  { q: 'What do we call an animal that eats only plants?', options: ['A herbivore', 'A carnivore', 'An omnivore'], pic: '🦒', why: 'Herbivores, like giraffes, eat only plants.' },
  { q: 'What do we call an animal that eats only meat?', options: ['A carnivore', 'A herbivore', 'A producer'], pic: '🦁', why: 'Carnivores, like lions, eat meat.' },
  { q: 'Which of these is a liquid?', options: ['Juice', 'A brick', 'Steam'], pic: '🧃', why: 'Liquids pour and take the shape of their cup.' },
  { q: 'Which of these is a gas?', options: ['Steam', 'Ice', 'Butter'], pic: '♨️', why: 'Steam is water as a gas.' },
  { q: 'What makes a shadow?', options: ['Something blocking the light', 'Rain', 'Wind'], pic: '🔦', why: 'When an object blocks light, it makes a dark shadow behind it.' },
  { q: 'Why do we have seasons?', options: ['The Earth is tilted', 'The Sun gets bigger', 'The Moon gets closer'], pic: '🌏', why: 'The Earth is tilted, so each half gets more sunlight at different times of year.' },
  { q: 'Which animal is an amphibian?', options: ['Frog', 'Snake', 'Eagle'], pic: '🐸', why: 'Amphibians, like frogs, live both in water and on land.' },
  { q: 'What does a compass needle point to?', options: ['North', 'The Sun', 'The ground'], pic: '🧭', why: 'A compass needle is a magnet that points north.' },
  { q: 'Which muscle never stops working?', options: ['Your heart', 'Your leg muscle', 'Your arm muscle'], pic: '❤️', why: 'Your heart is a muscle that beats all day and night.' },
  { q: 'What is the closest star to Earth?', options: ['The Sun', 'The North Star', 'The Moon'], pic: '☀️', why: 'The Sun is a star, and it is the closest one to us.' },
  { q: 'Which material is waterproof?', options: ['Plastic', 'Paper', 'Cotton'], pic: '☔', why: 'Water cannot soak through plastic, so it is waterproof.' },
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

/* More Year 5-6 science for Champions. */
export const LEVEL5 = [
  { q: 'What is the centre of an atom called?', options: ['The nucleus', 'The shell', 'The orbit'], pic: '⚛️', why: 'Protons and neutrons sit in the nucleus at the centre of an atom.' },
  { q: 'Which gas do plants give out that we breathe in?', options: ['Oxygen', 'Carbon dioxide', 'Steam'], pic: '🌳', why: 'Plants give out oxygen when they make their food.' },
  { q: 'What is a mixture of salt and water called?', options: ['A solution', 'A solid', 'A magnet'], pic: '🧂', why: 'The salt dissolves into the water to make a solution.' },
  { q: 'How can you get the salt back out of salty water?', options: ['Let the water evaporate', 'Freeze it', 'Shake it'], pic: '☀️', why: 'When the water evaporates, the salt is left behind.' },
  { q: 'Which change can NOT be reversed?', options: ['Baking a cake', 'Melting ice', 'Freezing juice'], pic: '🎂', why: 'Baking changes the ingredients into something new, so it cannot be undone.' },
  { q: 'What does a complete circuit need to light a globe?', options: ['A battery, wires and a globe joined in a loop', 'Only a globe', 'A battery and a plastic straw'], pic: '💡', why: 'Electricity flows only when the loop is complete.' },
  { q: 'Which planet has the biggest rings?', options: ['Saturn', 'Mars', 'Mercury'], pic: '🪐', why: 'Saturn\'s rings are made of ice and rock.' },
  { q: 'How long does the Moon take to go around the Earth?', options: ['About a month', 'One day', 'One year'], pic: '🌕', why: 'The Moon takes about 27 days to orbit the Earth.' },
  { q: 'What causes earthquakes?', options: ['Moving plates in the Earth\'s crust', 'Strong winds', 'Heavy rain'], pic: '🌋', why: 'The Earth\'s crust is made of plates that slowly move and sometimes slip.' },
  { q: 'Which layer of the Earth do we live on?', options: ['The crust', 'The core', 'The mantle'], pic: '🌍', why: 'The crust is the thin rocky outside layer.' },
  { q: 'What is a group of the same animals living in one place called?', options: ['A population', 'A planet', 'A solution'], pic: '🐧', why: 'For example, all the penguins on one island are a population.' },
  { q: 'Which organ cleans your blood?', options: ['The kidneys', 'The lungs', 'The stomach'], pic: '🫘', why: 'Your kidneys filter waste out of your blood.' },
  { q: 'Where does digestion start?', options: ['In your mouth', 'In your feet', 'In your lungs'], pic: '👄', why: 'Chewing and saliva start breaking food down in your mouth.' },
  { q: 'Which is the best conductor of heat?', options: ['A metal spoon', 'A wooden spoon', 'A plastic spoon'], pic: '🥄', why: 'Metals let heat travel through them quickly.' },
  { q: 'Why does a metal bridge have small gaps in it?', options: ['Metal expands when it is hot', 'To let rain through', 'To save metal'], pic: '🌉', why: 'Heat makes metal grow a little, so the gaps stop it bending.' },
  { q: 'What is the name for animals with a backbone?', options: ['Vertebrates', 'Invertebrates', 'Insects'], pic: '🦴', why: 'Fish, birds, reptiles, amphibians and mammals all have backbones.' },
  { q: 'Which of these is an invertebrate?', options: ['Jellyfish', 'Shark', 'Crocodile'], pic: '🪼', why: 'Jellyfish have no backbone at all.' },
  { q: 'Light bends when it goes from air into water. This is called…', options: ['Refraction', 'Reflection', 'Evaporation'], pic: '🥤', why: 'That is why a straw looks bent in a glass of water.' },
  { q: 'Light bouncing off a mirror is called…', options: ['Reflection', 'Refraction', 'Condensation'], pic: '🪞', why: 'Mirrors reflect light, so you can see yourself.' },
  { q: 'Which part of a flower makes seeds?', options: ['The flower’s ovary, after pollination', 'The roots', 'The stem'], pic: '🌺', why: 'After pollen reaches the flower, seeds form inside it.' },
  { q: 'Which animals help plants by carrying pollen?', options: ['Bees', 'Worms', 'Fish'], pic: '🐝', why: 'Bees carry pollen from flower to flower.' },
  { q: 'Which way does water flow in a river?', options: ['Downhill, towards the sea', 'Uphill', 'Round in circles'], pic: '🏞️', why: 'Gravity pulls river water downhill to the sea.' },
  { q: 'What is the water cycle?', options: ['Water evaporating, forming clouds and falling as rain again', 'Riding a bike in the rain', 'Water staying in one place'], pic: '🌧️', why: 'The same water goes round and round between the sea, the sky and the land.' },
  { q: 'Which gas makes up most of the air?', options: ['Nitrogen', 'Oxygen', 'Carbon dioxide'], pic: '💨', why: 'About four fifths of the air is nitrogen.' },
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
    const { root, band, child } = ctx;
    const pickFrom = (key, list, n) => freshPick(child, `world-${key}`, list, n);
    let items;
    // About one year ahead: Explorers get Year 2-3 and some Year 4 science,
    // Champions get Year 4 and Year 5-6 science.
    // Explorers and Champions have separate banks, so brothers and sisters get different questions.
    if (band === 'little') items = pickFrom(1, LEVEL1, 6); // picture answers, as Little Stars can't read yet
    else if (band === 'explorer') items = shuffle([...pickFrom(2, LEVEL2, 6), ...pickFrom(3, LEVEL3, 4)]);
    else items = shuffle([...pickFrom(4, LEVEL4, 6), ...pickFrom(5, LEVEL5, 6)]);
    runQuiz(root, items.map(toQuiz), mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are a World Explorer!'));
  },
};
