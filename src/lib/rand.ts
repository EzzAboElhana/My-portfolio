/**
 * Seeded linear congruential generator.
 *
 * Every generated field — stars, planet surface, ring debris — must come out
 * identical on the server and on the client, or hydration mismatches. That
 * rules out Math.random(), so each generator gets an explicit seed.
 */
export function makeRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
