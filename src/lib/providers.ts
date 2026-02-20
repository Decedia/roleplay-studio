// LLM Provider implementations

import {
  LLMProviderType,
  LLMProvider,
  LLMModel,
  ProviderConfig,
  Message,
  VertexMode,
  VertexLocation,
} from "./types";

// Re-export types for convenience
export type { LLMProviderType, ProviderConfig, Message, LLMModel, LLMProvider, VertexMode, VertexLocation };

// Available providers configuration
export const AVAILABLE_PROVIDERS: LLMProvider[] = [
  {
    id: "puter",
    name: "Puter.js",
    description: "Free AI access via Puter.js - no API key required",
    requiresApiKey: false,
    models: [], // Loaded dynamically via puter.ai.listModels()
  },
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
        id: "meta/llama-3.1-405b-instruct",
        name: "Llama 3.1 405B Instruct",
        provider: "nvidia-nim",
        contextWindow: 131072,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "meta/llama-3.1-70b-instruct",
        name: "Llama 3.1 70B Instruct",
        provider: "nvidia-nim",
        contextWindow: 131072,
        maxTokens: 4096,
        supportsThinking: false,
      },
      {
        id: "meta/llama-3.1-8b-instruct",
        name: "Llama 3.1 8B Instruct",
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
    thinkingBudget?: number;
  }
) => Promise<ChatResponse>;

