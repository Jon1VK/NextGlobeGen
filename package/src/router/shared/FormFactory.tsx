import type { Locale, Route } from "next-globe-gen/schema";
import { forwardRef, type ComponentProps, type Ref } from "react";
import {
  type HrefOptions,
  type ParamsOption,
  type useHrefFactory,
} from "./useHrefFactory";

type NextFormProps = ComponentProps<"form">;

type FormProps<R extends Route> = Omit<NextFormProps, "action"> &
  ({
    action:
      | R
      | Exclude<NextFormProps["action"], string | undefined>
      | (string & {});
    locale?: Locale;
  } & ParamsOption<R>);

export function FormFactory(useHref: ReturnType<typeof useHrefFactory>) {
  return forwardRef(function Form<R extends Route>(
    { action, locale, params, ...formProps }: FormProps<R>,
    ref?: Ref<HTMLFormElement>,
  ) {
    if (typeof action === "function") {
      return <form {...formProps} action={action} />;
    }
    const options: HrefOptions<string> = { pathname: action, locale, params };
    return <form {...formProps} ref={ref} action={useHref(options)} />;
  }) as <R extends Route>(props: FormProps<R>) => JSX.Element;
}
