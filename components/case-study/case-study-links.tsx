"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

import { coverThen, getWorkOrigin, setWorkOrigin } from "@/lib/transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { TransitionLink } from "@/components/shared/transition-link";

type LinkProps = Omit<ComponentProps<typeof TransitionLink>, "href" | "onClick" | "onNavigate">;

/**
 * "← work". When the visitor arrived from this project's card, it steps
 * back through history, so the homepage returns at the exact scroll
 * position with the stack where they left it. Otherwise (direct visit,
 * or after next/prev) it navigates to /#work.
 */
export function BackToWork({ slug, ...props }: LinkProps & { slug: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();

  return (
    <TransitionLink
      href="/#work"
      onClick={(event) => {
        if (getWorkOrigin() !== slug || window.history.length < 2) return;
        event.preventDefault();
        setWorkOrigin(null);
        // Same curtain as a push.
        if (reduced) router.back();
        else coverThen(() => router.back());
      }}
      {...props}
    />
  );
}

/** Next / previous case study. History back now leads to a case study, not the card. */
export function AdjacentLink({ href, ...props }: LinkProps & { href: string }) {
  return <TransitionLink href={href} onNavigate={() => setWorkOrigin(null)} {...props} />;
}
