import type { ResolvedConfig } from "~/config/types";

export const configNotFoundError = (configPath: string) => {
  return new Error(
    `Cannot find file: ${configPath}\nHave you created the configuration file for next-globe-gen?`,
  );
};

export const routesOriginDirNotFoundError = (config: ResolvedConfig) => {
  return new Error(
    `Cannot find directory: ${config.routes.originDir}\nAre your App Router routes defined in the specified directory?`,
  );
};

export const keyExtractionDirsNotFoundError = (config: ResolvedConfig) => {
  return new Error(
    `Cannot find one or more key extraction directories: ${config.messages.keyExtractionDirs.join(
      ", ",
    )}\nAre your key extraction directories correctly configured?`,
  );
};

export const messagesOriginDirNotFoundError = (config: ResolvedConfig) => {
  return new Error(
    `Cannot find directory: ${config.messages.originDir}\nIs your messages origin directory correctly configured?`,
  );
};
