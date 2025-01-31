import { Command } from "commander";
import { watch } from "fs";
import { debounce } from "~/cli/utils/debounce";
import {
  DEFAULT_CONFIG,
  mergeConfigs,
  type Config,
  type UserConfig,
} from "~/utils/config";
import { isDirectory, isFile, rmDirectory } from "~/utils/fs-utils";
import { compile } from "~/utils/ts-utils";
import { configNotFoundError, originDirNotFoundError } from "./errors";
import {
  generateMessagesFile,
  generateOutDirs,
  generateSchemaFile,
} from "./generateDistFiles";
import { generateLocalizedRoutes } from "./generateLocalizedRoutes";
import { getOriginRoutes } from "./getOriginRoutes";

export const generateCommand = new Command("generate")
  .summary("generate localized routes")
  .description("generate localizes routes")
  .option(
    "-c, --config <path>",
    "custom path to a configuration file",
    "i18n.config.ts",
  )
  .option("-w, --watch", "enables watch mode")
  .action(generateAction);

async function generateAction(args: { config: string; watch: boolean }) {
  if (!isFile(args.config)) throw configNotFoundError(args.config);
  const userConfig = await compile<{ default: UserConfig }>(args.config);
  const config = mergeConfigs(DEFAULT_CONFIG, userConfig.default);
  if (!isDirectory(config.routes.originDir)) {
    throw originDirNotFoundError(config);
  }
  rmDirectory(config.routes.localizedDir);
  generateOutDirs(config.routes.localizedDir);
  await generateMessages(config);
  await generateRoutes(config);
  if (args.watch) {
    watch(config.routes.originDir, { recursive: true }, (_, fileName) => {
      if (!fileName) return;
      debouncedGenerateRoutes(config, `/${fileName}`);
    });
    watch(config.messages.originDir, { recursive: true }, () => {
      debouncedGenerateMessages(config);
    });
  }
}

async function generateRoutes(config: Config, updatedOriginPath?: string) {
  try {
    const startTime = process.hrtime();
    const originRoutes = await getOriginRoutes({ config });
    generateLocalizedRoutes(config, originRoutes, updatedOriginPath);
    generateSchemaFile(config, originRoutes);
    const endTime = process.hrtime(startTime);
    const timeDiffInMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    console.info(
      `\x1b[32mNextGlobeGen\x1b[37m - Localized ${originRoutes.length} files in ${timeDiffInMs}ms`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
  }
}

const debouncedGenerateRoutes = debounce(generateRoutes, 250);

async function generateMessages(config: Config) {
  try {
    const startTime = process.hrtime();
    generateMessagesFile(config);
    const endTime = process.hrtime(startTime);
    const timeDiffInMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    console.info(
      `\x1b[32mNextGlobeGen\x1b[37m - Generated messages in ${timeDiffInMs}ms`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
  }
}

const debouncedGenerateMessages = debounce(generateMessages, 250);
