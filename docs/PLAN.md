# PLAN — kaustubh-portfolio

# SESSION PROTOCOL (applies to every phase)

## Start of every session
1. Read CLAUDE.md, docs/SPEC.md, docs/PLAN.md, docs/PROGRESS.md, and docs/DECISIONS.md.
2. Summarize in 5 lines: current state, design system, conventions, and the phase to do.
3. Wait for my "go".

## During the session
- Build ONLY the current phase. Follow existing components, tokens, and patterns.
- Don't refactor completed phases. If something earlier is broken, ask before touching it.
- Run the dev server. Fix all runtime errors, type errors, and lint errors before finishing.

## End of every session
1. Append a handoff note to docs/PROGRESS.md: what was built, key files, conventions introduced, known issues, and placeholders added.
2. Append any new decisions to docs/DECISIONS.md.
3. Tick the phase in PROGRESS.md.
4. Give me a git commit message, e.g. "phase N: <summary>".
5. **STOP. Never start the next phase in the same session.**

---

# PHASES

## Phase 1 — Foundation
1. Scaffold Next.js (App Router, TS) + Tailwind + shadcn/ui (init + Command, Dialog, Tooltip, Badge, Sheet, Sonner). Install motion, gsap, @gsap/react, lenis, and shiki.
2. Fonts via next/font. Tokens as CSS variables from the approved design system. Dark/light theme with a toggle, dark by default, no flash on load.
3. `content/site.ts`: a typed schema holding ALL spec content (profile, links, projects, archive, education without GPA, certifications, principles), with placeholders.
4. Global layout: the 12-column grid, hairline overlay, grain overlay, and the navbar (logo, links, ⌘K hint, theme toggle, hide-on-scroll, progress hairline).
5. A Lenis provider synced with ScrollTrigger, plus a `useReducedMotion` hook (Lenis is off when reduced motion is preferred).
6. Motion primitives in `components/motion/`: RevealText, FadeIn, Magnetic, Marquee.
7. Empty section shells with ids, so the page scrolls end to end.

**Acceptance:** no console errors; theme toggle works; smooth scroll works; the page renders cleanly at 360px and 1440px.

## Phase 2 — Preloader + Hero + Marquee
1. Build the preloader per spec (skippable, once per session with try/catch-wrapped sessionStorage, skipped under reduced motion).
2. Build the hero per spec: name reveal, role line, status chip, CTAs, the /resume redirect, copy-email toast, and magnetic CTAs.
3. The node graph:
   - 6–8 nodes (idea → design → frontend / backend → db → llm → ship).
   - Execution order from a real Kahn's algorithm util.
   - Pulsing edges, a streaming log panel, tooltips, and re-run.
   - Responsive. Under reduced motion it shows the completed state with no animation.
4. The stack marquee and the scroll cue.

**Acceptance:** hero LCP < 2s, no layout shift, the graph looks intentional on mobile, and the resume opens in a new tab.

## Phase 3 — Selected Work
1. Build the stacked-card scroll per spec, using GSAP pinning on desktop and a vertical list with reveals on mobile.
2. Video handling: IntersectionObserver lazy-loading, pause when offscreen, poster fallback.
3. Card content per spec, the "How it works" layout expand, a simple `view ↗` hover label, and the link to /work/[slug].
4. Fully data-driven from content/site.ts.

**Acceptance:** 60fps scroll on a mid-range laptop, no jank when cards pin or unpin, and videos don't all load at once (verify in the Network tab).

## Phase 4 — Case Studies
1. Statically generate /work/[slug] from content.
2. Page layout per spec, plus a scroll-drawn SVG architecture diagram per project.
3. Shiki snippets with highlighted lines, marked `[[REPLACE WITH REAL CODE]]`.
4. Shared-element transition (View Transitions API with a curtain fallback), plus next/prev navigation.

**Acceptance:** all slugs build statically, back navigation restores scroll position, and transitions degrade gracefully.

## Phase 5 — Remaining Sections
1. Build the principles, archive (with cursor-follow preview, desktop only), education & certifications (no GPA), Now (with IST clock), and contact/footer (scramble email, copy toast, no phone number).

**Acceptance:** grep the repo for "GPA", "CGPA", "8.39", and "9302527611". Zero results.

