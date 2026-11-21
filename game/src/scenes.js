// Twin Lanterns — the three pictures, and how their twins differ. Each scene is a backdrop, a
// list of elements for draw.js to paint in order, and a list of differences. A difference
// points at one element (by its index in the list) and says how the right picture changes it:
// patchEl merges new parameters into it, hideEl removes it, addEl adds one extra element.
// Each difference also carries its centre and radius in picture coordinates (where a click
// counts, and where the found ring is drawn) and a `why` — the line the game speaks when the
// difference is found, so a find always explains itself.
//
// The hunts grow: five differences under a festival sky, seven in the clockmaker's workshop,
// nine on the night harbour — and the later scenes hide theirs smaller, quieter, and further
// into the corners.

export const SCENES = [
  {
    id: 'lantern-row',
    name: 'Lantern Row',
    subtitle: 'The festival street, drawn twice',
    timeLimit: 120,
    backdropTop: '#2a2350',
    backdropBottom: '#57406b',
    elements: [
      { kind: 'starfield', seed: 11, count: 46, x: 0, y: 0, width: 500, height: 190, colour: '#ffeec9' },
      { kind: 'star', x: 64, y: 56, r: 9, colour: '#fff3c4' },
      { kind: 'moon', x: 418, y: 64, r: 30, phase: 'crescent', colour: '#f5ecc8', skyColour: '#2e2653' },
      { kind: 'cloud', x: 150, y: 70, scale: 1, colour: '#4b3a6e', alpha: 0.8 },
      { kind: 'cloud', x: 330, y: 112, scale: 0.7, colour: '#4b3a6e', alpha: 0.7 },
      { kind: 'skyline', base: 330, colour: '#241b3a', seed: 7, windowColour: '#ffca66' },
      { kind: 'quay', base: 330, colour: '#38294d' },
      {
        kind: 'lanternString', x1: -10, y1: 96, x2: 510, y2: 80, sag: 64, count: 7, r: 15,
        colours: ['#e8542f', '#e8b23a', '#e8542f', '#7fae4c', '#e8542f', '#e8b23a', '#c94f6d'],
      },
      {
        kind: 'stall', x: 36, y: 238, width: 180, height: 150, body: '#5a3a26', trim: '#2e1c10',
        awning: '#2e7f86', sign: 'NOODLE', signColour: '#a33327', lit: true,
      },
      { kind: 'banner', x: 436, y: 150, width: 34, height: 150, colour: '#a33327', glyphs: 4 },
      { kind: 'lanternPost', x: 238, y: 400, height: 120, r: 13, colour: '#e8542f' },
      { kind: 'lanternPost', x: 330, y: 412, height: 104, r: 12, colour: '#e8b23a' },
      { kind: 'crates', x: 238, y: 418, count: 3 },
      { kind: 'barrel', x: 296, y: 428 },
      { kind: 'cat', x: 120, y: 442, scale: 1, colour: '#2c2c38', tail: 'up' },
    ],
    differences: [
      {
        patchEl: 7, at: [176, 143], r: 30,
        patch: { colours: ['#e8542f', '#e8b23a', '#e8b23a', '#7fae4c', '#e8542f', '#e8b23a', '#c94f6d'] },
        why: 'One lantern on the string glows gold in one picture, red in the other.',
      },
      {
        patchEl: 2, at: [418, 64], r: 36, patch: { phase: 'full' },
        why: 'The moon is a crescent in one picture and full in the other.',
      },
      {
        hideEl: 14, at: [120, 424], r: 32,
        why: 'The cat sits by the noodle stall in one picture only.',
      },
      {
        patchEl: 8, at: [126, 258], r: 42, patch: { awning: '#7a4a86' },
        why: "The noodle stall's awning is teal in one picture, plum in the other.",
      },
      {
        hideEl: 1, at: [64, 56], r: 24,
        why: 'The bright star over the rooftops shines in one picture only.',
      },
    ],
  },
  {
    id: 'clockmakers-bench',
    name: "The Clockmaker's Bench",
    subtitle: 'The workshop, drawn twice',
    timeLimit: 150,
    backdropTop: '#6b4a2f',
    backdropBottom: '#4a2f1d',
    elements: [
      { kind: 'roomWall', wall: '#8a6844', wainscot: '#5f4126', floor: '#4c3018', floorY: 392 },
      { kind: 'windowFrame', x: 36, y: 52, width: 118, height: 150, seed: 5 },
      { kind: 'clock', x: 330, y: 118, r: 56, hour: 3, minute: 0 },
      { kind: 'gear', x: 452, y: 96, r: 26, teeth: 9, colour: '#b08a3e', angle: 0.3 },
      { kind: 'gear', x: 196, y: 84, r: 19, teeth: 8, colour: '#8f9096', angle: 0.9 },
      { kind: 'gear', x: 238, y: 112, r: 13, teeth: 7, colour: '#a33327', angle: 0.1 },
      { kind: 'shelf', x: 36, y: 238, width: 200 },
      { kind: 'jar', x: 52, y: 196, width: 26, height: 42, body: 'rgba(205,225,238,0.55)', liquid: '#7fae4c' },
      { kind: 'jar', x: 88, y: 188, width: 30, height: 50, body: 'rgba(205,225,238,0.55)', liquid: '#c94f6d' },
      { kind: 'book', x: 132, y: 192, width: 16, height: 46, colour: '#a33327' },
      { kind: 'book', x: 150, y: 186, width: 14, height: 52, colour: '#2e5f86' },
      { kind: 'book', x: 166, y: 196, width: 15, height: 42, colour: '#7a4a86' },
      { kind: 'shelf', x: 288, y: 238, width: 176 },
      { kind: 'jar', x: 308, y: 200, width: 24, height: 38, body: 'rgba(205,225,238,0.55)', liquid: '#2e5f86' },
      { kind: 'watch', x: 424, y: 252, chain: true },
      { kind: 'bench', x: 60, y: 330, width: 380, height: 52 },
      { kind: 'lamp', x: 330, y: 330, on: true },
      { kind: 'tool', x: 120, y: 322, tool: 'wrench', angle: 0.4 },
      { kind: 'tool', x: 172, y: 324, tool: 'hammer', angle: -0.3 },
      { kind: 'stool', x: 96, y: 428 },
      { kind: 'rug', x: 290, y: 446, width: 250, height: 64, colour: '#a33327' },
      { kind: 'cat', x: 430, y: 452, scale: 0.9, colour: '#57422a', tail: 'down' },
    ],
    differences: [
      {
        patchEl: 2, at: [330, 118], r: 62, patch: { hour: 4, minute: 35 },
        why: 'The wall clock reads three in one picture and half past four in the other.',
      },
      {
        hideEl: 4, at: [196, 84], r: 28,
        why: 'A small grey gear hangs by the window in one picture only.',
      },
      {
        patchEl: 8, at: [103, 213], r: 26, patch: { liquid: '#e8b23a' },
        why: "The tall jar's oil is rose in one picture, amber in the other.",
      },
      {
        patchEl: 10, at: [157, 212], r: 24, patch: { colour: '#3f7a4e' },
        why: 'The middle book is bound in blue in one picture, green in the other.',
      },
      {
        patchEl: 16, at: [362, 278], r: 40, patch: { on: false },
        why: 'The bench lamp burns in one picture and is dark in the other.',
      },
      {
        patchEl: 17, at: [120, 318], r: 26, patch: { tool: 'hammer' },
        why: 'A wrench lies on the bench in one picture, a hammer in the other.',
      },
      {
        patchEl: 20, at: [290, 446], r: 46, patch: { colour: '#2e5f86' },
        why: 'The rug under the bench is red in one picture, blue in the other.',
      },
    ],
  },
  {
    id: 'harbour-lights',
    name: 'Harbour Lights',
    subtitle: 'The night market quay, drawn twice',
    timeLimit: 180,
    backdropTop: '#141d3a',
    backdropBottom: '#1d2c50',
    elements: [
      { kind: 'starfield', seed: 23, count: 60, x: 0, y: 0, width: 500, height: 200, colour: '#dfe8ff' },
      { kind: 'star', x: 88, y: 48, r: 8, colour: '#fff3c4' },
      { kind: 'moon', x: 210, y: 58, r: 24, phase: 'full', colour: '#f5ecc8', skyColour: '#141d3a' },
      { kind: 'cloud', x: 360, y: 56, scale: 0.9, colour: '#26355e', alpha: 0.85 },
      { kind: 'sea', base: 308, colour: '#16263f', seed: 9 },
      { kind: 'lighthouse', x: 44, y: 308, height: 150, beam: true },
      {
        kind: 'boat', x: 250, y: 296, scale: 1.15, hull: '#5a3a26', trim: '#e8b23a',
        sail: '#f3e9d2', stripe: '#b8433a', flag: true, flagColour: '#b8433a',
      },
      {
        kind: 'boat', x: 96, y: 300, scale: 0.62, hull: '#3a4a6b', trim: '#dfe8ff',
        sail: '#e8e2d2', stripe: '#2e5f86', flag: true, flagColour: '#e8b23a',
      },
      { kind: 'quay', base: 392, colour: '#232733' },
      {
        kind: 'stall', x: 300, y: 262, width: 164, height: 130, body: '#4e3428', trim: '#2e1c10',
        awning: '#b8433a', sign: 'FISH', signColour: '#2e5f86', lit: true,
      },
      {
        kind: 'lanternString', x1: 296, y1: 236, x2: 478, y2: 228, sag: 30, count: 6, r: 6,
        colours: ['#ffd98a', '#ffd98a', '#ffd98a', '#ffd98a', '#ffd98a', '#ffd98a'],
      },
      { kind: 'orangeCrate', x: 196, y: 352, count: 7 },
      { kind: 'lanternPost', x: 150, y: 398, height: 110, r: 12, colour: '#e8542f' },
      { kind: 'crates', x: 404, y: 424, count: 2 },
      { kind: 'cat', x: 222, y: 398, scale: 0.85, colour: '#1f1f28', tail: 'up' },
    ],
    differences: [
      {
        patchEl: 5, at: [120, 170], r: 55, patch: { beam: false },
        why: 'The lighthouse beam sweeps the water in one picture; in the other its lamp is dark.',
      },
      {
        patchEl: 6, at: [272, 238], r: 40, patch: { stripe: '#2e7f86' },
        why: "The big boat's sail stripe is red in one picture, teal in the other.",
      },
      {
        patchEl: 7, at: [102, 244], r: 22, patch: { flag: false },
        why: 'The little boat flies a gold flag in one picture only.',
      },
      {
        patchEl: 9, at: [382, 286], r: 40, patch: { awning: '#2e7f86' },
        why: "The fish stall's awning is red in one picture, teal in the other.",
      },
      {
        patchEl: 10, at: [402, 248], r: 24,
        patch: { colours: ['#ffd98a', '#ffd98a', '#ffd98a', '#7fb2ff', '#ffd98a', '#ffd98a'] },
        why: 'One bulb over the fish stall burns blue in one picture, warm in the other.',
      },
      {
        patchEl: 11, at: [228, 362], r: 34, patch: { count: 5 },
        why: 'The crate holds seven oranges in one picture, five in the other.',
      },
      {
        patchEl: 12, at: [176, 308], r: 26, patch: { colour: '#7fae4c' },
        why: 'The quay lamp glows red in one picture, green in the other.',
      },
      {
        hideEl: 1, at: [88, 48], r: 22,
        why: 'The bright star over the harbour shines in one picture only.',
      },
      {
        hideEl: 3, at: [360, 56], r: 40,
        why: 'A slow cloud crosses the moonlit sky in one picture only.',
      },
    ],
  },
];
