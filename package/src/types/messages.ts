import type { Locale } from "next-globe-gen/schema";
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
export type MessageKey = keyof Messages[Locale];

/**
 * Utility type for extracting all the possible namespaces
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
  ? K extends keyof Messages[Locale]
    ? Messages[Locale][K]
    : never
  : `${N}.${K}` extends keyof Messages[Locale]
    ? Messages[Locale][`${N}.${K}`]
    : never;

/**
 * Utility type to remove a string from another.
 */
type RemoveAll<
  S extends string,
  R extends string,
  Acc extends string = "",
> = S extends `${infer Head}${R}${infer Tail}`
  ? RemoveAll<Tail, R, `${Acc}${Head}`>
  : `${Acc}${S}`;

/**
 * Utility type to remove all spaces and new lines from the provided string.
 */
type StripWhitespace<S extends string> = StripSpaces<
  StripTabs<StripCarriageReturns<StripLineFeeds<S>>>
>;
type StripLineFeeds<S extends string> = RemoveAll<S, "\n">;
type StripCarriageReturns<S extends string> = RemoveAll<S, "\r">;
type StripTabs<S extends string> = RemoveAll<RemoveAll<S, "\t\t">, "\t">;
type StripSpaces<S extends string> = RemoveAll<
  RemoveAll<RemoveAll<S, "    ">, "  ">,
  " "
>;

/**
 * Utility type to remove escaped characters.
 *
 * @example "'{word}" -> "word}"
 * @example "foo '{word1} {word2}'" -> "foo "
 */
type StripEscaped<S extends string> = RemoveAll<
  RemoveAll<S, `'${string}'`>,
  `'${string}`
>;

/**
 * Extract ICU message arguments and tags from the given string.
 */
type ExtractArgumentsAndTags<S extends string> =
  | ExtractArguments<S>
  | ExtractSelectArguments<S>
  | ExtractTags<S>;

type ExtractArguments<S extends string> =
  S extends `${string}{${string}{${string}`
    ? ExtractMultipleArguments<S>
    : ExtractArgument<S>;

type ExtractMultipleArguments<S extends string> =
  S extends `${string}{${infer Arg}{${infer Rest}`
    ? Arg extends `${infer Head}}${string}`
      ? ExtractArguments<`{${Head}}`> | ExtractArguments<`{${Rest}`>
      : Arg extends `${string},select,${string}`
        ? ExtractRestArguments<`{${Rest}`>
        : Arg extends `${string},${string}`
          ? Arg | ExtractRestArguments<`{${Rest}`>
          : never
    : never;

type ExtractRestArguments<S extends string> = S extends `}${infer Rest}`
  ? ExtractArguments<Rest>
  : S extends `${string}{${infer Nested}}${infer Rest}`
    ? Nested extends `${string}{${infer NestedRest}`
      ? ExtractArguments<`{${NestedRest}}`> | ExtractRestArguments<`{${Rest}`>
      : ExtractRestArguments<Rest>
    : never;

type ExtractArgument<S extends string> =
  S extends `${string}{${infer Arg}}${string}` ? Arg : never;

type ExtractSelectArguments<S extends string> =
  S extends `${string}{${infer Arg},select,${infer Rest}`
    ? ExtractNestedSelectArguments<Arg, Rest>
    : never;

type ExtractNestedSelectArguments<
  Arg extends string,
  Rest extends string,
> = Arg extends `${string}{${infer Nested}`
  ? ExtractSelectArguments<`{${Nested},select,${Rest}`>
  :
      | `${Arg},select,${ExtractSelectOptions<Rest>}`
      | ExtractSelectArguments<Rest>;

type ExtractSelectOptions<S extends string> = S extends `}${string}`
  ? never
  : S extends `${infer Option}{${infer Nested}}${infer Rest}`
    ? Nested extends `${string}{${infer NestedRest}`
      ? ExtractSelectOptions<`${Option}{${NestedRest}${Rest}`>
      : Option | ExtractSelectOptions<Rest>
    : never;

type ExtractTags<S extends string> =
  S extends `${string}</${infer Tag}>${infer Rest}`
    ? `${Tag},tag` | ExtractTags<Rest>
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
 * Create an object mapping the extracted key to its type.
 */
type ArgumentsMap<S extends string> = {
  [Key in ExtractKeys<S>]: ExtractType<S, Key>;
};

type ExtractKeys<S extends string> = S extends `${infer Key},${string}`
  ? Key
  : S;

type ExtractType<S extends string, Key extends string> =
  Extract<S, Key | `${Key},${string}`> extends `${string},${infer ArgType}`
    ? ToTsType<ArgType>
    : string;

type ToTsType<ArgType extends string> = ArgType extends
  | "number"
  | "plural"
  | "selectordinal"
  ? number
  : ArgType extends "date" | "time"
    ? Date
    : ArgType extends "tag"
      ? (children: ReactNode) => ReactNode
      : ArgType extends `select,${infer Option}`
        ? Option
        : string;

/**
 * Create an object mapping all ICU message arguments to their types.
 */
export type MessageArguments<T extends string> = ArgumentsMap<
  NormalizeArguments<ExtractArgumentsAndTags<StripEscaped<StripWhitespace<T>>>>
>;
