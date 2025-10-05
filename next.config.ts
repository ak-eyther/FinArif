import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-specific configuration
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
