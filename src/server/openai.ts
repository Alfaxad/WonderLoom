import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on the server.");
  client = new OpenAI({ apiKey });
  return client;
}
