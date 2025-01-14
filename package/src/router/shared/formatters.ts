import memoize from "fast-memoize";
import type { Options } from "intl-messageformat";

export const formatters: Options["formatters"] = {
  getNumberFormat: memoize(
    (locale, opts) => new Intl.NumberFormat(locale, opts),
  ),
  getDateTimeFormat: memoize(
    (locale, opts) => new Intl.DateTimeFormat(locale, opts),
  ),
  getPluralRules: memoize((locale, opts) => new Intl.PluralRules(locale, opts)),
};
