import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { narrowPatchSchema } from "@/lib/schemas";
import { addContribution } from "@/lib/story-state";
import { checkTextSafety } from "@/server/safety";
import { flushSessionPersistence, getSession, mutateSession, prepareSession } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  const parsed = narrowPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("That story change could not be applied.", 422);
  const safety = await checkTextSafety(parsed.data.value, current.safetyIdentifier);
  if (!safety.allowed) return NextResponse.json({ error: safety.message, reason: safety.reason }, { status: 422 });

  const session = mutateSession(id, (state) => {
    const patched = { ...state, [parsed.data.field]: parsed.data.value, ...(parsed.data.field === "title" ? { titleConfirmed: true } : {}), revision: state.revision + 1 };
    return addContribution(patched, {
      author: parsed.data.author,
      kind: "revision",
      text: `Changed ${parsed.data.field} to ${parsed.data.value}`,
    });
  });
  await flushSessionPersistence(id);
  return NextResponse.json({ session });
}
