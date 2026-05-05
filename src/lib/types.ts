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
  id?: string; // Optional ID for tracking
  role: "system" | "user" | "assistant";
  content: string;
  isContinue?: boolean; // Flag for continue instruction messages (hidden in UI)
  signature?: string; // Model signature (e.g., "Gemini Flash")
  modelName?: string; // Full model name for display
  timestamp?: number; // Message timestamp
}

// Conversation between a persona and character
export interface Conversation {
  id: string;
  personaId: string;
  characterId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  // Summarization fields
  summaryMemory?: string; // Compressed past context from summarization
  lastSummarizedIndex?: number; // Index of last message included in summary
}

// Generator conversation (standalone session for character generation)
export interface GeneratorConversation {
  id: string;
  name?: string;
  messages: Array<{role: "user" | "assistant", content: string, isContinue?: boolean}>;
  createdAt: number;
  updatedAt: number;
}

// Brainstorm conversation (standalone session for instruction brainstorming)
export interface BrainstormConversation {
  id: string;
  name?: string;
  messages: Array<{role: "user" | "assistant", content: string, isContinue?: boolean}>;
  createdAt: number;
  updatedAt: number;
}

// LLM Provider types
export type LLMProviderType = "google-ai-studio" | "google-vertex" | "nvidia-nim" | "groq" | "open-router" | "kobold-horde";

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

// Provider profile for storing multiple API keys
// Each profile represents a different API key/project combination
export interface ProviderProfile {
  id: string;
  name: string; // Profile name (project name or date/time)
  apiKey?: string;
  projectId?: string; // For Vertex AI
  serviceAccountJson?: string; // For Vertex AI
  vertexMode?: VertexMode; // For Vertex AI
  vertexLocation?: VertexLocation; // For Vertex AI
  accessToken?: string; // For Vertex AI
  selectedModel?: string;
  createdAt: number;
}

// Provider configurations (stored in localStorage)
export interface ProviderConfig {
  type: LLMProviderType;
  // Legacy properties for backward compatibility
  apiKey?: string;
  projectId?: string; // For Vertex AI
  serviceAccountJson?: string; // For Vertex AI
  vertexMode?: VertexMode; // For Vertex AI: express (API key only) or full (project ID + service account)
  vertexLocation?: VertexLocation; // For Vertex AI: server location
  selectedModel?: string;
  // New profile-based storage
  profiles: ProviderProfile[];
  activeProfileId: string | null;
  isEnabled: boolean;
}

// Thinking level for Gemini models
export type ThinkingLevel = "LOW" | "MEDIUM" | "HIGH";
export type ThinkingBudget = "NONE" | "LOW" | "MEDIUM" | "HIGH";

// Instruction injection position for system prompts
export type InstructionInjectionPosition = "start" | "before-last" | "custom-index";

// Global settings
export interface GlobalSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  modelId: string;
  enableThinking: boolean;
  thinkingLevel: ThinkingLevel; // Thinking level for Gemini models (LOW/MEDIUM/HIGH)
  thinkingBudget: ThinkingBudget; // Thinking budget for Gemini 2.5 models
  activeProvider: LLMProviderType;
  instructionInjectionPosition: "start" | "before-last" | "custom-index";
  instructionCustomInjectionIndex: number;
  // Legacy properties for compatibility
  provider?: LLMProviderType;
  summarization?: {
    enabled: boolean;
    maxContextLength: number;
    summaryTrigger: number;
  };
}

// Instruction role type - who the instruction appears to be from
export type InstructionRole = "system" | "user" | "assistant";

// Instruction position type - where in the message flow it goes
export type InstructionPosition = "before_context" | "after_context" | "inline_with_message";

// Individual instruction entry (SillyTavern-style)
export interface Instruction {
  id: string;
  name: string; // User-friendly name for tracking
  content: string; // The instruction text
  role: InstructionRole; // Who this instruction appears to be from
  position: InstructionPosition; // Before or after context, or inline with message
  enabled: boolean; // Whether this instruction is active
  order: number; // For sorting within position
  inlineIndex?: number; // Index for inline_with_message position (0 = after last user message, 1 = before that, etc.)
}

// Instruction preset for saving/loading instruction lists
export interface InstructionPreset {
  id: string;
  name: string;
  instructions: Instruction[];
  createdAt: number;
  updatedAt: number;
}

// Global instructions (SillyTavern-style)
export interface GlobalInstructions {
  // Instruction list (SillyTavern-style)
  instructions: Instruction[];
  // Legacy field - image generation instructions (kept for compatibility)
  imageGenerationInstructions?: string;
  // Advanced instruction fields
  formattingPrompt?: string;
  enableJailbreak?: boolean;
  jailbreakInstructions?: string;
  continueInstruction?: string;
  // Mode-specific instructions
  generatorInstructions?: string;
  brainstormInstructions?: string;
  vnInstructions?: string;
}

// Model cost structure
export interface ModelCost {
  currency?: string;
  tokens?: number;
  input?: number;
  output?: number;
}

// Missing types for Chat component
export type ViewType = "home" | "chat" | "generator" | "brainstorm" | "vn";

export interface FetchedModel {
   id: string;
   provider: string;
   name: string;
   context?: number;
   max_tokens?: number;
   supportsThinking?: boolean;
   workerCount?: number;
   performance?: number;
 }

export interface ConnectionStatus {
  status: "disconnected" | "connecting" | "connected" | "error";
  message?: string;
}

export interface AutoExportSettings {
  enabled: boolean;
  intervalMinutes: number;
  includeConversations: boolean;
  includeCharacters: boolean;
  includePersonas: boolean;
}

export interface LastSession {
  conversationId: string;
  timestamp: number;
}
