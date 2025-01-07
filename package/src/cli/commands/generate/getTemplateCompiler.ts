import { readFileSync } from "fs";
import path from "path";
import type { Config, OriginRoute } from "~/cli/types";
import { getRouteName, isPageOriginRoute } from "~/cli/utils/route-utils";
import type { RouteType } from "./getOriginRoutes";

type PatternKey = (typeof PATTERN_KEYS)[number];
const PATTERN_KEYS = ["routeType", "relativePath", "locale"] as const;
const PATTERNS = Object.fromEntries(
  PATTERN_KEYS.map((key) => [key, `{{${key}}}`]),
) as Record<PatternKey, string>;

const componentTemplate = "".concat(
  "/* eslint-disable */\n",
  "// @ts-nocheck\n\n",
  'import { setLocale } from "next-globe-gen";\n',
  `import Origin${PATTERNS.routeType} from "${PATTERNS.relativePath}";\n\n`,
  `export default function ${PATTERNS.routeType}(props) {\n`,
  `\tsetLocale("${PATTERNS.locale}");\n`,
  `\treturn <Origin${PATTERNS.routeType} {...props} locale="${PATTERNS.locale}" />;\n}`,
);

const rootLayoutTemplate = "".concat(
  "/* eslint-disable */\n",
  "// @ts-nocheck\n\n",
  'import { setLocale } from "next-globe-gen";\n',
  'import { IntlProvider } from "next-globe-gen/client";\n',
  'import { clientMessages } from "next-globe-gen/messages";\n',
  `import Origin${PATTERNS.routeType} from "${PATTERNS.relativePath}";\n\n`,
  `export default function ${PATTERNS.routeType}(props) {\n`,
  `\tsetLocale("${PATTERNS.locale}");\n`,
  "\treturn (\n",
  `\t\t<IntlProvider locale="${PATTERNS.locale}" messages={clientMessages["${PATTERNS.locale}"]}>\n`,
  `\t\t\t<Origin${PATTERNS.routeType} {...props} locale="${PATTERNS.locale}" />\n`,
  "\t\t</IntlProvider>\n",
  "\t);\n}",
);

const errorTemplate = "".concat(
  "/* eslint-disable */\n",
  "// @ts-nocheck\n\n",
  '"use client"\n\n',
  `import Origin${PATTERNS.routeType} from "${PATTERNS.relativePath}";\n\n`,
  `export default function ${PATTERNS.routeType}(props) {\n`,
  `\treturn <Origin${PATTERNS.routeType} {...props} locale="${PATTERNS.locale}" />;\n}`,
);

const functionTemplate = "".concat(
  "/* eslint-disable */\n",
  "// @ts-nocheck\n\n",
  `import Origin${PATTERNS.routeType} from "${PATTERNS.relativePath}";\n\n`,
  `export default function ${PATTERNS.routeType}(params) {\n`,
  `\treturn Origin${PATTERNS.routeType}({ ...params, locale: "${PATTERNS.locale}" });\n}`,
);

const routeTypeTemplates: Record<Exclude<RouteType, "copy">, string> = {
  layout: componentTemplate,
  template: componentTemplate,
  page: componentTemplate,
  markdown: componentTemplate,
  default: componentTemplate,
  loading: withoutProps(componentTemplate),
  "not-found": withoutProps(componentTemplate),
  forbidden: withoutProps(componentTemplate),
  unauthorized: withoutProps(componentTemplate),
  error: errorTemplate,
  sitemap: functionTemplate,
  icon: functionTemplate,
  "apple-icon": functionTemplate,
  "opengraph-image": functionTemplate,
  "twitter-image": functionTemplate,
};

export function getTemplateCompiler(config: Config, originRoute: OriginRoute) {
  if (originRoute.type === "copy") return () => "";
  const originPath = path.join(config.routes.originDir, originRoute.path);
  const contents = readFileSync(originPath).toString();
  const originIsRootLayout = isRootLayout(originRoute, contents);
  let template = originIsRootLayout
    ? rootLayoutTemplate
    : routeTypeTemplates[originRoute.type];
  template = withMetadata(template, originRoute, contents, config);
  template = withReExport(template, contents, "viewport");
  template = withGenerateFn(template, contents, "generateViewport");
  template = withGenerateFn(template, contents, "generateStaticParams");
  template = withGenerateFn(template, contents, "generateSitemaps");
  template = withGenerateFn(template, contents, "generateImageMetadata");
  template = withRouteSegmentConfig(template, contents);
  return (params: Record<PatternKey, string>) => {
    return PATTERN_KEYS.reduce(
      (compiled, key) => compiled.replaceAll(PATTERNS[key], params[key]),
      template,
    );
  };
}

