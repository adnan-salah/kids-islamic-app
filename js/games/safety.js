/* =========================================================
   Game: Safety Smart
   Teaches: staying safe in Australia: 000, road and car safety,
   water and sun safety, fire, strangers, online safety, medicine,
   electricity and the kitchen.
   Bands:
     little   - 2 choices, simple everyday safety. 5 questions.
     explorer - 3 choices. 8 questions.
     champion - 3 choices, harder real-life situations. 10 questions.
   options[0] is the right answer. Each child gets questions they
   have not seen lately first.
   ========================================================= */
import { runQuiz, starsFrom } from '../quiz.js';
import { freshPick } from '../fresh.js';

export const SAFETY = {
  little: [
    { pic: '🚗', q: 'Before we cross the road, we…', options: ['Hold a grown-up’s hand', 'Run across fast'], why: 'Always hold a grown-up’s hand near roads.' },
    { pic: '🔥', q: 'The stove is hot. What do we do?', options: ['Stay away', 'Touch it'], why: 'Hot things can burn us. Stay away.' },
    { pic: '☀️', q: 'It is sunny outside. What do we put on?', options: ['A hat', 'A scarf'], why: 'A hat keeps the sun off your face.' },
    { pic: '🏊', q: 'Can we go in the pool by ourselves?', options: ['No, only with a grown-up', 'Yes, any time'], why: 'Only swim when a grown-up is watching.' },
    { pic: '💊', q: 'You find some pills. What do you do?', options: ['Give them to a grown-up', 'Eat them'], why: 'Medicine is only from a grown-up.' },
    { pic: '🔌', q: 'Can we play with power points?', options: ['No, never', 'Yes'], why: 'Power points can hurt us. Never touch them.' },
    { pic: '🚙', q: 'In the car, we always…', options: ['Wear a seatbelt', 'Stand up'], why: 'Seatbelts keep us safe in the car.' },
    { pic: '🔪', q: 'Is a sharp knife a toy?', options: ['No', 'Yes'], why: 'Knives are sharp. Only grown-ups use them.' },
    { pic: '🙋', q: 'You can’t find Mama at the shops. Who can you ask for help?', options: ['A shop worker', 'Nobody'], why: 'A shop worker can help you find your family.' },
    { pic: '🐶', q: 'You see a dog you don’t know. What do you do?', options: ['Ask the owner first', 'Grab it'], why: 'Always ask before you pat a dog.' },
  ],
  explorer: [
    { pic: '📞', q: 'What number do we call in an emergency in Australia?', options: ['000', '123', '911'], why: 'In Australia, triple zero (000) is for police, fire and ambulance.' },
    { pic: '🚸', q: 'Where is the safest place to cross the road?', options: ['At a pedestrian crossing', 'Between parked cars', 'On a bend'], why: 'Crossings and lights are the safest places to cross.' },
    { pic: '🧴', q: 'What do we do to stay sun safe?', options: ['Slip, slop, slap: shirt, sunscreen and hat', 'Stay out all day with no hat', 'Only wear sunglasses'], why: 'Slip on a shirt, slop on sunscreen, slap on a hat!' },
    { pic: '🔥', q: 'Your clothes catch fire. What do you do?', options: ['Stop, drop and roll', 'Run around', 'Hide under the bed'], why: 'Stop, drop and roll puts the flames out.' },
    { pic: '🌊', q: 'At the beach, where should you swim?', options: ['Between the red and yellow flags', 'Where nobody else is', 'Near the rocks'], why: 'Lifesavers watch the area between the red and yellow flags.' },
    { pic: '🚲', q: 'What must you wear when riding a bike?', options: ['A helmet', 'Thongs', 'Headphones'], why: 'In Australia, it is the law to wear a helmet on a bike.' },
    { pic: '👤', q: 'A stranger offers you lollies to come with them. What do you do?', options: ['Say no, get away and tell a grown-up', 'Go with them', 'Take the lollies and stay'], why: 'Never go anywhere with a stranger.' },
    { pic: '💻', q: 'A game online asks for your home address. What do you do?', options: ['Don’t type it, ask a parent', 'Type it in', 'Ask a friend'], why: 'Never share private details online.' },
    { pic: '🔥', q: 'The smoke alarm beeps and there is smoke. What do you do?', options: ['Get down low and go, go, go outside', 'Hide in a cupboard', 'Look for your toys first'], why: 'Smoke rises, so stay low and get out fast.' },
    { pic: '🌀', q: 'You get caught in a rip at the beach. What do you do?', options: ['Stay calm, float and raise your arm', 'Swim hard against it', 'Go under the water'], why: 'Float, stay calm and raise an arm so lifesavers can help.' },
    { pic: '🍳', q: 'Where should pot handles point on the stove?', options: ['Inwards, away from the edge', 'Out over the edge', 'It doesn’t matter'], why: 'Handles turned in can’t be knocked off.' },
    { pic: '🐍', q: 'You see a snake in the bush. What do you do?', options: ['Stay still, then back away slowly', 'Poke it with a stick', 'Pick it up'], why: 'Leave snakes alone. Back away and tell an adult.' },
    { pic: '⚡', q: 'Your toy is stuck in the toaster. What do you do?', options: ['Ask a grown-up to unplug it first', 'Pull it out with a fork', 'Shake the toaster'], why: 'Metal in a toaster can give an electric shock.' },
    { pic: '🚗', q: 'Where is the safest seat for kids in the car?', options: ['The back seat, with a seatbelt', 'The front seat', 'On someone’s lap'], why: 'Kids are safest in the back seat.' },
    { pic: '🧪', q: 'You find a bottle of cleaning spray. What do you do?', options: ['Leave it and tell a grown-up', 'Spray it in your mouth', 'Mix it with water to play'], why: 'Cleaning products are poisons. Never play with them.' },
    { pic: '🌩️', q: 'There is a thunderstorm outside. Where should you be?', options: ['Inside a building', 'Under a tall tree', 'Swimming in the pool'], why: 'Lightning can strike tall trees and water. Stay inside.' },
  ],
  champion: [
    { pic: '📞', q: 'When you call 000, what is the first thing they ask?', options: ['Police, fire or ambulance?', 'What is your favourite colour?', 'How old are you?'], why: 'Say which service you need, then your address and what happened.' },
    { pic: '🏠', q: 'Why should you learn your home address?', options: ['So you can tell 000 where to come', 'So you can post it online', 'You don’t need to know it'], why: 'Emergency services need your address to find you.' },
    { pic: '💬', q: 'Someone online you have never met asks you to keep your chats a secret. What do you do?', options: ['Stop chatting and tell a parent', 'Keep the secret', 'Send them a photo'], why: 'Safe adults never ask kids to keep secrets from their parents.' },
    { pic: '🔑', q: 'What makes a strong password?', options: ['A long mix of words, numbers and symbols', 'Your name', '123456'], why: 'Long, mixed passwords are hard to guess. Never share them.' },
    { pic: '📸', q: 'Is it okay to post a photo of your school uniform online?', options: ['No, it shows where you go to school', 'Yes, always', 'Only if it is blurry'], why: 'School logos tell strangers where to find you.' },
    { pic: '🩹', q: 'Your friend has a bad cut that is bleeding. What do you do first?', options: ['Press on it with a clean cloth and get an adult', 'Wash it in the pool', 'Ignore it'], why: 'Pressing on a cut slows the bleeding.' },
    { pic: '🔥', q: 'You get a small burn from a hot pan. What helps?', options: ['Cool running water for 20 minutes', 'Butter on it', 'Ice straight on it'], why: 'Cool running water for 20 minutes is the best first aid for burns.' },
    { pic: '🐝', q: 'Someone is stung by a bee and their face swells and they can’t breathe well. What do you do?', options: ['Call 000 straight away', 'Wait and see', 'Give them a drink'], why: 'Trouble breathing is an emergency. Call 000.' },
    { pic: '🌊', q: 'What does a rip look like at the beach?', options: ['A calmer, darker gap between the waves', 'Big white waves', 'Lots of seaweed'], why: 'Rips often look calm and dark. That is why they trick people.' },
    { pic: '🚦', q: 'The green man is flashing red. What does it mean?', options: ['Don’t start crossing, finish if you have started', 'Run across fast', 'Wait for the cars to stop'], why: 'Flashing red means do not start to cross.' },
    { pic: '🎧', q: 'Why shouldn’t you wear headphones while crossing the road?', options: ['You can’t hear cars coming', 'They might fall off', 'It is rude'], why: 'You need your eyes and ears to stay safe near traffic.' },
    { pic: '🔥', q: 'Which of these should you use on an oil fire in a pan?', options: ['A fire blanket or a lid, and turn off the heat', 'Water', 'A fan'], why: 'Water makes an oil fire explode. Smother it instead.' },
    { pic: '☀️', q: 'When is the sun’s UV strongest in Australia?', options: ['Around the middle of the day', 'Early morning', 'At night'], why: 'Between about 10am and 3pm, so be extra sun smart then.' },
    { pic: '🦈', q: 'Which animal sting is a big danger in northern Australian seas in summer?', options: ['Box jellyfish', 'Goldfish', 'Seahorse'], why: 'Box jellyfish are very dangerous. Swim in stinger nets and wear a stinger suit.' },
    { pic: '📱', q: 'You get a message saying you won a prize and need to click a link. What do you do?', options: ['Don’t click it and show a parent', 'Click it quickly', 'Send it to friends'], why: 'Prize messages like this are often scams.' },
    { pic: '🧑‍🤝‍🧑', q: 'Your friend dares you to climb onto the roof. What do you do?', options: ['Say no, it is not safe', 'Do it so they think you are brave', 'Climb halfway'], why: 'A real friend won’t dare you to do something dangerous.' },
    { pic: '🌊', q: 'A flooded road blocks your way. What should a driver do?', options: ['Turn around and find another way', 'Drive through fast', 'Walk through it'], why: 'If it’s flooded, forget it. Even shallow water can sweep a car away.' },
    { pic: '🔋', q: 'Your little sister finds a button battery. Why is it dangerous?', options: ['It can badly burn inside if swallowed', 'It is too heavy', 'It is sticky'], why: 'Button batteries are very dangerous if swallowed. Call 000 straight away if it happens.' },
  ],
};

export default {
  id: 'safety',
  title: 'Safety Smart',
  emoji: '🦺',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    const n = { little: 5, explorer: 8, champion: 10 }[band];
    const questions = freshPick(child, `safety-${band}`, SAFETY[band], n).map(s => ({
      prompt: s.q, pic: s.pic, options: s.options, answer: s.options[0], explain: s.why,
    }));
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You are safety smart!'));
  },
};
