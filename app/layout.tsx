import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";
import { site } from "@/content/site";
import { Providers } from "@/components/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { GrainOverlay, GridOverlay } from "@/components/layout/overlays";

const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // next-themes sets the theme class before paint.
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <Providers>
          <a
            href="#main"
            className="label-meta fixed top-2 left-2 z-(--z-overlay) -translate-y-[200%] bg-accent px-3 py-2 text-on-accent focus-visible:translate-y-0"
          >
            Skip to content
          </a>
          <Navbar />
          {children}
          <GridOverlay />
          <GrainOverlay />
        </Providers>
      </body>
    </html>
  );
}
