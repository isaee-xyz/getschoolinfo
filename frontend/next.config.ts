import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/:district-sitemap.xml',
        destination: '/api/sitemap/district?district=:district',
      },
    ];
  },
};

export default nextConfig;
