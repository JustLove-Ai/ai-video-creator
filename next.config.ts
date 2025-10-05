import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    serverComponentsExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
  },
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler'],
  webpack: (config, { isServer }) => {
    // Exclude Remotion server-side packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
};

export default nextConfig;
