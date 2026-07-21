import { NextResponse } from "next/server";
import { apiError, messageFromError } from "@/app/api/_shared";
import { addContribution } from "@/lib/story-state";
import { pageComposerInstructions } from "@/server/prompts";
import { checkTextSafety } from "@/server/safety";
import { completeTextGeneration, failTextGeneration, flushSessionPersistence, getSession, mutateSession, prepareSession, startTextGeneration } from "@/server/session-store";
import { composePages } from "@/server/story-ai";

interface RouteContext { params: Promise<{ id: string }> }

export const maxDuration = 120;

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  const prompt = "Compose the child's three-page story now.";
  const recordId = startTextGeneration(id, {
    kind: "composition",
    model: "gpt-5.6-luna",
    prompt,
    instructions: pageComposerInstructions(current.state),
    target: "three-page-story",
  });
  await flushSessionPersistence(id);
  try {
    const composed = await composePages(current.state, current.safetyIdentifier);
    const pageSafety = await checkTextSafety(composed.pages.map((page) => page.text).join("\n"), current.safetyIdentifier);
    if (!pageSafety.allowed) {
      if (recordId) failTextGeneration(id, recordId, "The composed pages did not pass the child-safety check.");
      await flushSessionPersistence(id);
      return apiError("The Creative Guide paused those pages. Try a different direction.", 422, "PAGE_GUARDRAIL");
    }
    await prepareSession(id);
    if (recordId) completeTextGeneration(id, recordId, JSON.stringify({ usedFallback: composed.usedFallback, error: composed.error, pages: composed.pages.map(({ pageNumber, text }) => ({ pageNumber, text })) }));
    const session = mutateSession(id, (state) => addContribution({
      ...state,
      pages: composed.pages,
      title: state.titleConfirmed ? state.title : "An Untold Wonder",
      titleConfirmed: state.titleConfirmed,
      phase: "pages",
      guideQuestion: state.titleConfirmed ? "Would you like to change a page, or finish your story?" : "Your three pages are ready. What should your story be called?",
      suggestions: state.titleConfirmed ? ["Change a page", "Read it aloud", "Finish my book"] : ["Name it after the hero", "Name it after the place", "Make my own title"],
      revision: state.revision + 1,
    }, { author: "system", kind: "composition", text: "Arranged the child’s ideas into three editable pages." }));
    await flushSessionPersistence(id);
    return NextResponse.json({ session });
  } catch (error) {
    const message = messageFromError(error);
    await prepareSession(id);
    if (recordId) failTextGeneration(id, recordId, "The Creative Guide could not arrange these pages.");
    await flushSessionPersistence(id);
    console.error("[WonderLoom composition]", message);
    return apiError("The Creative Guide could not arrange the pages right now.", 502, "COMPOSITION_UNAVAILABLE");
  }
}
