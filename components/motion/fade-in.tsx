"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

import { duration, ease, reducedFade } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Rise distance in px. */
  y?: number;
};

/** Fades and rises into place once in view. Reduced motion: opacity only. */
export function FadeIn({ children, className, delay = 0, y = 16 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <motion.div
      key={reduced ? "reduced" : "full"}
      ref={ref}
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={
        reduced
          ? { ...reducedFade, delay }
          : { duration: duration.slow, ease: ease.out, delay }
      }
    >
      {children}
    </motion.div>
  );
}
