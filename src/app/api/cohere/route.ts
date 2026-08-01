import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";
import { abortControllerStore } from "@/lib/abortControllerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, stream, requestId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Cohere API key is required" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    if (requestId && typeof requestId === "string") {
      abortControllerStore.set(requestId, controller);
    }

    const baseUrl = "https://api.cohere.com/v1";

    try {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          ...(stream ? { "Accept": "text/event-stream" } : {}),
        },
        body: JSON.stringify(payload),
        ...(stream ? { cache: "no-store" } : {}),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: extractErrorMessage(errorData.error) || `HTTP ${response.status}` },
          { status: response.status }
        );
      }

      if (stream) {
        const reader = response.body?.getReader();
        if (!reader) {
          return NextResponse.json(
            { error: "Failed to get response stream" },
            { status: 500 }
          );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
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

        return new NextResponse(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } finally {
      if (requestId && typeof requestId === "string") {
        abortControllerStore.delete(requestId);
      }
    }
  } catch (error) {
    console.error("Cohere API error:", error);
    return NextResponse.json(
      { error: extractErrorMessage(error) },
      { status: 500 }
    );
  }
}
