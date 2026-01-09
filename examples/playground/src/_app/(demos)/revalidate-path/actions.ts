"use server";

import { createTranslator, revalidatePath, type Locale } from "next-globe-gen";

// Example action that revalidates a path after mutation
export async function updateAndRevalidateAction(
  locale: Locale,
  formData: FormData,
) {
  const t = createTranslator(locale, "demos");

  // Simulate data update
  const value = formData.get("value") as string;

  // Revalidate the current page for this locale
  revalidatePath("/revalidate-path", { locale });

  return {
    success: true,
    message: t("revalidate-path.revalidated", {
      value,
      _description: "Success message after revalidation",
    }),
  };
}
