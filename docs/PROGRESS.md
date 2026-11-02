# PROGRESS

- [x] Phase 0 — Specs, plan, design system
- [ ] Phase 1 — Foundation
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
