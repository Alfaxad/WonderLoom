import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError, messageFromError } from "@/app/api/_shared";
import { BOOK_NARRATION_MODEL, BOOK_NARRATION_VOICE } from "@/lib/openai-models";
import { narrationRequestSchema } from "@/lib/schemas";
import { persistNarrationAudio } from "@/server/image-assets";
import { getOpenAI } from "@/server/openai";
import { completeSpeechGeneration, failSpeechGeneration, findCompletedSpeech, flushSessionPersistence, getSession, prepareSession, startSpeechGeneration } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export const maxDuration = 120;

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const session = getSession(id);
  if (!session) return apiError("This saved story could not be found.", 404, "SESSION_NOT_FOUND");
  const parsed = narrationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("That part of the story could not be narrated.", 422, "INVALID_NARRATION_TARGET");

  const narrationTarget = parsed.data.target;
  const isCover = narrationTarget.kind === "cover";
  const page = narrationTarget.kind === "page" ? session.state.pages.find((item) => item.id === narrationTarget.pageId) : null;
  if (!isCover && !page) return apiError("That story page could not be found.", 404, "PAGE_NOT_FOUND");

  const target = isCover ? "cover" : `page-${page!.pageNumber}`;
  const input = isCover
    ? `${session.state.title}. A WonderLoom story, imagined and shaped by you.`
    : page!.text;
  const sceneDirection = isCover
    ? "Open with delighted anticipation, as if gently opening a treasured storybook."
    : page!.pageNumber === 1
      ? "Begin with bright curiosity and inviting energy; make the world feel newly discovered."
      : page!.pageNumber === session.state.pages.length
        ? "Give the ending warm emotional resolution, hopeful energy, and a satisfying final cadence."
        : "Follow the scene's tension and emotion with sympathetic warmth, slightly quicker momentum, and clear dramatic pauses.";
  const instructions = `You are Coral, WonderLoom's AI story narrator for children ages 6 to 10. Speak with energetic, sympathetic warmth and expressive storybook narration. ${sceneDirection} Adapt intonation, pacing, and emotional color to the actual events without becoming theatrical or frightening. Keep names clear, pauses natural, and the pace easy to follow. Do not add, remove, or rewrite any words.`;
  const sourceHash = createHash("sha256").update(JSON.stringify({ model: BOOK_NARRATION_MODEL, voice: BOOK_NARRATION_VOICE, input, instructions })).digest("hex");
  const cached = findCompletedSpeech(id, sourceHash);
  if (cached?.assetUrl) {
    return NextResponse.json({ audioUrl: cached.assetUrl, cached: true, disclosure: "AI-generated narration · Coral voice" });
  }

  const recordId = startSpeechGeneration(id, { target, sourceHash, prompt: input, instructions });
  if (!recordId) return apiError("This saved story could not be found.", 404, "SESSION_NOT_FOUND");
  try {
    const response = await getOpenAI().audio.speech.create({
      model: BOOK_NARRATION_MODEL,
      voice: BOOK_NARRATION_VOICE,
      input,
      instructions,
      response_format: "mp3",
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const audioUrl = await persistNarrationAudio(id, target, sourceHash, bytes);
    completeSpeechGeneration(id, recordId, audioUrl);
    await flushSessionPersistence(id);
    return NextResponse.json({ audioUrl, cached: false, disclosure: "AI-generated narration · Coral voice" });
  } catch (error) {
    const message = messageFromError(error);
    failSpeechGeneration(id, recordId, "Coral could not prepare this narration.");
    await flushSessionPersistence(id);
    console.error("[WonderLoom narration]", message);
    return apiError("Coral could not read this page right now. Your written story is still here.", 502, "NARRATION_UNAVAILABLE");
  }
}
