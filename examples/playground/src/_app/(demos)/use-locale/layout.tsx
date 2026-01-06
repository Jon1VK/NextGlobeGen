import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.use-locale", {
      _description: "Page title for useLocale hook demo",
    }),
    description: t("descriptions.use-locale", {
      _description: "Page description for useLocale hook demo",
    }),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  return (
    <>
      {children}
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/hooks#uselocale">
          {t("common.docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/layout.tsx">
          {t("common.code")}
        </ExternalLink>
      </div>
    </>
  );
}
