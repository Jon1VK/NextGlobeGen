import type { OriginRoute } from "~/cli/types";

export const getExpectedOriginRoutes = (
  prefixDefaultLocale: boolean,
  includeEnUS?: boolean,
): OriginRoute[] => {
  const prefix = prefixDefaultLocale ? "/fi" : "/(fi)";
  return [
    {
      type: "page",
      path: "/(static)/about/page.jsx",
      localizedPaths: {
        ...(includeEnUS
          ? { "en-US": "/en-US/(static)/about-the-site/page.jsx" }
          : {}),
        en: "/en/(static)/about-the-site/page.jsx",
        fi: `${prefix}/(static)/tietoa-sivustosta/page.jsx`,
      },
    },
    {
      type: "template",
      path: "/(static)/about/template.jsx",
      localizedPaths: {
        ...(includeEnUS
          ? { "en-US": "/en-US/(static)/about-the-site/template.jsx" }
          : {}),
        en: "/en/(static)/about-the-site/template.jsx",
        fi: `${prefix}/(static)/tietoa-sivustosta/template.jsx`,
      },
    },
    {
      type: "layout",
      path: "/(static)/layout.jsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/(static)/layout.jsx" } : {}),
        en: "/en/(static)/layout.jsx",
        fi: `${prefix}/(static)/layout.jsx`,
      },
    },
    ...(includeEnUS
      ? [
          {
            type: "markdown",
            path: "/(static)/privacy-policy/page.en-US.mdx",
            localizedPaths: {
              "en-US": "/en-US/(static)/privacy-policy/page.tsx",
            },
          } as const,
        ]
      : []),
    {
      type: "markdown",
      path: "/(static)/privacy-policy/page.en.mdx",
      localizedPaths: {
        en: "/en/(static)/privacy-policy/page.tsx",
      },
    },
    {
      type: "markdown",
      path: "/(static)/privacy-policy/page.fi.mdx",
      localizedPaths: {
        fi: `${prefix}/(static)/tietosuojaseloste/page.tsx`,
      },
    },
    {
      type: "not-found",
      path: "/[...catchAll]/not-found.jsx",
      localizedPaths: {
        ...(includeEnUS
          ? { "en-US": "/en-US/[...catchAll]/not-found.jsx" }
          : {}),
        en: "/en/[...catchAll]/not-found.jsx",
        fi: `${prefix}/[...catchAll]/not-found.jsx`,
      },
    },
    {
      type: "page",
      path: "/[...catchAll]/page.jsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/[...catchAll]/page.jsx" } : {}),
        en: "/en/[...catchAll]/page.jsx",
        fi: `${prefix}/[...catchAll]/page.jsx`,
      },
    },
    {
      type: "error",
      path: "/error.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/error.tsx" } : {}),
        en: "/en/error.tsx",
        fi: `${prefix}/error.tsx`,
      },
    },
    {
      type: "not-found",
      path: "/feed/@modal/(..)images/[id]/not-found.tsx",
      localizedPaths: {
        ...(includeEnUS
          ? { "en-US": "/en-US/feed/@modal/(..)images/[id]/not-found.tsx" }
          : {}),
        en: "/en/feed/@modal/(..)images/[id]/not-found.tsx",
        fi: `${prefix}/syote/@modal/(..)kuvat/[id]/not-found.tsx`,
      },
    },
    {
      type: "page",
      path: "/feed/@modal/(..)images/[id]/page.tsx",
      localizedPaths: {
        ...(includeEnUS
          ? { "en-US": "/en-US/feed/@modal/(..)images/[id]/page.tsx" }
          : {}),
        en: "/en/feed/@modal/(..)images/[id]/page.tsx",
        fi: `${prefix}/syote/@modal/(..)kuvat/[id]/page.tsx`,
      },
    },
    {
      type: "default",
      path: "/feed/@modal/default.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/feed/@modal/default.tsx" } : {}),
        en: "/en/feed/@modal/default.tsx",
        fi: `${prefix}/syote/@modal/default.tsx`,
      },
    },
    {
      type: "loading",
      path: "/feed/loading.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/feed/loading.tsx" } : {}),
        en: "/en/feed/loading.tsx",
        fi: `${prefix}/syote/loading.tsx`,
      },
    },
    {
      type: "page",
      path: "/feed/page.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/feed/page.tsx" } : {}),
        en: "/en/feed/page.tsx",
        fi: `${prefix}/syote/page.tsx`,
      },
    },
    {
      type: "forbidden",
      path: "/forbidden.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/forbidden.tsx" } : {}),
        en: "/en/forbidden.tsx",
        fi: `${prefix}/forbidden.tsx`,
      },
    },
    {
      type: "icon",
      path: "/icon.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/icon.tsx" } : {}),
        en: "/en/icon.tsx",
        fi: `${prefix}/icon.tsx`,
      },
    },
    {
      type: "not-found",
      path: "/images/[id]/not-found.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/images/[id]/not-found.tsx" } : {}),
        en: "/en/images/[id]/not-found.tsx",
        fi: `${prefix}/kuvat/[id]/not-found.tsx`,
      },
    },
    {
      type: "page",
      path: "/images/[id]/page.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/images/[id]/page.tsx" } : {}),
        en: "/en/images/[id]/page.tsx",
        fi: `${prefix}/kuvat/[id]/page.tsx`,
      },
    },
    {
      type: "page",
      path: "/images/page.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/images/page.tsx" } : {}),
        en: "/en/images/page.tsx",
        fi: `${prefix}/kuvat/page.tsx`,
      },
    },
    {
      type: "layout",
      path: "/layout.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/layout.tsx" } : {}),
        en: "/en/layout.tsx",
        fi: `${prefix}/layout.tsx`,
      },
    },
    {
      type: "copy",
      path: "/opengraph-image.alt.txt",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/opengraph-image.alt.txt" } : {}),
        en: "/en/opengraph-image.alt.txt",
        fi: `${prefix}/opengraph-image.alt.txt`,
      },
    },
    {
      type: "copy",
      path: "/opengraph-image.jpg",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/opengraph-image.jpg" } : {}),
        en: "/en/opengraph-image.jpg",
        fi: `${prefix}/opengraph-image.jpg`,
      },
    },
    {
      type: "page",
      path: "/page.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/page.tsx" } : {}),
        en: "/en/page.tsx",
        fi: `${prefix}/page.tsx`,
      },
    },
    {
      type: "sitemap",
      path: "/sitemap.ts",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/sitemap.ts" } : {}),
        en: "/en/sitemap.ts",
        fi: `${prefix}/sitemap.ts`,
      },
    },
    {
      type: "unauthorized",
      path: "/unauthorized.tsx",
      localizedPaths: {
        ...(includeEnUS ? { "en-US": "/en-US/unauthorized.tsx" } : {}),
        en: "/en/unauthorized.tsx",
        fi: `${prefix}/unauthorized.tsx`,
      },
    },
  ];
};
