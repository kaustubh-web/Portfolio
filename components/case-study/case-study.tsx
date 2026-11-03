import { ViewTransition } from "react";

import { isPlaceholder, type Project } from "@/content/site";
import type { ResolvedMedia } from "@/lib/media";
import { buildDiagram } from "@/lib/graph/diagram";
import { mediaTransition } from "@/lib/transition";
import { FadeIn, Magnetic } from "@/components/motion";
import { PreviewVideo } from "@/components/work/preview-video";
import { ArchitectureDiagram } from "@/components/case-study/architecture-diagram";
import { CodeSnippet } from "@/components/case-study/code-snippet";
import { AdjacentLink, BackToWork } from "@/components/case-study/case-study-links";

const pad = (n: number) => String(n).padStart(2, "0");

/** Content prose: paragraphs split on blank lines; a placeholder renders as one. */
function Prose({ text, field }: { text: string; field: string }) {
  if (isPlaceholder(text)) {
    return (
      <p className="label-meta border border-dashed border-line-strong px-4 py-3 text-fg-muted normal-case">
        [[PLACEHOLDER]] · {field}
      </p>
    );
  }
  return (
    <div className="flex max-w-[68ch] flex-col gap-5 text-lead text-fg">
      {text.split(/\n\s*\n/).map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

function Highlights({ items }: { items: string[] }) {
  return (
    <ol className="flex max-w-[68ch] flex-col border-t border-line">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-line py-4">
          <span aria-hidden className="label-meta pt-1 text-accent-ink">
            {pad(i + 1)}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** Live ↗ (deployed only) and GitHub ↗, magnetic, new tab. */
function ProjectLinks({ project }: { project: Project }) {
  const links = [
    project.liveUrl ? { label: "Live", href: project.liveUrl } : null,
    { label: "GitHub", href: project.repoUrl },
  ].filter((link) => !!link);

  return (
    <ul className="flex flex-wrap gap-3">
      {links.map((link) => (
        <li key={link.label}>
          <Magnetic>
            <a
              href={link.href}
              target="_blank"
              rel="noopener"
              aria-label={`${link.label} — ${project.name}`}
              className="label-meta inline-flex h-11 items-center gap-1.5 rounded-xs border border-line-strong px-4 transition-colors duration-(--dur-instant) hover:border-fg"
            >
              {link.label} <span aria-hidden>↗</span>
            </a>
          </Magnetic>
        </li>
      ))}
    </ul>
  );
}

function MetaRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-line py-3 first:border-t">
      <dt className="label-meta pt-0.5 text-fg-muted">{term}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** One numbered case-study section: sticky label column, content column. */
function Chapter({
  index,
  id,
  title,
  wide = false,
  children,
}: {
  index: number;
  id: string;
  title: string;
  /** Run to the right edge (cols 4–12) instead of the 68ch prose column. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid-site gap-y-6 border-t border-line py-16 lg:py-24">
      <div className="col-span-full lg:col-span-3">
        <h2
          id={`${id}-title`}
          className="label-meta flex gap-3 text-fg-muted lg:sticky lg:top-[calc(var(--nav-h)+var(--space-6))]"
        >
          <span className="text-accent-ink">{pad(index)}</span>
          <span>{title}</span>
        </h2>
      </div>
      <FadeIn
        className={`col-span-full flex min-w-0 flex-col gap-8 md:col-span-8 ${wide ? "lg:col-span-9" : "lg:col-span-7"}`}
      >
        {children}
      </FadeIn>
    </section>
  );
}

type CaseStudyProps = {
  project: Project;
  media: ResolvedMedia;
  prev: Project;
  next: Project;
};

/**
 * /work/[slug]: hero preview (the shared element from the card), title
 * and meta, then Problem → Approach → Architecture → Hard parts → Result,
 * and next/prev navigation. Everything comes from `content/site.ts`.
 */
export function CaseStudy({ project, media, prev, next }: CaseStudyProps) {
  const study = project.caseStudy;
  const diagram = buildDiagram(study.architecture.nodes, study.architecture.edges);
  const href = (p: Project) => `/work/${p.slug}`;

  return (
    <article aria-labelledby="case-study-title" className="container-site pt-(--nav-h)">
      <nav aria-label="Case study" className="label-meta flex min-h-14 items-center gap-3 text-fg-muted">
        <BackToWork
          slug={project.slug}
          data-cursor="open"
          className="-ml-2 inline-flex h-11 items-center gap-2 px-2 transition-colors duration-(--dur-instant) hover:text-fg"
        >
          <span aria-hidden>←</span> work
        </BackToWork>
        <span aria-hidden>/</span>
        <span aria-current="page" className="text-fg">
          <span className="text-accent-ink">{project.index}</span> {project.slug}
        </span>
        <AdjacentLink
          href={href(next)}
          prefetch
          data-cursor="open"
          className="-mr-2 ml-auto inline-flex h-11 items-center gap-2 px-2 transition-colors duration-(--dur-instant) hover:text-fg"
        >
          <span className="max-md:sr-only">next: {next.slug}</span>
          <span className="md:hidden">next</span>
          <span aria-hidden>→</span>
        </AdjacentLink>
      </nav>

      <ViewTransition {...mediaTransition(project.slug)}>
        <PreviewVideo
          media={media}
          name={project.name}
          index={project.index}
          slug={project.slug}
          priority
          sizes="(min-width: 1680px) 1584px, 100vw"
          className="rounded-lg border border-line-strong"
          controlClassName="right-3 bottom-3 lg:right-4 lg:bottom-4"
        />
      </ViewTransition>

      <header className="grid-site gap-y-10 py-12 lg:py-16">
        <div className="col-span-full flex flex-col gap-5 lg:col-span-8">
          <h1 id="case-study-title" className="font-display text-display-xl">
            {project.name}
          </h1>
          {project.subtitle && (
            <p className="font-display text-display-m text-fg-muted">{project.subtitle}</p>
          )}
          <p className="max-w-[52ch] text-lead text-fg-muted">{project.pitch}</p>
        </div>
        <dl className="col-span-full self-end md:col-span-6 lg:col-span-4">
          <MetaRow term="role">
            {isPlaceholder(study.role) ? (
              <span className="font-mono text-fg-muted">[[PLACEHOLDER]]</span>
            ) : (
              study.role
            )}
          </MetaRow>
          <MetaRow term="stack">{project.stack.join(", ")}</MetaRow>
          <MetaRow term="status">
            {project.liveUrl ? (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                deployed
              </span>
            ) : (
              "source only"
            )}
          </MetaRow>
          <MetaRow term="links">
            <ProjectLinks project={project} />
          </MetaRow>
        </dl>
      </header>

      <Chapter index={1} id="problem" title="Problem">
        <Prose text={study.problem} field="problem" />
      </Chapter>

      <Chapter index={2} id="approach" title="Approach">
        <Prose text={study.approach} field="approach" />
        <Highlights items={project.highlights} />
      </Chapter>

      <Chapter index={3} id="architecture" title="Architecture" wide>
        <ArchitectureDiagram
          nodes={study.architecture.nodes}
          model={diagram}
          label={`${project.name} architecture`}
        />
      </Chapter>

      <Chapter index={4} id="hard-parts" title="Hard parts">
        <Prose text={study.hardParts} field="hard parts" />
        {study.snippets.map((snippet) => (
          <CodeSnippet key={snippet.file} snippet={snippet} />
        ))}
      </Chapter>

      <Chapter index={5} id="result" title="Result">
        <Prose text={study.result} field="result" />
      </Chapter>

      <nav aria-label="More case studies" className="grid grid-cols-2 border-t border-line">
        {[
          { project: prev, dir: "prev" as const },
          { project: next, dir: "next" as const },
        ].map(({ project: p, dir }) => (
          <AdjacentLink
            key={dir}
            href={href(p)}
            prefetch
            rel={dir}
            data-cursor="open"
            className={
              dir === "prev"
                ? "group flex flex-col gap-3 border-r border-line py-10 pr-4 lg:py-16"
                : "group flex flex-col items-end gap-3 py-10 pl-4 text-right lg:py-16"
            }
          >
            <span className="label-meta text-fg-muted">
              {dir === "prev" ? "← prev" : "next →"} · <span className="text-accent-ink">{p.index}</span>
            </span>
            <span className="font-display text-display-m transition-colors duration-(--dur-fast) group-hover:text-accent-ink">
              {p.name}
            </span>
          </AdjacentLink>
        ))}
      </nav>
    </article>
  );
}
