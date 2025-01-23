import { describe, expect, test } from "vitest";
import type { Schema } from "~/types/schema";
import { matchRouteFactory } from "./matchRouteFactory";

function useSchema(): Schema {
  return {
    locales: ["en", "fi"],
    defaultLocale: "en",
    unPrefixedLocales: [],
    routes: {
      "/": {
        en: "/en",
        fi: "/fi",
      },
      "/profile/[id]": {
        en: "/en/profile/:id",
        fi: "/fi/profiili/:id",
      },
    },
  };
}

const matchRoute = matchRouteFactory(useSchema);

describe("matchRoute()", () => {
  test("returns undefined if no locale included in pathname", () => {
    const result = matchRoute("en", "/profile/1");
    expect(result).toBeUndefined();
  });

  test("works correctly with no dynamic segments", () => {
    const result = matchRoute("en", "/en");
    expect(result).toEqual({
      route: "/",
      localizedPaths: {
        en: "/en",
        fi: "/fi",
      },
      params: {},
    });
  });

  test("works correctly with dynamic segments", () => {
    const result = matchRoute("en", "/en/profile/1");
    expect(result).toEqual({
      route: "/profile/[id]",
      localizedPaths: {
        en: "/en/profile/:id",
        fi: "/fi/profiili/:id",
      },
      params: { id: "1" },
    });
  });
});
