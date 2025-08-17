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

export function unflatten(obj: Record<string, string>) {
  const unflattened: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    let current = unflattened;
    key.split(".").forEach((part, i, parts) => {
      if (i === parts.length - 1) {
        current[part] = value;
        return;
      }
      if (!current[part]) current[part] = {};
      current = current[part] as Record<string, unknown>;
    });
  });
  return unflattened;
}
