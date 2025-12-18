<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/static/img/logo.dark.svg">
    <source media="(prefers-color-scheme: dark)" srcset="docs/static/img/logo.svg">
    <img alt="next-intl" src="docs/static/img/logo.svg" width="32">
  </picture>
  NextGlobeGen
</h1>

![NPM Version](https://img.shields.io/npm/v/next-globe-gen?style=for-the-badge&color=%23CC3534&logo=npm&logoColor=%23CC3534&labelColor=%23eee) ![Static Badge](https://img.shields.io/badge/App%20Router-%23000000?style=for-the-badge&logo=nextdotjs&logoColor=%23000000&label=Next.js&labelColor=%23eee) ![Static Badge](https://img.shields.io/badge/%20Type--safe-%233178C6?style=for-the-badge&logo=typescript&label=TypeScript&labelColor=%23eee)

NextGlobeGen makes it effortless to deliver your content in multiple languages with SEO-optimized, localized URLs.

NextGlobeGen is a powerful TypeScript-first internationalization (i18n) library for Next.js App Router applications. Unlike traditional i18n solutions, NextGlobeGen uses **generative programming** to automatically create localized routes and type-safe APIs, giving you a seamless development experience with full TypeScript support.

## Why NextGlobeGen?

### 🎯 Developer Experience First

- **Zero Runtime Overhead** - Routes are generated at build time, not runtime
- **Type-Safe Everything** - Full TypeScript inference for routes, locales, and messages
- **Universal API** - Same hooks and components work in both server and client components
- **Hot Reloading** - Changes to routes and messages regenerate automatically

### 🚀 Production Ready

- **SEO Optimized** - Automatic language alternate links and localized pathnames
- **Performance** - Code splitting support with filtered message delivery
- **Flexible Routing** - Support for prefix-based and domain-based locale routing
- **Next.js Native** - Built specifically for Next.js App Router with full feature support

### 💪 Powerful Features

- **ICU Message Format** - Rich text formatting with plurals, dates, numbers, and embedded React components
- **Localized Pathnames** - Translate URL segments for better SEO (e.g., `/en/about` → `/fi/tietoja`)
- **Smart Locale Detection** - Automatic user locale negotiation with cookie persistence
- **Dynamic Routes** - Full support for dynamic segments, catch-all routes, and parallel routes

## Quick Example

```tsx title="src/_app/page.tsx"
import { useTranslations, Link } from "next-globe-gen";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("description", { name: "NextGlobeGen" })}</p>
      <Link href="/dashboard">{t("dashboard.title")}</Link>
    </div>
  );
}
```

```json title="src/messages/en.json"
{
  "welcome": "Welcome!",
  "description": "{name} makes i18n effortless",
  "dashboard": {
    "title": "Dashboard"
  }
}
```

This automatically works for all configured locales with zero additional code!

## Key Features

### Generative Locale Routes

The plugin watches your `src/_app` directory and automatically generates localized versions of your routes in real-time:

```
src/_app/about/page.tsx  →  src/app/(i18n)/en/about/page.tsx
                         →  src/app/(i18n)/fi/tietoja/page.tsx
```

No manual route duplication. No runtime route matching. Just write your routes once, and NextGlobeGen handles the rest.

### Type-Safe API

Get full TypeScript support across your entire i18n implementation:

```tsx
// Routes are type-checked
<Link href="/blog/[slug]" params={{ slug: "hello" }}>
  Post
</Link>;

// Message keys are autocompleted
const t = useTranslations("dashboard");
t("title"); // ✓ Type-safe
t("typo"); // ✗ TypeScript error

// Locale switching with preserved params
const route = useRoute(); // Type: "/blog/[slug]"
const params = useParams<RouteParams<typeof route>>();
<Link href={route} params={params} locale="fi">
  Suomeksi
</Link>;
```

### ICU Message Format

Support for rich text formatting with plurals, select, dates, and React components:

```json
{
  "welcome": "Welcome {name}!",
  "posts": "{count, plural, =0 {No posts} one {One post} other {# posts}}",
  "updated": "Last updated: {date, date, long}",
  "richText": "Read <link>our guide</link> for more info"
}
```

```tsx
t("welcome", { name: "Jon" });
t("posts", { count: 5 });
t("updated", { date: new Date() });
t("richText", { link: (children) => <Link href="/guide">{children}</Link> });
```

### Flexible Routing Options

Choose the routing strategy that fits your needs:

**Prefix-Based Routing** (e.g., `example.com/en`, `example.com/fi`)

```ts
const config = {
  locales: ["en", "fi"],
  defaultLocale: "en",
  prefixDefaultLocale: true, // or false for root default locale
};
```

**Domain-Based Routing** (e.g., `example.com`, `example.fi`)

```ts
const config = {
  domains: [
    { domain: "example.com", locales: ["en"], defaultLocale: "en" },
    { domain: "example.fi", locales: ["fi"], defaultLocale: "fi" },
  ],
};
```

### Smart Middleware

The included proxy/middleware handles:

- **Locale Negotiation** - Detects user's preferred language from Accept-Language header
- **Cookie Persistence** - Remembers user's language choice
- **Alternate Links** - Adds SEO-friendly language alternate links to response headers
- **Domain Routing** - Redirects users to the correct domain based on locale

### Server & Client Components

The same API works everywhere:

```tsx
// "use client"; just add this directive for Client Components
import { useLocale, useTranslations } from "next-globe-gen";

export default function ServerComponent() {
  const locale = useLocale();
  const t = useTranslations();
  return <h1>{t("title")}</h1>;
}
```

Need async functions? Use the `get*` aliases:

```tsx
export async function generateMetadata() {
  const t = getTranslations();
  return { title: t("pageTitle") };
}
```

## Getting Started

Ready to internationalize your Next.js app? Follow our [Getting Started Guide](https://next-globe-gen.dev/docs/getting-started) to set up NextGlobeGen in minutes.

### Coming from next-intl?

If you're familiar with next-intl or considering alternatives, check out our [detailed comparison](https://next-globe-gen.dev/docs/comparison-with-next-intl) to understand the differences and see which approach fits your project best.
