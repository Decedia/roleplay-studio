import { NextRequest, NextResponse } from "next/server";

// NVIDIA NIM API proxy to avoid CORS issues
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, payload } = body;

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
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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

    const data = await response.json();

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
