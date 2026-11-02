"use client";

import { useEffect, useLayoutEffect } from "react";

import { site } from "@/content/site";
import { getBoot, skipBoot, useBoot } from "@/hooks/use-boot";

/**
 * Boot log → accent curtain wipe, ≤1.2s, once per session. Visibility and
 * the whole timeline are CSS (gated on html[data-boot], set by the inline
 * boot script), so it plays before hydration. JS only adds skipping:
 * Enter / Esc / Space, the skip button, or a tap anywhere.
 * Never rendered under reduced motion (the boot script skips it).
 */
export function Preloader() {
  const { phase } = useBoot();

  // Dev Strict Mode remounts reset <html> attributes; restore the one the
  // boot script set. No-op in production.
  useLayoutEffect(() => {
    const { attr } = getBoot();
    if (attr) document.documentElement.dataset.boot = attr;
  }, []);

  useEffect(() => {
    if (phase !== "run") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape" || event.key === " ") {
        event.preventDefault();
        skipBoot();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (phase === "off" || phase === "done") return null;

  const lines = site.boot;

  return (
    <div className="boot fixed inset-0 z-(--z-preloader)" onClick={skipBoot}>
      <div className="boot-panel absolute inset-0 bg-bg">
        <div className="container-site absolute inset-x-0 bottom-0 pb-8 font-mono text-sm lg:pb-12">
          <ol aria-hidden className="flex flex-col gap-1 text-fg-muted">
            {lines.map((line, i) => (
              <li
                key={line}
                className="boot-line"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="text-fg-subtle">&gt;</span>{" "}
                <span className={i === lines.length - 1 ? "text-fg" : undefined}>{line}</span>
                {i === lines.length - 1 && (
                  <span className="boot-caret ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-accent" />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-6 flex items-center gap-4">
            <div aria-hidden className="h-1.5 w-full max-w-md bg-line-strong">
              <div className="boot-bar h-full origin-left bg-accent" />
            </div>
            <span aria-hidden className="boot-timer tabular-nums text-fg-muted" />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                skipBoot();
              }}
              className="ml-auto inline-flex h-11 items-center gap-2 text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg"
            >
              [skip <span aria-hidden>↵</span>]
            </button>
          </div>
        </div>
      </div>
      <div aria-hidden className="boot-curtain absolute inset-0 bg-accent" />
    </div>
  );
}
