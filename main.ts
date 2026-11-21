// Twin Lanterns — the hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/ (index.html plus its ES modules; it plays offline
// in a desktop browser and loads nothing over the network). This program copies game/ and
// screenshots/ from beside this file into the output directory and writes dossier.json there
// with buildDossier from the vendored make.fun library, so the judge reads exactly the files
// that were handed in. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below mirror the gate's own limits, so a hand-in this program writes is one the
// scorer can accept: at most 4 screenshots of at most 256 KiB, at most 993 game files and
// 48 MiB of them, no game path over 1,000 bytes, dossier text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
