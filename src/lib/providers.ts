// LLM Provider implementations

import {
  LLMProviderType,
  LLMProvider,
  LLMModel,
  ProviderConfig,
  Message,
  VertexMode,
  VertexLocation,
  ThinkingLevel,
  ThinkingBudget,
} from "./types";

// Re-export types for convenience
export type { LLMProviderType, ProviderConfig, Message, LLMModel, LLMProvider, VertexMode, VertexLocation, ThinkingLevel, ThinkingBudget };

// Available providers configuration
export const AVAILABLE_PROVIDERS: LLMProvider[] = [
  {
    id: "google-ai-studio",
    name: "Google AI Studio",
    description: "Google's Gemini models via AI Studio API",
    requiresApiKey: true,
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google-ai-studio",
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsThinking: true,
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        provider: "google-ai-studio",
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        provider: "google-ai-studio",
        contextWindow: 2097152,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        provider: "google-ai-studio",
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsThinking: false,
      },
    ],
  },
  {
    id: "google-vertex",
    name: "Google Vertex AI",
    description: "Enterprise Google AI via Vertex AI platform",
    requiresApiKey: true,
    requiresProjectId: true,
    requiresServiceAccount: true,
    models: [
      {
        id: "gemini-3.1-flash-lite-preview",
        name: "Gemini 3.1 Flash-Lite Preview",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 65536,
        supportsThinking: false,
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro Preview",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 65536,
        supportsThinking: true,
      },
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash Preview",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 65536,
        supportsThinking: true,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 65536,
        supportsThinking: true,
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 65536,
        supportsThinking: true,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash-Lite",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 65536,
        supportsThinking: false,
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsThinking: true,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        provider: "google-vertex",
        contextWindow: 2097152,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        provider: "google-vertex",
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsThinking: false,
      },
    ],
  },
  {
    id: "nvidia-nim",
    name: "NVIDIA NIM",
    description: "NVIDIA's AI models via NIM API",
    requiresApiKey: true,
    models: [
      {
        id: "deepseek-ai/deepseek-r1",
        name: "DeepSeek R1",
        provider: "nvidia-nim",
        contextWindow: 131072,
        maxTokens: 16384,
        supportsThinking: true,
      },
      {
        id: "z-ai/glm4.7",
        name: "GLM 4.7",
        provider: "nvidia-nim",
        contextWindow: 131072,
        maxTokens: 16384,
        supportsThinking: false,
      },
      {
        id: "meta/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B Instruct",
        provider: "nvidia-nim",
        contextWindow: 131072,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "mistralai/mistral-large",
        name: "Mistral Large",
        provider: "nvidia-nim",
        contextWindow: 131072,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "mistralai/codestral-22b-instruct-v0.1",
        name: "Codestral 22B",
        provider: "nvidia-nim",
        contextWindow: 32768,
        maxTokens: 4096,
        supportsThinking: false,
      },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Fast AI inference with free tier - supports Llama, Mixtral, and Gemma models",
    requiresApiKey: true,
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B Versatile",
        provider: "groq",
        contextWindow: 8192,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "llama-3.1-70b-versatile",
        name: "Llama 3.1 70B Versatile",
        provider: "groq",
        contextWindow: 8192,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        provider: "groq",
        contextWindow: 8192,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        provider: "groq",
        contextWindow: 32768,
        maxTokens: 32768,
        supportsThinking: false,
      },
      {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        provider: "groq",
        contextWindow: 8192,
        maxTokens: 8192,
        supportsThinking: false,
      },
    ],
  },
  {
    id: "open-router",
    name: "Open Router",
    description: "Access to 300+ LLMs via Open Router API - supports OpenAI, Anthropic, Meta, and more",
    requiresApiKey: true,
    models: [
      {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "open-router",
        contextWindow: 200000,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "anthropic/claude-3-opus",
        name: "Claude 3 Opus",
        provider: "open-router",
        contextWindow: 200000,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "openai/gpt-4o",
        name: "GPT-4o",
        provider: "open-router",
        contextWindow: 128000,
        maxTokens: 16384,
        supportsThinking: false,
      },
      {
        id: "openai/gpt-4o-mini",
        name: "GPT-4o Mini",
        provider: "open-router",
        contextWindow: 128000,
        maxTokens: 16384,
        supportsThinking: false,
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B",
        provider: "open-router",
        contextWindow: 128000,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "deepseek/deepseek-chat",
        name: "DeepSeek Chat",
        provider: "open-router",
        contextWindow: 64000,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "deepseek/deepseek-reasoner",
        name: "DeepSeek Reasoner",
        provider: "open-router",
        contextWindow: 64000,
        maxTokens: 8192,
        supportsThinking: true,
      },
      {
        id: "google/gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "open-router",
        contextWindow: 1048576,
        maxTokens: 8192,
        supportsThinking: true,
      },
      {
        id: "mistralai/mistral-large",
        name: "Mistral Large",
        provider: "open-router",
        contextWindow: 128000,
        maxTokens: 8192,
        supportsThinking: false,
      },
      {
        id: "qwen/qwen2.5-72b-instruct",
        name: "Qwen 2.5 72B",
        provider: "open-router",
        contextWindow: 32768,
        maxTokens: 8192,
        supportsThinking: false,
      },
    ],
  },
  {
    id: "kobold-horde",
    name: "KoboldAI Horde",
    description: "Distributed AI text generation via KoboldAI Horde network",
    requiresApiKey: true,
    models: [
      {
        id: "koboldcpp/Llama-3.1-8B-Stheno-v3.4",
        name: "Llama 3.1 8B Stheno v3.4",
        provider: "kobold-horde",
        contextWindow: 8192,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "koboldcpp/L3-8B-Stheno-v3.2",
        name: "L3 8B Stheno v3.2",
        provider: "kobold-horde",
        contextWindow: 8192,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "koboldcpp/mini-magnum-12b-v1.1",
        name: "Mini Magnum 12B v1.1",
        provider: "kobold-horde",
        contextWindow: 4096,
        maxTokens: 2048,
        supportsThinking: false,
      },
      {
        id: "koboldcpp/Gemma-4-31B-it",
        name: "Gemma 4 31B Instruct",
        provider: "kobold-horde",
        contextWindow: 8192,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "koboldcpp/Cydonia-24B-v4.3",
        name: "Cydonia 24B v4.3",
        provider: "kobold-horde",
        contextWindow: 8192,
        maxTokens: 4096,
        supportsThinking: false,
      },
    ],
  },
];

