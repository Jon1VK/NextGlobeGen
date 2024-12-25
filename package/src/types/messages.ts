import type { DefaultLocale, Locale } from "next-globe-gen/schema";

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
 * Extract ICU message arguments from the given string.
 */
type ExtractArguments<S extends string> =
  /* Handle {arg0,selectordinal,...}} since it has nested {} */
  S extends `${infer A}{${infer B}}}${infer C}`
    ? ExtractArguments<A> | _ExtractComplexArguments<B> | ExtractArguments<C>
    : /* Handle remaining arguments {arg0}, {arg0, number}, {arg0, date, short}, etc. */
      S extends `${infer A}{${infer B}}${infer C}`
      ? ExtractArguments<A> | B | ExtractArguments<C>
      : never;

/**
 * Handle complex type argument extraction (i.e plural, select, and selectordinal) which
 * can have nested arguments.
 */
type _ExtractComplexArguments<S extends string> =
  /* Handle arg0,plural,... */
  S extends `${infer A},plural,${infer B}`
    ? ExtractArguments<`{${A},plural}`> | _ExtractNestedArguments<`${B}}`>
    : /* Handle arg0,select,... */
      S extends `${infer A},select,${infer B}`
      ? ExtractArguments<`{${A},select}`> | _ExtractNestedArguments<`${B}}`>
      : /* Handle arg0,selectordinal,... */
        S extends `${infer A},selectordinal,${infer B}`
        ?
            | ExtractArguments<`{${A},selectordinal}`>
            | _ExtractNestedArguments<`${B}}`>
        : never;

/**
 * Extract nested arguments from complex types such as plural, select, and selectordinal.
 */
type _ExtractNestedArguments<S extends string> =
  S extends `${infer A}{${infer B}}${infer C}`
    ?
        | _ExtractNestedArguments<A>
        | ExtractArguments<`${B}}`>
        | _ExtractNestedArguments<C>
    : never;

/**
 * Normalize extract arguments to either `name` or `name,type`.
 */
type NormalizeArguments<TArg extends string> =
  /* Handle "name,type,other args" */
  TArg extends `${infer Name},${infer Type},${string}`
    ? `${Name},${Type}`
    : /* Handle "name,type" */
      TArg extends `${infer Name},${infer Type}`
      ? `${Name},${Type}`
      : /* Handle "name" */
        TArg;

/**
 * Convert ICU type to TS type.
 */
type Value<T extends string> = T extends "number" | "plural" | "selectordinal"
  ? number
  : T extends "date" | "time"
    ? Date
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
  NormalizeArguments<ExtractArguments<StripEscaped<StripWhitespace<T>>>>
>;
