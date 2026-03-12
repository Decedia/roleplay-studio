// Storage keys for localStorage persistence
export const STORAGE_KEYS = {
  PERSONAS: "chat_personas",
  CHARACTERS: "chat_characters",
  CONVERSATIONS: "chat_conversations",
  GLOBAL_INSTRUCTIONS: "chat_global_instructions",
  GLOBAL_SETTINGS: "chat_global_settings",
  PROVIDER_CONFIGS: "chat_provider_configs",
  ACTIVE_PROVIDER: "chat_active_provider",
  CONNECTION_STATUS: "chat_connection_status",
  AUTO_EXPORT: "chat_auto_export",
  BRAINSTORM_INSTRUCTIONS: "chat_brainstorm_instructions",
  BRAINSTORM_MESSAGES: "chat_brainstorm_messages",
  GENERATOR_INSTRUCTIONS: "chat_generator_instructions",
  GENERATOR_MESSAGES: "chat_generator_messages",
  GENERATOR_SESSIONS: "chat_generator_sessions",
  BRAINSTORM_SESSIONS: "chat_brainstorm_sessions",
  LAST_SESSION: "chat_last_session",
} as const;

// Get provider-specific config key
export const getProviderConfigKey = (providerType: string) => `chat_provider_${providerType}`;

// View types for the application
export type ViewType = "home" | "personas" | "characters" | "conversations" | "chat" | "generator" | "brainstorm" | "vn-generator";

export interface LastSession {
  view: ViewType;
  personaId?: string;
  characterId?: string;
  conversationId?: string;
  generatorMessages?: Array<{role: "user" | "assistant", content: string}>;
  brainstormMessages?: Array<{role: "user" | "assistant", content: string}>;
  timestamp: number;
}

// Auto-export settings interface
export interface AutoExportSettings {
  enabled: boolean;
  intervalMinutes: number;
}

export const DEFAULT_AUTO_EXPORT: AutoExportSettings = {
  enabled: false,
  intervalMinutes: 5,
};
