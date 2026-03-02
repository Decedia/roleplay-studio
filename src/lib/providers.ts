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
} from "./types";

// Re-export types for convenience
export type { LLMProviderType, ProviderConfig, Message, LLMModel, LLMProvider, VertexMode, VertexLocation, ThinkingLevel };

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
  {
    id: "pollinations",
    name: "Pollinations AI",
    description: "AI models via Pollinations AI - supports optional API key for more requests",
    requiresApiKey: false,
    models: [
      { id: "openai", name: "OpenAI", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "openai-fast", name: "OpenAI Fast", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "openai-large", name: "OpenAI Large", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "qwen-coder", name: "Qwen Coder", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "mistral", name: "Mistral", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "openai-audio", name: "OpenAI Audio", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "gemini-fast", name: "Gemini Fast", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "deepseek", name: "DeepSeek", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: true },
      { id: "gemini-search", name: "Gemini Search", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "midijourney", name: "Midijourney", provider: "pollinations", contextWindow: 1, maxTokens: 1, supportsThinking: false },
      { id: "claude-fast", name: "Claude Fast", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "perplexity-fast", name: "Perplexity Fast", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "perplexity-reasoning", name: "Perplexity Reasoning", provider: "pollinations", contextWindow: 131072, maxTokens: 8192, supportsThinking: true },
      { id: "kimi", name: "Kimi", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "nova-fast", name: "Nova Fast", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "glm", name: "GLM", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "minimax", name: "Minimax", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "nomnom", name: "Nomnom", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "polly", name: "Polly", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "qwen-safety", name: "Qwen Safety", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
      { id: "qwen-character", name: "Qwen Character", provider: "pollinations", contextWindow: 131072, maxTokens: 4096, supportsThinking: false },
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

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking) {
      generationConfig.thinkingConfig = {
        thinkingLevel: options.thinkingLevel || "HIGH"
      };
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

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking) {
      generationConfig.thinkingConfig = {
        thinkingLevel: options.thinkingLevel || "HIGH"
      };
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

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking) {
      generationConfig.thinkingConfig = {
        thinkingLevel: options.thinkingLevel || "HIGH"
      };
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
    // 1. CONTEXT: Format conversation history (user/assistant messages)
    const contextMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 2. INSTRUCTIONS: System prompt with structured sections
    // Following Gemini-style: systemInstruction is separate from context
    const systemInstruction = options.systemPrompt
      ? { role: "system" as const, content: options.systemPrompt }
      : null;

    // Combine instructions + context
    const messagesWithSystem = systemInstruction
      ? [systemInstruction, ...contextMessages]
      : contextMessages;

    // 3. LIMITATIONS: Generation config (constraints on output)
    const generationConfig = {
      model: config.selectedModel,
      messages: messagesWithSystem,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      top_k: options.topK,
    };

    // Use server-side proxy to avoid CORS issues
    const response = await fetch("/api/nvidia-nim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: generationConfig,
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
  },
  onChunk: StreamCallback
): Promise<void> => {
  if (!config.apiKey) {
    onChunk({ error: "NVIDIA NIM API key is required" });
    return;
  }

  try {
    // 1. CONTEXT: Format conversation history (user/assistant messages)
    const contextMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 2. INSTRUCTIONS: System prompt with structured sections
    // Following Gemini-style: systemInstruction is separate from context
    const systemInstruction = options.systemPrompt
      ? { role: "system" as const, content: options.systemPrompt }
      : null;

    // Combine instructions + context
    const messagesWithSystem = systemInstruction
      ? [systemInstruction, ...contextMessages]
      : contextMessages;

    // 3. LIMITATIONS: Generation config (constraints on output)
    const generationConfig = {
      model: config.selectedModel,
      messages: messagesWithSystem,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      top_k: options.topK,
      stream: true,
    };

    // Use server-side proxy with streaming
    const response = await fetch("/api/nvidia-nim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "chat/completions",
        apiKey: config.apiKey,
        payload: generationConfig,
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

// Pollinations AI chat implementation - uses direct API call (no API key required)
export const chatWithPollinations: ChatFunction = async (
  messages: Message[],
  config: ProviderConfig,
  options: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    systemPrompt?: string;
    enableThinking?: boolean;
  }
): Promise<ChatResponse> => {
  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messagesWithSystem = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...formattedMessages]
      : formattedMessages;

    // Pollinations AI uses a direct URL with query parameters
    const model = config.selectedModel || "llama-3.1-70b-instruct";
    const url = `https://text.pollinations.ai/`;
    
    // Build headers - API key is optional
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: messagesWithSystem,
        model: model,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        seed: Math.floor(Math.random() * 1000000),
        secure: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }

    const content = await response.text();
    return { content };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
};

// Pollinations AI streaming implementation
export const streamWithPollinations = async (
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
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messagesWithSystem = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...formattedMessages]
      : formattedMessages;

    // Pollinations AI uses a direct URL with query parameters
    const model = config.selectedModel || "llama-3.1-70b-instruct";
    const url = `https://text.pollinations.ai/`;
    
    // Build headers - API key is optional
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    };
    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`;
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: messagesWithSystem,
        model: model,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        seed: Math.floor(Math.random() * 1000000),
        secure: false,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      onChunk({ error: `HTTP ${response.status}: ${errorText}` });
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
          if (!jsonStr) continue;

          // Pollinations returns plain text, not JSON for streaming
          fullContent += jsonStr;
          onChunk({ content: fullContent });
        }
      }
    }

    onChunk({ content: fullContent, done: true });
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

    // Add thinking config for models that support it (Gemini 2.0+)
    if (options.enableThinking) {
      generationConfig.thinkingConfig = {
        thinkingLevel: options.thinkingLevel || "HIGH"
      };
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
    thinkingLevel?: ThinkingLevel;
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
    case "pollinations":
      return chatWithPollinations(messages, config, options);
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
    case "pollinations":
      return streamWithPollinations(messages, config, options, onChunk);
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
    
    case "pollinations": {
      // Pollinations AI doesn't require an API key - it's free
      try {
        // Test with a minimal chat request
        const model = config.selectedModel || "llama-3.1-70b-instruct";
        const response = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Hi" }],
            model: model,
            max_tokens: 5,
            seed: Math.floor(Math.random() * 1000000),
            secure: false,
          }),
        });
        
        if (response.ok) {
          return { success: true, message: "Pollinations AI connection successful!" };
        }
        
        const errorText = await response.text();
        return { success: false, message: `HTTP ${response.status}: ${errorText}` };
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
        // Return static popular Google AI Studio models instead of fetching from API
        const staticModels: FetchedModel[] = [
          {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-3-flash-preview",
            name: "Gemini 3 Flash Preview",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-3-pro-preview",
            name: "Gemini 3 Pro Preview",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-3-pro-image-preview",
            name: "Gemini 3 Pro Image Preview",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: false,
          },
          {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.5-flash-preview-09-2025",
            name: "Gemini 2.5 Flash Preview",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.5-flash-lite-preview-09-2025",
            name: "Gemini 2.5 Flash-Lite Preview",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.5-flash-image",
            name: "Gemini 2.5 Flash Image",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: false,
          },
          {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 8192,
            supportsThinking: true,
          },
          {
            id: "gemini-1.5-pro",
            name: "Gemini 1.5 Pro",
            provider: "google-ai-studio",
            context: 2097152,
            max_tokens: 8192,
            supportsThinking: false,
          },
          {
            id: "gemini-1.5-flash",
            name: "Gemini 1.5 Flash",
            provider: "google-ai-studio",
            context: 1048576,
            max_tokens: 8192,
            supportsThinking: false,
          },
        ];

        return { models: staticModels };
      }

      case "google-vertex": {
        // Return static popular Google Vertex AI models instead of fetching from API
        const staticModels: FetchedModel[] = [
          {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-3-flash-preview",
            name: "Gemini 3 Flash Preview",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-3-pro-preview",
            name: "Gemini 3 Pro Preview",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-3-pro-image-preview",
            name: "Gemini 3 Pro Image Preview",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: false,
          },
          {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.5-flash-preview-09-2025",
            name: "Gemini 2.5 Flash Preview",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.5-flash-lite-preview-09-2025",
            name: "Gemini 2.5 Flash-Lite Preview",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.5-flash-image",
            name: "Gemini 2.5 Flash Image",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: false,
          },
          {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 65536,
            supportsThinking: true,
          },
          {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 8192,
            supportsThinking: true,
          },
          {
            id: "gemini-1.5-pro",
            name: "Gemini 1.5 Pro",
            provider: "google-vertex",
            context: 2097152,
            max_tokens: 8192,
            supportsThinking: false,
          },
          {
            id: "gemini-1.5-flash",
            name: "Gemini 1.5 Flash",
            provider: "google-vertex",
            context: 1048576,
            max_tokens: 8192,
            supportsThinking: false,
          },
        ];

        return { models: staticModels };
      }

      case "puter": {
        // Puter.js models are fetched client-side via window.puter.ai.listModels()
        return { models: [], error: "Puter.js models must be fetched client-side" };
      }

      case "pollinations": {
        // Fetch models from Pollinations AI API
        // Supports optional API key for authenticated requests
        try {
          // Build URL with optional API key
          let url = "/api/models?provider=pollinations";
          if (config.apiKey) {
            url += `&apiKey=${encodeURIComponent(config.apiKey)}`;
          }
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.models && data.models.length > 0) {
            return { models: data.models };
          }
          
          // Fallback to static models if API fails
          const staticModels: FetchedModel[] = [
            { id: "llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "pollinations", context: 131072, max_tokens: 4096, supportsThinking: false },
            { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "pollinations", context: 131072, max_tokens: 4096, supportsThinking: false },
            { id: "qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "pollinations", context: 32768, max_tokens: 8192, supportsThinking: false },
            { id: "qwen-2.5-14b-instruct", name: "Qwen 2.5 14B", provider: "pollinations", context: 32768, max_tokens: 8192, supportsThinking: false },
            { id: "mistral-nemo-instruct", name: "Mistral Nemo", provider: "pollinations", context: 131072, max_tokens: 4096, supportsThinking: false },
            { id: "deepseek-coder-v2-instruct", name: "DeepSeek Coder V2", provider: "pollinations", context: 163840, max_tokens: 16384, supportsThinking: false },
            { id: "flux", name: "Flux (Image Gen)", provider: "pollinations", context: 1, max_tokens: 1, supportsThinking: false },
          ];
          return { models: staticModels };
        } catch (error) {
          // Return fallback models on error
          const staticModels: FetchedModel[] = [
            { id: "llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "pollinations", context: 131072, max_tokens: 4096, supportsThinking: false },
            { id: "llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "pollinations", context: 131072, max_tokens: 4096, supportsThinking: false },
            { id: "qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "pollinations", context: 32768, max_tokens: 8192, supportsThinking: false },
            { id: "qwen-2.5-14b-instruct", name: "Qwen 2.5 14B", provider: "pollinations", context: 32768, max_tokens: 8192, supportsThinking: false },
            { id: "mistral-nemo-instruct", name: "Mistral Nemo", provider: "pollinations", context: 131072, max_tokens: 4096, supportsThinking: false },
            { id: "deepseek-coder-v2-instruct", name: "DeepSeek Coder V2", provider: "pollinations", context: 163840, max_tokens: 16384, supportsThinking: false },
            { id: "flux", name: "Flux (Image Gen)", provider: "pollinations", context: 1, max_tokens: 1, supportsThinking: false },
          ];
          return { models: staticModels };
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
