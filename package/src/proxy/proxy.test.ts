import { type Schema } from "next-globe-gen/schema";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { proxy } from ".";

const prefixSchema = vi.hoisted<Schema>(() => {
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
});

const domainsSchema = vi.hoisted<Schema>(() => {
  return {
    locales: ["en-US", "en", "fi"],
    defaultLocale: "",
    unPrefixedLocales: ["en", "fi"],
    routes: {
      "/": {
        "en-US": "/en-US",
        en: "/",
        fi: "/",
      },
      "/profile/[id]": {
        "en-US": "/en-US/profile/:id",
        en: "/profile/:id",
        fi: "/profiili/:id",
      },
    },
    domains: [
      {
        domain: "fi.example.com",
        locales: ["fi"],
        defaultLocale: "fi",
      },
      {
        domain: "en.example.com",
        locales: ["en", "en-US"],
        defaultLocale: "en",
      },
    ],
  };
});

const schemaMock = vi.hoisted<{ schema: Schema }>(() => {
  return { schema: { ...prefixSchema } };
});

vi.mock("next-globe-gen/schema", () => schemaMock);

function createRequest(input: string) {
  const url = new URL(input);
  const request = new NextRequest(input, {
    headers: [
      ["Accept-Language", "en,fi;q=0.9"],
      ["host", url.host],
    ],
  });
  request.cookies.set("NEXTGLOBEGEN_LOCALE", "en");
  return request;
}

describe("proxy", () => {
  afterEach(() => {
    schemaMock.schema = { ...prefixSchema };
  });

  test("removes default locale if prefixDefaultLocale === false", () => {
    schemaMock.schema.unPrefixedLocales = ["en"];
    const request = createRequest("http://example.com/en/profile/1");
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://example.com/profile/1",
    );
  });

  test("does not add prefix with prefixDefaultLocale === false", () => {
    schemaMock.schema.unPrefixedLocales = ["en"];
    const request = createRequest("http://example.com/profile/1");
    const response = proxy(request);
    expect(response.status).toBe(200);
  });

  test("redirects to locale prefixed path if no locale given", () => {
    const request = createRequest("http://example.com/profile/1");
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://example.com/en/profile/1",
    );
  });

  test("no alternate link header if skipAlternateLinkHeader === true", () => {
    const request = createRequest("http://example.com/en/profile/1");
    const response = proxy(request, { skipAlternateLinkHeader: true });
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBeNull();
  });

  test("adds alternate link header correctly on root route", () => {
    const request = createRequest("http://example.com/en");
    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '<http://example.com/en>; rel="alternate"; hreflang="en", <http://example.com/en>; rel="alternate"; hreflang="x-default", <http://example.com/fi>; rel="alternate"; hreflang="fi"',
    );
  });

  test("adds alternate link header correctly on subroute", () => {
    const request = createRequest("http://example.com/en/profile/1");
    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '<http://example.com/en/profile/1>; rel="alternate"; hreflang="en", <http://example.com/en/profile/1>; rel="alternate"; hreflang="x-default", <http://example.com/fi/profiili/1>; rel="alternate"; hreflang="fi"',
    );
  });

  test("redirects to correct domain if locale differs", () => {
    schemaMock.schema = { ...domainsSchema };
    const firstRequest = createRequest("http://fi.example.com/en-US/profile/1");
    const firstResponse = proxy(firstRequest);
    expect(firstResponse.status).toBe(307);
    expect(firstResponse.headers.get("location")).toBe(
      "http://en.example.com/en-US/profile/1",
    );
    const secondRequest = createRequest("http://en.example.com/fi/profiili/1");
    const secondResponse = proxy(secondRequest);
    expect(secondResponse.status).toBe(307);
    expect(secondResponse.headers.get("location")).toBe(
      "http://fi.example.com/profiili/1",
    );
  });

  test("removes prefix on domain based routing if locale prefix is not wanted", () => {
    schemaMock.schema = { ...domainsSchema };
    const request = createRequest("http://fi.example.com/fi/profiili/1");
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://fi.example.com/profiili/1",
    );
  });

  test("adds prefix on domain based routing if locale prefix is wanted", () => {
    schemaMock.schema = {
      ...domainsSchema,
      domains: [
        {
          domain: "fi.example.com",
          locales: ["fi"],
          defaultLocale: "fi",
          prefixDefaultLocale: true,
        },
        {
          domain: "en.example.com",
          locales: ["en", "en-US"],
          defaultLocale: "en",
          prefixDefaultLocale: true,
        },
      ],
    };
    const request = createRequest("http://en.example.com/profile/1");
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://en.example.com/en/profile/1",
    );
  });

  test("does not redirect if domain and locale match", () => {
    schemaMock.schema = { ...domainsSchema };
    const request = createRequest("http://en.example.com/en-US/profile/1");
    const response = proxy(request);
    expect(response.status).toBe(200);
  });

  test("adds alternate link header correctly on root route for domain based routing", () => {
    schemaMock.schema = { ...domainsSchema };
    const request = createRequest("http:/fi.example.com");
    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '<http://en.example.com/en-US>; rel="alternate"; hreflang="en-US", <http://en.example.com/>; rel="alternate"; hreflang="en", <http://fi.example.com/>; rel="alternate"; hreflang="fi"',
    );
  });

  test("adds alternate link header correctly on subroute for domain based routing", () => {
    schemaMock.schema = { ...domainsSchema };
    const request = createRequest("http://fi.example.com/profiili/1");
    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBe(
      '<http://en.example.com/en-US/profile/1>; rel="alternate"; hreflang="en-US", <http://en.example.com/profile/1>; rel="alternate"; hreflang="en", <http://fi.example.com/profiili/1>; rel="alternate"; hreflang="fi"',
    );
  });

  test("redirects to user preferred locale if not done yet", () => {
    const request = createRequest("http://example.com/fi/profiili/1");
    request.cookies.clear();
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://example.com/en/profile/1",
    );
  });
});
