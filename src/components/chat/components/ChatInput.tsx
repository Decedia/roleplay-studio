"use client";

import React from "react";

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
    <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/80 backdrop-blur-xl z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex items-end gap-3 bg-zinc-900 rounded-2xl border border-zinc-800 p-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder={placeholder}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-500 px-3 py-2 resize-none focus:outline-none"
                style={{ minHeight: "24px", maxHeight: "200px" }}
                disabled={disabled}
              />
            </div>
            <button
              type="submit"
              disabled={disabled || isLoading}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-white rounded-xl transition-all shadow-lg ${gradientClasses[accentColor]} ${accentColor === "blue" ? "shadow-blue-600/20" : accentColor === "purple" ? "shadow-purple-600/20" : "shadow-amber-600/20"} disabled:opacity-50 disabled:cursor-not-allowed`}
              title={value.trim() ? "Send message" : "Resend last message"}
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-2 text-center">
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
        <textarea
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
          className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 border border-zinc-700 resize-none min-h-[48px] max-h-[200px]"
          disabled={disabled}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 200) + "px";
          }}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className={`px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 ${gradientClasses[accentColor]}`}
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-zinc-600 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line. Empty message resends last.
      </p>
    </div>
  );
}
