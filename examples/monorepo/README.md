# NextGlobeGen Monorepo Example

This example demonstrates how to set up **NextGlobeGen** in a monorepo architecture, where translations and components can be shared across multiple Next.js applications.

## Overview

```
monorepo/
├── apps/
│   └── web/                    # Next.js application
│       ├── i18n.config.ts      # App-level i18n config (imports shared config)
│       ├── next.config.ts      # Next.js config with NextGlobeGen plugin
│       ├── next-globe-gen/     # Generated files (messages + routes)
│       └── src/messages/       # App-specific translations
│
└── packages/
    └── frontend/               # Shared frontend package
        ├── i18n.config.ts      # Shared i18n config (messages only)
        ├── next-globe-gen/     # Generated files (messages only, no routes)
        └── src/messages/       # Shared translations
```

## Key Concepts

### 1. Shared Package Configuration (`packages/frontend`)

The shared package only generates message types (no routes) since it's not a Next.js application:

```ts
// packages/frontend/i18n.config.ts
import path from "path";
import { DEFAULT_CONFIG, type Config } from "next-globe-gen/config";

export const sharedI18nconfig: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    // Use absolute path for originDir in shared packages
    originDir: path.resolve(import.meta.dirname, "./src/messages"),
    loadMessageEntries: DEFAULT_CONFIG.messages.loadMessageEntries,
    pruneUnusedKeys: true,
  },
};

export default sharedI18nconfig;
```

Generate messages on build with `--no-routes` flag:

```json
{
  "scripts": {
    "postinstall": "pnpm build",
    "build": "next-globe-gen generate --no-routes"
  }
}
```

Export the config so apps can import it:

```json
{
  "exports": {
    "./i18n.config": "./i18n.config.ts"
  }
}
```

### 2. Application Configuration (`apps/web`)

The app extends the shared config to include both app-specific and shared translations:

```ts
// apps/web/i18n.config.ts
import { sharedI18nconfig } from "@repo/frontend/i18n.config";
import { DEFAULT_CONFIG, type Config } from "next-globe-gen/config";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    originDir: "./src/messages",
    pruneUnusedKeys: true,
    async loadMessageEntries(locale) {
      // Load app-specific messages
      const loadAppMessageEntries =
        DEFAULT_CONFIG.messages.loadMessageEntries.bind(this);
      const appMessageEntries = await loadAppMessageEntries(locale);

      // Load shared messages from the frontend package
      const sharedMessageEntries =
        (await sharedI18nconfig.messages?.loadMessageEntries?.(locale)) ?? [];

      // Merge both message sources
      return [...appMessageEntries, ...sharedMessageEntries];
    },
  },
};

export default config;
```

### 3. Next.js Plugin Setup

Apply the NextGlobeGen plugin in the Next.js config and transpile the shared package:

```ts
// apps/web/next.config.ts
import type { NextConfig } from "next";
import createNextGlobeGenPlugin from "next-globe-gen/plugin";

const withNextGlobeGen = createNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/frontend"],
};

export default withNextGlobeGen(nextConfig);
```

## How It Works

1. **Shared Package Build**: When `@repo/frontend` is installed, it runs `next-globe-gen generate --no-routes` to generate message types from `src/messages/`. This creates type definitions in `next-globe-gen/` folder.

2. **App Build**: When the web app starts (dev or build), the NextGlobeGen plugin:
   - Reads the app's `i18n.config.ts`
   - Loads app messages from `apps/web/src/messages/`
   - Loads shared messages via the custom `loadMessageEntries` function
   - Generates combined message types and route handlers

3. **Merged Messages**: The final generated messages include both app-specific and shared translations, giving you full type-safety across the entire monorepo.

## Message Organization

| Package          | Message Location | Scope                  |
| ---------------- | ---------------- | ---------------------- |
| `@repo/frontend` | `src/messages/`  | Shared across all apps |
| `apps/web`       | `src/messages/`  | App-specific only      |

Example message structure:

```
packages/frontend/src/messages/
├── en.yaml    # shared.welcome, shared.featureCard, etc.
└── fi.yaml

apps/web/src/messages/
├── en.yaml    # home.features, home.actions, etc.
└── fi.json
```

## Important Notes

- **Absolute paths in shared packages**: Use `path.resolve(import.meta.dirname, "./src/messages")` for `originDir` in shared packages to ensure correct path resolution when imported by apps.

- **`--no-routes` flag**: Shared packages should use this flag since they don't have Next.js routing.

- **`transpilePackages`**: Required in Next.js config to properly handle the shared TypeScript package.
