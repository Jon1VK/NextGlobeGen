import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextGlobeGenPlugin from "next-globe-gen/plugin";

const withMDX = createMDX();
const withNextGlobeGen = createNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Checked in CI pipeline
  typescript: { ignoreBuildErrors: true },
  // Allow 127.0.0.1 to be used as a dev origin for testing purposes.
  allowedDevOrigins: ["127.0.0.1"],
};

export default withNextGlobeGen(withMDX(nextConfig));
