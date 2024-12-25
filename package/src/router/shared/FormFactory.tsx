import type { Locale, Route } from "next-globe-gen/schema";
import { default as NextForm } from "next/form";
import { type ComponentProps } from "react";
import {
  type HrefOptions,
  type ParamsOption,
  type useHrefFactory,
} from "./useHrefFactory";

type NextFormProps = ComponentProps<typeof NextForm>;

type FormProps<R extends Route> = Omit<NextFormProps, "action"> &
  ({
    action: R | Exclude<NextFormProps["action"], string> | (string & {});
    locale?: Locale;
  } & ParamsOption<R>);

export function FormFactory(useHref: ReturnType<typeof useHrefFactory>) {
  return function Form<R extends Route>({
    action,
    locale,
    params,
    ...formProps
  }: FormProps<R>) {
    if (typeof action === "function") {
      return <NextForm {...formProps} action={action} />;
    }
    const options: HrefOptions<string> = { pathname: action, locale, params };
    return <NextForm {...formProps} action={useHref(options)} />;
  };
}
