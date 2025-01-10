import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useLocale, useTranslations } from "next-globe-gen";
import { Suspense, type ReactNode } from "react";
import Search from "./Search";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.form-component"),
    description: t("descriptions.form-component"),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("common");
  return (
    <>
      {children}
      <Suspense fallback={<pre>{t("loading")}</pre>}>
        <Search />
      </Suspense>
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/components#form">
          {t("docs")}
        </ExternalLink>
        <ExternalLink
          href={`https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/form-component/page.${locale}.mdx`}
        >
          {t("code")}
        </ExternalLink>
      </div>
    </>
  );
}
