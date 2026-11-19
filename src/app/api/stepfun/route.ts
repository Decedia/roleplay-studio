import { createBearerProxy } from "@/lib/server/proxy";

// StepFun uses an OpenAI-compatible API.
export const POST = createBearerProxy({
  name: "StepFun",
  baseUrl: "https://api.stepfun.ai/v1",
});
