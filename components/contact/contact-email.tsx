"use client";

import { useEffect, useRef } from "react";

import { site } from "@/content/site";
import { copyEmail } from "@/lib/clipboard";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Serif glyphs of about one width (no m/w), so a scrambled cell barely overflows its slot. */
const GLYPHS = "abcdeghknopqrsuvxyz0123456789";
/** Whole scramble, and how often an unresolved glyph changes, in ms. */
const SCRAMBLE_MS = 640;
const FLICKER_MS = 45;

const { email } = site.profile;
const at = email.indexOf("@");
/** The address breaks only before "@" (phones); each part stays on one line. */
const parts = [
  { offset: 0, text: email.slice(0, at) },
  { offset: at, text: email.slice(at) },
];
const isStable = (char: string) => char === "@" || char === ".";

/**
 * The contact headline: a button that copies the email (toast). Hover or
 * focus scrambles it, resolving left to right. Each glyph sits in a cell
 * sized by the real character, so scrambling never shifts layout.
 * Reduced motion: no scramble.
 */
export function ContactEmail() {
  const reduced = useReducedMotion();
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const frame = useRef(0);

  const settle = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    cells.current.forEach((cell, i) => {
      if (!cell) return;
      cell.textContent = email[i]!;
      delete cell.dataset.scrambled;
    });
  };

  const scramble = () => {
    if (reduced || frame.current) return;
    const start = performance.now();
    let lastFlicker = -Infinity;
    const step = (now: number) => {
      const elapsed = now - start;
      const flicker = now - lastFlicker >= FLICKER_MS;
      if (flicker) lastFlicker = now;
      cells.current.forEach((cell, i) => {
        if (!cell || isStable(email[i]!)) return;
        if (elapsed >= ((i + 1) / email.length) * SCRAMBLE_MS) {
          cell.textContent = email[i]!;
          delete cell.dataset.scrambled;
        } else if (flicker) {
          cell.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
          cell.dataset.scrambled = "";
        }
      });
      if (elapsed < SCRAMBLE_MS) frame.current = requestAnimationFrame(step);
      else settle();
    };
    frame.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <button
      type="button"
      onClick={copyEmail}
      onPointerEnter={scramble}
      onFocus={scramble}
      data-cursor="copy"
      aria-label={`Copy email address ${email}`}
      className="-mx-1 block max-w-full px-1 text-left font-display text-display-xl"
    >
      <span aria-hidden>
        {parts.map(({ offset, text }) => (
          <span key={offset} className="inline-block whitespace-nowrap">
            {Array.from(text).map((char, j) => {
              const index = offset + j;
              return (
                <span key={index} className="relative inline-block">
                  <span className="invisible">{char}</span>
                  <span
                    ref={(el) => {
                      cells.current[index] = el;
                    }}
                    className="absolute inset-0 text-center data-scrambled:text-accent-ink"
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </button>
  );
}
