import { beforeEach, describe, expect, it } from "vitest";
import { addContribution } from "@/lib/story-state";
import { clearSessionsForTest, commitVisualIfCurrent, completeSpeechGeneration, completeTextGeneration, createSession, findCompletedSpeech, getSession, listSavedStories, markSessionComplete, mutateSession, recordVisualPartial, startSpeechGeneration, startTextGeneration, startVisualJob, undoSession } from "@/server/session-store";

const setup = { ageBand: "8-10" as const, readingMode: "read-with-me" as const, voiceEnabled: true, adultConfirmed: true as const };

describe("session store", () => {
  beforeEach(() => clearSessionsForTest());

  it("returns clones so clients cannot mutate canonical server state", () => {
    const created = createSession(setup);
    created.state.hero = "changed outside";
    expect(getSession(created.id)?.state.hero).toBe("");
  });

  it("can undo the latest canonical change", () => {
    const created = createSession(setup);
    mutateSession(created.id, (state) => addContribution({ ...state, hero: "a paper dragon" }, { author: "child", kind: "idea", text: "a paper dragon" }));
    expect(getSession(created.id)?.state.hero).toBe("a paper dragon");
    const undone = undoSession(created.id);
    expect(undone?.state.hero).toBe("");
    expect(undone?.state.contributions).toHaveLength(0);
  });

  it("keeps drafts out of the saved-story shelf until a complete book is explicitly finished", () => {
    const created = createSession(setup);
    expect(listSavedStories()).toEqual([]);
    expect(markSessionComplete(created.id)).toBeNull();

    mutateSession(created.id, (state) => ({
      ...state,
      title: "The Paper Moon",
      titleConfirmed: true,
      phase: "finished",
      pages: [
        { id: "one", pageNumber: 1, text: "A paper moon rose.", imageUrl: null, childEditable: true, status: "ready" },
        { id: "two", pageNumber: 2, text: "Mina followed its silver path.", imageUrl: null, childEditable: true, status: "ready" },
        { id: "three", pageNumber: 3, text: "At dawn, she carried its glow home.", imageUrl: null, childEditable: true, status: "ready" },
      ],
    }));

    // A model or mutation setting `phase` alone is not the user-facing finish action.
    expect(listSavedStories()).toEqual([]);

    const completed = markSessionComplete(created.id);
    expect(completed?.completedAt).toBeTruthy();
    expect(listSavedStories()).toEqual([
      expect.objectContaining({
        id: created.id,
        title: "The Paper Moon",
        phase: "finished",
        pageCount: 3,
      }),
    ]);
  });

  it("allows a current image job to finish after unrelated story changes", () => {
    const created = createSession(setup);
    const started = startVisualJob(created.id, created.state.revision, "reveal", "a blue world");
    recordVisualPartial(created.id, started.jobRevision!, "/generated/example-partial.jpg");
    mutateSession(created.id, (state) => addContribution(state, { author: "child", kind: "revision", text: "make it blue" }));
    const result = commitVisualIfCurrent(created.id, started.jobRevision!, "/generated/example.jpg", "a blue world");
    expect(result.stale).toBe(false);
    expect(result.session?.state.currentImageUrl).toBe("/generated/example.jpg");
    expect(result.session?.generationRecords[0]).toMatchObject({
      kind: "image",
      model: "gpt-image-2",
      status: "complete",
      prompt: "a blue world",
      partialAssetUrls: ["/generated/example-partial.jpg"],
      assetUrl: "/generated/example.jpg",
    });
  });

  it("rejects an older image job after a newer visual request begins", () => {
    const created = createSession(setup);
    const first = startVisualJob(created.id, created.state.revision);
    const second = startVisualJob(created.id, created.state.revision);
    const stale = commitVisualIfCurrent(created.id, first.jobRevision!, "/generated/old.jpg", "old prompt");
    expect(stale.stale).toBe(true);
    const current = commitVisualIfCurrent(created.id, second.jobRevision!, "/generated/new.jpg", "new prompt");
    expect(current.stale).toBe(false);
    expect(current.session?.state.currentImageUrl).toBe("/generated/new.jpg");
  });

  it("updates pages sharing the canvas scene without replacing distinct page art", () => {
    const created = createSession(setup);
    mutateSession(created.id, (state) => ({
      ...state,
      currentImageUrl: "/generated/shared-old.jpg",
      pages: [
        { id: "one", pageNumber: 1, text: "Shared scene", imageUrl: "/generated/shared-old.jpg", childEditable: true, status: "ready" },
        { id: "two", pageNumber: 2, text: "Missing scene", imageUrl: null, childEditable: true, status: "ready" },
        { id: "three", pageNumber: 3, text: "Distinct scene", imageUrl: "/generated/page-three.jpg", childEditable: true, status: "ready" },
      ],
    }));
    const current = getSession(created.id)!;
    const started = startVisualJob(created.id, current.state.revision);
    const result = commitVisualIfCurrent(created.id, started.jobRevision!, "/generated/shared-new.jpg", "new prompt");

    expect(result.session?.state.pages.map((page) => page.imageUrl)).toEqual([
      "/generated/shared-new.jpg",
      "/generated/shared-new.jpg",
      "/generated/page-three.jpg",
    ]);
  });

  it("keeps reusable Coral narration records with the saved story", () => {
    const created = createSession(setup);
    const recordId = startSpeechGeneration(created.id, {
      target: "page-1",
      sourceHash: "stable-source-hash",
      prompt: "Once upon a paper moon.",
      instructions: "Narrate warmly.",
    });
    completeSpeechGeneration(created.id, recordId!, "/generated/story/audio/page-1.mp3");

    expect(findCompletedSpeech(created.id, "stable-source-hash")).toMatchObject({
      kind: "speech",
      model: "gpt-4o-mini-tts",
      status: "complete",
      assetUrl: "/generated/story/audio/page-1.mp3",
    });
  });

  it("keeps the guide and page-composition provenance with the story", () => {
    const created = createSession(setup);
    const recordId = startTextGeneration(created.id, {
      kind: "composition",
      model: "gpt-5.6-luna",
      prompt: "Compose the child's three-page story now.",
      instructions: "Preserve the child's canonical facts.",
      target: "three-page-story",
    });
    completeTextGeneration(created.id, recordId!, JSON.stringify({ usedFallback: false, pages: [{ pageNumber: 1, text: "A paper moon rose." }] }));

    expect(getSession(created.id)?.generationRecords[0]).toMatchObject({
      kind: "composition",
      model: "gpt-5.6-luna",
      status: "complete",
      target: "three-page-story",
      result: expect.stringContaining("paper moon"),
    });
  });
});
