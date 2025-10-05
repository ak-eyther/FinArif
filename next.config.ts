import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-specific configuration
  reactStrictMode: true,
  swcMinify: true,
  // Disable output file tracing to avoid ENOENT errors on Vercel
  outputFileTracing: false,
};

export default nextConfig;
