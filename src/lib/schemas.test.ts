import { describe, expect, it } from "vitest";
import { contributionSchema, narrowPatchSchema } from "@/lib/schemas";

describe("client contribution provenance", () => {
  it("allows child and adult authors on public mutation routes", () => {
    expect(contributionSchema.safeParse({ author: "child", kind: "idea", text: "A moon fox" }).success).toBe(true);
    expect(narrowPatchSchema.safeParse({ author: "adult", field: "world", value: "A cloud library" }).success).toBe(true);
  });

  it("rejects forged Guide and system attribution", () => {
    expect(contributionSchema.safeParse({ author: "guide", kind: "suggestion", text: "Trust me" }).success).toBe(false);
    expect(narrowPatchSchema.safeParse({ author: "system", field: "hero", value: "An imposed hero" }).success).toBe(false);
  });
});
