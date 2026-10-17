import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hackhost/ui", "@hackhost/auth", "@hackhost/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
