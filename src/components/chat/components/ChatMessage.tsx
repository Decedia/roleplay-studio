"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, ChevronRight, Trash2, Save, X } from "lucide-react";
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
      <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {message.role === "assistant" && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={senderName} className="object-cover" />
            <AvatarFallback className={`bg-gradient-to-br ${gradientClass} text-white text-sm font-semibold`}>
              {senderInitial?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === "user" ? "order-first" : ""}`}>
          <div className="rounded-xl px-3 py-3 bg-zinc-800 border border-zinc-700">
            <Textarea
              value={editingMessageContent}
              onChange={(e) => onEditMessage?.(e.target.value)}
              className="w-full bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px] text-sm text-white"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="h-7 px-3" onClick={() => onEditMessage?.(editingMessageContent ?? "")}>
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="secondary" className="h-7 px-3" onClick={onCancelEdit}>
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
        {message.role === "user" && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className={`bg-gradient-to-br ${gradientClass} text-white text-sm font-semibold`}>
              {senderInitial?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={`flex gap-3 py-1 ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {message.role === "assistant" && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={avatarUrl} alt={senderName} className="object-cover" />
            <AvatarFallback className={`bg-gradient-to-br ${gradientClass} text-white text-sm font-semibold`}>
              {senderInitial?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === "user" ? "order-first" : ""}`}>
          {/* Show thinking section for assistant messages */}
          {thinkContent && (
            <ThinkingSection 
              content={thinkContent} 
              signature={thoughtSignature?.signature}
              modelName={thoughtSignature?.modelName}
            />
          )}
          
          <div
            className={`rounded-xl px-3 py-2.5 transition-all duration-200 ${
              message.role === "user"
                ? "bg-primary/90 text-primary-foreground"
                : "bg-zinc-800 text-zinc-100 border border-zinc-700/50"
            }`}
          >
            <FormattedText content={rawContent} />
          </div>
          
          <div className="flex items-center gap-2 mt-1 pl-1">
            <p className="text-[11px] text-zinc-500">
              {message.role === "user" ? senderName : senderName || "AI"}
            </p>
            
            {/* Action buttons for last messages */}
            {isLastAssistantMessage && (
              <div className="flex gap-0.5 ml-2 opacity-70 hover:opacity-100 transition-opacity">
                {onRegenerate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-zinc-700/50"
                        onClick={onRegenerate}
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-200" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Regenerate
                    </TooltipContent>
                  </Tooltip>
                )}
                {onContinue && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-zinc-700/50"
                        onClick={onContinue}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-200" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Continue
                    </TooltipContent>
                  </Tooltip>
                )}
                {onDeleteMessage && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-900/30"
                        onClick={onDeleteMessage}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Delete
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>
        {message.role === "user" && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarFallback className={`bg-gradient-to-br ${gradientClass} text-white text-sm font-semibold`}>
              {senderInitial?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </TooltipProvider>
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
