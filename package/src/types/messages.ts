import type { DefaultLocale, Locale } from "next-globe-gen/schema";
import type { ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MessagesRegister {}

type MockMessages = Record<Locale, Record<string, string>>;

export type Messages = MessagesRegister extends { messages: infer S }
  ? S
  : MockMessages;

export declare const messages: Messages;

/**
 * All possible message keys. Used default locale by default
 */
export type MessageKey<L extends Locale = DefaultLocale> = keyof Messages[L];

/**
 * Utility type fot extractiong all the possible namespaces
 */
type GetNamespaces<K extends string> = K extends `${infer N}.${infer R}`
  ? N | `${N}.${GetNamespaces<R>}`
  : never;

/**
 * All possible namespaces
 */
export type Namespace = GetNamespaces<MessageKey> | undefined;

/**
 * Utility type for extracting all keys in the given namespace
 */
type GetNamespaceKeys<
  K extends MessageKey,
  N extends Namespace,
> = N extends undefined ? K : K extends `${N}.${infer R}` ? R : never;

/**
 * Get all keys in the given namespace
 */
export type NamespaceKey<N extends Namespace> = GetNamespaceKeys<MessageKey, N>;

/**
 * Get the message type given its namespace and the key in the namespace
 */
export type Message<
  N extends Namespace,
  K extends NamespaceKey<N>,
> = N extends undefined
  ? K extends keyof Messages[DefaultLocale]
    ? Messages[DefaultLocale][K]
    : never
  : `${N}.${K}` extends keyof Messages[DefaultLocale]
    ? Messages[DefaultLocale][`${N}.${K}`]
    : never;

/**
 * Utility type to replace a string with another.
 */
type Replace<
  S extends string,
  R extends string,
  W extends string,
> = S extends `${infer BS}${R}${infer AS}`
  ? Replace<`${BS}${W}${AS}`, R, W>
  : S;

/**
 * Utility type to remove all spaces and new lines from the provided string.
 */
type StripWhitespace<S extends string> = Replace<Replace<S, "\n", "">, " ", "">;

/**
 * Utility type to remove escaped characters.
 *
 * @example "'{word}" -> "word}"
 * @example "foo '{word1} {word2}'" -> "foo "
 */
type StripEscaped<S extends string> =
  S extends `${infer A}'${string}'${infer B}`
    ? StripEscaped<`${A}${B}`>
    : S extends `${infer A}'${string}${infer B}`
      ? StripEscaped<`${A}${B}`>
      : S;

/**
 * Extract ICU message arguments ang tags from the given string.
 */
type ExtractArgumentsAngTags<S extends string> =
  | _ExtractArguments<S>
  | _ExtractTags<S>;

type ArgType = NumberArgType | DateArgType | StringArgType;
type NumberArgType = "number" | "plural" | "selectordinal";
type DateArgType = "date" | "time";
type StringArgType = "string" | "select";

type _ExtractArguments<S extends string> =
  S extends `${string}{${infer Arg},${NumberArgType}${infer Rest}`
    ? _ExtractNestedArguments<Arg, NumberArgType> | _ExtractArguments<Rest>
    : S extends `${string}{${infer Arg},${DateArgType}${infer Rest}`
      ? _ExtractNestedArguments<Arg, DateArgType> | _ExtractArguments<Rest>
      : S extends `${string}{${infer Arg},${StringArgType}${infer Rest}`
        ? _ExtractNestedArguments<Arg, StringArgType> | _ExtractArguments<Rest>
        : S extends `${string}{${infer Arg}}${infer Rest}`
          ?
              | _ExtractNestedArguments<Arg, StringArgType>
              | _ExtractArguments<Rest>
          : never;

type _ExtractNestedArguments<
  S extends string,
  T extends ArgType,
> = S extends `${infer A}{${infer B}`
  ? _ExtractArguments<`{${A}`> | _ExtractArguments<`${B},${T}`>
  : `${S},${T}`;

type _ExtractTags<S extends string> =
  S extends `${string}</${infer Tag}>${infer Rest}`
    ? `${Tag},tag` | _ExtractTags<Rest>
    : never;

/**
 * Convert ICU type to TS type.
 */
type Value<T extends string> = T extends NumberArgType
  ? number
  : T extends DateArgType
    ? Date
    : T extends "tag"
      ? (children: ReactNode) => ReactNode
      : string;

/**
 * Create an object mapping the extracted key to its type.
 */
type ArgumentsMap<S extends string> = {
  [key in S extends `${infer Key},${string}` ? Key : S]: Extract<
    S,
    `${key},${string}`
  > extends `${string},${infer V}`
    ? Value<V>
    : string;
};

/**
 * Create an object mapping all ICU message arguments to their types.
 */
export type MessageArguments<T extends string> = ArgumentsMap<
  ExtractArgumentsAngTags<StripEscaped<StripWhitespace<T>>>
>;
