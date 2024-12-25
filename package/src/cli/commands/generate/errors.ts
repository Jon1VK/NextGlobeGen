import type { Config } from "~/cli/types";

export const configNotFoundError = (configPath: string) => {
  return new Error(
    `Cannot find file: ${configPath}\nHave you created the configuration file for next-globe-gen?`,
  );
};

export const originDirNotFoundError = (config: Config) => {
  return new Error(
    `Cannot find directory: ${config.originDir}\nAre your App Router routes defined in the specified directory?`,
  );
};
