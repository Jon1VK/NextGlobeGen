import type { OriginRoute } from "../types";

export function isPageOriginRoute(originRoute: OriginRoute) {
  return originRoute.type === "page" || originRoute.type === "markdown";
}

export function getRouteName(originPath: string) {
  return [
    removePageSegment,
    removeInterceptedSegments,
    removeGroupSegments,
    removeParallelSegments,
    asRootPath,
  ].reduce((result, next) => next(result), originPath);
}

export function getRoutePath(localizedPath: string, removeLocale?: boolean) {
  return [
    removeLocale ? removeLocaleSegment : undefined,
    removePageSegment,
    removeInterceptedSegments,
    removeGroupSegments,
    removeParallelSegments,
    formatDynamicSegments,
    asRootPath,
  ].reduce((result, next) => next?.(result) ?? result, localizedPath);
}

function removeLocaleSegment(input: string) {
  return input.replace(/^\/[^/]*\/?/, "/");
}

function removePageSegment(input: string) {
  return input.replace(/\/page(\.[^.]+)?\.(js|ts|md)x?$/, "");
}

function removeGroupSegments(input: string) {
  return input.replace(/\/\([^)/]+\)/g, "");
}

function removeParallelSegments(input: string) {
  return input.replace(/\/@[^/]+/g, "");
}

function removeInterceptedSegments(input: string) {
  let result = input.replace(/\(\.\)/g, "");
  const twoDotsRegExp = /[^/]+\/\(\.{2}\)/g;
  while (twoDotsRegExp.test(result)) {
    result = result.replace(twoDotsRegExp, "");
  }
  return result.replace(/.*\(\.{3}\)/g, "/");
}

function formatDynamicSegments(input: string) {
  return input
    .replace(/\/\[{2}\.{3}([^\]]+)\]{2}/g, "{/*$1}") // /[[...slug]] -> {/*slug}
    .replace(/\/\[\.{3}([^\]]+)\]/g, "/*$1") // /[...slug] -> /*slug
    .replace(/\/\[([^\]]+)\]/g, "/:$1"); // /[slug] -> /:slug
}

function asRootPath(input: string) {
  return input.startsWith("/") ? input : `/${input}`;
}
