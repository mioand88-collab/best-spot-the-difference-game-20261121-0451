// render.js — everything the player sees: the two scene panels, the found
// markers, the hint pulse, the HUD (counter, timer, score, hints) and the
// start / round-complete / game-complete screens. It reads state, it never
// changes it.

import {
  CANVAS_W,
  CANVAS_H,
  HEADER_H,
  PANEL_Y,
  PANEL_W,
  PANEL_H,
  LEFT_X,
  RIGHT_X,
  FOOTER_Y,
  COLORS,
  DIFFS_PER_ROUND,
} from './config.js';
import { SCENES, allDiffIds } from './scenes.js';
import { foundCount } from './state.js';

const EMPTY_SET = new Set();

// Draw one scene panel, clipped to its rectangle with a gold frame.
function drawPanel(ctx, scene, altered, x) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(x, PANEL_Y);
  scene.draw(ctx, PANEL_W, PANEL_H, altered);
  ctx.restore();
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, PANEL_Y, PANEL_W, PANEL_H);
}

function drawFoundMarker(ctx, x, y, ageMs) {
  // A gold ring that pops in, plus a check mark.
  const pop = Math.min(1, ageMs / 180);
  const r = 26 + (1 - pop) * 14;
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * pop;
  ctx.strokeStyle = COLORS.foundRing;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff6d8';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x - 3, y + 10);
  ctx.lineTo(x + 14, y - 10);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, x, y, ageMs) {
  // A soft blue ring that breathes for about 1.4 s.
  const t = ageMs / 1400;
  if (t >= 1) return;
  const r = 20 + 34 * t;
  ctx.save();
  ctx.globalAlpha = 0.9 * (1 - t);
  ctx.strokeStyle = COLORS.hintRing;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.45 * (1 - t);
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.hintRing;
  ctx.fill();
  ctx.restore();
}

function drawWrongFlash(ctx, wrong, now) {
  const age = now - wrong.at;
  if (age > 500) return;
  const baseX = wrong.panel === 'left' ? LEFT_X : RIGHT_X;
  ctx.save();
  ctx.globalAlpha = 1 - age / 500;
  ctx.strokeStyle = COLORS.bad;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const x = baseX + wrong.x;
  const y = PANEL_Y + wrong.y;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, state, now) {
  const scene = SCENES[state.roundIndex];
  ctx.fillStyle = COLORS.frame;
  ctx.fillRect(0, 0, CANVAS_W, HEADER_H);
  ctx.fillStyle = COLORS.frameEdge;
  ctx.fillRect(0, HEADER_H - 3, CANVAS_W, 3);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('Night Market — Spot the Difference', 20, 26);
  ctx.fillStyle = COLORS.dimInk;
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`${scene.name} · Round ${state.roundIndex + 1} of 3`, 20, 50);

  // Found counter, centre.
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.foundRing;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(
    `Found ${foundCount(state)} of ${DIFFS_PER_ROUND}`,
    CANVAS_W / 2,
    26,
  );
  ctx.fillStyle = COLORS.dimInk;
  ctx.font = '14px Georgia, serif';
  ctx.fillText('click a difference in either picture', CANVAS_W / 2, 50);

  // Timer bar, right, with pressure: green, then red under 15 s.
  const total = [90, 75, 60][state.roundIndex];
  const frac = Math.max(0, state.timeLeft / total);
  const low = state.timeLeft <= 15;
  const barX = CANVAS_W - 260;
  const barW = 200;
  ctx.textAlign = 'right';
  ctx.fillStyle = low ? COLORS.timerLow : COLORS.ink;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`${Math.ceil(state.timeLeft)}s`, CANVAS_W - 20, 26);
  ctx.fillStyle = '#3a2f4a';
  ctx.fillRect(barX, 42, barW, 10);
  ctx.fillStyle = low ? COLORS.timerLow : COLORS.timerCalm;
  ctx.fillRect(barX, 42, barW * frac, 10);
  ctx.strokeStyle = COLORS.frameEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, 42, barW, 10);

  // Score and hints, top-right corner under the timer.
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`Score ${state.score}`, CANVAS_W - 260, 18);

  // Footer: hints and keys.
  ctx.fillStyle = COLORS.frame;
  ctx.fillRect(0, FOOTER_Y, CANVAS_W, CANVAS_H - FOOTER_Y);
  ctx.fillStyle = COLORS.frameEdge;
  ctx.fillRect(0, FOOTER_Y, CANVAS_W, 3);
  ctx.fillStyle = COLORS.dimInk;
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'left';
  const hintWord = state.hintsLeft === 1 ? 'hint' : 'hints';
  ctx.fillText(
    `Left picture: the original  ·  Right picture: 7 differences  ·  H — hint (${state.hintsLeft} ${hintWord} left, −25 pts)`,
    20,
    FOOTER_Y + 18,
  );
  ctx.fillText('R — restart round    M — sound on/off', 20, FOOTER_Y + 40);
  ctx.textAlign = 'right';
  ctx.fillText('Round score ' + state.roundScore, CANVAS_W - 20, FOOTER_Y + 18);
}

