// audio.js — every sound in the game, synthesized live with WebAudio: no
// audio files, no network. The context is created on the first user gesture
// (browsers require that) and every effect is a short oscillator envelope.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

// One tone: frequency in Hz, start delay, duration, waveform and peak gain.
function tone(freq, delay, duration, type = 'sine', peak = 0.16) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(880, 0, 0.22, 'sine', 0.18);
  tone(1318.5, 0.07, 0.3, 'sine', 0.16);
  tone(1760, 0.14, 0.22, 'triangle', 0.08);
}

// A low dull thud for a wrong click.
export function playWrong() {
  tone(160, 0, 0.16, 'square', 0.07);
  tone(110, 0.05, 0.2, 'square', 0.06);
}

// A soft rising blip when a hint is spent.
export function playHint() {
  tone(523.25, 0, 0.12, 'sine', 0.12);
  tone(783.99, 0.09, 0.18, 'sine', 0.12);
}

// A little fanfare arpeggio when a round is cleared.
export function playRoundClear() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.1, 0.28, 'triangle', 0.14));
}

// A longer celebration when the whole game is finished.
export function playGameWin() {
  [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) =>
    tone(f, i * 0.12, 0.32, 'triangle', 0.14),
  );
}

// Two low notes when the clock runs out.
export function playTimeout() {
  tone(392, 0, 0.3, 'sine', 0.14);
  tone(261.63, 0.25, 0.5, 'sine', 0.14);
}
