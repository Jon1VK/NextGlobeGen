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

We will create the following file structure on the following steps. The default directory and file locations can be altered by configuration, but let's use the defaults for now.

```treeview title="File structure"
.
├── i18n.config.ts 1)
├── next.config.ts 2)
└── src/
    ├── messages/ 3)
    │   ├── en.json
    │   └── fi.json
    ├── _app/ 4)
    |   ├── dashboard/
    │   │   ├── i18n.ts 5)
    │   │   └── page.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── LanguageSwitcher.tsx
    ├── app/
    └── middleware.ts 6)
```

### <span style={{ color: "#addb67"}}>1)</span> Configuration

Create an `i18n.config.ts` file to the application root directory and export your configuration as a default export. You have to at least configure what locales the application supports and what is the default locale.

```ts title="i18n.config.ts"
import type { Config } from "next-globe-gen";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
};

export default config;
```

### <span style={{ color: "#addb67"}}>2)</span> Plugin

Enable the NextGlobeGen plugin in the `next.config.ts` file.

```ts title="next.config.ts"
import type { NextConfig } from "next";
import { withNextGlobeGenPlugin } from "next-globe-gen/plugin";

const withNextGlobeGen = withNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  /* Next.js config options here */
};

export default withNextGlobeGen(nextConfig);
```

### <span style={{ color: "#addb67"}}>3)</span> Messages

Create message translations to the `src/messages` directory. There should be one `<locale>.json` file for each configured `locale`.

```json title="src/messages/en.json"
{
  "title": "Homepage",
  "description": "{name} package provides seamless internationalization experience for Next.js App Router devs."
}
```

```json title="src/messages/fi.json"
{
  "title": "Kotisivu",
  "description": "{name} paketti tarjoaa saumattoman kansainvälistämiskokemuksen Next.js App Router kehittäjille."
}
```

### <span style={{ color: "#addb67"}}>4)</span> Routing

Move your Next.js file-system based routing files into the `_app` directory from the `app` directory. The new routes should be created and modified in the `_app` directory.

:::info

You can use the APIs NextGlobeGen package provides to handle navigation and message translations.

:::

```tsx title="src/_app/layout.tsx"
import { useLocale } from "next-globe-gen";
import { ReactNode } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <body>
        <header>
          <LanguageSwitcher />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

```tsx title="src/_app/page.tsx"
import { useTranslations } from "next-globe-gen";

export default function Home() {
  const t = useTranslations();
  return (
    <section>
      <h1>{t("title")}</h1>
      <p>{t("description", { name: "NextGlobeGen" })}</p>
    </section>
  );
}
```

```tsx title="src/_app/LanguageSwitcher.tsx"
"use client";

import { useParams } from "next";
import { type RouteParams, Link, useRoute } from "next-globe-gen";

export default function LanguageSwitcher() {
  const route = useRoute();
  const params = useParams<RouteParams<typeof route>>();
  return (
    <nav>
      <ul>
        <li>
          <Link href={route} params={params} locale="en">
            In English
          </Link>
        </li>
        <li>
          <Link href={route} params={params} locale="fi">
            Suomeksi
          </Link>
        </li>
      </ul>
    </nav>
  );
}
```

### <span style={{ color: "#addb67"}}>5)</span> Localized pathnames (optional)

The pathnames in the url often need to be translated to improve SEO. In NextGlobeGen this is done for each route segment (directory) separately with special `i18n.ts` files. With this approach the route segment and it's localizations can be colocated.

The simplest way to add the localizations is to export an object with localized versions of the route segment for each locale as a default export.

```ts title="src/_app/dashboard/i18n.ts"
const segmentTranslations = {
  en: "dashboard", // If omitted, the directory name is used
  fi: "hallintapaneeli",
};

export default segmentTranslations;
```

With these translations, the Finnish page will be served from `/fi/hallintapaneeli` path.

### <span style={{ color: "#addb67"}}>6)</span> Middleware

Add middleware to the application by exporting NextGlobeGen `middleware` from `src/middleware.ts` file. The middleware handles locale negotiation and adds alternate links of the page to the response headers.

```tsx title="src/middleware.ts"
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

The NextGlobeGen plugin generates the required files for the app so that the routes can be served in the configured locales. It also re-generates the required files on the fly as long as the Next.js development server is running.

Following directories and files are generated by the NextGlobeGen plugin.

```treeview title="Generated directories and files"
src/
├── .next-globe-gen/
├── .next-globe-gen.d.ts
└── app/
    └── (i18n)/
        ├── en/
        │   ├── dashboard/
        │   │   └── page.tsx
        │   ├── layout.tsx
        │   └── page.tsx
        └── fi/
            ├── hallintapaneeli/
            │   └── page.tsx
            ├── layout.tsx
            └── page.tsx
```

:::warning

You should not modify the generated files yourself. The package re-generates these files when necessary. Create and modify your routes in the `_app` directory.

:::

:::tip

You can inspect what each generated file has eaten, if you would like to know how the package works underneath the hood.

:::
