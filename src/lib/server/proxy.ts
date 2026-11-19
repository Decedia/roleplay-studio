import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";

/**
 * Shared helpers for the provider proxy routes in src/app/api.
 *
 * - The upstream request is aborted when the browser disconnects (Stop button,
 *   closed tab), so the provider stops generating.
 * - Upstream errors become `{ error }` JSON with the upstream status, even when
 *   the provider answers with an HTML error page.
 * - Untrusted parts of the target URL are checked before fetching.
 */

const DEFAULT_TIMEOUT_MS = 90_000;

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Reads an error body without throwing, whatever the provider sent. */
export async function readUpstreamError(response: Response): Promise<string> {
  const fallback = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
  let text = "";
  try {
    text = await response.text();
  } catch {
    return fallback;
  }
  if (!text.trim()) return fallback;
  try {
    const data = JSON.parse(text);
    const message = extractErrorMessage(data?.error ?? data);
    return message && message !== "An unknown error occurred." ? message : fallback;
  } catch {
    // Not JSON (often an HTML error page): keep a short plain-text version.
    const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return plain ? `${fallback}: ${plain.slice(0, 300)}` : fallback;
  }
}

interface ProxyOptions {
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  stream?: boolean;
  /** Time allowed until the provider starts answering. Streams may run longer. */
  timeoutMs?: number;
  /** Shown when the timeout hits, e.g. "NVIDIA NIM models can be slow." */
  timeoutHint?: string;
}

export async function proxyUpstream(request: NextRequest, options: ProxyOptions): Promise<Response> {
  const { url, method = "POST", headers = {}, body, stream = false } = options;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const onClientAbort = () => controller.abort();
  if (request.signal.aborted) return jsonError("Cancelled", 499);
  request.signal.addEventListener("abort", onClientAbort, { once: true });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        Accept: stream ? "text/event-stream" : "application/json",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", onClientAbort);
    if (timedOut) {
      const hint = options.timeoutHint ? ` ${options.timeoutHint}` : "";
      return NextResponse.json(
        { error: `The provider did not answer within ${Math.round(timeoutMs / 1000)} seconds.${hint}`, timeout: true },
        { status: 504 }
      );
    }
    if (request.signal.aborted) return jsonError("Cancelled", 499);
    return jsonError(`Could not reach the provider: ${extractErrorMessage(error)}`, 502);
  }
  clearTimeout(timer);

  if (!response.ok) {
    request.signal.removeEventListener("abort", onClientAbort);
    return jsonError(await readUpstreamError(response), response.status);
  }

  if (stream) {
    if (!response.body) return jsonError("The provider sent no response stream", 502);
    // Passing the body through means a client disconnect cancels the upstream
    // read as well; the abort listener above covers the rest.
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  request.signal.removeEventListener("abort", onClientAbort);
  const text = await response.text();
  try {
    return NextResponse.json(text ? JSON.parse(text) : {});
  } catch {
    return jsonError(`The provider sent a response that is not JSON: ${text.slice(0, 200)}`, 502);
  }
}

/** Reads the JSON body of a proxy request, or returns null on bad JSON. */
export async function readJsonBody<T = Record<string, unknown>>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * An API path segment such as "chat/completions" or
 * "gemini-2.5-flash:streamGenerateContent?alt=sse". Blocks "..", schemes,
 * leading slashes and anything that could change the host.
 */
export function isSafeEndpoint(endpoint: unknown): endpoint is string {
  return (
    typeof endpoint === "string" &&
    endpoint.length > 0 &&
    endpoint.length < 300 &&
    /^[A-Za-z0-9._~\-/:?=&%]+$/.test(endpoint) &&
    !endpoint.startsWith("/") &&
    !endpoint.includes("..") &&
    !endpoint.includes("//")
  );
}

const PRIVATE_HOST = /^(localhost|.*\.localhost|.*\.local|.*\.internal|metadata\.google\.internal)$/i;

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIPv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h.includes(":")) return false;
  return h === "::" || h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80") || h.startsWith("::ffff:");
}

/**
 * Checks a user-supplied base URL before the server fetches it. Only public
 * http(s) hosts pass: the server can't reach the user's own network anyway,
 * and this stops the route being used to probe internal addresses.
 * Returns the cleaned URL (no trailing slash) or an error message.
 */
export function checkPublicBaseUrl(raw: unknown): { url: string } | { error: string } {
  if (typeof raw !== "string" || !raw.trim()) return { error: "Base URL is required" };
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { error: "Base URL is not a valid address" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { error: "Base URL must start with https:// or http://" };
  }
  if (parsed.username || parsed.password) {
    return { error: "Base URL must not contain a user name or password" };
  }
  const host = parsed.hostname;
  if (!allowPrivateTargets() && (PRIVATE_HOST.test(host) || isPrivateIPv4(host) || isPrivateIPv6(host))) {
    return {
      error: "This address is on a private or local network, which the website's server can't reach. Use a public URL.",
    };
  }
  return { url: `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}` };
}

/** Lets local development reach local servers (Ollama, LM Studio) through the proxy. */
export function allowPrivateTargets(): boolean {
  return process.env.ALLOW_PRIVATE_PROXY_TARGETS === "true";
}

interface BearerProxyConfig {
  /** Provider name used in error messages. */
  name: string;
  /** Fixed API base, e.g. "https://api.groq.com/openai/v1". */
  baseUrl: string;
  extraHeaders?: (request: NextRequest) => Record<string, string>;
  timeoutHint?: string;
}

/**
 * Route handler for OpenAI-style providers on a fixed host with a Bearer key.
 * Body: { endpoint, apiKey, payload, stream }.
 */
export function createBearerProxy(config: BearerProxyConfig) {
  return async function POST(request: NextRequest): Promise<Response> {
    const body = await readJsonBody<{ endpoint?: unknown; apiKey?: unknown; payload?: unknown; stream?: unknown }>(request);
    if (!body) return jsonError("Request body must be JSON", 400);
    const { endpoint, apiKey, payload, stream } = body;
    if (typeof apiKey !== "string" || !apiKey) return jsonError(`${config.name} API key is required`, 400);
    if (!isSafeEndpoint(endpoint)) return jsonError("Invalid endpoint", 400);

    return proxyUpstream(request, {
      url: `${config.baseUrl}/${endpoint}`,
      headers: { Authorization: `Bearer ${apiKey}`, ...(config.extraHeaders?.(request) ?? {}) },
      body: payload ?? {},
      stream: stream === true,
      timeoutHint: config.timeoutHint,
    });
  };
}
