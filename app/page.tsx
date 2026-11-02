import { getSection, sectionLabel, site } from "@/content/site";
import { SectionShell } from "@/components/sections/section-shell";

const index = getSection("index");
const stack = getSection("stack");

export default function Home() {
  return (
    <main id="main">
      {/* Hero shell — built in phase 2 */}
      <section
        id="index"
        aria-label={site.profile.name}
        className="flex min-h-svh flex-col pt-[calc(var(--nav-h)+var(--space-6))] pb-8"
      >
        <div className="container-site grid-site flex-1 content-between gap-y-12">
          <p className="label-meta col-span-full text-fg-muted">{sectionLabel(index)}</p>
          <h1 className="col-span-full font-display text-hero uppercase lg:col-span-7">
            <span className="block">{site.profile.nameLines[0]}</span>
            <span className="block">{site.profile.nameLines[1]}</span>
          </h1>
          <p className="col-span-full max-w-[34ch] text-lead text-fg-muted md:col-span-5">
            {site.profile.roleLine}
          </p>
        </div>
      </section>

      {/* Stack marquee band — built in phase 2 */}
      <section
        id="stack"
        aria-label={stack.label}
        className="border-y border-line py-6"
      >
        <p className="container-site label-meta text-fg-muted">
          {sectionLabel(stack)} · scaffold · filled in phase 2
        </p>
      </section>

      <SectionShell id="work" phase={3} />
      <SectionShell id="principles" phase={5} />
      <SectionShell id="archive" phase={5} />
      <SectionShell id="education" phase={5} />
      <SectionShell id="now" phase={5} />
      <SectionShell id="contact" phase={5} />
    </main>
  );
}
