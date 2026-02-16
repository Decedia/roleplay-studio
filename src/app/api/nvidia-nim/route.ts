import { NextRequest, NextResponse } from "next/server";

// NVIDIA NIM API proxy to avoid CORS issues
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload, stream } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Proxy request to NVIDIA NIM API
    const response = await fetch(`https://integrate.api.nvidia.com/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Accept": stream ? "text/event-stream" : "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    // Handle streaming response
    if (stream && response.ok && response.body) {
      const streamResponse = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Forward the chunk directly
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

    // Handle non-OK streaming responses
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
      
      // Return as SSE error event
      return new Response(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`, {
        status: 200, // Return 200 so client can parse the error
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Try to parse JSON, but handle non-JSON responses (like Cloudflare errors)
    let data;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        return NextResponse.json(
          { error: `HTTP ${response.status}: Invalid JSON response from NVIDIA API` },
          { status: response.status }
        );
      }
    } else {
      // Handle non-JSON responses (e.g., Cloudflare timeout errors)
      const textResponse = await response.text();
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${textResponse || "Unknown error from NVIDIA API"}` },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("NVIDIA NIM proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET endpoint for listing models
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 400 }
      );
    }

    // Proxy request to NVIDIA NIM API for model list
    const response = await fetch("https://integrate.api.nvidia.com/v1/models", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": authHeader,
      },
    });

    // Try to parse JSON, but handle non-JSON responses
    let data;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        return NextResponse.json(
          { error: `HTTP ${response.status}: Invalid JSON response from NVIDIA API` },
          { status: response.status }
        );
      }
    } else {
      const textResponse = await response.text();
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${textResponse || "Unknown error from NVIDIA API"}` },
        { status: response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || `HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("NVIDIA NIM models fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
