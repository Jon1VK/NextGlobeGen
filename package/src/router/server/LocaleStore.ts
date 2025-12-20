import type { Locale } from "next-globe-gen/schema";
import { cache } from "react";

type LocaleStore = { locale: Locale };

function createLocaleStore(): LocaleStore {
  return { locale: "" };
}

const getLocaleStore = cache(createLocaleStore);

export function useLocale(): Locale {
  return getLocaleStore().locale;
}

export function setLocale(locale: Locale) {
  getLocaleStore().locale = locale;
}
