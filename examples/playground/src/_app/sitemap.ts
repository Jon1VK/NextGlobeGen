import type { MetadataRoute } from "next";
import { createHref, schema, type Locale, type Route } from "next-globe-gen";

export default function sitemap({
  locale,
}: {
  locale: Locale;
}): MetadataRoute.Sitemap {
  const routes = Object.keys(schema.routes) as Route[];
  return routes.map((route) => ({ url: createHref(route, locale) }));
}
