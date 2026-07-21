// Storage utilities for localStorage operations
import {
  Persona,
  Character,
  Conversation,
  GlobalSettings,
  GlobalInstructions,
  ProviderConfig,
  AutoExportSettings,
} from "./types";

// Persona storage
export const loadPersonas = (): Persona[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("personas");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const savePersonas = (personas: Persona[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("personas", JSON.stringify(personas));
};

// Character storage
export const loadCharacters = (): Character[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("characters");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCharacters = (characters: Character[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("characters", JSON.stringify(characters));
};

// Conversation storage
export const loadConversations = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("conversations");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveConversations = (conversations: Conversation[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("conversations", JSON.stringify(conversations));
};

// Global settings storage
export const loadGlobalSettings = (): GlobalSettings => {
  if (typeof window === "undefined") return {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    topK: 40,
    modelId: "gemini-2.0-flash",
    enableThinking: false,
    thinkingLevel: "MEDIUM",
    thinkingBudget: "NONE",
    activeProvider: "google-ai-studio",
    instructionInjectionPosition: "start",
    instructionCustomInjectionIndex: 0,
  };
  try {
    const data = localStorage.getItem("globalSettings");
    return data ? JSON.parse(data) : {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      topK: 40,
      modelId: "gemini-2.0-flash",
      enableThinking: false,
      thinkingLevel: "MEDIUM",
      thinkingBudget: "NONE",
      activeProvider: "google-ai-studio",
      instructionInjectionPosition: "start",
      instructionCustomInjectionIndex: 0,
    };
  } catch {
    return {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      topK: 40,
      modelId: "gemini-2.0-flash",
      enableThinking: false,
      thinkingLevel: "MEDIUM",
      thinkingBudget: "NONE",
      activeProvider: "google-ai-studio",
      instructionInjectionPosition: "start",
      instructionCustomInjectionIndex: 0,
    };
  }
};

export const saveGlobalSettings = (settings: GlobalSettings): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("globalSettings", JSON.stringify(settings));
};

// Global instructions storage
export const loadGlobalInstructions = (): GlobalInstructions => {
  if (typeof window === "undefined") return {
    instructions: [],
    imageGenerationInstructions: "",
  };
  try {
    const data = localStorage.getItem("globalInstructions");
    return data ? JSON.parse(data) : {
      instructions: [],
      imageGenerationInstructions: "",
    };
  } catch {
    return {
      instructions: [],
      imageGenerationInstructions: "",
    };
  }
};

export const saveGlobalInstructions = (instructions: GlobalInstructions): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("globalInstructions", JSON.stringify(instructions));
};

// Provider configs storage
export const loadProviderConfigs = (): Record<string, ProviderConfig> => {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem("providerConfigs");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveProviderConfigs = (configs: Record<string, ProviderConfig>): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("providerConfigs", JSON.stringify(configs));
};

// Auto export settings storage
export const loadAutoExport = (): AutoExportSettings => {
  if (typeof window === "undefined") return {
    enabled: false,
    intervalMinutes: 60,
    includeConversations: true,
    includeCharacters: true,
    includePersonas: true,
  };
  try {
    const data = localStorage.getItem("autoExport");
    return data ? JSON.parse(data) : {
      enabled: false,
      intervalMinutes: 60,
      includeConversations: true,
      includeCharacters: true,
      includePersonas: true,
    };
  } catch {
    return {
      enabled: false,
      intervalMinutes: 60,
      includeConversations: true,
      includeCharacters: true,
      includePersonas: true,
    };
  }
};

export const saveAutoExport = (settings: AutoExportSettings): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("autoExport", JSON.stringify(settings));
};

// Summarization utility
export const summarizeConversation = (conversation: Conversation): string => {
  // Basic summarization - just return the first user message
  const firstUserMessage = conversation.messages.find(m => m.role === "user");
  return firstUserMessage?.content.substring(0, 100) || "Conversation summary";
};