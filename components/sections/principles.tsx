import { getSection, sectionLabel, site, type Principle } from "@/content/site";
import { highlight } from "@/lib/highlight";
import { stagger } from "@/lib/motion";
import { FadeIn, RevealText } from "@/components/motion";

const section = getSection("principles");

async function PrincipleCard({ principle }: { principle: Principle }) {
  const titleId = `principle-${principle.id.replace(".", "")}`;
  const html = await highlight({
    ...principle.snippet,
    file: principle.title,
    highlight: [],
    caption: principle.summary,
  });

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-4 rounded-lg border border-line-strong bg-surface p-5 lg:p-6"
    >
      <p className="label-meta text-accent-ink">{principle.id}</p>
      <h3 id={titleId} className="text-h3">
        {principle.title}
      </h3>
      <p className="max-w-[40ch] text-fg-muted">{principle.summary}</p>
      <div
        className="code-snippet mt-auto rounded-xs border border-line bg-bg"
        data-size="compact"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

/**
 * 02 / PRINCIPLES: a sticky title column beside a 2×2 grid of principle
 * cards, each with a short Shiki snippet (highlighted on the server).
 */
export function Principles() {
  return (
    <section
      id="principles"
      aria-labelledby="principles-title"
      className="section-pad border-t border-line"
    >
      <div className="container-site grid-site gap-y-12">
        <div className="col-span-full lg:col-span-4">
          <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--nav-h)+var(--space-6))]">
            <p className="label-meta text-fg-muted">{sectionLabel(section)}</p>
            <RevealText
              id="principles-title"
              lines={section.titleLines ?? [section.title]}
              className="font-display text-display-xl"
            />
          </div>
        </div>

        <ul className="col-span-full grid gap-(--grid-gap) lg:col-span-8 xl:grid-cols-2">
          {site.principles.map((principle, i) => (
            <li key={principle.id} className="min-w-0">
              <FadeIn className="h-full" delay={i * stagger.rows}>
                <PrincipleCard principle={principle} />
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
