import { Button } from "@repo/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/frontend/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "next-globe-gen";

export interface WelcomeHeroProps {
  /** Callback when get started button is clicked */
  onGetStarted?: () => void;
  /** Callback when documentation button is clicked */
  onViewDocs?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * WelcomeHero - A shared welcome hero component demonstrating NextGlobeGen monorepo support.
 *
 * This component uses translations from the "shared.welcome" namespace, which are
 * defined in the shared frontend package and can be used across all apps
 * in the monorepo.
 *
 * @example
 * ```tsx
 * import { WelcomeHero } from "@repo/frontend/components/WelcomeHero";
 *
 * <WelcomeHero
 *   onGetStarted={() => router.push("/dashboard")}
 *   onViewDocs={() => window.open("https://next-globe-gen.dev", "_blank")}
 * />
 * ```
 */
export function WelcomeHero({
  onGetStarted,
  onViewDocs,
  className,
}: WelcomeHeroProps) {
  const t = useTranslations("shared.welcome");

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {t("title", {
            _description: "Title of the welcome hero",
            _defaultMessage: "Welcome to NextGlobeGen!",
          })}
        </CardTitle>
        <CardDescription className="text-base">
          {t("description", {
            _description: "Description of the welcome hero",
            _defaultMessage: "Start building your monorepo with NextGlobeGen.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-3">
        <Button onClick={onGetStarted}>
          {t("getStarted", {
            _description: "Label for the get started button",
            _defaultMessage: "Get Started",
          })}
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
        <Button variant="outline" onClick={onViewDocs}>
          <BookOpen className="size-4" data-icon="inline-start" />
          {t("documentation", {
            _description: "Label for the documentation button",
            _defaultMessage: "Documentation",
          })}
        </Button>
      </CardContent>
    </Card>
  );
}
