// Twin Lanterns — the boot and the heartbeat. main.js fits the fixed-size stage to the
// window, owns the one game state, runs the requestAnimationFrame loop that ticks the rules
// and paints each frame, and connects input's actions to the rules with their sounds. With
// a ?shot= parameter it instead stages one frozen frame for the entry's screenshots and
// never ticks the clock.

import { STAGE } from './config.js';
import {
  SCREEN, createGame, registerClick, spendHint, startLevel, startRun, tickGame, togglePause,
} from './game.js';
import { drawFrame } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';
import {
  ensureAudio, playFind, playGameOver, playHint, playLevelClear, playMiss, playTick, setMuted,
} from './sound.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');
const game = createGame();

function fitCanvasToWindow() {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = STAGE.width * ratio;
  canvas.height = STAGE.height * ratio;
  const scale = Math.min(window.innerWidth / STAGE.width, window.innerHeight / STAGE.height);
  canvas.style.width = `${Math.floor(STAGE.width * scale)}px`;
  canvas.style.height = `${Math.floor(STAGE.height * scale)}px`;
  canvas.style.left = `${Math.floor((window.innerWidth - STAGE.width * scale) / 2)}px`;
  canvas.style.top = `${Math.floor((window.innerHeight - STAGE.height * scale) / 2)}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function announce() {
  if (statusLine !== null) statusLine.textContent = game.message;
}

const actions = {
  check(panel, x, y) {
    ensureAudio();
    const result = registerClick(game, panel, x, y);
    if (result === 'found') playFind();
    else if (result === 'complete') playLevelClear();
    else if (result === 'miss') playMiss();
    announce();
  },
  primary() {
    ensureAudio();
    if (game.screen === SCREEN.TITLE) startRun(game);
    else if (game.screen === SCREEN.PAUSED) togglePause(game);
    else if (game.screen === SCREEN.LEVEL_DONE) startLevel(game, game.levelIndex + 1);
    else if (game.screen === SCREEN.TIME_UP) startLevel(game, game.levelIndex);
    else if (game.screen === SCREEN.VICTORY) startRun(game);
    announce();
  },
  hint() {
    ensureAudio();
    if (spendHint(game)) playHint();
    announce();
  },
  pause() {
    togglePause(game);
  },
  restart() {
    ensureAudio();
    startLevel(game, game.levelIndex);
    announce();
  },
  toggleSound() {
    game.soundOn = !game.soundOn;
    setMuted(!game.soundOn);
  },
};

const shotName = new URLSearchParams(window.location.search).get('shot');
const frozen = shotName !== null;
if (frozen) stageShot(game, shotName);

attachInput(canvas, game, actions);
fitCanvasToWindow();
window.addEventListener('resize', fitCanvasToWindow);
announce();

let previousTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - previousTime) / 1000);
  previousTime = now;
  if (!frozen) {
    const event = tickGame(game, dt);
    if (event === 'tick') playTick();
    else if (event === 'timeup') playGameOver();
  }
  drawFrame(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
