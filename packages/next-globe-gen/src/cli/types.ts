import type { RouteType } from "./commands/generate/getOriginRoutes";

export type Config<L extends string[] = string[]> = {
  originDir: string;
  localizedDir: string;
  locales: L;
  defaultLocale: L[number];
  prefixDefaultLocale: boolean;
  messagesWatchDir: string;
  getMessages: (locale: L[number]) => Promise<object> | object;
};

type RequiredUserConfigKeys = "locales" | "defaultLocale";

export type UserConfig = Pick<Config, RequiredUserConfigKeys> &
  Partial<Omit<Config, RequiredUserConfigKeys>>;

export type OriginRoute = {
  type: RouteType;
  path: string;
  localizedPaths: Record<string, string>;
};
