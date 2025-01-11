"use client";

import { useRouter, useTranslations } from "next-globe-gen";

export default function UseRouterExample() {
  const router = useRouter();
  const t = useTranslations("demos.client.useRouter");

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        className="inline-flex gap-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 no-underline hover:bg-gray-500 hover:text-white"
        onClick={() => router.push("/")}
      >
        {t("homepage")}
      </button>
      <button
        className="inline-flex gap-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 no-underline hover:bg-gray-500 hover:text-white"
        onClick={() => router.push("/", { locale: "fi" })}
      >
        {t("homepageAlt")}
      </button>
      <button
        className="inline-flex gap-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 no-underline hover:bg-gray-500 hover:text-white"
        onClick={() =>
          router.replace({ pathname: "/use-router", query: { q: "query" } })
        }
      >
        {t("withQuery")}
      </button>
      <button
        className="inline-flex gap-x-2 rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 no-underline hover:bg-gray-500 hover:text-white"
        onClick={() =>
          router.push("/[...catchAll]", {
            params: { catchAll: ["a", "b", "c"] },
          })
        }
      >
        {t("withDynamicParams")}
      </button>
    </div>
  );
}
