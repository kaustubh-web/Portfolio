import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Shareable /resume → the PDF (temporary, so a new file is never cached away).
  redirects: async () => [
    { source: "/resume", destination: "/Kaustubh_Bramhe_Resume.pdf", permanent: false },
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
