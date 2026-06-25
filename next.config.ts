import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? ".next" : ".next-cache",
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico|berry-logo.jpeg).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0"
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  }
};

export default nextConfig;
