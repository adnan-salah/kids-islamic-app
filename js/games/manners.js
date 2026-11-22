/* =========================================================
   Game: Good Manners Choices
   Teaches: Akhlaq and Adab (kindness, honesty, respect for parents,
   sharing, greeting, tidiness).
   A short scene, then pick the kind choice. A gentle reason follows.
   Bands:
     little   - 2 choices, everyday moments.
     explorer - 3 choices, home and school.
     champion - 3 choices, harder real-life dilemmas.
   Each game picks 5 scenes at random from the band's list.
   ========================================================= */
import { shuffle } from '../core.js';
import { runQuiz, starsFrom } from '../quiz.js';

/* right: the kind choice. wrong: the other choices. why: said after. */
export const SCENES = {
  little: [
    { pic: '🧸', q: 'Your sister drops her teddy. What do you do?', right: '🤲 Pick it up for her', wrong: ['😝 Laugh at her'], why: 'Helping others makes Allah happy.' },
    { pic: '🍽️', q: 'Before we eat, we say…', right: 'Bismillah', wrong: ['Bye bye'], why: 'Bismillah means in the name of Allah.' },
    { pic: '😋', q: 'After we eat, we say…', right: 'Alhamdulillah', wrong: ['Yuck'], why: 'Alhamdulillah means all praise is for Allah.' },
    { pic: '😢', q: 'Your friend is sad. What do you do?', right: '🤗 Be kind to them', wrong: ['🏃 Run away'], why: 'Being kind to a sad friend is a good deed.' },
    { pic: '🧩', q: 'Your toys are everywhere. What do you do?', right: '🧺 Tidy them up', wrong: ['🙈 Leave the mess'], why: 'Muslims love to keep things clean and tidy.' },
    { pic: '👋', q: 'Someone says Assalamu alaikum. You say…', right: 'Wa alaikum assalam', wrong: ['Nothing'], why: 'We always answer the salam.' },
    { pic: '🤧', q: 'When you sneeze, you say…', right: 'Alhamdulillah', wrong: ['Oops'], why: 'We thank Allah when we sneeze.' },
    { pic: '👩‍🍳', q: 'Mama made you dinner. What do you say?', right: 'Thank you, Mama!', wrong: ['I want something else!'], why: 'We thank our parents for everything they do.' },
  ],
  explorer: [
    { pic: '☕', q: 'You break a cup by accident. What do you do?', right: 'Tell Mum or Dad the truth', wrong: ['Hide the pieces', 'Say your brother did it'], why: 'Muslims always tell the truth, even when it is hard.' },
    { pic: '🥪', q: 'Your friend forgot their lunch. What do you do?', right: 'Share some of yours', wrong: ['Eat it all quickly', 'Tell them it is their fault'], why: 'Sharing food is a lovely Sunnah.' },
    { pic: '🧺', q: 'Dad asks you to help carry the shopping. What do you do?', right: 'Help him straight away', wrong: ['Pretend you did not hear', 'Say "later" and forget'], why: 'Helping our parents is one of the best deeds.' },
    { pic: '🕌', q: 'You see rubbish on the masjid floor. What do you do?', right: 'Pick it up and put it in the bin', wrong: ['Walk past it', 'Kick it away'], why: 'Keeping the masjid clean is a good deed.' },
    { pic: '🤧', q: 'Someone sneezes and says Alhamdulillah. You say…', right: 'Yarhamuk Allah', wrong: ['Ewww!', 'Nothing'], why: 'Yarhamuk Allah means may Allah have mercy on you.' },
    { pic: '🏫', q: 'A new child at school is playing alone. What do you do?', right: 'Ask them to play with you', wrong: ['Ignore them', 'Whisper about them'], why: 'Making others feel welcome is kind.' },
    { pic: '🎮', q: 'Your little brother wants a turn with your toy. What do you do?', right: 'Share and take turns', wrong: ['Hide the toy', 'Shout at him'], why: 'Sharing shows good manners.' },
    { pic: '👵', q: 'An older lady is standing on a full bus. What do you do?', right: 'Offer her your seat', wrong: ['Keep looking at your tablet', 'Put your bag on the seat'], why: 'Respecting our elders is part of Islam.' },
  ],
  champion: [
    { pic: '💵', q: 'You find $20 on the floor at school. What do you do?', right: 'Hand it to a teacher to find the owner', wrong: ['Keep it, nobody saw', 'Spend it on snacks for friends'], why: 'Being honest with things that are not ours is called amanah, keeping a trust.' },
    { pic: '📚', q: 'A friend asks to copy your homework. What do you do?', right: 'Kindly say no, and offer to help them understand it', wrong: ['Let them copy it all', 'Laugh at them for not knowing'], why: 'Helping someone learn is better than helping them cheat.' },
    { pic: '😟', q: 'Some kids are making fun of a classmate. What do you do?', right: 'Don’t join in, stand by the classmate and tell a teacher', wrong: ['Laugh so they like you', 'Film it on a phone'], why: 'Islam teaches us to stand up for people who are being hurt.' },
    { pic: '🙅', q: 'Your parents say no to a game you really wanted. What do you do?', right: 'Stay polite and accept it, even if you are upset', wrong: ['Shout and slam the door', 'Play it anyway when they are not looking'], why: 'Allah tells us to speak to our parents with kindness and respect.' },
    { pic: '📢', q: 'You are playing a game and hear the adhan. What do you do?', right: 'Pause the game and get ready for Salah', wrong: ['Finish the level first, then see', 'Turn the volume up'], why: 'Salah on time is one of the deeds Allah loves most.' },
    { pic: '🤝', q: 'You promised to help a friend, then get a better invite. What do you do?', right: 'Keep your promise to your friend', wrong: ['Go to the better invite', 'Pretend to be sick'], why: 'Keeping promises is a sign of a true believer.' },
    { pic: '🖍️', q: 'Your little sister ruins your drawing by accident. What do you do?', right: 'Stay calm, forgive her, and draw a new one', wrong: ['Ruin something of hers', 'Yell at her'], why: 'Forgiving others is something Allah loves.' },
    { pic: '🗣️', q: 'Someone tells a lie about you. What do you do?', right: 'Stay calm, tell the truth politely, and ask an adult for help', wrong: ['Make up a lie about them', 'Start a fight'], why: 'Answering bad with good is the way of the believers.' },
  ],
};

export default {
  id: 'manners',
  title: 'Good Manners',
  emoji: '💚',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band } = ctx;
    const questions = shuffle(SCENES[band]).slice(0, 5).map(s => ({
      prompt: s.q,
      pic: s.pic,
      options: [s.right, ...s.wrong],
      answer: s.right,
      explain: s.why,
    }));
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'You have beautiful manners!'));
  },
};