// Chat response interface
export interface ChatResponse {
  content?: string;
  thinking?: string;
  error?: string;
}

// Streaming callback type
export type StreamCallback = (chunk: { content?: string; thinking?: string; done?: boolean; error?: string }) => void;

// Base chat function type
type ChatFunction = (
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

// Google AI Studio chat implementation
export const chatWithGoogleAIStudio: ChatFunction = async (
  messages,
  config,
  options
) => {
  if (!config.apiKey) {
    return { error: "Google AI Studio API key is required" };
  }

try {
    // Extract system messages from instruction messages for Gemini API
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    // Format non-system messages for Gemini API
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Send system messages as separate entries for Gemini API
    // Send system messages as merged single entry for Gemini API (does not accept array)
    const systemInstructionText = systemMessages.map(m => m.content).join("\n\n");
    const systemInstruction = systemInstructionText ? { parts: [{ text: systemInstructionText }] } : undefined;

    // Build generation config with optional thinking
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking && config.selectedModel) {
      const modelId = config.selectedModel.toLowerCase();
      if (modelId.includes("gemini-2.5")) {
        // Gemini 2.5 models use thinkingBudget (tokens)
        const budgetMap: Record<string, number> = {
          NONE: 0,
          LOW: 1024,
          MEDIUM: 4096,
          HIGH: 8192
        };
        const budget = budgetMap[options.thinkingBudget || "LOW"];
        if (budget > 0) {
          generationConfig.thinkingConfig = {
            thinkingBudget: budget
          };
        }
      } else {
        // Legacy thinking config for Gemini 2.0 and earlier
        generationConfig.thinkingConfig = {
          thinkingLevel: options.thinkingLevel || "HIGH"
        };
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.selectedModel}:generateContent?key=${config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          systemInstruction,
          generationConfig,
        }),
        signal: options.abortController?.signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.error?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return { content };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Google AI Studio streaming implementation
export const streamWithGoogleAIStudio = async (
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
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "Google AI Studio API key is required" });
    return;
  }

  try {
    // Extract system messages from instruction messages for Gemini API
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    // Format non-system messages for Gemini API
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Send system messages as separate entries for Gemini API
    // Send system messages as merged single entry for Gemini API (does not accept array)
    const systemInstructionText = systemMessages.map(m => m.content).join("\n\n");
    const systemInstruction = systemInstructionText ? { parts: [{ text: systemInstructionText }] } : undefined;

    // Build generation config with optional thinking
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking && config.selectedModel) {
      const modelId = config.selectedModel.toLowerCase();
      if (modelId.includes("gemini-2.5")) {
        // Gemini 2.5 models use thinkingBudget (tokens)
        const budgetMap: Record<string, number> = {
          NONE: 0,
          LOW: 1024,
          MEDIUM: 4096,
          HIGH: 8192
        };
        const budget = budgetMap[options.thinkingBudget || "LOW"];
        if (budget > 0) {
          generationConfig.thinkingConfig = {
            thinkingBudget: budget
          };
        }
      } else {
        // Legacy thinking config for Gemini 2.0 and earlier
        generationConfig.thinkingConfig = {
          thinkingLevel: options.thinkingLevel || "HIGH"
        };
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.selectedModel}:streamGenerateContent?key=${config.apiKey}&alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedMessages,
          systemInstruction,
          generationConfig,
        }),
        signal: options.abortController?.signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      onChunk({ error: errorData.error?.message || `HTTP ${response.status}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ error: "Failed to get response stream" });
      return;
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let fullThinking = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            const parts = data.candidates?.[0]?.content?.parts || [];
            
            for (const part of parts) {
              if (part.text) {
                fullContent += part.text;
                onChunk({ content: fullContent });
              }
              if (part.thought) {
                fullThinking += part.thought;
                onChunk({ thinking: fullThinking });
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    onChunk({ content: fullContent, thinking: fullThinking, done: true });
  } catch (error) {
    onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
};

// Google Vertex AI chat implementation - uses server-side proxy to avoid CORS
export const chatWithVertexAI: ChatFunction = async (
  messages,
  config,
  options
) => {
  const mode = config.vertexMode || "express";
  const location = config.vertexLocation || "global";
  
  if (!config.apiKey) {
    return { error: "Vertex AI requires an API key" };
  }

  if (!config.projectId) {
    return { error: "Vertex AI requires a Google Cloud Project ID. Please enter your project ID in the provider settings." };
  }
  
  try {
    // Extract system messages from instruction messages for Gemini API
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    // Format non-system messages for Gemini API
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Combine system instruction with any system messages from the instruction list
    const systemInstructionContent = systemMessages.map(m => m.content).join("\n\n");
    const systemInstruction = systemInstructionContent || options.systemPrompt
      ? { parts: [{ text: systemInstructionContent || options.systemPrompt || "" }] }
      : undefined;

    // Build generation config with optional thinking
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking && config.selectedModel) {
      const modelId = config.selectedModel.toLowerCase();
      if (modelId.includes("gemini-2.5")) {
        // Gemini 2.5 models use thinkingBudget (tokens)
        const budgetMap: Record<string, number> = {
          NONE: 0,
          LOW: 1024,
          MEDIUM: 4096,
          HIGH: 8192
        };
        const budget = budgetMap[options.thinkingBudget || "LOW"];
        if (budget > 0) {
          generationConfig.thinkingConfig = {
            thinkingBudget: budget
          };
        }
      } else {
        // Legacy thinking config for Gemini 2.0 and earlier
        generationConfig.thinkingConfig = {
          thinkingLevel: options.thinkingLevel || "HIGH"
        };
      }
    }

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/vertex-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: `${config.selectedModel}:generateContent`,
        apiKey: config.apiKey,
        projectId: config.projectId,
        location: location,
        payload: {
          contents: formattedMessages,
          systemInstruction,
          generationConfig,
        },
        signal: options.abortController?.signal,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}`,
      };
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return { content };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// NVIDIA NIM chat implementation - uses server-side proxy to avoid CORS
// Uses Gemini-style structured prompting for context, instructions, and limitations
export const chatWithNvidiaNIM: ChatFunction = async (
  messages,
  config,
  options
) => {
  if (!config.apiKey) {
    return { error: "NVIDIA NIM API key is required" };
  }

  try {
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemContent = systemMessages.map(m => m.content).join("\n\n");
    const messagesWithSystem = systemContent || options.systemPrompt
      ? [{ role: "system", content: systemContent || options.systemPrompt || "" }, ...formattedMessages]
      : formattedMessages;

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/nvidia-nim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          top_k: options.topK,
        },
      }),
      signal: options.abortController?.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}`,
      };
    }

    const content = data.choices?.[0]?.message?.content || "";
    // Handle reasoning_content (thinking) from reasoning models like DeepSeek R1
    const thinking = data.choices?.[0]?.message?.reasoning_content || "";

    return { content, thinking };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// NVIDIA NIM streaming implementation
// Uses Gemini-style structured prompting for context, instructions, and limitations
export const streamWithNvidiaNIM = async (
  messages: Message[],
  config: ProviderConfig,
  options: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    systemPrompt?: string;
    enableThinking?: boolean;
    abortController?: AbortController;
  },
  onChunk: StreamCallback
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "NVIDIA NIM API key is required" });
    return;
  }

  try {
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemContent = systemMessages.map(m => m.content).join("\n\n");
    const messagesWithSystem = systemContent || options.systemPrompt
      ? [{ role: "system", content: systemContent || options.systemPrompt || "" }, ...formattedMessages]
      : formattedMessages;

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/nvidia-nim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          top_k: options.topK,
          stream: true,
        },
        stream: true,
        signal: options.abortController?.signal,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      onChunk({ error: errorData.error || `HTTP ${response.status}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ error: "Failed to get response stream" });
      return;
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let fullThinking = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        // Handle error events
        if (line.startsWith("event: error")) {
          // Next line will contain the error data
          continue;
        }
        
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            
            // Check for error in stream
            if (data.error) {
              onChunk({ error: data.error });
              return;
            }
            
            const delta = data.choices?.[0]?.delta;
            
            // Handle reasoning_content (thinking) from reasoning models like DeepSeek R1
            if (delta?.reasoning_content) {
              fullThinking += delta.reasoning_content;
              onChunk({ thinking: fullThinking });
            }
            
            if (delta?.content) {
              fullContent += delta.content;
              onChunk({ content: fullContent });
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    onChunk({ content: fullContent, thinking: fullThinking, done: true });
  } catch (error) {
    onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
};

