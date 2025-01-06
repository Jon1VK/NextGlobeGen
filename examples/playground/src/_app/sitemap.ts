import type { MetadataRoute } from "next";
import { createHref, schema, type Locale, type Route } from "next-globe-gen";

export default function sitemap({
  locale,
}: {
  locale: Locale;
}): MetadataRoute.Sitemap {
  const routes = Object.keys(schema.routes) as Route[];
  const staticRoutes = routes.filter((route) => route !== "/[...catchAll]");
  return staticRoutes.map((route) => ({ url: createHref(route, locale) }));
}
