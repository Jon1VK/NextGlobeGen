# Key Extractor SWC Plugin

SWC plugin for extracting translation keys from next-globe-gen source code.

## Overview

This plugin scans source files for translator function calls and extracts all translation key usages, outputting them as JSON metadata.

## Supported Functions

The plugin detects and extracts keys from:

| Function                                | Namespace Argument |
| --------------------------------------- | ------------------ |
| `useTranslations('namespace')`          | 1st argument       |
| `getTranslations('namespace')`          | 1st argument       |
| `createTranslator(locale, 'namespace')` | 2nd argument       |

## Examples

```tsx
import { useTranslations, createTranslator } from "next-globe-gen";

// useTranslations - namespace is first argument
const t = useTranslations("common");
t("greeting"); // Extracts: { key: "common.greeting" }

// createTranslator - namespace is second argument
const t2 = createTranslator("en", "errors");
t2("notFound"); // Extracts: { key: "errors.notFound" }

// Without namespace
const t3 = useTranslations();
t3("hello"); // Extracts: { key: "hello" }

// With description (for YAML export)
t("welcome", { _description: "Shown on homepage" });
// Extracts: { key: "common.welcome", description: "Shown on homepage" }
```

## Output Format

Extracted keys are output as a JSON array of objects via SWC's `experimental_emit`:

```json
[
  { "key": "common.greeting" },
  { "key": "errors.notFound" },
  { "key": "hello" },
  { "key": "common.welcome", "description": "Shown on homepage" }
]
```

Each object contains:

- `key` - The full translation key (namespace + key)
- `description` (optional) - Description of the message usage intent from `_description` option

## Building

Requires the Rust nightly toolchain (see `rust-toolchain.toml`).

```bash
# Build for wasm32-wasip1 target
pnpm build

# Run tests
pnpm test

# Check code (build + format)
pnpm check
```

## Limitations

- **Dynamic values are skipped**: Values using variables (e.g., `t(keyVar)`) cannot be statically extracted
- **Template literals with expressions**: Template literals containing `${...}` are skipped
