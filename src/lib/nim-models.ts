// Helpers for NVIDIA NIM's live model list (https://integrate.api.nvidia.com/v1/models).
// The list changes often and mixes chat models with embedding, vision, speech and
// safety models, so the app never hardcodes a NIM model id for testing.

const NON_CHAT_PATTERN =
  /embed|rerank|retriever|reward|guard|safety|shield|clip|parse|ocr|vila|neva|kosmos|deplot|paligemma|fuyu|vision|detect|riva|asr|tts|audio|speech|cosmos|flux|diffusion|sdxl|bge-|nv-embed|translate|pii|topic-control|content-filter/i;

// True when a NIM model id looks like a text chat model.
export const isNimChatModel = (id: string): boolean => !NON_CHAT_PATTERN.test(id);

// Small, fast chat models tried first when the user has not picked a model yet.
const PREFERRED_TEST_MODELS = [
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.3-70b-instruct",
  "mistralai/mistral-small-24b-instruct",
];

// Pick the model a connection test should call: the user's model if NVIDIA still
// serves it, else a preferred small model, else the first chat model in the list.
export const pickNimTestModel = (
  availableIds: string[],
  selectedModel?: string
): string | undefined => {
  if (selectedModel && availableIds.includes(selectedModel)) return selectedModel;
  const chatIds = availableIds.filter(isNimChatModel);
  return PREFERRED_TEST_MODELS.find((id) => chatIds.includes(id)) ?? chatIds[0];
};
