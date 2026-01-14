import { Command, Option } from "commander";
import { watch } from "fs";
import path from "path";
import { debounce } from "~/cli/utils/debounce";
import { DEFAULT_CONFIG } from "~/config";
import type { Config, ResolvedConfig } from "~/config/types";
import { mergeConfigs } from "~/config/utils";
import { isDirectory, isFile, rmDirectory } from "~/utils/fs-utils";
import { compile } from "~/utils/ts-utils";
import {
  configNotFoundError,
  keyExtractionDirsNotFoundError,
  messagesOriginDirNotFoundError,
  routesOriginDirNotFoundError,
} from "./errors";
import { extractKeysFromSourceFiles } from "./extractKeysFromSourceFiles";
import {
  generateLocalizedDir,
  generateMessagesFiles,
  generateOutDir,
  generateSchemaFiles,
} from "./generateDistFiles";
import { generateLocalizedRoutes } from "./generateLocalizedRoutes";
import { getOriginRoutes } from "./getOriginRoutes";
import { syncMessages } from "./syncMessages";

const DEBOUNCE_DELAY = 250;

export const generateCommand = new Command("generate")
  .summary("generate localized routes and compile messages")
  .description("generate localized routes and compile messages")
  .option(
    "-c, --config <path>",
    "custom path to a configuration file",
    "i18n.config.ts",
  )
  .option("-w, --watch", "enables watch mode")
  .option("--no-routes", "skip routes generation")
  .option("--no-messages", "skip messages compilation")
  .addOption(new Option("--plugin").hideHelp())
  .action(generateAction);

type Options = {
  config: string;
  watch: boolean;
  routes: boolean;
  messages: boolean;
  plugin: boolean;
};

async function generateAction(opts: Options) {
  if (!isFile(opts.config)) throw configNotFoundError(opts.config);
  const userConfig = await compile<{ default: Config }>(opts.config);
  const config = mergeConfigs(DEFAULT_CONFIG, userConfig.default);
  generateOutDir(config);
  if (!opts.routes) generateSchemaFiles(config);
  if (opts.routes) await generateRoutesSubAction(config, opts);
  if (opts.messages) await generateMessagesSubAction(config, opts);
}

async function generateRoutesSubAction(config: ResolvedConfig, opts: Options) {
  if (!isDirectory(config.routes.originDir)) {
    throw routesOriginDirNotFoundError(config);
  }
  if (!(opts.plugin && opts.watch)) {
    rmDirectory(config.routes.localizedDir);
    generateLocalizedDir(config.routes.localizedDir);
    await generateRoutes(config);
  }
  if (opts.watch) {
    watch(config.routes.originDir, { recursive: true }, (_, fileName) => {
      if (!fileName) return;
      debouncedGenerateRoutes(config, `/${fileName}`);
    });
  }
}

async function generateRoutes(
  config: ResolvedConfig,
  updatedOriginPath?: string,
) {
  try {
    const startTime = process.hrtime();
    const originRoutes = await getOriginRoutes({ config });
    generateLocalizedRoutes(config, originRoutes, updatedOriginPath);
    generateSchemaFiles(config, originRoutes);
    const endTime = process.hrtime(startTime);
    const timeDiffInMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    console.info(
      `\x1b[32mNextGlobeGen\x1b[37m - Localized routes (${timeDiffInMs}ms)`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
  }
}

const debouncedGenerateRoutes = debounce(generateRoutes, DEBOUNCE_DELAY);

async function generateMessagesSubAction(
  config: ResolvedConfig,
  opts: Options,
) {
  const messagesOriginDir = config.messages.originDir;
  const keyExtractionDirs = config.messages.keyExtractionDirs;
  if (!isDirectory(messagesOriginDir)) {
    throw messagesOriginDirNotFoundError(config);
  }
  if (keyExtractionDirs.some((dir) => !isDirectory(dir))) {
    throw keyExtractionDirsNotFoundError(config);
  }
  if (!(opts.plugin && opts.watch)) {
    await extractKeys(config);
    await generateMessages(config);
  }
  if (opts.watch) {
    watch(config.messages.originDir, { recursive: true }, () => {
      debouncedGenerateMessages(config);
    });
    config.messages.keyExtractionDirs.forEach((dir) => {
      watch(dir, { recursive: true }, (_, fileName) => {
        const filePath = fileName ? path.resolve(dir, fileName) : undefined;
        const messagesOriginDir = path.resolve(config.messages.originDir);
        const routesLocalizedDir = path.resolve(config.routes.localizedDir);
        if (filePath?.startsWith(messagesOriginDir)) return;
        if (filePath?.startsWith(routesLocalizedDir)) return;
        debouncedExtractKeys(config);
      });
    });
  }
}

async function generateMessages(config: ResolvedConfig) {
  try {
    const startTime = process.hrtime();
    await generateMessagesFiles(config);
    const endTime = process.hrtime(startTime);
    const timeDiffInMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    console.info(
      `\x1b[32mNextGlobeGen\x1b[37m - Compiled messages (${timeDiffInMs}ms)`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
  }
}

const debouncedGenerateMessages = debounce(generateMessages, DEBOUNCE_DELAY);

async function extractKeys(config: ResolvedConfig) {
  if (config.messages.keyExtractionDirs.length === 0) return;
  try {
    const startTime = process.hrtime();
    const extractedKeys = await extractKeysFromSourceFiles(config);
    await syncMessages(extractedKeys, config);
    const endTime = process.hrtime(startTime);
    const timeDiffInMs = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
    console.info(
      `\x1b[32mNextGlobeGen\x1b[37m - Extracted keys (${timeDiffInMs}ms)`,
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
  }
}

const debouncedExtractKeys = debounce(extractKeys, DEBOUNCE_DELAY);
