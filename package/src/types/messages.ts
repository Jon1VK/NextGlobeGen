import type { Locale } from "next-globe-gen/schema";

export type ExtractionParams = {
  /** Used to add description comments to translation files without affecting runtime behavior */
  _description?: string;
  /** Used to provide default messages for translation files without affecting runtime behavior */
  _defaultMessage?: string;
};

/**
 * An interface to be augmented automatically by NextGlobeGen with the actual messages structure.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MessagesRegister {}

interface NestedMessages {
  [key: string]: NestedMessages | string;
}

type MockMessages = Record<Locale, NestedMessages>;

/**
 * All messages for all locales in your application.
 * This type is augmented at build time with the actual messages structure.
 */
export type Messages = MessagesRegister extends { messages: infer S }
  ? S
  : MockMessages;

/**
 * All messages for all locales in your application.
 */
export declare const messages: Messages;

type AllMessages = Messages[Locale];

interface NestedMessagesParams {
  [key: string]: NestedMessagesParams | Record<string, unknown>;
}

type MockMessagesParams = NestedMessagesParams;

/**
 * Type information for message parameters.
 * This type is augmented at build time to provide type-safe message parameter access.
 */
export type MessagesParams = MessagesRegister extends {
  messagesParams: infer P;
}
  ? P
  : MockMessagesParams;

/**
 * Utility type for extracting all the possible namespaces
 */
export type GetNamespaces<T> = {
  [Key in keyof T]: T[Key] extends string
    ? never
    : `${Key & string}` | `${Key & string}.${GetNamespaces<T[Key]>}`;
}[keyof T];

/**
 * All possible namespaces
 */
export type Namespace = GetNamespaces<AllMessages> | undefined;

/**
 * Utility type for extracting all the possible message keys from a nested object
 */
export type GetMessageKeys<T> = {
  [Key in keyof T]: T[Key] extends string
    ? `${Key & string}`
    : `${Key & string}.${GetMessageKeys<T[Key]>}`;
}[keyof T];

/**
 * Get all keys in the given namespace
 */
export type NamespaceKey<N extends Namespace> = N extends string
  ? GetMessageKeys<GetNestedObjectValue<AllMessages, N>>
  : GetMessageKeys<AllMessages>;

type GetNestedObjectValue<
  O,
  P extends string,
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof O
    ? GetNestedObjectValue<O[Key], Rest>
    : never
  : P extends keyof O
    ? O[P]
    : never;

/**
 * Get the message parameters type given its namespace and the key in the namespace
 */
export type MessageParams<
  N extends Namespace,
  K extends NamespaceKey<N>,
> = GetNestedObjectValue<MessagesParams, N extends undefined ? K : `${N}.${K}`>;
