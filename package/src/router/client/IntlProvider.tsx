"use client";

import type { Options } from "intl-messageformat";
import type { Messages } from "next-globe-gen/messages";
import type { Locale, Schema } from "next-globe-gen/schema";
import { createContext, use, type ReactNode } from "react";

const IntlContext = createContext(
  null as unknown as {
    locale: Locale;
    messages: Messages[Locale];
    formatters: Options["formatters"];
    schema: Schema;
  },
);

type IntlProviderProps = {
  children: ReactNode;
  locale?: Locale;
  messages?: Messages[Locale];
  schema?: Schema;
};

/**
 * Provider component that makes locale, messages, schema, and formatters available to child components.
 * Root IntlProvider must include all props, while nested providers can override specific values.
 *
 * @example
 * <IntlProvider locale="en" messages={messages} schema={schema}>
 *   <App />
 * </IntlProvider>
 */
export function IntlProvider(props: IntlProviderProps) {
  const parentContext = use(IntlContext);
  if (!parentContext && !(props.locale && props.messages && props.schema)) {
    throw new Error(
      "Root IntlProvider is missing some of the following props: `locale`, `schema`, `messages`.",
    );
  }
  const { children, ...value } = { ...parentContext, ...props };
  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>;
}

/**
 * Returns the current locale from the IntlProvider context.
 *
 * @returns The current locale.
 */
export const useLocale = (): Locale => use(IntlContext).locale;
export const useMessages = (): Messages[Locale] => use(IntlContext).messages;
export const useFormatters = (): Options["formatters"] =>
  use(IntlContext).formatters;

/**
 * Returns the routing schema from the IntlProvider context.
 *
 * @returns The routing schema containing routes and locale configuration.
 */
export const useSchema = (): Schema => use(IntlContext).schema;
