import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BOOK_NARRATION_MODEL } from "@/lib/openai-models";
import { assignPageIllustrations, cloneStoryState, createInitialStoryState, isFinishedBook, recoverCollapsedPageIllustrations } from "@/lib/story-state";
import type { GenerationRecord, SavedStorySummary, SetupPreferences, StoryState, VisualIntent, WonderSession } from "@/lib/types";
import { deletePrivateBlobs, listPrivateBlobs, readPrivateBlob, SESSION_BLOB_PREFIX, usesRemoteStorage, writePrivateBlob } from "@/server/blob-storage";

const MAX_HISTORY = 100;
const ACTIVE_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const STORAGE_ROOT = join(/*turbopackIgnore: true*/ process.cwd(), "data", "wonderloom", "sessions");
const LOCAL_PERSISTENCE_ENABLED = process.env.NODE_ENV !== "test" && !usesRemoteStorage();

declare global {
  var __wonderloomSessions: Map<string, WonderSession> | undefined;
}

const sessions = globalThis.__wonderloomSessions ?? loadPersistedSessions();
globalThis.__wonderloomSessions = sessions;
for (const [id, session] of sessions) sessions.set(id, normalizeSession(session));

function safetyIdentifier(id: string): string {
  return createHash("sha256").update(id).digest("hex").slice(0, 32);
}

