# PROGRESS

- [x] Phase 0 — Specs, plan, design system
- [x] Phase 1 — Foundation
- [x] Phase 2 — Preloader + Hero + Marquee
- [ ] Phase 3 — Selected Work
- [ ] Phase 4 — Case Studies
- [ ] Phase 5 — Remaining Sections
- [ ] Phase 6 — Signature Interactions
- [ ] Phase 7 — Polish & Ship

## Handoff notes

<!--
Each phase appends one block, newest last:

### Phase N — <title> (YYYY-MM-DD)
- Built:
- Key files:
- Conventions introduced:
- Known issues:
- Placeholders added:
-->

### Phase 0 — Specs, plan, design system (2026-11-02)
- Built: repo (`git init`, branch main), stub README.md (Phase 7 replaces it), CLAUDE.md, docs/SPEC.md, docs/PLAN.md (protocol, phases, approved design system + wireframes), docs/PROGRESS.md, docs/DECISIONS.md. No app code.
- Key files: docs/PLAN.md → "## Design System (approved)" is the source of truth for tokens, type, grid, motion, and layouts.
- Conventions introduced: npm as package manager; no Claude co-author line in commits; project live links are optional `liveUrl` (no placeholder buttons).
- Known issues: none. Risk to watch: masked hero reveal vs LCP (Phase 2).
- Placeholders added: GitHub/LinkedIn/LeetCode URLs, per-project repo URLs, archive years/stacks/links, Now lines, preview videos/posters, resume PDF. Live URLs for 01–03 are known (DECISIONS.md); 04 has none.

### Phase 1 — Foundation (2026-11-02)
- Built: Next.js 16.4.4 (App Router, Turbopack, React 19.3) + TypeScript + Tailwind 4.3 + shadcn/ui (radix base, nova preset: Command, Dialog, Tooltip, Badge, Sheet, Sonner); installed motion 14.9, gsap 3.15, @gsap/react, lenis 1.3, shiki 4.6. Design tokens as CSS variables (dark default, light via `.light`), fonts via next/font, no-flash theme toggle (next-themes), typed `content/site.ts` holding all spec content, 12/8/4-col grid with hairline overlay, static grain overlay, navbar (logo, section links, ⌘K hint, theme toggle, hide-on-scroll, accent progress hairline, mobile Sheet menu), skip link, Lenis provider on the GSAP ticker, `useReducedMotion`, motion primitives (RevealText, FadeIn, Magnetic, Marquee), and section shells (`index`, `stack`, `work`, `principles`, `archive`, `education`, `now`, `contact`).
- Verified (headless Chrome at 1440 / 360 / reduced motion): zero console errors or warnings; no horizontal overflow at 360; theme toggle persists across reload; Lenis active (off under reduced motion); nav hides on scroll-down, returns on scroll-up, stays while keyboard focus is inside; progress hairline tracks; nav and mobile-sheet anchors land on target; Marquee moves, pauses on hover, reverses on scroll-up, and becomes a static list under reduced motion; Magnetic caps at 12px and is inert under reduced motion. `npm run build`, `npm run lint`, `npx tsc --noEmit` all clean; `/` prerenders static.
- Key files:
  - `app/globals.css` — every token (color, type scale, spacing, grid, motion, z-index); shadcn semantic vars aliased onto design tokens; utilities `container-site`, `grid-site`, `label-meta`, `section-pad`; `light:` / `dark:` variants.
  - `app/layout.tsx` (fonts, providers, nav, overlays, skip link) and `app/page.tsx` (section order).
  - `content/site.ts` — schema + content + helpers (`getSection`, `sectionLabel`, `getProject`, `isPlaceholder`).
  - `components/providers/` — `providers.tsx`, `theme-provider.tsx`, `smooth-scroll.tsx`.
  - `components/layout/` — `navbar.tsx`, `theme-toggle.tsx`, `overlays.tsx` (GridOverlay, GrainOverlay).
  - `components/motion/` — `reveal-text.tsx`, `fade-in.tsx`, `magnetic.tsx`, `marquee.tsx`, `index.ts`.
  - `components/sections/section-shell.tsx` — temporary shell used by sections 01–06.
  - `hooks/` — `use-media-query.ts`, `use-reduced-motion.ts`, `use-fine-pointer.ts`, `use-lenis.ts` (external store for the Lenis instance).
  - `lib/` — `motion.ts` (JS mirror of motion tokens: durations in seconds, eases, staggers, springs, magnetic, reducedFade), `gsap.ts` (registers ScrollTrigger + useGSAP; import gsap from here), `scroll.ts` (`scrollToId`), `events.ts` (`openPalette`), `utils.ts` (`cn`).
  - `public/grain.png` — generated 128px grayscale noise tile.
