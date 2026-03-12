import type { LLMProviderType } from "@/lib/types";
import type { Message } from "@/lib/types";

// Helper function to get thought signature for Gemini models
export const getThoughtSignature = (
  modelId: string,
  provider: LLMProviderType
): { signature: string; modelName: string } | null => {
  if (provider !== "google-ai-studio" && provider !== "google-vertex") {
    return null;
  }
  
  const modelLower = modelId.toLowerCase();
  
  if (modelLower.includes("flash")) {
    return { signature: "⚡ Flash", modelName: "Gemini 2.0 Flash" };
  } else if (modelLower.includes("pro")) {
    return { signature: "🔮 Pro", modelName: "Gemini 2.0 Pro" };
  } else if (modelLower.includes("ultra")) {
    return { signature: "👑 Ultra", modelName: "Gemini Ultra" };
  } else if (modelLower.includes("1.5")) {
    return { signature: "✨ 1.5", modelName: "Gemini 1.5" };
  }
  
  return { signature: "🔷 Gemini", modelName: "Gemini" };
};

// Filter messages to exclude continue messages
export const filterOutContinueMessages = (messages: Message[]): Message[] => {
  return messages.filter(m => !m.isContinue);
};

// Find the last user message in an array
export const findLastUserMessage = (
  messages: Array<{ role: "user" | "assistant"; content: string }>
): string | null => {
  const lastUserMsg = messages.filter(m => m.role === "user").pop();
  return lastUserMsg?.content || null;
};

// Extract JSON from AI response content
export const extractJsonFromContent = (content: string): Record<string, unknown> | null => {
  // Try to find JSON in code blocks first
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  
  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.name && parsed.description) {
        return parsed;
      }
    } catch {
      // Invalid JSON, continue searching
    }
  }
  
  // Also try to find raw JSON objects in the content
  const jsonObjectRegex = /\{[\s\S]*?"name"[\s\S]*?"description"[\s\S]*?\}/g;
  while ((match = jsonObjectRegex.exec(content)) !== null) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // Invalid JSON, continue searching
    }
  }
  
  return null;
};

// Extract instructions from code blocks
export const extractInstructions = (content: string): string[] => {
  const regex = /```instructions\n([\s\S]*?)```/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
};
