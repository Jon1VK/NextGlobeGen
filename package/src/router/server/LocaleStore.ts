import type { Locale } from "next-globe-gen/schema";
import { cache } from "react";

type LocaleStore = { locale: Locale };

function createLocaleStore(): LocaleStore {
  return { locale: "" };
}

const getLocaleStore = cache(createLocaleStore);

/**
 * Returns the current locale from the locale store.
 * Used in server components to access the locale set during request processing.
 *
 * @returns The current locale.
 */
export function useLocale() {
  return getLocaleStore().locale;
}

/**
 * Sets the current locale in the locale store.
 *
 * @param locale - The locale to set as current.
 */
export function setLocale(locale: Locale) {
  getLocaleStore().locale = locale;
}
