import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Remove any deprecated options that might cause build issues
  },
  // Ensure proper build output for Vercel
  output: 'standalone',
};

export default nextConfig;
