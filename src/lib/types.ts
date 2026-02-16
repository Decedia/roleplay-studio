// Core types for the chat application

// User persona (who the user is roleplaying as)
export interface Persona {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

// AI character (who the AI roleplays as)
export interface Character {
  id: string;
  name: string;
  description: string;
  firstMessage: string;
  // SillyTavern extended fields
  mesExample?: string;
  scenario?: string;
  creatorNotes?: string;
  tags?: string[];
  avatar?: string; // URL or base64
  // System prompt for advanced users
  systemPrompt?: string;
  createdAt: number;
}

// SillyTavern Character Card V2 format
export interface SillyTavernCharacterCard {
  // V1 fields
  name: string;
  description: string;
  first_mes: string;
  mes_example?: string;
  scenario?: string;
  creator_notes?: string;
  tags?: string[];
  avatar?: string;
  // V2 fields
  spec?: string;
  spec_version?: string;
  data?: {
    name: string;
    description: string;
    first_mes: string;
    mes_example?: string;
    scenario?: string;
    creator_notes?: string;
    tags?: string[];
    avatar?: string;
    extensions?: Record<string, unknown>;
  };
}

// Chat message
export interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string; // For AI reasoning display
}

// Conversation between a persona and character
export interface Conversation {
  id: string;
  personaId: string;
  characterId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// LLM Provider types
export type LLMProviderType = "puter" | "google-ai-studio" | "google-vertex" | "nvidia-nim";

export interface LLMProvider {
  id: LLMProviderType;
  name: string;
  description: string;
  requiresApiKey: boolean;
  requiresProjectId?: boolean; // For Vertex AI
  requiresServiceAccount?: boolean; // For Vertex AI
  models: LLMModel[];
}

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProviderType;
  contextWindow?: number;
  maxTokens?: number;
  supportsThinking?: boolean;
}

// Provider configurations (stored in localStorage)
export interface ProviderConfig {
  type: LLMProviderType;
  apiKey?: string;
  projectId?: string; // For Vertex AI
  serviceAccountJson?: string; // For Vertex AI
  selectedModel?: string;
  isEnabled: boolean;
}

// Global settings
export interface GlobalSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  modelId: string;
  enableThinking: boolean;
  activeProvider: LLMProviderType;
}

// Model cost structure
export interface ModelCost {
  currency?: string;
  tokens?: number;
  input?: number;
  output?: number;
}

// Model from puter.ai.listModels()
export interface Model {
  id: string;
  provider?: string;
  name?: string;
  aliases?: string[];
  context?: number;
  max_tokens?: number;
  cost?: ModelCost;
}

// Puter.js types
export interface PuterUser {
  username: string;
  email?: string;
  uuid: string;
}

export interface PuterUsage {
  ai_chat_tokens?: number;
  ai_image_generations?: number;
  storage_bytes?: number;
  [key: string]: number | undefined;
}

export interface PuterAppUsage {
  app_id?: string;
  ai_chat_tokens?: number;
  ai_image_generations?: number;
  storage_bytes?: number;
  [key: string]: string | number | undefined;
}
