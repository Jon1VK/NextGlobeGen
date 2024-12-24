#!/usr/bin/env node

import { Command } from "commander";
import { generateCommand } from "./commands/generate";

// Make sure commands gracefully respect termination signals (e.g. from Docker)
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

new Command().addCommand(generateCommand, { isDefault: true }).parse();
