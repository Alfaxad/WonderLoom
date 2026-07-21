import { afterEach, describe, expect, it } from "vitest";
import { MEDIA_BLOB_PREFIX, privateMediaPathFromUrl, privateMediaUrl, usesRemoteStorage } from "@/server/blob-storage";

const originalVercel = process.env.VERCEL;
const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

afterEach(() => {
  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;
  if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
});

describe("Vercel Blob storage adapter", () => {
  it("activates only inside Vercel with a connected store", () => {
    process.env.VERCEL = "1";
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    expect(usesRemoteStorage()).toBe(true);
    delete process.env.VERCEL;
    expect(usesRemoteStorage()).toBe(false);
  });

  it("maps private media paths to non-secret application URLs", () => {
    const url = privateMediaUrl("session-id/audio/page-1.mp3");
    expect(url).toBe("/api/media/session-id/audio/page-1.mp3");
    expect(privateMediaPathFromUrl(url)).toBe(`${MEDIA_BLOB_PREFIX}session-id/audio/page-1.mp3`);
  });

  it("rejects traversal and malformed media paths", () => {
    expect(() => privateMediaUrl("../sessions/private.json")).toThrow("Invalid generated media path");
    expect(privateMediaPathFromUrl("/api/media/%2e%2e/sessions/private.json")).toBeNull();
    expect(privateMediaPathFromUrl("/generated/example.jpg")).toBeNull();
  });
});
