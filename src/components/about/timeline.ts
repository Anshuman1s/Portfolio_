// Entrance timeline, in seconds. Tune here.
export const STAR_STAGGER = 0.5; // stars fade in across this window
export const STAR_DURATION = 0.5;
export const ICONS_START = 0.6; // first pair appears once the stars are in
export const PAIR_INTERVAL = 0.28;
export const ICON_DURATION = 0.6;

export const EASE_OUT: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

export const pairDelay = (index: number) =>
  ICONS_START + Math.floor(index / 2) * PAIR_INTERVAL;

/** Lines start drawing as the last pair settles. */
export const linesStart = (skillCount: number) =>
  pairDelay(Math.max(0, skillCount - 1)) + ICON_DURATION * 0.6;

/** Deterministic, varied float cycle per icon (seconds). */
export const floatDuration = (index: number) => 6.6 + ((index * 1.37) % 3.2);

// Each pair emerges from a slightly different direction (px).
const PAIR_OFFSETS = [
  { x: -14, y: 10 },
  { x: 12, y: 14 },
  { x: 0, y: -14 },
  { x: -10, y: -10 },
  { x: 14, y: -6 },
] as const;

export const pairOffset = (index: number) =>
  PAIR_OFFSETS[Math.floor(index / 2) % PAIR_OFFSETS.length];
