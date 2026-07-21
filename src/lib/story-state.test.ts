import { describe, expect, it } from "vitest";
import { addContribution, assignPageIllustrations, createInitialStoryState, makeFallbackPages, pageIllustrationUrls, progressForPhase, recoverCollapsedPageIllustrations, replacePage } from "@/lib/story-state";
import type { GenerationRecord } from "@/lib/types";

describe("story state", () => {
  it("records authorship without mutating the prior state", () => {
    const initial = createInitialStoryState();
    expect(initial.titleConfirmed).toBe(false);
    const next = addContribution(initial, { author: "child", kind: "idea", text: "  a moon fox  " });
    expect(initial.contributions).toHaveLength(0);
    expect(next.contributions[0]).toMatchObject({ author: "child", kind: "idea", text: "a moon fox", accepted: true });
    expect(next.revision).toBe(1);
  });

  it("creates exactly three editable fallback pages from canonical facts", () => {
    const state = { ...createInitialStoryState(), hero: "Mara the moth", world: "a library in the clouds", goal: "find the missing sunrise" };
    const pages = makeFallbackPages(state);
    expect(pages).toHaveLength(3);
    expect(pages.every((page) => page.childEditable)).toBe(true);
    expect(pages[0].text).toContain("Mara the moth");
    const revised = replacePage({ ...state, pages }, pages[0].id, "Mara chose a different door.");
    expect(revised.pages[0].text).toBe("Mara chose a different door.");
  });

  it("keeps progress monotonic through the specified phase sequence", () => {
    const values = (["seed", "reveal", "edit", "transform", "pages", "finished"] as const).map(progressForPhase);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(values.at(-1)).toBe(100);
  });

  it("maps the latest three independently generated scenes across three pages", () => {
    const records = [
      { id: "one", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "1", intent: "reveal", assetUrl: "/one.jpg" },
      { id: "one-edit", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "2", intent: "transform", assetUrl: "/one-edited.jpg" },
      { id: "two", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "3", intent: "advance", assetUrl: "/two.jpg" },
      { id: "three", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "4", intent: "advance", assetUrl: "/three.jpg" },
    ] satisfies GenerationRecord[];

    expect(pageIllustrationUrls(records, null)).toEqual(["/one-edited.jpg", "/two.jpg", "/three.jpg"]);
    const pages = makeFallbackPages(createInitialStoryState());
    expect(assignPageIllustrations(pages, records, null).map((page) => page.imageUrl)).toEqual([
      "/one-edited.jpg",
      "/two.jpg",
      "/three.jpg",
    ]);
  });

  it("recovers the best stored progressive frame when a legacy image job never reached final completion", () => {
    const records = [
      { id: "one", kind: "image", model: "gpt-image-2", status: "partial", startedAt: "1", intent: "reveal", partialAssetUrls: ["/one-sketch.jpg", "/one-details.jpg"] },
      { id: "two", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "2", intent: "transform", assetUrl: "/two.jpg" },
      { id: "three", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "3", intent: "reveal", assetUrl: "/three.jpg" },
    ] satisfies GenerationRecord[];
    expect(pageIllustrationUrls(records, null)).toEqual(["/one-details.jpg", "/two.jpg", "/three.jpg"]);
  });

  it("uses the newest available scene for pages that do not yet have an independent image", () => {
    const records = [
      { id: "one", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "1", intent: "reveal", assetUrl: "/one.jpg" },
      { id: "two", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "2", intent: "advance", assetUrl: "/two.jpg" },
    ] satisfies GenerationRecord[];
    expect(pageIllustrationUrls(records, null)).toEqual(["/one.jpg", "/two.jpg", "/two.jpg"]);
  });

  it("reuses a single available illustration across all three pages", () => {
    const records = [
      { id: "one", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "1", intent: "reveal", assetUrl: "/one.jpg" },
    ] satisfies GenerationRecord[];
    const pages = makeFallbackPages(createInitialStoryState());

    expect(assignPageIllustrations(pages, records, null).map((page) => page.imageUrl)).toEqual([
      "/one.jpg",
      "/one.jpg",
      "/one.jpg",
    ]);
  });

  it("fills a missing restored page with the newest available illustration", () => {
    const state = createInitialStoryState();
    const pages = makeFallbackPages(state).map((page, index) => ({
      ...page,
      imageUrl: index === 0 ? "/one.jpg" : index === 1 ? "/two.jpg" : null,
    }));
    const records = [
      { id: "one", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "1", intent: "reveal", assetUrl: "/one.jpg" },
      { id: "two", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "2", intent: "advance", assetUrl: "/two.jpg" },
    ] satisfies GenerationRecord[];

    expect(recoverCollapsedPageIllustrations(pages, records, "/two.jpg").map((page) => page.imageUrl)).toEqual([
      "/one.jpg",
      "/two.jpg",
      "/two.jpg",
    ]);
  });

  it("repairs legacy books whose three page images collapsed to the final scene", () => {
    const state = createInitialStoryState();
    const pages = makeFallbackPages(state).map((page) => ({ ...page, imageUrl: "/three.jpg" }));
    const records = [
      { id: "one", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "1", intent: "reveal", assetUrl: "/one.jpg" },
      { id: "two", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "2", intent: "advance", assetUrl: "/two.jpg" },
      { id: "three", kind: "image", model: "gpt-image-2", status: "complete", startedAt: "3", intent: "advance", assetUrl: "/three.jpg" },
    ] satisfies GenerationRecord[];

    expect(recoverCollapsedPageIllustrations(pages, records, "/three.jpg").map((page) => page.imageUrl)).toEqual([
      "/one.jpg",
      "/two.jpg",
      "/three.jpg",
    ]);
  });
});
