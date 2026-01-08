import type { UserConfig } from "~/config/types";
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
export { IntlProvider, useLocale, useSchema } from "./IntlProvider";
export * from "./useRouter";

/**
 * @deprecated Import from "next-globe-gen/config" instead.
 */
export type Config = UserConfig;

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

/**
 * Returns the current locale code. Alias for `useLocale` for async server usage.
 */
export const getLocale = notSupported("getLocale") as typeof $getLocale;
/**
 * Returns the routing schema containing routes and locale configuration. Alias for `useSchema` for async server usage.
 */
export const getSchema = notSupported("getSchema") as typeof $getSchema;
/**
 * Generates localized URLs for routes. Alias for `useHref` for async server usage.
 */
export const getHref = notSupported("getHref") as typeof $getHref;
/**
 * Accesses and formats localized messages. Alias for `useTranslations` for async server usage.
 */
export const getTranslations = notSupported(
  "getTranslations",
) as typeof $getTranslations;
/**
 * Redirects to a localized route. Calls next/navigation's redirect under the hood with the localized path.
 *
 * @example
 * redirect("/about");
 * redirect("/users/[id]", { params: { id: "123" } });
 * redirect("/about", { locale: "fi" });
 * redirect({ pathname: "/about", locale: "fi", query: { tab: "overview" } });
 */
export const redirect = notSupported("redirect") as unknown as typeof $redirect;
/**
 * Performs a permanent redirect (308) to a localized route. Calls next/navigation's permanentRedirect under the hood with the localized path.
 *
 * @example
 * permanentRedirect("/about");
 * permanentRedirect("/users/[id]", { params: { id: "123" } });
 * permanentRedirect("/about", { locale: "fi" });
 */
export const permanentRedirect = notSupported(
  "permanentRedirect",
) as unknown as typeof $permanentRedirect;
/**
 * Creates a translation function for a specific locale and optional namespace.
 *
 * @param locale - The locale to translate for.
 * @param namespace - Optional namespace to scope translations.
 * @returns A translation function that can be used to translate message keys.
 *
 * @example
 * const t = createTranslator("en");
 * const greeting = t("hello");
 *
 * const tCommon = createTranslator("fi", "common");
 * const title = tCommon("title");
 */
export const createTranslator = notSupported(
  "createTranslator",
) as unknown as typeof $createTranslator;
/**
 * Generates localized URLs for routes. Alias for `useHref` for async server usage.
 */
export const createHref = notSupported("createHref") as typeof $createHref;
/**
 * Retrieves messages from the current locale that match the provided regular expressions.
 * Useful for code splitting and reducing the size of messages sent to the client.
 *
 * @param messageKeys - A single RegExp or array of RegExp patterns to match message keys.
 * @returns An object containing only the matched messages for the current locale.
 *
 * @example
 * const messages = getMessages(/^common\./);
 * const messages = getMessages([/^common\./, /^errors\./]);
 */
export const getMessages = notSupported("getMessages") as typeof $getMessages;
/**
 * Revalidates a localized route path on-demand. Calls next/cache's revalidatePath under the hood with the localized path.
 *
 * @example
 * revalidatePath("/about", { locale: "en" });
 * revalidatePath("/users/[id]", { params: { id: "123" }, locale: "fi" });
 * revalidatePath("/about", { locale: "en", type: "page" });
 */
export const revalidatePath = notSupported(
  "revalidatePath",
) as typeof $revalidatePath;