// Groq chat implementation - uses server-side proxy to avoid CORS
export const chatWithGroq: ChatFunction = async (
  messages,
  config,
  options
) => {
  if (!config.apiKey) {
    return { error: "Groq API key is required" };
  }

  try {
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemContent = systemMessages.map(m => m.content).join("\n\n");
    const messagesWithSystem = systemContent || options.systemPrompt
      ? [{ role: "system", content: systemContent || options.systemPrompt || "" }, ...formattedMessages]
      : formattedMessages;

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
        },
        signal: options.abortController?.signal,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}`,
      };
    }

    const content = data.choices?.[0]?.message?.content || "";

    return { content };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Groq streaming implementation
export const streamWithGroq = async (
  messages: Message[],
  config: ProviderConfig,
  options: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    systemPrompt?: string;
    enableThinking?: boolean;
    abortController?: AbortController;
  },
  onChunk: StreamCallback
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "Groq API key is required" });
    return;
  }

  try {
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemContent = systemMessages.map(m => m.content).join("\n\n");
    const messagesWithSystem = systemContent || options.systemPrompt
      ? [{ role: "system", content: systemContent || options.systemPrompt || "" }, ...formattedMessages]
      : formattedMessages;

    // Use server-side proxy with streaming
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: true,
        },
        stream: true,
        signal: options.abortController?.signal,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      onChunk({ error: errorData.error || `HTTP ${response.status}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ error: "Failed to get response stream" });
      return;
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            
            // Check for error in stream
            if (data.error) {
              onChunk({ error: data.error });
              return;
            }
            
            const delta = data.choices?.[0]?.delta;
            
            if (delta?.content) {
              fullContent += delta.content;
              onChunk({ content: fullContent });
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    onChunk({ content: fullContent, done: true });
  } catch (error) {
    onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
};