function isRootLayout(originRoute: OriginRoute, contents: string) {
  return originRoute.type === "layout" && /<html/.test(contents);
}

function withoutProps(template: string) {
  return template.replace(" {...props}", "").replace("props", "");
}

function withMetadata(
  template: string,
  originRoute: OriginRoute,
  originContents: string,
  config: Config,
) {
  const staticMetadataRegExp = new RegExp(`export const metadata`);
  const generateMetadataRegExp = new RegExp(
    `export ((async )?function|const) generateMetadata`,
  );
  const hasStaticMetadata = staticMetadataRegExp.test(originContents);
  const hasGenerateMetadata = generateMetadataRegExp.test(originContents);
  const injectLanguageAlternatesMetadata =
    isPageOriginRoute(originRoute) &&
    !config.routes.skipLanguageAlternatesMetadata;
  if (injectLanguageAlternatesMetadata) {
    return withLanguageAlternatesMetadata(
      template,
      originRoute,
      hasStaticMetadata,
      hasGenerateMetadata,
    );
  }
  if (hasGenerateMetadata) {
    return withGenerateFn(template, originContents, "generateMetadata");
  }
  if (hasStaticMetadata) {
    return withReExport(template, originContents, "metadata");
  }
  return template;
}

function withLanguageAlternatesMetadata(
  template: string,
  originRoute: OriginRoute,
  hasStaticMetadata: boolean,
  hasGenerateMetadata: boolean,
) {
  const [staticMetadataImport, staticMetadata] = [
    hasStaticMetadata && "metadata as metadataOrigin",
    hasStaticMetadata && "metadataOrigin",
  ];
  const [generateMetadataImport, generatedMetadata] = [
    hasGenerateMetadata && "generateMetadata as generateMetadataOrigin",
    hasGenerateMetadata &&
      `await generateMetadataOrigin({ ...props, locale: "${PATTERNS.locale}" }, parent)`,
  ];
  const metadataImport = generateMetadataImport || staticMetadataImport;
  const metadata = generatedMetadata || staticMetadata || "{}";
  const routeName = getRouteName(originRoute.path);
  return template.concat(
    '\n\nimport { withLanguageAlternates } from "next-globe-gen";',
    metadataImport
      ? `\nimport { ${metadataImport} } from "${PATTERNS.relativePath}";`
      : "",
    "\n\nexport async function generateMetadata(props, parent) {",
    `\n\tsetLocale("${PATTERNS.locale}");`,
    `\n\tconst metadata = ${metadata};`,
    `\n\treturn withLanguageAlternates("${routeName}", await props.params)(metadata);\n}`,
  );
}

function withReExport(template: string, originContents: string, name: string) {
  const regExp = new RegExp(`export const ${name}`);
  if (!regExp.test(originContents)) return template;
  return template.concat(
    `\n\nexport { ${name} } from "${PATTERNS.relativePath}";`,
  );
}

function withGenerateFn(
  template: string,
  originContents: string,
  fnName: string,
) {
  const regExp = new RegExp(`export ((async )?function|const) ${fnName}`);
  if (!regExp.test(originContents)) return template;
  const additionalParams = fnName === "generateMetadata" ? ", parent" : "";
  const shouldSetLocale =
    fnName === "generateMetadata" || fnName === "generateViewport";
  return template.concat(
    `\n\nimport { ${fnName} as ${fnName}Origin } from "${PATTERNS.relativePath}";`,
    `\n\nexport function ${fnName}(props${additionalParams}) {`,
    shouldSetLocale ? `\n\tsetLocale("${PATTERNS.locale}");` : "",
    `\n\treturn ${fnName}Origin({ ...props, locale: "${PATTERNS.locale}" }${additionalParams});\n}`,
  );
}

const routeSegmentConfigs = [
  "experimental_ppr",
  "dynamic",
  "dynamicParams",
  "revalidate",
  "fetchCache",
  "runtime",
  "preferredRegion",
  "maxDuration",
  "alt",
  "size",
  "contentType",
] as const;

function withRouteSegmentConfig(template: string, originContents: string) {
  let configs = "";
  routeSegmentConfigs.forEach((key) => {
    const regExp =
      key === "size"
        ? new RegExp(`export const size = {[^}]*};?`)
        : new RegExp(`export const ${key} = .*`);
    const match = originContents.match(regExp);
    if (!match) return;
    const config = match[0];
    configs = configs.concat(`${config}\n`);
  });
  if (configs === "") return template;
  return template.concat("\n\n", configs.trim());
}
