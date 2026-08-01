import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/lib/errorUtils";
import { abortControllerStore } from "@/lib/abortControllerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, prompt, params, stream, requestId } = body;

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

    const controller = new AbortController();
    if (requestId && typeof requestId === "string") {
      abortControllerStore.set(requestId, controller);
    }

    const baseUrl = "https://aihorde.net/api";

    const submitResponse = await fetch(`${baseUrl}/v2/generate/text/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        prompt,
        params: {
          ...params,
          max_context_length: params.max_context_length || 8192,
        },
        models: model ? [model] : undefined,
        disable_badwords: true,
      }),
      signal: controller.signal,
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: extractErrorMessage(errorData) || `HTTP ${submitResponse.status}` },
        { status: submitResponse.status }
      );
    }

    const submitData = await submitResponse.json();
    const requestIdFromHorde = submitData.id;

    if (!requestIdFromHorde) {
      return NextResponse.json(
        { error: "Failed to get request ID from Horde API" },
        { status: 500 }
      );
    }

    const maxPolls = 60;
    const pollInterval = 2000;

    try {
      for (let pollCount = 0; pollCount < maxPolls; pollCount++) {
        if (controller.signal.aborted) {
          return NextResponse.json(
            { error: "Generation cancelled" },
            { status: 499 }
          );
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));

        try {
          const statusResponse = await fetch(
            `${baseUrl}/v2/generate/text/status/${requestIdFromHorde}`,
            {
              headers: { apikey: apiKey },
            }
          );

          if (!statusResponse.ok) continue;

          const statusData = await statusResponse.json();

          if (statusData.faulted) {
            return NextResponse.json(
              { error: "Generation failed" },
              { status: 500 }
            );
          }

          if (statusData.done) {
            const generations = statusData.generations || [];
            if (generations.length > 0) {
              const content = generations[0].text || "";

              if (stream) {
                return NextResponse.json({ content, done: true });
              } else {
                return NextResponse.json({ content });
              }
            } else {
              return NextResponse.json(
                { error: "No generations returned" },
                { status: 500 }
              );
            }
          }
        } catch {
          continue;
        }
      }
    } finally {
      if (requestId && typeof requestId === "string") {
        abortControllerStore.delete(requestId);
      }
    }

    return NextResponse.json(
      { error: "Generation timed out" },
      { status: 408 }
    );
  } catch (error) {
    console.error("KoboldAI Horde API error:", error);
    return NextResponse.json(
      { error: extractErrorMessage(error) },
      { status: 500 }
    );
  }
}
