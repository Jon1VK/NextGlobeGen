import ExternalLink from "@/components/ExternalLink";
import type { Metadata } from "next";
import { getTranslations, useTranslations } from "next-globe-gen";

export function generateMetadata(): Metadata {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.localized-pathnames"),
    description: t("descriptions.localized-pathnames"),
  };
}

export default function Page() {
  const tCommon = useTranslations("common");
  const tDemos = useTranslations("demos");
  return (
    <>
      <h1 className="text-xl font-bold">
        {tDemos("client.titles.localized-pathnames")}
      </h1>
      {tDemos("content.localized-pathnames", {
        p: (children) => <p>{children}</p>,
      })}

      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/routing#localized-pathnames">
          {tCommon("docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/localized-pathnames">
          {tCommon("code")}
        </ExternalLink>
      </div>
    </>
  );
}
