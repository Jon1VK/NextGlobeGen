import type { NextConfig } from "next";
import createNextGlobeGenPlugin from "next-globe-gen/plugin";

const withNextGlobeGen = createNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/frontend"],
};

export default withNextGlobeGen(nextConfig);
