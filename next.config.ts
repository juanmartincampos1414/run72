import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [{ source: "/radar", destination: "/runit-scan", permanent: true }];
  },
};

export default nextConfig;
