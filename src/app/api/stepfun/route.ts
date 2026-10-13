import { NextRequest, NextResponse } from "next/server";

// StepFun API route - uses server-side proxy to avoid CORS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, stream } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "StepFun API key is required" },
        { status: 400 }
      );
    }

    // StepFun uses OpenAI-compatible API at https://api.stepfun.ai/v1
    const baseUrl = "https://api.stepfun.ai/v1";

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
    console.error("StepFun API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET endpoint for listing models
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch models from StepFun API
    const response = await fetch("https://api.stepfun.ai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform StepFun models to our format
    const models = (data.data || []).map((model: { id: string; owned_by?: string }) => ({
      id: model.id,
      provider: "stepfun",
      name: model.id,
      // Default values - will be overridden by known model capabilities
      context: 131072,
      max_tokens: 8192,
      supportsThinking: model.id.includes("step-5") || model.id.includes("step-3.7"),
    }));

    return NextResponse.json({ models });
  } catch (error) {
    console.error("StepFun models fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}