import { afterEach, describe, expect, test, vi } from "vitest";
import type { RouteType } from "../commands/generate/getOriginRoutes";
import type { OriginRoute } from "../types";
import { getRouteName, getRoutePath, isPageOriginRoute } from "./route-utils";

const mocks = vi.hoisted((): { originRoute: OriginRoute } => {
  return {
    originRoute: {
      type: "page",
      path: "",
      localizedPaths: {},
    },
  };
});

describe("isPageOriginRoute()", () => {
  afterEach(() => {
    mocks.originRoute.type = "page";
  });

  test("page and markdown origin route types return true", () => {
    mocks.originRoute.type = "page";
    expect(isPageOriginRoute(mocks.originRoute)).toBe(true);
    mocks.originRoute.type = "markdown";
    expect(isPageOriginRoute(mocks.originRoute)).toBe(true);
  });

  test("other origin route types return false", () => {
    const otherOriginRouteTypes = [
      "apple-icon",
      "copy",
      "default",
      "error",
      "forbidden",
      "icon",
      "layout",
      "loading",
      "not-found",
      "opengraph-image",
      "sitemap",
      "template",
      "twitter-image",
      "unauthorized",
    ] satisfies RouteType[];
    otherOriginRouteTypes.forEach((type) => {
      mocks.originRoute.type = type;
      expect(isPageOriginRoute(mocks.originRoute)).toBe(false);
    });
  });
});

describe("getRouteName()", () => {
  test("works correctly with simple path", () => {
    expect(getRouteName("/page.tsx")).toBe("/");
  });

  test("works correctly with complex path", () => {
    expect(
      getRouteName(
        "/(group)/@parallel/[id]/placeholder/(..)intercepted/page.tsx",
      ),
    ).toBe("/[id]/intercepted");
  });
});

describe("getRoutePath()", () => {
  test("works correctly with simple path", () => {
    expect(getRoutePath("/page.tsx")).toBe("/");
  });

  test("works correctly with complex path", () => {
    expect(
      getRoutePath(
        "/(group)/@parallel/[id]/placeholder/(..)intercepted/page.tsx",
      ),
    ).toBe("/:id/intercepted");
  });
});
