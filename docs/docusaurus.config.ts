import type * as Preset from "@docusaurus/preset-classic";
import npm2yarn from "@docusaurus/remark-plugin-npm2yarn";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "NextGlobeGen",
  tagline: "Route Localizer for Next.js App Router",
  favicon: "favicon.ico",

  // Deployment config
  url: "https://Jon1VK.github.io",
  baseUrl: "/NextGlobeGen",
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
          editUrl: "https://github.com/Jon1VK/NextGlobeGen/tree/main/docs",
          remarkPlugins: [[npm2yarn, { sync: true }]],
        },
        theme: { customCss: "./src/css/custom.css" },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    prism: { theme: prismThemes.nightOwl },
    colorMode: { defaultMode: "dark" },
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
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],
};

export default config;
