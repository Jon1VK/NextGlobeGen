import type {
  DynamicRoute,
  Locale,
  Route,
  RouteParams,
} from "next-globe-gen/schema";
import {
  default as NextForm,
  type FormProps as NextFormProps,
} from "next/form";
import React from "react";
import { type useHrefFactory, type UseHrefOptions } from "./useHrefFactory";

type FormProps<R extends Route> = Omit<NextFormProps, "action"> & {
  ref?: React.Ref<HTMLFormElement>;
} & ({
    action: R | Exclude<NextFormProps["action"], string>;
    locale?: Locale;
  } & (R extends DynamicRoute
    ? { params: RouteParams<R> }
    : { params?: undefined }));

export function FormFactory(useHref: ReturnType<typeof useHrefFactory>) {
  return function Form<R extends Route>({
    action,
    locale,
    params,
    ref,
    ...formProps
  }: FormProps<R>) {
    if (typeof action === "function") {
      return <NextForm {...formProps} ref={ref} action={action} />;
    }
    const options: UseHrefOptions<string> = { route: action, locale, params };
    return <NextForm {...formProps} ref={ref} action={useHref(options)} />;
  };
}
