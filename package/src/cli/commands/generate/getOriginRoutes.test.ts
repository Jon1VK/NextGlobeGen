import { describe, expect, test } from "vitest";
import type { OriginRoute } from "~/cli/types";
import { DEFAULT_CONFIG } from ".";
import { getOriginRoutes } from "./getOriginRoutes";

const exampleDir = "./src/__mocks__/_app";

export const getExpectedOriginRoutes = (
  prefixDefaultLocale: boolean,
): OriginRoute[] => {
  const prefix = prefixDefaultLocale ? "/fi" : "/(fi)";
  return [
    {
      type: "page",
      path: "/(static)/about/page.jsx",
      localizedPaths: {
        en: "/en/(static)/about-the-site/page.jsx",
        fi: `${prefix}/(static)/tietoa-sivustosta/page.jsx`,
      },
    },
    {
      type: "template",
      path: "/(static)/about/template.jsx",
      localizedPaths: {
        en: "/en/(static)/about-the-site/template.jsx",
        fi: `${prefix}/(static)/tietoa-sivustosta/template.jsx`,
      },
    },
    {
      type: "copy",
      path: "/(static)/privacy-policy/page.en.mdx",
      localizedPaths: {
        en: "/en/(static)/privacy-policy/page.mdx",
      },
    },
    {
      type: "copy",
      path: "/(static)/privacy-policy/page.fi.md",
      localizedPaths: {
        fi: `${prefix}/(static)/tietosuojaseloste/page.md`,
      },
    },
    {
      type: "layout",
      path: "/(static)/layout.jsx",
      localizedPaths: {
        en: "/en/(static)/layout.jsx",
        fi: `${prefix}/(static)/layout.jsx`,
      },
    },
    {
      type: "not-found",
      path: "/[...catchAll]/not-found.jsx",
      localizedPaths: {
        en: "/en/[...catchAll]/not-found.jsx",
        fi: `${prefix}/[...catchAll]/not-found.jsx`,
      },
    },
    {
      type: "page",
      path: "/[...catchAll]/page.jsx",
      localizedPaths: {
        en: "/en/[...catchAll]/page.jsx",
        fi: `${prefix}/[...catchAll]/page.jsx`,
      },
    },
    {
      type: "not-found",
      path: "/feed/@modal/(..)images/[id]/not-found.tsx",
      localizedPaths: {
        en: "/en/feed/@modal/(..)images/[id]/not-found.tsx",
        fi: `${prefix}/syote/@modal/(..)kuvat/[id]/not-found.tsx`,
      },
    },
    {
      type: "page",
      path: "/feed/@modal/(..)images/[id]/page.tsx",
      localizedPaths: {
        en: "/en/feed/@modal/(..)images/[id]/page.tsx",
        fi: `${prefix}/syote/@modal/(..)kuvat/[id]/page.tsx`,
      },
    },
    {
      type: "default",
      path: "/feed/@modal/default.tsx",
      localizedPaths: {
        en: "/en/feed/@modal/default.tsx",
        fi: `${prefix}/syote/@modal/default.tsx`,
      },
    },
    {
      type: "loading",
      path: "/feed/loading.tsx",
      localizedPaths: {
        en: "/en/feed/loading.tsx",
        fi: `${prefix}/syote/loading.tsx`,
      },
    },
    {
      type: "page",
      path: "/feed/page.tsx",
      localizedPaths: {
        en: "/en/feed/page.tsx",
        fi: `${prefix}/syote/page.tsx`,
      },
    },
    {
      type: "not-found",
      path: "/images/[id]/not-found.tsx",
      localizedPaths: {
        en: "/en/images/[id]/not-found.tsx",
        fi: `${prefix}/kuvat/[id]/not-found.tsx`,
      },
    },
    {
      type: "page",
      path: "/images/[id]/page.tsx",
      localizedPaths: {
        en: "/en/images/[id]/page.tsx",
        fi: `${prefix}/kuvat/[id]/page.tsx`,
      },
    },
    {
      type: "page",
      path: "/images/page.tsx",
      localizedPaths: {
        en: "/en/images/page.tsx",
        fi: `${prefix}/kuvat/page.tsx`,
      },
    },
    {
      type: "error",
      path: "/error.tsx",
      localizedPaths: {
        en: "/en/error.tsx",
        fi: `${prefix}/error.tsx`,
      },
    },
    {
      type: "forbidden",
      path: "/forbidden.tsx",
      localizedPaths: {
        en: "/en/forbidden.tsx",
        fi: `${prefix}/forbidden.tsx`,
      },
    },
    {
      type: "icon",
      path: "/icon.tsx",
      localizedPaths: {
        en: "/en/icon.tsx",
        fi: `${prefix}/icon.tsx`,
      },
    },
    {
      type: "layout",
      path: "/layout.tsx",
      localizedPaths: {
        en: "/en/layout.tsx",
        fi: `${prefix}/layout.tsx`,
      },
    },
    {
      type: "copy",
      path: "/opengraph-image.alt.txt",
      localizedPaths: {
        en: "/en/opengraph-image.alt.txt",
        fi: `${prefix}/opengraph-image.alt.txt`,
      },
    },
    {
      type: "copy",
      path: "/opengraph-image.jpg",
      localizedPaths: {
        en: "/en/opengraph-image.jpg",
        fi: `${prefix}/opengraph-image.jpg`,
      },
    },
    {
      type: "page",
      path: "/page.tsx",
      localizedPaths: {
        en: "/en/page.tsx",
        fi: `${prefix}/page.tsx`,
      },
    },
    {
      type: "sitemap",
      path: "/sitemap.ts",
      localizedPaths: {
        en: "/en/sitemap.ts",
        fi: `${prefix}/sitemap.ts`,
      },
    },
    {
      type: "unauthorized",
      path: "/unauthorized.tsx",
      localizedPaths: {
        en: "/en/unauthorized.tsx",
        fi: `${prefix}/unauthorized.tsx`,
      },
    },
  ];
};

describe("getOriginRoutes()", () => {
  test("works correctly with prefixDefaultLocale: true", async () => {
    const files = await getOriginRoutes({
      config: {
        ...DEFAULT_CONFIG,
        locales: ["fi", "en"],
        defaultLocale: "fi",
      },
      directory: exampleDir,
    });
    expect(files).toStrictEqual(getExpectedOriginRoutes(true));
  });

  test("works correctly with prefixDefaultLocale: false", async () => {
    const files = await getOriginRoutes({
      config: {
        ...DEFAULT_CONFIG,
        locales: ["fi", "en"],
        defaultLocale: "fi",
        routes: {
          ...DEFAULT_CONFIG.routes,
          prefixDefaultLocale: false,
        },
      },
      directory: exampleDir,
    });
    expect(files).toStrictEqual(getExpectedOriginRoutes(false));
  });
});
