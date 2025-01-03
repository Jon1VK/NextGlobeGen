import type { NextConfig } from "next";
import { withNextGlobeGenPlugin } from "next-globe-gen/plugin";

const withNextGlobeGen = withNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  /* Next.js config options here */
};

export default withNextGlobeGen(nextConfig);
