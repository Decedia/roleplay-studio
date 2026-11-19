import { NextRequest } from "next/server";
import { checkPublicBaseUrl, jsonError, proxyUpstream, readJsonBody } from "@/lib/server/proxy";

// Only for Ollama servers on a public URL. Ollama on the user's own computer
// (localhost) is called straight from the browser, because the website's
// server can't reach it.
const PATHS: Record<string, "GET" | "POST"> = {
  "chat/completions": "POST",
  models: "GET",
};

export async function POST(request: NextRequest) {
  const body = await readJsonBody<{ baseUrl?: unknown; path?: unknown; apiKey?: unknown; payload?: unknown; stream?: unknown }>(request);
  if (!body) return jsonError("Request body must be JSON", 400);
  const { baseUrl, path, apiKey, payload, stream } = body;

  const base = checkPublicBaseUrl(baseUrl);
  if ("error" in base) return jsonError(base.error, 400);
  if (typeof path !== "string" || !(path in PATHS)) return jsonError("Invalid Ollama path", 400);
  const method = PATHS[path];

  return proxyUpstream(request, {
    url: `${base.url}/${path}`,
    method,
    headers: typeof apiKey === "string" && apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    body: method === "POST" ? payload ?? {} : undefined,
    stream: stream === true,
  });
}
