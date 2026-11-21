// main.js — the bootstrap: find the canvas, run the frame loop (clock, then
// render), and wire the canvas and keyboard to input.js. Also exposes a small
// read-only debug handle (window.__spotGame) with the current state and the
// round's difference coordinates, so the game can be play-tested and
// photographed by script; it changes nothing about how the game plays.

import { CANVAS_W, CANVAS_H } from './config.js';
import { SCENES } from './scenes.js';
import { newGameState, tickClock } from './state.js';
import { render } from './render.js';
import { handleClick, handleKey, handleTimeout } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const state = newGameState();
let button = null;

function frame(now) {
  const result = tickClock(state, now);
  if (result === 'timeout') handleTimeout(state);
  button = render(ctx, state, now).button;
  requestAnimationFrame(frame);
}

// Canvas coordinates from a pointer event (the canvas is shown 1:1, but the
// scale math keeps clicks right if the page ever sizes it differently).
function eventPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const { x, y } = eventPoint(event);
  handleClick(state, x, y, button);
});

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const handled = handleKey(state, event.key);
  if (handled) event.preventDefault();
});

// Debug handle for scripted play-testing and screenshots.
window.__spotGame = {
  state,
  scenes: SCENES,
  button: () => button,
};

requestAnimationFrame(frame);
