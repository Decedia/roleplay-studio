import { NextRequest, NextResponse } from "next/server";

// KoboldAI Horde API route - uses server-side proxy to avoid CORS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, prompt, params, stream } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "KoboldAI Horde API key is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const baseUrl = "https://aihorde.net/api";

    // Submit async generation request
    const submitResponse = await fetch(`${baseUrl}/v2/generate/text/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
      },
      body: JSON.stringify({
        prompt,
        params: {
          ...params,
          max_context_length: params.max_context_length || 2048,
        },
        models: model ? [model] : undefined,
      }),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || `HTTP ${submitResponse.status}` },
        { status: submitResponse.status }
      );
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.id;

    if (!requestId) {
      return NextResponse.json(
        { error: "Failed to get request ID from Horde API" },
        { status: 500 }
      );
    }

    // Poll for completion
    const maxPolls = 60; // Maximum 60 polls (about 2 minutes at 2 second intervals)
    const pollInterval = 2000; // 2 seconds

    for (let pollCount = 0; pollCount < maxPolls; pollCount++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(`${baseUrl}/v2/generate/text/status/${requestId}`, {
        method: "GET",
      });

      if (!statusResponse.ok) {
        continue; // Keep polling even on errors
      }

      const statusData = await statusResponse.json();

      if (statusData.done) {
        // Generation completed
        const generations = statusData.generations || [];
        if (generations.length > 0) {
          const content = generations[0].text || "";

          if (stream) {
            // For streaming, return the full content
            return NextResponse.json({ content, done: true });
          } else {
            // For non-streaming, return the content
            return NextResponse.json({ content });
          }
        } else {
          return NextResponse.json(
            { error: "No generations returned" },
            { status: 500 }
          );
        }
      }

      // Check if request was cancelled or failed
      if (statusData.faulted) {
        return NextResponse.json(
          { error: "Generation failed" },
          { status: 500 }
        );
      }
    }

    // Timeout
    return NextResponse.json(
      { error: "Generation timed out" },
      { status: 408 }
    );
  } catch (error) {
    console.error("KoboldAI Horde API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}