import { createHash } from "crypto";
import { mkdtempSync, rmSync } from "fs";
import path from "path";
import { build } from "tsup";
import { pathToFileURL } from "url";
import { isFile } from "~/utils/fs-utils";

export async function compile<T>(filePath: string) {
  const tmpDir = mkdtempSync("next-globe-gen");
  const version = Math.random();
  const outputFileName = createHash("md5")
    .update(`${filePath}-${version}`)
    .digest("hex");
  await build({
    config: false,
    outDir: tmpDir,
    format: "cjs",
    bundle: true,
    splitting: false,
    target: "node18",
    entryPoints: { [`${outputFileName}`]: filePath },
    silent: true,
    shims: true,
  });
  const compiledPath = path.resolve(tmpDir, outputFileName);
  if (isFile(`${compiledPath}.cjs`)) {
    return importContents<T>(`${compiledPath}.cjs`);
  }
  return importContents<T>(`${compiledPath}.js`);
}

async function importContents<T>(filePath: string): Promise<T> {
  try {
    const fileURL = pathToFileURL(filePath);
    const contents = await import(fileURL.href);
    return contents.default as T;
  } finally {
    rmSync(path.dirname(filePath), { recursive: true, force: true });
  }
}
