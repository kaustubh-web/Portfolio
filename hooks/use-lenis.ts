"use client";

import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/* Tiny external store so any component can reach the Lenis instance
   (or null when smooth scroll is off) without prop drilling. */
let current: Lenis | null = null;
const listeners = new Set<() => void>();

export function setLenis(instance: Lenis | null) {
  current = instance;
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** The active Lenis instance, or null under reduced motion / before mount. */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
