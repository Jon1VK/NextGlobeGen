---
sidebar_position: 2
---

# Getting started

Let's see how you can use the NextGlobeGen package to setup i18n for your Next.js app.

If you haven’t done so already, [create new a Next.js app](https://nextjs.org/docs/app/getting-started/installation) that uses the App Router.

## Installation

Install the package by running the following command.

```bash title="Installation command"
npm install next-globe-gen
```

## Setup

Create the following file structure, which the package assumes is present by default. The default directory and file locations can be altered by configuration, but let's use the defaults for now.

```treeview title="File structure"
.
├── i18n.config.ts 1)
├── next.config.ts 2)
└── src/
    ├── messages/ 3)
    │   ├── en.json
    │   └── fi.json
    ├── _app/ 4)
    │   ├── layout.tsx
    │   └── page.tsx
    ├── app/
    └── middleware.ts 5)
```

### <span style={{ color: "#addb67"}}>1)</span> Configuration

Create an `i18n.config.ts`-file to the application root directory and export your configuration as a default export. You have to at least configure what locales the application supports and what is the default locale.

```ts title="./i18n.config.ts"
import type { Config } from "next-globe-gen";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
};

export default config;
```

### <span style={{ color: "#addb67"}}>2)</span> Plugin

Enable the NextGlobeGen plugin in the `next.config.ts`.

:::info

NextGlobeGen plugin handles generating the required files each time something is changed.

:::

```ts title="./next.config.ts"
import type { NextConfig } from "next";
import { withNextGlobeGenPlugin } from "next-globe-gen/plugin";

const withNextGlobeGen = withNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  /* Next.js config options here */
};

export default withNextGlobeGen(nextConfig);
```

### <span style={{ color: "#addb67"}}>3)</span> Messages

Create message translations to the `./src/messages`-directory. There should be one `<locale>.json`-file for each configured `locale`.

```json title="./src/messages/en.json"
{
  "hello": "Hello {name}"
}
```

```json title="./src/messages/fi.json"
{
  "hello": "Hei {name}"
}
```

### <span style={{ color: "#addb67"}}>4)</span> Routing

Move your Next.js file-system based routing into the `_app`-directory from the `app`-directory.

:::info

You can use the NextGlobeGen package APIs to get the current locale and translations.

:::

```tsx title="./src/_app/layout.tsx"
import { useLocale } from "next-globe-gen";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
```

```tsx title="./src/_app/page.tsx"
import { useTranslations } from "next-globe-gen";

export default function Home() {
  const t = useTranslations();
  return (
    <main>
      <h1>{t("hello", { name: "NextGlobeGen" })}</h1>
    </main>
  );
}
```

### <span style={{ color: "#addb67"}}>5)</span> Middleware

Add middleware to the application by exporting NextGlobeGen `middleware` from `middleware.ts` file. The middleware handles locale negotiation and redirects to locale-prefixed path if the path has no locale yet.

```tsx title="./src/middleware.ts"
export { middleware } from "next-globe-gen/middleware";

export const config = {
  // Matcher ignoring next internals and static assets
  matcher: ["/((?!_next|.*\\.).*)"],
};
```

## Running the App

After the setup has been done, start the Next.js development server and enjoy the seamless internationalization experience.

```bash title="Run command"
npm run dev
```

The NextGlobeGen plugin generates the required files for the app so that the routes can be served in the configured locales.

:::tip

You can inspect what each generated file has eaten, if you would like to know how the package works underneath the hood.

:::

For example the file structure in the `app`-directory, which Next.js uses for it's file-system based routing, updates to the following:

```treeview title="Final app structure"
src/
└── app/
    └── (i18n)/
        ├── en/
        │   ├── layout.tsx
        │   └── page.tsx
        └── fi/
            ├── layout.tsx
            └── page.tsx
```
