import { Command, Option } from "commander";
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
  generateLocalizedDir,
  generateMessagesFile,
  generateOutDir,
  generateSchemaFile,
} from "./generateDistFiles";
import { generateLocalizedRoutes } from "./generateLocalizedRoutes";
import { getOriginRoutes } from "./getOriginRoutes";

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
  const userConfig = await compile<{ default: UserConfig }>(opts.config);
  const config = mergeConfigs(DEFAULT_CONFIG, userConfig.default);
  if (!isDirectory(config.routes.originDir)) {
    throw originDirNotFoundError(config);
  }
  if (opts.routes) await generateRoutesSubAction(config, opts);
  if (opts.messages) await generateMessagesSubAction(config, opts);
}

async function generateRoutesSubAction(config: Config, opts: Options) {
  if (!(opts.plugin && opts.watch)) {
    generateOutDir();
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

async function generateMessagesSubAction(config: Config, opts: Options) {
  if (!(opts.plugin && opts.watch)) {
    generateOutDir();
    await generateMessages(config);
  }
  if (opts.watch) {
    watch(config.messages.originDir, { recursive: true }, () => {
      debouncedGenerateMessages(config);
    });
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
