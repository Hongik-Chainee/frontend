import type { NextConfig } from "next";

const chainApiBase =
  process.env.CHAIN_API_BASE ?? process.env.NEXT_PUBLIC_CHAIN_API_BASE ?? "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!chainApiBase) return [];
    const normalized = chainApiBase.endsWith("/")
      ? chainApiBase.slice(0, -1)
      : chainApiBase;
    return [
      {
        source: "/api/chain/:path*",
        destination: `${normalized}/:path*`,
      },
    ];
  },
};

export default nextConfig;
