import { getTranslations } from "next-globe-gen";
import { notFound } from "next/navigation";

export function generateMetadata() {
  const t = getTranslations();
  return { title: t("demos.client.titles.not-found") };
}

export default function CatchAllPage() {
  notFound();
}