function loadPersistedSessions(): Map<string, WonderSession> {
  const loaded = new Map<string, WonderSession>();
  if (!LOCAL_PERSISTENCE_ENABLED) return loaded;
  mkdirSync(STORAGE_ROOT, { recursive: true });
  for (const entry of readdirSync(STORAGE_ROOT, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    try {
      const session = normalizeSession(JSON.parse(readFileSync(join(STORAGE_ROOT, entry.name), "utf8")) as WonderSession);
      if (isPersistableSession(session)) loaded.set(session.id, session);
      else unlinkSync(join(STORAGE_ROOT, entry.name));
    } catch (error) {
      console.error(`[WonderLoom persistence] Could not load ${entry.name}`, error);
    }
  }
  return loaded;
}

function normalizeSession(session: WonderSession): WonderSession {
  const generationRecords = session.generationRecords ?? [];
  const state = {
    ...createInitialStoryState(),
    ...session.state,
    titleConfirmed: session.state.titleConfirmed ?? (session.state.title !== "An Untold Wonder"),
  };
  const normalizedState = {
    ...state,
    pages: recoverCollapsedPageIllustrations(state.pages, generationRecords, state.currentImageUrl),
  };
  return {
    ...session,
    state: normalizedState,
    history: (session.history ?? []).map((state) => ({
      ...createInitialStoryState(),
      ...state,
      titleConfirmed: state.titleConfirmed ?? (state.title !== "An Untold Wonder"),
    })),
    generationRecords,
    completedAt: session.completedAt ?? null,
  };
}

function persistSession(session: WonderSession): void {
  if (!LOCAL_PERSISTENCE_ENABLED) return;
  const destination = join(STORAGE_ROOT, `${session.id}.json`);
  if (!isPersistableSession(session)) {
    try { unlinkSync(destination); } catch { /* no archived copy exists */ }
    return;
  }
  mkdirSync(STORAGE_ROOT, { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(session, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(temporary, destination);
}

export function createSession(setup: SetupPreferences): WonderSession {
  const id = randomUUID();
  const now = new Date().toISOString();
  const session: WonderSession = {
    id,
    safetyIdentifier: safetyIdentifier(id),
    setup,
    state: createInitialStoryState(),
    history: [],
    generationRecords: [],
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  sessions.set(id, session);
  persistSession(session);
  return cloneSession(session);
}

export async function prepareSession(id: string): Promise<void> {
  if (!usesRemoteStorage()) return;
  if (!isValidSessionId(id)) {
    sessions.delete(id);
    return;
  }
  try {
    const loaded = await loadRemoteSession(`${SESSION_BLOB_PREFIX}${id}.json`);
    if (!loaded) {
      sessions.delete(id);
      return;
    }
    if (isExpiredActiveSession(loaded)) {
      sessions.delete(id);
      await deletePrivateBlobs(`${SESSION_BLOB_PREFIX}${id}.json`);
      return;
    }
    sessions.set(id, loaded);
  } catch (error) {
    if (!sessions.has(id)) throw error;
    console.error(`[WonderLoom persistence] Could not refresh ${id}; retaining the in-process copy.`, error);
  }
}

export async function flushSessionPersistence(id: string): Promise<void> {
  if (!usesRemoteStorage()) return;
  if (!isValidSessionId(id)) return;
  const session = sessions.get(id);
  const pathname = `${SESSION_BLOB_PREFIX}${id}.json`;
  if (!session) {
    await deletePrivateBlobs(pathname);
    return;
  }
  await writePrivateBlob(pathname, `${JSON.stringify(session)}\n`, "application/json");
}

export function getSession(id: string): WonderSession | null {
  const session = sessions.get(id);
  return session ? cloneSession(session) : null;
}

export function listSavedStories(): SavedStorySummary[] {
  return [...sessions.values()]
    .filter(isPersistableSession)
    .map(toSavedStorySummary)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function listSavedStoriesAsync(): Promise<SavedStorySummary[]> {
  if (!usesRemoteStorage()) return listSavedStories();
  const blobs = await listPrivateBlobs(SESSION_BLOB_PREFIX);
  const loaded = await Promise.all(blobs.map(async (blob) => {
    try {
      const session = await loadRemoteSession(blob.pathname);
      if (session && isExpiredActiveSession(session)) {
        await deletePrivateBlobs(blob.pathname);
        return null;
      }
      if (session) sessions.set(session.id, session);
      return session;
    } catch (error) {
      console.error(`[WonderLoom persistence] Could not read ${blob.pathname}.`, error);
      return null;
    }
  }));
  return loaded
    .filter((session): session is WonderSession => Boolean(session && isPersistableSession(session)))
    .map(toSavedStorySummary)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function markSessionComplete(id: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session || !isFinishedBook(session.state)) return null;
  session.completedAt = new Date().toISOString();
  session.updatedAt = session.completedAt;
  persistSession(session);
  return cloneSession(session);
}

export function mutateSession(id: string, mutate: (state: StoryState) => StoryState): WonderSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  const previous = cloneStoryState(session.state);
  const next = mutate(cloneStoryState(session.state));
  session.history = [...session.history.slice(-(MAX_HISTORY - 1)), previous];
  session.state = next;
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function startVisualJob(id: string, expectedStoryRevision: number, intent?: VisualIntent, prompt?: string): { session: WonderSession | null; jobRevision: number | null; stale: boolean } {
  const session = sessions.get(id);
  if (!session) return { session: null, jobRevision: null, stale: false };
  if (session.state.revision !== expectedStoryRevision) {
    return { session: cloneSession(session), jobRevision: null, stale: true };
  }
  const jobRevision = session.state.visualJobRevision + 1;
  session.state = {
    ...session.state,
    visualStatus: "painting",
    visualJobRevision: jobRevision,
    visualError: "",
  };
  session.generationRecords.push({
    id: randomUUID(),
    kind: "image",
    model: "gpt-image-2",
    status: "started",
    startedAt: new Date().toISOString(),
    intent,
    prompt,
    jobRevision,
    partialAssetUrls: [],
  });
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return { session: cloneSession(session), jobRevision, stale: false };
}

export function recordVisualPartial(id: string, jobRevision: number, imageUrl: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session || session.state.visualJobRevision !== jobRevision) return session ? cloneSession(session) : null;
  const record = [...session.generationRecords].reverse().find((item) => item.kind === "image" && item.jobRevision === jobRevision);
  if (record) {
    record.status = "partial";
    record.partialAssetUrls = [...(record.partialAssetUrls ?? []), imageUrl];
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function commitVisualIfCurrent(
  id: string,
  expectedJobRevision: number,
  imageUrl: string,
  visualPrompt: string,
): { session: WonderSession | null; stale: boolean } {
  const session = sessions.get(id);
  if (!session) return { session: null, stale: false };
  if (session.state.visualJobRevision !== expectedJobRevision) return { session: cloneSession(session), stale: true };

  const previousSharedImageUrl = session.state.currentImageUrl;
  const record = [...session.generationRecords].reverse().find((item) => item.kind === "image" && item.jobRevision === expectedJobRevision);
  const completedRecord = record ? { ...record, status: "complete" as const, assetUrl: imageUrl } : null;
  const recordsWithCompletedImage = completedRecord
    ? session.generationRecords.map((item) => item.id === completedRecord.id ? completedRecord : item)
    : session.generationRecords;
  const pages = record?.intent === "transform"
    ? session.state.pages.map((page) => (
        !page.imageUrl || page.imageUrl === previousSharedImageUrl ? { ...page, imageUrl } : page
      ))
    : assignPageIllustrations(session.state.pages, recordsWithCompletedImage, imageUrl);
  session.history = [...session.history.slice(-(MAX_HISTORY - 1)), cloneStoryState(session.state)];
  session.state = {
    ...session.state,
    currentImageUrl: imageUrl,
    pages,
    visualPrompt,
    visualStatus: "ready",
    visualError: "",
    imageRevision: session.state.imageRevision + 1,
    revision: session.state.revision + 1,
  };
  if (record) {
    record.status = "complete";
    record.assetUrl = imageUrl;
    record.prompt = visualPrompt;
    record.completedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return { session: cloneSession(session), stale: false };
}

export function failVisualJobIfCurrent(id: string, expectedJobRevision: number, message: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  if (session.state.visualJobRevision !== expectedJobRevision) return cloneSession(session);
  session.state.visualStatus = "blocked";
  session.state.visualError = message;
  const record = [...session.generationRecords].reverse().find((item) => item.kind === "image" && item.jobRevision === expectedJobRevision);
  if (record) {
    record.status = "failed";
    record.error = message;
    record.completedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function undoSession(id: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session || session.history.length === 0) return session ? cloneSession(session) : null;
  const previous = session.history.at(-1)!;
  session.history = session.history.slice(0, -1);
  session.state = { ...cloneStoryState(previous), revision: session.state.revision + 1 };
  if (session.state.phase !== "finished") session.completedAt = null;
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function findCompletedSpeech(id: string, sourceHash: string): GenerationRecord | null {
  const session = sessions.get(id);
  const record = session?.generationRecords.find((item) => item.kind === "speech" && item.sourceHash === sourceHash && item.status === "complete" && item.assetUrl);
  return record ? structuredClone(record) : null;
}

export function startSpeechGeneration(id: string, input: { target: string; sourceHash: string; prompt: string; instructions: string }): string | null {
  const session = sessions.get(id);
  if (!session) return null;
  const record: GenerationRecord = {
    id: randomUUID(),
    kind: "speech",
    model: BOOK_NARRATION_MODEL,
    status: "started",
    startedAt: new Date().toISOString(),
    target: input.target,
    sourceHash: input.sourceHash,
    prompt: input.prompt,
    instructions: input.instructions,
  };
  session.generationRecords.push(record);
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return record.id;
}

export function completeSpeechGeneration(id: string, recordId: string, assetUrl: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  const record = session.generationRecords.find((item) => item.id === recordId);
  if (record) {
    record.status = "complete";
    record.assetUrl = assetUrl;
    record.completedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function failSpeechGeneration(id: string, recordId: string, error: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  const record = session.generationRecords.find((item) => item.id === recordId);
  if (record) {
    record.status = "failed";
    record.error = error;
    record.completedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function startTextGeneration(id: string, input: {
  kind: "guide" | "composition";
  model: string;
  prompt: string;
  instructions: string;
  target: string;
}): string | null {
  const session = sessions.get(id);
  if (!session) return null;
  const record: GenerationRecord = {
    id: randomUUID(),
    kind: input.kind,
    model: input.model,
    status: "started",
    startedAt: new Date().toISOString(),
    prompt: input.prompt,
    instructions: input.instructions,
    target: input.target,
  };
  session.generationRecords.push(record);
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return record.id;
}

export function completeTextGeneration(id: string, recordId: string, result: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  const record = session.generationRecords.find((item) => item.id === recordId);
  if (record) {
    record.status = "complete";
    record.result = result;
    record.completedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function failTextGeneration(id: string, recordId: string, error: string): WonderSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  const record = session.generationRecords.find((item) => item.id === recordId);
  if (record) {
    record.status = "failed";
    record.error = error;
    record.completedAt = new Date().toISOString();
  }
  session.updatedAt = new Date().toISOString();
  persistSession(session);
  return cloneSession(session);
}

export function deleteSession(id: string): boolean {
  const deleted = sessions.delete(id);
  if (deleted && LOCAL_PERSISTENCE_ENABLED) {
    try { unlinkSync(join(STORAGE_ROOT, `${id}.json`)); } catch { /* already absent */ }
  }
  return deleted;
}

function cloneSession(session: WonderSession): WonderSession {
  return structuredClone(session);
}

export function clearSessionsForTest(): void {
  sessions.clear();
}

function isPersistableSession(session: WonderSession): boolean {
  return Boolean(session.completedAt) && isFinishedBook(session.state);
}

function isExpiredActiveSession(session: WonderSession): boolean {
  return !session.completedAt && Date.now() - Date.parse(session.updatedAt) > ACTIVE_SESSION_TTL_MS;
}

function isValidSessionId(id: string): boolean {
  return /^[a-f0-9-]{36}$/i.test(id);
}

async function loadRemoteSession(pathname: string): Promise<WonderSession | null> {
  const blob = await readPrivateBlob(pathname);
  if (!blob || blob.statusCode !== 200) return null;
  const text = await new Response(blob.stream).text();
  return normalizeSession(JSON.parse(text) as WonderSession);
}

function toSavedStorySummary(session: WonderSession): SavedStorySummary {
  return {
    id: session.id,
    title: session.state.title,
    titleConfirmed: session.state.titleConfirmed,
    phase: session.state.phase,
    coverImageUrl: session.state.currentImageUrl,
    pageCount: session.state.pages.length,
    contributionCount: session.state.contributions.length,
    generationCount: session.generationRecords.length,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
