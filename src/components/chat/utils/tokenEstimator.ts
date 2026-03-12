import type { Message } from "@/lib/types";

// Estimate token count for text (rough approximation: ~4 chars per token)
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

// Extract think content from message content
export const extractThinkContent = (content: string): string | null => {
  const thinkMatch = content.match(/<think\s*>([\s\S]*?)<\/think>/i);
  return thinkMatch ? thinkMatch[1].trim() : null;
};

// Remove think tags from content
export const removeThinkTags = (content: string): string => {
  return content.replace(/<think\s*>[\s\S]*?<\/think>/gi, "").trim();
};

// Truncate messages to fit within max context tokens
export const truncateMessagesToContext = (
  messages: Message[],
  maxContextTokens: number,
  systemPromptTokens: number
): Message[] => {
  // Reserve tokens for system prompt and a buffer for the new message
  const reservedTokens = systemPromptTokens + 1000;
  const availableTokens = maxContextTokens - reservedTokens;
  
  if (availableTokens <= 0) {
    return []; // Not enough space for any messages
  }
  
  // Start from the most recent messages and work backwards
  const result: Message[] = [];
  let totalTokens = 0;
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const thinkContent = extractThinkContent(msg.content);
    const msgTokens = estimateTokens(msg.content) + (thinkContent ? estimateTokens(thinkContent) : 0);
    
    if (totalTokens + msgTokens <= availableTokens) {
      result.unshift(msg);
      totalTokens += msgTokens;
    } else {
      break; // Stop adding messages
    }
  }
  
  return result;
};

// Get total tokens for a set of messages
export const getTotalTokens = (messages: Message[]): number => {
  return messages.reduce((total, msg) => {
    const thinkContent = extractThinkContent(msg.content);
    const contentTokens = estimateTokens(msg.content);
    const thinkTokens = thinkContent ? estimateTokens(thinkContent) : 0;
    return total + contentTokens + thinkTokens;
  }, 0);
};
