import { describe, expect, test } from "vitest";
import { toPascalCase } from "./string-utils";

describe("toPascalCase()", () => {
  test("works correctly", () => {
    const pascalCased = toPascalCase("not-found");
    expect(pascalCased).toBe("NotFound");
  });
});
