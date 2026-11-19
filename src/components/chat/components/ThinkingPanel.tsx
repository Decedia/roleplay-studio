"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "@/lib/types";

interface TagEntry {
  id: string;
  tagName: string;
  content: string;
  messageIndex: number;
}

interface ThinkingPanelProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

// Extract all XML-like tags from content
function extractAllTags(content: string): Array<{ tagName: string; content: string }> {
  const tags: Array<{ tagName: string; content: string }> = [];
  // Match all <tagname>content</tagname> patterns (not self-closing)
  const regex = /<([a-zA-Z][a-zA-Z0-9_-]*)\s*>([\s\S]*?)<\/\1>/gi;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const tagName = match[1].toLowerCase();
    const tagContent = match[2].trim();
    // Skip think tags (handled separately)
    if (tagName !== "think" && tagContent) {
      tags.push({ tagName, content: tagContent });
    }
  }
  
  return tags;
}

export function ThinkingPanel({ messages, isOpen, onClose }: ThinkingPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // Collect all tag entries from messages
  const tagEntries: TagEntry[] = messages.flatMap((msg, index) => {
    if (msg.role !== "assistant") return [];
    const tags = extractAllTags(msg.content);
    return tags.map((tag, tagIndex) => ({
      id: `${index}-${tagIndex}`,
      tagName: tag.tagName,
      content: tag.content,
      messageIndex: index,
    }));
  });

  // Get unique tag names for filtering
  const tagNames = [...new Set(tagEntries.map((e) => e.tagName))];

  // Auto-scroll to bottom when new tags are added
  useEffect(() => {
    if (tagEntries.length > prevCountRef.current && panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
    prevCountRef.current = tagEntries.length;
  }, [tagEntries.length]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
        fixed lg:sticky
        right-0 top-0 lg:top-20
        h-full lg:h-[calc(100vh-5rem)]
        w-full sm:w-80 lg:w-72
        bg-ink-raised lg:bg-ink-raised/80
        border-l border-line
        z-50 lg:z-10
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="text-lg">{"<>"}</span>
            <h3 className="text-sm font-medium text-parchment">Tags</h3>
            <span className="px-2 py-0.5 bg-ink-hover text-parchment-muted text-xs rounded-full">
              {tagEntries.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-ink-hover rounded-lg transition-colors lg:hidden"
          >
            <svg
              className="w-5 h-5 text-parchment-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tag type filters */}
        {tagNames.length > 1 && (
          <div className="flex flex-wrap gap-1 p-2 border-b border-line">
            {tagNames.map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 bg-ember/10 text-ember-soft text-xs rounded-full border border-line-strong"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div ref={panelRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {tagEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-ink-hover flex items-center justify-center mb-3">
                <span className="text-xl text-parchment-muted">{"<>"}</span>
              </div>
              <p className="text-sm text-parchment-muted">No tags found yet</p>
              <p className="text-xs text-parchment-muted mt-1">
                Custom tags from AI responses will appear here
              </p>
            </div>
          ) : (
            tagEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-ink-hover/50 rounded-lg border border-line-strong overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                  className="w-full flex items-center justify-between p-2.5 hover:bg-ink-hover transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 bg-ember/20 text-ember-soft text-xs rounded font-mono truncate">
                      {"<"}
                      {entry.tagName}
                      {">"}
                    </span>
                    <span className="text-xs text-parchment-muted">
                      msg #{entry.messageIndex + 1}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-parchment-muted transition-transform flex-shrink-0 ${
                      expandedId === entry.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedId === entry.id && (
                  <div className="px-3 pb-3">
                    <pre className="text-sm text-parchment-soft whitespace-pre-wrap break-words bg-ink-raised/50 rounded p-2 text-xs">
                      {entry.content}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {tagEntries.length > 0 && (
          <div className="p-3 border-t border-line">
            <button
              onClick={() => setExpandedId(null)}
              className="w-full px-3 py-2 text-xs text-parchment-muted hover:text-parchment-soft hover:bg-ink-hover rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>
    </>
  );
}
