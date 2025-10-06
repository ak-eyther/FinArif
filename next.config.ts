import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Vercel's build trace step in Next 15.1 mistakenly expects
   * `page_client-reference-manifest.js` for grouped dashboard routes.
   * Excluding the manifest from tracing prevents the collector from
   * trying to stat a file that is never emitted.
   */
  outputFileTracingExcludes: {
    "/": [".next/server/app/**/page_client-reference-manifest.js"],
    "**": [".next/server/app/**/page_client-reference-manifest.js"],
  },
};

export default nextConfig;
