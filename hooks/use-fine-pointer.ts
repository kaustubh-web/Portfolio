"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/** True on devices with a precise hovering pointer (mouse, trackpad). */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
