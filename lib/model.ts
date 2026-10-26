import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingKeyError();
  client ??= new Anthropic();
  return client;
}

export class MissingKeyError extends Error {
  constructor() {
    super("The reader isn't configured on this server yet.");
  }
}

/** Shared request settings: refusal fallback on, so a declined request is retried server-side. */
export const requestDefaults = {
  model: MODEL,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default" as const,
};
