import type { CSSProperties } from "react";

import { getSection, sectionLabel, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { LiveClock } from "@/components/shared/live-clock";
import { HeroActions } from "@/components/hero/hero-actions";
import { PipelineGraph } from "@/components/hero/pipeline-graph";

const section = getSection("index");

/** CSS-driven entrance, offset from the hero t0 (see globals.css → hero timeline). */
const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Split-letter masked reveal, pure CSS so it starts on the first frame
 * instead of waiting for hydration (LCP). Letters are aria-hidden; the
 * accessible name is the plain text.
 */
function HeroName() {
  let i = 0;
  return (
    <h1 className="font-display text-hero uppercase">
      <span className="sr-only">{site.profile.name}</span>
      <span aria-hidden className="block">
        {site.profile.nameLines.map((line) => (
          <span key={line} className="hero-line">
            {Array.from(line).map((letter, j) => (
              <span key={j} className="hero-letter" style={{ "--i": i++ } as CSSProperties}>
                {letter}
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}

function StatusChip({ className }: { className?: string }) {
  const { status } = site.profile;
  return (
    <p
      className={cn(
        "inline-flex h-8 items-center gap-2.5 rounded-xs border border-line-strong px-3 font-mono text-meta",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status.available ? "status-dot bg-accent" : "bg-fg-subtle",
        )}
      />
      <span className="md:hidden">{status.short}</span>
      <span className="max-md:hidden">{status.label}</span>
    </p>
  );
}

export function Hero() {
  const { profile, graph, footer } = site;

  return (
    <section
      id="index"
      aria-label={profile.name}
      className="flex min-h-svh flex-col pt-[calc(var(--nav-h)+var(--space-5))] pb-6 lg:pb-8"
    >
      <div className="container-site grid-site flex-1 content-start lg:grid-rows-[auto_1fr_auto] lg:content-stretch gap-y-8 lg:gap-y-10">
        {/* System metadata row */}
        <div className="hero-in label-meta col-span-full grid grid-cols-subgrid text-fg-muted" style={at(0)}>
          <p className="col-span-2 lg:col-span-7">{sectionLabel(section)}</p>
          <p className="hidden lg:col-span-3 lg:block">
            status: <span className="text-fg">{profile.status.available ? "available" : "busy"}</span>
          </p>
          <p className="col-span-2 col-end-[-1] text-right">
            <LiveClock seconds="lg" />
          </p>
        </div>

        {/* Name, role, status, CTAs */}
        <div className="col-span-full flex flex-col gap-8 md:col-span-6 lg:col-span-7 lg:justify-between lg:gap-12">
          <HeroName />
          <div className="flex flex-col items-start gap-6">
            {/* No entrance: this is the LCP element. Any reveal (even the earlier
                clip-path wipe) waits on a main thread busy with hydration, which put
                mobile LCP at 4s in Lighthouse. Static, it paints with FCP. */}
            <p className="max-w-[34ch] text-lead text-fg-muted">
              {profile.roleLine}
            </p>
            <div className="hero-in" style={at(500)}>
              <StatusChip />
            </div>
            <div className="hero-in" style={at(500)}>
              <HeroActions />
            </div>
          </div>
        </div>

        {/* The running system */}
        <div
          className="hero-in col-span-full self-start md:col-span-8 lg:col-span-5 lg:col-start-8"
          style={at(500)}
        >
          <PipelineGraph nodes={graph.nodes} edges={graph.edges} />
        </div>

        {/* Scroll cue */}
        <div className="label-meta col-span-full flex items-center justify-between text-fg-muted">
          <a
            href="#stack"
            className="hero-in -ml-1 inline-flex h-11 items-center gap-2 px-1 transition-colors duration-(--dur-instant) hover:text-fg"
            style={at(2600)}
          >
            <span aria-hidden>↓</span> scroll
          </a>
          <span className="hero-in max-md:hidden" style={at(2600)}>
            {footer.version}
          </span>
        </div>
      </div>
    </section>
  );
}
