/* =========================================================
   Game: Quran Listen and Repeat
   Teaches: short surahs and love of the Quran.
   How it works:
     1. Pick a surah.
     2. Each ayah shows in large Arabic. Tap Listen to hear Sheikh Mishary Alafasy.
     3. Repeat x3 plays the ayah three times with a pause to say it back.
     4. Record lets the child hear themselves, then the reciter.
     5. At the end a grown-up can award the surah badge.
   The app does NOT judge recitation: a parent does. Speech recognition
   is not reliable enough for children's Quranic Arabic.
   Bands:
     little   - first 4 surahs, Arabic only, big buttons.
     explorer - all surahs, with transliteration.
     champion - all surahs, transliteration, meaning, and a "hide text"
                button to practise from memory.
   Audio streams from everyayah.com, so it needs internet the first time.
   ========================================================= */
import { el, speak, sfx, toast, askGrownUp } from '../core.js';
import { SURAHS } from '../../data/quran.js';

const AUDIO_BASE = 'https://everyayah.com/data/Alafasy_128kbps/';
const pad = n => String(n).padStart(3, '0');
const audioUrl = (surah, ayah) => `${AUDIO_BASE}${pad(surah)}${pad(ayah)}.mp3`;

export default {
  id: 'quran',
  title: 'Quran Practice',
  emoji: '📖',
  bands: ['little', 'explorer', 'champion'],

  start(ctx) {
    const { root, band, child } = ctx;
    child.badges ??= {};
    const list = band === 'little' ? SURAHS.slice(0, 4) : SURAHS;

    const player = new Audio();
    let stopFlag = false;          // set to stop a repeat or whole-surah run
    let recorder = null;           // active MediaRecorder, if recording
    let lastRecording = null;      // object URL of the child's recording

    // Stop sound if the child leaves the game with the home button.
    const observer = new MutationObserver(() => {
      if (!root.isConnected) { stopAll(); observer.disconnect(); }
    });
    observer.observe(document.getElementById('app'), { childList: true });

    pickSurah();

    /* ---------- Surah list ---------- */
    function pickSurah() {
      stopAll();
      root.replaceChildren(
        el('div', { class: 'prompt' },
          el('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => speak('Pick a surah to practise.') }, '🔊'),
          el('p', {}, 'Pick a surah to practise.')),
        el('div', { class: 'tile-grid' }, list.map(s =>
          el('button', { class: 'tile', style: 'min-height:10rem', onclick: () => { sfx.tap(); openSurah(s); } },
            el('span', { class: 'surah-ar' }, s.arabicName),
            el('span', { class: 'label' }, s.name),
            el('span', { class: 'sub' }, child.badges[s.number] ? '🏅 Badge earned' : `${s.ayat.length} ayat`),
          ))),
      );
      speak('Pick a surah to practise.');
    }

    /* ---------- One surah, one ayah at a time ---------- */
    function openSurah(surah) {
      let i = 0;
      let hideText = false;
      let showTranslit = band !== 'little';
      draw();

      function draw() {
        stopAll();
        const ayah = surah.ayat[i];
        const last = i === surah.ayat.length - 1;

        const ar = el('p', { class: `ayah-ar ${hideText ? 'hidden' : ''}` }, ayah.text);
        const card = el('div', { class: 'ayah-card' },
          el('div', { class: 'ayah-num' }, `${surah.name} · Ayah ${ayah.n} of ${surah.ayat.length}`),
          ar,
          showTranslit ? el('p', { class: 'ayah-tr' }, ayah.translit) : null,
          band === 'champion' ? el('p', { class: 'ayah-en' }, ayah.translation) : null,
        );

        const listenBtn = el('button', { class: 'ctl', onclick: () => { stopAll(); play(surah.number, ayah.n); } }, '▶️ Listen');
        const repeatBtn = el('button', { class: 'ctl', onclick: () => repeat3(surah.number, ayah.n, repeatBtn) }, '🔁 Repeat ×3');
        const recBtn = el('button', { class: 'ctl', onclick: () => toggleRecord(recBtn, surah.number, ayah.n) }, '🎤 Record me');
        const wholeBtn = el('button', { class: 'ctl', onclick: () => playWhole(surah, wholeBtn) }, '📖 Whole surah');

        const extra = [];
        if (band !== 'little') {
          extra.push(el('button', { class: `ctl ${showTranslit ? 'on' : ''}`, onclick: () => { showTranslit = !showTranslit; draw(); } }, 'Aa Sounds'));
        }
        if (band === 'champion') {
          extra.push(el('button', { class: `ctl ${hideText ? 'on' : ''}`, onclick: () => { hideText = !hideText; draw(); } }, '🙈 Hide text'));
        }

        root.replaceChildren(...[
          el('div', { class: 'controls' },
            el('button', { class: 'ctl', onclick: pickSurah }, '⬅️ Surahs'),
            el('button', { class: 'ctl', disabled: i === 0 ? '' : null, onclick: () => { i--; draw(); } }, '◀ Back'),
            el('button', { class: 'ctl', disabled: last ? '' : null, onclick: () => { i++; draw(); } }, 'Next ▶'),
          ),
          card,
          el('div', { class: 'controls' }, listenBtn, repeatBtn, recBtn, wholeBtn, ...extra),
          last ? el('div', { class: 'row' },
            el('button', { class: 'big-btn', onclick: () => finished(surah) }, '✅ I finished the surah!')) : null,
        ].filter(Boolean));
      }
    }

    /* ---------- Audio helpers ---------- */
    function play(surahNo, ayahNo) {
      return new Promise(resolve => {
        player.src = audioUrl(surahNo, ayahNo);
        player.onended = () => resolve(true);
        player.onerror = () => {
          toast('Can’t load the recitation. Check the internet.', 2500);
          resolve(false);
        };
        player.play().catch(() => resolve(false));
      });
    }

    const wait = ms => new Promise(r => setTimeout(r, ms));

    async function repeat3(surahNo, ayahNo, btn) {
      stopAll();
      stopFlag = false;
      btn.classList.add('on');
      for (let n = 0; n < 3 && !stopFlag; n++) {
        const ok = await play(surahNo, ayahNo);
        if (!ok || stopFlag) break;
        // Pause about as long as the ayah, so the child can say it back.
        toast('Your turn! 🗣️', Math.max(2000, player.duration * 1000));
        await wait(Math.max(2000, player.duration * 1000 + 800));
      }
      btn.classList.remove('on');
    }

    async function playWhole(surah, btn) {
      stopAll();
      stopFlag = false;
      btn.classList.add('on');
      // Every surah except Al-Fatihah (where it is ayah 1) starts with Bismillah.
      if (surah.number !== 1) await play(1, 1);
      for (const a of surah.ayat) {
        if (stopFlag) break;
        const ok = await play(surah.number, a.n);
        if (!ok) break;
      }
      btn.classList.remove('on');
    }

    /* ---------- Recording (kept in memory only, never saved or sent) ---------- */
    async function toggleRecord(btn, surahNo, ayahNo) {
      if (recorder) { recorder.stop(); return; }
      stopAll();
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        toast('The microphone is turned off for this app.', 2500);
        return;
      }
      const chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        recorder = null;
        btn.classList.remove('rec');
        btn.textContent = '🎤 Record me';
        if (lastRecording) URL.revokeObjectURL(lastRecording);
        lastRecording = URL.createObjectURL(new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' }));
        // Play the child first, then the reciter, to compare.
        toast('This is you! 👂');
        await new Promise(res => { player.src = lastRecording; player.onended = res; player.onerror = res; player.play().catch(res); });
        await wait(600);
        toast('Now the Sheikh 👂');
        await play(surahNo, ayahNo);
      };
      recorder.start();
      btn.classList.add('rec');
      btn.textContent = '⏹️ Stop';
      toast('Recording… say the ayah!', 2000);
    }

    function stopAll() {
      stopFlag = true;
      player.pause();
      if (recorder) { recorder.onstop = null; recorder.stream.getTracks().forEach(t => t.stop()); recorder.stop(); recorder = null; }
      speechSynthesis?.cancel();
    }

    /* ---------- Finishing a surah ---------- */
    async function finished(surah) {
      stopAll();
      speak('MashaAllah! Ask a grown-up to listen and give you your badge.');
      const ok = await askGrownUp(`Grown-up: did they recite ${surah.name} well? Answer to give the badge.`);
      if (ok) child.badges[surah.number] = true;
      ctx.finish(ok ? 3 : 2, ok
        ? `You earned the ${surah.name} badge! 🏅`
        : `You practised ${surah.name}!`);
    }
  },
};
