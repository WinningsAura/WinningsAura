import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    "/api/sheet-data": ["./data/**/*"],
  },
};

export default nextConfig;