function drawOverlays(ctx, state, now) {
  if (state.screen === 'start') {
    ctx.fillStyle = 'rgba(16, 10, 28, 0.82)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 52px Georgia, serif';
    ctx.fillText('Night Market', CANVAS_W / 2, 170);
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText('Spot the Difference', CANVAS_W / 2, 220);
    ctx.fillStyle = COLORS.dimInk;
    ctx.font = '19px Georgia, serif';
    ctx.fillText('Two pictures hang side by side in the lantern light.', CANVAS_W / 2, 280);
    ctx.fillText('Seven little things changed between them. Find them all', CANVAS_W / 2, 308);
    ctx.fillText('before the clock runs out — three scenes, harder each time.', CANVAS_W / 2, 336);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '17px Georgia, serif';
    ctx.fillText('Click a difference in either picture  ·  H for a hint (3 per round)', CANVAS_W / 2, 392);
    ctx.fillText('R restarts the round  ·  a wrong click costs 10 points', CANVAS_W / 2, 418);
    // Start button.
    const bx = CANVAS_W / 2 - 130;
    const by = 470;
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.roundRect(bx, by, 260, 64, 12);
    ctx.fill();
    ctx.fillStyle = '#241a33';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('Start playing', CANVAS_W / 2, by + 33);
    ctx.fillStyle = COLORS.dimInk;
    ctx.font = '15px Georgia, serif';
    ctx.fillText('or press Enter', CANVAS_W / 2, by + 96);
    return { button: { x: bx, y: by, w: 260, h: 64 } };
  }

  if (state.screen === 'roundDone' || state.screen === 'gameDone') {
    const last = state.screen === 'gameDone';
    const timedOut = state.screen === 'gameDone' && state.timeLeft <= 0 && state.roundsCleared < 3;
    ctx.fillStyle = 'rgba(16, 10, 28, 0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.textAlign = 'center';
    if (timedOut) {
      ctx.fillStyle = COLORS.bad;
      ctx.font = 'bold 46px Georgia, serif';
      ctx.fillText("Time's up!", CANVAS_W / 2, 200);
      ctx.fillStyle = COLORS.ink;
      ctx.font = '20px Georgia, serif';
      ctx.fillText(
        `You found ${foundCount(state)} of ${DIFFS_PER_ROUND} in ${SCENES[state.roundIndex].name}.`,
        CANVAS_W / 2,
        260,
      );
    } else if (last) {
      ctx.fillStyle = COLORS.foundRing;
      ctx.font = 'bold 46px Georgia, serif';
      ctx.fillText('You found them all!', CANVAS_W / 2, 190);
      ctx.fillStyle = COLORS.ink;
      ctx.font = '20px Georgia, serif';
      ctx.fillText('Three scenes cleared — the market, the harbor, the rooftops.', CANVAS_W / 2, 250);
    } else {
      ctx.fillStyle = COLORS.good;
      ctx.font = 'bold 46px Georgia, serif';
      ctx.fillText('Round complete!', CANVAS_W / 2, 190);
      ctx.fillStyle = COLORS.ink;
      ctx.font = '20px Georgia, serif';
      ctx.fillText(`${SCENES[state.roundIndex].name} — all 7 differences found.`, CANVAS_W / 2, 250);
    }
    ctx.fillStyle = COLORS.ink;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(`Score ${state.score}   ·   ${state.totalFound} differences found`, CANVAS_W / 2, 320);
    if (!timedOut && !last) {
      ctx.fillStyle = COLORS.dimInk;
      ctx.font = '18px Georgia, serif';
      ctx.fillText(`Time bonus +${state.timeBonus} points`, CANVAS_W / 2, 352);
    }
    const label = last || timedOut ? 'Play again' : 'Next round';
    const bx = CANVAS_W / 2 - 130;
    const by = 420;
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.roundRect(bx, by, 260, 64, 12);
    ctx.fill();
    ctx.fillStyle = '#241a33';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(label, CANVAS_W / 2, by + 33);
    ctx.fillStyle = COLORS.dimInk;
    ctx.font = '15px Georgia, serif';
    ctx.fillText('or press Enter', CANVAS_W / 2, by + 96);
    return { button: { x: bx, y: by, w: 260, h: 64 } };
  }
  return { button: null };
}

// The one entry point the game loop calls every frame. Returns the current
// overlay button rectangle (or null) so input can hit-test it.
export function render(ctx, state, now) {
  const scene = SCENES[state.roundIndex];
  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawPanel(ctx, scene, EMPTY_SET, LEFT_X);
  drawPanel(ctx, scene, allDiffIds(scene), RIGHT_X);
  drawHud(ctx, state, now);

  // Markers for found differences, on both panels.
  for (const id of state.foundOrder) {
    const diff = scene.diffs.find((d) => d.id === id);
    if (!diff) continue;
    const age = now - (state.foundAt.get(id) ?? now);
    drawFoundMarker(ctx, LEFT_X + diff.x, PANEL_Y + diff.y, age);
    drawFoundMarker(ctx, RIGHT_X + diff.x, PANEL_Y + diff.y, age);
  }
  // Hint pulse, on both panels.
  if (state.hintPulse) {
    const diff = scene.diffs.find((d) => d.id === state.hintPulse.id);
    if (diff) {
      const age = now - state.hintPulse.at;
      drawHintPulse(ctx, LEFT_X + diff.x, PANEL_Y + diff.y, age);
      drawHintPulse(ctx, RIGHT_X + diff.x, PANEL_Y + diff.y, age);
    }
  }
  // Wrong-click flash.
  if (state.wrongAt) drawWrongFlash(ctx, state.wrongAt, now);

  return drawOverlays(ctx, state, now);
}
