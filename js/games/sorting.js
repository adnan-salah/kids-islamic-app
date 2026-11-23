/* =========================================================
   Game: Animal Sort
   An animal (or thing) appears. Tap the group it belongs in.
   Different sorts each game:
     little   - lives in water or on land; can fly or can't.
     explorer - mammal, bird, fish or insect; plant eater, meat
                eater or both; living or not living.
     champion - all six animal groups (with tricky ones like whales,
                bats and platypus); backbone or no backbone;
                plant eater, meat eater or both.
   Each child gets sorts and animals they have not seen lately first.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, wiggle, shuffle, praiseFor } from '../core.js';
import { freshPick } from '../fresh.js';

/* Each sort: groups [id, label], and items [emoji, name, groupId, why?]. */
export const SORTS = [
  { id: 'water', bands: ['little'], q: 'Where does it live?', groups: [['land', '🌳 On land'], ['water', '🌊 In water']], items: [
    ['🐟', 'fish', 'water'], ['🐳', 'whale', 'water'], ['🐙', 'octopus', 'water'], ['🦈', 'shark', 'water'], ['🐠', 'clownfish', 'water'], ['🦀', 'crab', 'water'],
    ['🐄', 'cow', 'land'], ['🦁', 'lion', 'land'], ['🐘', 'elephant', 'land'], ['🦘', 'kangaroo', 'land'], ['🐶', 'dog', 'land'], ['🐪', 'camel', 'land']] },
  { id: 'fly', bands: ['little'], q: 'Can it fly?', groups: [['yes', '🪽 Can fly'], ['no', '🚶 Can’t fly']], items: [
    ['🐦', 'bird', 'yes'], ['🦋', 'butterfly', 'yes'], ['🐝', 'bee', 'yes'], ['🦉', 'owl', 'yes'], ['🦅', 'eagle', 'yes'], ['🐞', 'ladybird', 'yes'],
    ['🐢', 'turtle', 'no'], ['🐌', 'snail', 'no'], ['🐑', 'sheep', 'no'], ['🐸', 'frog', 'no'], ['🐴', 'horse', 'no'], ['🐧', 'penguin', 'no', 'Penguins are birds, but they swim instead of fly!']] },
  { id: 'groups4', bands: ['explorer'], q: 'Which group is it in?', groups: [['mammal', '🐾 Mammal'], ['bird', '🪶 Bird'], ['fish', '🐟 Fish'], ['insect', '🐞 Insect']], items: [
    ['🐶', 'dog', 'mammal'], ['🦘', 'kangaroo', 'mammal', 'Mammals have fur and feed their babies milk.'], ['🐨', 'koala', 'mammal'], ['🐬', 'dolphin', 'mammal', 'Dolphins breathe air and feed their babies milk, so they are mammals.'],
    ['🦜', 'parrot', 'bird'], ['🐧', 'penguin', 'bird', 'Penguins have feathers and lay eggs, so they are birds.'], ['🦉', 'owl', 'bird'], ['🦢', 'swan', 'bird'],
    ['🦈', 'shark', 'fish', 'Sharks have gills and fins, so they are fish.'], ['🐠', 'clownfish', 'fish'], ['🐡', 'pufferfish', 'fish'], ['🐟', 'salmon', 'fish'],
    ['🐝', 'bee', 'insect', 'Insects have 6 legs.'], ['🐜', 'ant', 'insect'], ['🦋', 'butterfly', 'insect'], ['🪲', 'beetle', 'insect']] },
  { id: 'diet', bands: ['explorer', 'champion'], q: 'What does it eat?', groups: [['plant', '🌿 Plants'], ['meat', '🍖 Meat'], ['both', '🍽️ Both']], items: [
    ['🐄', 'cow', 'plant'], ['🐨', 'koala', 'plant', 'Koalas eat only gum leaves.'], ['🦒', 'giraffe', 'plant'], ['🐇', 'rabbit', 'plant'], ['🐘', 'elephant', 'plant'],
    ['🦁', 'lion', 'meat'], ['🦈', 'shark', 'meat'], ['🦅', 'eagle', 'meat'], ['🐊', 'crocodile', 'meat'], ['🐍', 'snake', 'meat'],
    ['🐻', 'bear', 'both', 'Bears eat berries and fish, so they eat both.'], ['🐒', 'monkey', 'both'], ['🐔', 'chicken', 'both'], ['🦝', 'raccoon', 'both']] },
  { id: 'living', bands: ['explorer'], q: 'Is it living or not living?', groups: [['yes', '🌱 Living'], ['no', '🪨 Not living']], items: [
    ['🌳', 'tree', 'yes', 'Trees are living. They grow and need water.'], ['🐛', 'caterpillar', 'yes'], ['🍄', 'mushroom', 'yes'], ['🌻', 'sunflower', 'yes'], ['🐟', 'fish', 'yes'],
    ['🪨', 'rock', 'no'], ['🚗', 'car', 'no', 'Cars move, but they do not grow or eat, so they are not living.'], ['☁️', 'cloud', 'no'], ['🧸', 'teddy bear', 'no'], ['🔥', 'fire', 'no', 'Fire moves and grows, but it is not alive.']] },
  { id: 'groups6', bands: ['champion'], q: 'Which animal group is it in?', groups: [['mammal', '🐾 Mammal'], ['bird', '🪶 Bird'], ['reptile', '🦎 Reptile'], ['amphibian', '🐸 Amphibian'], ['fish', '🐟 Fish'], ['insect', '🐞 Insect']], items: [
    ['🐋', 'whale', 'mammal', 'Whales breathe air and feed their babies milk.'], ['🦇', 'bat', 'mammal', 'Bats fly, but they have fur and feed milk, so they are mammals.'], ['🦔', 'echidna', 'mammal', 'Echidnas lay eggs, but they feed their babies milk, so they are mammals.'], ['🐪', 'camel', 'mammal'],
    ['🐧', 'penguin', 'bird'], ['🦩', 'flamingo', 'bird'], ['🦃', 'turkey', 'bird'],
    ['🐢', 'turtle', 'reptile', 'Turtles have scaly skin and lay eggs on land.'], ['🐊', 'crocodile', 'reptile'], ['🐍', 'snake', 'reptile'], ['🦎', 'lizard', 'reptile'],
    ['🐸', 'frog', 'amphibian', 'Frogs start in water as tadpoles, then live on land.'], ['🦎', 'salamander', 'amphibian', 'Salamanders have smooth wet skin, so they are amphibians.'],
    ['🦈', 'shark', 'fish'], ['🐡', 'pufferfish', 'fish'], ['🐠', 'clownfish', 'fish'],
    ['🐝', 'bee', 'insect'], ['🦗', 'cricket', 'insect'], ['🐜', 'ant', 'insect']] },
  { id: 'spine', bands: ['champion'], q: 'Does it have a backbone?', groups: [['yes', '🦴 Vertebrate (backbone)'], ['no', '🪼 Invertebrate (no backbone)']], items: [
    ['🐍', 'snake', 'yes', 'Snakes have a very long backbone with hundreds of bones.'], ['🐟', 'fish', 'yes'], ['🐦', 'bird', 'yes'], ['🐸', 'frog', 'yes'], ['🐕', 'dog', 'yes'], ['🐢', 'turtle', 'yes'],
    ['🪼', 'jellyfish', 'no'], ['🐙', 'octopus', 'no', 'An octopus has no bones at all!'], ['🐌', 'snail', 'no'], ['🪱', 'worm', 'no'], ['🕷️', 'spider', 'no'], ['🦋', 'butterfly', 'no'], ['🦀', 'crab', 'no', 'Crabs have a hard shell on the outside, but no backbone.']] },
];

