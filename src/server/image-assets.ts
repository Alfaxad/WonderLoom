import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { deletePrivateBlobs, listPrivateBlobs, MEDIA_BLOB_PREFIX, privateMediaPathFromUrl, privateMediaUrl, readPrivateBlob, usesRemoteStorage, writePrivateBlob } from "@/server/blob-storage";

const GENERATED_ROOT = resolve(process.cwd(), "public", "generated");

export interface ImageSource {
  bytes: Uint8Array;
  mime: string;
  extension: string;
}

export async function persistGeneratedImage(
  sessionId: string,
  imageRevision: number,
  bytes: Uint8Array,
  format: "jpeg" | "png" | "webp" = "jpeg",
): Promise<string> {
  const extension = format === "jpeg" ? "jpg" : format;
  const relative = join(sessionId, `scene-${String(imageRevision).padStart(3, "0")}.${extension}`);
  if (usesRemoteStorage()) {
    await writePrivateBlob(`${MEDIA_BLOB_PREFIX}${relative.split("\\").join("/")}`, Buffer.from(bytes), `image/${format}`);
    return privateMediaUrl(relative);
  }
  const destination = resolve(GENERATED_ROOT, relative);
  assertWithinGeneratedRoot(destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return `/generated/${relative.split("\\").join("/")}`;
}

export async function persistNarrationAudio(
  sessionId: string,
  target: string,
  sourceHash: string,
  bytes: Uint8Array,
): Promise<string> {
  const safeTarget = target.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
  const relative = join(sessionId, "audio", `${safeTarget}-${sourceHash.slice(0, 12)}.mp3`);
  if (usesRemoteStorage()) {
    await writePrivateBlob(`${MEDIA_BLOB_PREFIX}${relative.split("\\").join("/")}`, Buffer.from(bytes), "audio/mpeg");
    return privateMediaUrl(relative);
  }
  const destination = resolve(GENERATED_ROOT, relative);
  assertWithinGeneratedRoot(destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return `/generated/${relative.split("\\").join("/")}`;
}

export async function persistPartialImage(
  sessionId: string,
  jobRevision: number,
  partialIndex: number,
  bytes: Uint8Array,
  format: "jpeg" | "png" | "webp" = "jpeg",
): Promise<string> {
  const extension = format === "jpeg" ? "jpg" : format;
  const relative = join(sessionId, `scene-${String(jobRevision).padStart(3, "0")}-partial-${partialIndex + 1}.${extension}`);
  if (usesRemoteStorage()) {
    await writePrivateBlob(`${MEDIA_BLOB_PREFIX}${relative.split("\\").join("/")}`, Buffer.from(bytes), `image/${format}`);
    return privateMediaUrl(relative);
  }
  const destination = resolve(GENERATED_ROOT, relative);
  assertWithinGeneratedRoot(destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return `/generated/${relative.split("\\").join("/")}`;
}

export async function prunePartialImages(sessionId: string): Promise<void> {
  if (usesRemoteStorage()) {
    const blobs = await listPrivateBlobs(`${MEDIA_BLOB_PREFIX}${sessionId}/`);
    await deletePrivateBlobs(blobs.filter((blob) => blob.pathname.includes("-partial-")).map((blob) => blob.pathname));
    return;
  }
  const sessionDirectory = resolve(GENERATED_ROOT, sessionId);
  assertWithinGeneratedRoot(sessionDirectory);
  const entries = await readdir(sessionDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries
    .filter((entry) => entry.isFile() && entry.name.includes("-partial-"))
    .map((entry) => unlink(resolve(sessionDirectory, entry.name)).catch(() => undefined)));
}

export async function removeVisualJobAssets(sessionId: string, jobRevision: number): Promise<void> {
  const prefix = `scene-${String(jobRevision).padStart(3, "0")}`;
  if (usesRemoteStorage()) {
    const blobs = await listPrivateBlobs(`${MEDIA_BLOB_PREFIX}${sessionId}/${prefix}`);
    await deletePrivateBlobs(blobs.map((blob) => blob.pathname));
    return;
  }
  const sessionDirectory = resolve(GENERATED_ROOT, sessionId);
  assertWithinGeneratedRoot(sessionDirectory);
  const entries = await readdir(sessionDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries
    .filter((entry) => entry.isFile() && (entry.name.startsWith(`${prefix}.`) || entry.name.startsWith(`${prefix}-partial-`)))
    .map((entry) => unlink(resolve(sessionDirectory, entry.name)).catch(() => undefined)));
}

export async function removeSessionAssets(sessionId: string): Promise<void> {
  if (!/^[a-f0-9-]{36}$/i.test(sessionId)) return;
  if (usesRemoteStorage()) {
    const blobs = await listPrivateBlobs(`${MEDIA_BLOB_PREFIX}${sessionId}/`);
    await deletePrivateBlobs(blobs.map((blob) => blob.pathname));
    return;
  }
  const sessionDirectory = resolve(GENERATED_ROOT, sessionId);
  assertWithinGeneratedRoot(sessionDirectory);
  const entries = await readdir(sessionDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries.filter((entry) => entry.isFile()).map((entry) => unlink(resolve(sessionDirectory, entry.name)).catch(() => undefined)));
  const audioDirectory = resolve(sessionDirectory, "audio");
  const audioEntries = await readdir(audioDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(audioEntries.filter((entry) => entry.isFile()).map((entry) => unlink(resolve(audioDirectory, entry.name)).catch(() => undefined)));
}

export async function loadImageSource(imageUrl: string): Promise<ImageSource> {
  const dataMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(imageUrl);
  if (dataMatch) {
    const mime = dataMatch[1];
    return {
      bytes: Uint8Array.from(Buffer.from(dataMatch[2], "base64")),
      mime,
      extension: mime.split("/")[1].replace("jpeg", "jpg"),
    };
  }

  const privatePath = privateMediaPathFromUrl(imageUrl);
  if (privatePath && usesRemoteStorage()) {
    const blob = await readPrivateBlob(privatePath);
    if (!blob || blob.statusCode !== 200) throw Object.assign(new Error("The current scene image is unavailable."), { code: "ENOENT" });
    const bytes = new Uint8Array(await new Response(blob.stream).arrayBuffer());
    const mime = blob.blob.contentType;
    const extension = extname(blob.blob.pathname).slice(1).toLowerCase();
    return { bytes, mime, extension };
  }

  if (!imageUrl.startsWith("/generated/")) throw new Error("The current scene image is not editable.");
  const relative = normalize(imageUrl.slice("/generated/".length));
  const source = resolve(GENERATED_ROOT, relative);
  assertWithinGeneratedRoot(source);
  const extension = extname(source).slice(1).toLowerCase();
  const mime = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension}`;
  return { bytes: new Uint8Array(await readFile(source)), mime, extension };
}

function assertWithinGeneratedRoot(path: string): void {
  if (path !== GENERATED_ROOT && !path.startsWith(`${GENERATED_ROOT}/`)) {
    throw new Error("Invalid generated image path.");
  }
}
