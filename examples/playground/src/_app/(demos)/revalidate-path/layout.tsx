import ExternalLink from "@/components/ExternalLink";
import { getTranslations, useTranslations } from "next-globe-gen";
import { type ReactNode } from "react";

export function generateMetadata() {
  const t = getTranslations("demos");
  return {
    title: t("client.titles.revalidate-path", {
      _description: "Page title for revalidatePath demo",
    }),
    description: t("descriptions.revalidate-path", {
      _description: "Page description for revalidatePath demo",
    }),
  };
}

export default function RevalidatePathLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = useTranslations();
  return (
    <>
      {children}
      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/functions#revalidatepath">
          {t("common.docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app/(demos)/revalidate-path">
          {t("common.code")}
        </ExternalLink>
      </div>
    </>
  );
}
