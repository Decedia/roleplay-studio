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
  FetchedModel,
  ChatResponse,
  StreamCallback,
  TestConnectionResult,
} from "./types";

// Re-export types for convenience
export type { LLMProviderType, ProviderConfig, Message, LLMModel, LLMProvider, VertexMode, VertexLocation, ThinkingLevel, ThinkingBudget, FetchedModel, ChatResponse, StreamCallback, TestConnectionResult };

// Default models for providers
export const DEFAULT_KOBOLD_HORDE_MODEL = "koboldcpp/L3-8B-Stheno-v3.2";

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
     description: "Distributed AI text generation via AI Horde network",
     requiresApiKey: true,
    models: [
      {
        id: DEFAULT_KOBOLD_HORDE_MODEL,
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
        id: "koboldcpp/gemma-4-31B-it-heretic",
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
      {
        id: "koboldcpp/Dolphin3.0-Llama3.1-8B-Q8_0",
        name: "Dolphin 3.0 Llama 3.1 8B",
        provider: "kobold-horde",
        contextWindow: 8192,
        maxTokens: 4096,
        supportsThinking: false,
      },
    ],
   },
   {
    id: "ollama",
    name: "Self-Hosted (Ollama)",
    description: "Self-hosted LLMs via Ollama with OpenAI-compatible API",
    requiresApiKey: false, // API key is optional for remote setups
    models: [], // Models are fetched dynamically from the Ollama server
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Cohere free tier models via OpenAI-compatible API",
    requiresApiKey: true,
    models: [
      {
        id: "command-r7b-12-2025",
        name: "Command R7B",
        provider: "cohere",
        contextWindow: 128000,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "command-r-08-2025",
        name: "Command R",
        provider: "cohere",
        contextWindow: 128000,
        maxTokens: 4096,
        supportsThinking: false,
      },
    ],
  },
 ];

// Chat response interface - now imported from types.ts
// Streaming callback type - now imported from types.ts

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
    const systemMessagesFromInput = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");

    let systemMessages = [];
    if (options.systemPrompt) {
      systemMessages.push({ role: "system", content: options.systemPrompt });
    }
    systemMessages = systemMessages.concat(systemMessagesFromInput);

    const messagesWithSystem = systemMessages.concat(nonSystemMessages);

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
    const systemMessagesFromInput = messages.filter(m => m.role === "system");
    const nonSystemMessages = messages.filter(m => m.role !== "system");

    let systemMessages = [];
    if (options.systemPrompt) {
      systemMessages.push({ role: "system", content: options.systemPrompt });
    }
    systemMessages = systemMessages.concat(systemMessagesFromInput);

    const messagesWithSystem = systemMessages.concat(nonSystemMessages);

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

    // Get the selected model's context window, fallback to 8192
    const availableModels = getModelsForProvider("kobold-horde");
    const selectedModel = availableModels.find(m => m.id === (config.selectedModel || DEFAULT_KOBOLD_HORDE_MODEL));
    const maxContextLength = selectedModel?.contextWindow || 8192;

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
           "Client-Agent": "roleplay-studio:1.0.0",
         },
         body: JSON.stringify({
           prompt,
           params: {
             temperature: options.temperature,
             top_p: options.topP,
             top_k: options.topK,
             typical: 1,
             frmtadsnsp: false,
             frmtrmblln: false,
             frmtrmspch: false,
             frmttriminc: false,
             rep_pen: 1.1,
             rep_pen_range: 4096,
             rep_pen_slope: 10,
             singleline: false,
             smoothing_factor: 0,
             dynatemp_range: 0,
             dynatemp_exponent: 1,
             n: 1,
             max_context_length: maxContextLength,
             max_length: options.maxTokens,
             min_p: 0,
             use_default_badwordsids: true,
             sampler_order: [0],
             stop_sequence: [],
           },
           trusted_workers: false,
           validated_backends: true,
           slow_workers: true,
           workers: [],
           worker_blacklist: false,
           models: [config.selectedModel || DEFAULT_KOBOLD_HORDE_MODEL],
           dry_run: false,
           allow_downgrade: false,
           disable_batching: false,
           extra_source_images: [],
           softprompt: "",
           extra_slow_workers: false,
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
         // Poll for result with exponential backoff and timeout
         const maxAttempts = 12; // Up to ~64 seconds total
         const baseDelay = 1000; // 1 second
         let result = null;
         
         for (let i = 0; i < maxAttempts; i++) {
           // Exponential backoff: 1s, 2s, 4s, 8s, etc.
           const delay = Math.min(baseDelay * Math.pow(2, i), 30000); // Cap at 30s
           await new Promise(resolve => setTimeout(resolve, delay));
           
           try {
             const statusResponse = await fetch(`https://aihorde.net/api/v2/generate/text/status/${data.task_id}`, {
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
               // If still processing, continue polling
               if (statusData.done === false) {
                 continue;
               }
             }
           } catch (pollError) {
             // Ignore individual poll errors and continue
             continue;
           }
         }
         
         if (result) {
           return { content: result };
         } else {
           return { error: "Timeout waiting for generation - task may still be processing" };
         }
       }
        
       return { error: "No task ID returned" };
     } catch (error) {
       return {
         error: error instanceof Error ? error.message : "Unknown error occurred",
       };
     }
   };

