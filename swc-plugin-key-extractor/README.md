# swc-plugin-key-extractor

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
t("greeting"); // Extracts: "common.greeting"

// createTranslator - namespace is second argument
const t2 = createTranslator("en", "errors");
t2("notFound"); // Extracts: "errors.notFound"

// Without namespace
const t3 = useTranslations();
t3("hello"); // Extracts: "hello"
```

## Output Format

Extracted keys are output as a JSON array via SWC's `experimental_emit`:

```json
["common.greeting", "errors.notFound", "hello"]
```

## Building

Requires the Rust nightly toolchain (see `rust-toolchain.toml`).

```bash
# Build for wasm32-wasip1 target
cargo build --release --target wasm32-wasip1

# Run tests
cargo test
```

## Limitations

- **Dynamic keys are skipped**: Keys using variables (e.g., `t(keyVar)`) cannot be statically extracted
- **Template literals with expressions**: Template literals containing `${...}` are skipped
