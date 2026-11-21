// Twin Lanterns — everything that is drawn, in one file: the header with its counter of how
// many differences remain, the countdown bar, the two pictures with their found rings, hint
// ring, miss flashes and floating scores, the footer with its message and buttons, and the
// overlay cards for title, pause, scene-complete, time-up and victory. The layout numbers the
// buttons use live here too (footerButtons / overlayButton), so what input.js hit-tests is
// exactly what this file paints.

import { FOOTER, PANEL, STAGE, TIMER_BAR } from './config.js';
import { drawPanelScene, roundedRect } from './draw.js';
import { SCENES } from './scenes.js';
import { SCREEN, currentScene, differencesLeft, formatClock } from './game.js';

const INK = '#eef1fa';
const FAINT = '#9fb0d0';
const GOLD = '#ffd94d';
const PAPER = '#171f38';
const PANEL_A_X = PANEL.leftX;
const PANEL_B_X = PANEL.rightX;

function panelX(side) {
  return side === 0 ? PANEL_A_X : PANEL_B_X;
}

/** The footer buttons, in draw order; input.js uses the same list to hit-test clicks. */
export function footerButtons(game) {
  const labels = [
    { id: 'hint', label: 'Hint −8s  [H]', enabled: game.screen === SCREEN.PLAY },
    { id: 'pause', label: game.screen === SCREEN.PAUSED ? 'Resume  [P]' : 'Pause  [P]', enabled: game.screen === SCREEN.PLAY || game.screen === SCREEN.PAUSED },
    { id: 'sound', label: game.soundOn ? 'Sound: On  [M]' : 'Sound: Off  [M]', enabled: true },
    { id: 'restart', label: 'Restart  [R]', enabled: game.screen !== SCREEN.TITLE },
  ];
  const totalWidth = labels.length * FOOTER.buttonWidth + (labels.length - 1) * FOOTER.buttonGap;
  const startX = (STAGE.width - totalWidth) / 2;
  return labels.map((button, index) => ({
    ...button,
    x: startX + index * (FOOTER.buttonWidth + FOOTER.buttonGap),
    y: FOOTER.buttonsY,
    width: FOOTER.buttonWidth,
    height: FOOTER.buttonHeight,
  }));
}

/** The one big button on an overlay card, or null while playing. */
export function overlayButton(game) {
  const labels = {
    [SCREEN.TITLE]: 'Start the hunt',
    [SCREEN.PAUSED]: 'Back to the hunt',
    [SCREEN.LEVEL_DONE]: 'Next scene',
    [SCREEN.TIME_UP]: 'Try this scene again',
    [SCREEN.VICTORY]: 'Play again',
  };
  const label = labels[game.screen];
  if (label === undefined) return null;
  return { id: 'primary', label, x: STAGE.width / 2 - 130, y: 596, width: 260, height: 54 };
}

