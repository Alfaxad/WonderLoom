import { apiError, messageFromError } from "@/app/api/_shared";
import { visualRequestSchema } from "@/lib/schemas";
import type { VisualPreviewStage, VisualStreamEvent } from "@/lib/types";
import { checkTextSafety } from "@/server/safety";
import { persistGeneratedImage, persistPartialImage, removeVisualJobAssets } from "@/server/image-assets";
import { commitVisualIfCurrent, failVisualJobIfCurrent, flushSessionPersistence, getSession, prepareSession, recordVisualPartial, startVisualJob } from "@/server/session-store";
import { streamStoryImage } from "@/server/story-ai";

interface RouteContext { params: Promise<{ id: string }> }

export const maxDuration = 300;

const activeVisualJobs = new Map<string, AbortController>();

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  await prepareSession(id);
  const current = getSession(id);
  if (!current) return apiError("This studio session has ended.", 404, "SESSION_NOT_FOUND");
  const parsed = visualRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("That scene request could not be painted.", 422);
  if (current.state.revision !== parsed.data.expectedRevision) return apiError("The story changed before painting began.", 409, "STALE_REVISION");

  const safety = await checkTextSafety(parsed.data.prompt, current.safetyIdentifier);
  if (!safety.allowed) return apiError(safety.message, 422, safety.reason);
  const started = startVisualJob(id, parsed.data.expectedRevision, parsed.data.intent, parsed.data.prompt);
  if (started.stale || started.jobRevision === null) {
    return apiError("The story changed before painting began.", 409, "STALE_REVISION");
  }
  await flushSessionPersistence(id);

  const encoder = new TextEncoder();
  const abortController = new AbortController();
  activeVisualJobs.get(id)?.abort();
  activeVisualJobs.set(id, abortController);
  request.signal.addEventListener("abort", () => abortController.abort(), { once: true });
  const messages = [
    { stage: "sketch", message: "A first sketch is appearing" },
    { stage: "color", message: "Color is finding its way" },
    { stage: "details", message: "Adding the tiny details" },
  ] satisfies Array<{ stage: Exclude<VisualPreviewStage, "warming">; message: string }>;

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: VisualStreamEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      send({ type: "started", jobRevision: started.jobRevision!, session: started.session! });
      try {
        for await (const frame of streamStoryImage(
          parsed.data.prompt,
          parsed.data.intent,
          current.state.currentImageUrl,
          current.safetyIdentifier,
          abortController.signal,
        )) {
          if (frame.kind === "partial") {
            const partialIndex = Math.min(frame.partialIndex, messages.length - 1);
            const imageUrl = await persistPartialImage(id, started.jobRevision!, partialIndex, frame.bytes, frame.format);
            await prepareSession(id);
            recordVisualPartial(id, started.jobRevision!, imageUrl);
            await flushSessionPersistence(id);
            send({
              type: "partial",
              jobRevision: started.jobRevision!,
              partialIndex,
              imageUrl,
              ...messages[partialIndex],
            });
            continue;
          }

          const imageUrl = await persistGeneratedImage(id, started.jobRevision!, frame.bytes, frame.format);
          await prepareSession(id);
          const result = commitVisualIfCurrent(id, started.jobRevision!, imageUrl, parsed.data.prompt);
          await flushSessionPersistence(id);
          if (result.stale) {
            await removeVisualJobAssets(id, started.jobRevision!);
            send({ type: "stale", session: result.session });
            break;
          }
          send({ type: "complete", jobRevision: started.jobRevision!, imageUrl, session: result.session! });
        }
      } catch (error) {
        const message = messageFromError(error);
        await removeVisualJobAssets(id, started.jobRevision!);
        await prepareSession(id);
        const session = failVisualJobIfCurrent(id, started.jobRevision!, "Painting was interrupted before the final scene arrived.");
        await flushSessionPersistence(id);
        if (!abortController.signal.aborted) {
          console.error("[WonderLoom image stream]", message);
          send({
            type: "error",
            error: "The picture paused before it was finished. Your story is safe, and you can try again.",
            code: "IMAGE_UNAVAILABLE",
            session,
          });
        }
      } finally {
        if (activeVisualJobs.get(id) === abortController) activeVisualJobs.delete(id);
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
      void (async () => {
        await removeVisualJobAssets(id, started.jobRevision!);
        await prepareSession(id);
        failVisualJobIfCurrent(id, started.jobRevision!, "Painting was interrupted before the final scene arrived.");
        await flushSessionPersistence(id);
      })();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
