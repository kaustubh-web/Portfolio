"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { coverThen } from "@/lib/transition";
import { scrollToId } from "@/lib/scroll";
import { useLenis } from "@/hooks/use-lenis";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Programmatic focus for a scroll target, without moving the page again. */
export function focusTarget(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/**
 * Navigation for code paths (palette, terminal) rather than links.
 * `/#id` on the current route scrolls there (Lenis when active) and moves
 * focus to the section; any other route raises the accent curtain, then
 * pushes. Reduced motion: instant either way.
 */
export function useSiteNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const reduced = useReducedMotion();

  return useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const id = url.hash.slice(1);
      if (url.pathname === pathname && id) {
        scrollToId(id, lenis);
        focusTarget(id);
        return;
      }
      const go = () => router.push(href);
      if (reduced) go();
      else coverThen(go);
    },
    [router, pathname, lenis, reduced],
  );
}
