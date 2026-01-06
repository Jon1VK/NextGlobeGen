import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.markdown", {
      _description: "Page title for markdown pages demo",
    }),
    description: t("descriptions.markdown", {
      _description: "Page description for markdown pages demo",
    }),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  return (
    <>
      {children}
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/routing#markdown-pages">
          {t("docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/markdown">
          {t("code")}
        </ExternalLink>
      </div>
    </>
  );
}
