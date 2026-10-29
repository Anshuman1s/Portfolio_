import { STAR_STAGGER } from "./timeline";

export type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  tone: "ink" | "muted" | "accent";
  twinkle: boolean;
  sparkle: boolean;
  delay: number;
  twinkleDelay: number;
};

// Seeded PRNG so the star field is identical on server and client.
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

const STAR_COUNT = 26;
const random = mulberry32(2026);

export const stars: readonly Star[] = Array.from({ length: STAR_COUNT }, (_, id) => {
  const roll = random();
  return {
    id,
    x: round(4 + random() * 92),
    y: round(4 + random() * 92),
    size: roll > 0.8 ? 4 : roll > 0.45 ? 3 : 2,
    tone: roll > 0.85 ? "accent" : roll > 0.4 ? "muted" : "ink",
    twinkle: id % 3 === 0,
    sparkle: id % 9 === 4,
    delay: round(random() * STAR_STAGGER),
    twinkleDelay: round(random() * 4),
  };
});
