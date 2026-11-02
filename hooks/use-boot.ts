"use client";

import { useSyncExternalStore } from "react";

import { BOOT_REVEAL_MS, BOOT_SKIP_MS, BOOT_TOTAL_MS } from "@/lib/boot-config";

/*
 * Boot state, read once from what the inline boot script left on <html>.
 * "run" / "skip" mirror html[data-boot]; "done" means the preloader is
 * gone (the attribute stays, so the hero's CSS delays never change).
 */
export type BootPhase = "pending" | "off" | "run" | "skip" | "done";

export type BootState = {
  phase: BootPhase;
  /** performance.now() at which the hero timeline starts (t0). */
  heroStart: number;
  /** Value html[data-boot] must hold, re-applied after a dev remount. */
  attr: "run" | "skip" | null;
};

const SERVER: BootState = { phase: "pending", heroStart: 0, attr: null };

let state: BootState | null = null;
let doneTimer = 0;
const listeners = new Set<() => void>();

function set(next: BootState) {
  state = next;
  listeners.forEach((notify) => notify());
}

function finishIn(ms: number) {
  window.clearTimeout(doneTimer);
  doneTimer = window.setTimeout(() => {
    if (state) set({ ...state, phase: "done" });
  }, ms);
}

function read(): BootState {
  if (state) return state;
  const root = document.documentElement;
  if (root.dataset.boot !== "run") {
    state = { phase: "off", heroStart: 0, attr: null };
    return state;
  }
  const start = Number(root.dataset.bootT) || 0;
  const remaining = start + BOOT_TOTAL_MS - performance.now();
  state = {
    phase: remaining > 0 ? "run" : "done",
    heroStart: start + BOOT_REVEAL_MS,
    attr: "run",
  };
  if (remaining > 0) finishIn(remaining);
  return state;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getBoot(): BootState {
  return read();
}

/** Skip the boot. Ignored once the hero reveal has started. */
export function skipBoot() {
  const current = read();
  const now = performance.now();
  if (current.phase !== "run" || now >= current.heroStart) return;
  document.documentElement.dataset.boot = "skip";
  set({ phase: "skip", heroStart: now, attr: "skip" });
  finishIn(BOOT_SKIP_MS);
}

/** Boot phase and hero t0. "pending" during SSR and hydration. */
export function useBoot(): BootState {
  return useSyncExternalStore(subscribe, read, () => SERVER);
}
