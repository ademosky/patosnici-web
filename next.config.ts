import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      // ── Kosovo (/ks) — EUR · Albanian ──
      { source: "/ks", destination: "/" },
      { source: "/ks/products", destination: "/products" },
      { source: "/ks/products/:slug", destination: "/products/:slug" },
      { source: "/ks/cart", destination: "/cart" },
      { source: "/ks/create-own", destination: "/create-own" },
      { source: "/ks/auto-accessories", destination: "/auto-accessories" },
      { source: "/ks/contact", destination: "/contact" },

      // ── Albania (/al) — ALL (Lekë) · Albanian ──
      { source: "/al", destination: "/" },
      { source: "/al/products", destination: "/products" },
      { source: "/al/products/:slug", destination: "/products/:slug" },
      { source: "/al/cart", destination: "/cart" },
      { source: "/al/create-own", destination: "/create-own" },
      { source: "/al/auto-accessories", destination: "/auto-accessories" },
      { source: "/al/contact", destination: "/contact" },
    ];
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
