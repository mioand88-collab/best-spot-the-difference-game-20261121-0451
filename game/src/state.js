// state.js — the game's mutable state and the rules that change it: which
// screen is showing, which round is running, what has been found, the clock,
// the score and the hints. It knows nothing about drawing or the DOM.

import {
  ROUND_COUNT,
  DIFFS_PER_ROUND,
  HINTS_PER_ROUND,
  ROUND_SECONDS,
  SCORE_PER_FIND,
  SCORE_WRONG_CLICK,
  SCORE_HINT,
  SCORE_TIME_BONUS_PER_SECOND,
} from './config.js';

// Screens: 'start' | 'playing' | 'roundDone' | 'gameDone'
export function newGameState() {
  return {
    screen: 'start',
    roundIndex: 0,
    found: new Set(), // difference ids found in the current round
    foundOrder: [], // ids in the order they were found (for the marker pop)
    foundAt: new Map(), // id -> performance.now() when found (marker animation)
    wrongAt: null, // {x, y, panel, at} of the last wrong click, for the red X flash
    wrongCount: 0,
    hintsLeft: HINTS_PER_ROUND,
    hintPulse: null, // {id, at} of the difference currently being hinted
    score: 0,
    roundScore: 0,
    timeLeft: ROUND_SECONDS[0],
    lastTick: 0,
    totalFound: 0,
    roundsCleared: 0,
    timeBonus: 0,
  };
}

export function startRound(state, roundIndex) {
  state.screen = 'playing';
  state.roundIndex = roundIndex;
  state.found = new Set();
  state.foundOrder = [];
  state.foundAt = new Map();
  state.wrongAt = null;
  state.hintsLeft = HINTS_PER_ROUND;
  state.hintPulse = null;
  state.roundScore = 0;
  state.timeLeft = ROUND_SECONDS[roundIndex];
  state.lastTick = performance.now();
  state.timeBonus = 0;
}

export function startGame(state) {
  state.score = 0;
  state.totalFound = 0;
  state.roundsCleared = 0;
  startRound(state, 0);
}

export function foundCount(state) {
  return state.found.size;
}

export function roundComplete(state) {
  return state.found.size >= DIFFS_PER_ROUND;
}

export function isLastRound(state) {
  return state.roundIndex >= ROUND_COUNT - 1;
}

// Mark a difference found. Returns true when it was newly found.
export function markFound(state, id) {
  if (state.found.has(id)) return false;
  state.found.add(id);
  state.foundOrder.push(id);
  state.foundAt.set(id, performance.now());
  state.totalFound += 1;
  state.score += SCORE_PER_FIND;
  state.roundScore += SCORE_PER_FIND;
  if (roundComplete(state)) {
    state.timeBonus = Math.ceil(state.timeLeft) * SCORE_TIME_BONUS_PER_SECOND;
    state.score += state.timeBonus;
    state.roundScore += state.timeBonus;
    state.roundsCleared += 1;
    state.screen = 'roundDone';
  }
  return true;
}

export function markWrong(state, x, y, panel) {
  state.wrongCount += 1;
  state.score = Math.max(0, state.score + SCORE_WRONG_CLICK);
  state.wrongAt = { x, y, panel, at: performance.now() };
}

// Spend one hint on an unfound difference id. Returns the id or null.
export function useHint(state, unfoundIds) {
  if (state.hintsLeft <= 0 || unfoundIds.length === 0) return null;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score + SCORE_HINT);
  const id = unfoundIds[Math.floor(Math.random() * unfoundIds.length)];
  state.hintPulse = { id, at: performance.now() };
  return id;
}

// Advance the clock by real elapsed time. Returns 'timeout' when time runs out.
export function tickClock(state, now) {
  if (state.screen !== 'playing') {
    state.lastTick = now;
    return null;
  }
  const dt = (now - state.lastTick) / 1000;
  state.lastTick = now;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'gameDone';
    return 'timeout';
  }
  return null;
}
