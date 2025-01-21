import type { RouteType } from "./commands/generate/getOriginRoutes";

export type OriginRoute = {
  type: RouteType;
  path: string;
  localizedPaths: Record<string, string>;
};
