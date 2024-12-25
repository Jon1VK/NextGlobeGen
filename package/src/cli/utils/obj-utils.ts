export function flatten(obj: object) {
  const flattened: Record<string, string> = {};
  function recurse(obj: object, prefix?: string) {
    Object.entries(obj).forEach(([key, value]) => {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") flattened[prefixedKey] = value;
      if (value && typeof value === "object") recurse(value, prefixedKey);
    });
  }
  recurse(obj);
  return flattened;
}
