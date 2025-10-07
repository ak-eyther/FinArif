import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: false,
    // Disable server actions to avoid tracing issues
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