// Open Router chat implementation - uses server-side proxy to avoid CORS
export const chatWithOpenRouter: ChatFunction = async (
  messages,
  config,
  options
) => {
  if (!config.apiKey) {
    return { error: "Open Router API key is required" };
  }

  try {
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemContent = systemMessages.map(m => m.content).join("\n\n");
    const messagesWithSystem = systemContent || options.systemPrompt
      ? [{ role: "system", content: systemContent || options.systemPrompt || "" }, ...formattedMessages]
      : formattedMessages;

    const response = await fetch("/api/open-router", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          top_k: options.topK,
        },
        signal: options.abortController?.signal,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}`,
      };
    }

    const content = data.choices?.[0]?.message?.content || "";
    const thinking = data.choices?.[0]?.message?.reasoning_content || "";

    return { content, thinking };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Open Router streaming implementation
export const streamWithOpenRouter = async (
  messages: Message[],
  config: ProviderConfig,
  options: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    systemPrompt?: string;
    enableThinking?: boolean;
    abortController?: AbortController;
  },
  onChunk: StreamCallback
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "Open Router API key is required" });
    return;
  }

  try {
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemContent = systemMessages.map(m => m.content).join("\n\n");
    const messagesWithSystem = systemContent || options.systemPrompt
      ? [{ role: "system", content: systemContent || options.systemPrompt || "" }, ...formattedMessages]
      : formattedMessages;

    const response = await fetch("/api/open-router", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          top_k: options.topK,
          stream: true,
        },
        stream: true,
        signal: options.abortController?.signal,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      onChunk({ error: errorData.error || `HTTP ${response.status}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ error: "Failed to get response stream" });
      return;
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let fullThinking = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            
            if (data.error) {
              onChunk({ error: data.error });
              return;
            }
            
            const delta = data.choices?.[0]?.delta;
            
            if (delta?.reasoning_content) {
              fullThinking += delta.reasoning_content;
              onChunk({ thinking: fullThinking });
            }
            
            if (delta?.content) {
              fullContent += delta.content;
              onChunk({ content: fullContent });
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    onChunk({ content: fullContent, thinking: fullThinking, done: true });
  } catch (error) {
    onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
};

