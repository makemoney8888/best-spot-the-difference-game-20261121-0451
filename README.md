# Twin Lanterns — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/makemoney8888/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/makemoney8888/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game for make.fun's "Best spot the difference game" bounty.
Every scene is told twice: two near-identical pictures side by side, drawn by the same
painters from the same numbers, differing only where the scene's difference list says.
Find them all before the lantern light — the countdown — runs out.

## The hunt

- **Three scenes, rising difficulty:** Lantern Row (5 differences), The Clockmaker's Bench
  (7), Harbour Lights (9) — the later scenes hide theirs smaller and quieter.
- **Click either picture** where the twins disagree. A found difference is ringed on both
  pictures and explains itself ("The wall clock reads three in one picture…").
- **Time pressure you can feel:** a draining bar that pulses and ticks in the last ten
  seconds; a wrong click costs 3 seconds.
- **A hint that behaves:** for 8 seconds of clock, a ring closes in on one difference —
  near enough to search, never exact.
- **Full keyboard play:** arrow keys drive a ring reticle across both pictures, Enter
  checks it, H hints, P pauses, M mutes, R restarts.
- Stars per scene for clean hunts, a time bonus per scene, and one running score.

## How it is built

Plain static files under `game/` — no build step, no network, no libraries. Scenes are
data (`game/src/scenes.js`): a list of painted elements plus a difference list that
patches, hides, or adds one element for the right-hand picture, so the twins can only
differ where the hunt says they do. All art is procedural canvas painting
(`game/src/draw.js`); all sound is synthesized WebAudio (`game/src/sound.js`).

## Run it

```sh
node serve.ts            # serves game/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in: writes out/ + dossier.json
```

Screenshots in `screenshots/` are real frames of the game, staged deterministically
through `game/src/shots.js` (`?shot=play` and friends) and captured from a browser.
