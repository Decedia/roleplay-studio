import { createBearerProxy } from "@/lib/server/proxy";

export const POST = createBearerProxy({
  name: "Open Router",
  baseUrl: "https://openrouter.ai/api/v1",
  // Optional attribution headers OpenRouter shows on its dashboard.
  extraHeaders: (request) => ({
    "HTTP-Referer": request.headers.get("origin") || "https://roleplay-studio.vercel.app",
    "X-Title": "Roleplay Studio",
  }),
});
