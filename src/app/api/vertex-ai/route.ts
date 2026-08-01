import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";
import { abortControllerStore } from "@/lib/abortControllerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, location = "global", projectId, requestId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required for Vertex AI. Please enter your Google Cloud project ID in the provider settings." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    if (requestId && typeof requestId === "string") {
      abortControllerStore.set(requestId, controller);
    }

    const vertexEndpoint = location === "global"
      ? `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${endpoint}`
      : `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${endpoint}`;

    try {
      const response = await fetch(vertexEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json();

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
    console.error("Vertex AI proxy error:", error);
    return NextResponse.json(
      { error: extractErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, location = "global", projectId, requestId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required for Vertex AI. Please enter your Google Cloud project ID in the provider settings." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    if (requestId && typeof requestId === "string") {
      abortControllerStore.set(requestId, controller);
    }

    const vertexEndpoint = location === "global"
      ? `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${endpoint}`
      : `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${endpoint}`;

    try {
      const response = await fetch(vertexEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: extractErrorMessage(errorData.error) || `HTTP ${response.status}` },
          { status: response.status }
        );
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const reader = response.body?.getReader();
      if (!reader) {
        return NextResponse.json(
          { error: "Failed to get response stream" },
          { status: 500 }
        );
      }

      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } finally {
      if (requestId && typeof requestId === "string") {
        abortControllerStore.delete(requestId);
      }
    }
  } catch (error) {
    console.error("Vertex AI streaming proxy error:", error);
    return NextResponse.json(
      { error: extractErrorMessage(error) },
      { status: 500 }
    );
  }
}
