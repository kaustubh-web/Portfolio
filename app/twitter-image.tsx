import { site } from "@/content/site";
import { ogContentType, ogSize } from "@/lib/og";

// Same card as the Open Graph image.
export { default } from "./opengraph-image";
export const alt = `${site.profile.name}: ${site.profile.roleLine}`;
export const size = ogSize;
export const contentType = ogContentType;
