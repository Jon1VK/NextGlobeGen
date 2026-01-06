import { useTranslations } from "next-globe-gen";

export default function TranslationsExample() {
  const t = useTranslations("demos.t-function");
  const currentDate = new Date();

  return (
    <ul>
      <li>
        {t("simple", {
          _description: "Basic message without any interpolation",
        })}
      </li>
      <li>
        {t("plural", {
          count: 3,
          _description: "Demonstrates plural forms based on count",
        })}
      </li>
      <li>
        {t("complex", {
          b: (children) => <b>{children}</b>,
          host: "NextGlobeGen",
          gender_of_host: "other",
          guest: "Jon1VK",
          num_guests: 5,
          _description:
            "Complex example with rich text, plurals, and multiple variables",
        })}
      </li>
      <li>
        {t("withRichText", {
          b: (children) => <b>{children}</b>,
          _description: "Demonstrates embedding HTML tags in messages",
        })}
      </li>
      <li>
        {t("escaped", {
          _description: "Shows how to escape special characters in ICU syntax",
        })}
      </li>
      <li>
        {t("withString", {
          value: "abc",
          _description: "String interpolation example",
        })}
      </li>
      <li>
        {t("withNumber", {
          value: 12.34,
          _description:
            "Number formatting with locale-specific decimal separator",
        })}
      </li>
      <li>
        {t("withInteger", {
          value: 12.34,
          _description: "Number formatting truncated to integer",
        })}
      </li>
      <li>
        {t("withCurrency", {
          value: 12.34,
          _description: "Currency formatting with locale-specific symbol",
        })}
      </li>
      <li>
        {t("withPercent", {
          value: 12.34,
          _description: "Percentage formatting",
        })}
      </li>
      <li>
        {t("withDate", {
          value: currentDate,
          _description: "Default date formatting",
        })}
      </li>
      <li>
        {t("withDateShort", {
          value: currentDate,
          _description: "Short date format (e.g., 1/5/26)",
        })}
      </li>
      <li>
        {t("withDateMedium", {
          value: currentDate,
          _description: "Medium date format",
        })}
      </li>
      <li>
        {t("withDateLong", {
          value: currentDate,
          _description: "Long date format with full month name",
        })}
      </li>
      <li>
        {t("withDateFull", {
          value: currentDate,
          _description: "Full date format with weekday",
        })}
      </li>
      <li>
        {t("withTime", {
          value: currentDate,
          _description: "Default time formatting",
        })}
      </li>
      <li>
        {t("withTimeShort", {
          value: currentDate,
          _description: "Short time format (hours and minutes)",
        })}
      </li>
      <li>
        {t("withTimeMedium", {
          value: currentDate,
          _description: "Medium time format",
        })}
      </li>
      <li>
        {t("withTimeLong", {
          value: currentDate,
          _description: "Long time format with timezone",
        })}
      </li>
      <li>
        {t("withTimeFull", {
          value: currentDate,
          _description: "Full time format with full timezone name",
        })}
      </li>
    </ul>
  );
}
