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
};

export default nextConfig;
