import { render, screen } from "@/test-utils";
import { expect, test } from "vitest";
import Page from "./page";

test("Page", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "NextGlobeGen Playground" }),
  ).toBeDefined();
});
