import ExternalLink from "@/components/ExternalLink";
import { useTranslations } from "next-globe-gen";

export default function NotFoundPage() {
  const tCommon = useTranslations("common");
  const tDemos = useTranslations("demos");
  return (
    <>
      <h1 className="text-xl font-medium ">
        {tDemos("client.titles.not-found")}
      </h1>
      <p className="my-4 text-sm text-gray-300">
        {tDemos("descriptions.not-found")}
      </p>

      <div className="flex gap-2">
        <ExternalLink href="https://next-globe-gen.dev/docs/api-reference/routing#localized-404-page">
          {tCommon("docs")}
        </ExternalLink>
        <ExternalLink href="https://github.com/Jon1VK/NextGlobeGen/tree/main/examples/playground/src/_app">
          {tCommon("code")}
        </ExternalLink>
      </div>
    </>
  );
}
