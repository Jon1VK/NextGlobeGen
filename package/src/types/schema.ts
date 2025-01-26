import type { Formats } from "intl-messageformat";
import type { DomainConfig } from "~/utils/config";

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

export type Schema = SchemaRegister extends { schema: infer S }
  ? S
  : MockSchema;

export declare const schema: Schema;

export type Locale = Schema["locales"][number];
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
