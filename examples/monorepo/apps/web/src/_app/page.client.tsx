"use client";

import { FeatureCard } from "@repo/frontend/components/FeatureCard";
import { WelcomeHero } from "@repo/frontend/components/WelcomeHero";
import { Globe, Rocket, Zap } from "lucide-react";
import { useTranslations } from "next-globe-gen";

export default function InteractivePage() {
  const t = useTranslations("home");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-8">
      <WelcomeHero
        onGetStarted={() =>
          alert(
            t("actions.getStartedClicked", {
              _description: "Alert message when get started is clicked",
              _defaultMessage: "Get Started button clicked!",
            }),
          )
        }
        onViewDocs={() => window.open("https://next-globe-gen.dev", "_blank")}
        className="w-full max-w-2xl"
      />

      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
        <FeatureCard
          icon={Globe}
          title={t("features.i18n.title", {
            _description: "Title of the i18n feature card",
            _defaultMessage: "Internationalization (i18n)",
          })}
          description={t("features.i18n.description", {
            _description: "Description of the i18n feature card",
            _defaultMessage:
              "Built-in support for multiple languages and locales using NextGlobeGen.",
          })}
          status="popular"
          onLearnMore={() =>
            alert(
              t("actions.learnMoreI18n", {
                _description:
                  "Alert message when learn more is clicked for i18n feature",
                _defaultMessage: "Learn More button clicked for i18n feature!",
              }),
            )
          }
        />
        <FeatureCard
          icon={Rocket}
          title={t("features.monorepo.title", {
            _description: "Title of the monorepo feature card",
            _defaultMessage: "Monorepo Support",
          })}
          description={t("features.monorepo.description", {
            _description: "Description of the monorepo feature card",
            _defaultMessage:
              "Seamless integration and shared components across multiple apps in a monorepo setup.",
          })}
          status="new"
          onLearnMore={() =>
            alert(
              t("actions.learnMoreMonorepo", {
                _description:
                  "Alert message when learn more is clicked for monorepo feature",
                _defaultMessage:
                  "Learn More button clicked for monorepo feature!",
              }),
            )
          }
        />
        <FeatureCard
          icon={Zap}
          title={t("features.typeSafety.title", {
            _description: "Title of the type safety feature card",
            _defaultMessage: "Type Safety",
          })}
          description={t("features.typeSafety.description", {
            _description: "Description of the type safety feature card",
            _defaultMessage:
              "Enhanced developer experience with type-safe APIs and components.",
          })}
          status="comingSoon"
          onLearnMore={() =>
            alert(
              t("actions.learnMoreTypeSafety", {
                _description:
                  "Alert message when learn more is clicked for type safety feature",
                _defaultMessage:
                  "Learn More button clicked for type safety feature!",
              }),
            )
          }
        />
      </div>
    </div>
  );
}
