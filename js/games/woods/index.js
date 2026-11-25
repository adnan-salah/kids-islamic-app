/* =========================================================
   Game: Willow Woods
   A problem-solving game: help the animals of Willow Woods by
   building simple inventions. Every child plays the same six
   activities; the version (T, A, B, C) follows their age.
   The map, then one activity per friend, built one at a time.
   ========================================================= */
import { el, speak, toast } from '../../core.js';
import { WOODS_BANDS, woodsBand } from './bands.js';
import { bridge } from './bridge.js';

// The activities that are built. The rest say "coming soon".
const PLAY = { bridge };

// shortcut: emoji stand in for the painted animals, replace as each activity is built.
// x, y: the middle of the spot on the map, in percent.
export const ACTIVITIES = [
  { id: 'bridge', title: 'Bridge for Bunny', emoji: '🐰', pic: 'img/art/woods-bunny.png', x: 12, y: 32 },
  { id: 'bell', title: 'Wake-up Bell', emoji: '🦉', x: 37, y: 20 },
  { id: 'garden', title: 'Water the Garden', emoji: '🌷', x: 63, y: 20 },
  { id: 'stones', title: 'Stepping Stones', emoji: '🦆', x: 88, y: 34 },
  { id: 'seesaw', title: 'Fair Seesaw', emoji: '🐻', x: 33, y: 71 },
  { id: 'umbrella', title: 'Hedgehog’s Umbrella', emoji: '🦔', x: 62, y: 73 },
];

// A real recorded pop for tapping a friend (SoundWeaver's pop-bubble, at its recommended volume).
const popSound = new Audio('audio/sfx/pop-bubble.wav');
popSound.volume = 0.38;
const pop = () => { popSound.currentTime = 0; popSound.play().catch(() => {}); };

export default {
  id: 'woods',
  title: 'Salahs’ Smartspace',
  emoji: '🌳',
  bands: ['little', 'explorer', 'champion'],
  noLives: true,  // no lost lives or timers in Willow Woods
  noStats: true,  // builds, not right-or-wrong answers
  noFit: true,    // the map sizes itself to the screen

  start(ctx) {
    const { root, child } = ctx;
    const band = woodsBand(child);
    const words = WOODS_BANDS[band].showText !== false; // the youngest version has no words on screen
    root.dataset.woods = band;
    const line = 'Welcome to the Smartspace! Who shall we help?';
    root.append(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(line) }, '🔊'),
        words ? el('p', {}, line) : null),
      el('div', { class: 'woods-map' },
        el('span', { class: 'woods-path' }),
        ACTIVITIES.map(a => {
          const stars = child.woodsDone?.[a.id] || 0, ready = PLAY[a.id];
          const open = () => {
            pop();
            if (!ready) { speak([a.title, 'Coming soon!']); toast(words ? `${a.emoji} ${a.title}: coming soon` : `${a.emoji} 🔜`); return; }
            root.replaceChildren();
            ready({ root, band, done(got, message) {
              // Remembered on the child, so the map shows this friend as helped. finish() saves it.
              child.woodsDone = { ...child.woodsDone, [a.id]: Math.max(stars, got) };
              ctx.finish(got, message);
            } });
          };
          return el('button', { class: 'woods-spot', style: `left:${a.x}%;top:${a.y}%`, 'data-state': stars ? 'done' : 'todo',
            'aria-label': ready ? `${a.title}${stars ? `, ${stars} stars` : ''}` : `${a.title}, coming soon`, onclick: open },
            el('span', { class: 'woods-pic' }, a.pic ? el('img', { src: a.pic, alt: '' }) : a.emoji, el('span', { class: 'woods-need' }, stars ? '✓' : '!')),
            words || stars ? el('span', { class: 'woods-lbl' }, words ? a.title : null, stars ? el('span', { class: 'woods-stars' }, '⭐'.repeat(stars)) : null) : null);
        })),
    );
    speak(line);
  },
};
