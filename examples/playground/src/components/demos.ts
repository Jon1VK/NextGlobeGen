import type { NamespaceKey, Route } from "next-globe-gen";

export type Item = {
  route: Route;
  titleKey: NamespaceKey<"demos.client.titles">;
  descriptionKey: NamespaceKey<"demos.descriptions">;
};

export const demos: {
  titleKey: NamespaceKey<"demos.client.titles">;
  items: Item[];
}[] = [
  {
    titleKey: "routing",
    items: [
      {
        route: "/localized-pathnames",
        titleKey: "localized-pathnames",
        descriptionKey: "localized-pathnames",
      },
      {
        route: "/dynamic",
        titleKey: "dynamic",
        descriptionKey: "dynamic",
      },
      {
        route: "/markdown",
        titleKey: "markdown",
        descriptionKey: "markdown",
      },
      {
        route: "/[...catchAll]",
        titleKey: "not-found",
        descriptionKey: "not-found",
      },
      {
        route: "/locale-param",
        titleKey: "locale-param",
        descriptionKey: "locale-param",
      },
    ],
  },
  {
    titleKey: "messages",
    items: [
      {
        route: "/t-function",
        titleKey: "t-function",
        descriptionKey: "t-function",
      },
    ],
  },
  {
    titleKey: "components",
    items: [
      {
        route: "/link-component",
        titleKey: "link-component",
        descriptionKey: "link-component",
      },
      {
        route: "/form-component",
        titleKey: "form-component",
        descriptionKey: "form-component",
      },
    ],
  },
  {
    titleKey: "hooks",
    items: [
      {
        route: "/use-locale",
        titleKey: "use-locale",
        descriptionKey: "use-locale",
      },
      {
        route: "/use-translations",
        titleKey: "use-translations",
        descriptionKey: "use-translations",
      },
      {
        route: "/use-href",
        titleKey: "use-href",
        descriptionKey: "use-href",
      },
      {
        route: "/use-route",
        titleKey: "use-route",
        descriptionKey: "use-route",
      },
      {
        route: "/use-router",
        titleKey: "use-router",
        descriptionKey: "use-router",
      },
    ],
  },
  {
    titleKey: "misc",
    items: [],
  },
];
