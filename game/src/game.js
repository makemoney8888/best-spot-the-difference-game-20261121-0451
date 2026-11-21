// Twin Lanterns — the rules of the hunt, as a small state machine the renderer only reads.
// A game is: which screen we are on, which scene, which of its differences are found, the
// score, the countdown, and the short-lived marks (a hint ring, a miss flash, a floating
// "+100") that render.js animates. Input calls registerClick / spendHint / togglePause; the
// loop calls tickGame. Every mutating call returns a short event string so main.js can play
// the matching sound without the rules knowing sound exists.

import {
  CLICK_SLACK, FINAL_STRETCH_SECONDS, FIND_POINTS, HINT_COST_SECONDS,
  LEVEL_TIME_BONUS_PER_SECOND, MISS_COST_SECONDS,
} from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSED: 'paused',
  LEVEL_DONE: 'level-done',
  TIME_UP: 'time-up',
  VICTORY: 'victory',
};

const MISS_LINES = [
  'The twins agree there — look again.',
  'No difference there. The clock is not kind.',
  'Same in both. Somewhere else, then.',
];

export function createGame() {
  return {
    screen: SCREEN.TITLE,
    levelIndex: 0,
    found: new Set(),
    foundAt: {},
    score: 0,
    levelScore: 0,
    mistakes: 0,
    hintsUsed: 0,
    timeLeft: 0,
    timeLimit: 0,
    elapsed: 0,
    message: '',
    messageKind: 'info',
    hintMark: null,
    missMarks: [],
    popups: [],
    stars: [],
    lastBonus: 0,
    soundOn: true,
    reticle: { panel: 0, x: 250, y: 250, visible: false },
  };
}

export function currentScene(game) {
  return SCENES[game.levelIndex];
}

export function differencesLeft(game) {
  return currentScene(game).differences.length - game.found.size;
}

/** Begin a whole run from the first scene, score reset. */
export function startRun(game) {
  game.score = 0;
  game.stars = [];
  startLevel(game, 0);
}

/** Set up one scene fresh: nothing found, a full clock, a clean slate of marks. */
export function startLevel(game, levelIndex) {
  const scene = SCENES[levelIndex];
  game.levelIndex = levelIndex;
  game.found = new Set();
  game.foundAt = {};
  game.levelScore = 0;
  game.mistakes = 0;
  game.hintsUsed = 0;
  game.timeLimit = scene.timeLimit;
  game.timeLeft = scene.timeLimit;
  game.elapsed = 0;
  game.hintMark = null;
  game.missMarks = [];
  game.popups = [];
  game.reticle = { panel: 0, x: 250, y: 250, visible: false };
  game.screen = SCREEN.PLAY;
  game.message = `${scene.name}: find the ${scene.differences.length} differences.`;
  game.messageKind = 'info';
}

function starsForLevel(game) {
  const trouble = game.mistakes + game.hintsUsed;
  if (trouble === 0) return 3;
  if (trouble <= 2) return 2;
  return 1;
}

function finishLevel(game) {
  game.lastBonus = Math.round(game.timeLeft) * LEVEL_TIME_BONUS_PER_SECOND;
  game.score += game.lastBonus;
  game.levelScore += game.lastBonus;
  game.stars[game.levelIndex] = starsForLevel(game);
  game.screen = game.levelIndex === SCENES.length - 1 ? SCREEN.VICTORY : SCREEN.LEVEL_DONE;
}

/**
 * A click (or an Enter press) on one picture at picture coordinates. Returns 'found' when it
 * lands on an unfound difference, 'complete' when that was the last one, 'miss' when the
 * twins agree there, and null when the game is not in play.
 */
export function registerClick(game, panel, x, y) {
  if (game.screen !== SCREEN.PLAY) return null;
  const scene = currentScene(game);
  let nearest = null;
  let nearestDistance = Infinity;
  scene.differences.forEach((difference, index) => {
    if (game.found.has(index)) return;
    const distance = Math.hypot(difference.at[0] - x, difference.at[1] - y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { difference, index };
    }
  });
  if (nearest !== null && nearestDistance <= nearest.difference.r + CLICK_SLACK) {
    game.found.add(nearest.index);
    game.foundAt[nearest.index] = game.elapsed;
    game.score += FIND_POINTS;
    game.levelScore += FIND_POINTS;
    game.popups.push({ x: nearest.difference.at[0], y: nearest.difference.at[1] - nearest.difference.r - 8, text: `+${FIND_POINTS}`, age: 0 });
    game.message = nearest.difference.why;
    game.messageKind = 'found';
    if (differencesLeft(game) === 0) {
      finishLevel(game);
      return 'complete';
    }
    return 'found';
  }
  game.mistakes += 1;
  game.timeLeft = Math.max(0, game.timeLeft - MISS_COST_SECONDS);
  game.missMarks.push({ panel, x, y, age: 0 });
  game.message = MISS_LINES[game.mistakes % MISS_LINES.length];
  game.messageKind = 'miss';
  if (game.timeLeft <= 0) game.screen = SCREEN.TIME_UP;
  return 'miss';
}

/**
 * Spend clock on a hint: HINT_COST_SECONDS leave the countdown and a ring closes in on one
 * unfound difference — near enough to search, never exact. Returns false when not in play.
 */
export function spendHint(game) {
  if (game.screen !== SCREEN.PLAY || differencesLeft(game) === 0) return false;
  const scene = currentScene(game);
  const unfound = scene.differences.filter((difference, index) => !game.found.has(index));
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  game.hintsUsed += 1;
  game.timeLeft = Math.max(0, game.timeLeft - HINT_COST_SECONDS);
  game.hintMark = { x: pick.at[0], y: pick.at[1], radius: pick.r, age: 0 };
  game.message = 'The lantern light gathers… somewhere in that ring.';
  game.messageKind = 'info';
  if (game.timeLeft <= 0) game.screen = SCREEN.TIME_UP;
  return true;
}

export function togglePause(game) {
  if (game.screen === SCREEN.PLAY) game.screen = SCREEN.PAUSED;
  else if (game.screen === SCREEN.PAUSED) game.screen = SCREEN.PLAY;
}

/**
 * Advance the clock and the short-lived marks by dt seconds. Returns 'tick' on each whole
 * second of the final stretch (so main.js can tick aloud) and 'timeup' when the clock dies.
 */
export function tickGame(game, dt) {
  for (const mark of game.missMarks) mark.age += dt;
  game.missMarks = game.missMarks.filter((mark) => mark.age < 0.6);
  for (const popup of game.popups) popup.age += dt;
  game.popups = game.popups.filter((popup) => popup.age < 0.95);
  if (game.hintMark !== null) {
    game.hintMark.age += dt;
    if (game.hintMark.age > 1.8) game.hintMark = null;
  }
  if (game.screen !== SCREEN.PLAY) return null;
  const before = Math.ceil(game.timeLeft);
  game.elapsed += dt;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN.TIME_UP;
    return 'timeup';
  }
  const after = Math.ceil(game.timeLeft);
  if (after !== before && game.timeLeft <= FINAL_STRETCH_SECONDS) return 'tick';
  return null;
}

/** Format a number of seconds as m:ss for the header clock. */
export function formatClock(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
