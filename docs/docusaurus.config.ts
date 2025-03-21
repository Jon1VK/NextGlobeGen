import type * as Preset from "@docusaurus/preset-classic";
import npm2yarn from "@docusaurus/remark-plugin-npm2yarn";
import type { Config } from "@docusaurus/types";
import autoprefixer from "autoprefixer";
import { themes as prismThemes } from "prism-react-renderer";
import tailwindcssPlugin from "tailwindcss";

const config: Config = {
  title: "NextGlobeGen",
  tagline: "Route Localizer for Next.js App Router",
  favicon: "img/favicon.ico",

  // Deployment config
  url: "https://next-globe-gen.dev",
  baseUrl: "/",
  trailingSlash: false,
  organizationName: "Jon1VK",
  projectName: "NextGlobeGen",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Used to set useful metadata like html lang
  i18n: { defaultLocale: "en", locales: ["en"] },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          remarkPlugins: [[npm2yarn, { sync: true }]],
        },
        theme: { customCss: "./src/css/custom.css" },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    algolia: {
      appId: "E11EWTG4EM",
      apiKey: "12b2ce7193b489c2f29f5db53d6964f8",
      indexName: "next-globe-gen",
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
    },
    colorMode: { defaultMode: "dark" },
    tableOfContents: {
      maxHeadingLevel: 4,
    },
    navbar: {
      title: "NextGlobeGen",
      logo: {
        alt: "NextGlobeGen Logo",
        src: "img/logo.svg",
        srcDark: "img/logo.dark.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "sidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/Jon1VK/NextGlobeGen",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      logo: {
        alt: "NextGlobeGen Logo",
        src: "img/logo.svg",
        srcDark: "img/logo.dark.svg",
        height: 32,
        href: "/",
      },
      links: [
        { label: "Docs", to: "/docs" },
        { label: "GitHub", href: "https://github.com/Jon1VK/NextGlobeGen" },
      ],
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    function tailwindcss() {
      return {
        name: "tailwindcss",
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(tailwindcssPlugin);
          postcssOptions.plugins.push(autoprefixer);
          return postcssOptions;
        },
      };
    },
  ],
};

export default config;
