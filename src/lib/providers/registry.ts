import {
  LLMProviderType,
  LLMProvider,
  LLMModel,
  ProviderConfig,
  Message,
  ChatResponse,
  StreamCallback,
  TestConnectionResult,
  FetchedModel,
  ThinkingLevel,
  ThinkingBudget,
} from "../types";

export interface ProviderDefinition {
  id: LLMProviderType;
  name: string;
  description: string;
  requiresApiKey: boolean;
  requiresProjectId?: boolean;
  requiresServiceAccount?: boolean;
  supportsProfiles: boolean;
  supportsModelFetch: boolean;
  defaultModel?: string;
  models: LLMModel[];
  chat: (
    messages: Message[],
    config: ProviderConfig,
    options: {
      temperature: number;
      maxTokens: number;
      topP: number;
      topK: number;
      systemPrompt?: string;
      enableThinking?: boolean;
      thinkingLevel?: ThinkingLevel;
      thinkingBudget?: ThinkingBudget;
      abortController?: AbortController;
    }
  ) => Promise<ChatResponse>;
  stream: (
    messages: Message[],
    config: ProviderConfig,
    options: {
      temperature: number;
      maxTokens: number;
      topP: number;
      topK: number;
      systemPrompt?: string;
      enableThinking?: boolean;
      thinkingLevel?: ThinkingLevel;
      thinkingBudget?: ThinkingBudget;
      abortController?: AbortController;
    },
    onChunk: StreamCallback
  ) => Promise<void>;
  connectionTest: (config: ProviderConfig) => Promise<TestConnectionResult>;
  modelFetch?: (
    config: ProviderConfig
  ) => Promise<{ models: FetchedModel[]; error?: string }>;
}

type ProviderRegistryMap = Map<LLMProviderType, ProviderDefinition>;

class ProviderRegistry {
  private providers: ProviderRegistryMap = new Map();

  register(def: ProviderDefinition) {
    if (this.providers.has(def.id)) {
      console.warn(`Provider ${def.id} is already registered. Overwriting.`);
    }
    this.providers.set(def.id, def);
  }

  get(id: LLMProviderType): ProviderDefinition | undefined {
    return this.providers.get(id);
  }

  getAll(): ProviderDefinition[] {
    return Array.from(this.providers.values());
  }

  toLLMProviderArray(): LLMProvider[] {
    return this.getAll().map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      requiresApiKey: p.requiresApiKey,
      requiresProjectId: p.requiresProjectId,
      requiresServiceAccount: p.requiresServiceAccount,
      models: p.models,
    }));
  }

  getDefaultModel(id: LLMProviderType): string | undefined {
    return this.get(id)?.defaultModel;
  }
}

export const providerRegistry = new ProviderRegistry();

export type { ProviderRegistryMap };
