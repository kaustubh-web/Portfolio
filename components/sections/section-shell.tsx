import { getSection, sectionLabel, type SectionId } from "@/content/site";
import { cn } from "@/lib/utils";
import { FadeIn, RevealText } from "@/components/motion";

type SectionShellProps = {
  id: SectionId;
  /** Which phase fills this section in; shown as a scaffold note. */
  phase: number;
  className?: string;
};

/**
 * Phase-1 scaffold: an addressable section with its system label and
 * title, so the page scrolls end to end. Later phases replace the body.
 */
export function SectionShell({ id, phase, className }: SectionShellProps) {
  const section = getSection(id);
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("section-pad min-h-[80svh] border-t border-line", className)}
    >
      <div className="container-site grid-site gap-y-8">
        <p className="label-meta col-span-full text-fg-muted">{sectionLabel(section)}</p>
        <RevealText
          id={headingId}
          lines={[section.title]}
          className="col-span-full font-display text-display-xl lg:col-span-8"
        />
        <FadeIn className="col-span-full font-mono text-sm text-fg-muted lg:col-start-9 lg:col-span-4">
          scaffold · filled in phase {phase}
        </FadeIn>
      </div>
    </section>
  );
}
