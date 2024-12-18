import type {
  permanentRedirect as $permanentRedirect,
  redirect as $redirect,
} from "../server";
import { LinkFactory } from "../shared/LinkFactory";
import { useHrefFactory } from "../shared/useHrefFactory";
import { useTranslationsFactory } from "../shared/useTranslationsFactory";
import { useLocale, useMessages } from "./IntlProvider";
import { notSupported } from "./notSupported";

export type * from "~/types/messages";
export type * from "~/types/schema";
export type { UserConfig as Config } from "../../cli/types";
export * from "./IntlProvider";
export * from "./useRouter";

export const useHref = useHrefFactory(useLocale);
export const Link = LinkFactory(useHref);
export const useTranslations = useTranslationsFactory(useLocale, useMessages);

// Server functions that are not supported on client
export const getLocale = notSupported("getLocale") as typeof useLocale;
export const getHref = notSupported("getHref") as typeof useHref;
export const getMessages = notSupported("getMessages") as typeof useMessages;
export const getTranslations = notSupported(
  "getTranslations"
) as typeof useTranslations;
export const redirect = notSupported("redirect") as unknown as typeof $redirect;
export const permanentRedirect = notSupported(
  "permanentRedirect"
) as unknown as typeof $permanentRedirect;
