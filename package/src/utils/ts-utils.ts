import { createHash } from "crypto";
import path from "path";
import { build } from "tsup";
import { pathToFileURL } from "url";
import { rmDirectory } from "~/utils/fs-utils";

const OUT_DIR = "./node_modules/next-globe-gen/dist/tmp";

export async function compile<T>(filePath: string) {
  const outputFileName = createHash("md5").update(filePath).digest("hex");
  await build({
    config: false,
    target: "node18",
    outDir: OUT_DIR,
    format: "esm",
    entryPoints: { [`${outputFileName}`]: filePath },
    silent: true,
  });
  // Hack to import always the latest i18n.ts files
  const version = new Date().getTime();
  const compiledPath = `${pathToFileURL(path.resolve(OUT_DIR, outputFileName))}.mjs?version=${version}`;
  return (await import(compiledPath)) as T;
}

export function removeCompiledFiles() {
  rmDirectory(OUT_DIR);
}
