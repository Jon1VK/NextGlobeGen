import type {
  createHref as $createHref,
  createTranslator as $createTranslator,
  permanentRedirect as $permanentRedirect,
  redirect as $redirect,
} from "../server";
import { FormFactory } from "../shared/FormFactory";
import { LinkFactory } from "../shared/LinkFactory";
import { useHrefFactory } from "../shared/useHrefFactory";
import { useTranslationsFactory } from "../shared/useTranslationsFactory";
import {
  useFormatters,
  useLocale,
  useMessages,
  useSchema,
} from "./IntlProvider";
import { notSupported } from "./notSupported";
import { useRouteFactory } from "./useRoute";

export type * from "next-globe-gen/messages";
export type * from "next-globe-gen/schema";
export type { UserConfig as Config } from "~/utils/config";
export { IntlProvider, useLocale, useSchema } from "./IntlProvider";
export * from "./useRouter";

export const useHref = useHrefFactory(useLocale, useSchema);
export const useRoute = useRouteFactory(useSchema);
export const Link = LinkFactory(useHref);
export const Form = FormFactory(useHref);
export const useTranslations = useTranslationsFactory(
  useLocale,
  useMessages,
  useFormatters,
);

// Server functions that are not supported on client
export const getLocale = notSupported("getLocale") as typeof useLocale;
export const getSchema = notSupported("getLocale") as typeof useSchema;
export const getHref = notSupported("getHref") as typeof useHref;
export const getTranslations = notSupported(
  "getTranslations",
) as typeof useTranslations;
export const redirect = notSupported("redirect") as unknown as typeof $redirect;
export const permanentRedirect = notSupported(
  "permanentRedirect",
) as unknown as typeof $permanentRedirect;
export const createTranslator = notSupported(
  "createTranslator",
) as unknown as typeof $createTranslator;
export const createHref = notSupported("createHref") as typeof $createHref;
