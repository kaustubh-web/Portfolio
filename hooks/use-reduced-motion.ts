"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** True when the user prefers reduced motion. False during SSR. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
