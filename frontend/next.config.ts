import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
