import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdjacent, getProject, site } from "@/content/site";
import { resolveMedia } from "@/lib/media";
import { CaseStudy } from "@/components/case-study/case-study";

/** Every case study is prerendered; the build fails if one would render per request. */
export const ensureStatic = "navigation";

/**
 * Reads `params` outside <Suspense> on purpose: each slug's static HTML then
 * holds the whole page (no fallback swapped in by script, so it works
 * without JS and the hero can be LCP). The cost is a URL-specific App
 * Shell, which is fine: every link here uses `prefetch` (URL data resolved
 * before the click), which the card's shared-element morph needs anyway.
 */
export const instant = false;

export function generateStaticParams() {
  return site.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.name} — case study · ${site.profile.name}`,
    description: project.pitch,
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main id="main">
      <CaseStudy project={project} media={resolveMedia(project.media)} {...getAdjacent(slug)} />
    </main>
  );
}