function drawHeader(ctx, game) {
  const scene = currentScene(game);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 27px Georgia, serif';
  ctx.fillText('TWIN LANTERNS', 40, 44);
  ctx.fillStyle = FAINT;
  ctx.font = '17px Georgia, serif';
  ctx.fillText(game.screen === SCREEN.TITLE ? 'A spot-the-difference hunt' : `${scene.name} — ${scene.subtitle}`, 40, 72);

  // The counter the whole game turns on: how many differences remain, big and central,
  // with one dot per difference beneath it, gold for found and hollow for still hiding.
  const left = differencesLeft(game);
  const total = scene.differences.length;
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(game.screen === SCREEN.TITLE ? `${total} TO FIND` : `${left} TO GO`, STAGE.width / 2, 56);
  const dotGap = 26;
  const dotsWidth = (total - 1) * dotGap;
  for (let index = 0; index < total; index += 1) {
    const x = STAGE.width / 2 - dotsWidth / 2 + index * dotGap;
    ctx.beginPath();
    ctx.arc(x, 80, 7, 0, Math.PI * 2);
    if (game.found.has(index)) {
      ctx.fillStyle = GOLD;
      ctx.fill();
    } else {
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = INK;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(`SCORE ${game.score}`, STAGE.width - 40, 46);
  const urgent = game.screen === SCREEN.PLAY && game.timeLeft <= 10;
  ctx.fillStyle = urgent ? '#ff8a75' : FAINT;
  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText(game.screen === SCREEN.TITLE ? `Scene 1 of ${SCENES.length}` : `TIME ${formatClock(game.timeLeft)}`, STAGE.width - 40, 74);
}

function drawTimerBar(ctx, game) {
  roundedRect(ctx, TIMER_BAR.x, TIMER_BAR.y, TIMER_BAR.width, TIMER_BAR.height, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  if (game.timeLimit <= 0) return;
  const fraction = Math.max(0, Math.min(1, game.timeLeft / game.timeLimit));
  const pulsing = game.screen === SCREEN.PLAY && game.timeLeft <= 10;
  ctx.save();
  if (pulsing) ctx.globalAlpha = 0.65 + 0.35 * Math.sin(game.elapsed * 10);
  const gradient = ctx.createLinearGradient(TIMER_BAR.x, 0, TIMER_BAR.x + TIMER_BAR.width, 0);
  gradient.addColorStop(0, '#e8542f');
  gradient.addColorStop(0.5, '#e8b23a');
  gradient.addColorStop(1, '#7fae4c');
  ctx.fillStyle = gradient;
  roundedRect(ctx, TIMER_BAR.x, TIMER_BAR.y, TIMER_BAR.width * fraction, TIMER_BAR.height, 7);
  ctx.fill();
  ctx.restore();
}

function drawFoundRing(ctx, x, y, radius, age) {
  const grow = Math.min(1, age * 3.2);
  const eased = 1 - (1 - grow) * (1 - grow);
  const r = radius * (0.55 + 0.45 * eased);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * eased;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r - 3.4, 0, Math.PI * 2);
  ctx.stroke();
  // A small check riding the ring's top-right, so a found ring never reads as decoration.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  const cx = x + r * 0.72;
  const cy = y - r * 0.72;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy);
  ctx.lineTo(cx - 1.5, cy + 5);
  ctx.lineTo(cx + 7, cy - 5);
  ctx.stroke();
  ctx.restore();
}

function drawOnePanel(ctx, game, scene, side) {
  const x0 = panelX(side);
  ctx.save();
  roundedRect(ctx, x0, PANEL.top, PANEL.size, PANEL.size, PANEL.radius);
  ctx.clip();
  ctx.save();
  ctx.translate(x0, PANEL.top);
  drawPanelScene(ctx, scene, side);
  // Found rings sit on both twins at the same picture spot.
  scene.differences.forEach((difference, index) => {
    if (game.found.has(index)) {
      drawFoundRing(ctx, difference.at[0], difference.at[1], difference.r + 5, game.elapsed - (game.foundAt[index] ?? 0));
    }
  });
  // The hint ring closes in on its difference, wide and pale to narrow and bright.
  if (game.hintMark !== null) {
    const mark = game.hintMark;
    const progress = Math.min(1, mark.age / 1.8);
    const radius = mark.radius + 118 * (1 - progress) + 12;
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.65 * progress;
    ctx.strokeStyle = '#7fd4ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Miss flashes: a brief red cross where the twins agreed.
  for (const mark of game.missMarks) {
    if (mark.panel !== side) continue;
    ctx.save();
    ctx.globalAlpha = 1 - mark.age / 0.6;
    ctx.strokeStyle = '#ff6b57';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mark.x - 10, mark.y - 10);
    ctx.lineTo(mark.x + 10, mark.y + 10);
    ctx.moveTo(mark.x + 10, mark.y - 10);
    ctx.lineTo(mark.x - 10, mark.y + 10);
    ctx.stroke();
    ctx.restore();
  }
  // The keyboard ring, when the player is driving by arrow keys.
  if (game.reticle.visible && game.reticle.panel === side && game.screen === SCREEN.PLAY) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(game.reticle.x, game.reticle.y, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(game.reticle.x, game.reticle.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
  // Frame and caption.
  roundedRect(ctx, x0, PANEL.top, PANEL.size, PANEL.size, PANEL.radius);
  ctx.strokeStyle = 'rgba(255,217,77,0.5)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = FAINT;
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(side === 0 ? '— the first telling —' : '— the second telling —', x0 + PANEL.size / 2, PANEL.top - 10);
}

function drawPopups(ctx, game) {
  ctx.textAlign = 'center';
  for (const popup of game.popups) {
    const rise = popup.age * 34;
    const alpha = popup.age < 0.6 ? 1 : 1 - (popup.age - 0.6) / 0.35;
    for (const x0 of [PANEL_A_X, PANEL_B_X]) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = GOLD;
      ctx.font = 'bold 25px Georgia, serif';
      ctx.fillText(popup.text, x0 + popup.x, PANEL.top + popup.y - rise);
      ctx.restore();
    }
  }
}

function drawFooter(ctx, game) {
  ctx.textAlign = 'center';
  ctx.fillStyle = game.messageKind === 'found' ? GOLD : game.messageKind === 'miss' ? '#ff9a8a' : '#cfd8ea';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(game.message, STAGE.width / 2, FOOTER.messageY);
  for (const button of footerButtons(game)) {
    roundedRect(ctx, button.x, button.y, button.width, button.height, 10);
    ctx.fillStyle = button.enabled ? '#232f52' : 'rgba(35,47,82,0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(159,176,208,0.5)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = button.enabled ? INK : FAINT;
    ctx.font = '17px Georgia, serif';
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2 + 6);
  }
}

function star(ctx, x, y, radius, filled) {
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = (point * Math.PI) / 5 - Math.PI / 2;
    const r = point % 2 === 0 ? radius : radius * 0.45;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (point === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = GOLD;
    ctx.fill();
  } else {
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawOverlayCard(ctx, game, title, lines) {
  ctx.fillStyle = 'rgba(7,10,20,0.66)';
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const card = { x: STAGE.width / 2 - 330, y: 196, width: 660, height: 452 };
  roundedRect(ctx, card.x, card.y, card.width, card.height, 20);
  ctx.fillStyle = PAPER;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText(title, STAGE.width / 2, card.y + 84);
  ctx.fillStyle = INK;
  ctx.font = '20px Georgia, serif';
  lines.forEach((line, index) => {
    ctx.fillText(line, STAGE.width / 2, card.y + 138 + index * 30);
  });
  const button = overlayButton(game);
  if (button !== null) {
    roundedRect(ctx, button.x, button.y, button.width, button.height, 12);
    ctx.fillStyle = '#a33327';
    ctx.fill();
    ctx.fillStyle = '#fdf6e0';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2 + 8);
  }
}

function drawOverlay(ctx, game) {
  const scene = currentScene(game);
  if (game.screen === SCREEN.TITLE) {
    drawOverlayCard(ctx, game, 'Twin Lanterns', [
      'Two tellings of every picture. They differ — a little.',
      'Click where the twins disagree, on either picture.',
      'A wrong click costs 3 seconds. A hint costs 8, and only narrows the search.',
      'Arrow keys move the ring; Enter checks it. H hints, P pauses, M mutes.',
      '',
      `Scene 1 · Lantern Row — ${SCENES[0].differences.length} differences`,
      `Scene 2 · The Clockmaker's Bench — ${SCENES[1].differences.length} differences`,
      `Scene 3 · Harbour Lights — ${SCENES[2].differences.length} differences`,
    ]);
  } else if (game.screen === SCREEN.PAUSED) {
    drawOverlayCard(ctx, game, 'Paused', ['The lanterns wait. The clock does not run.']);
  } else if (game.screen === SCREEN.LEVEL_DONE) {
    drawOverlayCard(ctx, game, 'Scene Complete!', [
      `${scene.name}: every difference found.`,
      `Time bonus +${game.lastBonus} · Scene score ${game.levelScore}`,
      `Mistakes ${game.mistakes} · Hints ${game.hintsUsed}`,
      '',
      'Your stars for this scene:',
    ]);
    const earned = game.stars[game.levelIndex] ?? 0;
    for (let index = 0; index < 3; index += 1) star(ctx, STAGE.width / 2 - 52 + index * 52, 478, 22, index < earned);
  } else if (game.screen === SCREEN.TIME_UP) {
    drawOverlayCard(ctx, game, 'The Light Goes Out', [
      `Time is up on ${scene.name}.`,
      `${game.found.size} of ${scene.differences.length} differences were found.`,
      'The twins keep their secrets — this time.',
    ]);
  } else if (game.screen === SCREEN.VICTORY) {
    const lines = [`Every difference in every scene — found. Total score ${game.score}.`, ''];
    SCENES.forEach((each, index) => {
      lines.push(`${each.name} — ${'★'.repeat(game.stars[index] ?? 0)}${'☆'.repeat(3 - (game.stars[index] ?? 0))}`);
    });
    drawOverlayCard(ctx, game, 'Every Twin Told True', lines);
  }
}

/** Paint one whole frame of the game for the state it is in. */
export function drawFrame(ctx, game) {
  ctx.fillStyle = '#10182b';
  ctx.fillRect(0, 0, STAGE.width, STAGE.height);
  const scene = currentScene(game);
  drawHeader(ctx, game);
  drawTimerBar(ctx, game);
  drawOnePanel(ctx, game, scene, 0);
  drawOnePanel(ctx, game, scene, 1);
  drawPopups(ctx, game);
  drawFooter(ctx, game);
  if (game.screen !== SCREEN.PLAY) drawOverlay(ctx, game);
}
