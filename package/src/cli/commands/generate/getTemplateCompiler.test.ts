import { afterEach, describe, expect, test } from "vitest";
import type { OriginRoute } from "~/cli/types";
import { DEFAULT_CONFIG, mergeConfigs, type Config } from "~/utils/config";
import { getTemplateCompiler } from "./getTemplateCompiler";

const mocks: { config: Config; originRoute: OriginRoute } = {
  config: mergeConfigs(DEFAULT_CONFIG, {
    routes: {
      originDir: "./src/__mocks__/_app",
    },
  }),
  originRoute: {
    type: "page",
    path: "/page.tsx",
    localizedPaths: {},
  },
};

/**
 * BASIC PAGE COMPILE RESULT
 */
const basicPageCompileResult = `
/* eslint-disable */
// @ts-nocheck

import { setLocale } from "next-globe-gen";
import OriginPage from "../_app/page";

export default function Page(props) {
\tsetLocale("en");
\treturn <OriginPage {...props} locale="en" />;
}`.trim();

/**
 * ROOT LAYOUT COMPILE RESULT
 */
const rootLayoutCompileResult = `
/* eslint-disable */
// @ts-nocheck

import { setLocale } from "next-globe-gen";
import { IntlProvider } from "next-globe-gen/client";
import { clientMessages } from "next-globe-gen/messages";
import { schema } from "next-globe-gen/schema";
import OriginLayout from "../_app/layout";

export default function Layout(props) {
\tsetLocale("en");
\treturn (
\t\t<IntlProvider locale="en" schema={schema} messages={clientMessages["en"]}>
\t\t\t<OriginLayout {...props} locale="en" />
\t\t</IntlProvider>
\t);
}`.trim();

/**
 * NON-ROOT LAYOUT COMPILE RESULT
 */
const nonRootLayoutCompileResult = `
/* eslint-disable */
// @ts-nocheck

import { setLocale } from "next-globe-gen";
import OriginLayout from "../_app/(static)/layout";

export default function Layout(props) {
\tsetLocale("en");
\treturn <OriginLayout {...props} locale="en" />;
}`.trim();

/**
 * GENERATE METADATA COMPILE RESULT
 */
const generateMetadataCompileResult = `
import { withLanguageAlternates } from "next-globe-gen";
import { generateMetadata as generateMetadataOrigin } from "../_app/page";

export async function generateMetadata(props, parent) {
\tsetLocale("en");
\tconst metadata = await generateMetadataOrigin({ ...props, locale: "en" }, parent);
\treturn withLanguageAlternates("/", await props.params)(metadata);
}`.trim();

/**
 * GENERATE METADATA COMPILE RESULT WITHOUT LANGUAGE ALTERNATES
 */
const generateMetadataSkipLanguageAlternatesCompileResult = `
import { generateMetadata as generateMetadataOrigin } from "../_app/page";

export function generateMetadata(props, parent) {
\tsetLocale("en");
\treturn generateMetadataOrigin({ ...props, locale: "en" }, parent);
}`.trim();

/**
 * ROUTE SEGMENT COMPILE RESULT
 */
const routeSegmentConfigCompileResult = `
export const experimental_ppr = true;
export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 1000;
export const fetchCache = "no-cache";
export const runtime = "edge";
export const preferredRegion = "global";
export const maxDuration = 3600;
export const alt = "Image alt text";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";`.trim();

describe("getTemplateCompiler()", () => {
  afterEach(() => {
    mocks.config.routes.skipLanguageAlternatesMetadata = undefined;
    mocks.originRoute.type = "page";
    mocks.originRoute.path = "/page.tsx";
  });

  test("compiles correct template for basic page origin route", () => {
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/page",
      routeType: "Page",
    });
    expect(compiled).toMatch(basicPageCompileResult);
  });

  test("compiles correct template for root layout", () => {
    mocks.originRoute.type = "layout";
    mocks.originRoute.path = "/layout.tsx";
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/layout",
      routeType: "Layout",
    });
    expect(compiled).toMatch(rootLayoutCompileResult);
  });

  test("compiles correct template for non-root layout", () => {
    mocks.originRoute.type = "layout";
    mocks.originRoute.path = "/(static)/layout.jsx";
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/(static)/layout",
      routeType: "Layout",
    });
    expect(compiled).toMatch(nonRootLayoutCompileResult);
  });

  test("return empty string for copy type origin route", () => {
    mocks.originRoute.type = "copy";
    mocks.originRoute.path = "/opengraph-image.jpg";
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/layout",
      routeType: "Layout",
    });
    expect(compiled).toBe("");
  });

  test("includes static metadata correctly", () => {
    mocks.originRoute.type = "layout";
    mocks.originRoute.path = "/layout.tsx";
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/layout",
      routeType: "Layout",
    });
    expect(compiled).toMatch('export { metadata } from "../_app/layout";');
  });

  test("includes generate metadata correctly", () => {
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/page",
      routeType: "Page",
    });
    expect(compiled).toMatch(generateMetadataCompileResult);
  });

  test("skips language alternated metadata correctly", () => {
    mocks.config.routes.skipLanguageAlternatesMetadata = true;
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/page",
      routeType: "Page",
    });
    expect(compiled).toMatch(
      generateMetadataSkipLanguageAlternatesCompileResult,
    );
  });

  test("includes all route segment configs correctly", () => {
    const compiler = getTemplateCompiler(mocks.config, mocks.originRoute);
    const compiled = compiler({
      locale: "en",
      relativePath: "../_app/page",
      routeType: "Page",
    });
    expect(compiled).toMatch(routeSegmentConfigCompileResult);
  });
});
