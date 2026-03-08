import { NextRequest, NextResponse } from "next/server";

// Groq API route - uses server-side proxy to avoid CORS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, stream } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is required" },
        { status: 400 }
      );
    }

    // Groq uses OpenAI-compatible API at https://api.groq.com/openai/v1/
    const baseUrl = "https://api.groq.com/openai/v1";
    
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(stream ? { "Accept": "text/event-stream" } : {}),
      },
      body: JSON.stringify(payload),
      ...(stream ? { cache: "no-store" } : {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    // Handle streaming response
    if (stream) {
      const reader = response.body?.getReader();
      if (!reader) {
        return NextResponse.json(
          { error: "Failed to get response stream" },
          { status: 500 }
        );
      }

      const encoder = new Encoder();
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

    // Handle non-streaming response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Simple Encoder class for streaming
class Encoder {
  encode(input: string): Uint8Array {
    return new TextEncoder().encode(input);
  }
}
