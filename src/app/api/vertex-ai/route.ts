import { NextRequest } from "next/server";
import { isSafeEndpoint, jsonError, proxyUpstream, readJsonBody } from "@/lib/server/proxy";

// Region and project go into the Google host and path, so both are checked.
const LOCATION = /^(global|[a-z]+-[a-z]+\d+)$/;
const PROJECT_ID = /^[a-z][a-z0-9-]{4,61}[a-z0-9]$/;

async function handle(request: NextRequest, stream: boolean) {
  const body = await readJsonBody<{ endpoint?: unknown; apiKey?: unknown; payload?: unknown; location?: unknown; projectId?: unknown }>(request);
  if (!body) return jsonError("Request body must be JSON", 400);
  const { endpoint, apiKey, payload } = body;
  const location = typeof body.location === "string" && body.location ? body.location : "global";
  const projectId = body.projectId;

  if (typeof apiKey !== "string" || !apiKey) return jsonError("API key is required", 400);
  if (typeof projectId !== "string" || !projectId) {
    return jsonError("Project ID is required for Vertex AI. Please enter your Google Cloud project ID in the provider settings.", 400);
  }
  if (!PROJECT_ID.test(projectId)) return jsonError("Project ID doesn't look like a Google Cloud project ID", 400);
  if (!LOCATION.test(location)) return jsonError("Unknown Vertex AI location", 400);
  if (!isSafeEndpoint(endpoint)) return jsonError("Invalid endpoint", 400);

  const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
  return proxyUpstream(request, {
    url: `https://${host}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${endpoint}`,
    headers: { "x-goog-api-key": apiKey },
    body: payload ?? {},
    stream,
  });
}

/** Non-streaming generateContent. */
export async function POST(request: NextRequest) {
  return handle(request, false);
}

/** Streaming streamGenerateContent (the client uses PATCH for this). */
export async function PATCH(request: NextRequest) {
  return handle(request, true);
}
