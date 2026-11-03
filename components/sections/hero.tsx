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
 * The name as the output of `whoami`: a modest mono line, not the headline.
 * Split-letter masked reveal, pure CSS so it starts on the first frame
 * instead of waiting for hydration. Letters are aria-hidden; the accessible
 * name is the plain text.
 */
function HeroName() {
  const name = site.profile.name.toLowerCase();
  return (
    <div className="flex flex-col gap-2 font-mono">
      <p aria-hidden className="hero-in text-meta text-fg-muted" style={at(0)}>
        <span className="text-accent-ink">$</span> whoami
      </p>
      <h1 className="text-h3 font-normal tracking-tight">
        <span className="sr-only">{site.profile.name}</span>
        <span aria-hidden className="hero-line">
          {Array.from(name).map((letter, i) => (
            <span key={i} className="hero-letter" style={{ "--i": i } as CSSProperties}>
              {letter === " " ? " " : letter}
            </span>
          ))}
          {/* Static caret: the only infinite loops allowed are the marquee and status dot. */}
          <span className="hero-letter text-accent-ink" style={{ "--i": name.length } as CSSProperties}>
            ▍
          </span>
        </span>
      </h1>
    </div>
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

        {/* whoami → name, role headline, status, CTAs */}
        <div className="col-span-full flex flex-col gap-8 md:col-span-6 lg:col-span-7 lg:gap-12">
          <div className="flex flex-col gap-6 lg:gap-8">
            <HeroName />
            {/* The headline. No entrance: this is the LCP element. Any reveal (even
                the earlier clip-path wipe) waits on a main thread busy with
                hydration, which put mobile LCP at 4s in Lighthouse. Static, it
                paints with FCP. */}
            <p className="max-w-[24ch] font-display text-display-l text-balance text-fg">
              {profile.roleLine}
            </p>
          </div>
          <div className="flex flex-col items-start gap-6">
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
