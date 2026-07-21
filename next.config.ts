import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Disable Vercel image optimization — images come from Supabase CDN
    // which already serves optimised images. This prevents hitting the
    // 5,000 free-tier transformation limit on Vercel.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "clofhlxcctxukdpjssym.supabase.co",
      },
    ],
  },
};

export default nextConfig;
