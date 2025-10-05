import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
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

    // Don't bundle these server-only packages in client
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        '@remotion/bundler': '@remotion/bundler',
        '@remotion/renderer': '@remotion/renderer',
        esbuild: 'esbuild',
      });
    }

    return config;
  },
};

export default nextConfig;
