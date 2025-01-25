import { expect, test } from "@playwright/test";

test("Root path redirects to default locale site", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/en");
  await expect(page).toHaveTitle("NextGlobeGen Playground");
});

test("Language switcher switches the locale correctly", async ({ page }) => {
  await page.goto("/en/localized-pathnames");
  await page.getByText("Suomeksi").click();
  await expect(page).toHaveURL("/fi/lokalisoidut-polut");
});
