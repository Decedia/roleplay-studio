import { NextRequest, NextResponse } from "next/server";

// Models API route - fetches available models from different providers
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const apiKey = searchParams.get("apiKey");

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
        const projectId = searchParams.get("projectId");
        const location = searchParams.get("location") || "global";
        const accessToken = searchParams.get("accessToken");

        if (!projectId || !accessToken) {
          // Fallback to static models if no credentials provided
          const vertexModels = [
            { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash-Lite Preview", context: 1048576, max_tokens: 65536, supportsThinking: false },
            { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", context: 1048576, max_tokens: 65536, supportsThinking: false },
            { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", context: 1048576, max_tokens: 8192, supportsThinking: true },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", context: 2097152, max_tokens: 8192, supportsThinking: false },
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", context: 1048576, max_tokens: 8192, supportsThinking: false },
          ];

          const models = vertexModels.map((model) => ({
            ...model,
            provider: "google-vertex",
          }));

          return NextResponse.json({ models, location });
        }

        const serviceEndpoint = location === "global"
          ? "https://aiplatform.googleapis.com"
          : `https://${location}-aiplatform.googleapis.com`;

        const parent = `projects/${projectId}/locations/${location}`;
        const response = await fetch(`${serviceEndpoint}/v1/${parent}/models`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          // Fallback to static models if API call fails
          const vertexModels = [
            { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash-Lite Preview", context: 1048576, max_tokens: 65536, supportsThinking: false },
            { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", context: 1048576, max_tokens: 65536, supportsThinking: true },
            { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", context: 1048576, max_tokens: 65536, supportsThinking: false },
            { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", context: 1048576, max_tokens: 8192, supportsThinking: true },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", context: 2097152, max_tokens: 8192, supportsThinking: false },
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", context: 1048576, max_tokens: 8192, supportsThinking: false },
          ];

          const models = vertexModels.map((model) => ({
            ...model,
            provider: "google-vertex",
          }));

          return NextResponse.json({ models, location });
        }

        const data = await response.json();

        // Known model capabilities (context window and max output tokens)
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
          "gemini-3.1-flash-lite-preview": { context: 1048576, max_tokens: 65536, supportsThinking: false },
          "gemini-3.1-pro-preview": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-3-flash-preview": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-2.5-pro": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-2.5-flash": { context: 1048576, max_tokens: 65536, supportsThinking: true },
          "gemini-2.5-flash-lite": { context: 1048576, max_tokens: 65536, supportsThinking: false },
        };

        // Transform Vertex AI models to our format
        const models = (data.models || [])
          .filter((model: { supportedGenerationMethods?: string[] }) =>
            model.supportedGenerationMethods?.includes("generateContent")
          )
          .map((model: { name: string; displayName?: string }) => {
            const modelId = model.name.replace(`projects/${projectId}/locations/${location}/models/`, "");
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

        return NextResponse.json({ models, location });
      }

      case "groq": {
        if (!apiKey) {
          return NextResponse.json(
            { error: "API key is required for Groq" },
            { status: 400 }
          );
        }

        // Fetch models from Groq API
        const response = await fetch("https://api.groq.com/openai/v1/models", {
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
        
        // Transform Groq models to our format
        const models = (data.data || [])
          .filter((model: { id: string; object?: string }) => 
            model.object === "model" && !model.id.startsWith("ft-")
          )
          .map((model: { id: string; created?: number }) => ({
            id: model.id,
            provider: "groq",
            name: model.id,
            // Default values - Groq doesn't provide context window in the list
            context: 8192,
            max_tokens: 8192,
            supportsThinking: false,
          }));

        return NextResponse.json({ models });
      }

      case "open-router": {
        if (!apiKey) {
          return NextResponse.json(
            { error: "API key is required for Open Router" },
            { status: 400 }
          );
        }

        // Fetch models from Open Router API
        const response = await fetch("https://openrouter.ai/api/v1/models", {
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
        
        // Transform Open Router models to our format
        const models = (data.data || [])
          .map((model: { id: string; name?: string; context_length?: number; max_completion_tokens?: number }) => ({
            id: model.id,
            provider: "open-router",
            name: model.name || model.id,
            context: model.context_length || 128000,
            max_tokens: model.max_completion_tokens || 8192,
            // Some models like deepseek-reasoner support reasoning
            supportsThinking: model.id.includes("reasoner") || model.id.includes("thinking"),
          }));

        return NextResponse.json({ models });
      }

      case "kobold-horde": {
        // KoboldAI Horde API returns available models (workers) - no API key required
        const response = await fetch("https://aihorde.net/api/v2/status/models?type=text");

        if (!response.ok) {
          // Fall back to static models if API fails
          const staticModels = [
            { id: "koboldcpp/Llama-3.1-8B-Stheno-v3.4", provider: "kobold-horde", name: "Llama 3.1 8B Stheno v3.4" },
            { id: "koboldcpp/L3-8B-Stheno-v3.2", provider: "kobold-horde", name: "L3 8B Stheno v3.2" },
            { id: "koboldcpp/mini-magnum-12b-v1.1", provider: "kobold-horde", name: "Mini Magnum 12B v1.1" },
          ];
          return NextResponse.json({ models: staticModels });
        }

        const data = await response.json();

        // Transform Horde models to our format
        // Each model has: name (full path), type, count, performance
        const models = data
          .filter((model: { type?: string; count?: number }) => 
            model.type === "text" && (model.count ?? 0) > 0
          )
          .map((model: { name: string }) => ({
            id: model.name,
            provider: "kobold-horde",
            name: model.name,
          }));

        return NextResponse.json({ models });
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
