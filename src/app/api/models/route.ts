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

      case "google-ai-studio":
      case "google-vertex": {
        if (!apiKey) {
          return NextResponse.json(
            { error: "API key is required for Google AI" },
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
        
        // Transform Google AI models to our format
        const models = (data.models || [])
          .filter((model: { supportedGenerationMethods?: string[] }) => 
            model.supportedGenerationMethods?.includes("generateContent")
          )
          .map((model: { name: string; displayName?: string }) => ({
            id: model.name.replace("models/", ""),
            provider: provider,
            name: model.displayName || model.name.replace("models/", ""),
          }));

        return NextResponse.json({ models });
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
