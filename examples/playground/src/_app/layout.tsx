import AddressBar from "@/components/AddressBar";
import Footer from "@/components/Footer";
import GlobalNav from "@/components/GlobalNav";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { getTranslations, useLocale } from "next-globe-gen";
import type { ReactNode } from "react";

export function generateMetadata(): Metadata {
  const t = getTranslations("home");
  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();

  return (
    <html lang={locale} className="[color-scheme:dark]">
      <body className="overflow-y-scroll bg-gray-1100 bg-[url('/grid.svg')] pb-36">
        <GlobalNav />
        <div className="lg:pl-72">
          <div className="mx-auto max-w-4xl space-y-8 px-2 pt-20 lg:px-8 lg:py-8">
            <AddressBar />
            <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
              <div className="rounded-lg bg-black p-3.5 lg:p-6">{children}</div>
            </div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
