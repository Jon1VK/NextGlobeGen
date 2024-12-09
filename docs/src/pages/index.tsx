import CodeBlock from "@theme/CodeBlock";
import Layout from "@theme/Layout";
import type { CSSProperties } from "react";

export default function Home() {
  return (
    <Layout>
      <main className="relative isolate bg-gradient-to-b from-sky-500/90 dark:to-sky-950 overflow-hidden">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 w-[200%] skew-x-[-30deg] bg-white dark:bg-gray-900 shadow-xl shadow-sky-600/50 -mr-10 md:-mr-20 lg:-mr-36"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl space-y-24 py-24 px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-8">
          <Content />
          <CodeExample />
        </div>
      </main>
    </Layout>
  );
}

const Content = () => {
  return (
    <div className="max-w-lg mx-auto text-balance">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-200 sm:text-6xl">
        NextGlobeGen
      </h1>
      <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
        Localize your Next.js App Router routes and content to serve your
        application for all the users around the world.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <a
          href="./docs/intro"
          className="rounded-md bg-sky-700/80 hover:bg-sky-700/90 px-3.5 py-2.5 font-semibold text-white shadow-sm hover:text-white"
        >
          Get Started
        </a>
        <a
          href="https://github.com/Jon1VK/NextGlobeGen"
          className="rounded-md font-semibold text-gray-900 dark:text-gray-200 px-3.5 py-2.5 whitespace-nowrap"
        >
          View on GitHub <span aria-hidden="true">→</span>
        </a>
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
        <Link href="/about">{t("about.title")}</Link>
        {props.children}
      </body>
    </html>
  );
}`.trim();

function CodeExample() {
  return (
    <div className="-mx-8 pl-6 pt-8 md:pt-12 md:pl-10 md:mx-auto md:max-w-3xl md:rounded-3xl bg-gradient-to-b from-sky-500/90 to-white dark:to-sky-950 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
      <div
        className="absolute inset-0 left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-gradient-to-t from-sky-500/90 to-white dark:to-sky-950 md:ml-20 lg:ml-36"
        aria-hidden="true"
      />
      <div className="rounded-tl-xl overflow-hidden bg-gray-900/50 flex text-sm/6 font-medium">
        <div className="border-solid border-0 border-r border-gray-800 bg-sky-800 px-4 py-2 text-white">
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
