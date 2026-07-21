import { getOpenAI } from "@/server/openai";

const privateInfoPatterns = [
  /\b(?:my|our) (?:full )?name is\b/i,
  /\b(?:i live|my address|my school|my phone|my email)\b/i,
  /\b\d{3}[-. ]?\d{3}[-. ]?\d{4}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];

export interface SafetyResult {
  allowed: boolean;
  reason: "ok" | "private-information" | "moderation" | "immediate-danger";
  message: string;
}

export async function checkTextSafety(text: string, safetyIdentifier?: string): Promise<SafetyResult> {
  if (privateInfoPatterns.some((pattern) => pattern.test(text))) {
    return {
      allowed: false,
      reason: "private-information",
      message: "Let’s keep names, schools, addresses, and contact details out of the story. Try an imaginary detail instead.",
    };
  }

  const dangerPattern = /\b(?:kill myself|suicide|hurt myself|someone is hurting me|not safe at home)\b/i;
  if (dangerPattern.test(text)) {
    return {
      allowed: false,
      reason: "immediate-danger",
      message: "Please pause and get a trusted grown-up right now. If there is immediate danger, contact local emergency services.",
    };
  }

  const response = await getOpenAI().moderations.create({
    model: "omni-moderation-latest",
    input: text,
    ...(safetyIdentifier ? { safety_identifier: safetyIdentifier } : {}),
  });
  if (response.results[0]?.flagged) {
    return {
      allowed: false,
      reason: "moderation",
      message: "That idea needs a safer direction. We can keep the excitement and change the risky part.",
    };
  }
  return { allowed: true, reason: "ok", message: "" };
}
