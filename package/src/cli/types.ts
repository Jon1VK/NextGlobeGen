import type { RouteType } from "./commands/generate/getOriginRoutes";

export type Config<L extends string[] = string[]> = {
  locales: L;
  defaultLocale: L[number];
  prefixDefaultLocale: boolean;
  routes: {
    originDir: string;
    localizedDir: string;
  };
  messages: {
    originDir: string;
    getMessages: (locale: L[number]) => Promise<object> | object;
  };
};

type DeepPartial<T> =
  T extends Record<string, unknown>
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

type RequiredUserConfigKeys = "locales" | "defaultLocale";

export type UserConfig = Pick<Config, RequiredUserConfigKeys> &
  DeepPartial<Omit<Config, RequiredUserConfigKeys>>;

export type OriginRoute = {
  type: RouteType;
  path: string;
  localizedPaths: Record<string, string>;
};