import { getSection, sectionLabel, site } from "@/content/site";
import { resolveMedia } from "@/lib/media";
import { RevealText } from "@/components/motion";
import { WorkStack } from "@/components/work/work-stack";

const section = getSection("work");

/** 01 / WORK — the stacked project cards. Media is resolved here, on the server. */
export function Work() {
  const { projects } = site;
  const media = Object.fromEntries(projects.map((p) => [p.slug, resolveMedia(p.media)]));
  const count = String(projects.length).padStart(2, "0");

  return (
    <section id="work" aria-labelledby="work-title" className="section-pad border-t border-line">
      <div className="container-site grid-site gap-y-8">
        <div className="label-meta col-span-full flex items-center gap-4 text-fg-muted">
          <p>{sectionLabel(section)}</p>
          <span aria-hidden className="h-px flex-1 bg-line" />
          <p>{count} entries · by index</p>
        </div>
        <RevealText
          id="work-title"
          lines={[section.title]}
          className="col-span-full font-display text-display-xl lg:col-span-8"
        />
      </div>

      <div className="container-site mt-12 lg:mt-16">
        <WorkStack media={media} />
      </div>
    </section>
  );
}
