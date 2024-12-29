import CodeBlock from "@theme/CodeBlock";
import type { CSSProperties } from "react";

const exampleCode = `
// Package APIs work in both server and client components
import { useLocale, useTranslations, Link } from "next-globe-gen";

function Layout(props: { children: React.ReactNode }) {
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

export default function CodeExample() {
  return (
    <div className="-mx-8 bg-gradient-to-b from-sky-500/90 to-white pl-6 pt-8 [clip-path:inset(0)] md:mx-auto md:max-w-3xl md:pl-10 md:pt-12 md:[clip-path:inset(0_round_theme(borderRadius.3xl))] xl:mx-0 xl:max-w-none dark:to-sky-950">
      <div
        className="absolute inset-0 left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-gradient-to-t from-sky-500/90 to-white md:ml-20 lg:ml-36 dark:to-sky-950"
        aria-hidden="true"
      />
      <div className="flex overflow-hidden rounded-tl-xl bg-gray-900/50 text-sm/6 font-medium">
        <div className="border-0 border-r border-solid border-gray-800 bg-sky-800 px-4 py-2 text-white">
          layout.tsx
        </div>
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
