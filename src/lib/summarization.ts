// Summarization service for roleplay conversations
// Reuses existing provider system for LLM calls

import { sendChatMessage, type ProviderConfig, type Message } from "./providers";
import { estimateTokens } from "@/components/chat/utils/tokenEstimator";

// Summarization quality levels
export type SummarizationQuality = "fast" | "balanced" | "detailed";

// Summarization trigger modes
export type SummarizationTrigger = "manual" | "auto-length" | "periodic";

// Summarization configuration
export interface SummarizationConfig {
  enabled: boolean;
  trigger: SummarizationTrigger;
  quality: SummarizationQuality;
  // Override model for summarization (e.g., cheaper/faster model)
  overrideModel?: string;
  overrideProvider?: string;
  // Override temperature for summarization
  temperature?: number;
  // For auto-length trigger
  messageThreshold?: number; // Trigger when message count exceeds this
  tokenThreshold?: number; // Trigger when estimated tokens exceed this
  // For periodic trigger
  periodicInterval?: number; // Summarize every N messages
  // How many recent messages to keep untouched
  recentMessagesCount?: number;
  // Max tokens for summary output (overrides quality default)
  summaryLength?: number;
}

// Summarization result
export interface SummarizationResult {
  summary: string;
  messagesSummarized: number;
  error?: string;
}

// Default summarization config
export const DEFAULT_SUMMARIZATION_CONFIG: SummarizationConfig = {
  enabled: false,
  trigger: "manual",
  quality: "balanced",
  messageThreshold: 30,
  tokenThreshold: 12000,
  periodicInterval: 10,
  recentMessagesCount: 10,
};

// Quality-specific settings
const QUALITY_SETTINGS: Record<SummarizationQuality, { maxTokens: number; temperature: number }> = {
  fast: { maxTokens: 500, temperature: 0.3 },
  balanced: { maxTokens: 1000, temperature: 0.4 },
  detailed: { maxTokens: 2000, temperature: 0.5 },
};

// Build the summarization system prompt
function buildSummarizationSystemPrompt(quality: SummarizationQuality, maxTokens: number): string {
  const depthMap: Record<SummarizationQuality, string> = {
    fast: "Create a very concise summary focusing only on the most critical plot points and character developments.",
    balanced: "Create a balanced summary that captures important plot points, character relationships, emotional context, and key decisions while remaining compact.",
    detailed: "Create a comprehensive summary that thoroughly captures plot developments, character dynamics, emotional undertones, relationship changes, world-building details, and foreshadowing. Prioritize information density.",
  };

  return `You are a narrative summarizer for a roleplay conversation. Your task is to compress the conversation while preserving:
- Important plot points and story progression
- Character relationships and dynamics
- Emotional context and atmosphere
- Key actions, decisions, and their consequences
- Unresolved threads and ongoing tensions
- Character voice and speaking patterns
- Important world-building details established in the conversation
- Any instructions or constraints the User has given to the Character

${depthMap[quality]}

CRITICAL: The summary must maintain enough detail that the Character can continue responding in full context, following all previously given instructions. Do not summarize away important details that would cause the Character to act inconsistently with established dynamics.

Format the output as structured paragraphs. Be information-dense. Avoid filler, repetition, or obvious statements. Write in present tense. Refer to characters by name.`;
}

// Format messages for summarization input
function formatMessagesForSummary(
  messages: Message[],
  previousSummary: string | null
): string {
  let input = "";

  if (previousSummary) {
    input += `[Previous Summary]\n${previousSummary}\n\n[New Messages to Summarize]\n`;
  } else {
    input += "[Conversation to Summarize]\n";
  }

  for (const msg of messages) {
    const roleLabel = msg.role === "user" ? "User" : "Character";
    // Strip think tags from assistant messages for cleaner summaries
    const content = msg.content
      .replace(/<think\s*>[\s\S]*?<\/think>/gi, "")
      .trim();
    if (!content) continue;
    input += `${roleLabel}: ${content}\n\n`;
  }

  return input;
}

