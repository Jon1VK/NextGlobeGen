import type { Metadata } from "next";
import { getTranslations, useTranslations } from "next-globe-gen";
import ExternalLink from "../components/ExternalLink";

export function generateMetadata(): Metadata {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.localized-pathnames"),
    description: t("descriptions.localized-pathnames"),
  };
}

export default function Page() {
  const commonT = useTranslations("common");
  const contentT = useTranslations("content");
  const titlesT = useTranslations("demos.client.titles");
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">{titlesT("localized-pathnames")}</h1>
      {contentT("localized-pathnames", { p: (children) => <p>{children}</p> })}

      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/routing#localized-pathnames">
          {commonT("docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/localized-pathnames">
          {commonT("code")}
        </ExternalLink>
      </div>
    </div>
  );
}
