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
    items: [],
  },
  {
    titleKey: "components",
    items: [],
  },
  {
    titleKey: "hooks",
    items: [],
  },
  {
    titleKey: "misc",
    items: [],
  },
];
