import { createBearerProxy } from "@/lib/server/proxy";

export const POST = createBearerProxy({
  name: "NVIDIA NIM",
  baseUrl: "https://integrate.api.nvidia.com/v1",
  timeoutHint: "NVIDIA NIM models can be slow. Try another model, fewer max tokens, or try again later.",
});
