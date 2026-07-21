import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { pageUpdateSchema } from "@/lib/schemas";
import { addContribution, replacePage } from "@/lib/story-state";
import { checkTextSafety } from "@/server/safety";
import { flushSessionPersistence, getSession, mutateSession, prepareSession } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  const parsed = pageUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("That page change could not be saved.", 422);
  if (!current.state.pages.some((page) => page.id === parsed.data.pageId)) return apiError("That page was not found.", 404);
  const safety = await checkTextSafety(parsed.data.text, current.safetyIdentifier);
  if (!safety.allowed) return NextResponse.json({ error: safety.message, reason: safety.reason }, { status: 422 });
  const session = mutateSession(id, (state) => addContribution(
    replacePage(state, parsed.data.pageId, parsed.data.text),
    { author: "child", kind: "revision", text: `Revised page ${state.pages.find((page) => page.id === parsed.data.pageId)?.pageNumber ?? ""}.` },
  ));
  await flushSessionPersistence(id);
  return NextResponse.json({ session });
}
