import "server-only";
import path from "path";

let cachedBundleUrl: string | null = null;

/**
 * Get or create a Remotion bundle for rendering
 * The bundle is cached in memory to avoid re-bundling on every request
 */
export async function getRemotionBundle(): Promise<string> {
  // Return cached bundle if available
  if (cachedBundleUrl) {
    console.log("Using cached Remotion bundle:", cachedBundleUrl);
    return cachedBundleUrl;
  }

  console.log("Creating new Remotion bundle...");

  // Dynamic import to avoid bundling issues
  const { bundle } = await import("@remotion/bundler");

  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), "src/remotion/index.tsx"),
    // Enable caching for faster subsequent bundles
    enableCaching: true,
    webpackOverride: (config) => {
      // Add path alias resolution for @/* -> src/*
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config.resolve?.alias ?? {}),
            '@': path.resolve(process.cwd(), 'src'),
          },
        },
      };
    },
  });

  cachedBundleUrl = bundleLocation;
  console.log("Bundle created at:", bundleLocation);

  return bundleLocation;
}

/**
 * Clear the cached bundle (useful for development or when source changes)
 */
export function clearBundleCache(): void {
  cachedBundleUrl = null;
  console.log("Bundle cache cleared");
}
