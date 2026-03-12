"use client";

import { useState } from "react";

interface ThinkingSectionProps {
  content: string;
  signature?: string;
  modelName?: string;
}

export function ThinkingSection({ content, signature, modelName }: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
      >
        <span className="text-base">💭</span>
        <span>Thinking...</span>
        {signature && (
          <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-800">
            {signature}
          </span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700 text-sm text-zinc-400 italic whitespace-pre-wrap">
          {modelName && (
            <div className="text-xs text-blue-400 mb-2 pb-2 border-b border-zinc-700">
              Thought process from {modelName}
            </div>
          )}
          {content}
        </div>
      )}
    </div>
  );
}
