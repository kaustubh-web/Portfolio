"use client";

import { useEffect } from "react";

import { useLenis } from "@/hooks/use-lenis";

/** Stops smooth scroll while a modal overlay is open, restarts it on close. */
export function useLenisPause(active: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!active || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [active, lenis]);
}
