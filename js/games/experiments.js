/* =========================================================
   Game: Experiment Lab
   Hands-on science, like real experiments:
     1. Guess what will happen (predict).
     2. Tap "Test it!" and watch the experiment.
     3. Hear why it happened.
   A wrong guess is fine in science, so there are no hearts here;
   right and wrong guesses still count in the progress report.
   Experiments: sink or float, magnets, mixing colours, heating and
   cooling, what plants need, electric circuits, ramps and friction.
   Bands:
     little   - sink or float, magnets and colours, 4 per game.
     explorer - everything, 5 per game.
     champion - everything, 6 per game, with the harder versions.
   Each child gets experiments they have not done lately first.
   ========================================================= */
import { el, speak, speakThen, sfx, toast, shuffle, praiseFor } from '../core.js';
import { confetti } from '../fun.js';
import { freshPick } from '../fresh.js';

/* options[0] is the right answer. lvl: 1 all, 2 explorer and up, 3 champion. */
export const EXPERIMENTS = [
  // Sink or float
  ...[
    ['🍎', 'apple', 'Float', 'Apples have lots of air inside, so they float.'],
    ['🪨', 'rock', 'Sink', 'A rock is heavy for its size, so it sinks.'],
    ['🦆', 'rubber duck', 'Float', 'The duck is full of air, so it floats.'],
    ['🪙', 'coin', 'Sink', 'A coin is small but heavy metal, so it sinks.'],
    ['🍃', 'leaf', 'Float', 'A leaf is very light and flat, so it floats.'],
    ['🔑', 'key', 'Sink', 'Keys are made of metal, so they sink.'],
    ['🪵', 'block of wood', 'Float', 'Wood is lighter than water, so it floats.'],
    ['🍊', 'orange', 'Float', 'The peel is full of tiny air pockets, like a life jacket!'],
    ['🧊', 'ice cube', 'Float', 'Ice is lighter than water, so ice cubes float.'],
    ['🥄', 'metal spoon', 'Sink', 'A metal spoon sinks to the bottom.'],
    ['🥚', 'fresh egg', 'Sink', 'A fresh egg sinks. In very salty water it would float!'],
    ['⚽', 'ball', 'Float', 'A ball is full of air, so it floats.'],
  ].map(([pic, name, right, why], i) => ({ id: `float${i}`, kind: 'float', lvl: 1, pic, q: `Will the ${name} sink or float?`, options: [right, right === 'Float' ? 'Sink' : 'Float'], why })),
  // Magnets
  ...[
    ['📎', 'paperclip', true, 'Paperclips are made of steel, and magnets attract steel.'],
    ['🔩', 'iron nail', true, 'Magnets attract iron, so the nail sticks.'],
    ['✏️', 'pencil', false, 'Pencils are wood, and magnets do not attract wood.'],
    ['🥤', 'plastic cup', false, 'Magnets do not attract plastic.'],
    ['🥫', 'drink can', false, 'Drink cans are made of aluminium, which is not magnetic.', 2],
    ['🪙', 'Australian coin', false, 'Australian coins are not magnetic, even though they are metal!', 2],
    ['🧦', 'sock', false, 'Magnets do not attract cloth.'],
    ['🪛', 'steel screwdriver', true, 'The steel end of a screwdriver sticks to a magnet.'],
    ['🧷', 'safety pin', true, 'Safety pins are steel, so they stick.'],
    ['🍌', 'banana', false, 'Food is not magnetic.'],
  ].map(([pic, name, sticks, why, lvl = 1], i) => ({ id: `mag${i}`, kind: 'magnet', lvl, pic, q: `Will the magnet pick up the ${name}?`, options: sticks ? ['Yes, it sticks', 'No'] : ['No', 'Yes, it sticks'], sticks, why })),
  // Mixing colours
  ...[
    ['red', 'yellow', 'Orange', ['Green', 'Purple'], '#ef4444', '#facc15', '#f97316'],
    ['blue', 'yellow', 'Green', ['Orange', 'Pink'], '#3b82f6', '#facc15', '#22c55e'],
    ['red', 'blue', 'Purple', ['Green', 'Brown'], '#ef4444', '#3b82f6', '#8b5cf6'],
    ['red', 'white', 'Pink', ['Orange', 'Grey'], '#ef4444', '#ffffff', '#f9a8d4'],
    ['black', 'white', 'Grey', ['Pink', 'Blue'], '#111827', '#ffffff', '#9ca3af'],
    ['blue', 'white', 'Light blue', ['Purple', 'Green'], '#3b82f6', '#ffffff', '#93c5fd'],
  ].map(([a, b, right, wrong, ca, cb, cmix], i) => ({ id: `mix${i}`, kind: 'mix', lvl: 1, q: `What colour will ${a} and ${b} make?`, options: [right, ...wrong], ca, cb, cmix, why: `${a[0].toUpperCase() + a.slice(1)} and ${b} make ${right.toLowerCase()}.` })),
  // Heating and cooling
  ...[
    ['🧊', '💧', 'ice cube', 'heat', 'It melts into water', ['It gets bigger', 'Nothing happens'], 'Heat melts ice. The solid turns into a liquid.', 1],
    ['💧', '♨️', 'water', 'heat until it boils', 'It turns into steam', ['It turns into ice', 'It turns into sand'], 'At 100 degrees, water boils and turns into a gas called steam.', 2],
    ['💧', '🧊', 'water', 'put in the freezer', 'It turns into ice', ['It turns into steam', 'It disappears'], 'At 0 degrees, water freezes into solid ice.', 1],
    ['🍫', '🫗', 'chocolate', 'heat', 'It melts', ['It freezes', 'It turns into steam'], 'Chocolate melts when it is warm. It goes hard again when it cools: a reversible change.', 1],
    ['🥚', '🍳', 'egg', 'cook', 'It goes solid and can’t go back', ['It melts into water', 'It stays runny forever'], 'Cooking an egg is a change that cannot be reversed.', 3],
    ['🧈', '🫗', 'butter', 'heat in a pan', 'It melts', ['It turns into ice', 'It gets harder'], 'Butter melts into a liquid when it is heated.', 2],
    ['🍞', '🔥', 'bread', 'toast for a long time', 'It burns and turns black', ['It turns back into flour', 'It melts'], 'Burning is a change that cannot be undone.', 3],
  ].map(([pic, after, name, action, right, wrong, why, lvl], i) => ({ id: `heat${i}`, kind: 'heat', lvl, pic, after, cold: /freez/.test(action), q: `What happens when you ${action} the ${name}?`, options: [right, ...wrong], why })),
  // What plants need
  { id: 'plant0', kind: 'plant', lvl: 2, q: 'Which plant will grow best?', options: ['☀️💧 Sun and water', '🌑💧 Dark cupboard and water', '☀️ Sun but no water'], best: 0, why: 'Plants need both sunlight and water to grow well.' },
  { id: 'plant1', kind: 'plant', lvl: 2, q: 'What will happen to the plant with no water?', options: ['It wilts and droops', 'It grows the tallest', 'It turns blue'], best: 2, why: 'Without water, a plant droops and can die.' },
  { id: 'plant2', kind: 'plant', lvl: 3, q: 'What will happen to the plant in the dark cupboard?', options: ['It grows pale and weak', 'It grows dark green and strong', 'It grows flowers'], best: 1, why: 'Plants need light to make food. In the dark they turn pale and weak.' },
  // Circuits
  ...[
    ['🧵', 'copper wire', true, 'Copper is a metal, so electricity flows through it. It is a conductor.'],
    ['📎', 'metal paperclip', true, 'Metal lets electricity through, so the light turns on.'],
    ['📏', 'plastic ruler', false, 'Plastic does not let electricity through. It is an insulator.'],
    ['🪵', 'stick of wood', false, 'Dry wood is an insulator, so the light stays off.'],
    ['🥄', 'metal spoon', true, 'Metal spoons conduct electricity.'],
    ['🎈', 'rubber band', false, 'Rubber is an insulator. That is why wires are covered in rubber or plastic.'],
    ['🪙', 'coin', true, 'Coins are metal, so they conduct electricity.'],
    ['🧽', 'dry sponge', false, 'A dry sponge does not let electricity through.'],
  ].map(([pic, name, on, why], i) => ({ id: `circ${i}`, kind: 'circuit', lvl: 2, pic, on, q: `Will the light turn on if we use a ${name} to close the gap?`, options: on ? ['Yes, it lights up', 'No, it stays off'] : ['No, it stays off', 'Yes, it lights up'], why })),
  // Ramps and friction
  { id: 'ramp0', kind: 'ramp', lvl: 2, q: 'The toy car rolls down the ramp. Which floor will it roll furthest on?', options: ['🧊 Smooth tiles', '🟫 Carpet', '🌱 Grass'], dist: [92, 55, 30], why: 'Smooth floors have less friction, so the car keeps rolling further.' },
  { id: 'ramp1', kind: 'ramp', lvl: 3, q: 'We make the ramp higher. What happens?', options: ['The car goes faster and further', 'The car goes slower', 'The car stops on the ramp'], lanes: ['⛰️ High ramp', '🛝 Low ramp', '➖ Nearly flat'], dist: [95, 55, 15], why: 'A higher ramp gives the car more energy, so it goes faster and further.' },
  { id: 'ramp2', kind: 'ramp', lvl: 3, q: 'Which floor will stop the car the quickest?', options: ['🟨 Sandpaper', '🧊 Smooth tiles', '🪵 Wooden floor'], dist: [25, 92, 70], why: 'Sandpaper is very rough. Lots of friction stops the car quickly.' },
];

