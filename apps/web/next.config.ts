import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hackhost/ui", "@hackhost/auth", "@hackhost/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Issuer-path form: /api/auth/.well-known/* → root well-known with issuer suffix
        {
          source: "/api/auth/.well-known/:path*",
          destination: "/.well-known/:path*/api/auth",
        },
      ],
    };
  },
};

export default nextConfig;
