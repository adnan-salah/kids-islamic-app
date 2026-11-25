/* =========================================================
   Game: Willow Woods
   A problem-solving game: help the animals of Willow Woods by
   building simple inventions. Every child plays the same six
   activities; the version (T, A, B, C) follows their age.
   Step 1: the map. The activities come one at a time after this.
   ========================================================= */
import { el, speak, toast } from '../../core.js';
import { WOODS_BANDS, woodsBand } from './bands.js';

// shortcut: emoji stand in for the painted animals, replace as each activity is built.
// x, y: the middle of the spot on the map, in percent.
export const ACTIVITIES = [
  { id: 'bridge', title: 'Bridge for Bunny', emoji: '🐰', x: 12, y: 32 },
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
    const line = 'Welcome to Salahs’ Smartspace! Who shall we help?';
    root.append(
      el('div', { class: 'prompt' },
        el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak(line) }, '🔊'),
        words ? el('p', {}, line) : null),
      el('div', { class: 'woods-map' },
        el('span', { class: 'woods-path' }),
        ACTIVITIES.map(a =>
          el('button', { class: 'woods-spot', style: `left:${a.x}%;top:${a.y}%`, 'data-state': 'todo', 'aria-label': `${a.title}, coming soon`,
            onclick: () => { pop(); speak([a.title, 'Coming soon!']); toast(words ? `${a.emoji} ${a.title}: coming soon` : `${a.emoji} 🔜`); } },
            el('span', { class: 'woods-pic' }, a.emoji, el('span', { class: 'woods-need' }, '!')),
            words ? el('span', { class: 'woods-lbl' }, a.title) : null))),
    );
    speak(line);
  },
};
