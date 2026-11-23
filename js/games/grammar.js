/* =========================================================
   Game: Word Power
   Teaches: grammar, punctuation and vocabulary, about one year ahead.
   Bands:
     explorer - (Year 2-3) nouns and verbs, opposites, plurals,
                past tense, capital letters and full stops, contractions.
     champion - (Year 5) adjectives and adverbs, synonyms, prefixes,
                homophones, apostrophes, conjunctions, figurative language.
   In every question, the first option is the right answer
   (the quiz mixes them up on screen).
   ========================================================= */
import { shuffle } from '../core.js';
import { freshPick } from '../fresh.js';
import { runQuiz, starsFrom } from '../quiz.js';

export const EXPLORER_QS = [
  { q: 'Which word is a noun (a person, place or thing)?', o: ['table', 'run', 'happy'], why: 'A table is a thing, so it is a noun.' },
  { q: 'Which word is a noun?', o: ['beach', 'jump', 'quickly'], why: 'A beach is a place.' },
  { q: 'Which word is a verb (a doing word)?', o: ['swim', 'chair', 'blue'], why: 'Swim is something you do.' },
  { q: 'Which word is a verb?', o: ['kick', 'ball', 'big'], why: 'Kick is a doing word.' },
  { q: 'What is the opposite of hot?', o: ['cold', 'warm', 'sunny'] },
  { q: 'What is the opposite of happy?', o: ['sad', 'glad', 'funny'] },
  { q: 'What is the opposite of early?', o: ['late', 'soon', 'first'] },
  { q: 'What is the opposite of empty?', o: ['full', 'clean', 'heavy'] },
  { q: 'One fox, two …', o: ['foxes', 'foxs', 'foxies'], why: 'Words ending in x add -es.' },
  { q: 'One baby, two …', o: ['babies', 'babys', 'babyes'], why: 'Change the y to i and add -es.' },
  { q: 'One child, two …', o: ['children', 'childs', 'childes'], why: 'Child is a special word: children.' },
  { q: 'One mouse, two …', o: ['mice', 'mouses', 'meese'] },
  { q: 'Today I run. Yesterday I …', o: ['ran', 'runned', 'running'], why: 'Run changes to ran in the past.' },
  { q: 'Today I swim. Yesterday I …', o: ['swam', 'swimmed', 'swum'] },
  { q: 'Today I jump. Yesterday I …', o: ['jumped', 'jumpt', 'jump'], why: 'Most words add -ed for the past.' },
  { q: 'Which sentence is written correctly?', o: ['We went to the park.', 'we went to the park', 'We went to the park'], why: 'A sentence starts with a capital letter and ends with a full stop.' },
  { q: 'Which sentence needs a question mark?', o: ['Where is my hat', 'My hat is red', 'I like my hat'], why: 'It asks something, so it needs a question mark.' },
  { q: 'Which name needs a capital letter?', o: ['sydney', 'city', 'beach'], why: 'Names of places start with a capital: Sydney.' },
  { q: 'What is the short way to write “do not”?', o: ['don’t', 'dont', 'do’nt'], why: 'The apostrophe takes the place of the missing o.' },
  { q: 'What is the short way to write “I am”?', o: ['I’m', 'Im', 'I’am'] },
  { q: 'Which word means the same as big?', o: ['large', 'tiny', 'thin'] },
  { q: 'Which word means the same as quick?', o: ['fast', 'slow', 'quiet'] },
  { q: 'Which word rhymes with night?', o: ['kite', 'nest', 'note'] },
  { q: 'Choose the right word: The dog wagged ___ tail.', o: ['its', 'it', 'is'] },
  { q: 'Which word is a noun?', o: ['teacher', 'sing', 'soft'], why: 'A teacher is a person, so it is a noun.' },
  { q: 'Which word is a verb?', o: ['climb', 'tree', 'green'], why: 'Climb is something you do.' },
  { q: 'Which word is an adjective (a describing word)?', o: ['fluffy', 'cat', 'sleep'], why: 'Fluffy describes something.' },
  { q: 'What is the opposite of tall?', o: ['short', 'long', 'big'] },
  { q: 'What is the opposite of loud?', o: ['quiet', 'noisy', 'fast'] },
  { q: 'One box, two …', o: ['boxes', 'boxs', 'boxies'], why: 'Words ending in x add -es.' },
  { q: 'One foot, two …', o: ['feet', 'foots', 'feets'], why: 'Foot is a special word: feet.' },
  { q: 'One tooth, two …', o: ['teeth', 'tooths', 'teeths'] },
  { q: 'Today I eat. Yesterday I …', o: ['ate', 'eated', 'eaten'], why: 'Eat changes to ate in the past.' },
  { q: 'Today I go. Yesterday I …', o: ['went', 'goed', 'gone'], why: 'Go changes to went in the past.' },
  { q: 'Today I see. Yesterday I …', o: ['saw', 'seed', 'seen'] },
  { q: 'What is the short way to write “can not”?', o: ['can’t', 'cant', 'ca’nt'] },
  { q: 'What is the short way to write “it is”?', o: ['it’s', 'its', 'it’is'] },
  { q: 'Which word rhymes with cake?', o: ['lake', 'cook', 'kite'] },
  { q: 'Which word means the same as small?', o: ['little', 'huge', 'wide'] },
  { q: 'Choose the right word: I ___ a cat.', o: ['have', 'has', 'having'] },
  { q: 'Choose the right word: She ___ to school every day.', o: ['walks', 'walk', 'walking'] },
  { q: 'Which word needs a capital letter?', o: ['monday', 'day', 'week'], why: 'Days of the week start with a capital: Monday.' },
];

