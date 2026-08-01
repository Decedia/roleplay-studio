import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";
import { abortControllerStore } from "@/lib/abortControllerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, requestId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Ollama API key is required" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    if (requestId && typeof requestId === "string") {
      abortControllerStore.set(requestId, controller);
    }

    try {
      const response = await fetch(`/api/ollama${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || `HTTP ${response.status}` },
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
