import type { ProxyOptions } from "~/proxy";
import proxy from "~/proxy";

export type MiddlewareOptions = ProxyOptions;

/**
 * The middleware handles locale negotiation and adds alternate links of the page to the response headers.
 *
 * @example
 * import nextGlobeGenMiddleware from "next-globe-gen/middleware";
 * export function middleware(request) {
 *   const response = nextGlobeGenMiddleware(request);
 *   // other custom logic that possibly modify the response
 *   return response;
 * }
 * // Ignore next internals and static assets
 * export const config = {
 *   matcher: ["/((?!_next|.*\\.).*)"],
 * };
 */
const middleware = proxy;

export default middleware;

/**
 * The middleware handles locale negotiation and adds alternate links of the page to the response headers.
 *
 * @example
 * export { middleware } from "next-globe-gen/middleware";
 * // Ignore next internals and static assets
 * export const config = {
 *   matcher: ["/((?!_next|.*\\.).*)"],
 * };
 */
const middlewareExport = proxy;

export { middlewareExport as middleware };
