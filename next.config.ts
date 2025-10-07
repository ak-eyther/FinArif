import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow build to succeed even with type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Fix Tailwind v4 CSS minification issue
    optimizeCss: false,
  },
};

export default nextConfig;
