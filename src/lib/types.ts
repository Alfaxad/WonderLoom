export type Contributor = "child" | "guide" | "adult" | "system";
export type StoryPhase = "seed" | "reveal" | "edit" | "transform" | "pages" | "finished";
export type VisualIntent = "reveal" | "transform" | "advance";
export type VisualStatus = "idle" | "painting" | "ready" | "blocked";
export type VisualPreviewStage = "warming" | "sketch" | "color" | "details";

export interface SetupPreferences {
  ageBand: "6-7" | "8-10";
  readingMode: "read-with-me" | "read-to-me";
  voiceEnabled: boolean;
  adultConfirmed: boolean;
}

export interface Contribution {
  id: string;
  author: Contributor;
  kind: "idea" | "choice" | "revision" | "suggestion" | "composition";
  text: string;
  createdAt: string;
  accepted: boolean;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  imageUrl: string | null;
  childEditable: boolean;
  status: "draft" | "ready";
}

export interface StoryState {
  title: string;
  titleConfirmed: boolean;
  seed: string;
  hero: string;
  heroDetail: string;
  world: string;
  goal: string;
  challenge: string;
  nextBeat: string;
  ending: string;
  phase: StoryPhase;
  contributions: Contribution[];
  pages: StoryPage[];
  currentImageUrl: string | null;
  visualPrompt: string;
  visualStatus: VisualStatus;
  visualJobRevision: number;
  visualError: string;
  guideQuestion: string;
  suggestions: string[];
  revision: number;
  imageRevision: number;
}

export interface GenerationRecord {
  id: string;
  kind: "guide" | "composition" | "image" | "speech";
  model: string;
  status: "started" | "partial" | "complete" | "failed";
  startedAt: string;
  completedAt?: string;
  prompt?: string;
  instructions?: string;
  intent?: VisualIntent;
  jobRevision?: number;
  partialAssetUrls?: string[];
  assetUrl?: string;
  target?: string;
  sourceHash?: string;
  result?: string;
  error?: string;
}

export interface WonderSession {
  id: string;
  safetyIdentifier: string;
  setup: SetupPreferences;
  state: StoryState;
  history: StoryState[];
  generationRecords: GenerationRecord[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedStorySummary {
  id: string;
  title: string;
  titleConfirmed: boolean;
  phase: StoryPhase;
  coverImageUrl: string | null;
  pageCount: number;
  contributionCount: number;
  generationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisualPreview {
  jobRevision: number;
  partialIndex: number;
  imageUrl: string | null;
  stage: VisualPreviewStage;
  message: string;
}

export type VisualStreamEvent =
  | { type: "started"; jobRevision: number; session: WonderSession }
  | { type: "partial"; jobRevision: number; partialIndex: number; imageUrl: string; stage: Exclude<VisualPreviewStage, "warming">; message: string }
  | { type: "complete"; jobRevision: number; imageUrl: string; session: WonderSession }
  | { type: "stale"; session: WonderSession | null }
  | { type: "error"; error: string; code: string; session: WonderSession | null };

export interface TurnPlan {
  reflection: string;
  question: string;
  suggestions: string[];
  contributionKind: Contribution["kind"];
  patch: Partial<Pick<StoryState, "seed" | "hero" | "heroDetail" | "world" | "goal" | "challenge" | "nextBeat" | "ending" | "title">>;
  nextPhase: StoryPhase;
  visualIntent: VisualIntent | "none";
  visualPrompt: string;
  shouldComposePages: boolean;
}

export interface ApiErrorShape {
  error: string;
  code?: string;
}
