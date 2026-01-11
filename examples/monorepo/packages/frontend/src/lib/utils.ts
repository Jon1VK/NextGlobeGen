import { cva as _cva, cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export type { VariantProps } from "class-variance-authority";

export const cva: typeof _cva = (...args) => {
  const variants = _cva(...args);
  return (...props) => twMerge(variants(...props));
};

export const cn: typeof cx = (...inputs) => twMerge(cx(...inputs));
