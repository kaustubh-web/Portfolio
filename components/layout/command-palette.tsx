"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";

import { isPlaceholder, PLACEHOLDER, site } from "@/content/site";
import { copyEmail } from "@/lib/clipboard";
import { closeOverlay, getOverlay, openPalette, openTerminal, useOverlay } from "@/lib/events";
import { getCurtain } from "@/lib/transition";
import { getBoot } from "@/hooks/use-boot";
import { useLenisPause } from "@/hooks/use-lenis-pause";
import { useSiteNavigate } from "@/hooks/use-site-navigate";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

type Item = {
  id: string;
  label: string;
  /** Right-aligned mono hint: ↗, a target, or a pending placeholder. */
  hint?: string;
  keywords?: string[];
  disabled?: boolean;
  run?: () => void;
};

type Group = { heading: string; items: Item[] };

const projectHref = (slug: string) => `/work/${slug}`;

/**
 * Word-prefix matching instead of cmdk's fuzzy score: "princ" should find
 * principles, not "open terminal" (whose letters happen to appear in order).
 * The label (first keyword) outranks the other keywords.
 */
const words = (text: string) => text.toLowerCase().split(/[\s/·-]+/);

function filter(_value: string, search: string, keywords: string[] = []) {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const [label = "", ...rest] = keywords;
  if (words(label).some((word) => word.startsWith(query))) return 1;
  if (rest.some((keyword) => words(keyword).some((word) => word.startsWith(query)))) return 0.6;
  return keywords.join(" ").toLowerCase().includes(query) ? 0.3 : 0;
}

const goSections = site.sections.filter((s) => s.index && s.index !== "00");

/**
 * ⌘K / Ctrl+K palette (cmdk inside a Radix dialog). Top third, 560px on
 * desktop; a full-width sheet from the top on phones. Actions run after the
 * dialog has closed and released its focus trap, so a "go to" can move
 * focus to its target and the terminal can open cleanly.
 */
