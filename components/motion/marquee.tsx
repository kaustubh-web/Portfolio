"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type MarqueeProps = {
  /** One entry per item; the track repeats them as needed. */
  items: React.ReactNode[];
  /** Accessible name for the list. */
  label: string;
  className?: string;
  itemClassName?: string;
  /** Pixels per second. */
  speed?: number;
};

/**
 * Infinite linear marquee. Pauses on hover, reverses while the page
 * scrolls up. Reduced motion: a static, wrapping list.
 */
export function Marquee({
  items,
  label,
  className,
  itemClassName,
  speed = 60,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(2);
  const copyWidth = useRef(0);
  const direction = useRef(1);
  const paused = useRef(false);
  const x = useMotionValue(0);

  // Enough copies to always cover the container, re-measured on resize.
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const copy = copyRef.current;
    if (!root || !copy) return;
    const observer = new ResizeObserver(() => {
      copyWidth.current = copy.offsetWidth;
      if (copyWidth.current > 0) {
        setCopies(Math.max(2, Math.ceil(root.offsetWidth / copyWidth.current) + 1));
      }
    });
    observer.observe(root);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [reduced]);

  // Scroll direction sets travel direction.
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 2) direction.current = y > lastY ? 1 : -1;
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  useAnimationFrame((_, delta) => {
    const width = copyWidth.current;
    if (reduced || paused.current || width === 0) return;
    // Clamp the frame delta so a backgrounded tab doesn't jump on return.
    const step = (speed * Math.min(delta, 64)) / 1000;
    let next = x.get() - step * direction.current;
    if (next <= -width) next += width;
    if (next > 0) next -= width;
    x.set(next);
  });

  if (reduced) {
    return (
      <ul aria-label={label} className={cn("flex flex-wrap", className)}>
        {items.map((item, i) => (
          <li key={i} className={itemClassName}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn("overflow-hidden", className)}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <motion.div className="flex w-max" style={{ x }}>
        {Array.from({ length: copies }, (_, copy) => (
          <ul
            key={copy}
            ref={copy === 0 ? copyRef : undefined}
            aria-label={copy === 0 ? label : undefined}
            aria-hidden={copy === 0 ? undefined : true}
            className="flex shrink-0"
          >
            {items.map((item, i) => (
              <li key={i} className={cn("shrink-0", itemClassName)}>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </motion.div>
    </div>
  );
}
