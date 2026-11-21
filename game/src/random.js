// A tiny seeded random number generator (mulberry32). The scenes scatter their stars and
// sparkles from fixed seeds, so the left and right pictures are drawn from the same numbers
// and can only differ where a scene's difference list says they differ — and so a screenshot
// staged from a seed is the same frame every time.

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scatter `count` points in a rectangle from a seed: [{x, y, size}] with size in [0.4, 1]. */
export function scatter(seed, count, x, y, width, height) {
  const next = mulberry32(seed);
  const points = [];
  for (let index = 0; index < count; index += 1) {
    points.push({ x: x + next() * width, y: y + next() * height, size: 0.4 + next() * 0.6 });
  }
  return points;
}
