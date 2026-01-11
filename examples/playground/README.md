# NextGlobeGen Playground

A comprehensive example application showcasing the various **NextGlobeGen** APIs and features. This playground serves as both a learning resource and a testing ground for different i18n patterns in Next.js.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the demos.

## Demos

The playground includes interactive examples for various NextGlobeGen APIs:

| Demo                   | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `/t-function`          | Using the `t()` function for translations in Server Components |
| `/use-translations`    | Using the `useTranslations()` hook in Client Components        |
| `/create-translator`   | Creating scoped translators with `createTranslator()`          |
| `/link-component`      | Navigation with the localized `<Link>` component               |
| `/form-component`      | Form submissions with the localized `<Form>` component         |
| `/use-router`          | Programmatic navigation with `useRouter()`                     |
| `/use-href`            | Generating localized URLs with `useHref()`                     |
| `/use-locale`          | Accessing current locale with `useLocale()`                    |
| `/use-route`           | Getting current route info with `useRoute()`                   |
| `/locale-param`        | Working with locale parameters                                 |
| `/localized-pathnames` | Configuring different URL paths per locale                     |
| `/dynamic`             | Dynamic routes with localized segments                         |
| `/revalidate-path`     | Revalidating localized paths                                   |
| `/markdown`            | MDX content with translations                                  |

## Configuration

The `i18n.config.ts` showcases various configuration options:

```ts
const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
  messages: {
    clientKeys: /client\./,        // Keys matching this pattern are available in Client Components
    pruneUnusedKeys: true,          // Remove unused translation keys
    whitelistedKeys: [...],         // Preserve dynamically-used keys from pruning
  },
};
```

## Testing

The playground includes both unit and e2e tests demonstrating how to test NextGlobeGen applications:

```bash
# Unit tests with Vitest
pnpm test:unit

# E2E tests with Playwright
pnpm test:e2e
```

## Project Structure

```
src/
├── _app/              # Source app directory (before route generation)
├── app/               # Generated localized routes
├── components/        # Shared components
├── messages/          # Translation files (en.yaml, fi.yaml, etc.)
└── proxy.ts           # NextGlobeGen proxy exports
```
