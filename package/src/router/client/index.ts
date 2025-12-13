import type {
  createHref as $createHref,
  createTranslator as $createTranslator,
  getHref as $getHref,
  getLocale as $getLocale,
  getMessages as $getMessages,
  getSchema as $getSchema,
  getTranslations as $getTranslations,
  permanentRedirect as $permanentRedirect,
  redirect as $redirect,
  revalidatePath as $revalidatePath,
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

/**
 * Hook that generates localized URLs for routes.
 *
 * @example
 * const href = useHref("/about");
 * const href = useHref("/users/[id]", { id: "123" });
 * const href = useHref("/about", "fi");
 * const href = useHref({ pathname: "/about", locale: "fi", query: { tab: "overview" } });
 */
export const useHref = useHrefFactory(useLocale, useSchema);

/**
 * Hook that returns the current route pathname.
 *
 * @example
 * const route = useRoute(); // e.g., "/about" or "/users/[id]"
 */
export const useRoute = useRouteFactory(useSchema);

/**
 * Link component with localized routing support.
 *
 * @example
 * <Link href="/about">About</Link>
 * <Link href="/users/[id]" params={{ id: "123" }}>User</Link>
 * <Link href="/about" locale="fi">Tietoja</Link>
 */
export const Link = LinkFactory(useHref);

/**
 * Form component with localized routing support.
 *
 * @example
 * <Form action="/search">...</Form>
 * <Form action="/users/[id]" params={{ id: "123" }}>...</Form>
 */
export const Form = FormFactory(useHref);

/**
 * Hook for accessing and formatting localized messages.
 *
 * @example
 * const t = useTranslations();
 * const greeting = t("hello");
 *
 * const t = useTranslations("common");
 * const title = t("title");
 */
export const useTranslations = useTranslationsFactory(
  useLocale,
  useSchema,
  useMessages,
  useFormatters,
);

// Server functions that are not supported on client
export const getLocale = notSupported("getLocale") as typeof $getLocale;
export const getSchema = notSupported("getSchema") as typeof $getSchema;
export const getHref = notSupported("getHref") as typeof $getHref;
export const getTranslations = notSupported(
  "getTranslations",
) as typeof $getTranslations;
export const redirect = notSupported("redirect") as unknown as typeof $redirect;
export const permanentRedirect = notSupported(
  "permanentRedirect",
) as unknown as typeof $permanentRedirect;
export const createTranslator = notSupported(
  "createTranslator",
) as unknown as typeof $createTranslator;
export const createHref = notSupported("createHref") as typeof $createHref;
export const getMessages = notSupported("getMessages") as typeof $getMessages;
export const revalidatePath = notSupported(
  "revalidatePath",
) as typeof $revalidatePath;
