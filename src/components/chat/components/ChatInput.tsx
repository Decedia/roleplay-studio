"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  accentColor?: "purple" | "amber" | "blue";
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  placeholder = "Type a message...",
  disabled = false,
  isLoading = false,
  accentColor = "blue",
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const gradientClasses = {
    purple: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    amber: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    blue: "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 200) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-xl z-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex items-end gap-2 bg-muted/30 rounded-xl border border-border p-1.5 sm:p-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder={placeholder}
                rows={1}
                className="w-full bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1.5 text-sm min-h-[28px]"
                style={{ minHeight: "24px", maxHeight: "200px" }}
                disabled={disabled}
              />
            </div>
            <Button
              type="submit"
              disabled={disabled || isLoading}
              size="icon"
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg transition-all shadow-lg ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
              title={value.trim() ? "Send message" : "Resend last message"}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line. Empty message resends last.
          </p>
        </form>
      </div>
    </div>
  );
}

// Simple button-only version for generator/brainstorm
interface ChatButtonInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  accentColor?: "purple" | "amber" | "blue";
}

export function ChatButtonInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  placeholder = "Type a message...",
  disabled = false,
  isLoading = false,
  accentColor = "purple",
}: ChatButtonInputProps) {
  const gradientClasses = {
    purple: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    amber: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    blue: "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (onKeyDown) {
              onKeyDown(e);
            } else if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-h-[48px] max-h-[200px]"
          disabled={disabled}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 200) + "px";
          }}
        />
        <Button
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className="px-6 py-3 h-auto"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for new line. Empty message resends last.
      </p>
    </div>
  );
}
