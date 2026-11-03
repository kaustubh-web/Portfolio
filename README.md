# kaustubh-portfolio

Personal portfolio of Kaustubh Bramhe, full-stack developer. Live at **https://kaustubh-bramhe.vercel.app**.

Concept: *the site is a running system*. The hero is a pipeline graph that executes in topological order (a real Kahn's algorithm), section labels read like system metadata, and there is a ⌘K palette and a `~` terminal.

Stack: Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind 4 · shadcn/ui (Radix) · Motion · GSAP + ScrollTrigger · Lenis · Shiki · Vercel.

## Setup

Requires Node 22+ and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build. Every page is prerendered; the build fails if a case study would render per request |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (must be clean) |
| `npx tsc --noEmit` | Type check (must be clean). On a fresh clone run `npm run dev` or `npx next typegen` once first, so Next's route types exist |

On Windows, run `npm run build` from PowerShell: Turbopack's worker has failed to spawn from Git Bash on this machine.

## Project layout

```
app/                 routes, root layout, globals.css (every design token), SEO files
  opengraph-image.tsx, twitter-image.tsx, sitemap.ts, robots.ts, icon.svg
  work/[slug]/       case-study pages + their OG/Twitter images
components/          sections/, work/, case-study/, hero/, layout/ (nav, palette, terminal, cursor), motion/, ui/ (shadcn)
content/site.ts      ALL copy, links and asset paths (typed)
lib/                 pure logic: graph/ (Kahn, layout, schedule, diagram), highlight (Shiki), og (OG renderer), motion tokens
hooks/               reduced motion, Lenis, boot state, navigation
assets/fonts/        TTF copies of the display + mono fonts, used only by the OG image renderer
docs/                SPEC, PLAN (design system), PROGRESS (handoff notes), DECISIONS
public/              grain.png, resume PDF, work/ and archive/ media
```

## Editing content

Everything visible on the site lives in [`content/site.ts`](content/site.ts): profile, socials, sections, boot log, hero graph, stack marquee, projects and case studies, principles, archive, education, certifications, Now, footer and terminal text. Components only render it.

- Unknown values are the literal string `[[PLACEHOLDER]]`. They render visibly (a muted mono `[[PLACEHOLDER]]` or a dashed block), and links with a placeholder href render unlinked or disabled, so nothing opens a 404. Find what's left with `grep -n "\[\[" content/site.ts`.
- `meta.url` is the canonical site URL. Metadata, the sitemap, robots.txt, OG images and JSON-LD all derive from it.
- `profile.domain` is the short name shown in the navbar, preloader and terminal.
- Socials: set real URLs in `socials`. JSON-LD `sameAs` picks up every non-placeholder URL automatically.
- Resume: drop the PDF at `public/Kaustubh_Bramhe_Resume.pdf`. `/resume` redirects to it (307, so a new file is never cached away).
- Now: update `now.rows` and `now.updated` (while `updated` is a placeholder, the "· updated" text is left out). The footer's © year is `footer.year`.
- Principle snippets: keep lines ≤ 40 characters (they sit in half-width cards at 1440px).
- **Never add grades or a phone number** anywhere (hard rule, see CLAUDE.md).

## Adding a project

No component changes are needed.

1. Append an entry to `projects` in `content/site.ts`:
   - `slug` (URL + media file names), `index` ("05"), `name`, optional `subtitle`, `pitch`, `stack`, `highlights`.
   - `liveUrl` only if it's deployed (shows `● deployed` + Live ↗). Omit it otherwise, don't use a placeholder.
   - `repoUrl`.
   - `media: media("<slug>")`.
   - `caseStudy`: `role`, `problem`, `approach`, `hardParts`, `result` (prose), `architecture` (`nodes` + `edges`; mark return paths like an SSE stream with `back: true` so the forward flow stays a DAG; keep node `detail` around 30 characters), and 1–2 `snippets` (`file`, `lang`, `code`, 1-based `highlight` lines, `caption`).
2. Add media to `public/work/` (see below). Missing files render a tokened poster with no 404s.
3. Rebuild. Media existence is checked at prerender, so `npm run build` (or a dev refresh) picks new files up.

The card stack, case-study route, next/prev pager, palette "Go to" entries, terminal `projects`, sitemap and OG image all follow from the array.

Archive rows (`archive`) take `year`, `name`, `stack`, `href` and a 4:3 preview at `public/archive/<name>.webp`.

Archive values left as `[[PLACEHOLDER]]` (years, links, a missing stack) render as empty cells, so the list shows only what's known; fill them in and they appear. To hide a whole section, set `hidden: true` on its entry in `sections`: it drops out of the page, navbar and ⌘K palette, and the sections after it renumber automatically.

## Preview media

Each project needs three files in `public/work/`, all **16:9** (the frame is fixed; anything else is cropped):

| File | Use |
|---|---|
| `<slug>.webm` | VP9, listed first (smaller) |
| `<slug>.mp4` | H.264 fallback (Safari) |
| `<slug>.webp` | Poster: shown before load, under reduced motion and if the video fails |

Keep each video **under 2 MB**: 8–12 s, 1280×720, 30 fps, no audio. From a screen recording `in.mov`:

```bash
# Crop/scale to exactly 16:9 at 1280x720, first 12 s, no audio
VF="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30"

# WebM (VP9). Raise -crf (e.g. 44) if the file is over 2 MB
ffmpeg -i in.mov -t 12 -an -vf "$VF" -c:v libvpx-vp9 -b:v 0 -crf 40 \
  -row-mt 1 -deadline good -cpu-used 2 public/work/<slug>.webm

# MP4 (H.264). Raise -crf (e.g. 30) if the file is over 2 MB
ffmpeg -i in.mov -t 12 -an -vf "$VF" -c:v libx264 -preset slow -crf 27 \
  -profile:v high -pix_fmt yuv420p -movflags +faststart public/work/<slug>.mp4

# Poster (WebP) from the frame at 1 s
ffmpeg -ss 1 -i in.mov -frames:v 1 \
  -vf "scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900" \
  -c:v libwebp -quality 80 public/work/<slug>.webp

ls -lh public/work/<slug>.*   # check sizes
```

Archive previews are 4:3 stills: swap the poster's filter for `scale=800:600:force_original_aspect_ratio=increase,crop=800:600` and write to `public/archive/<name>.webp`.

## Deploying (Vercel)

The site is deployed on Vercel at `https://kaustubh-bramhe.vercel.app`, which is the value of `meta.url`.

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project**, import the repo. Vercel detects Next.js; keep the defaults (`npm install`, `npm run build`, no output directory override). No environment variables are needed.
3. Under **Settings → Domains**, make sure the project's production domain is `kaustubh-bramhe.vercel.app` (rename the project to `kaustubh-bramhe` if Vercel assigned another name).
4. Every push to `main` deploys to production; other branches get preview URLs. Previews serve the same canonical URL in metadata, so search engines index only production.

After a deploy, check `/sitemap.xml`, `/robots.txt`, and share a link in a messenger or the [OpenGraph preview](https://www.opengraph.xyz/) to see the OG card.

### Adding a custom domain later

1. Buy the domain (e.g. a `.dev`; those are HTTPS-only by HSTS preload, which Vercel handles).
2. Vercel → project → **Settings → Domains → Add**, enter the domain, and set the DNS records Vercel shows (an `A` record for the apex, a `CNAME` to `cname.vercel-dns.com` for `www`), or point the nameservers at Vercel. The certificate is issued automatically.
3. Make the custom domain the primary one and set `kaustubh-bramhe.vercel.app` to redirect (308) to it, so there's one canonical host.
4. In `content/site.ts`, update:
   - `meta.url` → `https://<your-domain>` (canonical URLs, sitemap, robots, OG image URLs, JSON-LD).
   - `profile.domain`, `boot[0]` and `terminal.greeting` if the displayed name should change too.
5. Redeploy, then submit the new sitemap in Google Search Console.

## Quality bar

Before shipping a change: `npm run build`, `npm run lint` and `npx tsc --noEmit` clean; check 360px and 1440px; check with `prefers-reduced-motion: reduce` (no Lenis, cursor, pinning, preloader or running animations); Lighthouse ≥ 95 in every category on a quiet machine. Design rules and tokens are in [docs/PLAN.md](docs/PLAN.md) (Design System) and [CLAUDE.md](CLAUDE.md).

## Fonts and licences

Instrument Serif, Geist and Geist Mono are served via `next/font` and are under the SIL Open Font License. The TTF copies in `assets/fonts/` exist because the OG image renderer (satori) can't read woff2.
