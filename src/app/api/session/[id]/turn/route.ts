import { NextResponse } from "next/server";
import { apiError, messageFromError } from "@/app/api/_shared";
import { turnRequestSchema } from "@/lib/schemas";
import { addContribution } from "@/lib/story-state";
import { pageComposerInstructions, turnInstructions } from "@/server/prompts";
import { checkTextSafety } from "@/server/safety";
import { completeTextGeneration, failTextGeneration, flushSessionPersistence, getSession, mutateSession, prepareSession, startTextGeneration } from "@/server/session-store";
import { applyTurnPlan, composePages, planStoryTurn } from "@/server/story-ai";

interface RouteContext { params: Promise<{ id: string }> }

export const maxDuration = 120;

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  const parsed = turnRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Try sharing one short story idea.", 422);

  const safety = await checkTextSafety(parsed.data.text, current.safetyIdentifier);
  if (!safety.allowed) return NextResponse.json({ error: safety.message, reason: safety.reason }, { status: 422 });

  if (current.state.pages.length > 0 && !current.state.titleConfirmed) {
    if (parsed.data.text.length > 100) return apiError("A book title needs to be 100 characters or fewer.", 422, "TITLE_TOO_LONG");
    const title = parsed.data.text.trim();
    const question = "That title is yours. Would you like to change a page, read it aloud, or finish your book?";
    const session = mutateSession(id, (state) => {
      let next = addContribution({
        ...state,
        title,
        titleConfirmed: true,
        guideQuestion: question,
        suggestions: ["Change a page", "Read it aloud", "Finish my book"],
        revision: state.revision + 1,
      }, { author: parsed.data.author, kind: "revision", text: `Named the story “${title}”.` });
      next = addContribution(next, { author: "guide", kind: "suggestion", text: question, accepted: false });
      return next;
    });
    await flushSessionPersistence(id);
    return NextResponse.json({ session, guide: { reflection: `“${title}”`, question }, visual: null });
  }

  try {
    const guideRecordId = startTextGeneration(id, {
      kind: "guide",
      model: "gpt-5.6-luna",
      prompt: `${parsed.data.author === "adult" ? "Adult-assisted" : "Child"} contribution: ${parsed.data.text}`,
      instructions: turnInstructions(current.state),
      target: "next-story-step",
    });
    await flushSessionPersistence(id);
    const plan = await planStoryTurn(current.state, parsed.data.text, parsed.data.author, current.safetyIdentifier);
    await prepareSession(id);
    if (guideRecordId) completeTextGeneration(id, guideRecordId, JSON.stringify(plan));
    const planSafety = await checkTextSafety([
      plan.reflection,
      plan.question,
      ...plan.suggestions,
      ...Object.values(plan.patch),
      plan.visualPrompt,
    ].filter(Boolean).join("\n"), current.safetyIdentifier);
    if (!planSafety.allowed) {
      await flushSessionPersistence(id);
      return apiError("The Creative Guide paused that response. Try a different direction.", 422, "GUIDE_GUARDRAIL");
    }

    let composed: Awaited<ReturnType<typeof composePages>> | null = null;
    if (plan.shouldComposePages) {
      const compositionState = { ...current.state, ...plan.patch };
      const compositionRecordId = startTextGeneration(id, {
        kind: "composition",
        model: "gpt-5.6-luna",
        prompt: "Compose the child's three-page story now.",
        instructions: pageComposerInstructions(compositionState),
        target: "three-page-story",
      });
      await flushSessionPersistence(id);
      composed = await composePages(compositionState, current.safetyIdentifier, getSession(id)?.generationRecords ?? current.generationRecords);
      const pageSafety = await checkTextSafety(composed.pages.map((page) => page.text).join("\n"), current.safetyIdentifier);
      if (!pageSafety.allowed) {
        if (compositionRecordId) failTextGeneration(id, compositionRecordId, "The composed pages did not pass the child-safety check.");
        await flushSessionPersistence(id);
        return apiError("The Creative Guide paused those pages. Try a different direction.", 422, "PAGE_GUARDRAIL");
      }
      await prepareSession(id);
      if (compositionRecordId) completeTextGeneration(id, compositionRecordId, JSON.stringify({ usedFallback: composed.usedFallback, error: composed.error, pages: composed.pages.map(({ pageNumber, text }) => ({ pageNumber, text })) }));
    }

    await prepareSession(id);
    const session = mutateSession(id, (state) => {
      let next = addContribution(state, {
        author: parsed.data.author,
        kind: plan.contributionKind,
        text: parsed.data.text,
      });
      next = applyTurnPlan(next, plan);
      next = addContribution(next, {
        author: "guide",
        kind: "suggestion",
        text: [plan.reflection, plan.question].filter(Boolean).join(" "),
        accepted: false,
      });
      if (composed) {
        next = {
          ...next,
          pages: composed.pages,
          title: next.titleConfirmed ? next.title : "An Untold Wonder",
          titleConfirmed: next.titleConfirmed,
          phase: "pages",
          guideQuestion: next.titleConfirmed ? "Would you like to change a page, or finish your story?" : "Your three pages are ready. What should your story be called?",
          suggestions: next.titleConfirmed ? ["Change a page", "Read it aloud", "Finish my book"] : ["Name it after the hero", "Name it after the place", "Make my own title"],
          revision: next.revision + 1,
        };
      }
      return next;
    });

    await flushSessionPersistence(id);
    return NextResponse.json({ session, guide: { reflection: plan.reflection, question: plan.question }, visual: plan.visualIntent === "none" ? null : { intent: plan.visualIntent, prompt: plan.visualPrompt } });
  } catch (error) {
    const message = messageFromError(error);
    await prepareSession(id);
    const latest = getSession(id)?.generationRecords.findLast((record) => (record.kind === "guide" || record.kind === "composition") && record.status === "started");
    if (latest) failTextGeneration(id, latest.id, "The Creative Guide could not complete this step.");
    await flushSessionPersistence(id);
    console.error("[WonderLoom story turn]", message);
    return apiError("The Creative Guide could not complete that step. Your story is still safe.", 502, "GUIDE_UNAVAILABLE");
  }
}
