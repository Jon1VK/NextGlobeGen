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
