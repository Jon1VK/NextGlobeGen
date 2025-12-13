import { messages } from "next-globe-gen/messages";
import { schema } from "next-globe-gen/schema";
import { formatters } from "../shared/formatters";
import { FormFactory } from "../shared/FormFactory";
import { LinkFactory } from "../shared/LinkFactory";
import { createHrefFactory, useHrefFactory } from "../shared/useHrefFactory";
import { useTranslationsFactory } from "../shared/useTranslationsFactory";
import { useLocale } from "./LocaleStore";
import { notSupported } from "./notSupported";

export { messages } from "next-globe-gen/messages";
export { schema } from "next-globe-gen/schema";
export * from "./createTranslator";
export * from "./getMessages";
export * from "./LocaleStore";
export * from "./redirect";
export * from "./revalidatePath";
export * from "./withLanguageAlternates";

/**
 * Returns the routing schema containing routes and locale configuration.
 *
 * @returns The routing schema.
 */
export const useSchema = () => schema;
export const useHref = useHrefFactory(useLocale, useSchema);

/**
 * Creates localized URLs for routes with an explicit locale.
 *
 * @example
 * const href = createHref("/about", "en");
 * const href = createHref("/users/[id]", { id: "123" }, "fi");
 * const href = createHref({ pathname: "/about", locale: "fi", query: { tab: "overview" } });
 */
export const createHref = createHrefFactory(schema, true);

export const Link = LinkFactory(useHref);
export const Form = FormFactory(useHref);
const useMessages = () => messages[useLocale()];
const useFormatters = () => formatters;
export const useTranslations = useTranslationsFactory(
  useLocale,
  useSchema,
  useMessages,
  useFormatters,
);

// Export get versions of functions for async server usage
export const getLocale = useLocale;
export const getSchema = useSchema;

/**
 * Generates localized URLs for routes. Alias for `useHref` for async server usage.
 *
 * @example
 * const href = getHref("/about");
 * const href = getHref("/users/[id]", { id: "123" });
 */
export const getHref = useHref;

/**
 * Accesses and formats localized messages. Alias for `useTranslations` for async server usage.
 *
 * @example
 * const t = getTranslations();
 * const greeting = t("hello");
 */
export const getTranslations = useTranslations;

// Client-only functions not supported on server
export const useRouter = notSupported("useRouter");
export const useRoute = notSupported("useRoute");
