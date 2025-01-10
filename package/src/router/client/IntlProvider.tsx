"use client";

import type { Messages } from "next-globe-gen/messages";
import type { Locale, Schema } from "next-globe-gen/schema";
import { createContext, use, type ReactNode } from "react";

const IntlContext = createContext<{
  locale: Locale;
  messages: Messages[Locale];
  schema: Schema;
}>({
  locale: "",
  messages: {},
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
    <IntlContext.Provider value={{ locale, messages, schema }}>
      {children}
    </IntlContext.Provider>
  );
}

export const useLocale = (): Locale => use(IntlContext).locale;
export const useMessages = (): Messages[Locale] => use(IntlContext).messages;
export const useSchema = (): Schema => use(IntlContext).schema;
