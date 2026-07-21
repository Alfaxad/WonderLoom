import { expect, test } from "@playwright/test";

test("welcome and setup remain legible without horizontal overflow", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /A Tiny Studio For Your Big Imagination/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Begin a story/i })).toBeVisible();
  await expect.poll(() => page.locator(".logo-mark img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  await page.screenshot({ path: `/tmp/wonderloom-${testInfo.project.name}-welcome.png`, fullPage: true });

  await page.getByRole("link", { name: /Begin a story/i }).click();
  await expect(page.getByRole("heading", { name: /Safe studio Setup/i })).toBeVisible();
  await expect(page.getByText(/No raw audio is stored/i)).toBeVisible();
  expect(errors).toEqual([]);
});

test("adult setup opens a keyboard-usable studio with explicit AI identity", async ({ page }, testInfo) => {
  await page.goto("/setup");
  await page.getByRole("checkbox", { name: /Allow microphone/i }).uncheck();
  await page.getByRole("checkbox", { name: /I’m a grown-up/i }).check();
  await page.getByRole("button", { name: /Open the studio/i }).click();
  await expect(page).toHaveURL(/\/studio\?session=/);
  await expect(page.getByText("Creative Guide", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/AI Realtime voice/i)).toBeVisible();
  await expect(page.getByLabel("Add your next idea")).toBeVisible();
  await expect(page.locator(".idea-shelf:visible").getByText(/The Guide’s ideas stay suggestions/i)).toBeVisible();
  await expect(page.locator(".bar-visualizer i")).toHaveCount(15);
  await expect(page.locator(".canvas-static-art")).toHaveJSProperty("complete", true);
  await expect.poll(() => page.locator(".canvas-static-art").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const canvasBox = await page.locator(".living-canvas").boundingBox();
  const voiceBox = await page.locator(".voice-dock").boundingBox();
  expect(canvasBox).not.toBeNull();
  expect(voiceBox).not.toBeNull();
  expect(voiceBox!.y).toBeGreaterThanOrEqual(canvasBox!.y + canvasBox!.height);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  await page.screenshot({ path: `/tmp/wonderloom-${testInfo.project.name}-studio.png`, fullPage: true });
  const sessionId = new URL(page.url()).searchParams.get("session");
  if (sessionId) await page.request.delete(`/api/session/${sessionId}`);
});

test("reduced motion preserves the complete welcome content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /A story made in three gentle moves/i })).toBeVisible();
  const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  expect(reduced).toBe(true);
});
