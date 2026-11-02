# PROGRESS

- [x] Phase 0 — Specs, plan, design system
- [x] Phase 1 — Foundation
- [ ] Phase 2 — Preloader + Hero + Marquee
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
