/* Real recorded sounds (SoundWeaver library, MIT), each at its recommended volume. No music, no "wrong" sound. */
const VOL = { 'pop-bubble': .38, 'tap-light': .28, 'select-item': .35, 'whoosh-short': .32, 'success-warm-chime': .48 };
const nodes = {};
export function play(id) {
  const a = nodes[id] ??= Object.assign(new Audio(`audio/sfx/${id}.wav`), { volume: VOL[id] });
  a.currentTime = 0;
  a.play().catch(() => {}); // the browser blocks sound before the first touch
}
