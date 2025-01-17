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
      ? `${A}${B}`
      : S;

/**
 * Extract ICU message arguments ang tags from the given string.
 */
type ExtractArgumentsAngTags<S extends string> =
  | _ExtractSimpleArguments<S>
  | _ExtractComplexArguments<S>
  | _ExtractSelectArguments<S>
  | _ExtractTags<S>;

type _ExtractSimpleArguments<S extends string> =
  S extends `${string}{${infer Arg}}${infer Rest}`
    ? _ExtractNestedSimpleArguments<Arg> | _ExtractSimpleArguments<Rest>
    : never;

type _ExtractNestedSimpleArguments<Arg extends string> =
  Arg extends `${string}{${infer B}` ? _ExtractSimpleArguments<`{${B}}`> : Arg;

type _ExtractComplexArguments<S extends string> =
  S extends `${string}{${infer Arg}{${infer Rest}`
    ? _ExtractNestedComplexArguments<Arg> | _ExtractComplexArguments<Rest>
    : never;

type _ExtractNestedComplexArguments<Arg extends string> =
  Arg extends `${string}}${string}`
    ? never
    : Arg extends `${string},select,${string}`
      ? never
      : Arg extends `${string},${string}`
        ? Arg
        : never;

type _ExtractSelectArguments<S extends string> =
  S extends `${string}{${infer Arg},select,${infer Rest}`
    ? _ExtractNestedSelectArguments<Arg, Rest>
    : never;

type _ExtractNestedSelectArguments<
  Arg extends string,
  Rest extends string,
> = Arg extends `${string}{${infer B}`
  ? _ExtractSelectArguments<`{${B},select,${Rest}`>
  :
      | `${Arg},select,${_ExtractSelectOptions<Rest>}`
      | _ExtractSelectArguments<Rest>;

type _ExtractSelectOptions<S extends string> = S extends `}${string}`
  ? never
  : S extends `${infer Option}{${infer Nested}}${infer Rest}`
    ? Nested extends `${string}{${infer NestedRest}`
      ? _ExtractSelectOptions<`${Option}{${NestedRest}${Rest}`>
      : Option | _ExtractSelectOptions<Rest>
    : never;

type _ExtractTags<S extends string> =
  S extends `${string}</${infer Tag}>${infer Rest}`
    ? `${Tag},tag` | _ExtractTags<Rest>
    : never;

/**
 * Normalize extracted arguments.
 */
type NormalizeArguments<Arg extends string> =
  Arg extends `${infer Name},${infer Type},${string}`
    ? Type extends "select"
      ? Arg
      : `${Name},${Type}`
    : Arg;

/**
 * Convert ICU type to TS type.
 */
type Value<T extends string> = T extends "number" | "plural" | "selectordinal"
  ? number
  : T extends "date" | "time"
    ? Date
    : T extends "tag"
      ? (children: ReactNode) => ReactNode
      : T extends `select,${infer Option}`
        ? Option
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
  NormalizeArguments<ExtractArgumentsAngTags<StripEscaped<StripWhitespace<T>>>>
>;
