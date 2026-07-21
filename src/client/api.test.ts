import { afterEach, describe, expect, it, vi } from "vitest";
import { wonderApi, WonderApiError } from "@/client/api";
import { clearSessionsForTest, createSession } from "@/server/session-store";
import type { VisualStreamEvent } from "@/lib/types";

const setup = { ageBand: "8-10" as const, readingMode: "read-with-me" as const, voiceEnabled: true, adultConfirmed: true as const };

function streamResponse(events: VisualStreamEvent[]): Response {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      const body = events.map((event) => JSON.stringify(event)).join("\n");
      const split = Math.max(1, Math.floor(body.length / 2));
      controller.enqueue(encoder.encode(body.slice(0, split)));
      controller.enqueue(encoder.encode(`${body.slice(split)}\n`));
      controller.close();
    },
  }), { status: 200, headers: { "Content-Type": "application/x-ndjson" } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearSessionsForTest();
});

describe("visual stream client", () => {
  it("parses split NDJSON chunks and exposes every progressive frame", async () => {
    const session = createSession(setup);
    const painting = { ...session, state: { ...session.state, visualStatus: "painting" as const, visualJobRevision: 1 } };
    const complete = { ...painting, state: { ...painting.state, visualStatus: "ready" as const, currentImageUrl: "/generated/final.jpg", imageRevision: 1 } };
    const events: VisualStreamEvent[] = [
      { type: "started", jobRevision: 1, session: painting },
      { type: "partial", jobRevision: 1, partialIndex: 0, imageUrl: "/generated/partial-1.jpg", stage: "sketch", message: "A first sketch is appearing" },
      { type: "partial", jobRevision: 1, partialIndex: 1, imageUrl: "/generated/partial-2.jpg", stage: "color", message: "Color is finding its way" },
      { type: "complete", jobRevision: 1, imageUrl: "/generated/final.jpg", session: complete },
    ];
    vi.stubGlobal("fetch", vi.fn(async () => streamResponse(events)));
    const received: string[] = [];

    const result = await wonderApi.visual(session.id, "reveal", "a paper fox", 0, (event) => received.push(event.type));

    expect(received).toEqual(["started", "partial", "partial", "complete"]);
    expect(result?.state.currentImageUrl).toBe("/generated/final.jpg");
  });

  it("turns an in-stream failure into a contextual API error", async () => {
    const session = createSession(setup);
    const events: VisualStreamEvent[] = [
      { type: "started", jobRevision: 1, session },
      { type: "error", error: "The picture paused before it was finished.", code: "IMAGE_UNAVAILABLE", session },
    ];
    vi.stubGlobal("fetch", vi.fn(async () => streamResponse(events)));

    await expect(wonderApi.visual(session.id, "reveal", "a paper fox", 0, () => undefined))
      .rejects.toMatchObject({ code: "IMAGE_UNAVAILABLE" } satisfies Partial<WonderApiError>);
  });
});
