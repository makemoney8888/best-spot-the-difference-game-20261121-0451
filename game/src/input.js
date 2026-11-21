// Twin Lanterns — the player's hands: mouse clicks and keyboard, translated into game
// actions. A click is mapped from window pixels to stage coordinates, then either to a
// footer button, an overlay button, or a spot on one of the two pictures. The keyboard
// drives a ring reticle that can cross from one picture to the other, so the whole game is
// playable without a mouse. This file decides nothing about rules — it calls the actions
// main.js gives it.

import { PANEL, STAGE } from './config.js';
import { SCREEN } from './game.js';
import { footerButtons, overlayButton } from './render.js';

function panelOriginX(panel) {
  return panel === 0 ? PANEL.leftX : PANEL.rightX;
}

/** Window pixels → stage coordinates, using the canvas's displayed size. */
export function stagePointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * STAGE.width,
    y: ((event.clientY - rect.top) / rect.height) * STAGE.height,
  };
}

/** A stage point → {panel, x, y} in picture coordinates, or null when it is on neither picture. */
export function panelPointAt(stageX, stageY) {
  if (stageY < PANEL.top || stageY > PANEL.top + PANEL.size) return null;
  for (const panel of [0, 1]) {
    const origin = panelOriginX(panel);
    if (stageX >= origin && stageX <= origin + PANEL.size) {
      return { panel, x: stageX - origin, y: stageY - PANEL.top };
    }
  }
  return null;
}

function pointInRect(x, y, rect) {
  return rect !== null && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function moveReticle(game, dx, dy) {
  const reticle = game.reticle;
  reticle.visible = true;
  let stageX = panelOriginX(reticle.panel) + reticle.x + dx;
  const stageY = PANEL.top + reticle.y + dy;
  stageX = Math.max(PANEL.leftX + 8, Math.min(PANEL.rightX + PANEL.size - 8, stageX));
  const clampedY = Math.max(8, Math.min(PANEL.size - 8, stageY - PANEL.top));
  const hit = panelPointAt(stageX, PANEL.top + clampedY);
  if (hit !== null) {
    reticle.panel = hit.panel;
    reticle.x = hit.x;
    reticle.y = hit.y;
  } else {
    // In the gap between the pictures: keep the side we are on, pinned to its edge.
    reticle.x = Math.max(8, Math.min(PANEL.size - 8, stageX - panelOriginX(reticle.panel)));
    reticle.y = clampedY;
  }
}

/**
 * Wire the canvas and keyboard to the game. `actions` is main.js's set of verbs:
 * check(panel, x, y), primary(), hint(), pause(), restart(), toggleSound().
 */
export function attachInput(canvas, game, actions) {
  canvas.addEventListener('pointerdown', (event) => {
    const point = stagePointFromEvent(canvas, event);
    if (game.screen !== SCREEN.PLAY && game.screen !== SCREEN.PAUSED) {
      if (pointInRect(point.x, point.y, overlayButton(game))) actions.primary();
      return;
    }
    for (const button of footerButtons(game)) {
      if (button.enabled && pointInRect(point.x, point.y, button)) {
        if (button.id === 'hint') actions.hint();
        else if (button.id === 'pause') actions.pause();
        else if (button.id === 'sound') actions.toggleSound();
        else if (button.id === 'restart') actions.restart();
        return;
      }
    }
    if (game.screen !== SCREEN.PLAY) return;
    const hit = panelPointAt(point.x, point.y);
    if (hit !== null) {
      game.reticle.visible = false;
      actions.check(hit.panel, hit.x, hit.y);
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'm' || key === 'M') {
      actions.toggleSound();
      return;
    }
    if (game.screen === SCREEN.PLAY) {
      const step = event.shiftKey ? 3 : 13;
      if (key === 'ArrowLeft') { moveReticle(game, -step, 0); event.preventDefault(); }
      else if (key === 'ArrowRight') { moveReticle(game, step, 0); event.preventDefault(); }
      else if (key === 'ArrowUp') { moveReticle(game, 0, -step); event.preventDefault(); }
      else if (key === 'ArrowDown') { moveReticle(game, 0, step); event.preventDefault(); }
      else if (key === 'Enter' || key === ' ') {
        if (!game.reticle.visible) game.reticle.visible = true;
        else actions.check(game.reticle.panel, game.reticle.x, game.reticle.y);
        event.preventDefault();
      } else if (key === 'h' || key === 'H') actions.hint();
      else if (key === 'p' || key === 'P') actions.pause();
      else if (key === 'r' || key === 'R') actions.restart();
    } else if (game.screen === SCREEN.PAUSED) {
      if (key === 'p' || key === 'P' || key === 'Escape' || key === 'Enter') actions.pause();
    } else if (key === 'Enter' || key === ' ') {
      actions.primary();
      event.preventDefault();
    }
  });
}
