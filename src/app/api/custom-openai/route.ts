import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";
import { abortControllerStore } from "@/lib/abortControllerStore";

const CUSTOM_OPENAI_TIMEOUT = 90000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: signal ?? controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, baseUrl, payload, stream, requestId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!baseUrl || typeof baseUrl !== "string") {
      return NextResponse.json(
        { error: "Base URL is required" },
        { status: 400 }
      );
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const targetUrl = `${cleanBaseUrl}/${endpoint}`;

    const controller = new AbortController();
    if (requestId && typeof requestId === "string") {
      abortControllerStore.set(requestId, controller);
    }

    try {
      const response = await fetchWithTimeout(
        targetUrl,
        {
          method: "POST",
          headers: {
            "Accept": stream ? "text/event-stream" : "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        },
        CUSTOM_OPENAI_TIMEOUT,
        controller.signal
      );

      if (stream && response.ok && response.body) {
        const streamResponse = new ReadableStream({
          async start(controller) {
            const reader = response.body!.getReader();

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                controller.enqueue(value);
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(streamResponse, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      if (stream && !response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage: string;

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || `HTTP ${response.status}`;
          } catch {
            errorMessage = `HTTP ${response.status}: Failed to parse error response`;
          }
        } else {
          errorMessage = await response.text() || `HTTP ${response.status}`;
        }

        return new Response(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      }

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          return NextResponse.json(
            { error: `HTTP ${response.status}: Invalid JSON response` },
            { status: response.status }
          );
        }
      } else {
        const textResponse = await response.text();
        return NextResponse.json(
          { error: `HTTP ${response.status}: ${textResponse || "Unknown error"}` },
          { status: response.status }
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: extractErrorMessage(data.error) || `HTTP ${response.status}` },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } finally {
      if (requestId && typeof requestId === "string") {
        abortControllerStore.delete(requestId);
      }
    }
  } catch (error) {
    console.error("Custom OpenAI proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("timed out")) {
      return NextResponse.json(
        {
          error: "Request timed out. Try reducing max tokens or trying again later.",
          timeout: true
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
