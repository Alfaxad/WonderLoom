import { zodTextFormat } from "openai/helpers/zod";
import { toFile } from "openai";
import { z } from "zod";
import type { Contributor, GenerationRecord, StoryPage, StoryPhase, StoryState, TurnPlan, VisualIntent } from "@/lib/types";
import { assignPageIllustrations, makeFallbackPages } from "@/lib/story-state";
import { loadImageSource } from "@/server/image-assets";
import { getOpenAI } from "@/server/openai";
import { pageComposerInstructions, turnInstructions, visualStylePrompt } from "@/server/prompts";

const turnPlanSchema = z.object({
  reflection: z.string().min(1).max(280),
  question: z.string().max(240),
  suggestions: z.array(z.string().min(1).max(100)).max(3),
  contributionKind: z.enum(["idea", "choice", "revision", "suggestion", "composition"]),
  title: z.string().max(100).nullable(),
  seed: z.string().nullable(),
  hero: z.string().nullable(),
  heroDetail: z.string().nullable(),
  world: z.string().nullable(),
  goal: z.string().nullable(),
  challenge: z.string().nullable(),
  nextBeat: z.string().nullable(),
  ending: z.string().nullable(),
  nextPhase: z.enum(["seed", "reveal", "edit", "transform", "pages", "finished"]),
  visualIntent: z.enum(["none", "reveal", "transform", "advance"]),
  visualPrompt: z.string().max(1800),
  shouldComposePages: z.boolean(),
});

const pagesSchema = z.object({ pages: z.array(z.object({ text: z.string().min(20).max(700) })).length(3) });

export async function planStoryTurn(
  state: StoryState,
  childText: string,
  author: Exclude<Contributor, "guide" | "system">,
  safetyIdentifier: string,
): Promise<TurnPlan> {
  const response = await getOpenAI().responses.parse({
    model: "gpt-5.6-luna",
    instructions: turnInstructions(state),
    input: `${author === "adult" ? "Adult-assisted" : "Child"} contribution: ${childText}`,
    text: { format: zodTextFormat(turnPlanSchema, "wonderloom_turn_plan") },
    safety_identifier: safetyIdentifier,
    max_output_tokens: 1200,
  });

  const parsed = response.output_parsed;
  if (!parsed) throw new Error("The Creative Guide did not return a usable plan.");
  const fields = ["title", "seed", "hero", "heroDetail", "world", "goal", "challenge", "nextBeat", "ending"] as const;
  const patch: TurnPlan["patch"] = {};
  for (const field of fields) {
    const value = parsed[field];
    if (value && (field !== "title" || (state.pages.length > 0 && !state.titleConfirmed))) patch[field] = value;
  }
  return { ...parsed, patch };
}

export interface PageCompositionResult {
  pages: StoryPage[];
  usedFallback: boolean;
  error?: string;
}

export async function composePages(
  state: StoryState,
  safetyIdentifier: string,
  generationRecords: GenerationRecord[] = [],
): Promise<PageCompositionResult> {
  try {
    const response = await getOpenAI().responses.parse({
      model: "gpt-5.6-luna",
      instructions: pageComposerInstructions(state),
      input: "Compose the child's three-page story now.",
      text: { format: zodTextFormat(pagesSchema, "wonderloom_story_pages") },
      safety_identifier: safetyIdentifier,
      max_output_tokens: 1800,
    });
    if (!response.output_parsed) throw new Error("No parsed pages");
    return {
      pages: assignPageIllustrations(response.output_parsed.pages.map((page, index) => ({
        id: crypto.randomUUID(),
        pageNumber: index + 1,
        text: page.text,
        imageUrl: null,
        childEditable: true,
        status: "ready" as const,
      })), generationRecords, state.currentImageUrl),
      usedFallback: false,
    };
  } catch (error) {
    return {
      pages: assignPageIllustrations(makeFallbackPages(state), generationRecords, state.currentImageUrl),
      usedFallback: true,
      error: error instanceof Error ? error.message : "The page composer did not return a usable result.",
    };
  }
}

export interface StoryImageFrame {
  kind: "partial" | "complete";
  partialIndex: number;
  bytes: Uint8Array;
  format: "jpeg" | "png" | "webp";
}

export async function* streamStoryImage(
  prompt: string,
  intent: VisualIntent,
  currentImageUrl: string | null,
  safetyIdentifier: string,
  signal?: AbortSignal,
): AsyncGenerator<StoryImageFrame> {
  const styledPrompt = visualStylePrompt(prompt);
  const common = {
    model: "gpt-image-2",
    prompt: styledPrompt,
    size: "1536x1024" as const,
    quality: "medium" as const,
    output_format: "jpeg" as const,
    output_compression: 88,
    background: "opaque" as const,
    user: safetyIdentifier,
  };

  let stream;
  if (intent !== "reveal" && currentImageUrl) {
    let source: Awaited<ReturnType<typeof loadImageSource>> | null = null;
    try {
      source = await loadImageSource(currentImageUrl);
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
      console.warn("[WonderLoom image stream] The previous scene asset was unavailable; regenerating from the canonical story prompt.");
    }
    stream = source
      ? await getOpenAI().images.edit({
          ...common,
          image: await toFile(source.bytes, `wonderloom-scene.${source.extension}`, { type: source.mime }),
          stream: true,
          partial_images: 3,
        }, { signal })
      : await getOpenAI().images.generate({
          ...common,
          moderation: "auto",
          stream: true,
          partial_images: 3,
        }, { signal });
  } else {
    stream = await getOpenAI().images.generate({
      ...common,
      moderation: "auto",
      stream: true,
      partial_images: 3,
    }, { signal });
  }

  let completed = false;
  for await (const event of stream) {
    if (event.type === "image_generation.partial_image" || event.type === "image_edit.partial_image") {
      yield {
        kind: "partial",
        partialIndex: event.partial_image_index,
        bytes: Uint8Array.from(Buffer.from(event.b64_json, "base64")),
        format: event.output_format,
      };
    }
    if (event.type === "image_generation.completed" || event.type === "image_edit.completed") {
      completed = true;
      yield {
        kind: "complete",
        partialIndex: 3,
        bytes: Uint8Array.from(Buffer.from(event.b64_json, "base64")),
        format: event.output_format,
      };
    }
  }
  if (!completed) throw new Error("The image model ended before returning a final scene.");
}

export function applyTurnPlan(state: StoryState, plan: TurnPlan): StoryState {
  const childNamedStory = Boolean(plan.patch.title && state.pages.length > 0 && !state.titleConfirmed);
  return {
    ...state,
    ...plan.patch,
    titleConfirmed: state.titleConfirmed || childNamedStory,
    phase: plan.nextPhase as StoryPhase,
    guideQuestion: plan.question,
    suggestions: plan.suggestions,
    visualPrompt: plan.visualPrompt || state.visualPrompt,
    revision: state.revision + 1,
  };
}
