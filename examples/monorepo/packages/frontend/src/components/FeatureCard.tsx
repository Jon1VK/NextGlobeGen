"use client";

import { Badge } from "@repo/frontend/components/ui/badge";
import { Button } from "@repo/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/frontend/components/ui/card";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-globe-gen";

export type FeatureStatus = "new" | "popular" | "comingSoon";

export interface FeatureCardProps {
  /** Icon to display in the card header */
  icon?: LucideIcon;
  /** Custom title - if not provided, uses shared.featureCard.title translation */
  title?: string;
  /** Custom description - if not provided, uses shared.featureCard.description translation */
  description?: string;
  /** Status badge to show */
  status?: FeatureStatus;
  /** Callback when learn more button is clicked */
  onLearnMore?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FeatureCard - A shared component demonstrating NextGlobeGen monorepo support.
 *
 * This component uses translations from the "shared" namespace, which are
 * defined in the shared frontend package and can be used across all apps
 * in the monorepo.
 *
 * @example
 * ```tsx
 * import { FeatureCard } from "@repo/frontend/components/FeatureCard";
 * import { Rocket } from "lucide-react";
 *
 * <FeatureCard
 *   icon={Rocket}
 *   status="new"
 *   onLearnMore={() => console.log("Learn more clicked")}
 * />
 * ```
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  status,
  onLearnMore,
  className,
}: FeatureCardProps) {
  const t = useTranslations("shared.featureCard");

  const statusVariants: Record<
    FeatureStatus,
    "default" | "secondary" | "outline"
  > = {
    new: "default",
    popular: "secondary",
    comingSoon: "outline",
  };

  const statusLabels: Record<FeatureStatus, string> = {
    new: t("status.new", {
      _description: "Label for new features",
      _defaultMessage: "New",
    }),
    popular: t("status.popular", {
      _description: "Label for popular features",
      _defaultMessage: "Popular",
    }),
    comingSoon: t("status.comingSoon", {
      _description: "Label for features that are coming soon",
      _defaultMessage: "Coming Soon",
    }),
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-5 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>
              {title ??
                t("title", {
                  _description: "Title of the feature card",
                  _defaultMessage: "Feature Card",
                })}
            </CardTitle>
            {status && (
              <Badge variant={statusVariants[status]} className="mt-1">
                {statusLabels[status]}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="mt-2">
          {description ??
            t("description", {
              _description: "Description of the feature card",
              _defaultMessage:
                "This is a shared feature card component from the monorepo frontend package.",
            })}
        </CardDescription>
      </CardHeader>
      <CardContent>{/* Additional content can be added here */}</CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" onClick={onLearnMore}>
          {t("learnMore", {
            _description: "Label for the learn more button",
            _defaultMessage: "Learn More",
          })}
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
