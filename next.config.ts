import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.markshnaknaks.com" }],
        destination: "https://markshnaknaks.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