## Phase 6 — Signature Interactions
1. ⌘K palette, the full custom cursor (driven by data attributes), the `~` terminal, and route curtain transitions.
2. Audit focus states and aria labels on every interactive element.

**Acceptance:** fully keyboard-operable, nothing breaks on touch, no listener leaks across route changes.

## Phase 7 — Polish & Ship
1. Reduced-motion pass on every section.
2. Responsive pass at 360, 390, 768, 1024, and 1440px.
3. Performance: Lighthouse ≥95 in all categories (report the actual scores), code-split heavy components, preload only hero fonts.
4. SEO: metadata, a dynamic OG image, Twitter card, sitemap, robots.txt, and JSON-LD.
5. A README covering setup, editing content/site.ts, adding a project, an ffmpeg command to compress previews to <2MB (webm + mp4), and Vercel + custom-domain deployment.
6. Remove unused dependencies and dead code.
7. Final output: every remaining `[[PLACEHOLDER]]`, any compromises made and why, and PROGRESS.md marked complete.

**Acceptance:** all quality-bar items pass.

---

## Design System (approved)

Approved 2026-11-02 (Phase 0). This overrides SPEC "Visual direction" where they differ.

### Type
| Role | Font (next/font/google) | Why |
|---|---|---|
| Display | **Instrument Serif** 400 + italic | Editorial serif with narrow caps: `KAUSTUBH` fits 7/12 cols at ~12vw, leaving room for the graph. Single weight = one small file (LCP). Serif vs mono = "calm editor over a precise machine". |
| Mono | **Geist Mono** (variable) | The system voice: labels, log, marquee, badges, palette, terminal. Tabular digits keep clocks/timestamps from jittering. |
| Body | **Geist** (variable) | Neutral, engineered; shares metrics with Geist Mono so mixed prose + inline code sit on one baseline. |

Rule: hierarchy comes from size and family, never from bold display text (display has one weight).

### Accent — signal orange `#FF5B1F` (one hue only)
- Reads as a status LED / "process running", matching the graph concept. Acid lime was rejected: ~1.3:1 on light paper, unusable in light mode.
- Dark: `#FF5B1F` on `#0B0B0C` = 6.3:1 (AA text).
- Light: fills/dots/edges/curtain stay `#FF5B1F`; accent **text** uses `--accent-ink: #B83A0B` (5.0:1 on paper). Same hue, deeper tone, not a second color.
- Text on accent fills is always ink `#0B0B0C` (6.3:1).
- No green/red status colors. Node state = glyph + ink: `✓` done (muted), `→ running` (accent), `○ queued` (subtle).

### Color tokens
| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0B0B0C` | `#F2EFE8` |
| `--surface` | `#121214` | `#EAE6DD` |
| `--surface-2` | `#19191B` | `#E1DCD1` |
| `--fg` | `#EDEAE3` (16.3:1) | `#141413` (16:1) |
| `--fg-muted` | `#8A867E` (5.4:1) | `#6B675F` (4.9:1) |
| `--fg-subtle` | `#55524D` (decorative only) | `#A39E94` (decorative only) |
| `--line` | `rgb(237 234 227 / .08)` | `rgb(20 20 19 / .10)` |
| `--line-strong` | `rgb(237 234 227 / .16)` | `rgb(20 20 19 / .20)` |
| `--grid-line` | `rgb(237 234 227 / .04)` | `rgb(20 20 19 / .05)` |
| `--accent` | `#FF5B1F` | `#FF5B1F` |
| `--accent-ink` | `#FF5B1F` | `#B83A0B` |
| `--on-accent` | `#0B0B0C` | `#0B0B0C` |
| `--focus` | accent, 2px ring + 2px offset | same |
| grain opacity | `0.025` | `0.03` |

- Grain: static tiled noise PNG, fixed, `pointer-events: none`, never animates.
- Radius: `0` panels · `4px` cards/video · `2px` badges/buttons · full only on the status dot.

