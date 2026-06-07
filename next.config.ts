import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
      {
        pathname: "/api/files/logos/**",
      },
      {
        pathname: "/logos/**",
      },
      {
        pathname: "/images/**",
      },
      {
        pathname: "/uploads/telegram-avatars/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/logos/:filename",
        destination: "/api/files/logos/:filename",
      },
    ];
  },
};

export default nextConfig;
