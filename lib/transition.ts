/**
 * Route transitions. Where the View Transitions API exists, React's
 * <ViewTransition> morphs the card preview into the case-study hero; where
 * it doesn't, an accent curtain wipe covers the swap (see RouteCurtain).
 * Server-safe: nothing here touches the DOM at import time.
 */

/** Shared-element name pairing a card's preview with its case-study hero. */
export const mediaTransitionName = (slug: string) => `work-media-${slug}`;

/** Transition type set by card links: the only navigation that morphs. */
export const OPEN_CASE_STUDY = "open-case-study";

/**
 * Props for both ends of the shared preview. Keyed by transition type so the
 * morph runs only when a card opens its case study; back, next/prev and
 * browser history swap instantly (the card may be off screen by then).
 */
export const mediaTransition = (slug: string) =>
  ({
    name: mediaTransitionName(slug),
    share: { [OPEN_CASE_STUDY]: "work-media", default: "none" },
    default: "none",
  }) as const;

export const supportsViewTransitions = () =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

/* ------------------------------------------------------------------ *
 * Where "← work" should return to. A card sets it on click; when the
 * visitor is still on that card's case study, "← work" goes back in
 * history (the browser restores the exact scroll position) instead of
 * pushing a new entry at /#work.
 * ------------------------------------------------------------------ */
let workOrigin: string | null = null;

export function setWorkOrigin(slug: string | null) {
  workOrigin = slug;
}

export const getWorkOrigin = () => workOrigin;

/* ------------------------------------------------------------------ *
 * Curtain store (fallback only). cover → navigate → reveal.
 * Timings mirror `.route-curtain` in app/globals.css.
 * ------------------------------------------------------------------ */
export type CurtainState = "idle" | "cover" | "reveal";

export const CURTAIN_COVER_MS = 420;
export const CURTAIN_REVEAL_MS = 480;
/** Reveal anyway if the new route never commits (failed navigation). */
const CURTAIN_STUCK_MS = 4000;

let curtain: CurtainState = "idle";
let stuck = 0;
const listeners = new Set<() => void>();

function setCurtain(next: CurtainState) {
  curtain = next;
  listeners.forEach((notify) => notify());
}

export function subscribeCurtain(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export const getCurtain = () => curtain;

/** Wipe the curtain up over the page, then run `navigate` once it is opaque. */
export function coverThen(navigate: () => void) {
  if (curtain !== "idle") return;
  setCurtain("cover");
  window.setTimeout(navigate, CURTAIN_COVER_MS);
  stuck = window.setTimeout(revealCurtain, CURTAIN_COVER_MS + CURTAIN_STUCK_MS);
}

/** Called once the new route has committed: wipe the curtain away. */
export function revealCurtain() {
  if (curtain !== "cover") return;
  window.clearTimeout(stuck);
  setCurtain("reveal");
  window.setTimeout(() => setCurtain("idle"), CURTAIN_REVEAL_MS);
}
