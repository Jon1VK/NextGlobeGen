import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import type { CSSProperties } from "react";

export default function Home() {
  return (
    <Layout>
      <main className="relative isolate flex-1 overflow-hidden bg-gradient-to-b from-sky-500/90 dark:to-sky-950">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-sky-600/50 md:-mr-20 lg:-mr-36 dark:bg-gray-900"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl space-y-24 px-8 py-24 xl:grid xl:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] xl:items-center xl:gap-x-8">
          <Content />
          <CodeExample />
        </div>
      </main>
    </Layout>
  );
}

const Content = () => {
  return (
    <div className="mx-auto max-w-lg text-balance">
      <Heading
        as="h1"
        className="text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        NextGlobeGen
      </Heading>
      <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
        Localize your Next.js App Router routes and content to serve your
        application for all the users around the world.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-6 font-semibold">
        <Link
          href="./docs/getting-started"
          className="rounded-xl bg-sky-700/70 px-6 py-3 text-white hover:bg-sky-700/90 hover:text-white"
        >
          Get Started <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="https://github.com/Jon1VK/NextGlobeGen"
          className="whitespace-nowrap rounded-xl bg-sky-300/10 px-6 py-3 text-gray-900 hover:bg-sky-300/20 hover:text-gray-900 dark:text-white dark:hover:text-white"
        >
          View on GitHub <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
};

const exampleCode = `
// Package APIs work in both server and client components
import { useLocale, useTranslations, Link } from "next-globe-gen";

function Layout(props) {
  const locale = useLocale();
  const t = useTranslations();
  return (
    <html lang={locale}>
      <body>
        <h1>{t("home.title")}</h1>
        <Link href="/dashboard">{t("dashboard.title")}</Link>
        {props.children}
      </body>
    </html>
  );
}`.trim();

function CodeExample() {
  return (
    <div className="-mx-8 bg-gradient-to-b from-sky-500/90 to-white pl-6 pt-8 [clip-path:inset(0)] md:mx-auto md:max-w-3xl md:pl-10 md:pt-12 md:[clip-path:inset(0_round_theme(borderRadius.3xl))] xl:mx-0 xl:max-w-none dark:to-sky-950">
      <div
        className="absolute inset-0 left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-gradient-to-t from-sky-500/90 to-white md:ml-20 lg:ml-36 dark:to-sky-950"
        aria-hidden="true"
      />
      <div className="flex overflow-hidden rounded-tl-xl bg-gray-900/50 text-sm/6 font-medium">
        <div className="border-0 border-r border-solid border-gray-800 bg-sky-800 px-4 py-2 text-white">
          layout.jsx
        </div>
        {/* <div className="border-solid border-0 border-r border-gray-800 px-4 py-2 text-gray-400">
          page.jsx
        </div> */}
      </div>
      <div
        style={
          {
            "--ifm-pre-border-radius": 0,
            "--ifm-leading": 0,
          } as CSSProperties
        }
      >
        <CodeBlock language="tsx" showLineNumbers>
          {exampleCode}
        </CodeBlock>
      </div>
    </div>
  );
}
