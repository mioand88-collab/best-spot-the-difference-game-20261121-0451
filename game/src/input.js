// input.js — mouse and keyboard input: turning a canvas click into a panel
// coordinate, hit-testing it against the current round's differences, and
// turning keys into game actions. It changes state only through state.js and
// plays sounds only through audio.js.

import {
  PANEL_Y,
  PANEL_W,
  PANEL_H,
  LEFT_X,
  RIGHT_X,
} from './config.js';
import { SCENES } from './scenes.js';
import {
  startGame,
  startRound,
  markFound,
  markWrong,
  useHint,
  isLastRound,
} from './state.js';
import {
  ensureAudio,
  playFound,
  playWrong,
  playHint,
  playRoundClear,
  playGameWin,
  playTimeout,
  toggleMute,
} from './audio.js';

// Which panel (if any) a canvas point is inside, with scene coordinates.
function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  const sy = y - PANEL_Y;
  if (x >= LEFT_X && x <= LEFT_X + PANEL_W) return { panel: 'left', x: x - LEFT_X, y: sy };
  if (x >= RIGHT_X && x <= RIGHT_X + PANEL_W) return { panel: 'right', x: x - RIGHT_X, y: sy };
  return null;
}

function insideRect(x, y, rect) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// Handle a click at canvas coordinates (x, y). `button` is the overlay button
// rectangle from the last render, or null. Returns true when the click did
// something, so the caller can redraw immediately.
export function handleClick(state, x, y, button) {
  ensureAudio();
  if (state.screen === 'start') {
    if (insideRect(x, y, button)) {
      startGame(state);
      return true;
    }
    return false;
  }
  if (state.screen === 'roundDone') {
    if (insideRect(x, y, button)) {
      startRound(state, state.roundIndex + 1);
      return true;
    }
    return false;
  }
  if (state.screen === 'gameDone') {
    if (insideRect(x, y, button)) {
      startGame(state);
      return true;
    }
    return false;
  }

  const hit = panelAt(x, y);
  if (!hit) return false;
  const scene = SCENES[state.roundIndex];
  for (const diff of scene.diffs) {
    if (state.found.has(diff.id)) continue;
    const dx = hit.x - diff.x;
    const dy = hit.y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      const completed = markFound(state, diff.id);
      void completed;
      if (state.screen === 'roundDone') {
        if (isLastRound(state)) {
          state.screen = 'gameDone';
          playGameWin();
        } else {
          playRoundClear();
        }
      } else {
        playFound();
      }
      return true;
    }
  }
  // A click inside a panel that found nothing is a wrong click.
  markWrong(state, hit.x, hit.y, hit.panel);
  playWrong();
  return true;
}

// Handle a key press. `button` is the overlay button rectangle (unused here;
// keys act directly). Returns true when the key did something.
export function handleKey(state, key) {
  ensureAudio();
  const k = key.toLowerCase();
  if (k === 'm') {
    toggleMute();
    return true;
  }
  if (k === 'enter' || k === ' ') {
    if (state.screen === 'start') {
      startGame(state);
      return true;
    }
    if (state.screen === 'roundDone') {
      startRound(state, state.roundIndex + 1);
      return true;
    }
    if (state.screen === 'gameDone') {
      startGame(state);
      return true;
    }
    return false;
  }
  if (state.screen !== 'playing') return false;
  if (k === 'r') {
    startRound(state, state.roundIndex);
    return true;
  }
  if (k === 'h') {
    const scene = SCENES[state.roundIndex];
    const unfound = scene.diffs.filter((d) => !state.found.has(d.id)).map((d) => d.id);
    const hinted = useHint(state, unfound);
    if (hinted) playHint();
    return hinted !== null;
  }
  return false;
}

// Called by the game loop when the clock runs out while playing.
export function handleTimeout(state) {
  playTimeout();
}
