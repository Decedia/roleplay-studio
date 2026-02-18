import { NextRequest, NextResponse } from "next/server";

// Models API route - fetches available models from different providers
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const apiKey = searchParams.get("apiKey");
  const projectId = searchParams.get("projectId");

  if (!provider) {
    return NextResponse.json(
      { error: "Provider parameter is required" },
      { status: 400 }
    );
  }

  try {
    switch (provider) {
      case "nvidia-nim": {
        if (!apiKey) {
          return NextResponse.json(
            { error: "API key is required for NVIDIA NIM" },
            { status: 400 }
          );
        }

        const response = await fetch("https://integrate.api.nvidia.com/v1/models", {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${apiKey}`,
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
        
        // Transform NVIDIA NIM models to our format
        const models = (data.data || []).map((model: { id: string }) => ({
          id: model.id,
          provider: "nvidia-nim",
          name: model.id,
        }));

        return NextResponse.json({ models });
      }

      case "google-ai-studio": {
        if (!apiKey) {
          return NextResponse.json(
            { error: "API key is required for Google AI Studio" },
            { status: 400 }
          );
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
          { method: "GET" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.error?.message || `HTTP ${response.status}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        
        // Known model capabilities (context window and max output tokens)
        // These are based on Google's documentation
        const modelCapabilities: Record<string, { context: number; max_tokens: number; supportsThinking?: boolean }> = {
          "gemini-2.0-flash": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-flash-lite": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-2.0-pro-exp-02-05": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-pro-exp": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-1.5-pro": { context: 2097152, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-flash": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-pro-002": { context: 2097152, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-flash-002": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-flash-8b": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-flash-8b-exp-0924": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-exp-1206": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-exp-1121": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-exp-1114": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-flash-exp": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-flash-thinking-exp-1219": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-flash-thinking-exp": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-3-pro": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-3-flash": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-3-flash-lite": { context: 1048576, max_tokens: 65536, supportsThinking: false },
        };
        
        // Transform Google AI models to our format
        const models = (data.models || [])
          .filter((model: { supportedGenerationMethods?: string[] }) => 
            model.supportedGenerationMethods?.includes("generateContent")
          )
          .map((model: { name: string; displayName?: string }) => {
            const modelId = model.name.replace("models/", "");
            const capabilities = modelCapabilities[modelId] || { context: 128000, max_tokens: 8192, supportsThinking: false };
            
            return {
              id: modelId,
              provider: "google-ai-studio",
              name: model.displayName || modelId,
              context: capabilities.context,
              max_tokens: capabilities.max_tokens,
              supportsThinking: capabilities.supportsThinking,
            };
          });

        return NextResponse.json({ models });
      }

      case "google-vertex": {
        if (!apiKey) {
          return NextResponse.json(
            { error: "API key is required for Google Vertex AI" },
            { status: 400 }
          );
        }

        // Get location from query params (default to us-central1)
        const location = searchParams.get("location") || "us-central1";
        const vertexMode = searchParams.get("vertexMode") || "express";

        // For Express mode, use Vertex AI endpoint with x-goog-api-key header
        const response = await fetch(
          `https://${location}-aiplatform.googleapis.com/v1/projects/-/locations/${location}/publishers/google/models`,
          {
            method: "GET",
            headers: {
              "x-goog-api-key": apiKey,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.error?.message || `HTTP ${response.status}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        
        // Known model capabilities for Vertex AI
        const modelCapabilities: Record<string, { context: number; max_tokens: number; supportsThinking?: boolean }> = {
          "gemini-2.0-flash": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-flash-lite": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-2.0-pro-exp-02-05": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-2.0-pro-exp": { context: 1048576, max_tokens: 8192, supportsThinking: true },
          "gemini-1.5-pro": { context: 2097152, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-flash": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-pro-002": { context: 2097152, max_tokens: 8192, supportsThinking: false },
          "gemini-1.5-flash-002": { context: 1048576, max_tokens: 8192, supportsThinking: false },
          "gemini-3-pro": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-3-flash": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-3-flash-lite": { context: 1048576, max_tokens: 65536, supportsThinking: false },
        };
        
        // Transform Vertex AI models to our format
        // Vertex AI returns models in a different format
        const models = (data.models || data.aiPlatformModels || [])
          .map((model: { name: string; displayName?: string; supportedGenerationMethods?: string[] }) => {
            // Vertex AI model names are like "projects/-/locations/us-central1/publishers/google/models/gemini-2.0-flash"
            const modelId = model.name.split("/").pop() || model.name;
            const capabilities = modelCapabilities[modelId] || { context: 128000, max_tokens: 8192, supportsThinking: false };
            
            return {
              id: modelId,
              provider: "google-vertex",
              name: model.displayName || modelId,
              context: capabilities.context,
              max_tokens: capabilities.max_tokens,
              supportsThinking: capabilities.supportsThinking,
            };
          });

        return NextResponse.json({ models, location, vertexMode });
      }

      case "puter": {
        // Puter.js models are fetched client-side
        return NextResponse.json({ 
          error: "Puter.js models must be fetched client-side",
          models: [] 
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`Error fetching models for ${provider}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
