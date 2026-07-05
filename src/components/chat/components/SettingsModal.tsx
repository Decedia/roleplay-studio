"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  LLMProviderType,
  ProviderConfig,
  Message,
  sendChatMessage,
  streamChatMessage,
  AVAILABLE_PROVIDERS,
  getModelsForProvider,
  getDefaultModelForProvider,
  testProviderConnection,
  TestConnectionResult,
  VertexMode,
  VertexLocation,
  fetchModelsFromProvider,
  FetchedModel,
  DEFAULT_KOBOLD_HORDE_MODEL,
} from "@/lib/providers";
import { useToast } from "@/hooks/useToast";
import {
  summarizeConversation,
  shouldTriggerSummarization,
  getMessagesToSummarize,
  getNewSummarizedIndex,
  type SummarizationConfig,
  type SummarizationResult,
} from "@/lib/summarization";
import { readCharacterFile, buildFullSystemPrompt } from "@/lib/character-import";
import { Character as CharacterType, CharacterBook, CharacterBookEntry, ProviderProfile, GeneratorConversation, BrainstormConversation, Instruction, InstructionRole, InstructionPosition, InstructionPreset } from "@/lib/types";
import { parseRoleplayText, getSegmentClasses, TextSegment } from "@/lib/text-formatter";
import * as ui from "@/components/chat/styles";

interface ModelCost {
  currency?: string;
  tokens?: number;
  input?: number;
  output?: number;
}

interface Model {
  id: string;
  provider?: string;
  name?: string;
  aliases?: string[];
  context?: number;
  max_tokens?: number;
  cost?: ModelCost;
}

interface ConnectionStatus {
  status: "disconnected" | "connected" | "testing" | "error";
  message?: string;
  lastTested?: number;
}

type SummarizationTrigger = "manual" | "auto-length" | "periodic";
type SummarizationQuality = "fast" | "balanced" | "detailed";

interface SummarizationSettings {
  enabled: boolean;
  trigger: SummarizationTrigger;
  quality: SummarizationQuality;
  overrideModel: string;
  temperature: number;
  messageThreshold: number;
  tokenThreshold: number;
  periodicInterval: number;
  recentMessagesCount: number;
  provider?: string;
  modelId?: string;
  instructions?: string;
  summaryLength?: number;
}

interface GlobalSettings {
  temperature: number;
  maxTokens: number;
  maxContextTokens: number;
  topP: number;
  topK: number;
  modelId: string;
  enableThinking: boolean;
  thinkingLevel: "LOW" | "MEDIUM" | "HIGH";
  thinkingBudget: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  useCustomSize: boolean;
  enableStreaming: boolean;
  dingWhenUnfocused: boolean;
  summarization: SummarizationSettings;
  instructionInjectionPosition: "start" | "before-last" | "custom-index";
  instructionCustomInjectionIndex: number;
}

interface GlobalInstructions {
  customInstructions: string;
  systemPrompt?: string;
  postHistoryInstructions?: string;
  jailbreakInstructions?: string;
  enableJailbreak: boolean;
  continueInstruction?: string;
  imageGenerationInstructions?: string;
  formattingPrompt?: string;
  instructions: Instruction[];
}

interface AutoExportSettings {
  enabled: boolean;
  intervalMinutes: number;
}

