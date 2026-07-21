import { describe, expect, it } from "vitest";
import { addContribution, createInitialStoryState, makeFallbackPages, progressForPhase, replacePage } from "@/lib/story-state";

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
});