// Vertex AI streaming implementation - uses server-side proxy to avoid CORS
export const streamWithVertexAI = async (
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
): Promise<void> => {
  const location = config.vertexLocation || "global";
  
  if (!config.apiKey) {
    onChunk({ error: "Vertex AI requires an API key" });
    return;
  }

  if (!config.projectId) {
    onChunk({ error: "Vertex AI requires a Google Cloud Project ID. Please enter your project ID in the provider settings." });
    return;
  }

  try {
    // Extract system messages from instruction messages for Gemini API
    const systemMessages = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");
    
    // Format non-system messages for Gemini API
    const formattedMessages = nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Send system messages as separate entries for Gemini API
    // Send system messages as merged single entry for Gemini API (does not accept array)
    const systemInstructionText = systemMessages.map(m => m.content).join("\n\n");
    const systemInstruction = systemInstructionText ? { parts: [{ text: systemInstructionText }] } : undefined;

    // Build generation config with optional thinking
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking && config.selectedModel) {
      const modelId = config.selectedModel.toLowerCase();
      if (modelId.includes("gemini-2.5")) {
        // Gemini 2.5 models use thinkingBudget (tokens)
        const budgetMap: Record<string, number> = {
          NONE: 0,
          LOW: 1024,
          MEDIUM: 4096,
          HIGH: 8192
        };
        const budget = budgetMap[options.thinkingBudget || "LOW"];
        if (budget > 0) {
          generationConfig.thinkingConfig = {
            thinkingBudget: budget
          };
        }
      } else {
        // Legacy thinking config for Gemini 2.0 and earlier
        generationConfig.thinkingConfig = {
          thinkingLevel: options.thinkingLevel || "HIGH"
        };
      }
    }

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/vertex-ai", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: `${config.selectedModel}:streamGenerateContent?alt=sse`,
        apiKey: config.apiKey,
        projectId: config.projectId,
        location: location,
        payload: {
          contents: formattedMessages,
          systemInstruction,
          generationConfig,
        },
        signal: options.abortController?.signal,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      onChunk({ error: errorData.error || `HTTP ${response.status}` });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ error: "Failed to get response stream" });
      return;
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let fullThinking = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            const parts = data.candidates?.[0]?.content?.parts || [];
            
            for (const part of parts) {
              if (part.text) {
                fullContent += part.text;
                onChunk({ content: fullContent });
              }
              if (part.thought) {
                fullThinking += part.thought;
                onChunk({ thinking: fullThinking });
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    onChunk({ content: fullContent, thinking: fullThinking, done: true });
  } catch (error) {
    onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
};

// KoboldAI Horde chat implementation - uses server-side proxy to avoid CORS
export const chatWithKoboldHorde: ChatFunction = async (
    messages,
    config,
    options
  ) => {
    if (!config.apiKey) {
      return { error: "KoboldAI Horde API key is required" };
    }

    try {
      // Combine all messages into a single prompt for KoboldAI Horde
      const systemMessages = messages.filter(m => m.role === "system");
      const nonSystemMessages = messages.filter(m => m.role !== "system");

      let prompt = "";

      // Add system prompt if provided
      const systemContent = systemMessages.map(m => m.content).join("\n\n");
      if (systemContent || options.systemPrompt) {
        prompt += (systemContent || options.systemPrompt) + "\n\n";
      }

      // Add conversation history
      for (const message of nonSystemMessages) {
        if (message.role === "user") {
          prompt += `User: ${message.content}\n\n`;
        } else if (message.role === "assistant") {
          prompt += `Assistant: ${message.content}\n\n`;
        }
      }

      // Add final assistant prompt
      prompt += "Assistant: ";

      const response = await fetch("https://aihorde.net/api/v2/generate/text/async", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": config.apiKey,
        },
         body: JSON.stringify({
           prompt,
           params: {
             temperature: options.temperature,
             top_p: options.topP,
             top_k: options.topK,
             max_length: options.maxTokens,
           },
           models: [config.selectedModel || "koboldcpp/Llama-3.1-8B-Stheno-v3.4"],
           n: 1,
           post_processing: [],
         }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
        };
      }

      // For async endpoint, we need to poll for completion
      if (data.task_id) {
        // Poll for result (simplified - in a real app you'd want to handle this better)
        let result = null;
        for (let i = 0; i < 10; i++) { // Try up to 10 times
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          const statusResponse = await fetch(`https://aihorde.net/api/v2/generate/text/check/${data.task_id}`, {
            headers: {
              "apikey": config.apiKey,
            },
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.finished && statusData.generations && statusData.generations.length > 0) {
              result = statusData.generations[0].text;
              break;
            }
          }
        }
        
        if (result) {
          return { content: result };
        } else {
          return { error: "Timeout waiting for generation" };
        }
      }
      
      return { error: "No task ID returned" };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

// KoboldAI Horde streaming implementation - uses direct API to avoid CORS
export const streamWithKoboldHorde = async (
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
) => {
   if (!config.apiKey) {
     onChunk({ error: "KoboldAI Horde API key is required" });
     return;
   }

   try {
     // Combine all messages into a single prompt for KoboldAI Horde
     const systemMessages = messages.filter(m => m.role === "system");
     const nonSystemMessages = messages.filter(m => m.role !== "system");

     let prompt = "";

     // Add system prompt if provided
     const systemContent = systemMessages.map(m => m.content).join("\n\n");
     if (systemContent || options.systemPrompt) {
       prompt += (systemContent || options.systemPrompt) + "\n\n";
     }

     // Add conversation history
     for (const message of nonSystemMessages) {
       if (message.role === "user") {
         prompt += `User: ${message.content}\n\n`;
       } else if (message.role === "assistant") {
         prompt += `Assistant: ${message.content}\n\n`;
       }
     }

     // Add final assistant prompt
     prompt += "Assistant: ";

     const response = await fetch("https://aihorde.net/api/v2/generate/text/stream", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "apikey": config.apiKey,
       },
        body: JSON.stringify({
          prompt,
          params: {
            temperature: options.temperature,
            top_p: options.topP,
            top_k: options.topK,
            max_length: options.maxTokens,
          },
          models: [config.selectedModel || "koboldcpp/Llama-3.1-8B-Stheno-v3.4"],
          n: 1,
          post_processing: [],
        }),
     });

     if (!response.ok) {
       const errorData = await response.json();
       onChunk({ error: errorData.error || `HTTP ${response.status}` });
       return;
     }

     const reader = response.body?.getReader();
     if (!reader) {
       onChunk({ error: "Failed to get response stream" });
       return;
     }

     const decoder = new TextDecoder();
     let buffer = "";

     try {
       while (true) {
         const { done, value } = await reader.read();
         if (done) break;

         buffer += decoder.decode(value, { stream: true });
         const lines = buffer.split("\n");
         buffer = lines.pop() || "";

         for (const line of lines) {
           if (line.trim()) {
             try {
               const data = JSON.parse(line);
               if (data.text) {
                 onChunk({ content: data.text });
               }
             } catch (e) {
               // Ignore parsing errors
             }
           }
         }
       }
     } catch (error) {
       onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
     } finally {
       reader.releaseLock();
     }
   } catch (error) {
     onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
   }
 };

