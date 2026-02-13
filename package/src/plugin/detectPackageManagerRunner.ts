import { existsSync } from "node:fs";
import path from "node:path";

type PackageManagerRunner = "npx" | "pnpm exec" | "yarn" | "bunx";

export function detectPackageManagerRunner(): PackageManagerRunner {
  // 1. Check environment variable
  const packageManagerFromEnv = detectPackageManagerRunnerFromEnv();
  if (packageManagerFromEnv) return packageManagerFromEnv;

  // 2. Check lock files
  const packageManagerFromLockFile = detectPackageManagerRunnerFromLockFiles();
  if (packageManagerFromLockFile) return packageManagerFromLockFile;

  // 3. Fallback to npx
  return "npx";
}

function detectPackageManagerRunnerFromEnv(): PackageManagerRunner | undefined {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return;
  if (userAgent.startsWith("pnpm")) return "pnpm exec";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bunx";
  if (userAgent.startsWith("npm")) return "npx";
}

function detectPackageManagerRunnerFromLockFiles():
  | PackageManagerRunner
  | undefined {
  const cwd = process.cwd();
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm exec";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "bun.lockb"))) return "bunx";
  if (existsSync(path.join(cwd, "package-lock.json"))) return "npx";
}
