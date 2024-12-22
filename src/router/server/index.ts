import { messages } from "next-globe-gen/messages";
import { FormFactory } from "../shared/FormFactory";
import { LinkFactory } from "../shared/LinkFactory";
import { useHrefFactory } from "../shared/useHrefFactory";
import { useTranslationsFactory } from "../shared/useTranslationsFactory";
import { useLocale } from "./LocaleStore";
import { notSupported } from "./notSupported";

export * from "./getServerTranslations";
export * from "./LocaleStore";
export * from "./redirect";

export const useHref = useHrefFactory(useLocale);
export const Link = LinkFactory(useHref);
export const Form = FormFactory(useHref);
const useMessages = () => messages[useLocale()];
export const useTranslations = useTranslationsFactory(useLocale, useMessages);

// Export get versions of functions for async server usage
export const getLocale = useLocale;
export const getHref = useHref;
export const getTranslations = useTranslations;

// Client-only functions not supported on server
export const useRouter = notSupported("useRouter");
export const useRoute = notSupported("useRoute");
