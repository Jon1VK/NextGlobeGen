"use client";

import { useLocale, useTranslations } from "next-globe-gen";
import { useActionState } from "react";
import { greetAction } from "./actions";

export default function CreateTranslatorExample() {
  const locale = useLocale();
  const t = useTranslations("demos.client.create-translator");

  // Bind the locale to action
  const greetActionWithLocale = greetAction.bind(null, locale);

  const [greetState, greetFormAction, greetPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return await greetActionWithLocale(formData);
    },
    null,
  );

  return (
    <div>
      <p className="mb-4 text-sm text-gray-400">
        {t("description", {
          _description: "Description for createTranslator example",
        })}
      </p>
      <form action={greetFormAction} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder={t("namePlaceholder", {
            _description: "Placeholder for name input",
          })}
          className="rounded-lg bg-gray-200 px-3 py-2 text-gray-900"
        />
        <button
          type="submit"
          disabled={greetPending}
          className="ml-2 rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white disabled:opacity-50"
        >
          {greetPending
            ? t("submitting", { _description: "Submitting button label" })
            : t("greet", { _description: "Greet button label" })}
        </button>
      </form>
      {greetState?.message && (
        <div className="my-4 rounded-lg bg-green-900 p-3">
          {greetState.message}
        </div>
      )}
    </div>
  );
}