### Type scale (fluid)
| Token | Value | Use |
|---|---|---|
| `--text-hero` | <1024: `clamp(3.5rem, 18vw, 5rem)` · ≥1024: `clamp(5rem, 12vw, 14rem)` | name, 2 lines, lh .86, tracking −.02em, uppercase |
| `--text-display-xl` | `clamp(2.75rem, 7vw, 7.5rem)` | section titles, contact email (lh .95, tracking −.015em) |
| `--text-display-l` | `clamp(2.25rem, 4.5vw, 4.5rem)` | case-study title |
| `--text-display-m` | `clamp(1.75rem, 3vw, 3rem)` | card titles; marquee (mono) |
| `--text-h3` | `clamp(1.25rem, 1.6vw, 1.5rem)` | sans 500, principle titles (lh 1.1) |
| `--text-lead` | `clamp(1.0625rem, 1.2vw, 1.25rem)` | role line, case-study intro (lh 1.5) |
| `--text-body` | `1rem` | lh 1.6, max 68ch |
| `--text-sm` | `0.875rem` | captions, code |
| `--text-meta` | `clamp(0.75rem, 0.7rem + 0.15vw, 0.8125rem)` | mono UPPERCASE, tracking +.08em (`01 / WORK`) |

### Spacing & grid
- Spacing (4px base): `1`=4 `2`=8 `3`=12 `4`=16 `5`=24 `6`=32 `7`=48 `8`=64 `9`=96 `10`=128 `11`=192.
- Section padding: `--space-section: clamp(6rem, 12vw, 12rem)`.
- Grid: <768 → 4 cols, 16px margin, 16px gap · 768–1023 → 8 cols, 32px margin, 20px gap · ≥1024 → 12 cols, `clamp(2rem, 3vw, 3rem)` margin, 24px gap. Max width 1680px.
- Hairline overlay: vertical lines at every column edge in `--grid-line`, fixed, decorative. Content snaps to these lines.
- Breakpoints: 360 (base) · 768 · 1024 · 1440. Tap targets ≥ 44×44px.
- Z-index: content 0 · grid 1 · nav 50 · cursor 100 · palette/terminal 200 · preloader 300 · curtain 400 · grain 500.

### Motion
Durations: `--dur-instant` 100ms (color/opacity hover) · `--dur-fast` 180ms (tooltips, button states) · `--dur-base` 320ms (toggles, small fades, nav hide/show) · `--dur-slow` 640ms (line reveals, card entrances) · `--dur-slower` 900ms (hero name, curtain).

Easings:
- `--ease-out: cubic-bezier(.16,1,.3,1)` — all entrances/reveals.
- `--ease-in-out: cubic-bezier(.76,0,.24,1)` — curtain and preloader wipes.
- `linear` — marquee and anything scroll-scrubbed.
- Motion springs: magnetic `{stiffness:150, damping:15, mass:.1}` (pull 0.3× offset, max 12px) · cursor `{stiffness:500, damping:40}` · archive preview `{stiffness:200, damping:25}` · layout expand `{type:"spring", bounce:0, duration:.45}`.

Staggers: hero letters 25ms · heading lines 80ms · badges/rows 40ms · graph: 180ms per Kahn level, 220ms edge fill, ~2s full run, one log line per completed node.

Hero timeline (after preloader): 0ms name reveal (**CSS-driven, does not wait for hydration**, protects LCP) → 300ms role line → 500ms chip + CTAs → 600ms graph run → 2.6s scroll cue.

Animates: `transform`, `opacity`, `clip-path` (wipes/masks), `stroke-dashoffset` (edges/diagrams); height only via Motion layout (FLIP).
Never animates: width/height/top/left directly; body paragraphs (no per-word reveals); large-area background colors; grain; focus rings (instant); nothing on scroll-up except nav and marquee direction. No scroll-jacking (Lenis smooths, native position kept). Infinite loops only: marquee, 2s status-dot pulse. Graph edges pulse only while running, then idle.

Reduced motion: Lenis, cursor, magnetic, pinning, preloader off · marquee → static wrapped list · graph → completed state + full static log · videos → poster + play button · reveals → 150ms opacity fade · route wipes → instant swap.

### Hero graph DAG (8 nodes, 6 Kahn levels)
`idea → design → {frontend, backend}` · `backend → {db, llm}` · `{frontend, db, llm} → test → ship`.
Desktop: levels left→right. Mobile: the same layout function with axes swapped, levels top→bottom.

### Project links
01–03 have a live URL → `● deployed` flag + `Live ↗`. 04 backend-ledger has no public link → `GitHub ↗` only. Driven by optional `liveUrl` in content/site.ts (URLs in DECISIONS.md).

### Wireframes

