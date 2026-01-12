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
        onGetStarted={() => alert(t("actions.getStartedClicked"))}
        onViewDocs={() => window.open("https://next-globe-gen.dev", "_blank")}
        className="w-full max-w-2xl"
      />

      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
        <FeatureCard
          icon={Globe}
          title={t("features.i18n.title")}
          description={t("features.i18n.description")}
          status="popular"
          onLearnMore={() => alert(t("actions.learnMoreI18n"))}
        />
        <FeatureCard
          icon={Rocket}
          title={t("features.monorepo.title")}
          description={t("features.monorepo.description")}
          status="new"
          onLearnMore={() => alert(t("actions.learnMoreMonorepo"))}
        />
        <FeatureCard
          icon={Zap}
          title={t("features.typeSafety.title")}
          description={t("features.typeSafety.description")}
          status="comingSoon"
          onLearnMore={() => alert(t("actions.learnMoreTypeSafety"))}
        />
      </div>
    </div>
  );
}
