/**
 * Motion tokens mirrored from app/globals.css for JS-driven animation
 * (motion/react, GSAP). Durations are in seconds.
 */

export const duration = {
  instant: 0.1,
  fast: 0.18,
  base: 0.32,
  slow: 0.64,
  slower: 0.9,
} as const;

export const ease = {
  /** Entrances and reveals. */
  out: [0.16, 1, 0.3, 1],
  /** Curtain and preloader wipes. */
  inOut: [0.76, 0, 0.24, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** GSAP string forms of the same curves. */
export const gsapEase = {
  out: "expo.out",
  inOut: "power4.inOut",
} as const;

export const stagger = {
  letters: 0.025,
  lines: 0.08,
  rows: 0.04,
} as const;

export const spring = {
  magnetic: { stiffness: 150, damping: 15, mass: 0.1 },
  cursor: { stiffness: 500, damping: 40 },
  preview: { stiffness: 200, damping: 25 },
  layout: { type: "spring", bounce: 0, duration: 0.45 },
} as const;

/** Hero graph run, in ms: per Kahn level, per edge fill, and the start
    offset from the hero t0 (docs/PLAN.md → hero timeline). */
export const graphRun = { nodeMs: 180, edgeMs: 220, delayMs: 600 } as const;

/** Magnetic pull: fraction of the pointer offset, capped in px. */
export const magnetic = { pull: 0.3, max: 12 } as const;

/** Every reveal collapses to this under prefers-reduced-motion. */
export const reducedFade = { duration: 0.15, ease: "linear" } as const;
