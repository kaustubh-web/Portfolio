"use client";

import { useRef, useState, type CSSProperties } from "react";
import { LayoutGroup } from "motion/react";

import { site } from "@/content/site";
import type { ResolvedMedia } from "@/lib/media";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/hooks/use-lenis";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FadeIn } from "@/components/motion";
import { ProjectCard } from "@/components/work/project-card";

/** When the cards stack and pin. Mirrored by `.work-track` / `.work-stack` in globals.css. */
export const STAGE_QUERY = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";

/** Cards: dimmed opacity and scale once covered. */
const COVERED = { scale: 0.92, dim: 0.6 } as const;
/** Scroll held on the last card before the stack unpins, in viewports. */
const HOLD = 0.35;

/**
 * Selected Work. Desktop (motion allowed): a 100svh stage pinned with CSS
 * sticky inside a tall track, its timeline scrubbed by ScrollTrigger. Each
 * card slides up over the last (one viewport of scroll per card) while the
 * covered card scales to .92 and dims, leaving its header strip peeking.
 * Sticky rather than ScrollTrigger's `pin`: the fixed-position swap at pin
 * and unpin registers as a ~0.9 layout shift in Chrome, and sticky never
 * re-parents React's DOM. Phones and reduced motion: a plain list with
 * in-view reveals.
 */
export function WorkStack({ media }: { media: Record<string, ResolvedMedia> }) {
  const { projects } = site;
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLOListElement>(null);
  const staged = useMediaQuery(STAGE_QUERY);
  const lenis = useLenis();
  /** Index of the card on top of the stack; cards below it are covered. */
  const [active, setActive] = useState(0);
  const trigger = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!staged || !track || !stage) return;

      const slots = gsap.utils.toArray<HTMLElement>("[data-stack-slot]", stage);
      const card = (slot: HTMLElement) => slot.querySelector("[data-card]");
      const dim = (slot: HTMLElement) => slot.querySelector("[data-dim]");
      const steps = slots.length - 1;

      // Linear: scroll-scrubbed. Card i slides in over timeline [i-1, i].
      const tl = gsap.timeline({ defaults: { ease: "none", duration: 1 } });
      slots.forEach((slot, i) => {
        if (i === 0) return;
        const prev = slots[i - 1]!;
        tl.fromTo(slot, { y: () => stage.clientHeight - slot.offsetTop }, { y: 0 }, i - 1)
          .to(card(prev), { scale: COVERED.scale }, i - 1)
          .to(dim(prev), { opacity: COVERED.dim }, i - 1);
      });
      tl.to({}, { duration: HOLD });

      let last = -1;
      const sync = () => {
        const next = Math.min(steps, Math.round(tl.time()));
        if (next === last) return;
        last = next;
        setActive(next);
      };

      // The track is (steps + 1 + HOLD) viewports tall; the stage sticks for all but one.
      trigger.current = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: sync,
        onRefresh: sync,
      });

      // Headings above shift once the web fonts swap in.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => {
        trigger.current = null;
      };
    },
    { dependencies: [staged], scope: trackRef, revertOnUpdate: true },
  );

  /**
   * Keyboard focus inside a card: settle the stack with that card on top.
   * Runs after the browser's own scroll-into-view, which would otherwise
   * leave the timeline mid-slide with the focused control half covered.
   */
  const reveal = (index: number, event: React.FocusEvent) => {
    const st = trigger.current;
    if (!st || !(event.target as Element).matches(":focus-visible")) return;
    const y = st.start + ((st.end - st.start) * index) / (projects.length - 1 + HOLD);
    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - y) < 2) return;
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo({ top: y });
    });
  };

  return (
    <LayoutGroup>
      <div
        ref={trackRef}
        className="work-track"
        style={{ "--work-n": projects.length, "--work-hold": HOLD } as CSSProperties}
      >
        <ol ref={stageRef} className="work-stack flex flex-col gap-16 md:gap-24">
          {projects.map((project, i) => {
            const content = (
              <div className="work-card">
                <ProjectCard
                  project={project}
                  media={media[project.slug] ?? {}}
                  staged={staged}
                  covered={staged && i < active}
                  eager={i === 0}
                />
              </div>
            );
            return (
              <li
                key={project.slug}
                data-stack-slot
                className="work-slot"
                style={{ "--i": i } as CSSProperties}
                onFocus={staged ? (event) => reveal(i, event) : undefined}
              >
                {/* The stack's slide-in is the entrance; the list fades in. */}
                {staged ? content : <FadeIn>{content}</FadeIn>}
              </li>
            );
          })}
        </ol>
      </div>
    </LayoutGroup>
  );
}