// Main chat function that routes to the correct provider
export const sendChatMessage = async (
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
): Promise<ChatResponse> => {
  switch (config.type) {
    case "google-ai-studio":
      return chatWithGoogleAIStudio(messages, config, options);
    case "google-vertex":
      return chatWithVertexAI(messages, config, options);
    case "nvidia-nim":
      return chatWithNvidiaNIM(messages, config, options);
    case "groq":
      return chatWithGroq(messages, config, options);
    case "open-router":
      return chatWithOpenRouter(messages, config, options);
    case "kobold-horde":
      return chatWithKoboldHorde(messages, config, options);
    default:
      return { error: `Unknown provider: ${config.type}` };
  }
};

// Main streaming function that routes to the correct provider
export const streamChatMessage = async (
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
): Promise<void> => {
  switch (config.type) {
    case "google-ai-studio":
      return streamWithGoogleAIStudio(messages, config, options, onChunk);
    case "google-vertex":
      return streamWithVertexAI(messages, config, options, onChunk);
    case "nvidia-nim":
      return streamWithNvidiaNIM(messages, config, options, onChunk);
    case "groq":
      return streamWithGroq(messages, config, options, onChunk);
    case "open-router":
      return streamWithOpenRouter(messages, config, options, onChunk);
    case "kobold-horde":
      return streamWithKoboldHorde(messages, config, options, onChunk);
    default:
      onChunk({ error: `Unknown provider: ${config.type}` });
      return;
  }
};

