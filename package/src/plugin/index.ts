import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_TEST,
} from "next/constants";
import { spawn, spawnSync } from "node:child_process";
import { addAliases } from "./addAliases";

type Phase =
  | typeof PHASE_EXPORT
  | typeof PHASE_PRODUCTION_BUILD
  | typeof PHASE_PRODUCTION_SERVER
  | typeof PHASE_DEVELOPMENT_SERVER
  | typeof PHASE_TEST;

export function withNextGlobeGenPlugin(configPath = "./i18n.config.ts") {
  return function withNextGlobeGen(config: NextConfig) {
    return (phase: Phase) => {
      useGenerator(configPath, phase);
      addAliases(config, {
        "next-globe-gen/schema": "./.next-globe-gen/schema.ts",
        "next-globe-gen/messages": "./.next-globe-gen/messages.ts",
      });
      return config;
    };
  };
}

function useGenerator(configPath: string, phase: Phase) {
  if (process.env.NEXT_PRIVATE_WORKER) return;
  if (process.env.NEXT_DEPLOYMENT_ID !== undefined) return;
  try {
    if (phase === "phase-development-server") {
      spawn(`npx next-globe-gen --watch --config ${configPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true,
        detached: false,
      });
    } else if (phase !== "phase-production-server") {
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
