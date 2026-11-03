import { notFound } from "next/navigation";

import { getProject, getSection, sectionLabel, site } from "@/content/site";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Case study preview";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return site.projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return renderOgImage({
    label: `${sectionLabel(getSection("work"))} · ${project.index} ${project.slug}`,
    title: [project.name],
    titleSize: project.name.length > 14 ? 120 : 168,
    lead: project.pitch,
    status: project.liveUrl ? "deployed" : project.stack.slice(0, 4).join(" · "),
  });
}
