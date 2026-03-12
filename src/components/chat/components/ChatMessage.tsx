"use client";

import React from "react";
import { ThinkingSection } from "./ThinkingSection";
import { FormattedText } from "./FormattedText";
import { getThoughtSignature } from "../utils";
import type { LLMProviderType } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  isContinue?: boolean;
}

interface ChatMessageProps {
  message: Message;
  index: number;
  isLastMessage: boolean;
  isLastAssistantMessage?: boolean;
  senderName?: string;
  senderInitial?: string;
  avatarUrl?: string;
  avatarGradient?: "purple" | "blue";
  isEditing?: boolean;
  editingMessageContent?: string;
  onEditMessage?: (content: string) => void;
  onCancelEdit?: () => void;
  onDeleteMessage?: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
  modelId?: string;
  provider?: LLMProviderType;
  isGeneratorView?: boolean;
}

export function ChatMessage({
  message,
  index,
  isLastMessage,
  isLastAssistantMessage = false,
  senderName,
  senderInitial,
  avatarUrl,
  avatarGradient = "purple",
  isEditing = false,
  editingMessageContent,
  onEditMessage,
  onCancelEdit,
  onDeleteMessage,
  onRegenerate,
  onContinue,
  modelId,
  provider,
  isGeneratorView = false,
}: ChatMessageProps) {
  // Get thinking content from content (wrapped in <think> tags)
  const thinkContent = message.role === "assistant"
    ? extractThinkContent(message.content)
    : null;
    
  // Get raw content without think tags
  const rawContent = message.role === "assistant"
    ? removeThinkTags(message.content)
    : message.content;
    
  const thoughtSignature = modelId && provider ? getThoughtSignature(modelId, provider) : null;

  const gradientClass = avatarGradient === "purple" 
    ? "from-purple-500 to-pink-500" 
    : "from-blue-500 to-cyan-500";

  // If editing, show edit form
  if (isEditing) {
    return (
      <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {message.role === "assistant" && (
          avatarUrl ? (
            <img src={avatarUrl} alt={senderName} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <span className="text-sm text-white font-semibold">
                {senderInitial?.charAt(0).toUpperCase()}
              </span>
            </div>
          )
        )}
        <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
          <div className="rounded-2xl px-4 py-3 bg-zinc-800 text-white">
            <textarea
              value={editingMessageContent}
              onChange={(e) => onEditMessage?.(e.target.value)}
              className="w-full bg-transparent text-white resize-none focus:outline-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  // Save edit - handled by parent
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 bg-zinc-600 text-white rounded-lg text-sm hover:bg-zinc-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        {message.role === "user" && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <span className="text-sm text-white font-semibold">
              {senderInitial?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex gap-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "assistant" && (
        avatarUrl ? (
          <img src={avatarUrl} alt={senderName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <span className="text-sm text-white font-semibold">
              {senderInitial?.charAt(0).toUpperCase()}
            </span>
          </div>
        )
      )}
      <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
        {/* Show thinking section for assistant messages */}
        {thinkContent && (
          <ThinkingSection 
            content={thinkContent} 
            signature={thoughtSignature?.signature}
            modelName={thoughtSignature?.modelName}
          />
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            message.role === "user"
              ? "bg-zinc-700 text-white"
              : "bg-zinc-800 text-zinc-100"
          }`}
        >
          {isGeneratorView ? (
            <div className="whitespace-pre-wrap text-sm">{rawContent}</div>
          ) : (
            <FormattedText content={rawContent} />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-zinc-500">
            {message.role === "user" ? senderName : senderName || "AI"}
          </p>
          
          {/* Action buttons for last messages */}
          {isLastAssistantMessage && (
            <div className="flex gap-1 ml-2">
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Regenerate"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              {onContinue && (
                <button
                  onClick={onContinue}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Continue"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {onDeleteMessage && (
                <button
                  onClick={onDeleteMessage}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {message.role === "user" && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <span className="text-sm text-white font-semibold">
            {senderInitial?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper functions (duplicated here to avoid circular imports)
function extractThinkContent(content: string): string | null {
  const thinkMatch = content.match(/<think\s*>([\s\S]*?)<\/think>/i);
  return thinkMatch ? thinkMatch[1].trim() : null;
}

function removeThinkTags(content: string): string {
  return content.replace(/<think\s*>[\s\S]*?<\/think>/gi, "").trim();
}
