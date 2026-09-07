import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@scalar/api-reference-react"],
};

export default nextConfig;
