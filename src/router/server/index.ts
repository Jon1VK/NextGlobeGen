import { messages } from "next-globe-gen/messages";
import { LinkFactory } from "../shared/LinkFactory";
import { useHrefFactory } from "../shared/useHrefFactory";
import { useTranslationsFactory } from "../shared/useTranslationsFactory";
import { useLocale } from "./LocaleStore";

export * from "./LocaleStore";
export * from "./redirect";

export const useHref = useHrefFactory(useLocale);
export const Link = LinkFactory(useHref);
export const useMessages = () => messages[useLocale()];
export const useTranslations = useTranslationsFactory(useLocale, useMessages);

// Export get versions of functions for async server usage
export const getLocale = useLocale;
export const getHref = useHref;
export const getMessages = useMessages;
export const getTranslations = useTranslations;
