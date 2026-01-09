import { loadMessageEntries } from "./loadMessageEntries";
import type { Config } from "./types";
import { writeMessageEntries } from "./writeMessageEntries";

export const FILE_EXTENSIONS = [".json", ".yml", ".yaml"];

/**
 * The default configuration for NextGlobeGen.
 */
export const DEFAULT_CONFIG: Config = {
  locales: [],
  defaultLocale: "",
  prefixDefaultLocale: true,
  outDir: "./next-globe-gen",
  routes: {
    originDir: "./src/_app",
    localizedDir: "./src/app/(i18n)",
  },
  messages: {
    originDir: "./src/messages",
    loadMessageEntries,
    writeMessageEntries,
    keyExtractionDirs: ["./src"],
  },
};
