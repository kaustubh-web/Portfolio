# kaustubh-portfolio

Personal portfolio of Kaustubh Bramhe. Concept: "the site is a running system".

## Always read docs/ first
Read docs/SPEC.md, docs/PLAN.md (protocol + phases + approved design system),
docs/PROGRESS.md and docs/DECISIONS.md before doing anything.
**One phase per session.** Build only that phase, then stop.

## Stack
Next.js (App Router) + TypeScript · Tailwind + shadcn/ui · motion/react ·
GSAP + ScrollTrigger (@gsap/react) · Lenis · Shiki · custom SVG/Canvas graph · Vercel.
All content lives in `content/site.ts` — adding a project needs zero component changes.

## Hard rules
- Never show GPA/CGPA or a phone number anywhere (code, content, metadata, comments).
- No purple/blue gradients, glassmorphism, glowing blobs, or emoji.
- No "passionate developer" copy, skill bars, or percentages.
- No stock 3D icons, Lottie clipart, centered-everything layouts, or lorem ipsum.
- One accent color only. Use design tokens; never hard-code colors.
- Every animation has a prefers-reduced-motion fallback.
- Unknown values use `[[PLACEHOLDER]]`.
- Commit messages: no Claude co-author or attribution trailer.

## Commands (from Phase 1; npm)
- `npm run dev` — dev server
- `npm run build` — production build (must pass)
- `npm run lint` — ESLint (must be clean)
- `npx tsc --noEmit` — type check (must be clean)
