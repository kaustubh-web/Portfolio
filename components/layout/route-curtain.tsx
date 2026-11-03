"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { getCurtain, revealCurtain, subscribeCurtain } from "@/lib/transition";

/**
 * Accent curtain for browsers without the View Transitions API. A
 * TransitionLink raises it and navigates once it is opaque; when the new
 * pathname commits, it wipes away upward (the boot curtain's motion).
 * Pure CSS animation keyed on `data-state`.
 */
export function RouteCurtain() {
  const state = useSyncExternalStore(subscribeCurtain, getCurtain, () => "idle" as const);
  const pathname = usePathname();

  useEffect(() => {
    revealCurtain();
  }, [pathname]);

  return <div aria-hidden data-state={state} className="route-curtain fixed inset-0 z-(--z-curtain) bg-accent" />;
}
