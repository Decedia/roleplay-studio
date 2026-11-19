import { createBearerProxy } from "@/lib/server/proxy";

export const POST = createBearerProxy({
  name: "Groq",
  baseUrl: "https://api.groq.com/openai/v1",
});
