"use server";

import { createTranslator, type Locale } from "next-globe-gen";

// Example action using createTranslator to get translated messages
export async function greetAction(locale: Locale, formData: FormData) {
  const name = formData.get("name") as string;
  const t = createTranslator(locale, "demos");

  // In a real app, you might save to database here
  const greeting = t("create-translator.greeting", {
    name: name || "World",
    _description: "Greeting message with name interpolation",
  });

  return { success: true, message: greeting };
}