export const CHAMPION_QS = [
  { q: 'Which word is an adverb (it describes how something is done)?', o: ['quietly', 'quiet', 'quieter', 'quietness'], why: 'Adverbs often end in -ly.' },
  { q: 'In “The tall girl ran quickly”, which word is an adjective?', o: ['tall', 'girl', 'ran', 'quickly'], why: 'Tall describes the girl.' },
  { q: 'Which word is a synonym (same meaning) of “enormous”?', o: ['gigantic', 'tiny', 'ancient', 'noisy'] },
  { q: 'Which word is a synonym of “brave”?', o: ['courageous', 'frightened', 'careful', 'clever'] },
  { q: 'Which word is an antonym (opposite) of “generous”?', o: ['selfish', 'kind', 'giving', 'friendly'] },
  { q: 'Which word is an antonym of “ancient”?', o: ['modern', 'old', 'broken', 'famous'] },
  { q: 'Adding “un” to “happy” makes…', o: ['unhappy: not happy', 'unhappy: very happy', 'unhappy: happy again', 'unhappy: a bit happy'], why: 'The prefix un- means not.' },
  { q: 'What does the prefix “re-” mean in “rewrite”?', o: ['again', 'not', 'before', 'under'] },
  { q: 'Choose the right word: They put ___ bags over there.', o: ['their', 'there', 'they’re', 'thier'], why: 'Their means belonging to them.' },
  { q: 'Choose the right word: I would like ___ apples, please.', o: ['two', 'to', 'too', 'tow'] },
  { q: 'Choose the right word: The ___ is shining.', o: ['sun', 'son', 'sunn', 'soon'] },
  { q: 'Which uses the apostrophe correctly?', o: ['The cat’s bowl is empty.', 'The cats’s bowl is empty.', 'The cat’s’ bowl is empty.', 'The ca’ts bowl is empty.'], why: 'Cat’s shows the bowl belongs to the cat.' },
  { q: 'Pick the best joining word: I wanted to play outside, ___ it was raining.', o: ['but', 'and', 'because', 'so'], why: 'But shows something different or unexpected.' },
  { q: 'Pick the best joining word: We stayed inside ___ it was raining.', o: ['because', 'but', 'or', 'although'] },
  { q: '“The classroom was a zoo.” What does this mean?', o: ['The classroom was noisy and wild', 'There were animals in the class', 'The class went to a zoo', 'The classroom was empty'], why: 'This is a metaphor: it compares two things.' },
  { q: '“As fast as a cheetah” is called a…', o: ['simile', 'question', 'plural', 'contraction'], why: 'A simile compares using “as” or “like”.' },
  { q: '“It’s raining cats and dogs” means…', o: ['It is raining very heavily', 'Pets are falling from the sky', 'It is a sunny day', 'Cats and dogs are fighting'], why: 'This is an idiom: a saying that does not mean exactly what it says.' },
  { q: 'Which sentence uses commas correctly in a list?', o: ['I packed a hat, a towel, sunscreen and a drink.', 'I packed, a hat a towel, sunscreen, and a drink.', 'I packed a hat a towel sunscreen, and a drink.', 'I, packed a hat a towel sunscreen and a drink.'] },
  { q: 'Which is the past tense of “catch”?', o: ['caught', 'catched', 'cought', 'catching'] },
  { q: 'Which is the past tense of “think”?', o: ['thought', 'thinked', 'thunk', 'thinking'] },
  { q: 'Which word is spelled correctly?', o: ['because', 'becuase', 'becos', 'beacause'] },
  { q: 'Which word is spelled correctly?', o: ['friend', 'freind', 'frend', 'friende'] },
  { q: 'Which word is spelled correctly?', o: ['beautiful', 'beutiful', 'beautifull', 'butiful'] },
  { q: 'What is the plural of “cactus”?', o: ['cacti', 'cactusies', 'cactis', 'cactuss'], why: 'Cacti. (Cactuses is also allowed.)' },
  { q: 'Which word is a pronoun?', o: ['she', 'garden', 'jumped', 'green'], why: 'A pronoun takes the place of a noun.' },
  { q: 'Which sentence is a command?', o: ['Close the door.', 'The door is closed.', 'Is the door closed?', 'What a big door!'] },
  { q: 'Which word is a synonym of “happy”?', o: ['joyful', 'gloomy', 'angry', 'sleepy'] },
  { q: 'Which word is an antonym of “ancient”?', o: ['brand-new', 'historic', 'old', 'dusty'] },
  { q: 'Which word is an antonym of “victory”?', o: ['defeat', 'win', 'triumph', 'success'] },
  { q: 'What does the suffix “-less” mean in “fearless”?', o: ['without', 'full of', 'again', 'more'], why: 'Fearless means without fear.' },
  { q: 'What does the suffix “-ful” mean in “helpful”?', o: ['full of', 'without', 'before', 'not'] },
  { q: 'What does the prefix “pre-” mean in “preview”?', o: ['before', 'after', 'again', 'not'] },
  { q: 'Choose the right word: ___ going to the beach tomorrow.', o: ['They’re', 'Their', 'There', 'Thier'], why: 'They’re is short for they are.' },
  { q: 'Choose the right word: ___ your bag over there?', o: ['Is', 'Are', 'Am', 'Be'] },
  { q: 'Choose the right word: Can you ___ the music?', o: ['hear', 'here', 'heer', 'hare'] },
  { q: 'Choose the right word: I ate ___ much cake!', o: ['too', 'to', 'two', 'tow'] },
  { q: 'Which sentence is in the past tense?', o: ['We played netball.', 'We play netball.', 'We will play netball.', 'We are playing netball.'] },
  { q: 'Which sentence is in the future tense?', o: ['I will read a book.', 'I read a book.', 'I am reading a book.', 'I have read a book.'] },
  { q: '“The wind whispered through the trees.” This is called…', o: ['personification', 'a simile', 'a question', 'a plural'], why: 'Personification gives human actions to things that are not human.' },
  { q: '“Her smile was as bright as the sun.” This is a…', o: ['simile', 'command', 'contraction', 'prefix'] },
  { q: '“Break a leg!” before a show means…', o: ['Good luck!', 'Hurt yourself', 'Run away', 'Be careful on stage'] },
  { q: '“Over the moon” means…', o: ['very happy', 'in space', 'very tired', 'confused'] },
  { q: 'Which word is spelled correctly?', o: ['necessary', 'neccessary', 'necesary', 'nessesary'] },
  { q: 'Which word is spelled correctly?', o: ['separate', 'seperate', 'separete', 'seprate'] },
  { q: 'Which word is spelled correctly?', o: ['different', 'diffrent', 'diferent', 'differant'] },
  { q: 'Which word is spelled correctly?', o: ['believe', 'beleive', 'belive', 'beleave'] },
  { q: 'What is the plural of “knife”?', o: ['knives', 'knifes', 'knifs', 'knive'] },
  { q: 'What is the plural of “sheep”?', o: ['sheep', 'sheeps', 'shoop', 'sheepies'] },
  { q: 'Which word is a conjunction (joining word)?', o: ['although', 'quickly', 'beautiful', 'table'] },
  { q: 'Which is a complete sentence?', o: ['The puppy chased the ball.', 'The puppy and the.', 'Chased the ball quickly.', 'Because the puppy.'] },
  { q: 'Which word is a preposition (tells where)?', o: ['under', 'run', 'happy', 'slowly'] },
  { q: 'Which sentence uses speech marks correctly?', o: ['“Come here,” said Mum.', '“Come here, said Mum.', 'Come here,” said Mum.', '“Come here, said” Mum.'] },
];

export default {
  id: 'grammar',
  title: 'Word Power',
  emoji: '💪',
  bands: ['explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    const bank = band === 'champion' ? CHAMPION_QS : EXPLORER_QS;
    const questions = freshPick(child, `grammar-${band}`, bank, 10, x => x.q + x.o[0]).map(x => ({
      prompt: x.q, options: x.o, answer: x.o[0], explain: x.why,
    }));
    runQuiz(root, questions, mistakes =>
      ctx.finish(starsFrom(mistakes, band), 'Your words are getting powerful!'));
  },
};
