import { type Schema } from "next-globe-gen/schema";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { middleware } from ".";

const mocks = vi.hoisted((): { schema: Schema } => {
  return {
    schema: {
      locales: ["en", "fi"],
      defaultLocale: "en",
      prefixDefaultLocale: true,
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
});

vi.mock("next-globe-gen/schema", () => mocks);

describe("middleware", () => {
  afterEach(() => {
    mocks.schema.prefixDefaultLocale = true;
  });

  test("removes default locale if prefixDefaultLocale === false", () => {
    mocks.schema.prefixDefaultLocale = false;
    const request = new NextRequest("http://localhost:3000/en/profile/1");
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/profile/1",
    );
  });

  test("does not add prefix with prefixDefaultLocale === false", () => {
    mocks.schema.prefixDefaultLocale = false;
    const request = new NextRequest("http://localhost:3000/profile/1", {
      headers: [["Accept-Language", "en,fi;q=0.9"]],
    });
    const response = middleware(request);
    expect(response.status).toBe(200);
  });

  test("redirects to locale prefixed path if no locale given", () => {
    const request = new NextRequest("http://localhost:3000/profile/1", {
      headers: [["Accept-Language", "en,fi;q=0.9"]],
    });
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/en/profile/1",
    );
  });

  test("no alternate link header if skipAlternateLinkHeader === true", () => {
    const request = new NextRequest("http://localhost:3000/en/profile/1", {
      headers: [["Accept-Language", "en,fi;q=0.9"]],
    });
    const response = middleware(request, { skipAlternateLinkHeader: true });
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBeNull();
  });

  test("adds alternate link header correctly on root route", () => {
    const request = new NextRequest("http://localhost:3000/en", {
      headers: [["Accept-Language", "en,fi;q=0.9"]],
    });
    const response = middleware(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '<http://localhost:3000/en>; rel="alternate"; hreflang="en", <http://localhost:3000/fi>; rel="alternate"; hreflang="fi", <http://localhost:3000/>; rel="alternate"; hreflang="x-default"',
    );
  });

  test("adds alternate link header correctly on subroute", () => {
    const request = new NextRequest("http://localhost:3000/en/profile/1", {
      headers: [["Accept-Language", "en,fi;q=0.9"]],
    });
    const response = middleware(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '<http://localhost:3000/en/profile/1>; rel="alternate"; hreflang="en", <http://localhost:3000/fi/profiili/1>; rel="alternate"; hreflang="fi"',
    );
  });
});
