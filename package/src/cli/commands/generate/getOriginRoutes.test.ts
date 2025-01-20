import { afterEach } from "node:test";
import { describe, expect, test } from "vitest";
import { getExpectedOriginRoutes } from "~/__mocks__/getExpectedOriginRoutes";
import { removeCompiledFiles } from "~/cli/utils/ts-utils";
import { DEFAULT_CONFIG, mergeConfigs } from "./config";
import { getOriginRoutes } from "./getOriginRoutes";

const exampleDir = "./src/__mocks__/_app";

describe("getOriginRoutes()", () => {
  afterEach(() => {
    removeCompiledFiles();
  });

  test("works correctly with prefixDefaultLocale: true", async () => {
    const files = await getOriginRoutes({
      config: mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
      }),
      directory: exampleDir,
    });
    const sortedFiles = files.sort((a, b) =>
      a.path.localeCompare(b.path, "en"),
    );
    expect(sortedFiles).toStrictEqual(getExpectedOriginRoutes(true));
  });

  test("works correctly with prefixDefaultLocale: false", async () => {
    const files = await getOriginRoutes({
      config: mergeConfigs(DEFAULT_CONFIG, {
        locales: ["fi", "en"],
        defaultLocale: "fi",
        routes: { prefixDefaultLocale: false },
      }),
      directory: exampleDir,
    });
    const sortedFiles = files.sort((a, b) =>
      a.path.localeCompare(b.path, "en"),
    );
    expect(sortedFiles).toStrictEqual(getExpectedOriginRoutes(false));
  });
});
