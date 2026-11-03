"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

import { spring } from "@/lib/motion";
import { getBoot } from "@/hooks/use-boot";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** `data-cursor` values → pill text. Any other value is shown as-is. */
const LABELS: Record<string, string> = { view: "view ↗", copy: "copy", open: "open" };

const INTERACTIVE = "a, button, [role='button'], summary, label, select";

type Mode = "hidden" | "dot" | "link" | "label";

/** Modal overlays (Radix) lock body scroll; the native cursor returns there. */
const overlayOpen = () => document.body.hasAttribute("data-scroll-locked");

/**
 * Custom cursor: an 8px --fg dot that follows the pointer on the cursor
 * spring and grows into an accent pill over `[data-cursor]` elements.
 * Mouse only: not rendered for touch or coarse pointers, nor under reduced
 * motion. Hides (and gives the native cursor back) while a modal overlay
 * or the boot preloader is up, and when the pointer leaves the window.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  if (!fine || reduced) return null;
  return <CursorLayer />;
}

function CursorLayer() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring.cursor);
  const sy = useSpring(y, spring.cursor);

  useEffect(() => {
    const root = document.documentElement;
    let last: { x: number; y: number } | null = null;
    let frame = 0;

    const show = (next: Mode) => {
      setMode(next);
      // The native cursor hides only while ours is on screen.
      if (next === "hidden") delete root.dataset.cursorOn;
      else root.dataset.cursorOn = "";
    };

    const resolve = (target: Element | null) => {
      if (!last || overlayOpen() || getBoot().phase === "run") return show("hidden");
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        const value = labelled.dataset.cursor ?? "";
        setLabel(LABELS[value] ?? value);
        return show("label");
      }
      show(target?.closest(INTERACTIVE) ? "link" : "dot");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        last = null;
        return show("hidden");
      }
      if (!last) {
        // First sighting: appear under the pointer instead of flying in.
        sx.jump(event.clientX);
        sy.jump(event.clientY);
      }
      last = { x: event.clientX, y: event.clientY };
      x.set(last.x);
      y.set(last.y);
      resolve(event.target as Element);
    };

    // Content moves under a still pointer while scrolling: re-check its target.
    const onScroll = () => {
      if (!last || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (last) resolve(document.elementFromPoint(last.x, last.y));
      });
    };

    const onLeave = () => {
      last = null;
      show("hidden");
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    // Overlays can open from the keyboard while the mouse is still.
    const observer = new MutationObserver(() => {
      if (overlayOpen()) show("hidden");
      else if (last) resolve(document.elementFromPoint(last.x, last.y));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onLeave);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onLeave);
      root.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
      delete root.dataset.cursorOn;
    };
  }, [x, y, sx, sy]);

  return (
    <motion.div
      aria-hidden
      data-mode={mode}
      style={{ x: sx, y: sy }}
      className="cursor pointer-events-none fixed top-0 left-0 z-(--z-cursor)"
    >
      <div
        className="transition-[scale] duration-(--dur-fast) ease-out"
        style={{ scale: pressed ? 0.85 : 1 }}
      >
        <span className="cursor-dot absolute size-2 -translate-1/2 bg-fg" />
        <span className="cursor-label label-meta absolute inline-flex h-8 -translate-1/2 items-center rounded-xs bg-accent px-3 whitespace-nowrap text-on-accent">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
