import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cloud.appwrite.io" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "**" } // Allow all for now as school images come from various sources
    ],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        // Cache static assets (fonts, images) for a long time
        source: '/(fonts|images|icons)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache Marketing Pages for 1 day
        source: '/(how-it-works|about-us|privacy-policy|terms-and-condition|for-ai-assistants)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Cache Home Page for 1 hour
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:district-sitemap.xml',
        destination: '/sitemaps/:district',
      },
    ];
  },
};

export default nextConfig;
