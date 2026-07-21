import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";

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
  const destination = resolve(GENERATED_ROOT, relative);
  assertWithinGeneratedRoot(destination);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return `/generated/${relative.split("\\").join("/")}`;
}

export async function prunePartialImages(sessionId: string): Promise<void> {
  const sessionDirectory = resolve(GENERATED_ROOT, sessionId);
  assertWithinGeneratedRoot(sessionDirectory);
  const entries = await readdir(sessionDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries
    .filter((entry) => entry.isFile() && entry.name.includes("-partial-"))
    .map((entry) => unlink(resolve(sessionDirectory, entry.name)).catch(() => undefined)));
}

export async function removeVisualJobAssets(sessionId: string, jobRevision: number): Promise<void> {
  const sessionDirectory = resolve(GENERATED_ROOT, sessionId);
  assertWithinGeneratedRoot(sessionDirectory);
  const prefix = `scene-${String(jobRevision).padStart(3, "0")}`;
  const entries = await readdir(sessionDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries
    .filter((entry) => entry.isFile() && (entry.name.startsWith(`${prefix}.`) || entry.name.startsWith(`${prefix}-partial-`)))
    .map((entry) => unlink(resolve(sessionDirectory, entry.name)).catch(() => undefined)));
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
