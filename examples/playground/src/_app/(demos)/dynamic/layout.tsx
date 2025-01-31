import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.dynamic"),
    description: t("descriptions.dynamic"),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  return (
    <>
      {children}
      <div className="mt-4 flex gap-2">
        <ExternalLink
          href={`https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/dynamic`}
        >
          {t("code")}
        </ExternalLink>
      </div>
    </>
  );
}
