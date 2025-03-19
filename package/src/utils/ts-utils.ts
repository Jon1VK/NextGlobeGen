import { createHash } from "crypto";
import { rmSync } from "fs";
import path from "path";
import { build } from "tsup";
import { pathToFileURL } from "url";
import { isFile } from "~/utils/fs-utils";

const OUT_DIR = "./next-globe-gen";

export async function compile<T>(filePath: string) {
  const version = new Date().getTime();
  const outputFileName = createHash("md5")
    .update(`${filePath}-${version}`)
    .digest("hex");
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
  if (isFile(`${compiledPath}.cjs`)) {
    const contents = await import(`${compiledFileURL}.cjs`);
    rmSync(`${compiledPath}.cjs`);
    return contents.default as T;
  }
  const contents = await import(`${compiledFileURL}.js`);
  rmSync(`${compiledPath}.js`);
  return contents.default as T;
}
