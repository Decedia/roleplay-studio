import { NextRequest, NextResponse } from "next/server";
import { abortControllerStore } from "@/lib/abortControllerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId } = body;

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    const controller = abortControllerStore.get(requestId);
    if (!controller) {
      return NextResponse.json(
        { error: "Request not found or already completed" },
        { status: 404 }
      );
    }

    controller.abort();
    abortControllerStore.delete(requestId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