// KoboldAI Horde streaming implementation - falls back to async+status polling
// because the /v2/generate/text/stream endpoint is no longer available.
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

   const availableModels = getModelsForProvider("kobold-horde");
   const selectedModel = availableModels.find(m => m.id === (config.selectedModel || DEFAULT_KOBOLD_HORDE_MODEL));
   const maxContextLength = selectedModel?.contextWindow || 8192;

   try {
     const systemMessages = messages.filter(m => m.role === "system");
     const nonSystemMessages = messages.filter(m => m.role !== "system");

     let prompt = "";
     const systemContent = systemMessages.map(m => m.content).join("\n\n");
     if (systemContent || options.systemPrompt) {
       prompt += (systemContent || options.systemPrompt || "") + "\n\n";
     }

     for (const message of nonSystemMessages) {
       if (message.role === "user") {
         prompt += `User: ${message.content}\n\n`;
       } else if (message.role === "assistant") {
         prompt += `Assistant: ${message.content}\n\n`;
       }
     }

     prompt += "Assistant: ";

     const response = await fetch("https://aihorde.net/api/v2/generate/text/async", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         apikey: config.apiKey,
         "Client-Agent": "roleplay-studio:1.0.0",
       },
       body: JSON.stringify({
         prompt,
         params: {
           temperature: options.temperature,
           top_p: options.topP,
           top_k: options.topK,
           typical: 1,
           frmtadsnsp: false,
           frmtrmblln: false,
           frmtrmspch: false,
           frmttriminc: false,
           rep_pen: 1.1,
           rep_pen_range: 4096,
           rep_pen_slope: 10,
           singleline: false,
           smoothing_factor: 0,
           dynatemp_range: 0,
           dynatemp_exponent: 1,
           n: 1,
           max_context_length: maxContextLength,
           max_length: options.maxTokens,
           min_p: 0,
           use_default_badwordsids: true,
           sampler_order: [0],
           stop_sequence: [],
         },
         trusted_workers: false,
         validated_backends: true,
         slow_workers: true,
         workers: [],
         worker_blacklist: false,
         models: [config.selectedModel || DEFAULT_KOBOLD_HORDE_MODEL],
         dry_run: false,
         allow_downgrade: false,
         disable_batching: false,
         extra_source_images: [],
         softprompt: "",
         extra_slow_workers: false,
       }),
     });

     if (!response.ok) {
       const errorData = await response.json();
       onChunk({ error: errorData.error || `HTTP ${response.status}` });
       return;
     }

     const data = await response.json();
     const requestId = data.id;
     if (!requestId) {
       onChunk({ error: "No request ID returned from AI Horde" });
       return;
     }

     let lastText = "";
     const maxAttempts = 60;
     const baseDelay = 1000;

     for (let i = 0; i < maxAttempts; i++) {
       await new Promise(resolve => setTimeout(resolve, baseDelay));

       try {
         const statusResponse = await fetch(
           `https://aihorde.net/api/v2/generate/text/status/${requestId}`,
           {
             headers: { apikey: config.apiKey },
           }
         );

         if (!statusResponse.ok) continue;

         const statusData = await statusResponse.json();
         if (statusData.faulted) {
           onChunk({ error: "AI Horde generation faulted" });
           return;
         }

         const currentText = statusData.generations?.[0]?.text || "";
         if (currentText && currentText !== lastText) {
           const delta = currentText.slice(lastText.length);
           lastText = currentText;
           onChunk({ content: currentText });
         }

         if (statusData.done) {
           onChunk({ content: lastText, done: true });
           return;
         }
       } catch {
         continue;
       }
     }

     if (lastText) {
       onChunk({ content: lastText, done: true });
     } else {
       onChunk({ error: "Timeout waiting for AI Horde generation" });
     }
   } catch (error) {
     onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
   }
 };

