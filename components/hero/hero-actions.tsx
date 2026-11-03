"use client";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { copyEmail } from "@/lib/clipboard";
import { Magnetic } from "@/components/motion";
import { NewTabMark } from "@/components/shared/new-tab-mark";

const base =
  "label-meta inline-flex h-11 items-center gap-2 rounded-xs px-4 transition-colors duration-(--dur-instant)";

/**
 * Resume (new tab), socials, copy email — all magnetic.
 * Mobile: Resume + copy email first, socials on their own row.
 */
export function HeroActions({ className }: { className?: string }) {
  const { resume } = site.profile;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-3 md:gap-x-2", className)}>
      <Magnetic className="order-1">
        <a
          href={resume.href}
          target="_blank"
          rel="noopener"
          className={cn(base, "bg-accent text-on-accent hover:bg-fg hover:text-bg")}
        >
          Resume <NewTabMark />
        </a>
      </Magnetic>

      <ul className="order-3 flex basis-full flex-wrap gap-3 md:order-2 md:basis-auto md:gap-0">
        {site.socials.map((social) => (
          <li key={social.label}>
            <Magnetic>
              <a
                href={social.href}
                target="_blank"
                rel="noopener"
                className={cn(
                  base,
                  "border border-line-strong text-fg-muted hover:border-fg hover:text-fg md:border-transparent md:px-3",
                )}
              >
                {social.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Magnetic>
          </li>
        ))}
      </ul>

      <Magnetic className="order-2 md:order-3">
        <button
          type="button"
          onClick={copyEmail}
          aria-label={`Copy email address ${site.profile.email}`}
          className={cn(base, "border border-line-strong hover:border-fg")}
        >
          copy email
        </button>
      </Magnetic>
    </div>
  );
}
