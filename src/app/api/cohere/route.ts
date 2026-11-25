import { NextRequest } from "next/server";
import { createBearerProxy, jsonError, proxyUpstream, readJsonBody } from "@/lib/server/proxy";

// Chat goes through Cohere's OpenAI-compatible API. The plain v1 API has no
// /chat/completions endpoint.
const chat = createBearerProxy({
  name: "Cohere",
  baseUrl: "https://api.cohere.ai/compatibility/v1",
});

export async function POST(request: NextRequest) {
  const peek = await readJsonBody<{ endpoint?: unknown; apiKey?: unknown }>(request.clone() as NextRequest);
  if (peek?.endpoint === "models") {
    if (typeof peek.apiKey !== "string" || !peek.apiKey) return jsonError("Cohere API key is required", 400);
    // Model list is a GET on the v1 API. It pages 20 at a time by default.
    return proxyUpstream(request, {
      url: "https://api.cohere.com/v1/models?endpoint=chat&page_size=1000",
      method: "GET",
      headers: { Authorization: `Bearer ${peek.apiKey}` },
    });
  }
  return chat(request);
}
