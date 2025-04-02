import { createHash } from "crypto";
import { existsSync, rmSync } from "fs";
import path from "path";
import { build } from "tsup";
import { pathToFileURL } from "url";
import { isFile, makeDirectory } from "~/utils/fs-utils";
import debugLog from "./debug-print";

const OUT_DIR = "./next-globe-gen";

export async function compile<T>(filePath: string) {
  debugLog(`Compiling file: ${filePath}`);

  const version = new Date().getTime();
  const outputFileName = createHash("md5")
    .update(`${filePath}-${version}`)
    .digest("hex");

  debugLog(`Generated output filename: ${outputFileName}`);

  // Ensure the output directory exists
  debugLog(`Ensuring output directory exists: ${OUT_DIR}`);
  makeDirectory(OUT_DIR);

  debugLog(`Building with tsup...`);
  await build({
    config: false,
    outDir: OUT_DIR,
    format: "cjs",
    bundle: true,
    splitting: false,
    target: "node18",
    entryPoints: { [`${outputFileName}`]: filePath },
    silent: true,
  });

  const compiledPath = path.resolve(OUT_DIR, outputFileName);
  const compiledFileURL = pathToFileURL(compiledPath);
  debugLog(`Compiled path: ${compiledPath}`);

  if (isFile(`${compiledPath}.cjs`)) {
    debugLog(`Found .cjs file, importing...`);
    const contents = await import(`${compiledFileURL}.cjs`);
    debugLog(`Cleaning up .cjs file`);
    if (existsSync(`${compiledPath}.cjs`)) {
      rmSync(`${compiledPath}.cjs`);
    } else {
      debugLog(`File already deleted: ${compiledPath}.cjs`);
    }
    return contents.default as T;
  }

  debugLog(`Found .js file, importing...`);
  const contents = await import(`${compiledFileURL}.js`);
  debugLog(`Cleaning up .js file`);
  if (existsSync(`${compiledPath}.js`)) {
    rmSync(`${compiledPath}.js`);
  } else {
    debugLog(`File already deleted: ${compiledPath}.js`);
  }
  return contents.default as T;
}
