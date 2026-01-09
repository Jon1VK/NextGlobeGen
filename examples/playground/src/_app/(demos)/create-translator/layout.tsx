import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.create-translator", {
      _description: "Page title for createTranslator demo",
    }),
    description: t("descriptions.create-translator", {
      _description: "Page description for createTranslator demo",
    }),
  };
}

export default function CreateTranslatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations();
  return (
    <>
      {children}
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/functions#createtranslator">
          {t("common.docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/create-translator">
          {t("common.code")}
        </ExternalLink>
      </div>
    </>
  );
}
