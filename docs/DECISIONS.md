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
