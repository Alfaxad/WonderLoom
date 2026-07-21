import type { Contribution, GenerationRecord, StoryPage, StoryPhase, StoryState } from "@/lib/types";

export const PHASE_ORDER: StoryPhase[] = ["seed", "reveal", "edit", "transform", "pages", "finished"];

export function hasCompleteBookContent(state: StoryState): boolean {
  return state.titleConfirmed
    && state.title.trim().length > 0
    && state.title !== "An Untold Wonder"
    && state.pages.length === 3
    && state.pages.every((page) => page.status === "ready" && page.text.trim().length > 0);
}

export function isFinishedBook(state: StoryState): boolean {
  return state.phase === "finished" && hasCompleteBookContent(state);
}

export function createInitialStoryState(): StoryState {
  return {
    title: "An Untold Wonder",
    titleConfirmed: false,
    seed: "",
    hero: "",
    heroDetail: "",
    world: "",
    goal: "",
    challenge: "",
    nextBeat: "",
    ending: "",
    phase: "seed",
    contributions: [],
    pages: [],
    currentImageUrl: null,
    visualPrompt: "",
    visualStatus: "idle",
    visualJobRevision: 0,
    visualError: "",
    guideQuestion: "What tiny idea should we begin with?",
    suggestions: ["A creature", "A curious place", "A surprising object"],
    revision: 0,
    imageRevision: 0,
  };
}

export function cloneStoryState(state: StoryState): StoryState {
  return structuredClone(state);
}

export function addContribution(
  state: StoryState,
  input: Pick<Contribution, "author" | "kind" | "text"> & { accepted?: boolean },
): StoryState {
  const contribution: Contribution = {
    id: crypto.randomUUID(),
    author: input.author,
    kind: input.kind,
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
    accepted: input.accepted ?? true,
  };

  return {
    ...state,
    contributions: [...state.contributions, contribution],
    revision: state.revision + 1,
  };
}

export function replacePage(state: StoryState, pageId: string, text: string): StoryState {
  const pages = state.pages.map((page) =>
    page.id === pageId ? { ...page, text: text.trim(), status: "ready" as const } : page,
  );
  return { ...state, pages, revision: state.revision + 1 };
}

export function makeFallbackPages(state: StoryState): StoryPage[] {
  const hero = state.hero || "a brave little wonder";
  const world = state.world || "a place no map had found";
  const goal = state.goal || "follow a curious glimmer";
  const challenge = state.challenge || "the path changed shape";
  const ending = state.ending || state.nextBeat || "a new possibility appeared";

  return [
    {
      id: crypto.randomUUID(),
      pageNumber: 1,
      text: `${hero} lived in ${world}. One day, ${hero} decided to ${goal}.`,
      imageUrl: state.currentImageUrl,
      childEditable: true,
      status: "draft",
    },
    {
      id: crypto.randomUUID(),
      pageNumber: 2,
      text: `But ${challenge}. Instead of giving up, ${hero} tried something wonderfully their own.`,
      imageUrl: state.currentImageUrl,
      childEditable: true,
      status: "draft",
    },
    {
      id: crypto.randomUUID(),
      pageNumber: 3,
      text: `Then ${ending}. The world was different now—and so was the story they had made.`,
      imageUrl: state.currentImageUrl,
      childEditable: true,
      status: "draft",
    },
  ];
}

export function pageIllustrationUrls(
  generationRecords: GenerationRecord[],
  fallbackImageUrl: string | null,
): Array<string | null> {
  const scenes: string[] = [];
  for (const record of generationRecords) {
    if (record.kind !== "image") continue;
    const imageUrl = record.assetUrl ?? record.partialAssetUrls?.at(-1);
    if (imageUrl && !scenes.includes(imageUrl)) scenes.push(imageUrl);
  }

  const selected = scenes.slice(-3);
  if (selected.length === 0) return [fallbackImageUrl, fallbackImageUrl, fallbackImageUrl];
  if (selected.length === 1) return [selected[0], selected[0], selected[0]];
  if (selected.length === 2) return [selected[0], selected[1], selected[1]];
  return selected;
}

export function assignPageIllustrations(
  pages: StoryPage[],
  generationRecords: GenerationRecord[],
  fallbackImageUrl: string | null,
): StoryPage[] {
  const illustrations = pageIllustrationUrls(generationRecords, fallbackImageUrl);
  return pages.map((page, index) => ({ ...page, imageUrl: illustrations[index] ?? fallbackImageUrl }));
}

export function recoverCollapsedPageIllustrations(
  pages: StoryPage[],
  generationRecords: GenerationRecord[],
  fallbackImageUrl: string | null,
): StoryPage[] {
  const distinctAssignedImages = new Set(pages.map((page) => page.imageUrl).filter(Boolean));
  return distinctAssignedImages.size <= 1
    ? assignPageIllustrations(pages, generationRecords, fallbackImageUrl)
    : pages;
}

export function progressForPhase(phase: StoryPhase): number {
  return Math.round(((PHASE_ORDER.indexOf(phase) + 1) / PHASE_ORDER.length) * 100);
}
