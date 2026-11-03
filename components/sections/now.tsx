import { getSection, isPlaceholder, sectionLabel, site } from "@/content/site";
import { stagger } from "@/lib/motion";
import { FadeIn } from "@/components/motion";
import { LiveClock } from "@/components/shared/live-clock";

const section = getSection("now");

/**
 * 05 / NOW: a key → value process table with the live IST clock.
 * Desktop: one row per key; phones: key above value.
 */
export function Now() {
  const { now } = site;

  return (
    <section id="now" aria-labelledby="now-title" className="section-pad border-t border-line">
      <div className="container-site grid-site gap-y-10">
        <div className="label-meta col-span-full flex flex-wrap items-center gap-x-4 gap-y-2 text-fg-muted">
          <h2 id="now-title">{sectionLabel(section)}</h2>
          <span aria-hidden className="h-px min-w-8 flex-1 bg-line" />
          <p>
            <LiveClock />
            {!isPlaceholder(now.updated) && (
              <>
                {" "}
                · updated <time>{now.updated}</time>
              </>
            )}
          </p>
        </div>

        <dl className="col-span-full border-t border-line lg:col-span-10">
          {now.rows.map((row, i) => (
            <FadeIn
              key={row.key}
              delay={i * stagger.rows}
              className="grid-site gap-y-2 border-b border-line py-5 lg:py-6 [--grid-cols:4] md:[--grid-cols:8] lg:[--grid-cols:10]"
            >
              <dt className="label-meta col-span-full flex items-center gap-3 text-fg-muted md:col-span-2">
                {row.key}
                <span aria-hidden className="text-accent-ink max-md:hidden">
                  →
                </span>
              </dt>
              <dd className="col-span-full flex items-center gap-3 md:col-span-6 lg:col-span-8">
                {isPlaceholder(row.value) ? (
                  <span className="font-mono text-sm text-fg-muted">[[PLACEHOLDER]]</span>
                ) : (
                  <span className="text-lead">{row.value}</span>
                )}
                {row.live && <span aria-hidden className="status-dot size-1.5 rounded-full bg-accent" />}
              </dd>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  );
}
