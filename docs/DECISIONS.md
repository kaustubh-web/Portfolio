# DECISIONS

One line per decision: `- YYYY-MM-DD · P<phase> · <decision> — <why>`

- 2026-11-02 · P0 · CLAUDE.md + docs/*.md are the only memory between sessions — each phase runs in a fresh chat.
- 2026-11-02 · P0 · Package manager: npm — the only one installed (Node 22.14, npm 11.4); no pnpm/bun on the machine.
- 2026-11-02 · P0 · Commit messages carry no Claude co-author/attribution trailer — owner's instruction.
- 2026-11-02 · P0 · Projects 01–03 are deployed (card shows "● deployed" + Live ↗); 04 backend-ledger has no public link — no Live button, no deployed flag, GitHub ↗ only. Driven by optional `liveUrl` in content/site.ts, never a placeholder.
- 2026-11-02 · P0 · Display font: Instrument Serif 400 — narrow caps fit the name beside the graph; one weight = small file for LCP.
- 2026-11-02 · P0 · Mono: Geist Mono; body: Geist — shared metrics, tabular digits for clock/log, variable fonts.
- 2026-11-02 · P0 · Accent: signal orange #FF5B1F (one hue); light-mode accent text uses --accent-ink #B83A0B for AA — acid lime rejected (fails on light bg).
- 2026-11-02 · P0 · No green/red status colors — node state shown by glyph (✓ → ○) + ink/accent.
- 2026-11-02 · P0 · Grid: 4 / 8 / 12 cols at <768 / 768 / ≥1024; max width 1680; hairlines on column edges.
- 2026-11-02 · P0 · Motion: animate only transform/opacity/clip-path/stroke-dashoffset; ease-out expo (.16,1,.3,1) for entrances, quart in-out for wipes.
- 2026-11-02 · P0 · Hero name reveal is CSS-driven (no hydration wait) to protect LCP.
- 2026-11-02 · P0 · Hero graph: 8 nodes / 6 Kahn levels; one layout fn, axes swap on mobile (left→right vs top→bottom).
- 2026-11-02 · P0 · Work cards are true 16:9, width = min(100%, 82svh·16/9); info on a solid panel (no glass); info sits below video on mobile.
- 2026-11-02 · P0 · Live URLs (use in content/site.ts): forgefort → https://forgefort.vercel.app/ · price-optimizer → https://price-optimizer-tau.vercel.app/ · ticket-tracker → https://support-ticket-rho.vercel.app/
- 2026-11-02 · P1 · Next.js 16.4.4 + React 19.3 + Tailwind 4.3 from create-next-app defaults (Turbopack, `@tailwindcss/turbopack` loader, no PostCSS config); Cache Components + Partial Prefetching left on — current scaffold default, and `/` still prerenders static.
- 2026-11-02 · P1 · shadcn/ui on the Radix base, "nova" preset; it ships `cn` from the `cn` package (clsx + tailwind-merge replacement) — kept as generated.
- 2026-11-02 · P1 · shadcn semantic CSS vars are aliases of the design tokens (one source of color); `--accent` is the signal orange — shadcn's grey "accent" hover role is unused by our components.
- 2026-11-02 · P1 · Theme via next-themes: `class` attribute, dark default, system preference ignored, transitions disabled on switch — its inline script runs before body content (no flash); CSS defaults to dark even without JS.
- 2026-11-02 · P1 · Kept Tailwind's 4px numeric spacing scale (design steps map onto existing classes; `--space-N` vars for raw CSS) — renumbering would silently resize every shadcn component.
- 2026-11-02 · P1 · Navbar numbers mirror section labels (`06 contact`, not the wireframe's `04`) — one numbering system across nav, labels and palette.
- 2026-11-02 · P1 · No `MotionConfig reducedMotion="user"` — it logs a dev warning for reduced-motion users; primitives branch on our own `useReducedMotion()` instead.
- 2026-11-02 · P1 · Lenis runs on `gsap.ticker` (lagSmoothing 0) with `anchors: true`; the instance is shared through a tiny external store (`useLenis`), not React context — no set-state-in-effect, no re-renders.
- 2026-11-02 · P1 · Overlays (Sheet/Dialog) use a `bg-bg/80` scrim with no backdrop blur — the no-glassmorphism rule.
- 2026-11-02 · P1 · Palette hint is decoupled: it dispatches a `kb:open-palette` window event that the Phase 6 palette will listen for.
- 2026-11-02 · P1 · Compact (mobile) palette hint shows a `⌘` glyph on every platform; desktop shows `⌘K` on Apple, `Ctrl K` elsewhere.
- 2026-11-02 · P1 · Grain is a generated 128px grayscale noise PNG (16 KB) tiled at token opacity.
- 2026-11-02 · P2 · Boot gating via an inline `<head>` script that sets `html[data-boot]` before first paint (per Next's "preventing flash" guide); the preloader and hero timeline are pure CSS keyed on it — nothing waits for hydration, and no-JS visitors simply get no preloader.
- 2026-11-02 · P2 · Preloader timeline: log 0–700ms, accent curtain 700–1200ms (up then away), hero t0 at 1000ms; sessionStorage flag set when the boot starts; any storage error skips the boot.
- 2026-11-02 · P2 · Skip restarts the hero reveal by swapping to duplicate `*-skip` keyframe names (changing animation-delay mid-flight would jump); skipping is ignored once the reveal has begun.
- 2026-11-02 · P2 · Role line uses a clip-path-only wipe instead of the fade-up — measured: Chrome never records opacity- or transform-revealed text for LCP until a later main-thread paint (hydration), while a clip-path wipe is recorded when it appears.
- 2026-11-02 · P2 · Graph = Kahn's algorithm → simplified Sugiyama layout (waypoints for level-skipping edges, barycenter ordering) → dataflow schedule (node 180ms, edge 220ms; 2.18s run). Edges are drawn in measured pixels; nodes/labels are HTML so tooltips and focus work.
- 2026-11-02 · P2 · Graph orientation switches on its own width (container query at 30rem), not the viewport: at 1024–1279 the right column is too narrow for six levels side by side, so it lays out top→bottom there too.
- 2026-11-02 · P2 · Node state glyphs ○ → ✓ sit inside the node label and the log line; node markers are 10px squares (radius 0), with an accent pulse ring only while running.
- 2026-11-02 · P2 · `/resume` is a temporary (307) redirect in next.config so replacing the PDF is never cached away; the hero Resume CTA links the PDF directly in a new tab.
