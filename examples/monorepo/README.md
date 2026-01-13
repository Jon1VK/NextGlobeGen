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
import { fileURLToPath } from "url";
import { DEFAULT_CONFIG, mergeConfigs } from "next-globe-gen/config";

// __dirname replacement for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need an absolute path for originDir in shared package so that
// message loading of shared messages works correctly in applications
const sharedThis = { originDir: path.resolve(__dirname, "./src/messages") };

const defaultLoader = DEFAULT_CONFIG.messages.loadMessageEntries;

/**
 * Shared i18n configuration used in multiple applications.
 */
export const sharedI18nconfig = mergeConfigs(DEFAULT_CONFIG, {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    // Enable pruning of unused keys so that the shared messages will not be
    // written to the application message files if they are not used there.
    pruneUnusedKeys: true,
    async loadMessageEntries(locale) {
      // This binding is necessary to preserve correct `this` context
      const loadAppMessageEntries = defaultLoader.bind(this);
      // This binding is necessary so that shared loader uses its own originDir
      const loadSharedMessageEntries = defaultLoader.bind(sharedThis);
      const appMessageEntries = await loadAppMessageEntries(locale);
      const sharedMessageEntries = await loadSharedMessageEntries(locale);
      return [...appMessageEntries, ...sharedMessageEntries];
    },
  },
});

/**
 * Configuration for i18n in the frontend package.
 *
 * This configuration extends the shared i18n config to
 * use default message loading instead of the custom loader
 * defined in the shared config.
 */
const config = mergeConfigs(sharedI18nconfig, {
  messages: {
    loadMessageEntries: defaultLoader,
  },
});

export default config;
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
import { mergeConfigs } from "next-globe-gen/config";

/**
 * Configuration for i18n in the web app.
 */
const config = mergeConfigs(sharedI18nconfig, {
  // You can add or override any specific settings for the web app here
});

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

2. **Message Loading Architecture**: The shared config exports a custom `loadMessageEntries` function that:
   - Binds the default loader to `this` for app messages (preserves app's `originDir`)
   - Binds the default loader to `sharedThis` for shared messages (uses shared package's absolute path)
   - Merges both message sources into a single array

3. **App Configuration**: The web app imports and extends `sharedI18nconfig` using `mergeConfigs()`, automatically inheriting the custom message loader that combines app-specific and shared translations.

4. **App Build**: When the web app starts (dev or build), the NextGlobeGen plugin:
   - Reads the merged configuration
   - Executes the custom `loadMessageEntries` to load messages from both sources
   - Generates combined message types and route handlers

5. **Merged Messages**: The final generated messages include both app-specific and shared translations, giving you full type-safety across the entire monorepo.

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

- **Absolute paths in shared packages**: Use `path.resolve(__dirname, "./src/messages")` for `originDir` in shared packages to ensure correct path resolution when imported by apps. Note: `__dirname` needs to be defined in ES modules using `path.dirname(fileURLToPath(import.meta.url))`.

- **Custom message loader**: The shared config exports a custom `loadMessageEntries` that merges app and shared messages. The app config inherits this by extending `sharedI18nconfig` with `mergeConfigs()`.

- **Context binding**: When using the default loader for different origins, use `.bind()` to set the correct `this` context (for app messages) or bind to a custom object with the shared `originDir` (for shared messages).

- **`--no-routes` flag**: Shared packages should use this flag since they don't have Next.js routing.

- **`transpilePackages`**: Required in Next.js config to properly handle the shared TypeScript package.
