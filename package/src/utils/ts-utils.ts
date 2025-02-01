import { createHash } from "crypto";
import { rmSync } from "fs";
import path from "path";
import { build, type Options } from "tsup";
import { pathToFileURL } from "url";
import { isFile } from "~/utils/fs-utils";

const OUT_DIR = "./.next-globe-gen";

type Plugin = Options["plugins"] extends (infer T)[] | undefined ? T : never;

const jsImportsPlugin: Plugin = {
  name: "js-imports-plugin",
  renderChunk(_, chunk) {
    const code = chunk.code.replace(/from "(.*)"/g, 'from "$1.js"');
    return { code };
  },
};

export async function compile<T>(filePath: string) {
  const version = new Date().getTime();
  const outputFileName = createHash("md5")
    .update(`${filePath}-${version}`)
    .digest("hex");
  await build({
    config: false,
    outDir: OUT_DIR,
    format: "esm",
    bundle: true,
    splitting: false,
    target: "node18",
    plugins: [jsImportsPlugin],
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
