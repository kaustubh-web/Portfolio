import { existsSync } from "node:fs";
import path from "node:path";

import type { Project } from "@/content/site";

/** A project's media with only the files that actually exist in public/. */
export type ResolvedMedia = Partial<Project["media"]>;

const inPublic = (src: string) => existsSync(path.join(process.cwd(), "public", src));

/**
 * Server-only. Drops media paths whose file isn't in public/ yet, so a
 * missing preview renders the tokened poster instead of requesting a 404.
 * Runs at prerender time; dropping a file in public/ picks it up on the
 * next build (or the next request in dev).
 */
export function resolveMedia(media: Project["media"]): ResolvedMedia {
  return Object.fromEntries(
    Object.entries(media).filter(([, src]) => inPublic(src)),
  ) as ResolvedMedia;
}