export function SettingsModal({
  show,
  onClose,
  globalSettings,
  setGlobalSettings,
  globalInstructions,
  setGlobalInstructions,
  providerConfigs,
  setProviderConfigs,
  activeProvider,
  setActiveProvider,
  connectionStatus,
  handleConnectProvider,
  providerModels,
  modelsFetching,
  onImportInstructions,
  onExportData,
  onImportData,
  autoExport,
  setAutoExport,
  createProfile,
  selectProfile,
  deleteProfile,
  getActiveProfile,
  initialTab = "settings",
  showModelsSection = true,
  showInstructionsSection = true,
}: {
  show: boolean;
  onClose: () => void;
  globalSettings: GlobalSettings;
  setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
  globalInstructions: GlobalInstructions;
  setGlobalInstructions: React.Dispatch<React.SetStateAction<GlobalInstructions>>;
  providerConfigs: Record<LLMProviderType, ProviderConfig>;
  setProviderConfigs: React.Dispatch<React.SetStateAction<Record<LLMProviderType, ProviderConfig>>>;
  activeProvider: LLMProviderType;
  setActiveProvider: React.Dispatch<React.SetStateAction<LLMProviderType>>;
  connectionStatus: Record<LLMProviderType, ConnectionStatus>;
  handleConnectProvider: (providerType: LLMProviderType) => void;
  providerModels: Record<LLMProviderType, FetchedModel[]>;
  modelsFetching: Record<LLMProviderType, boolean>;
  onImportInstructions: (file: File) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  autoExport: AutoExportSettings;
  setAutoExport: React.Dispatch<React.SetStateAction<AutoExportSettings>>;
  createProfile: (providerType: LLMProviderType, profileData: Omit<ProviderProfile, "id" | "createdAt">) => ProviderProfile;
  selectProfile: (providerType: LLMProviderType, profileId: string) => void;
  deleteProfile: (providerType: LLMProviderType, profileId: string) => void;
  getActiveProfile: (providerType: LLMProviderType) => ProviderProfile | undefined;
  initialTab?: "settings" | "models" | "instructions";
  showModelsSection?: boolean;
  showInstructionsSection?: boolean;
}) {
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
  const [showModelDropdown, setShowModelDropdown] = useState(initialTab === "models");
  const [modelSearchQuery, setModelSearchQuery] = useState("");

  const modelSearchInputRef = useRef<HTMLInputElement>(null);
  const [editingProvider, setEditingProvider] = useState<LLMProviderType | null>(null);
   const [showAdvancedInstructions, setShowAdvancedInstructions] = useState(true);
   const [activeInstructionsTab, setActiveInstructionsTab] = useState<"chat" | "generator" | "brainstorm" | "vn">("chat");
   const dropdownRef = useRef<HTMLDivElement>(null);
   const instructionsFileInputRef = useRef<HTMLInputElement>(null);
   const dataImportInputRef = useRef<HTMLInputElement>(null);
   const [showProviderDropdown, setShowProviderDropdown] = useState(false);
   const [providerSearchQuery, setProviderSearchQuery] = useState("");
    const providerSearchInputRef = useRef<HTMLInputElement>(null);

    // Ollama presets for self-hosted providers
    const ollamaPresets = [
      { label: "Ollama (Local)", value: "http://localhost:11434/api/chat", note: "default" },
      { label: "Hugging Face Space", value: "https://{username}-{space-name}.hf.space/api/chat", note: "custom" },
      { label: "LM Studio", value: "http://localhost:1234/v1/chat/completions", note: "OpenAI format" },
      { label: "Jan.ai", value: "http://localhost:1337/v1/chat/completions", note: "OpenAI format" },
      { label: "Kobold.cpp", value: "http://localhost:5001/api/v1/generate", note: "custom" },
      { label: "Text Generation WebUI", value: "http://localhost:5000/api/v1/chat", note: "custom" },
      { label: "Custom", value: "", note: "manual" },
    ];

    // Helper function to get the selected preset for a profile
    const getSelectedPresetForProfile = (profile: ProviderProfile | undefined): { label: string; value: string; note: string } | null => {
      if (!profile) return null;
      // Check if lastUsedPreset matches a preset
      const lastUsedPresetMatch = ollamaPresets.find(p => p.value === profile.lastUsedPreset);
      if (lastUsedPresetMatch) return lastUsedPresetMatch;
      // Check if baseUrl matches a preset
      const baseUrlMatch = ollamaPresets.find(p => p.value === profile.baseUrl);
      if (baseUrlMatch) return baseUrlMatch;
      // Otherwise, return Custom
      return ollamaPresets.find(p => p.label === "Custom") || null;
    };

    // Handler for preset dropdown change
    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const preset = ollamaPresets.find(p => p.value === selectedValue);
      if (preset && preset.label !== "Custom") {
        // Update the profile's baseUrl and lastUsedPreset
        const profileId = providerConfigs["ollama"]?.activeProfileId;
        if (profileId) {
          setProviderConfigs(prev => ({
            ...prev,
            "ollama": {
              ...prev["ollama"],
              profiles: (prev["ollama"]?.profiles || []).map(p =>
                p.id === profileId
                  ? {
                      ...p,
                      baseUrl: preset.value,
                      lastUsedPreset: preset.value,
                    }
                  : p
              )
            }
          }));
        }
      }
      // If Custom is selected, we do not change the profile's baseUrl or lastUsedPreset
    };

    // Get models for the modal provider (the provider selected in the modal)
    const modalProviderModels = providerModels[activeProvider] || [];
    
    const isLoadingModalProviderModels = modelsFetching[activeProvider];
    
    // Get models for the active provider
    const activeProviderModels = providerModels[activeProvider] || [];
    const isLoadingModels = modelsFetching[activeProvider] || false;
   
   // Find selected model info for the modal provider
   const selectedModel = modalProviderModels.find(m => m.id === globalSettings.modelId);

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowModelDropdown(false);
    }
   };
 
   useEffect(() => {
     if (showModelDropdown) {
       document.addEventListener("mousedown", handleClickOutside);
       setTimeout(() => modelSearchInputRef.current?.focus(), 50);
     }
     return () => {
       document.removeEventListener("mousedown", handleClickOutside);
       setModelSearchQuery("");
     };
   }, [showModelDropdown]);
   
   // Close dropdown when clicking outside for provider dropdown
   const handleProviderClickOutside = (e: MouseEvent) => {
     if (providerSearchInputRef.current && !providerSearchInputRef.current.contains(e.target as Node)) {
       setShowProviderDropdown(false);
     }
   };
   
   useEffect(() => {
     if (showProviderDropdown) {
       document.addEventListener("mousedown", handleProviderClickOutside);
       setTimeout(() => providerSearchInputRef.current?.focus(), 50);
     }
     return () => {
       document.removeEventListener("mousedown", handleProviderClickOutside);
       setProviderSearchQuery("");
     };
   }, [showProviderDropdown]);

  const selectModel = (modelId: string) => {
    const model = activeProviderModels.find(m => m.id === modelId);
    const maxOutput = model?.max_tokens || 4000;
    const maxContext = model?.context || 128000;
    // Auto-set max tokens to model's maximum when selecting a new model
    const newMaxTokens = maxOutput;
    const newMaxContext = maxContext;
    
    // Update global settings
    setGlobalSettings({ ...globalSettings, modelId, maxTokens: newMaxTokens, maxContextTokens: newMaxContext });
    
    // Also update the provider config and active profile
    const config = providerConfigs[activeProvider];
    setProviderConfigs(prev => ({
      ...prev,
      [activeProvider]: { 
        ...prev[activeProvider], 
        selectedModel: modelId,
        profiles: prev[activeProvider].profiles.map(p => 
          p.id === config.activeProfileId ? { ...p, selectedModel: modelId } : p
        )
      }
    }));
    
    setShowModelDropdown(false);
  };

  const getModelCostInfo = (model: Model | FetchedModel) => {
    if ('cost' in model && model.cost && model.cost.tokens) {
      const inputCost = (model.cost.input || 0) / 100 * (1000000 / model.cost.tokens);
      const outputCost = (model.cost.output || 0) / 100 * (1000000 / model.cost.tokens);
      if (inputCost === 0 && outputCost === 0) {
        return "Free";
      }
      return `$${inputCost.toFixed(2)}/M in | $${outputCost.toFixed(2)}/M out`;
    }
    return "Pricing N/A";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Models & Settings</h2>
            <p className="text-sm text-zinc-500">Configure AI providers, models, and global settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
             {/* Models and Providers */}
             {showModelsSection && (
               <div>
             <label className="block text-sm font-medium text-zinc-400 mb-2">
               Model ({AVAILABLE_PROVIDERS.find(p => p.id === activeProvider)?.name || activeProvider})
             </label>
            {isLoadingModels ? (
              <div className="w-full bg-zinc-800 text-zinc-400 rounded-lg px-4 py-2 border border-zinc-700">
                Loading models...
              </div>
             ) : activeProviderModels.length === 0 ? (
               <div className="w-full bg-zinc-800/50 text-zinc-400 rounded-lg px-4 py-2 border border-zinc-700">
                 No models available. Connect to load models.
               </div>
            ) : (
              <>
                {/* Custom Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {selectedModel ? (
                        <>
                          {selectedModel.name || selectedModel.id}
                          {'context' in selectedModel && selectedModel.context && (
                            <span className="text-zinc-400 ml-2">
                              ({selectedModel.context?.toLocaleString() || "?"} ctx)
                            </span>
                          )}
                        </>
                      ) : (
                        "Select a model"
                      )}
                    </span>
                    <svg className={`w-5 h-5 text-zinc-400 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showModelDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-80 overflow-y-auto shadow-xl">
                      <div className="p-2 border-b border-zinc-700">
                        <input
                          ref={modelSearchInputRef}
                          type="text"
                          placeholder="Search models or enter custom model ID..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="w-full bg-zinc-900 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && modelSearchQuery.trim()) {
                              selectModel(modelSearchQuery.trim());
                            }
                          }}
                        />
                      </div>
                      {(() => {
                        const query = modelSearchQuery.toLowerCase().trim();
                        const filteredModels = activeProviderModels.filter(m => 
                          m.id.toLowerCase().includes(query) || 
                          (m.name && m.name.toLowerCase().includes(query))
                        );
                        
                        const freeModels = filteredModels.filter(m => m.id.toLowerCase().includes('free') || m.id.toLowerCase().includes('free:'));
                        const paidModels = filteredModels.filter(m => !m.id.toLowerCase().includes('free') && !m.id.toLowerCase().includes('free:'));
                        
                        const hasCustomMatch = query && !filteredModels.some(m => m.id.toLowerCase() === query);
                        
                        return (
                          <>
                            {hasCustomMatch && (
                              <button
                                type="button"
                                onClick={() => selectModel(modelSearchQuery.trim())}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors text-amber-400 border-b border-zinc-700"
                              >
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                   <span className="font-medium">Use custom model: &quot;{modelSearchQuery.trim()}&quot;</span>
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">
                                  Press Enter or click to use this model
                                </div>
                              </button>
                            )}
                            {freeModels.length > 0 && (
                              <>
                                <div className="px-4 py-1.5 text-xs font-semibold text-green-400 bg-green-900/20 border-b border-zinc-700">
                                  FREE
                                </div>
                                {freeModels.map((model) => {
                                  const isSelected = model.id === globalSettings.modelId;
                                  return (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={() => selectModel(model.id)}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors ${
                                        isSelected ? "bg-blue-900/30 text-blue-300" : "text-zinc-300"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{model.name || model.id}</span>
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      {'context' in model && model.context && (
                                        <div className="text-xs text-zinc-500 mt-0.5">
                                          {model.context?.toLocaleString() || "?"} ctx | {getModelCostInfo(model)}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </>
                            )}
                            {paidModels.length > 0 && (
                              <>
                                <div className="px-4 py-1.5 text-xs font-semibold text-yellow-400 bg-yellow-900/20 border-b border-zinc-700">
                                  PAID
                                </div>
                                {paidModels.map((model) => {
                                  const isSelected = model.id === globalSettings.modelId;
                                  return (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={() => selectModel(model.id)}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors ${
                                        isSelected ? "bg-blue-900/30 text-blue-300" : "text-zinc-300"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{model.name || model.id}</span>
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      {'context' in model && model.context && (
                                        <div className="text-xs text-zinc-500 mt-0.5">
                                          {model.context?.toLocaleString() || "?"} ctx | {getModelCostInfo(model)}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </>
                            )}
                            {filteredModels.length === 0 && !hasCustomMatch && modelSearchQuery && (
                               <div className="px-4 py-3 text-center text-zinc-500 text-sm">
                                 No models found. Press Enter to use &quot;{modelSearchQuery}&quot; as custom model.
                               </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Selected Model Info */}
                {selectedModel && 'context' in selectedModel && selectedModel.context && (
                  <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="text-zinc-300">{selectedModel.provider || activeProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Context Window:</span>
                      <span className="text-zinc-300">{selectedModel.context?.toLocaleString() || "Unknown"} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Output:</span>
                      <span className="text-zinc-300">{selectedModel.max_tokens?.toLocaleString() || "Unknown"} tokens</span>
                    </div>
                  </div>
                )}
              </>
            )}
           </div>
           )}

           {/* Global Settings */}
           <div className="border-t border-zinc-700 pt-6">
             <h3 className="text-sm font-medium text-white mb-4">Global Settings</h3>
             <div className="space-y-4">
               {/* Temperature */}
               <div>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Temperature: {globalSettings.temperature.toFixed(2)}
                 </label>
                 <input
                   type="range"
                   min="0"
                   max="2"
                   step="0.1"
                   value={globalSettings.temperature}
                   onChange={(e) => setGlobalSettings({ ...globalSettings, temperature: parseFloat(e.target.value) })}
                   className="w-full"
                 />
                 <p className="text-xs text-zinc-500 mt-1">
                   Lower = more focused, Higher = more creative
                 </p>
               </div>

               {/* Custom Size Toggle */}
               <div className="flex items-center gap-3 mb-4">
                 <Checkbox
                   id="useCustomSize"
                   checked={globalSettings.useCustomSize}
                   onCheckedChange={(useCustom) => {
                     if (!useCustom && selectedModel) {
                       // Reset to model max when disabling custom size
                       setGlobalSettings({ 
                         ...globalSettings, 
                         useCustomSize: false,
                         maxTokens: selectedModel.max_tokens || 4000,
                         maxContextTokens: selectedModel.context || 128000
                       });
                     } else {
                       setGlobalSettings({ ...globalSettings, useCustomSize: useCustom as boolean });
                     }
                   }}
                   className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                 />
                 <label htmlFor="useCustomSize" className="text-sm text-zinc-300 cursor-pointer">
                   Use custom output/context sizes
                 </label>
               </div>

               {/* Max Output Tokens */}
               <div className={globalSettings.useCustomSize ? "" : "opacity-50 pointer-events-none"}>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Max Output Tokens
                 </label>
                 <div className="flex items-center gap-3">
                   <input
                     type="range"
                     min="100"
                     max={Math.max(selectedModel?.max_tokens || 4000, globalSettings.maxTokens)}
                     step="100"
                     value={globalSettings.maxTokens}
                     onChange={(e) => setGlobalSettings({ ...globalSettings, maxTokens: parseInt(e.target.value) })}
                     className="flex-1"
                     disabled={!globalSettings.useCustomSize}
                   />
                   <input
                     type="number"
                     min="100"
                     value={globalSettings.maxTokens}
                     onChange={(e) => {
                       const value = parseInt(e.target.value);
                       if (!isNaN(value) && value >= 100) {
                         setGlobalSettings({ ...globalSettings, maxTokens: value });
                       }
                     }}
                     className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-center text-sm focus:outline-none focus:border-purple-500"
                     disabled={!globalSettings.useCustomSize}
                   />
                   <button
                     onClick={() => setGlobalSettings({ ...globalSettings, maxTokens: selectedModel?.max_tokens || 4000 })}
                     className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white transition-colors"
                     title="Set to model maximum"
                     disabled={!globalSettings.useCustomSize}
                   >
                     Max
                   </button>
                 </div>
                 <p className="text-xs text-zinc-500 mt-1">
                   Maximum length of AI responses • Model max: <span className="text-purple-400">{(selectedModel?.max_tokens || 4000).toLocaleString()}</span> tokens
                 </p>
               </div>

               {/* Max Context Tokens */}
               <div className={globalSettings.useCustomSize ? "" : "opacity-50 pointer-events-none"}>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Max Context Tokens
                 </label>
                 <div className="flex items-center gap-3">
                   <input
                     type="range"
                     min="1000"
                     max={Math.max(selectedModel?.context || 128000, globalSettings.maxContextTokens)}
                     step="1000"
                     value={globalSettings.maxContextTokens}
                     onChange={(e) => setGlobalSettings({ ...globalSettings, maxContextTokens: parseInt(e.target.value) })}
                     className="flex-1"
                     disabled={!globalSettings.useCustomSize}
                   />
                   <input
                     type="number"
                     min="1000"
                     value={globalSettings.maxContextTokens}
                     onChange={(e) => {
                       const value = parseInt(e.target.value);
                       if (!isNaN(value) && value >= 1000) {
                         setGlobalSettings({ ...globalSettings, maxContextTokens: value });
                       }
                     }}
                     className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-center text-sm focus:outline-none focus:border-purple-500"
                     disabled={!globalSettings.useCustomSize}
                   />
                   <button
                     onClick={() => setGlobalSettings({ ...globalSettings, maxContextTokens: selectedModel?.context || 128000 })}
                     className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white transition-colors"
                     title="Set to model maximum"
                     disabled={!globalSettings.useCustomSize}
                   >
                     Max
                   </button>
                 </div>
                 <p className="text-xs text-zinc-500 mt-1">
                   Maximum conversation history sent to AI • Model max: <span className="text-purple-400">{((selectedModel?.context || 128000)).toLocaleString()}</span> tokens
                 </p>
               </div>

               {/* Top P */}
               <div>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Top P: {globalSettings.topP.toFixed(2)}
                 </label>
                 <input
                   type="range"
                   min="0"
                   max="1"
                   step="0.05"
                   value={globalSettings.topP}
                   onChange={(e) => setGlobalSettings({ ...globalSettings, topP: parseFloat(e.target.value) })}
                   className="w-full"
                 />
                 <p className="text-xs text-zinc-500 mt-1">
                   Nucleus sampling - controls response diversity
                 </p>
               </div>

               {/* Top K */}
               <div>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Top K: {globalSettings.topK}
                 </label>
                 <input
                   type="range"
                   min="1"
                   max="100"
                   step="1"
                   value={globalSettings.topK}
                   onChange={(e) => setGlobalSettings({ ...globalSettings, topK: parseInt(e.target.value) })}
                   className="w-full"
                 />
                 <p className="text-xs text-zinc-500 mt-1">
                   Limits token selection to top K choices
                 </p>
               </div>

               {/* Enable Thinking */}
               <div>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Enable Thinking
                 </label>
                 <Switch
                   checked={globalSettings.enableThinking}
                   onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, enableThinking: checked })}
                   className="data-[state=checked]:bg-blue-600"
                 />
                 <p className="text-xs text-zinc-500 mt-1">
                   Show AI reasoning process (Gemini models only)
                 </p>
               </div>

               {/* Enable Streaming */}
               <div>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Enable Streaming
                 </label>
                 <Switch
                   checked={globalSettings.enableStreaming}
                   onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, enableStreaming: checked })}
                   className="data-[state=checked]:bg-blue-600"
                 />
                 <p className="text-xs text-zinc-500 mt-1">
                   Stream AI responses in real-time
                 </p>
               </div>

               {/* Ding When Unfocused */}
               <div>
                 <label className="block text-sm font-medium text-zinc-300 mb-2">
                   Ding When Unfocused
                 </label>
                 <Switch
                   checked={globalSettings.dingWhenUnfocused}
                   onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, dingWhenUnfocused: checked })}
                   className="data-[state=checked]:bg-blue-600"
                 />
                 <p className="text-xs text-zinc-500 mt-1">
                   Play a notification sound when AI finishes and window is not focused
                 </p>
               </div>
             </div>
           </div>

           {/* Instruction Injection Position */}
          {showInstructionsSection && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Instruction Injection Position
            </label>
            <select
              value={globalSettings.instructionInjectionPosition}
              onChange={(e) => setGlobalSettings({ 
                ...globalSettings, 
                instructionInjectionPosition: e.target.value as any 
              })}
              className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="start">At start (default)</option>
              <option value="before-last">Before last message</option>
              <option value="custom-index">Custom message index</option>
            </select>
            
            {globalSettings.instructionInjectionPosition === "custom-index" && (
              <div className="mt-3">
                <label className="block text-xs text-zinc-500 mb-1">
                  Inject instructions before message index (0 = first message)
                </label>
                <input
                  type="number"
                  min="0"
                  value={globalSettings.instructionCustomInjectionIndex}
                  onChange={(e) => setGlobalSettings({ 
                    ...globalSettings, 
                    instructionCustomInjectionIndex: Math.max(0, parseInt(e.target.value) || 0)
                  })}
                  className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="mt-2 text-xs text-zinc-500">
              Controls where system instructions are placed in the chat history sent to AI
            </div>
           </div>
          )}



           {/* Thinking Level/Budget - Only for Google providers */}
           {(activeProvider === "google-ai-studio" || activeProvider === "google-vertex") && globalSettings.enableThinking && (
            <div>
              {/* Check if model is Gemini 2.5 */}
              {globalSettings.modelId?.startsWith("gemini-2.5") ? (
                <>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Thinking Budget
                  </label>
                  <select
                    value={globalSettings.thinkingBudget}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, thinkingBudget: e.target.value as "NONE" | "LOW" | "MEDIUM" | "HIGH" })}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NONE">None - No thinking budget</option>
                    <option value="LOW">Low - Minimal thinking (fastest)</option>
                    <option value="MEDIUM">Medium - Balanced thinking</option>
                    <option value="HIGH">High - Maximum thinking (slowest)</option>
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    Controls the thinking budget for Gemini 2.5 models (affects response quality and speed)
                  </p>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Thinking Level
                  </label>
                  <select
                    value={globalSettings.thinkingLevel}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, thinkingLevel: e.target.value as "LOW" | "MEDIUM" | "HIGH" })}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low - Quick responses with minimal thinking</option>
                    <option value="MEDIUM">Medium - Balanced thinking and speed</option>
                    <option value="HIGH">High - Deep thinking for complex responses</option>
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    Controls how deeply the AI thinks before responding (affects response quality and speed)
                  </p>
                </>
              )}
            </div>
            )}



            {/* Provider API Keys Configuration */}
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-sm font-medium text-white mb-4">Provider Connections</h3>
            <div className="space-y-4">
              {/* Google AI Studio */}
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus["google-ai-studio"]?.status === "connected" ? "bg-green-500" :
                      connectionStatus["google-ai-studio"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                      connectionStatus["google-ai-studio"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                    }`} />
                    <span className="text-sm font-medium text-white">Google AI Studio</span>
                    {activeProvider === "google-ai-studio" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProvider(editingProvider === 'google-ai-studio' ? null : 'google-ai-studio')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {editingProvider === 'google-ai-studio' ? 'Hide' : 'Configure'}
                  </button>
                </div>
                {connectionStatus["google-ai-studio"]?.message && (
                  <p className={`text-xs mb-2 ${
                    connectionStatus["google-ai-studio"]?.status === "connected" ? "text-green-400" :
                    connectionStatus["google-ai-studio"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {connectionStatus["google-ai-studio"].message}
                  </p>
                )}
                 {editingProvider === 'google-ai-studio' && (
                   <div className="mt-3 space-y-3">
                     {/* Profile Selection */}
                     <div>
                       <label className="block text-xs text-zinc-400 mb-1">Profile</label>
                       <div className="flex gap-2">
                         <select
                           value={providerConfigs["google-ai-studio"]?.activeProfileId || ""}
                           onChange={(e) => {
                             if (e.target.value === "__new__") {
                               const name = prompt("Enter profile name (or leave empty for date/time):");
                               if (name !== null) {
                                 createProfile("google-ai-studio", {
                                   name: name.trim() || new Date().toLocaleString(),
                                   apiKey: ""
                                 });
                               }
                             } else {
                               selectProfile("google-ai-studio", e.target.value);
                             }
                           }}
                           className="flex-1 bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                         >
                           <option value="">Select a profile...</option>
                           {providerConfigs["google-ai-studio"]?.profiles.map(profile => (
                             <option key={profile.id} value={profile.id}>{profile.name}</option>
                           ))}
                           <option value="__new__">+ Add New Profile</option>
                         </select>
                         {providerConfigs["google-ai-studio"]?.activeProfileId && (
                           <button
                             type="button"
                             onClick={() => {
                               if (confirm("Delete this profile?")) {
                                 deleteProfile("google-ai-studio", providerConfigs["google-ai-studio"].activeProfileId!);
                               }
                             }}
                             className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                           >
                             Delete
                           </button>
                         )}
                       </div>
                     </div>
                     
                     {/* API Key - only show if profile is selected */}
                     {providerConfigs["google-ai-studio"]?.activeProfileId && (
                       <>
                         <div>
                           <label className="block text-xs text-zinc-400 mb-1">API Key</label>
                           <input
                             type="password"
                             value={getActiveProfile("google-ai-studio")?.apiKey || ""}
                             onChange={(e) => {
                               const profileId = providerConfigs["google-ai-studio"].activeProfileId;
                               if (!profileId) return;
                               setProviderConfigs(prev => ({
                                 ...prev,
                                 "google-ai-studio": {
                                   ...prev["google-ai-studio"],
                                   profiles: prev["google-ai-studio"].profiles.map(p =>
                                     p.id === profileId ? { ...p, apiKey: e.target.value } : p
                                   )
                                 }
                               }));
                             }}
                             placeholder="Enter your Google AI Studio API key"
                             className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                           />
                         </div>
                         <div className="flex gap-2">
                           <button
                              type="button"
                              onClick={() => handleConnectProvider("google-ai-studio")}
                              className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Connect
                            </button>
                         </div>
                       </>
                     )}
                   </div>
                 )}
              </div>

              {/* Google Vertex AI */}
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus["google-vertex"]?.status === "connected" ? "bg-green-500" :
                      connectionStatus["google-vertex"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                      connectionStatus["google-vertex"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                    }`} />
                    <span className="text-sm font-medium text-white">Google Vertex AI</span>
                    {activeProvider === "google-vertex" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProvider(editingProvider === 'google-vertex' ? null : 'google-vertex')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {editingProvider === 'google-vertex' ? 'Hide' : 'Configure'}
                  </button>
                </div>
                {connectionStatus["google-vertex"]?.message && (
                  <p className={`text-xs mb-2 ${
                    connectionStatus["google-vertex"]?.status === "connected" ? "text-green-400" :
                    connectionStatus["google-vertex"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {connectionStatus["google-vertex"].message}
                  </p>
                )}
                {editingProvider === 'google-vertex' && (
                  <div className="mt-3 space-y-3">
                    {/* Profile Selection */}
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Profile</label>
                      <div className="flex gap-2">
                        <select
                          value={providerConfigs["google-vertex"]?.activeProfileId || ""}
                          onChange={(e) => {
                            if (e.target.value === "__new__") {
                              const name = prompt("Enter profile name (use project name or leave empty for date/time):");
                              if (name !== null) {
                                createProfile("google-vertex", {
                                  name: name.trim() || new Date().toLocaleString(),
                                  apiKey: "",
                                  projectId: "",
                                  vertexMode: "express",
                                  vertexLocation: "global"
                                });
                              }
                            } else {
                              selectProfile("google-vertex", e.target.value);
                            }
                          }}
                          className="flex-1 bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a profile...</option>
                          {providerConfigs["google-vertex"]?.profiles.map(profile => (
                            <option key={profile.id} value={profile.id}>{profile.name}</option>
                          ))}
                          <option value="__new__">+ Add New Profile</option>
                        </select>
                        {providerConfigs["google-vertex"]?.activeProfileId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this profile?")) {
                                deleteProfile("google-vertex", providerConfigs["google-vertex"].activeProfileId!);
                              }
                            }}
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Only show config if profile is selected */}
                    {providerConfigs["google-vertex"]?.activeProfileId && (
                      <>
                        {/* Mode Selector */}
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Mode</label>
                          <select
                            value={getActiveProfile("google-vertex")?.vertexMode || "express"}
                            onChange={(e) => {
                              const profileId = providerConfigs["google-vertex"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "google-vertex": {
                                  ...prev["google-vertex"],
                                  profiles: prev["google-vertex"].profiles.map(p =>
                                    p.id === profileId ? { ...p, vertexMode: e.target.value as VertexMode } : p
                                  )
                                }
                              }));
                            }}
                            className="w-full bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="express">Express (API Key + Project ID)</option>
                            <option value="full">Full (Service Account)</option>
                          </select>
                          <p className="text-xs text-zinc-500 mt-1">
                            Express mode uses API key authentication. Full mode requires a Google Cloud Service Account JSON.
                          </p>
                        </div>
                        {/* Show Service Account JSON input only in Full mode */}
                        {getActiveProfile("google-vertex")?.vertexMode === "full" && (
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Service Account JSON <span className="text-red-400">*</span></label>
                            <textarea
                              value={getActiveProfile("google-vertex")?.serviceAccountJson || ""}
                              onChange={(e) => {
                                const profileId = providerConfigs["google-vertex"].activeProfileId;
                                if (!profileId) return;
                                setProviderConfigs(prev => ({
                                  ...prev,
                                  "google-vertex": {
                                    ...prev["google-vertex"],
                                    profiles: prev["google-vertex"].profiles.map(p =>
                                      p.id === profileId ? { ...p, serviceAccountJson: e.target.value } : p
                                    )
                                  }
                                }));
                              }}
                              placeholder='{"type": "service_account", "project_id": "..."}'
                              rows={4}
                              className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                              Paste your service account JSON key from the Google Cloud Console
                            </p>
                          </div>
                        )}
                        {/* Project ID */}
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Google Cloud Project ID <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={getActiveProfile("google-vertex")?.projectId || ""}
                            onChange={(e) => {
                              const profileId = providerConfigs["google-vertex"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "google-vertex": {
                                  ...prev["google-vertex"],
                                  profiles: prev["google-vertex"].profiles.map(p =>
                                    p.id === profileId ? { ...p, projectId: e.target.value } : p
                                  )
                                }
                              }));
                            }}
                            placeholder="your-project-id"
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <p className="text-xs text-zinc-500 mt-1">
                            Find your Project ID in the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a>
                          </p>
                        </div>
                        {/* Server Location */}
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Server Location</label>
                          <select
                            value={getActiveProfile("google-vertex")?.vertexLocation || "global"}
                            onChange={(e) => {
                              const profileId = providerConfigs["google-vertex"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "google-vertex": {
                                  ...prev["google-vertex"],
                                  profiles: prev["google-vertex"].profiles.map(p =>
                                    p.id === profileId ? { ...p, vertexLocation: e.target.value as VertexLocation } : p
                                  )
                                }
                              }));
                            }}
                            className="w-full bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="global">Global (Auto-routing)</option>
                            <option value="us-central1">US Central (Iowa)</option>
                            <option value="us-east1">US East (South Carolina)</option>
                            <option value="us-west1">US West (Oregon)</option>
                            <option value="europe-west1">Europe West (Belgium)</option>
                            <option value="europe-west4">Europe West (Netherlands)</option>
                            <option value="asia-east1">Asia East (Taiwan)</option>
                            <option value="asia-northeast1">Asia Northeast (Tokyo)</option>
                            <option value="asia-southeast1">Asia Southeast (Singapore)</option>
                          </select>
                          <p className="text-xs text-zinc-500 mt-1">
                            Choose the closest region for lower latency
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">API Key</label>
                          <input
                            type="password"
                            value={getActiveProfile("google-vertex")?.apiKey || ""}
                            onChange={(e) => {
                              const profileId = providerConfigs["google-vertex"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "google-vertex": {
                                  ...prev["google-vertex"],
                                  profiles: prev["google-vertex"].profiles.map(p =>
                                    p.id === profileId ? { ...p, apiKey: e.target.value } : p
                                  )
                                }
                              }));
                            }}
                            placeholder="Enter your Google API key"
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                         <div className="flex gap-2">
                           <button
                              type="button"
                              onClick={() => handleConnectProvider("google-vertex")}
                              className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Connect
                            </button>
                         </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* NVIDIA NIM */}
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus["nvidia-nim"]?.status === "connected" ? "bg-green-500" :
                      connectionStatus["nvidia-nim"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                      connectionStatus["nvidia-nim"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                    }`} />
                    <span className="text-sm font-medium text-white">NVIDIA NIM</span>
                    {activeProvider === "nvidia-nim" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProvider(editingProvider === 'nvidia-nim' ? null : 'nvidia-nim')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {editingProvider === 'nvidia-nim' ? 'Hide' : 'Configure'}
                  </button>
                </div>
                {connectionStatus["nvidia-nim"]?.message && (
                  <p className={`text-xs mb-2 ${
                    connectionStatus["nvidia-nim"]?.status === "connected" ? "text-green-400" :
                    connectionStatus["nvidia-nim"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {connectionStatus["nvidia-nim"].message}
                  </p>
                )}
                {editingProvider === 'nvidia-nim' && (
                  <div className="mt-3 space-y-3">
                    {/* Profile Selection */}
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Profile</label>
                      <div className="flex gap-2">
                        <select
                          value={providerConfigs["nvidia-nim"]?.activeProfileId || ""}
                          onChange={(e) => {
                            if (e.target.value === "__new__") {
                              const name = prompt("Enter profile name (or leave empty for date/time):");
                              if (name !== null) {
                                createProfile("nvidia-nim", {
                                  name: name.trim() || new Date().toLocaleString(),
                                  apiKey: ""
                                });
                              }
                            } else {
                              selectProfile("nvidia-nim", e.target.value);
                            }
                          }}
                          className="flex-1 bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a profile...</option>
                          {providerConfigs["nvidia-nim"]?.profiles.map(profile => (
                            <option key={profile.id} value={profile.id}>{profile.name}</option>
                          ))}
                          <option value="__new__">+ Add New Profile</option>
                        </select>
                        {providerConfigs["nvidia-nim"]?.activeProfileId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this profile?")) {
                                deleteProfile("nvidia-nim", providerConfigs["nvidia-nim"].activeProfileId!);
                              }
                            }}
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* API Key - only show if profile is selected */}
                    {providerConfigs["nvidia-nim"]?.activeProfileId && (
                      <>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">API Key</label>
                          <input
                            type="password"
                            value={getActiveProfile("nvidia-nim")?.apiKey || ""}
                            onChange={(e) => {
                              const profileId = providerConfigs["nvidia-nim"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "nvidia-nim": {
                                  ...prev["nvidia-nim"],
                                  profiles: prev["nvidia-nim"].profiles.map(p =>
                                    p.id === profileId ? { ...p, apiKey: e.target.value } : p
                                  )
                                }
                              }));
                            }}
                            placeholder="Enter your NVIDIA NIM API key"
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleConnectProvider("nvidia-nim")}
                              className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Connect
                            </button>
                          </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Groq */}
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus["groq"]?.status === "connected" ? "bg-green-500" :
                      connectionStatus["groq"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                      connectionStatus["groq"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                    }`} />
                    <span className="text-sm font-medium text-white">Groq</span>
                    {activeProvider === "groq" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProvider(editingProvider === 'groq' ? null : 'groq')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {editingProvider === 'groq' ? 'Hide' : 'Configure'}
                  </button>
                </div>
                {connectionStatus["groq"]?.message && (
                  <p className={`text-xs mb-2 ${
                    connectionStatus["groq"]?.status === "connected" ? "text-green-400" :
                    connectionStatus["groq"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {connectionStatus["groq"].message}
                  </p>
                )}
                {editingProvider === 'groq' && (
                  <div className="mt-3 space-y-3">
                    {/* Profile Selection */}
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Profile</label>
                      <div className="flex gap-2">
                        <select
                          value={providerConfigs["groq"]?.activeProfileId || ""}
                          onChange={(e) => {
                            if (e.target.value === "__new__") {
                              const name = prompt("Enter profile name (or leave empty for date/time):");
                              if (name !== null) {
                                createProfile("groq", {
                                  name: name.trim() || new Date().toLocaleString(),
                                  apiKey: ""
                                });
                              }
                            } else {
                              selectProfile("groq", e.target.value);
                            }
                          }}
                          className="flex-1 bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a profile...</option>
                          {providerConfigs["groq"]?.profiles.map(profile => (
                            <option key={profile.id} value={profile.id}>{profile.name}</option>
                          ))}
                          <option value="__new__">+ Add New Profile</option>
                        </select>
                        {providerConfigs["groq"]?.activeProfileId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this profile?")) {
                                deleteProfile("groq", providerConfigs["groq"].activeProfileId!);
                              }
                            }}
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* API Key - only show if profile is selected */}
                    {providerConfigs["groq"]?.activeProfileId && (
                      <>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">API Key</label>
                          <input
                            type="password"
                            value={getActiveProfile("groq")?.apiKey || ""}
                            onChange={(e) => {
                              const profileId = providerConfigs["groq"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "groq": {
                                  ...prev["groq"],
                                  profiles: prev["groq"].profiles.map(p =>
                                    p.id === profileId ? { ...p, apiKey: e.target.value } : p
                                  )
                                }
                              }));
                            }}
                            placeholder="Enter your Groq API key"
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                               onClick={() => handleConnectProvider("groq")}
                               className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                             >
                               Connect
                             </button>
                          </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Open Router */}
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus["open-router"]?.status === "connected" ? "bg-green-500" :
                      connectionStatus["open-router"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                      connectionStatus["open-router"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                    }`} />
                    <span className="text-sm font-medium text-white">Open Router</span>
                    {activeProvider === "open-router" && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProvider(editingProvider === 'open-router' ? null : 'open-router')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {editingProvider === 'open-router' ? 'Hide' : 'Configure'}
                  </button>
                </div>
                {connectionStatus["open-router"]?.message && (
                  <p className={`text-xs mb-2 ${
                    connectionStatus["open-router"]?.status === "connected" ? "text-green-400" :
                    connectionStatus["open-router"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {connectionStatus["open-router"].message}
                  </p>
                )}
                {editingProvider === 'open-router' && (
                  <div className="mt-3 space-y-3">
                    {/* Profile Selection */}
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Profile</label>
                      <div className="flex gap-2">
                        <select
                          value={providerConfigs["open-router"]?.activeProfileId || ""}
                          onChange={(e) => {
                            if (e.target.value === "__new__") {
                              const name = prompt("Enter profile name (or leave empty for date/time):");
                              if (name !== null) {
                                createProfile("open-router", {
                                  name: name.trim() || new Date().toLocaleString(),
                                  apiKey: ""
                                });
                              }
                            } else {
                              selectProfile("open-router", e.target.value);
                            }
                          }}
                          className="flex-1 bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a profile...</option>
                          {providerConfigs["open-router"]?.profiles.map(profile => (
                            <option key={profile.id} value={profile.id}>{profile.name}</option>
                          ))}
                          <option value="__new__">+ Add New Profile</option>
                        </select>
                        {providerConfigs["open-router"]?.activeProfileId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Delete this profile?")) {
                                deleteProfile("open-router", providerConfigs["open-router"].activeProfileId!);
                              }
                            }}
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* API Key - only show if profile is selected */}
                    {providerConfigs["open-router"]?.activeProfileId && (
                      <>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">API Key</label>
                          <input
                            type="password"
                            value={getActiveProfile("open-router")?.apiKey || ""}
                            onChange={(e) => {
                              const profileId = providerConfigs["open-router"].activeProfileId;
                              if (!profileId) return;
                              setProviderConfigs(prev => ({
                                ...prev,
                                "open-router": {
                                  ...prev["open-router"],
                                  profiles: prev["open-router"].profiles.map(p =>
                                    p.id === profileId ? { ...p, apiKey: e.target.value } : p
                                  )
                                }
                              }));
                            }}
                            placeholder="Enter your Open Router API key"
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleConnectProvider("open-router")}
                              className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Connect
                            </button>
                          </div>
                      </>
                    )}
                  </div>
                )}
              </div>

                {/* KoboldAI Horde */}
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        connectionStatus["kobold-horde"]?.status === "connected" ? "bg-green-500" :
                        connectionStatus["kobold-horde"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                        connectionStatus["kobold-horde"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                      }`} />
                      <span className="text-sm font-medium text-white">KoboldAI Horde</span>
                      {activeProvider === "kobold-horde" && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingProvider(editingProvider === 'kobold-horde' ? null : 'kobold-horde')}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {editingProvider === 'kobold-horde' ? 'Hide' : 'Configure'}
                    </button>
                  </div>
                  {connectionStatus["kobold-horde"]?.message && (
                    <p className={`text-xs mb-2 ${
                      connectionStatus["kobold-horde"]?.status === "connected" ? "text-green-400" :
                      connectionStatus["kobold-horde"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                    }`}>
                      {connectionStatus["kobold-horde"].message}
                    </p>
                  )}
                  {editingProvider === 'kobold-horde' && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">API Key</label>
                        <input
                          type="password"
                          value={providerConfigs["kobold-horde"]?.profiles?.[0]?.apiKey || ""}
                          onChange={(e) => {
                            // Single profile for Kobold Horde (no profile system)
                            setProviderConfigs(prev => ({
                              ...prev,
                              "kobold-horde": {
                                ...prev["kobold-horde"],
                                profiles: [{
                                  id: "kobold-horde-single",
                                  name: "Default",
                                  apiKey: e.target.value,
                                  selectedModel: DEFAULT_KOBOLD_HORDE_MODEL,
                                  createdAt: Date.now()
                                }],
                                activeProfileId: "kobold-horde-single"
                              }
                            }));
                          }}
                          placeholder="Enter your KoboldAI Horde API key"
                          className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                          Get your API key at{" "}
                          <a
                            href="https://aihorde.net/register"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            aihorde.net/register
                          </a>
                        </p>
                      </div>
                      <div className="flex gap-2">
                         <button
                           type="button"
                           onClick={() => handleConnectProvider("kobold-horde")}
                           className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                         >
                           Connect
                         </button>
                      </div>
                    </div>
                  )}
                </div>

                 {/* Ollama */}
                 <div className="p-3 bg-zinc-800/50 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         connectionStatus["ollama"]?.status === "connected" ? "bg-green-500" :
                         connectionStatus["ollama"]?.status === "testing" ? "bg-yellow-500 animate-pulse" :
                         connectionStatus["ollama"]?.status === "error" ? "bg-red-500" : "bg-zinc-500"
                       }`} />
                       <span className="text-sm font-medium text-white">Self-Hosted (Ollama)</span>
                       {activeProvider === "ollama" && (
                         <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Active</span>
                       )}
                     </div>
                     <button
                       type="button"
                       onClick={() => setEditingProvider(editingProvider === 'ollama' ? null : 'ollama')}
                       className="text-xs text-blue-400 hover:text-blue-300"
                     >
                       {editingProvider === 'ollama' ? 'Hide' : 'Configure'}
                     </button>
                   </div>
                   {connectionStatus["ollama"]?.message && (
                     <p className={`text-xs mb-2 ${
                       connectionStatus["ollama"]?.status === "connected" ? "text-green-400" :
                       connectionStatus["ollama"]?.status === "error" ? "text-red-400" : "text-zinc-400"
                     }`}>
                       {connectionStatus["ollama"].message}
                     </p>
                   )}
                  </div>

             </div>
           </div>

           {/* Data Export/Import */}
          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-sm font-medium text-white mb-4">Data Backup</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Export your personas, characters, conversations, and settings to a JSON file. 
              Import to restore your data on any device.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                📥 Export Data
              </button>
              <input
                type="file"
                ref={dataImportInputRef}
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportData(file);
                    e.target.value = "";
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => dataImportInputRef.current?.click()}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                📤 Import Data
              </button>
            </div>
            
            {/* Auto-export settings */}
            <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  id="autoExport"
                  checked={autoExport.enabled}
                  onCheckedChange={(checked) => setAutoExport(prev => ({ ...prev, enabled: checked as boolean }))}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor="autoExport" className="text-sm text-white cursor-pointer">
                  Auto-export every
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={autoExport.intervalMinutes}
                  onChange={(e) => setAutoExport(prev => ({ ...prev, intervalMinutes: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) }))}
                  disabled={!autoExport.enabled}
                  className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm text-center disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-zinc-400">minutes</span>
              </div>
              <p className="text-xs text-zinc-500">
                {autoExport.enabled 
                  ? `✓ Auto-export enabled - will export every ${autoExport.intervalMinutes} minute${autoExport.intervalMinutes !== 1 ? 's' : ''}`
                  : "Enable to automatically backup your data at regular intervals"
                }
              </p>
             </div>
           </div>
         </div>
       </div>

       <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
