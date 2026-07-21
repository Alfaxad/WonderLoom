import { readPrivateBlob, MEDIA_BLOB_PREFIX, usesRemoteStorage } from "@/server/blob-storage";

interface RouteContext { params: Promise<{ path: string[] }> }

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  if (!usesRemoteStorage()) return new Response("Not found", { status: 404 });
  const { path } = await context.params;
  if (!path.length || path.some((segment) => segment === "." || segment === ".." || !/^[a-zA-Z0-9._-]+$/.test(segment))) {
    return new Response("Not found", { status: 404 });
  }
  const blob = await readPrivateBlob(`${MEDIA_BLOB_PREFIX}${path.join("/")}`);
  if (!blob || blob.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(blob.stream, {
    headers: {
      "Cache-Control": "private, max-age=3600",
      "Content-Type": blob.blob.contentType,
      "Content-Length": String(blob.blob.size),
      ETag: blob.blob.etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
