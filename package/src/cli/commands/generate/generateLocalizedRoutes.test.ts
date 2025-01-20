import { readdir } from "fs/promises";
import path from "path";
import { afterEach, describe, expect, test } from "vitest";
import { getExpectedOriginRoutes } from "~/__mocks__/getExpectedOriginRoutes";
import { rmDirectory } from "~/cli/utils/fs-utils";
import { DEFAULT_CONFIG, mergeConfigs } from "./config";
import { generateLocalizedRoutes } from "./generateLocalizedRoutes";

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
    const posixFiles = files.map((s) => s.replaceAll(path.sep, path.posix.sep));
    const sortedFiles = posixFiles.sort((a, b) => a.localeCompare(b, "en"));
    expect(sortedFiles).toStrictEqual([
      "en",
      "en/(static)",
      "en/(static)/about-the-site",
      "en/(static)/about-the-site/page.jsx",
      "en/(static)/about-the-site/template.jsx",
      "en/(static)/layout.jsx",
      "en/(static)/privacy-policy",
      "en/(static)/privacy-policy/page.tsx",
      "en/[...catchAll]",
      "en/[...catchAll]/not-found.jsx",
      "en/[...catchAll]/page.jsx",
      "en/error.tsx",
      "en/feed",
      "en/feed/@modal",
      "en/feed/@modal/(..)images",
      "en/feed/@modal/(..)images/[id]",
      "en/feed/@modal/(..)images/[id]/not-found.tsx",
      "en/feed/@modal/(..)images/[id]/page.tsx",
      "en/feed/@modal/default.tsx",
      "en/feed/loading.tsx",
      "en/feed/page.tsx",
      "en/forbidden.tsx",
      "en/icon.tsx",
      "en/images",
      "en/images/[id]",
      "en/images/[id]/not-found.tsx",
      "en/images/[id]/page.tsx",
      "en/images/page.tsx",
      "en/layout.tsx",
      "en/opengraph-image.alt.txt",
      "en/opengraph-image.jpg",
      "en/page.tsx",
      "en/sitemap.ts",
      "en/unauthorized.tsx",
      "fi",
      "fi/(static)",
      "fi/(static)/layout.jsx",
      "fi/(static)/tietoa-sivustosta",
      "fi/(static)/tietoa-sivustosta/page.jsx",
      "fi/(static)/tietoa-sivustosta/template.jsx",
      "fi/(static)/tietosuojaseloste",
      "fi/(static)/tietosuojaseloste/page.tsx",
      "fi/[...catchAll]",
      "fi/[...catchAll]/not-found.jsx",
      "fi/[...catchAll]/page.jsx",
      "fi/error.tsx",
      "fi/forbidden.tsx",
      "fi/icon.tsx",
      "fi/kuvat",
      "fi/kuvat/[id]",
      "fi/kuvat/[id]/not-found.tsx",
      "fi/kuvat/[id]/page.tsx",
      "fi/kuvat/page.tsx",
      "fi/layout.tsx",
      "fi/opengraph-image.alt.txt",
      "fi/opengraph-image.jpg",
      "fi/page.tsx",
      "fi/sitemap.ts",
      "fi/syote",
      "fi/syote/@modal",
      "fi/syote/@modal/(..)kuvat",
      "fi/syote/@modal/(..)kuvat/[id]",
      "fi/syote/@modal/(..)kuvat/[id]/not-found.tsx",
      "fi/syote/@modal/(..)kuvat/[id]/page.tsx",
      "fi/syote/@modal/default.tsx",
      "fi/syote/loading.tsx",
      "fi/syote/page.tsx",
      "fi/unauthorized.tsx",
    ]);
  });
});
