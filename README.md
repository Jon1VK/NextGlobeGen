# NextGlobeGen

NextGlobeGen is a TypeScript package designed to streamline the process of adding internationalization (i18n) to your Next.js application. It is specifically tailored for projects using the Next.js App Router. By leveraging generative programming techniques, NextGlobeGen automates the creation of locale-based routes, enabling a seamless developer experience for the developers.

Whether you're building a blog, an e-commerce platform, or an enterprise application, NextGlobeGen is your go-to tool for making your Next.js app globally ready.

[Check out the Docs](https://jon1vk.github.io/NextGlobeGen/)

## Key Features

- **Generative Locale Routes**: Includes plugin that generates routes for each supported language.
- **Middleware Integration**: Provides pre-configured middleware for locale detection and redirection.
- **Translation Logic**: Supports ICU formatted interpolation patterns in the tranlations.
- **Developer-Friendly**: Includes a locale-aware API that works interchangeably in server and client components.

## How It Works

NextGlobeGen uses the power of generative programming to create the localized routes. It:

- Analyzes your app routing structure.
- Generates localized routes based on the analysis.
- Supports TypeScript by generating the required types.
- Provides API that is automacigally aware of the current locale.

## Getting started

Let's see how you can use the NextGlobeGen package to setup i18n for your Next.js app.

If you haven’t done so already, [create new a Next.js app](https://nextjs.org/docs/app/getting-started/installation) that uses the App Router.

### Installation

Install the package by running the following command.

```bash
npm install next-globe-gen
```

### Setup

Create the following file structure, which the package assumes is present by default. The default directory and file locations can be altered by configuration, but let's use the defaults for now.

```
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

#### 1) Configuration

Create an `i18n.config.ts`-file to the application root directory and export your configuration as a default export. You have to at least configure what locales the application supports and what is the default locale.

```ts
import type { Config } from "next-globe-gen";

const config: Config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
};

export default config;
```

#### 2) Plugin

Enable the NextGlobeGen plugin in the `next.config.ts`.

NextGlobeGen plugin handles generating the required files each time something is changed.

```ts
import type { NextConfig } from "next";
import { withNextGlobeGenPlugin } from "next-globe-gen/plugin";

const withNextGlobeGen = withNextGlobeGenPlugin();

const nextConfig: NextConfig = {
  /* Next.js config options here */
};

export default withNextGlobeGen(nextConfig);
```

#### 3) Messages

Create message translations to the `./src/messages`-directory. There should be one `<locale>.json`-file for each configured `locale`.

```json
{
  "hello": "Hello {name}"
}
```

```json
{
  "hello": "Hei {name}"
}
```

#### 4) Routing

Move your Next.js file-system based routing into the `_app`-directory from the `app`-directory.

You can use the NextGlobeGen package APIs to get the current locale and translations.

```tsx
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

```tsx
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

#### 5) Middleware

Add middleware to the application by exporting NextGlobeGen `middleware` from `middleware.ts` file. The middleware handles locale negotiation and redirects to locale-prefixed path if the path has no locale yet.

```tsx
export { middleware } from "next-globe-gen/middleware";

export const config = {
  // Matcher ignoring next internals and static assets
  matcher: ["/((?!_next|.*\\.).*)"],
};
```

## Running the App

After the setup has been done, start the Next.js development server and enjoy the seamless internationalization experience.

```bash
npm run dev
```

The NextGlobeGen plugin generates the required files for the app so that the routes can be served in the configured locales.

You can inspect what each generated file has eaten, if you would like to know how the package works underneath the hood.

For example the file structure in the `app`-directory, which Next.js uses for it's file-system based routing, updates to the following:

```
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
