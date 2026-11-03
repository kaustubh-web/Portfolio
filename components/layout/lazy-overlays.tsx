"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { useOverlay } from "@/lib/events";

const CommandPalette = dynamic(() => import("./command-palette").then((m) => m.CommandPalette), {
  ssr: false,
});
const Terminal = dynamic(() => import("./terminal").then((m) => m.Terminal), { ssr: false });

/**
 * The palette (cmdk) and terminal stay out of the hydration path: they mount
 * once the browser is idle, or straight away if one is requested sooner (the
 * open state lives in the overlay store, so the request isn't lost).
 */
export function LazyOverlays() {
  const requested = useOverlay() !== null;
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    // Safari has no requestIdleCallback.
    const id = setTimeout(() => setIdle(true), 1500);
    return () => clearTimeout(id);
  }, []);

  if (!idle && !requested) return null;
  return (
    <>
      <CommandPalette />
      <Terminal />
    </>
  );
}
