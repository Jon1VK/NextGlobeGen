"use client";

import type { Messages } from "next-globe-gen/messages";
import type { Locale } from "next-globe-gen/schema";
import { createContext, use, type ReactNode } from "react";

const IntlContext = createContext<{
  locale: Locale;
  messages: Messages[Locale];
}>({
  locale: "",
  messages: {},
});

type IntlProviderProps = {
  children: ReactNode;
  locale: Locale;
  messages: Messages[Locale];
};

export function IntlProvider({
  children,
  locale,
  messages,
}: IntlProviderProps) {
  return (
    <IntlContext.Provider value={{ locale, messages }}>
      {children}
    </IntlContext.Provider>
  );
}

export const useLocale = (): Locale => use(IntlContext).locale;
export const useMessages = (): Messages[Locale] => use(IntlContext).messages;
