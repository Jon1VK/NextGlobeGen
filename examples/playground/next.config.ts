import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextGlobeGenPlugin from "next-globe-gen/plugin";

const withMDX = createMDX();
const withNextGlobeGen = createNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Checked in CI pipeline
  typescript: { ignoreBuildErrors: true },
};

export default withNextGlobeGen(withMDX(nextConfig));