- Conventions introduced:
  - Colors only via token classes: `bg-bg`, `bg-surface`, `bg-surface-2`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-line`, `border-line-strong`, `border-grid-line`, `bg-accent`, `text-accent-ink` (accent text), `text-on-accent`. shadcn names (`bg-popover`, `text-muted-foreground`…) resolve to the same tokens.
  - Type: `font-display` / `font-sans` / `font-mono`; sizes `text-hero`, `text-display-xl`, `text-display-l`, `text-display-m`, `text-h3`, `text-lead`, `text-body`, `text-sm`, `text-meta` (each carries its line-height/tracking). Section labels use `label-meta` + `sectionLabel(section)`.
  - Layout: wrap content in `container-site grid-site`, then `col-span-*` with `md:` (8 cols) / `lg:` (12 cols). Breakpoints md 768, lg 1024, xl 1440.
  - Spacing: Tailwind's 4px numeric scale is unchanged. Design step 5=24px → `*-6`, 6=32 → `*-8`, 7=48 → `*-12`, 8=64 → `*-16`, 9=96 → `*-24`, 10=128 → `*-32`, 11=192 → `*-48`; steps also exist as `var(--space-N)`.
  - Motion in CSS: `duration-(--dur-base)` etc., `ease-out` / `ease-in-out` (overridden to the design curves). Motion in JS: import from `lib/motion.ts`. Z-index via `z-(--z-nav)` etc.
  - Reduced motion: call `useReducedMotion()` and branch explicitly; key motion elements on it (`key={reduced ? "reduced" : "full"}`) so the right initial state applies after hydration. Global CSS collapses CSS transitions/animations under reduced motion.
  - Smooth scroll: `useLenis()` returns the instance or null; use `scrollToId(id, lenis)` for programmatic jumps; plain `<a href="#id">` links are smoothed by Lenis `anchors`. Put `data-lenis-prevent` on scrollable overlays and stop/start Lenis while a modal is open (see `MobileMenu`).
  - RevealText takes explicit `lines` (no runtime text splitting). Marquee takes `items` + `label`.
  - shadcn overlays (Sheet, Dialog) use `bg-bg/80` with no blur, at `z-(--z-overlay)`.
- Known issues:
  - ⌘K hint dispatches `kb:open-palette` (`lib/events.ts`) but nothing listens until Phase 6; the ⌘K / Ctrl+K shortcut is not bound yet.
  - Hero and stack band are static scaffolds; sections 01–06 render `SectionShell` with "scaffold · filled in phase N" text — each phase must replace its shell.
  - Social links point at `[[PLACEHOLDER]]` (relative href) in the mobile sheet.
  - `app/favicon.ico` is the Next.js default — replace in Phase 7.
  - On a fresh clone, `npx tsc --noEmit` needs Next's generated route types (`LayoutProps`): run `npm run dev`/`build` (or `npx next typegen`) once first.
  - `next dev` maintains `AGENTS.md` (Next's agent-rules block) — commit it as-is.
  - `npm audit` reports 16 moderate advisories in scaffold dependencies; not addressed.
  - Cache Components is on (scaffold default): server components can't read time/randomness outside `<Suspense>`, and visited routes stay mounted in `<Activity>`, so effects must clean up (relevant to Phases 4 and 6).
- Placeholders added (all in `content/site.ts`): `meta.url`; socials GitHub/LinkedIn/LeetCode; `repoUrl` ×4; case-study `role` / `problem` / `approach` / `hardParts` / `result` ×4; snippet `code` `[[REPLACE WITH REAL CODE]]` ×5; archive `year` ×5, `href` ×5, Smart Resume Screener `stack`; Now `building`, `learning`, `updated`. Asset paths referenced but not yet present: `/work/<slug>.{mp4,webm,webp}`, `/archive/*.webp`, `/Kaustubh_Bramhe_Resume.pdf`. Graph tooltips, principle snippets and architecture diagrams are written from the spec as editable defaults.

### Phase 2 — Preloader + Hero + Marquee (2026-11-02)
- Built: boot preloader (mono boot log, stepped progress bar, CSS-counter timer, accent curtain wipe; ≤1.2s, once per session, skippable via Enter/Esc/Space/button/tap, off under reduced motion); hero (split-letter masked name reveal, role line wipe, status chip with 2s pulse, live IST clock, magnetic CTAs: Resume ↗ new tab, GitHub/LinkedIn/LeetCode, copy email + Sonner toast); `/resume` → PDF redirect (307); pipeline graph (real Kahn's algorithm → layered layout → dataflow schedule; edges fill and pulse while data is in flight, one log line per node, tooltips on hover/focus/tap, re-run; left→right in containers ≥30rem, top→bottom below; completed static state under reduced motion); stack marquee band; scroll cue.
- Verified (headless Chrome via CDP; dev + production build): zero console errors/warnings; no horizontal overflow at 360/768/1024/1440; every hero tap target ≥44px; CLS ≈ 0.0004; preloader shows on first visit only and skip restarts the hero reveal cleanly; graph logs 8 nodes in Kahn order (idea, design, frontend, backend, db, llm, test, ship), full run 2.18s; tooltip, toast, light theme, reduced motion (completed graph, static marquee) all checked. `npm run build`, `npm run lint`, `npx tsc --noEmit` clean; `/` prerenders static.
- LCP (production build, LCP element = role line): desktop repeat visit 0.58s, desktop first visit (incl. preloader) 1.75s; Slow-4G network only 1.24–1.41s; Slow-4G + 4× CPU 1.7–2.3s and up to ~4.5s in a noisier run — see Known issues.
- Key files:
  - `lib/boot-config.ts` — boot timings + the inline `bootScript` (server-safe; inlined in `<head>` by `app/layout.tsx`).
  - `hooks/use-boot.ts` — boot store (`useBoot`, `getBoot`, `skipBoot`): phase + hero t0 (`heroStart`, performance.now()).
  - `components/layout/preloader.tsx` — preloader markup + skip handling (timeline is CSS).
  - `components/sections/hero.tsx` (server), `components/hero/hero-actions.tsx`, `components/hero/pipeline-graph.tsx`, `components/sections/stack-band.tsx`.
  - `lib/graph/` — `kahn.ts` (Kahn's algorithm, levels + order, cycle/unknown-node errors), `layout.ts` (layered layout with waypoints for long edges + barycenter ordering; axis-free), `schedule.ts` (dataflow timing + `formatRunTime`).
  - `components/shared/live-clock.tsx` — shared-ticker IST clock (reuse in Phase 5 Now).
  - `lib/clipboard.ts` — `copyText` (with execCommand fallback) + `copyEmail` (toast). Reuse in Phases 5–6.
  - `app/globals.css` — new "Boot preloader + hero timeline" block: `--boot-*`, `--hero-t0`, `.boot*`, `.hero-letter`, `.hero-wipe`, `.hero-in`, `.status-dot`, `.edge-fill`, `.edge-pulse`, `.node-pulse`.
  - `lib/motion.ts` — `graphRun` (nodeMs 180, edgeMs 220, delayMs 600). `next.config.ts` — `/resume` redirect.
- Conventions introduced:
  - Hero entrances are CSS: `hero-in` (fade + rise) / `hero-wipe` / `hero-letter`, offset with `style={{"--d": "300ms"}}` from `--hero-t0` (0 normally, 1000ms when the boot runs). On skip, `html[data-boot="skip"]` swaps to duplicate `*-skip` keyframes so the animations restart at "now"; keep the duplicates in sync.
  - `html[data-boot]` is the boot contract: set pre-paint by the inline script, re-applied by `Preloader` in a layout effect (dev Strict Mode resets `<html>` attributes). JS that follows the hero timeline reads `useBoot().heroStart`.
  - LCP-critical text must not be revealed by compositor-only animation (opacity or transform): Chrome records it only at the next main-thread paint. Use a pure `clip-path` wipe (no transform in the same keyframes), or no entrance.
  - Graph orientation is a container query (`@container/graph`, `@min-[30rem]/graph:`), so SSR markup is already correct; node positions are CSS vars (`--lv`, `--cr`) on normalized 0–1 coordinates.
  - Pure graph/time logic lives in `lib/graph/` with no React; components only render it.
- Known issues:
  - LCP under Slow-4G + 4× CPU can exceed 2s: the role-line wipe runs on the main thread, which hydration keeps busy. Fix if Lighthouse (Phase 7) flags it: drop the role line's entrance (render it static) so LCP = FCP. First-visit LCP also includes the ≤1.2s preloader by spec, so it cannot drop below ~FCP + 1.3s on slow devices.
  - Touch: tapping a graph node opens its tooltip; tapping elsewhere closes it (no toggle). Not tested on a real device.
  - The hero shows the `[[PLACEHOLDER]]` social links (relative hrefs → 404 in a new tab) and the Resume CTA points at `/Kaustubh_Bramhe_Resume.pdf`, which isn't in `public/` yet (404).
  - On this Windows machine `npm run build` from Git Bash once failed with a Turbopack worker spawn error (0xc0000142) after many processes were open; the same build from PowerShell passed.
  - ⌘K still only dispatches `kb:open-palette` (Phase 6).
- Placeholders added: none new in `content/site.ts`. Still pending and now visible in the hero: socials ×3, resume PDF.
