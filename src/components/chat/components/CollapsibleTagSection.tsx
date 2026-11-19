"use client";

import { useState } from "react";

interface CollapsibleTagSectionProps {
  tagName: string;
  content: string;
}

export function CollapsibleTagSection({ tagName, content }: CollapsibleTagSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-ember hover:text-ember transition-colors flex-wrap max-w-full"
      >
        <svg 
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-mono break-all">{`<${tagName}>`}</span>
        <span className="text-parchment-muted">...</span>
        <span className="font-mono break-all">{`</${tagName}>`}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 ml-4 p-3 bg-ink-raised/50 rounded-lg border border-line-strong text-sm text-parchment-soft whitespace-pre-wrap break-words overflow-hidden">
          {content}
        </div>
      )}
    </div>
  );
}
