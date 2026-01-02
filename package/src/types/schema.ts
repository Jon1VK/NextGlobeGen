import type { Formats } from "intl-messageformat";
import type { DomainConfig } from "~/config";

/**
 * An interface to be augmented automatically by NextGlobeGen with the actual schema structure.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SchemaRegister {}

type MockSchema = {
  locales: string[];
  unPrefixedLocales: string[];
  defaultLocale: string;
  routes: Record<string, Record<string, string>>;
  domains?: DomainConfig[];
  formats?: Partial<Formats>;
};

/**
 * The routing schema containing all routes, locales, and domain configurations.
 * This type is augmented automatically by NextGlobeGen with the actual schema from your i18n configuration.
 */
export type Schema = SchemaRegister extends { schema: infer S }
  ? S
  : MockSchema;

/**
 * The routing schema containing all routes, locales, and domain configurations.
 */
export declare const schema: Schema;

/**
 * Union type of all locale codes configured in your application.
 */
export type Locale = Schema["locales"][number];

/**
 * Union type of all route pathnames in your application.
 * Includes both static routes and dynamic routes with parameters.
 */
export type Route = keyof Schema["routes"];

/**
 * Utility type for extracting all static routes
 */
type ExtractStaticRoutes<T extends Route> = T extends `${string}[${string}`
  ? never
  : T;

/**
 * All routes without dynamic parameters
 */
export type StaticRoute = ExtractStaticRoutes<Route>;

/**
 * All routes with dynamic parameters
 */
export type DynamicRoute = Exclude<Route, StaticRoute>;

/**
 * Utility type for extracting all possible route param keys
 */
type ExtractRouteParams<T extends Route> = T extends `${infer R}[[${infer P}]]`
  ? ExtractRouteParams<R> | P
  : T extends `${string}[${infer P}]${infer R}`
    ? P | ExtractRouteParams<R>
    : never;

/**
 * Get the params object type for a given route
 */
export type RouteParams<T extends Route> = {
  [K in ExtractRouteParams<T> as K extends `...${infer R}`
    ? R
    : K]: K extends `...${string}` ? string[] : string;
};
