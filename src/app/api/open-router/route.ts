import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, stream } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Open Router API key is required" },
        { status: 400 }
      );
    }

    const baseUrl = "https://openrouter.ai/api/v1";
    
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": request.headers.get("origin") || "http://localhost:3000",
        "X-Title": "Chat Application",
        ...(stream ? { "Accept": "text/event-stream" } : {}),
      },
      body: JSON.stringify(payload),
      ...(stream ? { cache: "no-store" } : {}),
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
  } catch (error) {
    console.error("Open Router API error:", error);
    return NextResponse.json(
      { error: extractErrorMessage(error) },
      { status: 500 }
    );
  }
}