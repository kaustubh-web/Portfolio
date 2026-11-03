import { getSection, sectionLabel, site } from "@/content/site";
import { stagger } from "@/lib/motion";
import { FadeIn, RevealText } from "@/components/motion";

const section = getSection("education");

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line py-3 first:border-t">
      <dt className="label-meta pt-0.5 text-fg-muted">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * 04 / EDUCATION: the degree block, then certifications on a timeline
 * with a mono date column. No grades are shown, by rule.
 */
export function Education() {
  const { education, certifications } = site;

  return (
    <section id="education" aria-labelledby="education-title" className="section-pad border-t border-line">
      <div className="container-site grid-site gap-y-10">
        <h2 id="education-title" className="label-meta col-span-full text-fg-muted">
          {sectionLabel(section)}
        </h2>

        <RevealText
          as="h3"
          lines={[education.degree]}
          className="col-span-full max-w-[16ch] font-display text-display-l md:col-span-4 lg:col-span-6"
        />

        <FadeIn className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-8">
          <dl>
            <Fact term="school">
              {education.school}, {education.location}
            </Fact>
            <Fact term="period">
              <span className="tabular-nums">{education.period}</span>
            </Fact>
            <Fact term="coursework">{education.coursework.join(" · ")}</Fact>
          </dl>
        </FadeIn>

        <div className="col-span-full mt-6 border-t border-line pt-10 lg:mt-10">
          <h3 className="label-meta mb-8 text-fg-muted">Certifications</h3>
          <ol className="relative">
            {/* The timeline rule, through every dot. */}
            <span
              aria-hidden
              className="absolute top-3 bottom-3 left-[calc(4rem+var(--space-4)+0.25rem)] w-px -translate-x-1/2 bg-line-strong"
            />
            {certifications.map((cert, i) => (
              <li key={cert.title}>
                <FadeIn
                  delay={i * stagger.rows}
                  className="grid grid-cols-[4rem_0.5rem_1fr] items-baseline gap-x-4 py-3 md:grid-cols-[4rem_0.5rem_1fr_auto] lg:py-4"
                >
                  <span className="label-meta text-fg-muted">{cert.period}</span>
                  <span aria-hidden className="relative size-2 self-center bg-accent" />
                  <span className="text-h3">{cert.title}</span>
                  <span className="label-meta col-start-3 text-fg-muted md:col-start-4 md:text-right">
                    {cert.issuer}
                  </span>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
