import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  experimental: {
    typedEnv: true,
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
  },
};

export default withMDX(nextConfig);
