"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, X, ChevronDown, ChevronUp, MessageSquare, BookOpen, Tags, FileText, Sparkles } from "lucide-react";

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const greeting = getGreeting(data);
  const alternateGreetings = getAlternateGreetings(data);
  const hasAlternateGreetings = alternateGreetings.length > 0;
  const hasScenario = !!data.scenario;
  const hasTags = Array.isArray(data.tags) && data.tags.length > 0;
  const hasAdvanced = !!(data.system_prompt || data.systemPrompt || data.post_history_instructions || data.postHistoryInstructions || data.creator_notes || data.creatorNotes || data.mes_example || data.mesExample);

  return (
    <Card className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-zinc-900/80 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg ring-2 ring-white/10">
            <span className="text-2xl sm:text-3xl text-white font-bold">{getInitials(data.name)}</span>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{data.name || "Unnamed Character"}</h3>
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.tags!.slice(0, 6).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
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
          <div className="mt-5">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{data.description}</p>
          </div>
        )}

        {/* First message */}
        {greeting && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-md bg-purple-500/10">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">First Message</span>
            </div>
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-3">
              <p className="text-sm text-zinc-200 leading-relaxed">{greeting}</p>
            </div>
          </div>
        )}

        {/* Alternate greetings */}
        {hasAlternateGreetings && (
          <div className="mt-5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <div className="p-1 rounded-md bg-pink-500/10">
                <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <span className="flex-1">{alternateGreetings.length} Alternate Greeting{alternateGreetings.length !== 1 ? "s" : ""}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <div className="mt-3 space-y-2">
                {alternateGreetings.map((greeting, idx) => (
                  <div key={idx} className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-3">
                    <p className="text-sm text-zinc-200 leading-relaxed">{greeting}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scenario */}
        {hasScenario && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-md bg-blue-500/10">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Scenario</span>
            </div>
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-3">
              <p className="text-sm text-zinc-200 leading-relaxed">{data.scenario}</p>
            </div>
          </div>
        )}

        {/* Advanced fields */}
        {hasAdvanced && (
          <div className="mt-5">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <div className="p-1 rounded-md bg-zinc-700/50">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <span className="flex-1">Advanced Fields</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-3">
                {(data.system_prompt || data.systemPrompt) && (
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">System Prompt</span>
                    <p className="text-sm text-zinc-300 mt-1 bg-zinc-800/60 rounded-lg px-3 py-2 border border-zinc-700/60">{data.system_prompt || data.systemPrompt}</p>
                  </div>
                )}
                {(data.post_history_instructions || data.postHistoryInstructions) && (
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Post-History Instructions</span>
                    <p className="text-sm text-zinc-300 mt-1 bg-zinc-800/60 rounded-lg px-3 py-2 border border-zinc-700/60">{data.post_history_instructions || data.postHistoryInstructions}</p>
                  </div>
                )}
                {(data.creator_notes || data.creatorNotes) && (
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Creator Notes</span>
                    <p className="text-sm text-zinc-300 mt-1 bg-zinc-800/60 rounded-lg px-3 py-2 border border-zinc-700/60">{data.creator_notes || data.creatorNotes}</p>
                  </div>
                )}
                {(data.mes_example || data.mesExample) && (
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Example Dialogue</span>
                    <p className="text-sm text-zinc-300 mt-1 bg-zinc-800/60 rounded-lg px-3 py-2 border border-zinc-700/60 whitespace-pre-wrap">{data.mes_example || data.mesExample}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="bg-zinc-900/80 border-t border-zinc-800 px-5 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => onSave?.(data)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
          >
            <Save className="w-4 h-4" />
            Save Character
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDismiss?.()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 ml-auto"
          >
            <X className="w-4 h-4" />
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}
