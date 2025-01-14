"use client";

import type { Options } from "intl-messageformat";
import type { Messages } from "next-globe-gen/messages";
import type { Locale, Schema } from "next-globe-gen/schema";
import { createContext, use, type ReactNode } from "react";
import { formatters } from "../shared/formatters";

const IntlContext = createContext<{
  locale: Locale;
  messages: Messages[Locale];
  formatters: Options["formatters"];
  schema: Schema;
}>({
  locale: "",
  messages: {},
  formatters: undefined,
  schema: {
    locales: [],
    defaultLocale: "",
    prefixDefaultLocale: true,
    routes: {},
  },
});

type IntlProviderProps = {
  children: ReactNode;
  locale: Locale;
  messages: Messages[Locale];
  schema: Schema;
};

export function IntlProvider({
  children,
  locale,
  messages,
  schema,
}: IntlProviderProps) {
  return (
    <IntlContext.Provider value={{ locale, messages, formatters, schema }}>
      {children}
    </IntlContext.Provider>
  );
}

export const useLocale = (): Locale => use(IntlContext).locale;
export const useMessages = (): Messages[Locale] => use(IntlContext).messages;
export const useFormatters = (): Options["formatters"] =>
  use(IntlContext).formatters;
export const useSchema = (): Schema => use(IntlContext).schema;
