import { Command } from "commander";
import { watch } from "fs";
import { debounce } from "~/cli/utils/debounce";
import {
  DEFAULT_CONFIG,
  mergeConfigs,
  type Config,
  type UserConfig,
} from "~/utils/config";
import debugLog from "~/utils/debug-print";
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
  debugLog(
    `Starting generate action with config: ${args.config}, watch: ${args.watch}`,
  );

  if (!isFile(args.config)) {
    debugLog(`Config file not found: ${args.config}`);
    throw configNotFoundError(args.config);
  }

  debugLog(`Compiling user config from: ${args.config}`);
  const userConfig = await compile<{ default: UserConfig }>(args.config);
  const config = mergeConfigs(DEFAULT_CONFIG, userConfig.default);

  if (!isDirectory(config.routes.originDir)) {
    debugLog(`Origin directory not found: ${config.routes.originDir}`);
    throw originDirNotFoundError(config);
  }

  debugLog(
    `Removing existing localized directory: ${config.routes.localizedDir}`,
  );
  rmDirectory(config.routes.localizedDir);

  debugLog(`Generating output directories`);
  generateOutDirs(config.routes.localizedDir);

  debugLog(`Generating messages`);
  await generateMessages(config);

  debugLog(`Generating routes`);
  await generateRoutes(config);

  if (args.watch) {
    debugLog(`Watch mode enabled - setting up file watchers`);
    watch(config.routes.originDir, { recursive: true }, (_, fileName) => {
      if (!fileName) return;
      debugLog(`Route file changed: ${fileName}`);
      debouncedGenerateRoutes(config, `/${fileName}`);
    });

    watch(config.messages.originDir, { recursive: true }, () => {
      debugLog(`Messages directory changed`);
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
