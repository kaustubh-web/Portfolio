"use client";

import { useSyncExternalStore } from "react";

/**
 * Which modal overlay is open: the ⌘K palette, the ~ terminal, or neither.
 * One store, so opening one closes the other and any island (navbar hint,
 * footer, palette actions) can open either without prop drilling.
 */
export type Overlay = "palette" | "terminal";

let current: Overlay | null = null;
const listeners = new Set<() => void>();

export function setOverlay(next: Overlay | null) {
  if (next === current) return;
  current = next;
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export const getOverlay = () => current;

export function useOverlay(): Overlay | null {
  return useSyncExternalStore(subscribe, getOverlay, () => null);
}

export const openPalette = () => setOverlay("palette");
export const openTerminal = () => setOverlay("terminal");
export const closeOverlay = () => setOverlay(null);

/** True while focus is in a text field, where shortcuts must type instead. */
export const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
