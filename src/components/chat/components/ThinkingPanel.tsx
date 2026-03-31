"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "@/lib/types";

interface ThinkingEntry {
  index: number;
  content: string;
  signature?: string;
  modelName?: string;
}

interface ThinkingPanelProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

function extractThinkContent(content: string): string | null {
  const thinkMatch = content.match(/<think\s*>([\s\S]*?)<\/think>/i);
  return thinkMatch ? thinkMatch[1].trim() : null;
}

function extractSignature(content: string): string | undefined {
  const sigMatch = content.match(/\[Signature: (.*?)\]/);
  return sigMatch ? sigMatch[1] : undefined;
}

function extractModelName(content: string): string | undefined {
  const modelMatch = content.match(/\[Model: (.*?)\]/);
  return modelMatch ? modelMatch[1] : undefined;
}

export function ThinkingPanel({ messages, isOpen, onClose }: ThinkingPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Collect all thinking entries from messages
  const thinkingEntries: ThinkingEntry[] = messages
    .map((msg, index) => {
      if (msg.role !== "assistant") return null;
      const content = extractThinkContent(msg.content);
      if (!content) return null;
      return {
        index,
        content,
        signature: msg.signature,
        modelName: msg.modelName,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // Track previous length to detect new entries
  const prevLengthRef = useRef(thinkingEntries.length);

  // Auto-scroll to bottom when new thinking is added
  useEffect(() => {
    if (thinkingEntries.length > prevLengthRef.current && panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
    prevLengthRef.current = thinkingEntries.length;
  }, [thinkingEntries.length]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        fixed lg:sticky
        right-0 top-0 lg:top-20
        h-full lg:h-[calc(100vh-5rem)]
        w-full sm:w-80 lg:w-72
        bg-zinc-900 lg:bg-zinc-900/80
        border-l border-zinc-800
        z-50 lg:z-10
        flex flex-col
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">💭</span>
            <h3 className="text-sm font-medium text-white">AI Thinking</h3>
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full">
              {thinkingEntries.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors lg:hidden"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div ref={panelRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {thinkingEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                <span className="text-2xl">💭</span>
              </div>
              <p className="text-sm text-zinc-500">No thinking content yet</p>
              <p className="text-xs text-zinc-600 mt-1">AI reasoning will appear here</p>
            </div>
          ) : (
            thinkingEntries.map((entry) => (
              <div
                key={entry.index}
                className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === entry.index ? null : entry.index)}
                  className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">#{entry.index + 1}</span>
                    {entry.signature && (
                      <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                        {entry.signature}
                      </span>
                    )}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-zinc-400 transition-transform ${expandedIndex === entry.index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedIndex === entry.index && (
                  <div className="px-3 pb-3">
                    {entry.modelName && (
                      <div className="text-xs text-blue-400 mb-2 pb-2 border-b border-zinc-700">
                        {entry.modelName}
                      </div>
                    )}
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                      {entry.content}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {thinkingEntries.length > 0 && (
          <div className="p-3 border-t border-zinc-800">
            <button
              onClick={() => setExpandedIndex(null)}
              className="w-full px-3 py-2 text-xs text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>
    </>
  );
}
