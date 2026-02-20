import { NextRequest, NextResponse } from "next/server";

// Vertex AI proxy route to avoid CORS issues
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, location = "global" } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Build the Vertex AI endpoint URL
    const vertexEndpoint = location === "global"
      ? `https://aiplatform.googleapis.com/v1/projects/-/locations/global/publishers/google/models/${endpoint}`
      : `https://${location}-aiplatform.googleapis.com/v1/projects/-/locations/${location}/publishers/google/models/${endpoint}`;

    const response = await fetch(vertexEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Vertex AI proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

// Endpoint for streaming
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, location = "global" } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Build the Vertex AI endpoint URL for streaming
    const vertexEndpoint = location === "global"
      ? `https://aiplatform.googleapis.com/v1/projects/-/locations/global/publishers/google/models/${endpoint}`
      : `https://${location}-aiplatform.googleapis.com/v1/projects/-/locations/${location}/publishers/google/models/${endpoint}`;

    const response = await fetch(vertexEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    // For streaming, we need to return the stream directly
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
            // Pass through the SSE data
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
  } catch (error) {
    console.error("Vertex AI streaming proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