// Puter.js chat implementation
export const chatWithPuter: ChatFunction = async (
  messages,
  _config,
  options
) => {
  try {
    // Check if puter is available
    if (typeof window === "undefined" || !window.puter) {
      return { error: "Puter.js is not available" };
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add system prompt if provided
    const messagesWithSystem = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...formattedMessages]
      : formattedMessages;

    const response = await window.puter.ai.chat(messagesWithSystem, {
      model: _config.selectedModel,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
    });

    return {
      content: response.message.content,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Puter.js streaming chat implementation
export const streamWithPuter = async (
  messages: Message[],
  config: ProviderConfig,
  options: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    systemPrompt?: string;
    enableThinking?: boolean;
  },
  onChunk: StreamCallback
): Promise<void> => {
  try {
    if (typeof window === "undefined" || !window.puter) {
      onChunk({ error: "Puter.js is not available" });
      return;
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messagesWithSystem = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...formattedMessages]
      : formattedMessages;

    // Use streaming mode - cast to unknown first, then to target type
    const stream = await (window.puter.ai.chat as unknown as (messages: unknown, options: unknown) => Promise<AsyncIterable<unknown>>)(messagesWithSystem, {
      model: config.selectedModel,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      stream: true,
    });

    let fullContent = "";
    let fullThinking = "";

    // Handle async iterator
    const asyncIterator = stream;
    for await (const chunk of asyncIterator) {
      // Handle different chunk formats - cast to allow property access
      const c = chunk as { choices?: { delta?: { content?: string; thinking?: string } }[]; delta?: { content?: string; thinking?: string }; content?: string; thinking?: string };
      const delta = c?.choices?.[0]?.delta || c?.delta || c;
      
      if (delta?.content) {
        fullContent += delta.content;
        onChunk({ content: fullContent });
      }
      
      if (delta?.thinking) {
        fullThinking += delta.thinking;
        onChunk({ thinking: fullThinking });
      }
    }

    onChunk({ content: fullContent, thinking: fullThinking, done: true });
  } catch (error) {
    onChunk({ error: error instanceof Error ? error.message : "Unknown error occurred" });
  }
};

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
    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Add system prompt if provided
    const systemInstruction = options.systemPrompt
      ? { parts: [{ text: options.systemPrompt }] }
      : undefined;

    // Build generation config
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Note: thinkingBudget is not supported in the current Google AI Studio API
    // Thinking is automatically enabled for Gemini 2.0 Flash models

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
    thinkingBudget?: number;
  },
  onChunk: StreamCallback
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "Google AI Studio API key is required" });
    return;
  }

  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = options.systemPrompt
      ? { parts: [{ text: options.systemPrompt }] }
      : undefined;

    // Build generation config with optional thinking
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Note: thinkingBudget is not supported in the current Google AI Studio API
    // Thinking is automatically enabled for Gemini 2.0 Flash models

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
  
  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = options.systemPrompt
      ? { parts: [{ text: options.systemPrompt }] }
      : undefined;

    // Build generation config
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/vertex-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: `${config.selectedModel}:generateContent`,
        apiKey: config.apiKey,
        location: location,
        payload: {
          contents: formattedMessages,
          systemInstruction,
          generationConfig,
        },
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
export const chatWithNvidiaNIM: ChatFunction = async (
  messages,
  config,
  options
) => {
  if (!config.apiKey) {
    return { error: "NVIDIA NIM API key is required" };
  }

  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add system prompt if provided
    const messagesWithSystem = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...formattedMessages]
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
  },
  onChunk: StreamCallback
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "NVIDIA NIM API key is required" });
    return;
  }

  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messagesWithSystem = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...formattedMessages]
      : formattedMessages;

    // Use server-side proxy with streaming
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
    thinkingBudget?: number;
  },
  onChunk: StreamCallback
): Promise<void> => {
  const location = config.vertexLocation || "global";
  
  if (!config.apiKey) {
    onChunk({ error: "Vertex AI requires an API key" });
    return;
  }

  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = options.systemPrompt
      ? { parts: [{ text: options.systemPrompt }] }
      : undefined;

    // Build generation config with optional thinking
    const generationConfig: Record<string, unknown> = {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
    };

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/vertex-ai", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: `${config.selectedModel}:streamGenerateContent?alt=sse`,
        apiKey: config.apiKey,
        location: location,
        payload: {
          contents: formattedMessages,
          systemInstruction,
          generationConfig,
        },
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
    thinkingBudget?: number;
  }
): Promise<ChatResponse> => {
  switch (config.type) {
    case "puter":
      return chatWithPuter(messages, config, options);
    case "google-ai-studio":
      return chatWithGoogleAIStudio(messages, config, options);
    case "google-vertex":
      return chatWithVertexAI(messages, config, options);
    case "nvidia-nim":
      return chatWithNvidiaNIM(messages, config, options);
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
    thinkingBudget?: number;
  },
  onChunk: StreamCallback
): Promise<void> => {
  switch (config.type) {
    case "puter":
      return streamWithPuter(messages, config, options, onChunk);
    case "google-ai-studio":
      return streamWithGoogleAIStudio(messages, config, options, onChunk);
    case "google-vertex":
      return streamWithVertexAI(messages, config, options, onChunk);
    case "nvidia-nim":
      return streamWithNvidiaNIM(messages, config, options, onChunk);
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
    case "puter": {
      // Puter.js doesn't need API key - just check if it's available
      if (typeof window === "undefined" || !window.puter) {
        return { success: false, message: "Puter.js is not available. Please refresh the page." };
      }
      try {
        // Try a minimal model list call to verify connection
        await window.puter.ai.listModels();
        return { success: true, message: "Puter.js is connected and ready to use." };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
      }
    }
    
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
              model: "z-ai/glm4.7",
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

      case "google-vertex": {
        if (!config.apiKey) {
          return { models: [], error: "API key is required" };
        }

        const location = config.vertexLocation || "global";
        const vertexMode = config.vertexMode || "express";
        const response = await fetch(`/api/models?provider=google-vertex&apiKey=${encodeURIComponent(config.apiKey)}&location=${encodeURIComponent(location)}&vertexMode=${encodeURIComponent(vertexMode)}`);
        const data = await response.json();

        if (!response.ok) {
          return { models: [], error: data.error || `HTTP ${response.status}` };
        }

        return { models: data.models || [] };
      }

      case "puter": {
        // Puter.js models are fetched client-side via window.puter.ai.listModels()
        return { models: [], error: "Puter.js models must be fetched client-side" };
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
