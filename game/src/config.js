// Twin Lanterns — the numbers every other file shares: the stage the game is drawn on, where
// the two pictures sit on it, and the scoring and timing rules. The stage is a fixed 1280x800
// canvas that main.js scales to the window, so every coordinate in the game is in stage units.

export const STAGE = { width: 1280, height: 800 };

/** The two pictures: squares of PANEL.size, drawn at these stage positions. */
export const PANEL = { size: 500, top: 150, leftX: 90, rightX: 690, radius: 18 };

/** The countdown bar under the header, and the header and footer bands around the pictures. */
export const TIMER_BAR = { x: 90, y: 116, width: 1100, height: 14 };
export const FOOTER = { messageY: 692, buttonsY: 722, buttonHeight: 46, buttonWidth: 168, buttonGap: 18 };

/** Scoring: a find pays FIND_POINTS plus a small bonus for a fast pair of eyes; a hint is not
 *  free — it costs clock, so spending one is a real decision under time pressure. */
export const FIND_POINTS = 100;
export const HINT_COST_SECONDS = 8;
export const MISS_COST_SECONDS = 3;
export const LEVEL_TIME_BONUS_PER_SECOND = 2;

/** How generous a click is: a click this many stage units from a difference's centre, beyond
 *  the difference's own radius, still counts — the pictures are dense and eyes are not rulers. */
export const CLICK_SLACK = 6;

/** The last stretch of the countdown, when the bar pulses and the clock ticks aloud. */
export const FINAL_STRETCH_SECONDS = 10;
