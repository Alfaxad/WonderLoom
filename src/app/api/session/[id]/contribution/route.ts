import { NextResponse } from "next/server";
import { apiError } from "@/app/api/_shared";
import { contributionSchema } from "@/lib/schemas";
import { addContribution } from "@/lib/story-state";
import { checkTextSafety } from "@/server/safety";
import { flushSessionPersistence, getSession, mutateSession, prepareSession } from "@/server/session-store";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  const parsed = contributionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("That contribution could not be added.", 422);
  const safety = await checkTextSafety(parsed.data.text, current.safetyIdentifier);
  if (!safety.allowed) return NextResponse.json({ error: safety.message, reason: safety.reason }, { status: 422 });
  const session = mutateSession(id, (state) => addContribution(state, parsed.data));
  await flushSessionPersistence(id);
  return NextResponse.json({ session });
}
