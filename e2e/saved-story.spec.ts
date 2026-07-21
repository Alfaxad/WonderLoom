import { expect, test } from "@playwright/test";

const savedSessionId = process.env.WONDERLOOM_TEST_SESSION_ID;

test("a saved book exposes its editable title, Coral narration, and generation provenance", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop pass covers the saved-book controls.");
  test.skip(!savedSessionId, "Set WONDERLOOM_TEST_SESSION_ID to a persisted local story.");

  await page.goto(`/story/${savedSessionId}`);
  await expect(page.getByRole("heading", { name: "The Moonlight Map" })).toBeVisible();
  await page.getByRole("button", { name: /Change the title/i }).click();
  await expect(page.getByLabel("Change your book title")).toHaveValue("The Moonlight Map");
  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByText("AI-generated narration · Coral voice")).toBeVisible();
  await page.getByRole("button", { name: /How this was made/i }).click();
  await expect(page.getByRole("heading", { name: "Generation process" })).toBeVisible();
  await expect(page.getByText("Page arrangement", { exact: true })).toBeVisible();
  await expect(page.getByText("Coral narration", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close summary" }).click();

  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Your story shelf." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Moonlight Map" })).toBeVisible();
});
