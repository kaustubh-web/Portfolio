"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { duration, ease, reducedFade, stagger } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type RevealTextProps = {
  /** One string per line. Lines are explicit so splits never depend on layout. */
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p" | "span";
  id?: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Reveal when scrolled into view (default) or immediately on mount. */
  trigger?: "inView" | "mount";
};

/**
 * Line-split masked reveal for headings: each line slides up from behind
 * its own clip. Reduced motion: a 150ms opacity fade.
 */
export function RevealText({
  lines,
  as: Tag = "h2",
  id,
  className,
  lineClassName,
  delay = 0,
  trigger = "inView",
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const shown = trigger === "mount" || inView;

  const variants: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        shown: { opacity: 1, transition: { ...reducedFade, delay } },
      }
    : {
        hidden: { y: "110%" },
        shown: (i: number) => ({
          y: "0%",
          transition: {
            duration: duration.slow,
            ease: ease.out,
            delay: delay + i * stagger.lines,
          },
        }),
      };

  return (
    <Tag ref={ref as React.Ref<never>} id={id} className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={cn("-mb-[0.1em] block overflow-clip pb-[0.1em]", lineClassName)}
        >
          <motion.span
            // Remount once the preference resolves after hydration so the
            // matching initial state applies.
            key={reduced ? "reduced" : "full"}
            className="block"
            custom={i}
            variants={variants}
            initial="hidden"
            animate={shown ? "shown" : "hidden"}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