// Cohere chat implementation - uses OpenAI-compatible API via server proxy
export const chatWithCohere: ChatFunction = async (
  messages,
  config,
  options
) => {
  if (!config.apiKey) {
    return { error: "Cohere API key is required" };
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

    const response = await fetch("/api/cohere", {
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

// Cohere streaming implementation - uses server-side proxy
export const streamWithCohere = async (
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
    onChunk({ error: "Cohere API key is required" });
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

    const response = await fetch("/api/cohere", {
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
  const provider = providerRegistry.get(config.type);
  if (!provider) {
    return { error: `Unknown provider: ${config.type}` };
  }
  return provider.chat(messages, config, options);
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
  const provider = providerRegistry.get(config.type);
  if (!provider) {
    onChunk({ error: `Unknown provider: ${config.type}` });
    return;
  }
  return provider.stream(messages, config, options, onChunk);
};

// Get models for a provider
export const getModelsForProvider = (
  providerType: LLMProviderType
): LLMModel[] => {
  const provider = providerRegistry.get(providerType);
  return provider?.models || [];
};

// Test connection for a provider
export const testProviderConnection = async (
  providerType: LLMProviderType,
  config: ProviderConfig
): Promise<TestConnectionResult> => {
  const provider = providerRegistry.get(providerType);
  if (!provider) {
    return { success: false, message: `Unknown provider: ${providerType}` };
  }
  return provider.connectionTest(config);
};

// Ollama chat implementation - uses server-side proxy to avoid CORS
export const chatWithOllama: ChatFunction = async (
  messages,
  config,
  options
) => {
  // Ollama doesn't require an API key, but we can send one if provided for remote setups
  const apiKey = config.apiKey || "";
  // Get active profile or create a default one if none exists
  let activeProfile = config.profiles.find(p => p.id === config.activeProfileId);
  if (!activeProfile && config.profiles.length > 0) {
    activeProfile = config.profiles[0];
  }
  // If still no active profile (empty profiles array), create a default one
  if (!activeProfile) {
    activeProfile = {
      id: `ollama-default-${Date.now()}`,
      name: "Default",
      apiKey: "",
      baseUrl: "http://localhost:11434/v1",
      selectedModel: "",
      createdAt: Date.now()
    };
  }
  const baseUrl = (activeProfile.baseUrl?.endsWith('/') ? activeProfile.baseUrl.slice(0, -1) : activeProfile.baseUrl) || "http://localhost:11434/v1";

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
    const response = await fetch("/api/ollama", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: `${baseUrl}/chat/completions`,
        apiKey: apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: false,
        },
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

// Ollama streaming implementation
export const streamWithOllama = async (
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
  const apiKey = config.apiKey || "";
  // Get active profile or create a default one if none exists
  let activeProfile = config.profiles.find(p => p.id === config.activeProfileId);
  if (!activeProfile && config.profiles.length > 0) {
    activeProfile = config.profiles[0];
  }
  // If still no active profile (empty profiles array), create a default one
  if (!activeProfile) {
    activeProfile = {
      id: `ollama-default-${Date.now()}`,
      name: "Default",
      apiKey: "",
      baseUrl: "http://localhost:11434/v1",
      selectedModel: "",
      createdAt: Date.now()
    };
  }
  const baseUrl = (activeProfile.baseUrl?.endsWith('/') ? activeProfile.baseUrl.slice(0, -1) : activeProfile.baseUrl) || "http://localhost:11434/v1";

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
    const response = await fetch("/api/ollama", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: `${baseUrl}/chat/completions`,
        apiKey: apiKey,
        payload: {
          model: config.selectedModel,
          messages: messagesWithSystem,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          stream: true,
        },
        stream: true,
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

// Get default model for a provider
export const getDefaultModelForProvider = (providerType: LLMProviderType): string => {
  const models = getModelsForProvider(providerType);
  if (models.length > 0) {
    return models[0].id;
  }
  return "";
};

export const fetchModelsFromProvider = async (
  providerType: LLMProviderType,
  config: ProviderConfig
): Promise<{ models: FetchedModel[]; error?: string }> => {
  try {
    const provider = providerRegistry.get(providerType);
    if (!provider) {
      return { models: [], error: `Unknown provider: ${providerType}` };
    }

    if (!provider.supportsModelFetch || !provider.modelFetch) {
      return { models: provider.models.map((m) => ({ id: m.id, name: m.name, provider: providerType })) };
    }

    return provider.modelFetch(config);
  } catch (error) {
    return { 
      models: [], 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Register all providers in the registry
import { providerRegistry } from "./providers/registry";

providerRegistry.register({
  id: "google-ai-studio",
  name: "Google AI Studio",
  description: "Google's Gemini models via AI Studio API",
  requiresApiKey: true,
  supportsProfiles: false,
  supportsModelFetch: true,
  defaultModel: "gemini-2.0-flash",
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "google-ai-studio")?.models || [],
  chat: chatWithGoogleAIStudio,
  stream: streamWithGoogleAIStudio,
  connectionTest: testProviderConnection.bind(null, "google-ai-studio"),
  modelFetch: fetchModelsFromProvider.bind(null, "google-ai-studio"),
});

providerRegistry.register({
  id: "google-vertex",
  name: "Google Vertex AI",
  description: "Enterprise Google AI via Vertex AI platform",
  requiresApiKey: true,
  requiresProjectId: true,
  requiresServiceAccount: true,
  supportsProfiles: false,
  supportsModelFetch: false,
  defaultModel: "gemini-2.0-flash",
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "google-vertex")?.models || [],
  chat: chatWithVertexAI,
  stream: streamWithVertexAI,
  connectionTest: testProviderConnection.bind(null, "google-vertex"),
});

providerRegistry.register({
  id: "nvidia-nim",
  name: "NVIDIA NIM",
  description: "NVIDIA's AI models via NIM API",
  requiresApiKey: true,
  supportsProfiles: false,
  supportsModelFetch: true,
  defaultModel: "moonshotai/kimi-k2-thinking",
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "nvidia-nim")?.models || [],
  chat: chatWithNvidiaNIM,
  stream: streamWithNvidiaNIM,
  connectionTest: testProviderConnection.bind(null, "nvidia-nim"),
  modelFetch: fetchModelsFromProvider.bind(null, "nvidia-nim"),
});

providerRegistry.register({
  id: "groq",
  name: "Groq",
  description: "Fast AI inference via Groq API",
  requiresApiKey: true,
  supportsProfiles: false,
  supportsModelFetch: true,
  defaultModel: "llama-3.1-8b-instant",
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "groq")?.models || [],
  chat: chatWithGroq,
  stream: streamWithGroq,
  connectionTest: testProviderConnection.bind(null, "groq"),
  modelFetch: fetchModelsFromProvider.bind(null, "groq"),
});

providerRegistry.register({
  id: "open-router",
  name: "Open Router",
  description: "Access multiple AI models through Open Router",
  requiresApiKey: true,
  supportsProfiles: false,
  supportsModelFetch: true,
  defaultModel: "google/gemini-2.0-flash",
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "open-router")?.models || [],
  chat: chatWithOpenRouter,
  stream: streamWithOpenRouter,
  connectionTest: testProviderConnection.bind(null, "open-router"),
  modelFetch: fetchModelsFromProvider.bind(null, "open-router"),
});

providerRegistry.register({
  id: "kobold-horde",
  name: "AI Horde",
  description: "Distributed AI text generation via AI Horde network",
  requiresApiKey: true,
  supportsProfiles: false,
  supportsModelFetch: true,
  defaultModel: DEFAULT_KOBOLD_HORDE_MODEL,
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "kobold-horde")?.models || [],
  chat: chatWithKoboldHorde,
  stream: streamWithKoboldHorde,
  connectionTest: testProviderConnection.bind(null, "kobold-horde"),
  modelFetch: fetchModelsFromProvider.bind(null, "kobold-horde"),
});

providerRegistry.register({
  id: "cohere",
  name: "Cohere",
  description: "Cohere free tier models via OpenAI-compatible API",
  requiresApiKey: true,
  supportsProfiles: false,
  supportsModelFetch: true,
  defaultModel: "command-r7b-12-2025",
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "cohere")?.models || [],
  chat: chatWithCohere,
  stream: streamWithCohere,
  connectionTest: testProviderConnection.bind(null, "cohere"),
  modelFetch: fetchModelsFromProvider.bind(null, "cohere"),
});

providerRegistry.register({
  id: "ollama",
  name: "Self-Hosted (Ollama)",
  description: "Self-hosted LLMs via Ollama with OpenAI-compatible API",
  requiresApiKey: false,
  supportsProfiles: true,
  supportsModelFetch: true,
  models: AVAILABLE_PROVIDERS.find((p) => p.id === "ollama")?.models || [],
  chat: chatWithOllama,
  stream: streamWithOllama,
  connectionTest: testProviderConnection.bind(null, "ollama"),
  modelFetch: fetchModelsFromProvider.bind(null, "ollama"),
});

export { providerRegistry };
