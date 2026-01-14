import { transform, type Output, type ParserConfig } from "@swc/core";
import { readFileSync } from "fs";
import { readdirSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import type { MessageEntry, ResolvedConfig } from "~/config/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_PATH = path.resolve(__dirname, "key_extractor.wasm");

export async function extractKeysFromSourceFiles(config: ResolvedConfig) {
  const srcFiles = config.messages.keyExtractionDirs.flatMap((srcDir) =>
    collectSourceFiles(srcDir),
  );
  const keysMap = new Map<string, MessageEntry>();
  for (const filePath of srcFiles) {
    const keys = await extractKeysFromSourceFile(filePath);
    keys.forEach((k) => {
      const description = k.description ?? keysMap.get(k.key)?.description;
      keysMap.set(k.key, { ...k, description });
    });
  }
  return keysMap;
}

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function collectSourceFiles(directory: string) {
  const files: string[] = [];
  const entries = readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SOURCE_EXTENSIONS.includes(ext)) files.push(fullPath);
    }
  }
  return files;
}

const TRANSLATOR_PATTERN = /useTranslations|getTranslations|createTranslator/;

async function extractKeysFromSourceFile(filePath: string) {
  const source = readFileSync(filePath, "utf-8");
  if (!TRANSLATOR_PATTERN.test(source)) return [];
  const result: Output & { output?: string } = await transform(source, {
    jsc: {
      target: "esnext",
      parser: getParserConfig(filePath),
      experimental: {
        cacheRoot: "node_modules/.cache/swc",
        disableBuiltinTransformsForInternalTesting: true,
        disableAllLints: true,
        plugins: [[PLUGIN_PATH, {}]],
      },
    },
  });
  if (!result.output) return [];
  try {
    const parsed = JSON.parse(result.output);
    if (parsed.extractedKeys) {
      return JSON.parse(parsed.extractedKeys) as MessageEntry[];
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error parsing extracted keys from file ${filePath}: ${error.message}`,
      );
    }
  }
  return [];
}

function getParserConfig(filePath: string): ParserConfig {
  const ext = path.extname(filePath);
  switch (ext) {
    case ".tsx":
      return { syntax: "typescript", tsx: true, decorators: true };
    case ".ts":
      return { syntax: "typescript", tsx: false, decorators: true };
    case ".jsx":
      return { syntax: "ecmascript", jsx: true };
    default:
      return { syntax: "ecmascript", jsx: false };
  }
}
