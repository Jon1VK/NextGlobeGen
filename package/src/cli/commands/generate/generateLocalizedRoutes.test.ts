import { readdir } from "fs/promises";
import { afterEach, describe, expect, test } from "vitest";
import { rmDirectory } from "~/cli/utils/fs-utils";
import { DEFAULT_CONFIG, mergeConfigs } from "./config";
import { generateLocalizedRoutes } from "./generateLocalizedRoutes";
import { getExpectedOriginRoutes } from "./getOriginRoutes.test";

const LOCALIZED_DIR = "./generate-localized-routes-test";

describe("generateLocalizedRoutes()", () => {
  afterEach(() => {
    rmDirectory(LOCALIZED_DIR);
  });

  test("works correctly", async () => {
    generateLocalizedRoutes(
      mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        routes: {
          originDir: "./src/__mocks__/_app",
          localizedDir: LOCALIZED_DIR,
        },
      }),
      getExpectedOriginRoutes(true),
    );
    const files = await readdir(LOCALIZED_DIR, { recursive: true });
    expect(files).toStrictEqual([
      "en",
      "fi",
      "fi/(static)",
      "fi/[...catchAll]",
      "fi/error.tsx",
      "fi/forbidden.tsx",
      "fi/icon.tsx",
      "fi/kuvat",
      "fi/layout.tsx",
      "fi/opengraph-image.alt.txt",
      "fi/opengraph-image.jpg",
      "fi/page.tsx",
      "fi/sitemap.ts",
      "fi/syote",
      "fi/unauthorized.tsx",
      "fi/syote/@modal",
      "fi/syote/loading.tsx",
      "fi/syote/page.tsx",
      "fi/syote/@modal/(..)kuvat",
      "fi/syote/@modal/default.tsx",
      "fi/syote/@modal/(..)kuvat/[id]",
      "fi/syote/@modal/(..)kuvat/[id]/not-found.tsx",
      "fi/syote/@modal/(..)kuvat/[id]/page.tsx",
      "fi/kuvat/[id]",
      "fi/kuvat/page.tsx",
      "fi/kuvat/[id]/not-found.tsx",
      "fi/kuvat/[id]/page.tsx",
      "fi/[...catchAll]/not-found.jsx",
      "fi/[...catchAll]/page.jsx",
      "fi/(static)/layout.jsx",
      "fi/(static)/tietoa-sivustosta",
      "fi/(static)/tietosuojaseloste",
      "fi/(static)/tietosuojaseloste/page.tsx",
      "fi/(static)/tietoa-sivustosta/page.jsx",
      "fi/(static)/tietoa-sivustosta/template.jsx",
      "en/(static)",
      "en/[...catchAll]",
      "en/error.tsx",
      "en/feed",
      "en/forbidden.tsx",
      "en/icon.tsx",
      "en/images",
      "en/layout.tsx",
      "en/opengraph-image.alt.txt",
      "en/opengraph-image.jpg",
      "en/page.tsx",
      "en/sitemap.ts",
      "en/unauthorized.tsx",
      "en/images/[id]",
      "en/images/page.tsx",
      "en/images/[id]/not-found.tsx",
      "en/images/[id]/page.tsx",
      "en/feed/@modal",
      "en/feed/loading.tsx",
      "en/feed/page.tsx",
      "en/feed/@modal/(..)images",
      "en/feed/@modal/default.tsx",
      "en/feed/@modal/(..)images/[id]",
      "en/feed/@modal/(..)images/[id]/not-found.tsx",
      "en/feed/@modal/(..)images/[id]/page.tsx",
      "en/[...catchAll]/not-found.jsx",
      "en/[...catchAll]/page.jsx",
      "en/(static)/about-the-site",
      "en/(static)/layout.jsx",
      "en/(static)/privacy-policy",
      "en/(static)/privacy-policy/page.tsx",
      "en/(static)/about-the-site/page.jsx",
      "en/(static)/about-the-site/template.jsx",
    ]);
  });
});
