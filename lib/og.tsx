import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { site } from "@/content/site";

/**
 * Shared renderer for the Open Graph / Twitter images (app/opengraph-image.tsx,
 * app/work/[slug]/opengraph-image.tsx and their twitter-image twins).
 * Satori can't read CSS variables, so the dark theme tokens are mirrored here
 * (same approach as lib/motion.ts). Keep in sync with app/globals.css.
 */

export const ogSize = { width: 1200, height: 630 } as const;
export const ogContentType = "image/png";

const token = {
  bg: "#120E08",
  fg: "#F2D8A6",
  fgMuted: "#A3875A",
  line: "rgba(242, 216, 166, 0.16)",
  gridLine: "rgba(242, 216, 166, 0.05)",
  accent: "#FFB000",
} as const;

// TTF copies of the site fonts (satori reads ttf/otf/woff, not next/font's woff2).
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/GeistMono-Regular.ttf")),
]);

export const siteHost = new URL(site.meta.url).host;

type OgCard = {
  /** Top-left system label, e.g. "00 / INDEX". */
  label: string;
  /** Mono `$ whoami` output above the title, as in the hero. */
  whoami?: string;
  /** Display lines (serif). */
  title: string[];
  titleSize: number;
  /** Mono line under the title. */
  lead?: string;
  /** Bottom-left status, after the accent marker. */
  status: string;
};

const COLS = 12;
const PAD = 72;

export async function renderOgImage({ label, whoami, title, titleSize, lead, status }: OgCard) {
  const [serif, mono] = await fonts;
  const meta = {
    fontFamily: "Geist Mono",
    fontSize: 20,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: token.fgMuted,
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: PAD,
          background: token.bg,
          color: token.fg,
          position: "relative",
        }}
      >
        {/* Hairline column grid, as on the site. */}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: PAD + ((ogSize.width - PAD * 2) * i) / COLS,
              width: 1,
              background: token.gridLine,
            }}
          />
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", ...meta }}>
          <span>{label}</span>
          <span>{siteHost}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {whoami && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 36, fontFamily: "Geist Mono" }}>
              <div style={{ display: "flex", gap: 12, fontSize: 22, color: token.fgMuted }}>
                <span style={{ color: token.accent }}>$</span>
                <span>whoami</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 34 }}>
                <span>{whoami}</span>
                <div style={{ width: 16, height: 34, marginLeft: 4, background: token.accent }} />
              </div>
            </div>
          )}
          {title.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: "Instrument Serif",
                fontSize: titleSize,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                maxWidth: 960,
              }}
            >
              {line}
            </div>
          ))}
          {lead && (
            <div
              style={{
                marginTop: 32,
                maxWidth: 860,
                fontFamily: "Geist Mono",
                fontSize: 26,
                lineHeight: 1.45,
                color: token.fgMuted,
              }}
            >
              {lead}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: `1px solid ${token.line}`,
            ...meta,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 12, height: 12, background: token.accent }} />
            <span style={{ color: token.fg }}>{status}</span>
          </div>
          <span>{site.profile.name}</span>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Instrument Serif", data: serif, weight: 400, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
