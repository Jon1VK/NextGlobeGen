import { sharedI18nconfig } from "@repo/frontend/i18n.config";
import { mergeConfigs } from "next-globe-gen/config";

/**
 * Configuration for i18n in the web app.
 */
const config = mergeConfigs(sharedI18nconfig, {
  // You can add or override any specific settings for the web app here
});

export default config;