export default {
  id: 'experiments',
  title: 'Experiment Lab',
  emoji: '🧪',
  bands: ['little', 'explorer', 'champion'],
  noLives: true, // a wrong guess is part of science
  noBuddy: true, // needs the whole screen

  start(ctx) {
    const { root, band, child } = ctx;
    const lvl = { little: 1, explorer: 2, champion: 3 }[band];
    const n = { little: 4, explorer: 5, champion: 6 }[band];
    const pool = EXPERIMENTS.filter(x => x.lvl <= lvl && (band !== 'little' || ['float', 'magnet', 'mix'].includes(x.kind)));
    // Mix the kinds, so a game is not all sink or float.
    const kinds = shuffle([...new Set(pool.map(x => x.kind))]);
    const list = [];
    for (let i = 0; list.length < n && i < 20; i++) {
      const k = kinds[i % kinds.length];
      const got = freshPick(child, `exp-${k}`, pool.filter(x => x.kind === k), 1, x => x.id)[0];
      if (got && !list.includes(got)) list.push(got);
    }
    let i = 0, right = 0;
    next();

    function next() {
      const x = list[i];
      const stage = el('div', { class: `lab lab-${x.kind}` });
      draw(x, stage);
      const box = el('div', { class: 'options lab-options' });
      const shown = band === 'little' ? x.options.slice(0, 2) : x.options;
      box.append(...shuffle(shown).map(opt => {
        const b = el('button', { class: 'option', onclick: () => guess(opt, b) }, opt);
        return b;
      }));
      const testBtn = el('button', { class: 'big-btn lab-test', disabled: true }, '🧪 Test it!');
      const step = el('p', { class: 'lab-step' }, `Experiment ${i + 1} of ${list.length}: first, make a guess!`);
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(x.q) }, '🔊'),
          el('p', {}, x.q)),
        step,
        stage, el('div', { class: 'lab-act' }, box, testBtn));
      speak(x.q);

      function guess(opt, b) {
        if (box.dataset.locked) return;
        box.dataset.locked = '1';
        const ok = opt === x.options[0];
        b.classList.add('chosen');
        if (ok) right++;
        // Count the guess for the progress report, quietly.
        document.dispatchEvent(new CustomEvent('answer', { detail: { ok, info: { q: x.q, answer: x.options[0] } } }));
        testBtn.disabled = false;
        testBtn.classList.add('pulse');
        speak('Now tap Test it, and see what happens!');
        testBtn.onclick = () => {
          testBtn.disabled = true; testBtn.classList.remove('pulse');
          run(x, stage).then(() => {
            for (const btn of box.children) if (btn.textContent === x.options[0]) btn.classList.add('right');
            if (ok) { sfx.win(); confetti({ count: 50 }); }
            step.textContent = x.why; step.classList.add('lab-why');
            const head = ok ? praiseFor(x.q) : 'Good guess! Scientists learn from surprises.';
            toast(ok ? `${head} You guessed right!` : head, 2500);
            speakThen([head, x.why], 1500).then(() => {
              if (!root.isConnected) return;
              testBtn.replaceWith(el('button', { class: 'big-btn lab-test', onclick: () => { i++; i < list.length ? next() : done(); } }, i + 1 < list.length ? 'Next experiment ➡️' : 'Finish ✅'));
            });
          });
        };
      }
    }

    function done() {
      const stars = band === 'little' || right >= list.length - 1 ? 3 : 2;
      ctx.finish(stars, `You did ${list.length} experiments. You are a real scientist!`);
    }
  },
};