#### Preloader (≤1.2s, bottom-left, not centered)
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  > initializing kaustubh.dev…                        │
│  > resolving dependencies… ok                        │
│  > compiling graph (8 nodes)… ok                     │
│  > ready ▍                                           │
│                                                      │
│  ██████████████████████░░░░░░  0.84s      [skip ↵]   │
└──────────────────────────────────────────────────────┘
   → accent curtain wipes up (clip-path), revealing the hero
```
Mobile: same, lines wrap; tap anywhere skips.

#### Navbar
```
DESKTOP
┌──────────────────────────────────────────────────────────────────────────┐
│ kb/ kaustubh.dev    01 work  02 principles  03 archive  04 contact  [⌘K] ◐ │
└──────────────────────────────────────────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━──────────────────────────── ← progress (accent)

MOBILE (360)
┌──────────────────────────────┐
│ kb/                 [⌘] ◐ [≡]│   ≡ → Sheet with links + socials
└──────────────────────────────┘
```

#### Hero
```
DESKTOP (1440) — name cols 1–7, graph cols 8–12
┌────────────────────────────────────────────────────────────────────────┐
│ 00 / INDEX              status: available              IST 17:16:04     │
│                                                                         │
│ KAUSTUBH                        ┌─ run #1 ─────────────────── 8 nodes ┐ │
│ BRAMHE                          │            ┌▶ frontend ────────┐    │ │
│                                 │ idea ▶ design                  ├▶ test ▶ ship
│                                 │            └▶ backend ┬▶ db ───┤    │ │
│ Full-stack developer building   │                       └▶ llm ──┘    │ │
│ reliable backends, workflow     ├─ log ──────────────────────────────┤ │
│ engines, and LLM-powered        │ [00:00.12] node:idea ✓              │ │
│ products.                       │ [00:00.31] node:design ✓            │ │
│                                 │ [00:00.48] node:backend → running   │ │
│ ● available for SDE roles · 2027│                          [↻ re-run] │ │
│                                 └─────────────────────────────────────┘ │
│ [Resume ↗]  GitHub  LinkedIn  LeetCode  [copy email]                    │
│ ↓ scroll                                                   v1 · 2026    │
└────────────────────────────────────────────────────────────────────────┘

MOBILE (360)
┌──────────────────────────────┐
│ 00 / INDEX        IST 17:16  │
│ KAUSTUBH                     │
│ BRAMHE                       │
│ Full-stack developer         │
│ building reliable backends,  │
│ workflow engines, and LLM-   │
│ powered products.            │
│ ● available · SDE 2027       │
│ [ Resume ↗ ] [ copy email ]  │
│ [GitHub] [LinkedIn] [LeetCode]│
│ ┌─ run #1 ─────── 8 nodes ─┐ │
│ │         idea             │ │
│ │          ↓               │ │
│ │        design            │ │
│ │      ↙       ↘           │ │
│ │ frontend   backend       │ │
│ │     │      ↙    ↘        │ │
│ │     │    db     llm      │ │
│ │      ↘   ↓    ↙          │ │
│ │         test → ship      │ │
│ ├─ log (last 3) ───────────┤ │
│ │ [00:00.48] backend → run │ │
│ │                [↻ re-run]│ │
│ └──────────────────────────┘ │
│ ↓ scroll                     │
└──────────────────────────────┘
```

#### Stack marquee
```
──────────────────────────────────────────────────────────────────────────
 JAVA · PYTHON · JAVASCRIPT · TYPESCRIPT · SQL · REACT · NODE.JS · EXPRESS · FAST…
──────────────────────────────────────────────────────────────────────────
 mono, --text-display-m, hairlines above/below, "·" in accent; same on mobile, smaller
```

#### Selected Work
```
DESKTOP — card is a true 16:9, width = min(100%, 82svh × 16/9); sticky stack
│ 01 / WORK ─────────────────────────────────────────── 04 entries · by index │
│ Selected                                                                    │
│ Work                                                                        │
│  ┌ 01 / forgefort ───────────────────── scale .92 · dimmed ┐                │
│  ┌ 02 / price-optimizer ─────────────── scale .92 · dimmed ┐                │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ 03 / ticket-tracker        ● deployed       [Live ↗] [GitHub ↗]      │   │ ← pinned
│ │                                                                      │   │
│ │              ░░░░░░  preview video, full-bleed  ░░░░░░  ( view ↗ )   │   │ ← cursor
│ │ ┌───────────────────────────────────┐                                │   │
│ │ │ Support Ticket Tracker            │  ← solid --surface panel,      │   │
│ │ │ Ticket lifecycle management with  │    no blur/glass               │   │
│ │ │ production-grade validation.      │                                │   │
│ │ │ [React][Node.js][Express][MongoDB][Zod]                            │   │
│ │ │ how it works                   +  │                                │   │
│ │ └───────────────────────────────────┘                                │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│     ▲ 04 / backend-ledger slides up next (GitHub ↗ only)                    │

  expanded (Motion layout; panel grows upward over the video):
