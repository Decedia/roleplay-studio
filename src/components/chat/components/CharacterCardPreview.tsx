"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Save, X, ChevronDown, ChevronUp, MessageSquare, BookOpen, Tags, FileText } from "lucide-react";

export interface CharacterCardData {
  name?: string;
  description?: string;
  first_mes?: string;
  firstMessage?: string;
  alternate_greetings?: string[];
  alternateGreetings?: string[];
  scenario?: string;
  mes_example?: string;
  mesExample?: string;
  creator_notes?: string;
  creatorNotes?: string;
  system_prompt?: string;
  systemPrompt?: string;
  post_history_instructions?: string;
  postHistoryInstructions?: string;
  tags?: string[];
  avatar?: string;
}

interface CharacterCardPreviewProps {
  data: CharacterCardData;
  onSave?: (data: CharacterCardData) => void;
  onDismiss?: () => void;
  onCopyJson?: (data: CharacterCardData) => void;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getGreeting(data: CharacterCardData): string {
  return data.first_mes || data.firstMessage || "";
}

function getAlternateGreetings(data: CharacterCardData): string[] {
  const arr = data.alternate_greetings || data.alternateGreetings || [];
  return arr.filter((g): g is string => typeof g === "string" && g.trim().length > 0);
}

export function CharacterCardPreview({ data, onSave, onDismiss, onCopyJson }: CharacterCardPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const greeting = getGreeting(data);
  const alternateGreetings = getAlternateGreetings(data);
  const hasAlternateGreetings = alternateGreetings.length > 0;
  const hasScenario = !!data.scenario;
  const hasTags = Array.isArray(data.tags) && data.tags.length > 0;
  const hasCreatorNotes = !!data.creator_notes || !!data.creatorNotes;
  const hasSystemPrompt = !!data.system_prompt || !!data.systemPrompt;
  const hasPostHistory = !!data.post_history_instructions || !!data.postHistoryInstructions;

  return (
    <Card className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header with avatar and name */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-xl sm:text-2xl text-white font-bold">{getInitials(data.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">{data.name || "Unnamed Character"}</h3>
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {data.tags!.slice(0, 5).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <div className="mt-4">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{data.description}</p>
          </div>
        )}

        {/* First message preview */}
        {greeting && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">First Message</span>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2.5">
              <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">{greeting}</p>
            </div>
          </div>
        )}

        {/* Alternate greetings */}
        {hasAlternateGreetings && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{alternateGreetings.length} Alternate Greeting{alternateGreetings.length !== 1 ? "s" : ""}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <div className="mt-2 space-y-2">
                {alternateGreetings.map((greeting, idx) => (
                  <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2.5">
                    <p className="text-sm text-zinc-300 leading-relaxed">{greeting}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scenario */}
        {hasScenario && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Scenario</span>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2.5">
              <p className="text-sm text-zinc-300 leading-relaxed">{data.scenario}</p>
            </div>
          </div>
        )}

        {/* Advanced fields toggle */}
        {(hasSystemPrompt || hasPostHistory || hasCreatorNotes || data.mes_example || data.mesExample) && (
          <div className="mt-4">
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Advanced Fields</span>
              {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showJson && (
              <div className="mt-2 space-y-2">
                {hasSystemPrompt && (
                  <div>
                    <span className="text-xs text-zinc-500">System Prompt</span>
                    <p className="text-sm text-zinc-300 mt-0.5 bg-zinc-800/50 rounded-lg px-3 py-2">{data.system_prompt || data.systemPrompt}</p>
                  </div>
                )}
                {hasPostHistory && (
                  <div>
                    <span className="text-xs text-zinc-500">Post-History Instructions</span>
                    <p className="text-sm text-zinc-300 mt-0.5 bg-zinc-800/50 rounded-lg px-3 py-2">{data.post_history_instructions || data.postHistoryInstructions}</p>
                  </div>
                )}
                {hasCreatorNotes && (
                  <div>
                    <span className="text-xs text-zinc-500">Creator Notes</span>
                    <p className="text-sm text-zinc-300 mt-0.5 bg-zinc-800/50 rounded-lg px-3 py-2">{data.creator_notes || data.creatorNotes}</p>
                  </div>
                )}
                {(data.mes_example || data.mesExample) && (
                  <div>
                    <span className="text-xs text-zinc-500">Example Dialogue</span>
                    <p className="text-sm text-zinc-300 mt-0.5 bg-zinc-800/50 rounded-lg px-3 py-2 whitespace-pre-wrap">{data.mes_example || data.mesExample}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button
            onClick={() => onSave?.(data)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="w-4 h-4" />
            Save Character
          </Button>
          <Button
            variant="outline"
            onClick={() => onCopyJson?.(data)}
            className="flex items-center gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Copy className="w-4 h-4" />
            Copy JSON
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDismiss?.()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}
