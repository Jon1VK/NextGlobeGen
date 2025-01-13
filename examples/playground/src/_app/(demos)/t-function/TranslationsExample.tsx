import { useTranslations } from "next-globe-gen";

export default function TranslationsExample() {
  const t = useTranslations("demos.t-function");
  const currentDate = new Date();

  return (
    <ul>
      <li>{t("simple")}</li>
      <li>
        {t("complex", {
          b: (children) => <b>{children}</b>,
          host: "NextGlobeGen",
          gender_of_host: "other",
          guest: "Jon1VK",
          num_guests: 5,
        })}
      </li>
      <li>{t("withRichText", { b: (children) => <b>{children}</b> })}</li>
      <li>{t("escaped")}</li>
      <li>{t("withString", { value: "abc" })}</li>
      <li>{t("withNumber", { value: 12.34 })}</li>
      <li>{t("withInteger", { value: 12.34 })}</li>
      <li>{t("withCurrency", { value: 12.34 })}</li>
      <li>{t("withPercent", { value: 12.34 })}</li>
      <li>{t("withDate", { value: currentDate })}</li>
      <li>{t("withDateShort", { value: currentDate })}</li>
      <li>{t("withDateMedium", { value: currentDate })}</li>
      <li>{t("withDateLong", { value: currentDate })}</li>
      <li>{t("withDateFull", { value: currentDate })}</li>
      <li>{t("withTime", { value: currentDate })}</li>
      <li>{t("withTimeShort", { value: currentDate })}</li>
      <li>{t("withTimeMedium", { value: currentDate })}</li>
      <li>{t("withTimeLong", { value: currentDate })}</li>
      <li>{t("withTimeFull", { value: currentDate })}</li>
    </ul>
  );
}
