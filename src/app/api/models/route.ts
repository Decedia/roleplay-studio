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

        // Project ID is required for Vertex AI
        const vertexProjectId = searchParams.get("projectId");
        if (!vertexProjectId) {
          return NextResponse.json(
            { error: "Project ID is required for Google Vertex AI" },
            { status: 400 }
          );
        }

        // Get location from query params (default to global)
        const location = searchParams.get("location") || "global";

        // Build endpoint with actual project ID
        const endpoint = location === "global"
          ? `https://aiplatform.googleapis.com/v1/projects/${vertexProjectId}/locations/global/publishers/google/models`
          : `https://${location}-aiplatform.googleapis.com/v1/projects/${vertexProjectId}/locations/${location}/publishers/google/models`;
        
        const response = await fetch(
          endpoint,
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
            // Vertex AI model names are like "projects/{project}/locations/{location}/publishers/google/models/gemini-2.0-flash"
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

        return NextResponse.json({ models, location });
      }

      case "puter": {
        // Puter.js models are fetched client-side
        return NextResponse.json({ 
          error: "Puter.js models must be fetched client-side",
          models: [] 
        });
      }

      case "pollinations": {
        // Fetch models from Pollinations AI API
        // Supports optional API key for authenticated requests
        try {
          // Build headers - API key is optional
          const headers: Record<string, string> = {
            "Accept": "application/json",
          };
          if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
          }

          // Fetch from multiple endpoints and combine results
          const endpoints = [
            "https://text.pollinations.ai/text/models",
            "https://text.pollinations.ai/v1/models",
            "https://text.pollinations.ai/image/models",
            "https://text.pollinations.ai/audio/models",
          ];

          const allModels: Record<string, { id: string; provider: string; name: string; contextWindow: number; maxTokens: number; supportsThinking: boolean; type?: string }> = {};

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: "GET",
                headers,
              });

              if (response.ok) {
                const data = await response.json();
                const models = data.data || data.models || [];
                
                for (const model of models) {
                  const modelId = model.id || model.name || model.model;
                  if (!modelId || allModels[modelId]) continue;

                  // Determine model type from endpoint
                  let modelType = 'text';
                  if (endpoint.includes('/image/')) modelType = 'image';
                  else if (endpoint.includes('/audio/')) modelType = 'audio';
                  else if (endpoint.includes('/v1/') && !endpoint.includes('/text/')) modelType = 'text';

                  allModels[modelId] = {
                    id: modelId,
                    provider: "pollinations",
                    name: modelId,
                    contextWindow: model.contextWindow || model.context || 131072,
                    maxTokens: model.maxTokens || model.max_tokens || 8192,
                    supportsThinking: modelId.includes('reasoning') || modelId.includes('r1') || modelId.includes('deepseek'),
                    type: modelType,
                  };
                }
              }
            } catch {
              // Continue to next endpoint if one fails
            }
          }

          // If no models found from API, use fallback models
          const models = Object.values(allModels);
          if (models.length === 0) {
            const fallbackModels = [
              { id: "llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false, type: "text" },
              { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false, type: "text" },
              { id: "qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "pollinations", contextWindow: 32768, maxTokens: 8192, supportsThinking: false, type: "text" },
              { id: "qwen-2.5-14b-instruct", name: "Qwen 2.5 14B", provider: "pollinations", contextWindow: 32768, maxTokens: 8192, supportsThinking: false, type: "text" },
              { id: "mistral-nemo-instruct", name: "Mistral Nemo", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false, type: "text" },
              { id: "deepseek-coder-v2-instruct", name: "DeepSeek Coder V2", provider: "pollinations", contextWindow: 163840, maxTokens: 16384, supportsThinking: false, type: "text" },
              { id: "flux", name: "Flux (Image Gen)", provider: "pollinations", contextWindow: 1, maxTokens: 1, supportsThinking: false, type: "image" },
            ];
            return NextResponse.json({ models: fallbackModels });
          }

          return NextResponse.json({ models });
        } catch (error) {
          // Return fallback models on error
          const fallbackModels = [
            { id: "llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false, type: "text" },
            { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false, type: "text" },
            { id: "qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "pollinations", contextWindow: 32768, maxTokens: 8192, supportsThinking: false, type: "text" },
            { id: "qwen-2.5-14b-instruct", name: "Qwen 2.5 14B", provider: "pollinations", contextWindow: 32768, maxTokens: 8192, supportsThinking: false, type: "text" },
            { id: "mistral-nemo-instruct", name: "Mistral Nemo", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false, type: "text" },
            { id: "deepseek-coder-v2-instruct", name: "DeepSeek Coder V2", provider: "pollinations", contextWindow: 163840, maxTokens: 16384, supportsThinking: false, type: "text" },
            { id: "flux", name: "Flux (Image Gen)", provider: "pollinations", contextWindow: 1, maxTokens: 1, supportsThinking: false, type: "image" },
          ];
          return NextResponse.json({ models: fallbackModels });
        }
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
