// Twin Lanterns — the staged frames behind ?shot=start|play|late|end, used to take the
// entry's screenshots. Each one sets a real game state (the same objects play produces:
// a found set, a score, a clock, a message) and the renderer paints it, so a screenshot is
// the game itself, frozen — never a mock-up. In every playing frame some differences are
// ringed as found and several are still hiding, with the counter in the header saying how
// many remain, exactly as the bounty asks its screenshots to show.

import { SCENES } from './scenes.js';
import { SCREEN, startLevel } from './game.js';

function markFound(game, indices) {
  for (const index of indices) {
    game.found.add(index);
    game.foundAt[index] = 0;
  }
}

/** Put `game` into the named staged state. Unknown names stage the title screen. */
export function stageShot(game, name) {
  if (name === 'play') {
    // The clockmaker's bench, mid-hunt: three of seven found, the lamp's secret just told.
    startLevel(game, 1);
    markFound(game, [0, 2, 4]);
    game.score = 1350;
    game.levelScore = 300;
    game.timeLeft = 97;
    game.elapsed = 53;
    game.message = SCENES[1].differences[4].why;
    game.messageKind = 'found';
  } else if (name === 'late') {
    // The harbour, late and tense: six of nine found, the clock in its final minute.
    startLevel(game, 2);
    markFound(game, [0, 1, 3, 4, 6, 7]);
    game.score = 2600;
    game.levelScore = 600;
    game.timeLeft = 43;
    game.elapsed = 137;
    game.message = SCENES[2].differences[7].why;
    game.messageKind = 'found';
  } else if (name === 'end') {
    // The harbour completed, the run won: three scenes, their stars, the total.
    startLevel(game, 2);
    markFound(game, SCENES[2].differences.map((difference, index) => index));
    game.stars = [3, 2, 3];
    game.score = 3450;
    game.timeLeft = 38;
    game.elapsed = 142;
    game.screen = SCREEN.VICTORY;
  } else {
    // 'start': the title card over the first scene, untouched.
    game.levelIndex = 0;
    game.screen = SCREEN.TITLE;
  }
  return game;
}
