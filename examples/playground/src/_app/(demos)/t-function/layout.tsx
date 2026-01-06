import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.t-function", {
      _description: "Page title for translator function demo",
    }),
    description: t("descriptions.t-function", {
      _description: "Page description for translator function demo",
    }),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  return (
    <>
      {children}
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/functions#t-function">
          {t("common.docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/t-function/TranslationsExample.tsx">
          {t("common.code")}
        </ExternalLink>
      </div>
    </>
  );
}
