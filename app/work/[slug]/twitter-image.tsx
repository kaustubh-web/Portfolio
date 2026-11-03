import { ogContentType, ogSize } from "@/lib/og";

// Same card as the Open Graph image.
export { default, generateStaticParams } from "./opengraph-image";
export const alt = "Case study preview";
export const size = ogSize;
export const contentType = ogContentType;