export default {
  id: 'sorting',
  title: 'Animal Sort',
  emoji: '🦒',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    const sorts = SORTS.filter(s => s.bands.includes(band));
    const sort = freshPick(child, `sort-${band}`, sorts, 1, s => s.id)[0];
    const count = { little: 6, explorer: 8, champion: 10 }[band];
    const items = freshPick(child, `sort-${sort.id}`, sort.items, count, x => x[1]);
    let i = 0, mistakes = 0;
    const placed = Object.fromEntries(sort.groups.map(([g]) => [g, []]));
    next();

    function next() {
      const [pic, name, group, why] = items[i];
      const bins = el('div', { class: `sort-bins n${sort.groups.length}` }, sort.groups.map(([g, label]) => {
        const b = el('button', { class: 'sort-bin', onclick: () => choose(g, b) },
          el('span', { class: 'bin-label' }, label),
          el('span', { class: 'bin-items' }, placed[g].join('')));
        return b;
      }));
      const say = `${sort.q} The ${name}.`;
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(say) }, '🔊'),
          el('p', {}, sort.q)),
        el('div', { class: 'sort-card pop-in' }, el('span', { class: 'emoji' }, pic), el('span', { class: 'label' }, name)),
        bins,
        el('div', { class: 'dots' }, items.map((_, k) => el('span', { class: k < i ? 'dot done' : k === i ? 'dot now' : 'dot' }))));
      speak(say);

      function choose(g, b) {
        if (bins.dataset.locked) return;
        if (g === group) {
          bins.dataset.locked = '1';
          sfx.right({ q: `${sort.q} ${name}`, answer: sort.groups.find(x => x[0] === group)[1] });
          placed[g].push(pic);
          b.querySelector('.bin-items').textContent = placed[g].join('');
          b.classList.add('right');
          const praise = praiseFor(name);
          toast(praise);
          speakThen([praise, why], 1200).then(() => {
            if (!root.isConnected) return;
            i++;
            if (i < items.length) next();
            else ctx.finish(band === 'little' || mistakes === 0 ? 3 : 2, 'You sorted them all!');
          });
        } else {
          mistakes++;
          sfx.tryAgain({ q: `${sort.q} ${name}`, answer: sort.groups.find(x => x[0] === group)[1] });
          wiggle(b);
          toast('Try again!');
        }
      }
    }
  },
};
