"use client";

import clsx from "clsx";
import {
  Link,
  schema,
  useLocale,
  useRoute,
  type RouteParams,
} from "next-globe-gen";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import React, { Fragment, Suspense } from "react";

function LanguageSwitcher() {
  const activeLocale = useLocale();
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
          {locale === "fi" && "Suomeksi"}
        </Link>
      ))}
    </div>
  );
}

function Params() {
  const searchParams = useSearchParams()!;

  return searchParams.toString().length !== 0 ? (
    <div className="px-2 text-gray-500">
      <span>?</span>
      {Array.from(searchParams.entries()).map(([key, value], index) => {
        return (
          <Fragment key={key}>
            {index !== 0 ? <span>&</span> : null}
            <span className="px-1">
              <span
                key={key}
                className="animate-[highlight_1s_ease-in-out_1] text-gray-100"
              >
                {key}
              </span>
              <span>=</span>
              <span
                key={value}
                className="animate-[highlight_1s_ease-in-out_1] text-gray-100"
              >
                {value}
              </span>
            </span>
          </Fragment>
        );
      })}
    </div>
  ) : null;
}

export default function AddressBar() {
  const pathname = usePathname();

  return (
    <div className="flex text-nowrap items-center justify-between flex-wrap overflow-x-auto gap-4 p-3.5 lg:px-5 lg:py-3">
      <div className="flex items-center gap-x-2">
        <div className="text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex gap-x-1 text-sm font-medium">
          <div>
            <span className="px-2 text-gray-400">acme.com</span>
          </div>
          <span className="text-gray-600">/</span>
          {pathname
            .split("/")
            .slice(1)
            .map((segment) => {
              return (
                <React.Fragment key={segment}>
                  <span>
                    <span
                      key={segment}
                      className="animate-[highlight_1s_ease-in-out_1] rounded-full px-1.5 py-0.5 text-gray-100"
                    >
                      {segment}
                    </span>
                  </span>

                  <span className="text-gray-600">/</span>
                </React.Fragment>
              );
            })}

          <Suspense>
            <Params />
          </Suspense>
        </div>
      </div>

      <LanguageSwitcher />
    </div>
  );
}
