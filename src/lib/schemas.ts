import { z } from "zod";

export const setupSchema = z.object({
  ageBand: z.enum(["6-7", "8-10"]),
  readingMode: z.enum(["read-with-me", "read-to-me"]),
  voiceEnabled: z.boolean(),
  adultConfirmed: z.literal(true),
});

export const contributorSchema = z.enum(["child", "guide", "adult", "system"]);
const clientContributorSchema = z.enum(["child", "adult"]);

export const contributionSchema = z.object({
  author: clientContributorSchema,
  kind: z.enum(["idea", "choice", "revision", "suggestion", "composition"]),
  text: z.string().trim().min(1).max(800),
});

export const storyFieldSchema = z.enum([
  "title",
  "seed",
  "hero",
  "heroDetail",
  "world",
  "goal",
  "challenge",
  "nextBeat",
  "ending",
]);

export const narrowPatchSchema = z.object({
  field: storyFieldSchema,
  value: z.string().trim().min(1).max(1200),
  author: clientContributorSchema.default("child"),
});

export const turnRequestSchema = z.object({
  text: z.string().trim().min(1).max(800),
  author: z.enum(["child", "adult"]).default("child"),
});

export const visualRequestSchema = z.object({
  intent: z.enum(["reveal", "transform", "advance"]),
  prompt: z.string().trim().min(1).max(1800),
  expectedRevision: z.number().int().nonnegative(),
});

export const pageUpdateSchema = z.object({
  pageId: z.string().min(1),
  text: z.string().trim().min(1).max(1600),
});

export const narrationRequestSchema = z.object({
  target: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("cover") }),
    z.object({ kind: z.literal("page"), pageId: z.string().min(1) }),
  ]),
});

export const safetyTextSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});

export const realtimeTokenSchema = z.object({
  sessionId: z.string().uuid(),
});
