import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { addContribution, hasCompleteBookContent } from "@/lib/story-state";
import { flushSessionPersistence, getSession, markSessionComplete, mutateSession, prepareSession } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  if (!current.state.titleConfirmed || !current.state.title.trim() || current.state.title === "An Untold Wonder") {
    return apiError("Choose a title for your story before binding the book.", 409, "TITLE_REQUIRED");
  }
  if (!hasCompleteBookContent(current.state)) {
    return apiError("Arrange all three story pages before binding the book.", 409, "STORY_INCOMPLETE");
  }
  mutateSession(id, (state) => addContribution({
    ...state,
    phase: "finished",
    guideQuestion: "Your story is ready.",
    suggestions: [],
    revision: state.revision + 1,
  }, { author: "system", kind: "composition", text: "Finished the storybook without changing its story facts." }));
  const session = markSessionComplete(id);
  if (!session) return apiError("The book could not be saved as complete.", 409, "STORY_INCOMPLETE");
  await flushSessionPersistence(id);
  return NextResponse.json({ session });
}
