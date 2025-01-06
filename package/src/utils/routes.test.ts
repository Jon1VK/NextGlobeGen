import { describe, expect, test, vi } from "vitest";
import type { Schema } from "~/types/schema";
import { extractLocaleAndRoutePathname, matchRoute } from "./routes";

vi.mock(
  "next-globe-gen/schema",
  (): { schema: Pick<Schema, "locales" | "routes"> } => {
    return {
      schema: {
        locales: ["en", "fi"],
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
      },
    };
  },
);

describe("extractLocaleAndRoutePathname()", () => {
  test("works correctly with no locale included in pathname", () => {
    const result = extractLocaleAndRoutePathname("/");
    expect(result).toStrictEqual([undefined, "/"]);
  });

  test("works correctly with locale included in pathname", () => {
    const result = extractLocaleAndRoutePathname("/en");
    expect(result).toStrictEqual(["en", "/"]);
  });

  test("works correctly with longer pathname", () => {
    const result = extractLocaleAndRoutePathname("/en/pathname");
    expect(result).toStrictEqual(["en", "/pathname"]);
  });
});

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
