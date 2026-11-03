"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Dialog as DialogPrimitive } from "radix-ui";

import { isPlaceholder, PLACEHOLDER, site } from "@/content/site";
import { copyEmail } from "@/lib/clipboard";
import { closeOverlay, getOverlay, isEditable, openTerminal, useOverlay } from "@/lib/events";
import { getCurtain } from "@/lib/transition";
import { getBoot } from "@/hooks/use-boot";
import { useLenisPause } from "@/hooks/use-lenis-pause";
import { useSiteNavigate } from "@/hooks/use-site-navigate";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { NewTabMark } from "@/components/shared/new-tab-mark";

type Entry = { id: number; kind: "in" | "out" | "err"; body: ReactNode };
/** What a command prints: output, an error line, a cleared screen, or nothing. */
type Result = { body: ReactNode; error?: true } | "clear" | null;

const { terminal, profile } = site;
const width = Math.max(...terminal.commands.map((c) => (c.usage ?? c.name).length)) + 2;

const linkClass =
  "underline decoration-line-strong underline-offset-4 transition-colors duration-(--dur-instant) hover:text-accent-ink hover:decoration-current";

/**
 * The ~ easter egg: a bottom drawer (50svh) running a tiny shell. Radix
 * traps focus and closes on Esc; ↑/↓ walk the command history, Ctrl+L
 * clears. Mounted once in the root layout, so the scrollback survives
 * route changes and reopening.
 */
