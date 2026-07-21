import type { Contributor, SetupPreferences, StoryState, VisualIntent, VisualStreamEvent, WonderSession } from "@/lib/types";

interface SessionResponse { session: WonderSession }

export class WonderApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "WonderApiError";
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new WonderApiError(
      typeof data.error === "string" ? data.error : "WonderLoom could not complete that step.",
      response.status,
      typeof data.code === "string" ? data.code : undefined,
    );
  }
  return data as T;
}

const visualControllers = new Map<string, AbortController>();

async function streamVisual(
  id: string,
  intent: VisualIntent,
  prompt: string,
  expectedRevision: number,
  onEvent: (event: VisualStreamEvent) => void,
): Promise<WonderSession | null> {
  visualControllers.get(id)?.abort();
  const controller = new AbortController();
  visualControllers.set(id, controller);

  try {
    const response = await fetch(`/api/session/${id}/visual`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
      body: JSON.stringify({ intent, prompt, expectedRevision }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new WonderApiError(
        typeof data.error === "string" ? data.error : "The picture could not begin.",
        response.status,
        typeof data.code === "string" ? data.code : undefined,
      );
    }
    if (!response.body) throw new WonderApiError("The picture stream did not open.", 502, "IMAGE_STREAM_UNAVAILABLE");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalSession: WonderSession | null = null;

    const processLine = (line: string) => {
      if (!line.trim()) return;
      const event = JSON.parse(line) as VisualStreamEvent;
      onEvent(event);
      if (event.type === "complete") finalSession = event.session;
      if (event.type === "stale") {
        finalSession = event.session;
        throw new WonderApiError("A newer picture has already started.", 409, "STALE_VISUAL_JOB");
      }
      if (event.type === "error") {
        finalSession = event.session;
        throw new WonderApiError(event.error, 502, event.code);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) processLine(line);
      if (done) break;
    }
    processLine(buffer);
    if (!finalSession) throw new WonderApiError("The picture stream ended before the final scene arrived.", 502, "IMAGE_STREAM_INCOMPLETE");
    return finalSession;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    throw error;
  } finally {
    if (visualControllers.get(id) === controller) visualControllers.delete(id);
  }
}

export const wonderApi = {
  startSession: (setup: SetupPreferences) => requestJson<SessionResponse>("/api/session", { method: "POST", body: JSON.stringify(setup) }),
  getSession: (id: string) => requestJson<SessionResponse>(`/api/session/${id}`),
  turn: (id: string, text: string, author: "child" | "adult") => requestJson<SessionResponse & { guide: { reflection: string; question: string }; visual: { intent: VisualIntent; prompt: string } | null }>(`/api/session/${id}/turn`, { method: "POST", body: JSON.stringify({ text, author }) }),
  contribute: (id: string, text: string, author: Contributor, kind: "idea" | "choice" | "revision" | "suggestion" | "composition") => requestJson<SessionResponse>(`/api/session/${id}/contribution`, { method: "POST", body: JSON.stringify({ text, author, kind }) }),
  patch: (id: string, field: keyof Pick<StoryState, "title" | "seed" | "hero" | "heroDetail" | "world" | "goal" | "challenge" | "nextBeat" | "ending">, value: string, author: Contributor = "child") => requestJson<SessionResponse>(`/api/session/${id}/state`, { method: "PATCH", body: JSON.stringify({ field, value, author }) }),
  visual: streamVisual,
  speech: (id: string, target: { kind: "cover" } | { kind: "page"; pageId: string }) => requestJson<{ audioUrl: string; cached: boolean; disclosure: string }>(`/api/session/${id}/speech`, { method: "POST", body: JSON.stringify({ target }) }),
  compose: (id: string) => requestJson<SessionResponse>(`/api/session/${id}/compose`, { method: "POST" }),
  updatePage: (id: string, pageId: string, text: string) => requestJson<SessionResponse>(`/api/session/${id}/page`, { method: "PATCH", body: JSON.stringify({ pageId, text }) }),
  finalize: (id: string) => requestJson<SessionResponse>(`/api/session/${id}/finalize`, { method: "POST" }),
  undo: (id: string) => requestJson<SessionResponse>(`/api/session/${id}/undo`, { method: "POST" }),
};
