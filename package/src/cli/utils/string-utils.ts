export function toPascalCase(s: string) {
  const pascal = s
    .match(/[^\W_]+/g)
    ?.map((m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
    .join("");
  return pascal ?? s;
}