export function Terminal() {
  const open = useOverlay() === "terminal";
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: 0, kind: "out", body: terminal.greeting },
  ]);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  /** Position while walking history; equals history length when on the draft. */
  const cursor = useRef(0);
  const draft = useRef("");
  const nextId = useRef(1);
  const after = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const navigate = useSiteNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  useLenisPause(open);

  // ~ (or `) opens it, unless typing somewhere, the boot runs, or the palette is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "~" && event.key !== "`") return;
      if (event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return;
      if (getOverlay() || getBoot().phase === "run" || getCurtain() !== "idle") return;
      event.preventDefault();
      openTerminal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep the newest line in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries, open]);

  /** Close first; run `fn` once the focus trap has let go. */
  const closeThen = (fn: () => void) => {
    after.current = fn;
    closeOverlay();
  };

  const internalLink = (href: string, label: ReactNode) => (
    <a
      href={href}
      className={linkClass}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        closeThen(() => navigate(href));
      }}
    >
      {label}
    </a>
  );

  const externalLink = (href: string, label: ReactNode) =>
    isPlaceholder(href) ? (
      <span className="text-fg-muted">{PLACEHOLDER}</span>
    ) : (
      <a href={href} target="_blank" rel="noopener" className={linkClass}>
        {label} <NewTabMark />
      </a>
    );

  const exec = (line: string): Result => {
    const out = (body: ReactNode): Result => ({ body });
    const [name = "", ...args] = line.trim().split(/\s+/);
    switch (name.toLowerCase()) {
      case "":
        return null;
      case "help":
        return out(
          <ul>
            {terminal.commands.map((c) => (
              <li key={c.name} className="whitespace-pre-wrap">
                <span className="text-fg">{(c.usage ?? c.name).padEnd(width)}</span>
                {c.description}
              </li>
            ))}
          </ul>
        );
      case "whoami":
        return out(
          <>
            <p className="text-fg">{terminal.whoami}</p>
            <p>{profile.roleLine.toLowerCase()}</p>
            <p>
              {profile.status.label} · {profile.location.toLowerCase()} · {profile.timezone.label}
            </p>
          </>
        );
      case "projects":
        return out(
          <ul>
            {site.projects.map((p) => (
              <li key={p.slug}>
                <span className="text-fg-subtle">{p.index}</span>{" "}
                {internalLink(`/work/${p.slug}`, p.slug)} <span>— {p.pitch.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        );
      case "resume":
        window.open(profile.resume.href, "_blank", "noopener");
        return out(<p>opening {externalLink(profile.resume.href, profile.resume.href)}</p>);
      case "contact":
        return out(
          <ul className="whitespace-pre-wrap">
            <li>
              <span className="text-fg">{"email".padEnd(10)}</span>
              {profile.email}{" "}
              <button type="button" onClick={copyEmail} className={linkClass}>
                copy
              </button>
            </li>
            {site.socials.map((s) => (
              <li key={s.label}>
                <span className="text-fg">{s.label.toLowerCase().padEnd(10)}</span>
                {externalLink(s.href, s.href.replace(/^https?:\/\//, ""))}
              </li>
            ))}
          </ul>
        );
      case "theme": {
        const target = args[0] ?? (resolvedTheme === "light" ? "dark" : "light");
        if (target !== "dark" && target !== "light") return { body: "usage: theme [dark|light]", error: true };
        setTheme(target);
        return out(<p>theme → {target}</p>);
      }
      case "clear":
        return "clear";
      case "exit":
        closeOverlay();
        return null;
      default:
        return { body: `command not found: ${name} · try help`, error: true };
    }
  };

  const submit = () => {
    const line = input;
    setInput("");
    if (line.trim()) history.current.push(line);
    cursor.current = history.current.length;
    draft.current = "";

    const result = exec(line);
    if (result === "clear") {
      setEntries([]);
      return;
    }
    const echo: Entry = { id: nextId.current++, kind: "in", body: line };
    const output: Entry[] = result
      ? [{ id: nextId.current++, kind: result.error ? "err" : "out", body: result.body }]
      : [];
    setEntries((prev) => [...prev, echo, ...output]);
  };

  const walkHistory = (step: -1 | 1) => {
    const list = history.current;
    if (!list.length) return;
    if (cursor.current === list.length) draft.current = input;
    const next = Math.min(list.length, Math.max(0, cursor.current + step));
    cursor.current = next;
    setInput(next === list.length ? draft.current : list[next]!);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && closeOverlay()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-lenis-prevent
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            const run = after.current;
            after.current = null;
            if (!run) return;
            event.preventDefault();
            run();
          }}
          className="fixed inset-x-0 bottom-0 z-(--z-overlay) flex h-[50svh] flex-col border-t border-line-strong bg-surface font-mono text-sm text-fg-muted outline-none duration-(--dur-base) data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom"
        >
          <div className="container-site flex h-11 shrink-0 items-center border-b border-line">
            <DialogPrimitive.Title className="text-meta font-normal text-fg-muted">
              <span className="text-accent-ink">●</span> {terminal.prompt}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close terminal"
              className="-mr-3 ml-auto inline-flex h-11 min-w-14 items-center justify-center text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg"
            >
              <kbd className="rounded-xs border border-line-strong px-1.5 py-0.5 text-meta">esc</kbd>
            </DialogPrimitive.Close>
          </div>

          <div
            ref={logRef}
            // Clicking empty space puts the caret back in the prompt.
            onClick={(event) => {
              if (window.getSelection()?.toString()) return;
              if ((event.target as HTMLElement).closest("a, button")) return;
              inputRef.current?.focus();
            }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="container-site flex flex-col gap-1 py-4">
              <div role="log" aria-live="polite" aria-label="Terminal output" className="flex flex-col gap-1">
                {entries.map((entry) => (
                  <div key={entry.id} className="break-words">
                    {entry.kind === "in" ? (
                      <p className="text-fg">
                        <span aria-hidden className="text-accent-ink">
                          ${" "}
                        </span>
                        {entry.body}
                      </p>
                    ) : entry.kind === "err" ? (
                      <p className="text-fg">
                        <span aria-hidden className="text-accent-ink">
                          !{" "}
                        </span>
                        {entry.body}
                      </p>
                    ) : (
                      entry.body
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
                className="flex items-center gap-2"
              >
                <label htmlFor="terminal-input" aria-hidden className="text-accent-ink">
                  $
                </label>
                <input
                  ref={inputRef}
                  id="terminal-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      event.preventDefault();
                      walkHistory(event.key === "ArrowUp" ? -1 : 1);
                    } else if (event.key === "l" && event.ctrlKey) {
                      event.preventDefault();
                      setEntries([]);
                    }
                  }}
                  aria-label="Terminal command"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  className="h-11 min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none"
                />
              </form>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
