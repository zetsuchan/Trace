import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
  },
};

export default withMDX(nextConfig);
