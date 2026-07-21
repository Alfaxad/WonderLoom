import { del, get, list, put, type GetBlobResult, type ListBlobResultBlob } from "@vercel/blob";

const STORAGE_ROOT = "wonderloom";

export const SESSION_BLOB_PREFIX = `${STORAGE_ROOT}/sessions/`;
export const MEDIA_BLOB_PREFIX = `${STORAGE_ROOT}/media/`;

export function usesRemoteStorage(): boolean {
  return process.env.VERCEL === "1" && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readPrivateBlob(pathname: string): Promise<GetBlobResult | null> {
  return get(pathname, { access: "private", useCache: false });
}

export async function writePrivateBlob(
  pathname: string,
  body: string | Buffer,
  contentType: string,
): Promise<void> {
  await put(pathname, body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: 60,
  });
}

export async function deletePrivateBlobs(pathnames: string[] | string): Promise<void> {
  if (Array.isArray(pathnames) && pathnames.length === 0) return;
  await del(pathnames);
}

export async function listPrivateBlobs(prefix: string): Promise<ListBlobResultBlob[]> {
  const blobs: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

export function privateMediaUrl(relativePath: string): string {
  const segments = relativePath.split(/[\\/]+/).filter(Boolean);
  if (!segments.length || segments.some(isUnsafePathSegment)) {
    throw new Error("Invalid generated media path.");
  }
  return `/api/media/${segments.map(encodeURIComponent).join("/")}`;
}

export function privateMediaPathFromUrl(url: string): string | null {
  if (!url.startsWith("/api/media/")) return null;
  const encoded = url.slice("/api/media/".length).split("/").filter(Boolean);
  try {
    const segments = encoded.map(decodeURIComponent);
    if (!segments.length || segments.some(isUnsafePathSegment)) return null;
    return `${MEDIA_BLOB_PREFIX}${segments.join("/")}`;
  } catch {
    return null;
  }
}

function isUnsafePathSegment(segment: string): boolean {
  return segment === "." || segment === ".." || !/^[a-zA-Z0-9._-]+$/.test(segment);
}
