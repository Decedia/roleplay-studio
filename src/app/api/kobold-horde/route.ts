import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError, readJsonBody, readUpstreamError } from "@/lib/server/proxy";

/**
 * AI Horde text API, one short call per request. The browser does the
 * waiting (see src/lib/horde.ts), because Horde jobs can queue for longer
 * than a serverless function may run.
 *
 * Actions: "workers" (online text workers), "submit" (start a job),
 * "status" (poll a job), "cancel" (leave the queue).
 */

const BASE_URL = "https://aihorde.net/api/v2";
// Horde asks clients to identify themselves: name:version:contact.
const CLIENT_AGENT = "roleplay-studio:1.0:unknown";
const JOB_ID = /^[a-zA-Z0-9-]{8,64}$/;

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{ action?: unknown; apiKey?: unknown; id?: unknown; payload?: unknown }>(request);
  if (!body) return jsonError("Request body must be JSON", 400);
  const { action } = body;
  const apiKey = typeof body.apiKey === "string" && body.apiKey ? body.apiKey : "0000000000";
  const headers: Record<string, string> = { "Client-Agent": CLIENT_AGENT, apikey: apiKey };

  let url: string;
  let init: RequestInit;
  if (action === "workers") {
    url = `${BASE_URL}/workers?type=text`;
    init = { headers: { "Client-Agent": CLIENT_AGENT } };
  } else if (action === "submit") {
    if (!body.payload || typeof body.payload !== "object") return jsonError("Missing job payload", 400);
    url = `${BASE_URL}/generate/text/async`;
    init = { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body.payload) };
  } else if (action === "status" || action === "cancel") {
    if (typeof body.id !== "string" || !JOB_ID.test(body.id)) return jsonError("Invalid job id", 400);
    url = `${BASE_URL}/generate/text/status/${body.id}`;
    init = { method: action === "cancel" ? "DELETE" : "GET", headers };
  } else {
    return jsonError("Unknown action", 400);
  }

  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]) });
    if (!response.ok) return jsonError(await readUpstreamError(response), response.status);
    return NextResponse.json(await response.json());
  } catch (error) {
    if (request.signal.aborted) return jsonError("Cancelled", 499);
    return jsonError(error instanceof Error ? error.message : "AI Horde request failed", 502);
  }
}
