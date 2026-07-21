import { describe, expect, it } from "vitest";
import { checkTextSafety } from "@/server/safety";

describe("pre-moderation privacy checks", () => {
  it("blocks likely child contact details before a provider call", async () => {
    const result = await checkTextSafety("My school is Cloud Street Primary");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("private-information");
  });

  it("routes immediate danger toward a trusted grown-up", async () => {
    const result = await checkTextSafety("Someone is hurting me");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("immediate-danger");
    expect(result.message).toContain("trusted grown-up");
  });
});
