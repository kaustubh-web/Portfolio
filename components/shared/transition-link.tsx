"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { coverThen, supportsViewTransitions } from "@/lib/transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link for route changes between the homepage and case studies.
 * With the View Transitions API, React's <ViewTransition> boundaries
 * animate the navigation. Without it, the accent curtain covers the page
 * first, then navigates; RouteCurtain wipes it away once the route commits.
 * Reduced motion: a plain, instant navigation either way.
 */
export function TransitionLink({ href, onNavigate, scroll, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const reduced = useReducedMotion();

  return (
    <Link
      href={href}
      scroll={scroll}
      onNavigate={(event) => {
        onNavigate?.(event);
        if (reduced || supportsViewTransitions()) return;
        event.preventDefault();
        coverThen(() => router.push(href, { scroll }));
      }}
      {...props}
    />
  );
}
