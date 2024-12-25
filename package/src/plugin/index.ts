import type { NextConfig } from "next";
import { spawn, spawnSync } from "node:child_process";
import { addAliases } from "./addAliases";

export function withNextGlobeGenPlugin(configPath = "./i18n.config.ts") {
  if (!process.env.NEXT_PRIVATE_WORKER) useGenerator(configPath);
  return function withNextGlobeGen(config: NextConfig) {
    addAliases(config, {
      "next-globe-gen/schema": "./.next-globe-gen/schema.ts",
      "next-globe-gen/messages": "./.next-globe-gen/messages.ts",
    });
    return config;
  };
}

function useGenerator(configPath: string) {
  try {
    if (process.env.NODE_ENV === "development") {
      spawn(`npx next-globe-gen --watch --config ${configPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
        detached: false,
      });
    } else {
      spawnSync(`npx next-globe-gen --config ${configPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
      });
    }
  } catch (_e) {
    console.error("Failed to spawn the NextGlobeGen compiler process");
  }
}
