# PROJECT SPEC

## Creative direction: "The site is a running system"
My flagship project is a workflow engine, so the portfolio behaves like one.
- The hero is a live node graph that executes on load. Nodes light up in topological order (Kahn's algorithm), edges pulse, and a log panel streams lines like an SSE feed:
  `[00:00.12] node:design ✓  [00:00.31] node:build ✓  [00:00.48] node:ship → running`
- Section labels read like system metadata: `01 / WORK`, `status: available`, `IST 17:16`.
- The tone is engineered, precise, and calm, with confident editorial typography and one sharp accent color.

## Hard bans (anti-AI-slop)
- No purple/blue gradients, generic glassmorphism, glowing blobs, or emoji.
- No "Hi, I'm a passionate developer" copy. No skill progress bars or percentages.
- No stock 3D icons, no Lottie clipart, no centered-everything layouts, no lorem ipsum in the final build.
- **Never display GPA/CGPA or a phone number anywhere.**

## Visual direction
(This is a starting point; the approved Phase 0 design system overrides it.)
- **Theme:** dark by default (near-black ink like #0B0B0C, warm off-white text like #EDEAE3), with a light mode toggle.
- **Accent:** one color only, e.g. signal orange #FF5B1F or acid lime.
- **Type:** an expressive display face (e.g. Instrument Serif / PP Editorial / Clash Display), a mono face for metadata (Geist Mono / JetBrains Mono), and a body sans (Geist / Inter Tight). The hero name goes up to 12–16vw.
- **Layout:** a 12-column grid with hairline grid lines at low opacity. Asymmetric composition, generous whitespace.
- **Texture:** subtle film grain overlay (≤3% opacity).

## Stack
- Next.js (App Router, latest stable) + TypeScript
- Tailwind CSS (latest) + shadcn/ui (Command, Dialog, Tooltip, Badge, Sheet, Sonner)
- Motion (`motion/react`) for component and layout animation
- GSAP + ScrollTrigger (via @gsap/react) for scroll choreography
- Lenis for smooth scroll, synced with ScrollTrigger
- Custom SVG/Canvas for the hero graph (no heavy 3D, no graph libraries)
- Shiki for code highlighting
- Deploy on Vercel to a custom .dev domain. Use next/font, next/image, metadata, and a dynamic OG image.
- ALL content lives in one typed file, `content/site.ts`. Adding a project must require zero component changes.

## Sections (in order)

### 0. Boot preloader
- A mono boot log (`initializing kaustubh.dev… resolving dependencies… ok`), then a wipe into the hero.
- Maximum 1.2s, skippable, shown once per session.
- Skipped entirely under reduced motion.

### 1. Hero
- Giant **KAUSTUBH BRAMHE** with a split-letter masked reveal.
- Role line: "Full-stack developer building reliable backends, workflow engines, and LLM-powered products."
- Status chip: `● available for SDE roles · 2027`
- The live node graph: beside the name on desktop, below it on mobile. Node tooltips on hover, plus a "re-run" button.
- CTAs:
  - **Resume ↗** opens `/Kaustubh_Bramhe_Resume.pdf` in a new tab (`target="_blank" rel="noopener"`). A `/resume` route redirects to it.
  - **GitHub**, **LinkedIn**, and **LeetCode** links.
  - **Copy email** copies to clipboard with a Sonner toast.
  - Magnetic hover on all CTAs.
- A scroll cue at the bottom.

### 2. Stack marquee
An infinite mono marquee that pauses on hover and reverses on scroll-up:
Java · Python · JavaScript · TypeScript · SQL · React · Node.js · Express · FastAPI · MongoDB · PostgreSQL · Prisma · Zod · JWT · SSE · LLM APIs

### 3. Selected Work (centerpiece)
Projects appear one after another as **large 16:9 rectangular preview cards**: 01, then 02, then 03, then 04.
- **Desktop:** a sticky stacking-card scroll. Each card pins, and the next slides up over it while the previous scales to ~0.92 and dims.
- **Each card contains:**
  - A preview video: autoplay, muted, loop, playsInline. Lazy-loaded, paused when offscreen, with a poster fallback.
  - The index number, title, and pitch.
  - Stack badges.
  - Magnetic "Live ↗" and "GitHub ↗" links.
  - A "How it works" toggle that expands the highlights via a Motion layout animation.
  - A `view ↗` cursor label on hover. Clicking the card goes to /work/[slug].
- **Mobile:** no pinning. Cards become a vertical list with in-view reveals; videos play only while visible.

#### Project data

**01 — Forgefort: Agentic Workflow Automation Platform** (slug: forgefort)
Pitch: A visual workflow builder with its own execution engine.
Stack: React, React Flow, Tailwind, Node.js, Express, MongoDB, JWT, Gemini API, SSE
Highlights:
- Custom Node.js engine orders nodes via topological sort (Kahn's algorithm), with conditional branching and retries.
- Live per-node execution status streamed over Server-Sent Events.
- Outbound HTTP nodes hardened with SSRF protection and safe expression resolution, behind JWT auth.

**02 — Price Optimizer** (slug: price-optimizer)
Pitch: ML-driven pricing recommendations for WooCommerce stores.
Stack: React, Node.js, Express, Python, FastAPI, PostgreSQL, WooCommerce API
Highlights:
- Ingests store data via the WooCommerce REST API.
- A FastAPI demand-elasticity model trained on historical sales recommends optimal prices.
- A Node.js orchestration layer combines the ML output with Gemini insights and shows projected revenue impact on a React dashboard.

**03 — Support Ticket Tracker** (slug: ticket-tracker)
Pitch: Ticket lifecycle management with production-grade validation.
Stack: React, Node.js, Express, MongoDB, Zod
Highlights:
- REST APIs for ticket lifecycle and priority, with server-side search, filtering, and pagination.
- Layered Zod + Mongoose validation with centralized error handling.
- Queries optimized with MongoDB indexes and aggregations.

**04 — Backend-Ledger** (slug: backend-ledger)
Pitch: A ledger where balances are derived, never stored.
Stack: Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer
Highlights:
- Account balances derived from immutable entries via MongoDB aggregations.
- Multi-document transactions plus idempotency keys block duplicate transfers.
- JWT-secured API.

### 4. Case study pages (/work/[slug])
- Hero video, then Problem → Approach → Architecture → Hard parts → Result.
- An animated SVG architecture diagram whose edges draw on scroll. Diagram data lives in content.
- 1–2 Shiki snippets per project with highlighted lines, marked `[[REPLACE WITH REAL CODE]]`:
  - Forgefort: Kahn's sort + SSE push
  - Ledger: idempotency check inside a transaction
  - Price Optimizer: the Node → FastAPI call
  - Ticket Tracker: layered validation
- A shared-element transition from the card preview to the case-study hero (View Transitions API, falling back to a curtain wipe).
- Next/prev project navigation.

### 5. How I build (principles)
Four cards, each with a 3–6 line snippet:
- **Idempotent by default:** duplicate requests are not duplicate charges.
- **Validate at every boundary:** Zod at the edge, schema at the DB.
- **Never trust user URLs:** SSRF guards on outbound calls.
- **Derive, don't store:** state is computed from immutable events.

### 6. Archive (compact)
- Rows in the format `year · name · stack · link`. On desktop, hovering a row shows a preview image that follows the cursor (spring easing); disabled on touch.
- Placeholder rows:
  - Concurrent-safe Event Booking (PostgreSQL advisory locks, SKIP LOCKED)
  - Creator Intelligence Platform (influencer discovery, RAG chat)
  - Smart Resume Screener
  - AI Ambulance Route Optimization & Smart Signal Priority (capstone)
  - Node.js educational website (24 chapters)

### 7. Education & Certifications
- B.Tech, Computer Science & Engineering — VIT-AP University, Amaravati · 2023–2027
  - Coursework: DSA, DBMS, Operating Systems, Computer Networks, OOP
  - **No GPA.**
- Certifications, as a timeline with a mono date column:
  - The Complete Full Stack — Udemy (2024–2025)
  - Oracle Generative AI (2025)
  - IBM Machine Learning (2025–2026)

### 8. Now
Currently building / learning lines, "open to SDE roles for 2027", and a live IST clock.

### 9. Contact / footer
- A giant email headline: click copies it with a toast, hover runs a text-scramble effect.
- Socials, back-to-top, a "Built with Next.js, GSAP, Motion" line, and "Madhya Pradesh, India · IST".
- No phone number.

## Signature interactions
1. **⌘K / Ctrl+K command palette** (shadcn Command), with a hint shown in the navbar. Actions: open resume, copy email, go to projects or sections, toggle theme, socials.
2. **Custom cursor:** a dot that grows into a context label (`view ↗`, `copy`, `open`). Hidden on touch devices and under reduced motion.
3. **Magnetic buttons** on CTAs.
4. **Text reveals:** line-split masked reveals on headings.
5. **Navbar:** hides on scroll-down, shows on scroll-up, with a scroll-progress hairline.
6. **`~` terminal easter egg:** commands help, whoami, projects, resume, contact, theme, clear, exit. Arrow-key history, focus trap, Esc closes it.
7. **Route transitions:** an accent-color curtain wipe.

## Quality bar (non-negotiable)
- **Reduced motion:** full `prefers-reduced-motion` support, with static or fade fallbacks everywhere.
- **Lighthouse:** ≥95 in all four categories. LCP < 2s. Zero layout shift from fonts or videos.
- **Responsive:** fully designed at 360px, not squeezed. Tap targets ≥44px.
- **Accessibility:** semantic HTML, visible focus states, keyboard-operable everything, AA contrast, alt text.
- **SEO:** metadata, OG/Twitter cards, sitemap, robots.txt, JSON-LD Person schema.
- **Code:** clean, typed, componentized. Animations as reusable hooks/components. No unused dependencies.

## Assets & placeholders
Use `[[PLACEHOLDER]]` for anything unknown:
- GitHub, LinkedIn, and LeetCode URLs
- Live and repo URLs per project
- Preview videos at `/public/work/<slug>.mp4` + `.webp` poster
- Resume at `/public/Kaustubh_Bramhe_Resume.pdf`
- Email: kaustubhbramhe777@gmail.com
