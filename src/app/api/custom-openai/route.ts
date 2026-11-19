import { NextRequest } from "next/server";
import { checkPublicBaseUrl, isSafeEndpoint, jsonError, proxyUpstream, readJsonBody } from "@/lib/server/proxy";

// Any OpenAI-compatible server the user configures. The base URL comes from
// the browser, so it is checked before the server fetches it.
export async function POST(request: NextRequest) {
  const body = await readJsonBody<{ endpoint?: unknown; apiKey?: unknown; baseUrl?: unknown; payload?: unknown; stream?: unknown }>(request);
  if (!body) return jsonError("Request body must be JSON", 400);
  const { endpoint, apiKey, baseUrl, payload, stream } = body;

  if (typeof apiKey !== "string" || !apiKey) return jsonError("API key is required", 400);
  const base = checkPublicBaseUrl(baseUrl);
  if ("error" in base) return jsonError(base.error, 400);
  if (!isSafeEndpoint(endpoint)) return jsonError("Invalid endpoint", 400);

  return proxyUpstream(request, {
    url: `${base.url}/${endpoint}`,
    headers: { Authorization: `Bearer ${apiKey}` },
    body: payload ?? {},
    stream: stream === true,
    timeoutHint: "Try fewer max tokens or try again later.",
  });
}
