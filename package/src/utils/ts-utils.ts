import { createHash } from "crypto";
import { mkdtempSync, rmSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { isFile } from "~/utils/fs-utils";

const requireFrom = createRequire(import.meta.url);

export async function compile<T>(filePath: string): Promise<T> {
  const { build } = await import("tsdown");
  const tmpDir = mkdtempSync("next-globe-gen");
  const version = Math.random();
  const outputFileName = createHash("md5")
    .update(`${filePath}-${version}`)
    .digest("hex");
  await build({
    clean: false,
    config: false,
    outDir: tmpDir,
    format: "cjs",
    target: "node20",
    outputOptions: { codeSplitting: false },
    entry: { [`${outputFileName}`]: filePath },
    logLevel: "error",
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
    const absolutePath = path.resolve(filePath);
    const contents = requireFrom(absolutePath);
    return contents.default ?? (contents as T);
  } finally {
    rmSync(path.dirname(filePath), { recursive: true, force: true });
  }
}