/* ---------- The experiment pictures ---------- */
function draw(x, stage) {
  if (x.kind === 'float') {
    stage.append(el('div', { class: 'tank' }, el('div', { class: 'water' }), el('div', { class: 'thing' }, x.pic)));
  } else if (x.kind === 'magnet') {
    stage.append(el('div', { class: 'magnet-row' }, el('span', { class: 'magnet' }, '🧲'), el('span', { class: 'thing' }, x.pic)));
  } else if (x.kind === 'mix') {
    stage.append(el('div', { class: 'mix-row' },
      el('span', { class: 'pot', style: `--c:${x.ca}` }), el('span', { class: 'plus' }, '+'),
      el('span', { class: 'pot', style: `--c:${x.cb}` }), el('span', { class: 'plus' }, '='),
      el('span', { class: 'pot bowl', style: '--c:#f1f5f9' }, '?')));
  } else if (x.kind === 'heat') {
    stage.append(el('div', { class: 'heat-row' },
      el('span', { class: 'thing' }, x.pic),
      el('div', { class: 'thermo' }, el('div', { class: 'mercury' })),
      el('span', { class: 'source' }, x.cold ? '❄️' : '🔥')));
  } else if (x.kind === 'plant') {
    stage.append(el('div', { class: 'plant-row' }, ...[['☀️💧', 'Sun + water'], ['🌑💧', 'Dark + water'], ['☀️', 'Sun, no water']].map(([icon, label]) =>
      el('div', { class: 'pot-box' }, el('div', { class: 'cond' }, icon), el('div', { class: 'sprout' }, '🌱'), el('div', { class: 'note' }, label)))));
  } else if (x.kind === 'circuit') {
    stage.append(el('div', { class: 'circuit' },
      el('span', { class: 'battery' }, '🔋'), el('span', { class: 'wire' }), el('span', { class: 'gap' }, x.pic), el('span', { class: 'wire' }),
      el('span', { class: 'bulb' }, '💡')));
  } else if (x.kind === 'ramp') {
    stage.append(el('div', { class: 'ramp-lanes' }, ...(x.lanes || x.options).map(o =>
      el('div', { class: 'lane' }, el('span', { class: 'lane-label' }, o), el('div', { class: 'track' }, el('span', { class: 'car' }, '🏎️'))))));
  }
}

