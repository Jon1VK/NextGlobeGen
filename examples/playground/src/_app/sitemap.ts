import type { MetadataRoute } from "next";
import { createHref, schema, type Locale, type Route } from "next-globe-gen";
import { getPosts } from "./(demos)/dynamic/posts";

export default async function sitemap({
  locale,
}: {
  locale: Locale;
}): Promise<MetadataRoute.Sitemap> {
  const routes = Object.keys(schema.routes) as Route[];
  const staticRoutes = routes.filter(
    (route) =>
      route !== "/[...catchAll]" &&
      route !== "/dynamic/[id]" &&
      route !== "/dynamic/[id]/[slug]",
  );
  const staticSitemapEntries = staticRoutes.map((route) => ({
    url: createHref(route, locale as "fi"),
  }));
  const posts = await getPosts(locale);
  const postSitemapEntries = posts.map((post) => ({
    url: createHref(
      "/dynamic/[id]/[slug]",
      {
        id: post.id.toString(),
        slug: post.slug,
      },
      locale,
    ),
  }));
  return [...staticSitemapEntries, ...postSitemapEntries];
}