// Get models for a provider
export const getModelsForProvider = (
  providerType: LLMProviderType
): LLMModel[] => {
  const provider = AVAILABLE_PROVIDERS.find((p) => p.id === providerType);
  return provider?.models || [];
};

// Test connection result
export interface TestConnectionResult {
  success: boolean;
  message: string;
}

// Test connection for a provider
export const testProviderConnection = async (
  providerType: LLMProviderType,
  config: ProviderConfig
): Promise<TestConnectionResult> => {
  switch (providerType) {
    case "google-ai-studio": {
      if (!config.apiKey) {
        return { success: false, message: "API key is required." };
      }
      try {
        // Test by listing models or making a minimal request
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`,
          { method: "GET" }
        );
        if (response.ok) {
          return { success: true, message: "Google AI Studio connection successful!" };
        }
        const errorData = await response.json();
        return { success: false, message: errorData.error?.message || `HTTP ${response.status}` };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }
    
    case "google-vertex": {
      const location = config.vertexLocation || "global";
      
      if (!config.apiKey) {
        return { success: false, message: "API key is required." };
      }
      if (!config.projectId) {
        return { success: false, message: "Project ID is required for Vertex AI. Please enter your Google Cloud project ID." };
      }
      try {
        // Test with Vertex AI endpoint using server-side proxy to avoid CORS
        const response = await fetch("/api/vertex-ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: "gemini-2.0-flash:generateContent",
            apiKey: config.apiKey,
            projectId: config.projectId,
            location: location,
            payload: {
              contents: [{ role: "user", parts: [{ text: "test" }] }],
              generationConfig: { maxOutputTokens: 1 },
            },
          }),
        });
        
        if (response.ok) {
          return { success: true, message: `Google Vertex AI (${location}) connection successful!` };
        }
        const errorData = await response.json();
        return { success: false, message: errorData.error || `HTTP ${response.status}` };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }
    
    case "nvidia-nim": {
      if (!config.apiKey) {
        return { success: false, message: "API key is required." };
      }
      try {
        // Test with a minimal chat request using server-side proxy to avoid CORS
        const response = await fetch("/api/nvidia-nim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: "chat/completions",
            apiKey: config.apiKey,
            payload: {
              model: "moonshotai/kimi-k2-thinking",
              messages: [{ role: "user", content: "Hi" }],
              max_tokens: 5,
            },
          }),
        });
        
        // 200 and 202 are success codes
        if (response.status === 200 || response.status === 202) {
          return { success: true, message: "NVIDIA NIM connection successful!" };
        }
        
        // Parse error response
        const errorData = await response.json();
        
        if (response.status === 422) {
          return { success: false, message: errorData.error || "Validation error (422)" };
        }
        
        if (response.status === 500) {
          return { success: false, message: "Server error (500) - please try again later" };
        }
        
        return { success: false, message: errorData.error || `HTTP ${response.status}` };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }
    
    case "groq": {
      if (!config.apiKey) {
        return { success: false, message: "API key is required." };
      }
      try {
        // Test with a minimal chat request using server-side proxy to avoid CORS
        const response = await fetch("/api/groq", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: "chat/completions",
            apiKey: config.apiKey,
            payload: {
              model: "llama-3.1-8b-instant",
              messages: [{ role: "user", content: "Hi" }],
              max_tokens: 5,
            },
          }),
        });
        
        if (response.ok) {
          return { success: true, message: "Groq connection successful!" };
        }
        
        const errorData = await response.json();
        return { success: false, message: errorData.error || `HTTP ${response.status}` };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }
    
    case "open-router": {
      if (!config.apiKey) {
        return { success: false, message: "API key is required." };
      }
      try {
        const response = await fetch("/api/open-router", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: "chat/completions",
            apiKey: config.apiKey,
            payload: {
              model: "google/gemini-2.0-flash",
              messages: [{ role: "user", content: "Hi" }],
              max_tokens: 5,
              user: "chat-user",
            },
          }),
        });
        
        if (response.ok) {
          return { success: true, message: "Open Router connection successful!" };
        }
        
        const errorData = await response.json();
        return { success: false, message: errorData.error || `HTTP ${response.status}` };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }

case "kobold-horde": {
       if (!config.apiKey) {
         return { success: false, message: "API key is required." };
       }
        try {
          // Test with a minimal text generation request using the async API to avoid CORS
          const response = await fetch("https://aihorde.net/api/v2/generate/text/async", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": config.apiKey,
            },
            body: JSON.stringify({
              prompt: "Hello",
              params: {
                temperature: 0.1,
                max_length: 16, // Minimum allowed by the API
              },
              models: [config.selectedModel || "koboldcpp/Llama-3.1-8B-Stheno-v3.4"],
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.task_id) {
              return { success: true, message: "KoboldAI Horde connection successful!" };
            }
            return { success: false, message: "Unexpected response format (no task_id)" };
          }

          const errorData = await response.json();
          return { success: false, message: errorData.error || `HTTP ${response.status}` };
        } catch (error) {
          return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
        }
     }

    default:
      return { success: false, message: `Unknown provider: ${providerType}` };
  }
};

// Get default model for a provider
export const getDefaultModelForProvider = (providerType: LLMProviderType): string => {
  const models = getModelsForProvider(providerType);
  if (models.length > 0) {
    return models[0].id;
  }
  return "";
};

// Fetch models from provider API (server-side to avoid CORS)
export interface FetchedModel {
  id: string;
  provider: string;
  name: string;
  context?: number;
  max_tokens?: number;
  supportsThinking?: boolean;
}

export const fetchModelsFromProvider = async (
  providerType: LLMProviderType,
  config: ProviderConfig
): Promise<{ models: FetchedModel[]; error?: string }> => {
  try {
    switch (providerType) {
      case "nvidia-nim": {
        if (!config.apiKey) {
          return { models: [], error: "API key is required" };
        }

        const response = await fetch(`/api/models?provider=nvidia-nim&apiKey=${encodeURIComponent(config.apiKey)}`);
        const data = await response.json();

        if (!response.ok) {
          return { models: [], error: data.error || `HTTP ${response.status}` };
        }

        return { models: data.models || [] };
      }

      case "google-ai-studio": {
        if (!config.apiKey) {
          return { models: [], error: "API key is required" };
        }

        const response = await fetch(`/api/models?provider=google-ai-studio&apiKey=${encodeURIComponent(config.apiKey)}`);
        const data = await response.json();

        if (!response.ok) {
          return { models: [], error: data.error || `HTTP ${response.status}` };
        }

        return { models: data.models || [] };
      }

      case "groq": {
        if (!config.apiKey) {
          return { models: [], error: "API key is required" };
        }

        const groqResponse = await fetch(`/api/models?provider=groq&apiKey=${encodeURIComponent(config.apiKey)}`);
        const groqData = await groqResponse.json();

        if (!groqResponse.ok) {
          return { models: [], error: groqData.error || `HTTP ${groqResponse.status}` };
        }

        return { models: groqData.models || [] };
      }

case "kobold-horde": {
          try {
            // KoboldAI Horde API returns models with workers count - filters by type already in URL
            const response = await fetch("https://aihorde.net/api/v2/status/models?type=text");
            const data = await response.json();

            if (!response.ok) {
              return { models: [], error: `HTTP ${response.status}` };
            }

            // Transform Horde models to our format
            // Each model has: name (full path like "koboldcpp/L3-8B-Stheno-v3.2"), type, count, performance
            const models: FetchedModel[] = data
              .filter((model: any) => model.count > 0) // Only include models with available workers
              .map((model: any) => ({
                id: model.name,
                provider: "kobold-horde",
                name: model.name,
              }));

            return { models };
          } catch (error) {
            // Fall back to static models if API fails
            return { models: getModelsForProvider("kobold-horde") };
          }
        }

      case "open-router": {
        if (!config.apiKey) {
          return { models: [], error: "API key is required" };
        }

        const openRouterResponse = await fetch(`/api/models?provider=open-router&apiKey=${encodeURIComponent(config.apiKey)}`);
        const openRouterData = await openRouterResponse.json();

        if (!openRouterResponse.ok) {
          return { models: [], error: openRouterData.error || `HTTP ${openRouterResponse.status}` };
        }

        return { models: openRouterData.models || [] };
      }

      case "google-vertex": {
        try {
          // Google Vertex AI currently uses static model list
          // API integration requires OAuth2 credentials which are not implemented yet
          return { models: getModelsForProvider("google-vertex") };
        } catch (error) {
          // Fall back to static models on any error
          return { models: getModelsForProvider("google-vertex") };
        }
      }

      default:
        return { models: [], error: `Unknown provider: ${providerType}` };
    }
  } catch (error) {
    return { 
      models: [], 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
