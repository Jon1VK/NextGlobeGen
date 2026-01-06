import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useLocale, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.form-component", {
      _description: "Page title for Form component demo",
    }),
    description: t("descriptions.form-component", {
      _description: "Page description for Form component demo",
    }),
  };
}

export default function MarkdownLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("common");
  return (
    <>
      {children}
      <div className="mt-4 flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/components#form">
          {t("docs", { _description: "Link text for documentation" })}
        </ExternalLink>
        <ExternalLink
          href={`https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/form-component/page.${locale}.mdx`}
        >
          {t("code", { _description: "Link text for source code" })}
        </ExternalLink>
      </div>
    </>
  );
}
