import type { Metadata } from "next";

export const experimental_ppr = true;
export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 1000;
export const fetchCache = "no-cache";
export const runtime = "edge";
export const preferredRegion = "global";
export const maxDuration = 3600;
export const alt = "Image alt text";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export const generateMetadata = (): Metadata => {
  return { title: "Page title" };
};
