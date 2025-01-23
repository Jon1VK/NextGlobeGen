import clsx from "clsx";
import {
  Link,
  useLocale,
  useRoute,
  useSchema,
  type RouteParams,
} from "next-globe-gen";
import { useParams } from "next/navigation";

export default function LanguageSwitcher() {
  const activeLocale = useLocale();
  const schema = useSchema();
  const route = useRoute();
  const params = useParams<RouteParams<typeof route>>();
  return (
    <div className="flex gap-x-2">
      {schema.locales.map((locale) => (
        <Link
          key={locale}
          href={route}
          locale={locale}
          params={params}
          className={clsx("rounded-lg px-3 py-1 text-sm font-medium", {
            "bg-gray-700 text-gray-100 hover:bg-gray-500 hover:text-white":
              locale !== activeLocale,
            "bg-vercel-blue text-white": locale === activeLocale,
          })}
        >
          {locale === "en" && "In English"}
          {/* @ts-expect-error en-US is used only when testing domain-based routing  */}
          {locale === "en-US" && "In US English"}
          {locale === "fi" && "Suomeksi"}
        </Link>
      ))}
    </div>
  );
}