export function CommandPalette() {
  const open = useOverlay() === "palette";
  const [search, setSearch] = useState("");
  const after = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const navigate = useSiteNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  useLenisPause(open);

  // ⌘K / Ctrl+K toggles. Ignored during the boot or a route curtain, and while the terminal is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== "k") return;
      const overlay = getOverlay();
      if (overlay === "terminal" || getBoot().phase === "run" || getCurtain() !== "idle") return;
      event.preventDefault();
      if (overlay === "palette") closeOverlay();
      else openPalette();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Case studies push programmatically: fetch them in full while open.
  useEffect(() => {
    if (!open) return;
    site.projects.forEach((p) => router.prefetch(projectHref(p.slug)));
  }, [open, router]);

  const groups: Group[] = [
    {
      heading: "Actions",
      items: [
        {
          id: "resume",
          label: "open resume",
          hint: "↗",
          keywords: ["cv", "pdf"],
          run: () => window.open(site.profile.resume.href, "_blank", "noopener"),
        },
        { id: "email", label: "copy email", hint: site.profile.email, keywords: ["contact", "mail"], run: copyEmail },
        {
          id: "theme",
          label: "toggle theme",
          hint: resolvedTheme === "light" ? "→ dark" : "→ light",
          keywords: ["dark", "light", "mode"],
          run: () => setTheme(resolvedTheme === "light" ? "dark" : "light"),
        },
        { id: "terminal", label: "open terminal", hint: "~", keywords: ["shell", "console"], run: openTerminal },
      ],
    },
    {
      heading: "Go to",
      items: [
        ...site.projects.map((p) => ({
          id: `project-${p.slug}`,
          label: `${p.index} ${p.slug}`,
          hint: "case study",
          keywords: [p.name, "project", "work"],
          run: () => navigate(projectHref(p.slug)),
        })),
        ...goSections.map((s) => ({
          id: `section-${s.id}`,
          label: s.label.toLowerCase(),
          hint: `${s.index} / section`,
          keywords: [s.title, "section"],
          run: () => navigate(`/#${s.id}`),
        })),
        { id: "section-top", label: "top", hint: "00 / index", keywords: ["home", "hero"], run: () => navigate("/#index") },
      ],
    },
    {
      heading: "Social",
      items: site.socials.map((s) =>
        isPlaceholder(s.href)
          ? { id: `social-${s.label}`, label: s.label, hint: PLACEHOLDER, disabled: true }
          : {
              id: `social-${s.label}`,
              label: s.label,
              hint: "↗",
              run: () => window.open(s.href, "_blank", "noopener"),
            },
      ),
    },
  ];

  // cmdk 1.1 sorts items within a group but can't reorder groups (it looks
  // them up by an internal id), so a query searches one flat, ranked group.
  const shown: Group[] = search.trim()
    ? [{ heading: "Results", items: groups.flatMap((group) => group.items) }]
    : groups;

  const select = (item: Item) => {
    after.current = item.run ?? null;
    closeOverlay();
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        closeOverlay();
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-lenis-prevent
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            setSearch("");
            // Touch: don't summon the keyboard over the list.
            if (window.matchMedia("(pointer: coarse)").matches) (event.currentTarget as HTMLElement).focus();
            else inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            const run = after.current;
            after.current = null;
            if (!run) return;
            // The action decides where focus goes (a section, the terminal…).
            event.preventDefault();
            run();
          }}
          className="fixed inset-x-0 top-0 z-(--z-overlay) border-b border-line-strong bg-surface text-fg outline-none duration-(--dur-fast) data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 md:inset-x-auto md:top-[18svh] md:left-1/2 md:w-[min(35rem,calc(100%-4rem))] md:-translate-x-1/2 md:border"
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <Command label="Command palette" loop filter={filter} className="flex flex-col">
            <div className="flex h-14 items-center gap-3 border-b border-line pl-4 font-mono">
              <span aria-hidden className="text-accent-ink">
                &gt;
              </span>
              <Command.Input
                ref={inputRef}
                value={search}
                onValueChange={setSearch}
                placeholder="type a command…"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-fg-muted"
              />
              <DialogPrimitive.Close
                aria-label="Close command palette"
                className="inline-flex h-full min-w-14 items-center justify-center text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg"
              >
                <kbd className="rounded-xs border border-line-strong px-1.5 py-0.5 font-mono text-meta">esc</kbd>
              </DialogPrimitive.Close>
            </div>

            <Command.List className="max-h-[min(60svh,26rem)] scroll-py-2 overflow-y-auto overscroll-contain py-2">
              <Command.Empty className="px-4 py-6 font-mono text-sm text-fg-muted">
                no match — try &ldquo;theme&rdquo; or &ldquo;work&rdquo;
              </Command.Empty>
              {shown.map((group) => (
                <Command.Group
                  key={group.heading}
                  heading={group.heading}
                  className="**:[[cmdk-group-heading]]:label-meta **:[[cmdk-group-heading]]:px-4 **:[[cmdk-group-heading]]:pt-3 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-fg-muted"
                >
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.id}
                      keywords={[item.label, ...(item.keywords ?? [])]}
                      disabled={item.disabled}
                      onSelect={() => select(item)}
                      className="group/item relative flex min-h-11 cursor-default items-center gap-3 px-4 font-mono text-sm text-fg-muted select-none data-[disabled=true]:text-fg-subtle data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-0.5 bg-accent opacity-0 group-data-[selected=true]/item:opacity-100"
                      />
                      <span className="truncate">{item.label}</span>
                      {item.hint && (
                        <span className="ml-auto shrink-0 truncate pl-4 text-meta text-fg-muted max-sm:max-w-[45%]">
                          {item.hint}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            <p
              aria-hidden
              className="label-meta flex gap-4 border-t border-line px-4 py-3 text-fg-muted pointer-coarse:hidden"
            >
              <span>↑↓ move</span>
              <span>↵ run</span>
              <span>esc close</span>
            </p>
          </Command>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
