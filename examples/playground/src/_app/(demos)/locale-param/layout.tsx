import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.locale-param"),
    description: t("descriptions.locale-param"),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  return (
    <>
      <h1>{t("demos.client.titles.locale-param")}</h1>
      {children}
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/routing#locale-param">
          {t("common.docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/sitemap.ts">
          {t("common.code")}
        </ExternalLink>
      </div>
    </>
  );
}