│ │ ┌───────────────────────────────────┐
│ │ │ how it works                   −  │
│ │ │ 01  REST APIs for lifecycle …     │
│ │ │ 02  Layered Zod + Mongoose …      │
│ │ │ 03  Indexes + aggregations …      │
│ │ └───────────────────────────────────┘

MOBILE — no pin, info below video
│ 01 / WORK                    │
│ Selected Work                │
│ 01 ────────────── forgefort  │
│ [ video 16:9, plays in view ]│
│ Forgefort                    │
│ A visual workflow builder    │
│ with its own execution engine│
│ [React][Node][Mongo][SSE] +5 │
│ ● deployed                   │
│ [ Live ↗ ]  [ GitHub ↗ ]     │
│ how it works              +  │
│ ──────────────────────────── │
│ 02 ──────── price-optimizer  │
│ 03 ───────── ticket-tracker  │
│ 04 ───────── backend-ledger  │
```

#### Case study `/work/[slug]`
```
DESKTOP — sticky label column cols 1–3, content cols 4–10, meta cols 11–12
│ ← work / 01 forgefort                               next: price-optimizer → │
│ ┌───────────── hero video 16:9 (shared element from card) ──────────────┐ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│ Forgefort                                        role   solo · full-stack │
│ Agentic Workflow Automation Platform             stack  React, Node, …    │
│                                                  links  Live ↗ GitHub ↗   │
│ ───────────────────────────────────────────────────────────────────────── │
│ 01 PROBLEM      │ prose (68ch)                                            │
│ 02 APPROACH     │ prose                                                   │
│ 03 ARCHITECTURE │ ┌ svg, edges draw on scroll ────────────────────────┐   │
│                 │ │ [client] ─▶ [api] ─▶ [engine] ─▶ [executors]      │   │
│                 │ │     ▲─────────── SSE ───────────┘                  │   │
│                 │ └───────────────────────────────────────────────────┘   │
│ 04 HARD PARTS   │ prose + ┌ engine/kahn.ts ── [[REPLACE WITH REAL CODE]] ┐ │
│                 │         │ 12 │ while (queue.length) {   ← highlighted  │ │
│                 │         └──────────────────────────────────────────────┘ │
│ 05 RESULT       │ prose                                                   │
│ ───────────────────────────────────────────────────────────────────────── │
│ ← prev · 04 backend-ledger                 02 price-optimizer · next →    │

MOBILE
│ ← work        next →         │
│ [ hero video 16:9 ]          │
│ Forgefort                    │
│ role / stack / links stacked │
│ 01 PROBLEM                   │
│ prose                        │
│ 03 ARCHITECTURE              │
│ [diagram re-laid top→bottom] │
│ [code scrolls horizontally   │
│  inside its own box]         │
│ ← prev          next →       │
```

#### Principles (asymmetric: sticky title column + 2×2 cards)
```
DESKTOP
│ 02 / PRINCIPLES      │ ┌ P.01 ────────────────────┐ ┌ P.02 ─────────────────────┐ │
│ How I                │ │ Idempotent by default    │ │ Validate at every boundary│ │
│ build                │ │ Duplicate requests are   │ │ Zod at the edge, schema   │ │
│ (sticky, cols 1–4)   │ │ not duplicate charges.   │ │ at the DB.                │ │
│                      │ │ ┌ 3–6 line snippet ────┐ │ │ ┌ snippet ─────────────┐  │ │
│                      │ │ └──────────────────────┘ │ │ └──────────────────────┘  │ │
│                      │ └──────────────────────────┘ └───────────────────────────┘ │
│                      │ ┌ P.03 Never trust user URLs┐ ┌ P.04 Derive, don't store ─┐ │
MOBILE: label + title, then 4 stacked cards; snippets scroll horizontally if needed.
```

#### Archive
```
DESKTOP — year cols 1–2 · name 3–7 · stack 8–11 · link 12
│ 03 / ARCHIVE ───────────────────────────────────────────────── 05 entries │
│ [[YEAR]]  Concurrent-safe Event Booking      PostgreSQL · SKIP LOCKED   ↗ │
│ ───────────────────────────────────────────────────────────────────────── │
│ [[YEAR]]  Creator Intelligence Platform      RAG · LLM APIs  ┌───────┐  ↗ │
│ ───────────────────────────────────────────────────────────  │preview│ ── │ ← follows cursor (spring)
│ [[YEAR]]  Smart Resume Screener              [[STACK]]       └───────┘  ↗ │
│ [[YEAR]]  AI Ambulance Route Optimization …  capstone                   ↗ │
│ [[YEAR]]  Node.js educational website        24 chapters                ↗ │

MOBILE (no preview)
│ [[YEAR]]                   ↗ │
│ Concurrent-safe Event Booking│
│ PostgreSQL · SKIP LOCKED     │
│ ──────────────────────────── │
```

#### Education & Certifications
```
DESKTOP
│ 04 / EDUCATION                                                            │
│ B.Tech, Computer Science        │ VIT-AP University, Amaravati            │
│ & Engineering                   │ 2023 — 2027                             │
│ (display-l, cols 1–6)           │ coursework  DSA · DBMS · OS · CN · OOP  │
│ ───────────────────────────────────────────────────────────────────────── │
│ CERTIFICATIONS                                                            │
│ 2024–25  ─●─  The Complete Full Stack                         Udemy       │
│           │                                                               │
│ 2025     ─●─  Oracle Generative AI                            Oracle      │
│           │                                                               │
│ 2025–26  ─●─  IBM Machine Learning                            IBM         │
MOBILE: degree block stacks; timeline keeps the 64px mono date column + line + title/issuer.
```

#### Now (key/value process table)
```
DESKTOP
│ 05 / NOW                                  IST 17:16:04 · updated [[DATE]] │
│ building   →  [[PLACEHOLDER]]                                             │
│ learning   →  [[PLACEHOLDER]]                                             │
│ status     →  open to SDE roles for 2027   ●                              │
MOBILE: same rows, key above value.
```

#### Contact / footer
```
DESKTOP
│ 06 / CONTACT                                                              │
│ kaustubhbramhe777@gmail.com          ← display-xl serif; hover = scramble,│
│ ─────────────────────────────────      click = copy + toast, cursor "copy"│
│ GitHub ↗   LinkedIn ↗   LeetCode ↗   Resume ↗                back to top ↑│
│ Madhya Pradesh, India · IST               Built with Next.js, GSAP, Motion│
│ © 2026 Kaustubh Bramhe                             press ~ for a terminal │

MOBILE — email breaks at "@"
│ 06 / CONTACT                 │
│ kaustubhbramhe777            │
│ @gmail.com                   │
│ [ tap to copy ]              │
│ GitHub ↗ / LinkedIn ↗ /      │
│ LeetCode ↗ / Resume ↗        │
│ back to top ↑                │
│ Madhya Pradesh, India · IST  │
```

#### Overlays
```
⌘K PALETTE (Dialog, top third, 560px; full-width sheet on mobile)
┌─────────────────────────────────────────────┐
│ >  type a command…                     esc  │
│ ACTIONS   open resume ↗ · copy email ·      │
│           toggle theme                      │
│ GO TO     01 forgefort · 02 price-optimizer │
│           · principles · archive · contact  │
│ SOCIAL    GitHub ↗ · LinkedIn ↗ · LeetCode ↗│
└─────────────────────────────────────────────┘

~ TERMINAL (bottom drawer, 50svh, focus-trapped)
┌─ kaustubh@dev: ~ ───────────────────────── esc ┐
│ $ whoami                                       │
│ kaustubh bramhe — full-stack developer         │
│ $ ▍                                            │
└────────────────────────────────────────────────┘

CURSOR: 8px --fg dot → grows into an accent pill with ink label: "view ↗" | "copy" | "open"
```

### Known risks (verify in later phases)
- A masked reveal can delay LCP if the text starts clipped → reveal starts on the first CSS frame; measure in Phase 2.
- Archive years/stacks are not in the spec → `[[PLACEHOLDER]]` until provided.
