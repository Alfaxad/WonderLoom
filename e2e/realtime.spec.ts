import { expect, test } from "@playwright/test";

test("the browser connects and can interrupt the Realtime Creative Guide", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One live Realtime connection is sufficient for the cross-browser suite.");
  const context = await browser.newContext({
    permissions: ["microphone"],
  });
  const page = await context.newPage();
  const tokenResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/realtime/session") && response.request().method() === "POST");
  const guardedResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/safety/text") && response.request().method() === "POST");
  await page.goto("/setup");
  await page.getByRole("checkbox", { name: /I’m a grown-up/i }).check();
  await page.getByRole("button", { name: /Open the studio/i }).click();
  await page.getByRole("button", { name: /Start voice/i }).click();
  const tokenResponse = await tokenResponsePromise;
  expect(tokenResponse.ok()).toBe(true);
  expect(tokenResponse.headers()["x-wonderloom-realtime-model"]).toBe("gpt-realtime-2.1-mini");
  expect(tokenResponse.headers()["x-wonderloom-realtime-voice"]).toBe("marin");
  await expect(page.getByText(/Listening for your idea|Creative Guide is speaking|Stopped—your turn/i)).toBeVisible({ timeout: 30_000 });
  expect((await guardedResponsePromise).ok()).toBe(true);
  await page.getByRole("button", { name: "Stop voice" }).click();
  await expect(page.getByText(/Voice is off/i)).toBeVisible();
  await context.close();
});
