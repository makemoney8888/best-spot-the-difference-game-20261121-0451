// Twin Lanterns — the sounds, all synthesized with WebAudio: no audio files, nothing to load.
// A find chimes two bright notes, a miss buzzes low, the last seconds tick, and a finished
// scene gets a small arpeggio. The context is created lazily on the first user gesture, as
// browsers require, and every call is safe before that (it simply stays silent).

let audioContext = null;
let muted = false;

export function ensureAudio() {
  if (audioContext === null) {
    try {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (Ctor !== undefined) audioContext = new Ctor();
    } catch {
      audioContext = null;
    }
  }
  if (audioContext !== null && audioContext.state === 'suspended') void audioContext.resume();
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone(frequency, delay, duration, type = 'sine', volume = 0.14) {
  if (muted || audioContext === null) return;
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export function playFind() {
  tone(784, 0, 0.1);
  tone(1175, 0.07, 0.16);
}

export function playMiss() {
  tone(148, 0, 0.17, 'sawtooth', 0.055);
}

export function playTick() {
  tone(1250, 0, 0.035, 'square', 0.035);
}

export function playHint() {
  tone(988, 0, 0.08);
  tone(988, 0.13, 0.1);
}

export function playLevelClear() {
  [523, 659, 784, 1047].forEach((frequency, index) => tone(frequency, index * 0.09, 0.18));
}

export function playGameOver() {
  [392, 330, 262].forEach((frequency, index) => tone(frequency, index * 0.13, 0.2, 'triangle', 0.12));
}
