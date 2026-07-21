import { expect, test } from "@playwright/test";

test("a finished book renders each page's independent illustration", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser is sufficient for deterministic storybook rendering.");
  const now = new Date().toISOString();
  await page.route("**/api/session/storybook-image-test", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        session: {
          id: "storybook-image-test",
          safetyIdentifier: "test",
          setup: { ageBand: "8-10", readingMode: "read-with-me", voiceEnabled: false, adultConfirmed: true },
          state: {
            title: "Three Paper Scenes",
            titleConfirmed: true,
            seed: "A three-scene story",
            hero: "a paper fox",
            heroDetail: "",
            world: "a paper garden",
            goal: "find a star",
            challenge: "cross a stream",
            nextBeat: "climb a hill",
            ending: "return the star",
            phase: "finished",
            contributions: [],
            pages: [
              { id: "one", pageNumber: 1, text: "The fox found a star.", imageUrl: "/images/wonderloom-welcome-hero.png", childEditable: true, status: "ready" },
              { id: "two", pageNumber: 2, text: "The fox crossed a stream.", imageUrl: "/images/wonderloom-empty-stage.png", childEditable: true, status: "ready" },
              { id: "three", pageNumber: 3, text: "The fox returned the star.", imageUrl: "/images/brand/wonderloom-fox-mark-v1.png", childEditable: true, status: "ready" },
            ],
            currentImageUrl: "/images/wonderloom-welcome-hero.png",
            visualPrompt: "",
            visualStatus: "ready",
            visualJobRevision: 3,
            visualError: "",
            guideQuestion: "Your story is ready.",
            suggestions: [],
            revision: 10,
            imageRevision: 3,
          },
          history: [],
          generationRecords: [],
          completedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      }),
    });
  });

  await page.goto("/story/storybook-image-test");
  await expect(page.getByRole("heading", { name: "Three Paper Scenes" })).toBeVisible();
  const image = page.locator(".storybook-scene");
  const next = page.getByRole("button", { name: "Next page" });

  await next.click();
  await expect(image).toHaveAttribute("src", "/images/wonderloom-welcome-hero.png");
  await next.click();
  await expect(image).toHaveAttribute("src", "/images/wonderloom-empty-stage.png");
  await next.click();
  await expect(image).toHaveAttribute("src", "/images/brand/wonderloom-fox-mark-v1.png");
});

test("a deployed legacy book recovers distinct saved page illustrations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One browser is sufficient for the live recovery check.");
  const sessionId = process.env.WONDERLOOM_STORY_ID;
  test.skip(!sessionId, "Set WONDERLOOM_STORY_ID to run the read-only deployed-book recovery check.");

  await page.goto(`/story/${sessionId}`);
  await expect(page.locator(".book-cover")).toBeVisible();
  const image = page.locator(".storybook-scene");
  const next = page.getByRole("button", { name: "Next page" });
  const pageImageUrls: string[] = [];
  for (let index = 0; index < 3; index += 1) {
    await next.click();
    pageImageUrls.push((await image.getAttribute("src")) ?? "");
  }
  expect(new Set(pageImageUrls).size).toBe(3);
});
