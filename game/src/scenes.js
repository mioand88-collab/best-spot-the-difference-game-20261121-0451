// scenes.js — the three scenes of the game, each drawn procedurally on canvas
// from one function plus a list of seven differences. The left panel is drawn
// with an empty `altered` set; the right panel with every difference id in
// it, so the two pictures are genuinely near-identical. Every difference is
// { id, x, y, r }: its centre in panel coordinates (0..610, 0..600) and the
// click radius around it. No images, no copied art: every shape is drawn here.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function vgrad(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// ---------------------------------------------------------------------------
// Round 1 — Lantern Night Market. A dusk street market: string lights, two
// stalls under striped awnings, paper lanterns, a fruit crate and a cat.
// ---------------------------------------------------------------------------

function drawMarket(ctx, w, h, altered) {
  vgrad(ctx, w, h, [
    [0, '#2b2350'],
    [0.55, '#5b3a6e'],
    [0.8, '#c96f4a'],
    [1, '#3a2438'],
  ]);
  // Stars, kept clear of the moon at (520, 70).
  const stars = [
    [40, 40], [110, 26], [180, 55], [250, 30], [330, 48], [410, 28],
    [470, 55], [560, 30], [60, 100], [200, 90], [360, 80], [580, 120],
  ];
  for (const [x, y] of stars) star(ctx, x, y, 3, '#ffe9a8');

  // Moon: full pale disc, or a crescent when altered.
  circle(ctx, 520, 70, 34, '#ffe9a8');
  circle(ctx, 520, 70, 26, '#ffdf8a');
  if (altered.has('moon')) {
    circle(ctx, 506, 62, 30, '#2f2858'); // bite taken out of the disc
    circle(ctx, 528, 78, 6, '#ffdf8a'); // a crater left showing
  }

  // String lights sagging across the top.
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(305, 150, 610, 96);
  ctx.stroke();
  const bulbXs = [50, 130, 210, 290, 370, 450, 530];
  bulbXs.forEach((x, i) => {
    const y = 96 + Math.sin((x / 610) * Math.PI) * 42 + 8;
    ctx.strokeStyle = '#1c1426';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y);
    ctx.stroke();
    circle(ctx, x, y + 8, 7, i % 2 ? '#ffd94a' : '#ff9d5c');
    circle(ctx, x, y + 8, 3, '#fff6d8');
  });

  // Distant rooftops and a far lantern glow.
  rect(ctx, 0, 430, 610, 170, '#241a33');
  rect(ctx, 30, 400, 90, 34, '#2e2140');
  rect(ctx, 480, 396, 110, 38, '#2e2140');
  circle(ctx, 560, 415, 10, '#ffb347');

  // Ground: cobbled street.
  rect(ctx, 0, 470, 610, 130, '#4a3550');
  ctx.fillStyle = '#5d4666';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      ctx.fillRect(8 + col * 52 + (row % 2) * 26, 482 + row * 30, 44, 3);
    }
  }

  // Left stall: striped awning + counter.
  const awning = altered.has('awning') ? '#2fa8a0' : '#d94f3d';
  for (let i = 0; i < 6; i++) {
    rect(ctx, 40 + i * 34, 150, 34, 42, i % 2 ? '#f7f2e7' : awning);
  }
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 150, 204, 42);
  rect(ctx, 40, 192, 8, 130, '#6b4a2f');
  rect(ctx, 236, 192, 8, 130, '#6b4a2f');
  rect(ctx, 40, 300, 204, 22, '#8a5a34');
  rect(ctx, 40, 322, 204, 110, '#6b4a2f');
  // Jars of sweets on the left counter.
  circle(ctx, 80, 292, 14, '#e2725b');
  circle(ctx, 120, 292, 14, '#7ddc8a');
  circle(ctx, 160, 292, 14, '#ffd94a');
  rect(ctx, 66, 272, 28, 8, '#f7f2e7');
  rect(ctx, 106, 272, 28, 8, '#f7f2e7');
  rect(ctx, 146, 272, 28, 8, '#f7f2e7');

  // Big paper lantern hanging by the left stall: red, or teal when altered.
  const lantern = altered.has('lantern') ? '#2fa8a0' : '#e2483a';
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 192);
  ctx.lineTo(120, 214);
  ctx.stroke();
  ctx.fillStyle = lantern;
  ctx.beginPath();
  ctx.ellipse(120, 246, 34, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(120, 246, 34, 40, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(120, 210);
  ctx.lineTo(120, 282);
  ctx.stroke();
  rect(ctx, 108, 204, 24, 8, '#ffd94a');
  rect(ctx, 108, 284, 24, 8, '#ffd94a');

  // Vendor behind the left counter: hat, face, apron.
  circle(ctx, 205, 250, 20, '#f2c79b');
  ctx.fillStyle = '#3a6ea5';
  ctx.beginPath();
  ctx.arc(205, 244, 22, Math.PI, 0);
  ctx.fill();
  rect(ctx, 181, 240, 48, 6, '#3a6ea5');
  rect(ctx, 188, 268, 34, 60, '#f7f2e7');
  circle(ctx, 198, 254, 2.5, '#1c1426');
  circle(ctx, 212, 254, 2.5, '#1c1426');
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(205, 262, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Price sign hanging between the stalls: "3" coins, or "8" when altered.
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 250);
  ctx.lineTo(300, 268);
  ctx.stroke();
  roundRect(ctx, 268, 268, 64, 56, 8, '#f7f2e7');
  ctx.strokeStyle = '#6b4a2f';
  ctx.strokeRect(268, 268, 64, 56);
  ctx.fillStyle = '#2b2350';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(altered.has('sign') ? '8' : '3', 300, 290);
  ctx.font = '13px Georgia, serif';
  ctx.fillText('coins', 300, 312);

  // Right stall: fruit crate — red apples, or oranges when altered.
  rect(ctx, 380, 380, 180, 26, '#8a5a34');
  rect(ctx, 380, 406, 180, 90, '#6b4a2f');
  ctx.strokeStyle = '#4a2f1c';
  ctx.lineWidth = 2;
  ctx.strokeRect(380, 380, 180, 116);
  const fruit = altered.has('fruit') ? '#ff9d2e' : '#d9382b';
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const fx = 402 + col * 28;
      const fy = 390 + row * 18; // two rows piled on the crate top
      circle(ctx, fx, fy, 11, fruit);
      ctx.strokeStyle = '#3f7a2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 10);
      ctx.lineTo(fx + 4, fy - 16);
      ctx.stroke();
    }
  }
  // Second crate of greens beside it.
  rect(ctx, 380, 516, 90, 60, '#5d7a3a');
  circle(ctx, 405, 510, 9, '#7ddc8a');
  circle(ctx, 430, 510, 9, '#7ddc8a');
  circle(ctx, 452, 510, 9, '#7ddc8a');

  // Balloon tied to the right crate: red, or gone when altered.
  if (!altered.has('balloon')) {
    ctx.strokeStyle = '#f7f2e7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 470);
    ctx.quadraticCurveTo(70, 420, 90, 372);
    ctx.stroke();
    circle(ctx, 90, 344, 26, '#e2483a');
    ctx.fillStyle = '#e2483a';
    ctx.beginPath();
    ctx.moveTo(84, 368);
    ctx.lineTo(96, 368);
    ctx.lineTo(90, 378);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 82, 336, 6, '#ff9d9d');
  }

  // The cat asleep on a crate by the right stall — absent when altered.
  if (!altered.has('cat')) {
    ctx.fillStyle = '#f2a541';
    ctx.beginPath();
    ctx.ellipse(470, 470, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 500, 458, 13, '#f2a541');
    ctx.beginPath();
    ctx.moveTo(492, 448);
    ctx.lineTo(494, 436);
    ctx.lineTo(500, 446);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(502, 446);
    ctx.lineTo(508, 436);
    ctx.lineTo(510, 448);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c47f1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(438, 462);
    ctx.quadraticCurveTo(420, 452, 428, 440);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Round 2 — Harbor at Dusk. A quiet pier: lighthouse, a sailboat, a harbour
// house with lit windows, gulls, a buoy and an anchor.
// ---------------------------------------------------------------------------

function drawHarbor(ctx, w, h, altered) {
  vgrad(ctx, w, h, [
    [0, '#33244f'],
    [0.5, '#8a4a63'],
    [0.62, '#e08a52'],
    [0.7, '#3d5a7a'],
    [1, '#1d3247'],
  ]);
  // Low sun over the sea.
  circle(ctx, 380, 330, 44, '#ffb347');
  circle(ctx, 380, 330, 30, '#ffd94a');
  // Sun glitter on the water.
  ctx.fillStyle = '#ffb347';
  for (const [x, y, len] of [[340, 380, 70], [360, 420, 90], [330, 460, 80], [370, 500, 60]]) {
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y, len, 4);
  }
  ctx.globalAlpha = 1;

  // Sea.
  rect(ctx, 0, 350, 610, 250, '#2c4a63');
  ctx.strokeStyle = '#5d8aa8';
  ctx.lineWidth = 3;
  for (const [y, off] of [[380, 0], [430, 40], [480, 10], [530, 50]]) {
    ctx.beginPath();
    for (let x = 0; x <= 610; x += 20) {
      const yy = y + Math.sin((x + off) / 40) * 5;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // Sky gulls: three, or two when altered.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 3;
  const gulls = [[440, 90], [500, 70], [550, 100]];
  const shownGulls = altered.has('gull') ? gulls.slice(0, 2) : gulls;
  for (const [gx, gy] of shownGulls) {
    ctx.beginPath();
    ctx.arc(gx - 8, gy, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(gx + 8, gy, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // Lighthouse on the left rocks.
  rect(ctx, 150, 300, 100, 50, '#3a2f4a');
  ctx.fillStyle = '#f7f2e7';
  ctx.beginPath();
  ctx.moveTo(170, 300);
  ctx.lineTo(180, 130);
  ctx.lineTo(220, 130);
  ctx.lineTo(230, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(176, 215);
  ctx.lineTo(224, 215);
  ctx.lineTo(226, 185);
  ctx.lineTo(174, 185);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(178, 265);
  ctx.lineTo(222, 265);
  ctx.lineTo(224, 240);
  ctx.lineTo(176, 240);
  ctx.closePath();
  ctx.fill();
  // Lamp room and flag.
  rect(ctx, 176, 104, 48, 28, '#2b2350');
  circle(ctx, 200, 118, 10, altered.has('beam') ? '#3a3a3a' : '#ffe9a8');
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(172, 104);
  ctx.lineTo(200, 84);
  ctx.lineTo(228, 104);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(200, 84);
  ctx.lineTo(200, 52);
  ctx.stroke();
  ctx.fillStyle = altered.has('flag') ? '#2fa8a0' : '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(200, 52);
  ctx.lineTo(236, 60);
  ctx.lineTo(200, 70);
  ctx.closePath();
  ctx.fill();
  // The beam, shining only when not altered.
  if (!altered.has('beam')) {
    ctx.fillStyle = 'rgba(255, 233, 168, 0.35)';
    ctx.beginPath();
    ctx.moveTo(200, 118);
    ctx.lineTo(430, 78);
    ctx.lineTo(430, 158);
    ctx.closePath();
    ctx.fill();
  }

  // Sailboat in the middle of the bay.
  ctx.fillStyle = '#5d3a2e';
  ctx.beginPath();
  ctx.moveTo(300, 420);
  ctx.lineTo(420, 420);
  ctx.lineTo(400, 448);
  ctx.lineTo(320, 448);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2418';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(360, 420);
  ctx.lineTo(360, 300);
  ctx.stroke();
  ctx.fillStyle = altered.has('sail') ? '#d94f3d' : '#f7f2e7';
  ctx.beginPath();
  ctx.moveTo(360, 300);
  ctx.lineTo(360, 410);
  ctx.lineTo(310, 410);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(366, 310);
  ctx.lineTo(366, 410);
  ctx.lineTo(410, 410);
  ctx.closePath();
  ctx.fill();

  // Buoy bobbing near the boat: orange, or green when altered.
  circle(ctx, 470, 500, 16, altered.has('buoy') ? '#3f9e57' : '#ff7a2e');
  ctx.fillStyle = '#f7f2e7';
  ctx.fillRect(462, 488, 16, 6);
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(470, 484);
  ctx.lineTo(470, 472);
  ctx.stroke();

  // Harbour house on the right, with two windows.
  rect(ctx, 470, 300, 130, 130, '#6b4a5e');
  ctx.fillStyle = '#4a2f42';
  ctx.beginPath();
  ctx.moveTo(460, 300);
  ctx.lineTo(535, 250);
  ctx.lineTo(610, 300);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 490, 330, 34, 40, altered.has('window') ? '#2b2350' : '#ffd94a');
  rect(ctx, 550, 330, 34, 40, '#ffd94a');
  ctx.strokeStyle = '#2b2350';
  ctx.lineWidth = 2;
  ctx.strokeRect(490, 330, 34, 40);
  ctx.strokeRect(550, 330, 34, 40);
  ctx.beginPath();
  ctx.moveTo(507, 330);
  ctx.lineTo(507, 370);
  ctx.moveTo(490, 350);
  ctx.lineTo(524, 350);
  ctx.moveTo(567, 330);
  ctx.lineTo(567, 370);
  ctx.moveTo(550, 350);
  ctx.lineTo(584, 350);
  ctx.stroke();
  rect(ctx, 525, 390, 34, 40, '#3a2f4a');

  // Wooden pier along the bottom, with an anchor leaning on it.
  rect(ctx, 0, 520, 610, 80, '#6b4a2f');
  ctx.fillStyle = '#8a5a34';
  for (let x = 0; x < 610; x += 61) ctx.fillRect(x, 520, 4, 80);
  ctx.fillStyle = '#5d3a22';
  for (let x = 20; x < 610; x += 61) ctx.fillRect(x, 548, 20, 4);
  if (!altered.has('anchor')) {
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(120, 478, 18, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(120, 442);
    ctx.lineTo(120, 500);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(98, 452);
    ctx.lineTo(142, 452);
    ctx.stroke();
    circle(ctx, 120, 440, 7, '#2b2b3a');
    circle(ctx, 120, 440, 3, '#6b4a2f');
  }
}

// ---------------------------------------------------------------------------
// Round 3 — Rooftop Festival. A night of paper lanterns over old rooftops:
// laundry lines, potted plants, a kite, fireworks and a cat on a chimney.
// ---------------------------------------------------------------------------

function drawRooftops(ctx, w, h, altered) {
  vgrad(ctx, w, h, [
    [0, '#191230'],
    [0.6, '#2e1e4e'],
    [1, '#1a1430'],
  ]);
  // Stars.
  const stars = [
    [30, 50], [90, 30], [160, 60], [230, 34], [300, 55], [380, 30],
    [440, 58], [520, 34], [580, 60], [70, 110], [260, 100], [560, 130],
  ];
  for (const [x, y] of stars) star(ctx, x, y, 2.5, '#ffe9a8');

  // Firework burst top-centre: gold, or teal when altered.
  const burst = altered.has('firework') ? '#2fd4c0' : '#ffd94a';
  const bx = 350;
  const by = 90;
  ctx.strokeStyle = burst;
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(bx + Math.cos(a) * 10, by + Math.sin(a) * 10);
    ctx.lineTo(bx + Math.cos(a) * 40, by + Math.sin(a) * 40);
    ctx.stroke();
  }
  circle(ctx, bx, by, 7, burst);
  circle(ctx, bx, by, 3, '#fff6d8');

  // Kite in the sky: red diamond, or yellow when altered.
  const kite = altered.has('kite') ? '#ffd94a' : '#e2483a';
  ctx.fillStyle = kite;
  ctx.beginPath();
  ctx.moveTo(480, 82);
  ctx.lineTo(506, 110);
  ctx.lineTo(480, 142);
  ctx.lineTo(454, 110);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f7f2e7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(480, 82);
  ctx.lineTo(480, 142);
  ctx.moveTo(454, 110);
  ctx.lineTo(506, 110);
  ctx.stroke();
  ctx.strokeStyle = '#f7f2e7';
  ctx.beginPath();
  ctx.moveTo(480, 142);
  ctx.quadraticCurveTo(470, 170, 482, 196);
  ctx.stroke();
  circle(ctx, 482, 196, 4, '#f7f2e7');

  // Far rooftops.
  rect(ctx, 0, 330, 200, 270, '#241a3d');
  rect(ctx, 420, 300, 190, 300, '#241a3d');
  rect(ctx, 40, 300, 70, 34, '#2e2140');
  rect(ctx, 480, 268, 80, 36, '#2e2140');

  // Main rooftops: left house and right house with a gap for the alley.
  ctx.fillStyle = '#33254d';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.lineTo(150, 340);
  ctx.lineTo(300, 420);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 0, 420, 300, 180, '#2e2140');
  ctx.fillStyle = '#33254d';
  ctx.beginPath();
  ctx.moveTo(310, 430);
  ctx.lineTo(460, 350);
  ctx.lineTo(610, 430);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 310, 430, 300, 170, '#2e2140');

  // Chimney on the left roof, with smoke — unless altered.
  rect(ctx, 120, 250, 36, 96, '#4a3550');
  rect(ctx, 112, 242, 52, 14, '#5d4666');
  if (!altered.has('smoke')) {
    ctx.fillStyle = 'rgba(220, 210, 235, 0.75)';
    circle(ctx, 140, 222, 12, 'rgba(220, 210, 235, 0.75)');
    circle(ctx, 152, 196, 16, 'rgba(220, 210, 235, 0.6)');
    circle(ctx, 138, 168, 20, 'rgba(220, 210, 235, 0.45)');
    circle(ctx, 156, 142, 14, 'rgba(220, 210, 235, 0.3)');
  }

  // Laundry line between the houses: shirt red, or blue when altered.
  ctx.strokeStyle = '#f7f2e7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 240);
  ctx.lineTo(310, 240);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(150, 240);
  ctx.quadraticCurveTo(230, 268, 310, 240);
  ctx.stroke();
  rect(ctx, 196, 246, 34, 40, '#f7f2e7'); // a white sheet
  rect(ctx, 236, 248, 30, 34, altered.has('shirt') ? '#3a6ea5' : '#d94f3d'); // the shirt
  circle(ctx, 284, 250, 5, '#ffd94a'); // a peg
  rect(ctx, 282, 252, 4, 10, '#ffd94a');

  // Left house window: curtain open, or closed when altered.
  rect(ctx, 60, 460, 60, 70, '#ffd94a');
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 460, 60, 70);
  if (altered.has('curtain')) {
    rect(ctx, 60, 460, 60, 70, '#7a4a6e');
    ctx.strokeStyle = '#5d3552';
    ctx.beginPath();
    ctx.moveTo(90, 460);
    ctx.lineTo(90, 530);
    ctx.stroke();
  } else {
    rect(ctx, 60, 460, 14, 70, '#7a4a6e');
    rect(ctx, 106, 460, 14, 70, '#7a4a6e');
  }
  // Right house window, always lit with a plant in it.
  rect(ctx, 480, 470, 60, 70, '#ffd94a');
  ctx.strokeStyle = '#1c1426';
  ctx.strokeRect(480, 470, 60, 70);
  ctx.fillStyle = '#3f7a2e';
  ctx.beginPath();
  ctx.ellipse(510, 520, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Potted plants on the right roof: three pink flowers, or one when altered.
  rect(ctx, 500, 440, 44, 26, '#b5653a');
  ctx.fillStyle = '#3f7a2e';
  ctx.beginPath();
  ctx.ellipse(522, 432, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const flowers = altered.has('flowers') ? [[522, 420]] : [[508, 424], [522, 414], [536, 424]];
  for (const [fx, fy] of flowers) {
    circle(ctx, fx, fy, 6, '#ff7fa8');
    circle(ctx, fx, fy, 2.5, '#ffd94a');
  }

  // Cat sitting on the right roof: tail up, or curled down when altered.
  ctx.fillStyle = '#2b2b3a';
  ctx.beginPath();
  ctx.ellipse(430, 420, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, 452, 408, 11, '#2b2b3a');
  ctx.beginPath();
  ctx.moveTo(444, 400);
  ctx.lineTo(446, 390);
  ctx.lineTo(451, 398);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(452, 398);
  ctx.lineTo(457, 389);
  ctx.lineTo(459, 399);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (altered.has('tail')) {
    ctx.moveTo(408, 420);
    ctx.quadraticCurveTo(398, 432, 410, 436);
  } else {
    ctx.moveTo(406, 418);
    ctx.quadraticCurveTo(396, 400, 404, 388);
  }
  ctx.stroke();

  // Paper lanterns strung along the bottom of the scene.
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.quadraticCurveTo(305, 596, 610, 560);
  ctx.stroke();
  const lanternXs = [80, 200, 320, 440, 560];
  const lanternColors = ['#e2483a', '#ffd94a', '#e2483a', '#ffd94a', '#e2483a'];
  lanternXs.forEach((x, i) => {
    const y = 560 + Math.sin((x / 610) * Math.PI) * 26 + 10;
    ctx.fillStyle = lanternColors[i];
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd94a';
    ctx.fillRect(x - 2, y - 6, 4, 6);
  });
}

// ---------------------------------------------------------------------------
// The scene table: name, subtitle, draw function and the seven differences.
// ---------------------------------------------------------------------------

export const SCENES = [
  {
    name: 'Lantern Night Market',
    subtitle: 'Round 1 · a dusk street market — the differences are out in the open',
    draw: drawMarket,
    diffs: [
      { id: 'moon', x: 520, y: 70, r: 40 },
      { id: 'lantern', x: 120, y: 246, r: 42 },
      { id: 'cat', x: 470, y: 462, r: 40 },
      { id: 'awning', x: 142, y: 171, r: 42 },
      { id: 'fruit', x: 470, y: 392, r: 40 },
      { id: 'sign', x: 300, y: 296, r: 36 },
      { id: 'balloon', x: 90, y: 344, r: 34 },
    ],
  },
  {
    name: 'Harbor at Dusk',
    subtitle: 'Round 2 · a quiet pier — look closer, the light is fading',
    draw: drawHarbor,
    diffs: [
      { id: 'beam', x: 200, y: 118, r: 42 },
      { id: 'sail', x: 360, y: 355, r: 46 },
      { id: 'gull', x: 550, y: 100, r: 28 },
      { id: 'flag', x: 214, y: 60, r: 26 },
      { id: 'window', x: 507, y: 350, r: 30 },
      { id: 'anchor', x: 120, y: 470, r: 36 },
      { id: 'buoy', x: 470, y: 494, r: 28 },
    ],
  },
  {
    name: 'Rooftop Festival',
    subtitle: 'Round 3 · paper lanterns over the rooftops — the small ones hide well',
    draw: drawRooftops,
    diffs: [
      { id: 'smoke', x: 146, y: 186, r: 40 },
      { id: 'kite', x: 480, y: 112, r: 34 },
      { id: 'shirt', x: 251, y: 265, r: 32 },
      { id: 'flowers', x: 522, y: 420, r: 30 },
      { id: 'firework', x: 350, y: 90, r: 44 },
      { id: 'curtain', x: 90, y: 495, r: 36 },
      { id: 'tail', x: 402, y: 404, r: 26 },
    ],
  },
];

// The full set of difference ids for a round — used to draw the right panel.
export function allDiffIds(scene) {
  return new Set(scene.diffs.map((d) => d.id));
}
