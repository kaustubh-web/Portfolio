import { getSection, sectionLabel, site } from "@/content/site";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = `${site.profile.name}: ${site.profile.roleLine}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    label: sectionLabel(getSection("index")),
    title: site.profile.nameLines,
    titleSize: 168,
    uppercase: true,
    lead: site.profile.roleLine,
    status: site.profile.status.label,
  });
}
