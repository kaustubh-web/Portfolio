"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps } from "react";
import { usePathname } from "next/navigation";

import { site, visibleSections } from "@/content/site";
import { cn } from "@/lib/utils";
import { openPalette } from "@/lib/events";
import { scrollToId } from "@/lib/scroll";
import { useLenis } from "@/hooks/use-lenis";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TransitionLink } from "@/components/shared/transition-link";
import { NewTabMark } from "@/components/shared/new-tab-mark";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Numbered by position in the nav, so skipped sections (Education, Now) leave no gap.
const navSections = visibleSections
  .filter((s) => s.nav)
  .map((s, i) => ({ ...s, index: String(i + 1).padStart(2, "0") }));

/** True on the homepage, where section links are in-page anchors. */
const useOnHome = () => usePathname() === "/";

/**
 * A link to a homepage section: a plain `#id` anchor on the homepage
 * (smoothed by Lenis), a client navigation to `/#id` from other routes.
 */
function SectionLink({
  id,
  onHome,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { id: string; onHome: boolean }) {
  return onHome ? <a href={`#${id}`} {...props} /> : <TransitionLink href={`/#${id}`} {...props} />;
}

/** Hidden while scrolling down past the fold, shown on any scroll up. */
function useHideOnScroll(threshold = 120) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      setHidden(delta > 0 && y > threshold);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return hidden;
}

/** Accent hairline under the nav; scaleX tracks page progress. */
function ScrollProgress({ raised }: { raised: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-(--nav-h) z-(--z-nav) h-px transition-transform duration-(--dur-base) ease-out",
        raised && "-translate-y-(--nav-h)",
      )}
    >
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
    </div>
  );
}

const subscribeNoop = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

function PaletteHint({ compact = false }: { compact?: boolean }) {
  const apple = useSyncExternalStore(subscribeNoop, isApple, () => true);

  return (
    <button
      type="button"
      onClick={openPalette}
      aria-label="Open command palette"
      aria-keyshortcuts={apple ? "Meta+K" : "Control+K"}
      className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center px-2 text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg"
    >
      <kbd className="rounded-xs border border-line-strong px-1.5 py-0.5 font-mono text-meta normal-case">
        {/* Compact (touch) form is a glyph, not a shortcut. */}
        {compact ? "⌘" : apple ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const onHome = useOnHome();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) lenis?.stop();
    else lenis?.start();
  };

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    onOpenChange(false);
    // Off the homepage, the link navigates to /#id itself.
    if (!onHome) return;
    event.preventDefault();
    // Let the sheet release its scroll lock before moving.
    requestAnimationFrame(() => scrollToId(id, lenis));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        aria-label="Open menu"
        className="-mr-3 inline-flex size-11 items-center justify-center text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg md:hidden"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="size-4">
          <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        data-lenis-prevent
        className="w-full gap-0 border-line bg-bg p-0 text-fg data-[side=right]:w-full"
      >
        <div className="flex h-(--nav-h) items-center border-b border-line px-(--grid-margin)">
          <SheetTitle className="label-meta font-normal text-fg-muted">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site sections and links</SheetDescription>
          <SheetClose
            aria-label="Close menu"
            className="-mr-3 ml-auto inline-flex size-11 items-center justify-center text-fg-muted hover:text-fg"
          >
            <svg viewBox="0 0 16 16" aria-hidden className="size-4">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </SheetClose>
        </div>
        <nav aria-label="Mobile" className="px-(--grid-margin) py-8">
          <ul className="flex flex-col">
            {navSections.map((section) => (
              <li key={section.id} className="border-b border-line">
                <SectionLink
                  id={section.id}
                  onHome={onHome}
                  onClick={(e) => go(e, section.id)}
                  className="flex min-h-16 items-baseline gap-4 py-3"
                >
                  <span className="font-mono text-meta text-fg-muted">{section.index}</span>
                  <span className="font-display text-display-m">{section.label}</span>
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="mt-auto flex flex-wrap gap-x-6 px-(--grid-margin) pb-8">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener"
                className="inline-flex h-11 items-center font-mono text-meta text-fg-muted hover:text-fg"
              >
                {social.label}&nbsp;<NewTabMark />
              </a>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const scrolledAway = useHideOnScroll();
  const [focusWithin, setFocusWithin] = useState(false);
  const hidden = scrolledAway && !focusWithin;
  const onHome = useOnHome();

  return (
    <>
      <header
        // Held still during route view transitions (globals.css → site-nav).
        style={{ viewTransitionName: "site-nav" }}
        // Keep the bar visible while a keyboard user is inside it.
        onFocus={(e) => setFocusWithin(e.target.matches(":focus-visible"))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-(--z-nav) h-(--nav-h) border-b border-line bg-bg transition-transform duration-(--dur-base) ease-out",
          hidden && "-translate-y-full",
        )}
      >
        <div className="container-site flex h-full items-center">
          <SectionLink
            id="index"
            onHome={onHome}
            aria-label={onHome ? `${site.profile.name} — back to top` : `${site.profile.name} — home`}
            className="inline-flex h-11 min-w-11 items-center gap-3 font-mono text-meta"
          >
            <span>
              {site.profile.initials}
              <span className="text-accent-ink">/</span>
            </span>
            <span className="hidden text-fg-muted md:inline">{site.profile.domain}</span>
          </SectionLink>

          <nav aria-label="Primary" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-6 lg:gap-8">
              {navSections.map((section) => (
                <li key={section.id}>
                  <SectionLink
                    id={section.id}
                    onHome={onHome}
                    className="group inline-flex h-11 items-center gap-2 font-mono text-meta"
                  >
                    <span className="text-fg-muted">{section.index}</span>
                    <span className="text-fg-muted transition-colors duration-(--dur-instant) group-hover:text-fg">
                      {section.label.toLowerCase()}
                    </span>
                  </SectionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center md:ml-6">
            <span className="md:hidden">
              <PaletteHint compact />
            </span>
            <span className="hidden md:inline-flex">
              <PaletteHint />
            </span>
            <ThemeToggle className="md:-mr-3" />
            <MobileMenu />
          </div>
        </div>
      </header>
      <ScrollProgress raised={hidden} />
    </>
  );
}
