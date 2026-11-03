"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { coverThen, OPEN_CASE_STUDY, supportsViewTransitions } from "@/lib/transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link for every internal route change. The accent curtain covers
 * the page first, then navigates; RouteCurtain wipes it away once the
 * route commits. The one exception is a card opening its case study in a
 * browser with the View Transitions API: React's <ViewTransition>
 * boundaries morph the preview instead. Reduced motion: instant.
 */
export function TransitionLink({
  href,
  onNavigate,
  scroll,
  transitionTypes,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const morphs = transitionTypes?.includes(OPEN_CASE_STUDY) ?? false;

  return (
    <Link
      href={href}
      scroll={scroll}
      transitionTypes={transitionTypes}
      onNavigate={(event) => {
        onNavigate?.(event);
        if (reduced || (morphs && supportsViewTransitions())) return;
        event.preventDefault();
        coverThen(() => router.push(href, { scroll }));
      }}
      {...props}
    />
  );
}
