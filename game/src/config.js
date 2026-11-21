// config.js — the fixed numbers every other module shares: canvas size, panel
// geometry, round timing, scoring and the palette of the night-market theme.
// Nothing here draws or listens; it only names the constants.

export const CANVAS_W = 1280;
export const CANVAS_H = 760;

export const HEADER_H = 64;
export const PANEL_Y = 76;
export const PANEL_W = 610;
export const PANEL_H = 600;
export const PANEL_GAP = 20;
export const LEFT_X = 20;
export const RIGHT_X = LEFT_X + PANEL_W + PANEL_GAP; // 650
export const FOOTER_Y = 692;
export const FOOTER_H = 52;

export const ROUND_COUNT = 3;
export const DIFFS_PER_ROUND = 7;
export const HINTS_PER_ROUND = 3;

// Seconds on the clock for each round, in round order (1, 2, 3).
export const ROUND_SECONDS = [90, 75, 60];

export const SCORE_PER_FIND = 100;
export const SCORE_WRONG_CLICK = -10;
export const SCORE_HINT = -25;
export const SCORE_TIME_BONUS_PER_SECOND = 5;

export const COLORS = {
  page: '#14101f',
  frame: '#241d38',
  frameEdge: '#4a3a6e',
  panelEdge: '#f5d76e',
  ink: '#f7f2e7',
  dimInk: '#c9bdd6',
  accent: '#ffb347',
  accentDeep: '#e2725b',
  good: '#7ddc8a',
  bad: '#ff6b6b',
  timerCalm: '#7ddc8a',
  timerLow: '#ff6b6b',
  foundRing: '#ffd94a',
  hintRing: '#7fd4ff',
};
