import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/sheet-data": ["./data/**/*"],
  },
};

export default nextConfig;
