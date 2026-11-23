/* =========================================================
   Game: Good Manners Choices
   Teaches: Akhlaq and Adab (kindness, honesty, respect for parents,
   sharing, greeting, tidiness).
   A short scene, then pick the kind choice. A gentle reason follows.
   Bands:
     little   - 2 choices, everyday moments.
     explorer - 3 choices, home and school.
     champion - 3 choices, harder real-life dilemmas.
   Each game picks 5 scenes from the band's list, ones the child has
   not seen yet first (fresh.js).
   ========================================================= */
import { freshPick } from '../fresh.js';
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
    { pic: '🚪', q: 'Someone holds the door for you. You say…', right: 'Thank you!', wrong: ['Move!'], why: 'Saying thank you makes people happy.' },
    { pic: '🍪', q: 'You have two biscuits and your brother has none. What do you do?', right: '🤲 Give him one', wrong: ['😋 Eat them both'], why: 'Sharing is kind.' },
    { pic: '🐱', q: 'You see a kitty. How do you touch it?', right: '🤚 Gently', wrong: ['👊 Roughly'], why: 'We are always gentle with animals.' },
    { pic: '🛏️', q: 'Mama says it is bedtime. What do you do?', right: '😊 Go to bed nicely', wrong: ['😠 Scream and cry'], why: 'Listening to Mama is kind.' },
    { pic: '🙋', q: 'You want a turn on the slide. What do you say?', right: 'Can I have a turn, please?', wrong: ['Get off!'], why: 'Please is a magic word.' },
    { pic: '🧼', q: 'Your hands are dirty before lunch. What do you do?', right: '🧼 Wash them', wrong: ['🍔 Eat with dirty hands'], why: 'Clean hands keep us healthy.' },
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
    { pic: '📺', q: 'Mum calls you for dinner during your show. What do you do?', right: 'Turn it off and come straight away', wrong: ['Say "one more minute" again and again', 'Pretend you did not hear'], why: 'Answering our parents quickly shows respect.' },
    { pic: '⚽', q: 'Your team loses the soccer game. What do you do?', right: 'Shake hands and say "good game"', wrong: ['Blame your teammates', 'Kick the ball away in a huff'], why: 'Good sports are kind when they win and when they lose.' },
    { pic: '🖍️', q: 'You borrowed a friend\'s pencils. What do you do when you finish?', right: 'Give them back and say thank you', wrong: ['Keep them', 'Leave them on the floor'], why: 'We look after things we borrow and give them back.' },
    { pic: '🗑️', q: 'You finish a snack at the park. What do you do with the wrapper?', right: 'Put it in the bin', wrong: ['Drop it on the grass', 'Hide it in a bush'], why: 'Keeping places clean is part of good manners.' },
    { pic: '😢', q: 'Your sister is crying because she fell over. What do you do?', right: 'Help her up and ask if she is okay', wrong: ['Laugh at her', 'Keep playing'], why: 'Caring for family is a beautiful thing.' },
    { pic: '🙊', q: 'Your friend tells you a secret. What do you do?', right: 'Keep it to yourself', wrong: ['Tell the whole class', 'Tell it as a joke'], why: 'Keeping a secret shows you can be trusted, unless someone is in danger.' },
    { pic: '🚶', q: 'You bump into someone in the hallway. What do you say?', right: 'Sorry, are you okay?', wrong: ['Watch where you\'re going!', 'Nothing'], why: 'Saying sorry fixes small accidents.' },
    { pic: '🎁', q: 'Your aunty gives you a present you don\'t like. What do you do?', right: 'Smile and say thank you', wrong: ['Say "I don\'t want this"', 'Throw it aside'], why: 'We thank people for their kindness and effort.' },
    { pic: '📱', q: 'Your friend\'s tablet is on the table. What do you do?', right: 'Ask before you use it', wrong: ['Just use it', 'Look at their photos'], why: 'We always ask before using other people\'s things.' },
    { pic: '👨‍🏫', q: 'The teacher is talking to the class. What do you do?', right: 'Listen quietly', wrong: ['Talk to your friend', 'Play with your pencil case'], why: 'Listening shows respect to our teachers.' },
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
    { pic: '💬', q: 'A group chat is saying mean things about a girl in your class. What do you do?', right: 'Don\'t join in, and tell a trusted adult', wrong: ['Add a funny comment', 'Forward it to others'], why: 'Unkind words online hurt just as much as in person.' },
    { pic: '🏆', q: 'You win a prize and your friend doesn\'t. What do you do?', right: 'Be humble and thank them for cheering you on', wrong: ['Show off all day', 'Tell them they were never going to win'], why: 'Being humble when we win is a sign of good character.' },
    { pic: '🧾', q: 'The shopkeeper gives you $5 too much change. What do you do?', right: 'Give the extra money back', wrong: ['Keep it quietly', 'Spend it on lollies'], why: 'Being honest, even when nobody would know, is real honesty.' },
    { pic: '😤', q: 'You are really angry with your brother. What is the best thing to do?', right: 'Walk away, calm down, then talk', wrong: ['Hit him', 'Say something hurtful'], why: 'The strong person is the one who controls their anger.' },
    { pic: '👴', q: 'Your grandad tells the same story again. What do you do?', right: 'Listen kindly as if it is new', wrong: ['Say "you told us already"', 'Walk off'], why: 'Respecting our elders is very important.' },
    { pic: '🎒', q: 'You see a younger kid being pushed around at school. What do you do?', right: 'Tell a teacher straight away', wrong: ['Watch and do nothing', 'Join in'], why: 'Standing up for others is brave and kind.' },
    { pic: '🤥', q: 'You forgot to do your chores and Mum asks if they are done. What do you say?', right: 'Tell the truth and do them now', wrong: ['Say yes, they are done', 'Blame your sister'], why: 'Telling the truth builds trust, even when it is hard.' },
    { pic: '🏠', q: 'Guests are coming over. How can you help?', right: 'Tidy up and offer them a drink', wrong: ['Hide in your room', 'Complain about them'], why: 'Welcoming guests warmly is a beautiful habit.' },
    { pic: '🧑‍🤝‍🧑', q: 'Two friends both want you on their team. What do you do?', right: 'Choose fairly and stay kind to both', wrong: ['Tease the one you didn\'t pick', 'Refuse to play at all'], why: 'Being fair keeps friendships strong.' },
    { pic: '📵', q: 'Someone you don\'t know messages you online and asks where you live. What do you do?', right: 'Don\'t answer and tell a parent', wrong: ['Tell them your address', 'Send them a photo'], why: 'Never share personal details with strangers online.' },
  ],
};

export default {
  id: 'manners',
  title: 'Good Manners',
  emoji: '💚',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    const questions = freshPick(child, `manners-${band}`, SCENES[band], 5).map(s => ({
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