// Core summarization function
export async function summarizeConversation({
  messages,
  previousSummary,
  config,
  providerConfig,
  customInstructions,
}: {
  messages: Message[];
  previousSummary: string | null;
  config: SummarizationConfig;
  providerConfig: ProviderConfig;
  customInstructions?: string;
  summaryLength?: number; // Max tokens for summary output
}): Promise<SummarizationResult> {
  if (messages.length === 0) {
    return { summary: previousSummary || "", messagesSummarized: 0 };
  }

  const quality = config.quality || "balanced";
  const qualitySettings = QUALITY_SETTINGS[quality];
  
  // Override max tokens with summaryLength if provided
  const maxSummaryTokens = config.summaryLength ?? qualitySettings.maxTokens;

  let systemPrompt = buildSummarizationSystemPrompt(quality, maxSummaryTokens);
  
  // Append custom instructions if provided
  if (customInstructions?.trim()) {
    systemPrompt += `\n\n[Custom Instructions]\n${customInstructions}`;
  }
  
  const userInput = formatMessagesForSummary(messages, previousSummary);

  const summarizationMessages: Message[] = [
    { role: "user", content: userInput },
  ];

  // Build provider config, optionally with model override
  const effectiveConfig: ProviderConfig = {
    ...providerConfig,
  };

  if (config.overrideModel) {
    effectiveConfig.selectedModel = config.overrideModel;
  }

  const effectiveTemperature = config.temperature ?? qualitySettings.temperature;

  try {
    const response = await sendChatMessage(
      summarizationMessages,
      effectiveConfig,
      {
        temperature: effectiveTemperature,
        maxTokens: maxSummaryTokens,
        topP: 0.9,
        topK: 40,
        systemPrompt,
        enableThinking: false,
      }
    );

    if (response.error) {
      return {
        summary: previousSummary || "",
        messagesSummarized: 0,
        error: response.error,
      };
    }

    return {
      summary: response.content?.trim() || previousSummary || "",
      messagesSummarized: messages.length,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Summarization failed";
    return {
      summary: previousSummary || "",
      messagesSummarized: 0,
      error: errorMessage,
    };
  }
}

// Determine if summarization should be triggered based on config
export function shouldTriggerSummarization(
  messages: Message[],
  lastSummarizedIndex: number,
  config: SummarizationConfig
): boolean {
  if (!config.enabled || config.trigger === "manual") return false;

  const unsummarizedMessages = messages.slice(lastSummarizedIndex);
  const unsummarizedCount = unsummarizedMessages.length;

  if (unsummarizedCount === 0) return false;

  if (config.trigger === "auto-length") {
    const threshold = config.messageThreshold ?? 30;
    const tokenThreshold = config.tokenThreshold ?? 12000;

    // Check message count
    if (unsummarizedCount >= threshold) return true;

    // Check token count
    const totalTokens = unsummarizedMessages.reduce(
      (sum, msg) => sum + estimateTokens(msg.content),
      0
    );
    if (totalTokens >= tokenThreshold) return true;

    return false;
  }

  if (config.trigger === "periodic") {
    const interval = config.periodicInterval ?? 10;
    if (unsummarizedCount >= interval) return true;
    return false;
  }

  return false;
}

// Get messages to summarize (all except recent N)
export function getMessagesToSummarize(
  messages: Message[],
  lastSummarizedIndex: number,
  recentCount: number
): Message[] {
  const unsummarized = messages.slice(lastSummarizedIndex);
  // Keep the last `recentCount` messages untouched
  if (unsummarized.length <= recentCount) return [];
  return unsummarized.slice(0, unsummarized.length - recentCount);
}

// Get the new lastSummarizedIndex after summarization
export function getNewSummarizedIndex(
  messages: Message[],
  recentCount: number
): number {
  return Math.max(0, messages.length - recentCount);
}

// Estimate tokens for a summary string (for context budget calculations)
export function estimateSummaryTokens(summary: string): number {
  return estimateTokens(summary);
}
