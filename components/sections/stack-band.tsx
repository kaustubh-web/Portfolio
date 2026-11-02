import { Fragment } from "react";

import { getSection, site } from "@/content/site";
import { Marquee } from "@/components/motion";

const section = getSection("stack");

/** Infinite mono marquee of the stack. Reduced motion: a static wrapped list. */
export function StackBand() {
  return (
    <section id="stack" aria-label={section.label} className="border-y border-line py-5 lg:py-6">
      <Marquee
        label={section.label}
        className="font-mono text-display-m uppercase max-md:text-[1.5rem]"
        itemClassName="flex items-center"
        items={site.stack.map((name) => (
          <Fragment key={name}>
            <span>{name}</span>
            <span aria-hidden className="px-[0.5em] text-accent-ink">
              ·
            </span>
          </Fragment>
        ))}
      />
    </section>
  );
}