/* Play the experiment. Resolves when the animation has finished. */
function run(x, stage) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = s => stage.querySelector(s);
  if (x.kind === 'float') {
    $('.thing').classList.add(x.options[0] === 'Float' ? 'floats' : 'sinks');
    sfx.pop();
    return wait(1800);
  }
  if (x.kind === 'magnet') {
    if (x.sticks) $('.thing').classList.add('pulled'); else $('.thing').classList.add('wobble');
    return wait(1400);
  }
  if (x.kind === 'mix') {
    for (const p of stage.querySelectorAll('.pot:not(.bowl)')) p.classList.add('pour');
    return wait(900).then(() => { const b = $('.bowl'); b.style.setProperty('--c', x.cmix); b.textContent = ''; b.classList.add('filled'); return wait(900); });
  }
  if (x.kind === 'heat') {
    $('.mercury').classList.add(x.cold ? 'down' : 'up');
    return wait(1500).then(() => { $('.thing').textContent = x.after; $('.thing').classList.add('pop-in'); return wait(800); });
  }
  if (x.kind === 'plant') {
    const looks = ['🪴', '🥀', '🌿'];
    const sizes = [1.9, 0.9, 1.1];
    stage.querySelectorAll('.sprout').forEach((s, k) => {
      s.style.transform = `scale(${sizes[k]})`;
      setTimeout(() => { s.textContent = looks[k === 0 ? 0 : k === 1 ? 2 : 1]; if (k === 1) s.classList.add('pale'); }, 900);
    });
    return wait(2000);
  }
  if (x.kind === 'circuit') {
    $('.gap').classList.add('in');
    return wait(700).then(() => { if (x.on) { $('.circuit').classList.add('on'); sfx.pop(); } else $('.circuit').classList.add('off'); return wait(1000); });
  }
  if (x.kind === 'ramp') {
    stage.querySelectorAll('.car').forEach((c, k) => { c.style.left = `${x.dist[k]}%`; });
    return wait(2200);
  }
  return wait(500);
}
