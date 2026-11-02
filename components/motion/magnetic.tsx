"use client";

import { useRef } from "react";
import { motion, useSpring } from "motion/react";

import { cn } from "@/lib/utils";
import { magnetic, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useFinePointer } from "@/hooks/use-fine-pointer";

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** Fraction of the pointer offset to follow. */
  pull?: number;
  /** Maximum travel in px. */
  max?: number;
};

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

/**
 * Pulls its child toward the pointer. Inert on touch devices and under
 * reduced motion (renders a plain wrapper).
 */
export function Magnetic({
  children,
  className,
  pull = magnetic.pull,
  max = magnetic.max,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const x = useSpring(0, spring.magnetic);
  const y = useSpring(0, spring.magnetic);
  const active = finePointer && !reduced;

  const onPointerMove = (event: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set(clamp((event.clientX - (rect.left + rect.width / 2)) * pull, max));
    y.set(clamp((event.clientY - (rect.top + rect.height / 2)) * pull, max));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={cn("inline-flex", className)}
      style={active ? { x, y } : undefined}
      onPointerMove={active ? onPointerMove : undefined}
      onPointerLeave={active ? reset : undefined}
    >
      {children}
    </motion.span>
  );
}
