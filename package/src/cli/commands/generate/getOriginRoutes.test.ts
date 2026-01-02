import { describe, expect, test } from "vitest";
import { getExpectedOriginRoutes } from "~/__mocks__/getExpectedOriginRoutes";
import { DEFAULT_CONFIG, mergeConfigs } from "~/config";
import { getOriginRoutes } from "./getOriginRoutes";

const exampleDir = "./src/__mocks__/_app";

describe("getOriginRoutes()", () => {
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
        prefixDefaultLocale: false,
      }),
      directory: exampleDir,
    });
    const sortedFiles = files.sort((a, b) =>
      a.path.localeCompare(b.path, "en"),
    );
    expect(sortedFiles).toStrictEqual(getExpectedOriginRoutes(false));
  });

  test("works correctly with domains config", async () => {
    const files = await getOriginRoutes({
      config: mergeConfigs(DEFAULT_CONFIG, {
        domains: [
          {
            domain: "fi.example.com",
            locales: ["fi"],
            defaultLocale: "fi",
          },
          {
            domain: "en.example.com",
            locales: ["en"],
            defaultLocale: "en",
            prefixDefaultLocale: false,
          },
        ],
      }),
      directory: exampleDir,
    });
    const sortedFiles = files.sort((a, b) =>
      a.path.localeCompare(b.path, "en"),
    );
    expect(sortedFiles).toStrictEqual(getExpectedOriginRoutes(true));
  });
});
