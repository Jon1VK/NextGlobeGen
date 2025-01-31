import { createHash } from "crypto";
import { rmSync } from "fs";
import path from "path";
import { build } from "tsup";
import { pathToFileURL } from "url";
import { isFile } from "~/utils/fs-utils";

const OUT_DIR = "./.next-globe-gen";

export async function compile<T>(filePath: string) {
  const version = new Date().getTime();
  const outputFileName = createHash("md5")
    .update(`${filePath}-${version}`)
    .digest("hex");
  await build({
    config: false,
    target: "node18",
    outDir: OUT_DIR,
    format: "esm",
    entryPoints: { [`${outputFileName}`]: filePath },
    silent: true,
  });
  const compiledPath = path.resolve(OUT_DIR, outputFileName);
  const compiledFileURL = pathToFileURL(compiledPath);
  if (isFile(`${compiledPath}.mjs`)) {
    const contents = await import(`${compiledFileURL}.mjs`);
    rmSync(`${compiledPath}.mjs`);
    return contents as T;
  }
  const contents = await import(`${compiledFileURL}.js`);
  rmSync(`${compiledPath}.js`);
  return contents as T;
}
