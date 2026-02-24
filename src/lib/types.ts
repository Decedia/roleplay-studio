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
  // Instruction fields (SillyTavern style)
  systemPrompt?: string; // Main system prompt override
  postHistoryInstructions?: string; // Instructions after chat history
  characterBook?: CharacterBook; // Lorebook for dynamic context
  // Alternate greetings
  alternateGreetings?: string[];
  createdAt: number;
}

// Character Book (Lorebook) - dynamic context based on keywords
export interface CharacterBook {
  entries: CharacterBookEntry[];
  scanDepth?: number; // How many messages to scan for keywords
  tokenBudget?: number; // Max tokens for lorebook content
  recursiveScanning?: boolean; // Scan triggered entries for more keywords
}

export interface CharacterBookEntry {
  id: number;
  keys: string[]; // Keywords that trigger this entry
  secondaryKeys?: string[]; // Additional keywords (optional)
  content: string; // The content to insert
  extensions?: Record<string, unknown>;
  enabled: boolean;
  insertionOrder: number; // Order of insertion (lower = earlier)
  caseSensitive?: boolean;
  name?: string; // Entry name for organization
  priority?: number; // Higher priority = more important
  position?: "before_char" | "after_char" | "before_example" | "after_example";
  // Exclusion/inclusion
  excludeRecursion?: boolean;
  preventRecursion?: boolean;
  // Selective logic
  selectiveLogic?: number; // 0 = AND, 1 = NOT, 2 = NOT OR
  group?: string;
  groupOverride?: boolean;
  // Metadata
  comment?: string;
  constant?: boolean; // Always include
  depth?: number; // How far back to insert
  selectivity?: number;
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
  // V2 instruction fields
  system_prompt?: string;
  post_history_instructions?: string;
  character_book?: CharacterBook;
  alternate_greetings?: string[];
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
    system_prompt?: string;
    post_history_instructions?: string;
    character_book?: CharacterBook;
    alternate_greetings?: string[];
    extensions?: Record<string, unknown>;
  };
}

// Chat message
export interface Message {
  role: "system" | "user" | "assistant";
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

// Vertex AI mode type
export type VertexMode = "express" | "full";

// Vertex AI locations
export type VertexLocation = "global" | "us-central1" | "us-east1" | "us-west1" | "europe-west1" | "europe-west4" | "asia-east1" | "asia-northeast1" | "asia-southeast1";

// Vertex AI project configuration
export interface VertexProjectConfig {
  projectId: string;
  apiKey: string;
  createdAt: number;
}

// Provider configurations (stored in localStorage)
export interface ProviderConfig {
  type: LLMProviderType;
  apiKey?: string;
  projectId?: string; // For Vertex AI
  serviceAccountJson?: string; // For Vertex AI
  vertexMode?: VertexMode; // For Vertex AI: express (API key only) or full (project ID + service account)
  vertexLocation?: VertexLocation; // For Vertex AI: server location
  selectedModel?: string;
  isEnabled: boolean;
  // Vertex AI project configurations
  vertexProjects?: VertexProjectConfig[];
  // Currently selected project index
  selectedVertexProjectIndex?: number;
}

// Global settings
export interface GlobalSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  modelId: string;
  enableThinking: boolean;
  activeProvider: LLMProviderType;
}

// Global instructions with advanced fields
export interface GlobalInstructions {
  // Basic instructions
  customInstructions: string;
  // Advanced instructions
  systemPrompt?: string;
  postHistoryInstructions?: string;
  jailbreakInstructions?: string;
  enableJailbreak: boolean;
  // Continue instruction for incomplete responses
  continueInstruction?: string;
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
