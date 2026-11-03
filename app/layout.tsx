import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import "./globals.css";
import { site } from "@/content/site";
import { Providers } from "@/components/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { GrainOverlay, GridOverlay } from "@/components/layout/overlays";
import { Preloader } from "@/components/layout/preloader";
import { RouteCurtain } from "@/components/layout/route-curtain";
import { LazyOverlays } from "@/components/layout/lazy-overlays";
import { Cursor } from "@/components/layout/cursor";
import { bootScript } from "@/lib/boot-config";

const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "normal",
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

// OG/Twitter images come from the opengraph-image / twitter-image files.
export const metadata: Metadata = {
  metadataBase: new URL(site.meta.url),
  title: site.meta.title,
  description: site.meta.description,
  applicationName: site.profile.name,
  authors: [{ name: site.profile.name, url: site.meta.url }],
  creator: site.profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.profile.name,
    title: site.meta.title,
    description: site.meta.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.meta.title,
    description: site.meta.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // next-themes and the boot script set attributes before paint.
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* Decides before first paint whether the boot preloader runs. */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Providers>
          <Preloader />
          <a
            href="#main"
            className="label-meta fixed top-2 left-2 z-(--z-overlay) -translate-y-[200%] bg-accent px-3 py-2 text-on-accent focus-visible:translate-y-0"
          >
            Skip to content
          </a>
          <Navbar />
          {children}
          <GridOverlay />
          <LazyOverlays />
          <Cursor />
          <RouteCurtain />
          <GrainOverlay />
        </Providers>
      </body>
    </html>
  );
}
