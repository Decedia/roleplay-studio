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
        className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment-soft transition-colors flex-wrap max-w-full"
      >
        <span className="text-base">💭</span>
        <span>Thinking...</span>
        {signature && (
          <span className="px-2 py-0.5 bg-ember/10 text-ember text-xs rounded-full border border-ember/40 whitespace-nowrap">
            {signature}
          </span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-ink-raised/50 rounded-lg border border-line-strong text-sm text-parchment-muted italic whitespace-pre-wrap break-words overflow-hidden">
          {modelName && (
            <div className="text-xs text-ember mb-2 pb-2 border-b border-line-strong">
              Thought process from {modelName}
            </div>
          )}
          {content}
        </div>
      )}
    </div>
  );
}
