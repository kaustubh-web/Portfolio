"use client";

import Link from "next/link";
import { memo, useId, useState } from "react";
import { motion } from "motion/react";

import type { Project } from "@/content/site";
import type { ResolvedMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import { duration, ease, reducedFade, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Magnetic } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { PreviewVideo } from "@/components/work/preview-video";

/** Stack badges shown on phones before collapsing into "+N". */
const MOBILE_BADGES = 4;

const pad = (n: number) => String(n).padStart(2, "0");

function Deployed() {
  return (
    <span className="label-meta inline-flex items-center gap-2 text-fg-muted">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      deployed
    </span>
  );
}

/** Live ↗ (only when deployed) and GitHub ↗, both magnetic, new tab. */
function ProjectLinks({ project, framed }: { project: Project; framed: boolean }) {
  const links = [
    project.liveUrl ? { label: "Live", href: project.liveUrl } : null,
    { label: "GitHub", href: project.repoUrl },
  ].filter((link) => !!link);

  return (
    <ul className={cn("pointer-events-auto flex items-center", framed && "gap-3")}>
      {links.map((link) => (
        <li key={link.label}>
          <Magnetic>
            <a
              href={link.href}
              target="_blank"
              rel="noopener"
              aria-label={`${link.label} — ${project.name}`}
              className={cn(
                "label-meta inline-flex h-11 items-center gap-1.5 rounded-xs transition-colors duration-(--dur-instant)",
                framed
                  ? "border border-line-strong px-4 hover:border-fg"
                  : "px-3 text-fg-muted hover:text-fg",
              )}
            >
              {link.label} <span aria-hidden>↗</span>
            </a>
          </Magnetic>
        </li>
      ))}
    </ul>
  );
}

function StackBadges({ project }: { project: Project }) {
  // "+1" would take the same room as the badge it hides.
  const extra = project.stack.length > MOBILE_BADGES + 1 ? project.stack.length - MOBILE_BADGES : 0;
  const badge = "label-meta h-6 rounded-xs border-line-strong px-2 font-normal text-fg-muted";

  return (
    <ul aria-label={`${project.name} stack`} className="flex flex-wrap gap-1.5">
      {project.stack.map((tech, i) => (
        // Past the cap on phones: visually hidden, still read out.
        <li key={tech} className={cn(extra > 0 && i >= MOBILE_BADGES && "max-md:sr-only")}>
          <Badge variant="outline" className={badge}>
            {tech}
          </Badge>
        </li>
      ))}
      {extra > 0 && (
        <li aria-hidden className="md:hidden">
          <Badge variant="outline" className={badge}>
            +{extra}
          </Badge>
        </li>
      )}
    </ul>
  );
}

type ProjectCardProps = {
  project: Project;
  media: ResolvedMedia;
  /** In the pinned stack (GSAP owns the card's transform). */
  staged: boolean;
  /** Covered by the next card: pause the preview. */
  covered?: boolean;
  /** First card: fetch the poster without waiting for lazy loading. */
  eager?: boolean;
};

/**
 * One Selected Work card: header strip (the part that peeks out of the
 * stack), 16:9 preview, and an info panel that sits over the video on
 * desktop and below it on phones. The whole card links to the case study;
 * links and buttons sit above that link. Memoized: when the stack's top
 * card changes, only the card being covered or uncovered re-renders.
 */
export const ProjectCard = memo(function ProjectCard({
  project,
  media,
  staged,
  covered = false,
  eager = false,
}: ProjectCardProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const listId = useId();
  const layout = reduced ? { duration: 0 } : spring.layout;

  return (
    <motion.article
      data-card
      // Phones: glide when a card above expands. In the stack GSAP owns the transform.
      layout={staged ? false : "position"}
      transition={layout}
      aria-labelledby={titleId}
      className="relative origin-top lg:rounded-lg lg:border lg:border-line-strong lg:bg-bg"
    >
      <header className="label-meta pointer-events-none relative z-2 flex h-(--work-peek) items-center gap-3 text-fg-muted lg:rounded-t-lg lg:border-b lg:border-line lg:bg-surface lg:pr-1 lg:pl-4">
        <span className="text-accent-ink">{project.index}</span>
        <span aria-hidden className="h-px flex-1 bg-line lg:hidden" />
        <span aria-hidden className="max-lg:hidden">
          /
        </span>
        <span className="text-fg lg:text-fg-muted">{project.slug}</span>
        <div className="ml-auto flex items-center gap-4 max-lg:hidden">
          {project.liveUrl && <Deployed />}
          <ProjectLinks project={project} framed={false} />
        </div>
      </header>

      <PreviewVideo
        media={media}
        name={project.name}
        index={project.index}
        slug={project.slug}
        hold={covered}
        eager={eager}
        sizes="(min-width: 1024px) 80vw, 100vw"
        className="rounded-lg lg:rounded-t-none"
        controlClassName="right-2 bottom-2 lg:right-4 lg:bottom-4"
      />

      {/* Card link: covers the card, under the panel's interactive bits. */}
      <Link
        href={`/work/${project.slug}`}
        // TODO(phase 4): drop once /work/[slug] exists; until then prefetching logs 404s.
        prefetch={false}
        data-cursor="view"
        aria-label={`${project.name} — case study`}
        className="group/link absolute inset-0 z-1 rounded-lg"
      >
        <span
          aria-hidden
          className="label-meta pointer-events-none absolute top-1/2 left-2/3 inline-flex h-8 -translate-1/2 scale-90 items-center rounded-xs bg-accent px-3 text-on-accent opacity-0 transition-[opacity,scale] duration-(--dur-fast) ease-out group-hover/link:scale-100 group-hover/link:opacity-100 group-focus-visible/link:scale-100 group-focus-visible/link:opacity-100 max-lg:hidden"
        >
          view ↗
        </span>
      </Link>

      {/* Solid panel, no glass. Grows upward over the video on desktop. */}
      <motion.div
        layout
        transition={layout}
        className="pointer-events-none relative z-2 mt-5 flex flex-col lg:absolute lg:bottom-4 lg:left-4 lg:mt-0 lg:max-h-[calc(100%-var(--work-peek)-2rem)] lg:w-[min(30rem,calc(100%-2rem))] lg:overflow-y-auto lg:bg-surface lg:px-6 lg:pt-6"
      >
        <motion.div layout="position" transition={layout} className="flex flex-col items-start gap-4">
          <h3 id={titleId} className="font-display text-display-m">
            {project.name}
          </h3>
          <p className="max-w-[44ch] text-fg-muted">{project.pitch}</p>
          <StackBadges project={project} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:hidden">
            {project.liveUrl && <Deployed />}
            <ProjectLinks project={project} framed />
          </div>
        </motion.div>

        <motion.button
          layout="position"
          transition={layout}
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="label-meta pointer-events-auto mt-5 flex h-11 w-full items-center justify-between border-t border-line text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg"
        >
          how it works
          <span aria-hidden className="text-fg">
            {open ? "−" : "+"}
          </span>
        </motion.button>

        {open && (
          <motion.ol
            layout="position"
            id={listId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? reducedFade : { duration: duration.base, ease: ease.out }}
            className="flex flex-col gap-3 pb-6 lg:pb-6"
          >
            {project.highlights.map((highlight, i) => (
              <li key={i} className="grid grid-cols-[2rem_1fr] gap-2 text-sm">
                <span aria-hidden className="label-meta pt-0.5 text-accent-ink">
                  {pad(i + 1)}
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </motion.ol>
        )}
      </motion.div>

      {/* Dimmed by the stack timeline as the next card covers this one. */}
      <div
        data-dim
        aria-hidden
        className="pointer-events-none absolute inset-0 z-3 rounded-lg bg-bg opacity-0 max-lg:hidden"
      />
    </motion.article>
  );
});
