import { CliError } from "./errors";

type MockSchema = {
  locales: string[];
  defaultLocale: string;
  prefixDefaultLocale: boolean;
  routes: Record<string, Record<string, string>>;
};

export const schema = "{{schema}}" as unknown as MockSchema;

if (typeof schema === "string") {
  throw new CliError("Router schema for next-globe-gen has not been generated");
}

type Schema = typeof schema;

export type Locale = Schema["locales"][number];
export type Route = keyof Schema["routes"];

type ExtractStaticRoutes<T extends Route> = T extends `${any}[${any}`
  ? never
  : T;

export type StaticRoute = ExtractStaticRoutes<Route>;
export type DynamicRoute = Exclude<Route, StaticRoute>;

type ExtractRouteParams<T> = T extends `${infer R}[[${infer P}]]`
  ? ExtractRouteParams<R> | P
  : T extends `${any}[${infer P}]${infer R}`
    ? P | ExtractRouteParams<R>
    : never;

export type RouteParams<T extends Route> = {
  [K in ExtractRouteParams<T> as K extends `...${infer R}`
    ? R
    : K]: K extends `...${any}` ? string[] : string;
};
