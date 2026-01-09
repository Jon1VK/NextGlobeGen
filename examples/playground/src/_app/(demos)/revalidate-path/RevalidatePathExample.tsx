"use client";

import { useLocale, useTranslations } from "next-globe-gen";
import { useActionState } from "react";
import { updateAndRevalidateAction } from "./actions";

export default function RevalidatePathExample() {
  const locale = useLocale();
  const t = useTranslations("demos.client.revalidate-path");

  // Bind the locale to action
  const revalidateActionWithLocale = updateAndRevalidateAction.bind(
    null,
    locale,
  );

  const [revalidateState, revalidateFormAction, revalidatePending] =
    useActionState(async (_: unknown, formData: FormData) => {
      return await revalidateActionWithLocale(formData);
    }, null);

  return (
    <div>
      <p className="mb-4 text-sm text-gray-400">
        {t("description", {
          _description: "Description for revalidatePath example",
        })}
      </p>
      <form action={revalidateFormAction} className="space-y-4">
        <input
          type="text"
          name="value"
          placeholder={t("valuePlaceholder", {
            _description: "Placeholder for value input",
          })}
          className="rounded-lg bg-gray-200 px-3 py-2 text-gray-900"
        />
        <button
          type="submit"
          disabled={revalidatePending}
          className="ml-2 rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white disabled:opacity-50"
        >
          {revalidatePending
            ? t("submitting", { _description: "Submitting button label" })
            : t("updateAndRevalidate", {
                _description: "Update and revalidate button label",
              })}
        </button>
      </form>
      {revalidateState?.message && (
        <div className="my-4 rounded-lg bg-green-900 p-3">
          {revalidateState.message}
        </div>
      )}
    </div>
  );
}
