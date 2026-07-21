"use client";

import { useState, useRef } from "react";

// Type definitions
export interface Persona {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  firstMessage: string;
  mesExample?: string;
  scenario?: string;
  creatorNotes?: string;
  tags?: string[];
  avatar?: string;
  systemPrompt?: string;
  postHistoryInstructions?: string;
  characterBook?: any;
  alternateGreetings?: string[];
  createdAt: number;
}

export interface Conversation {
  id: string;
  personaId: string;
  characterId: string;
  messages: Array<{ role: "user" | "assistant"; content: string; isContinue?: boolean }>;
  createdAt: number;
  updatedAt: number;
  summaryMemory?: string;
  lastSummarizedIndex?: number;
}

export type ViewType = "home" | "personas" | "characters" | "conversations" | "chat";

export interface InstructionPreset {
  id: string;
  name: string;
  instructions: string;
  createdAt: number;
  updatedAt: number;
}

export interface GlobalSettings {
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
  summarization: any;
  instructionInjectionPosition: "start" | "before-last" | "custom-index";
  instructionCustomInjectionIndex: number;
}

export interface GlobalInstructions {
  customInstructions: string;
  systemPrompt?: string;
  postHistoryInstructions?: string;
  jailbreakInstructions: string;
  enableJailbreak: boolean;
  continueInstruction?: string;
  imageGenerationInstructions?: string;
  formattingPrompt?: string;
  instructions: any[];
}

export interface AutoExportSettings {
  enabled: boolean;
  intervalMinutes: number;
}

export interface LastSession {
  conversationId: string;
  timestamp: number;
}

// Main chat state hook - extracted from Chat.tsx
export const useChatState = () => {
  // Core data states
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [view, setView] = useState<ViewType>("home");
  
  // UI modal states
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showCharacterCardModal, setShowCharacterCardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showModelsModal, setShowModelsModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showUtilitiesModal, setShowUtilitiesModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const [showUtilityPanel, setShowUtilityPanel] = useState(false);
  const [apiDebugPayload, setApiDebugPayload] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [viewingConversation, setViewingConversation] = useState<Conversation | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Form input states
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [characterFirstMessage, setCharacterFirstMessage] = useState("");
  const [characterAvatar, setCharacterAvatar] = useState("");
  const [characterScenario, setCharacterScenario] = useState("");
  const [characterSystemPrompt, setCharacterSystemPrompt] = useState("");
  const [characterPostHistoryInstructions, setCharacterPostHistoryInstructions] = useState("");
  const [characterMesExample, setCharacterMesExample] = useState("");
  const [characterAlternateGreetings, setCharacterAlternateGreetings] = useState<string[]>([]);
  const [showGreetingSelection, setShowGreetingSelection] = useState(false);
  const [pendingConversationCharacter, setPendingConversationCharacter] = useState<Character | null>(null);
  
  // Image generation states
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);
  
  // Global settings states
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({} as GlobalSettings);
  const [windowFocused, setWindowFocused] = useState(true);
  
  // Chat states
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingThinking, setStreamingThinking] = useState<string>("");
  const [visibleMessageCount, setVisibleMessageCount] = useState<number>(20);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
   // Message editing states
   const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
   const [editingMessageContent, setEditingMessageContent] = useState<string>("");
   const [showMessageMenu, setShowMessageMenu] = useState<number | null>(null);
   
   // Other editing states
   const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
   const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
   const [activeInstructionTab, setActiveInstructionTab] = useState<"chat">("chat");
  const [chatInstructions, setChatInstructions] = useState<string>("");
  const [instructionPresets, setInstructionPresets] = useState<InstructionPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [characterSortOrder, setCharacterSortOrder] = useState<'added' | 'lastChat' | 'name'>('added');
  const [autoExport, setAutoExport] = useState<AutoExportSettings>({} as AutoExportSettings);
  const [appliedCharacters, setAppliedCharacters] = useState<Set<string>>(new Set());
  const [deletedItem, setDeletedItem] = useState<any>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  
  // Import/Export states
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  
   // Instructions states
   const [globalInstructions, setGlobalInstructions] = useState<GlobalInstructions>({} as GlobalInstructions);
  
  // Provider configuration states
  const [providerConfigs, setProviderConfigs] = useState<Record<string, any>>({
    "google-ai-studio": { type: "google-ai-studio" },
    "google-vertex": { type: "google-vertex" },
    "nvidia-nim": { type: "nvidia-nim" },
    "groq": { type: "groq" },
    "open-router": { type: "open-router" },
    "kobold-horde": { type: "kobold-horde" },
    "ollama": { type: "ollama" },
  });
  
  const [providerModels, setProviderModels] = useState<Record<string, any>>({
    "google-ai-studio": [],
    "google-vertex": [],
    "nvidia-nim": [],
    "groq": [],
    "open-router": [],
    "kobold-horde": [],
    "ollama": [],
  });
  
  const [modelsFetching, setModelsFetching] = useState<Record<string, boolean>>({
    "google-ai-studio": false,
    "google-vertex": false,
    "nvidia-nim": false,
    "groq": false,
    "open-router": false,
    "kobold-horde": false,
    "ollama": false,
  });
  
  const [activeProvider, setActiveProvider] = useState<string>("google-ai-studio");
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, any>>({
    "google-ai-studio": { status: "disconnected" },
    "google-vertex": { status: "disconnected" },
    "nvidia-nim": { status: "disconnected" },
    "groq": { status: "disconnected" },
    "open-router": { status: "disconnected" },
    "kobold-horde": { status: "disconnected" },
    "ollama": { status: "disconnected" },
  });
  
  // Ref states
  const lastSessionRef = useRef<LastSession | null>(null);
  const hasRestoredSession = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instructionsFileInputRef = useRef<HTMLInputElement>(null);
  const autoExportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userMessageIndices: number[] = [];
  
  // Return all states and setters for direct access
  return {
    // Core data states
    personas, setPersonas,
    characters, setCharacters,
    conversations, setConversations,
    selectedPersona, setSelectedPersona,
    selectedCharacter, setSelectedCharacter,
    currentConversation, setCurrentConversation,
    view, setView,
    
    // UI modal states
    showPersonaModal, setShowPersonaModal,
    showCharacterModal, setShowCharacterModal,
    showCharacterCardModal, setShowCharacterCardModal,
    showSettingsModal, setShowSettingsModal,
    showModelsModal, setShowModelsModal,
    showInstructionsModal, setShowInstructionsModal,
    showInstructionModal, setShowInstructionModal,
    showUtilitiesModal, setShowUtilitiesModal,
    showMobileMenu, setShowMobileMenu,
    showHeaderActions, setShowHeaderActions,
    showUtilityPanel, setShowUtilityPanel,
    apiDebugPayload, setApiDebugPayload,
    isSummarizing, setIsSummarizing,
    showConversationHistory, setShowConversationHistory,
    viewingConversation, setViewingConversation,
    showUserMenu, setShowUserMenu,
    
    // Form input states
    personaName, setPersonaName,
    personaDescription, setPersonaDescription,
    characterName, setCharacterName,
    characterDescription, setCharacterDescription,
    characterFirstMessage, setCharacterFirstMessage,
    characterAvatar, setCharacterAvatar,
    characterScenario, setCharacterScenario,
    characterSystemPrompt, setCharacterSystemPrompt,
    characterPostHistoryInstructions, setCharacterPostHistoryInstructions,
    characterMesExample, setCharacterMesExample,
    characterAlternateGreetings, setCharacterAlternateGreetings,
    showGreetingSelection, setShowGreetingSelection,
    pendingConversationCharacter, setPendingConversationCharacter,
    
    // Image generation states
    isGeneratingImage, setIsGeneratingImage,
    imageGenerationError, setImageGenerationError,
    
    // Global settings states
    globalSettings, setGlobalSettings,
    windowFocused, setWindowFocused,
    
    // Chat states
    input, setInput,
    isLoading, setIsLoading,
    isSending, setIsSending,
    error, setError,
    streamingContent, setStreamingContent,
    streamingThinking, setStreamingThinking,
    visibleMessageCount, setVisibleMessageCount,
    showScrollToBottom, setShowScrollToBottom,
    
    // Message editing states
    editingMessageIndex, setEditingMessageIndex,
    editingMessageContent, setEditingMessageContent,
    showMessageMenu, setShowMessageMenu,
    
    // Other editing states
    editingPersona, setEditingPersona,
    editingCharacter, setEditingCharacter,
    activeInstructionTab, setActiveInstructionTab,
    chatInstructions, setChatInstructions,
    instructionPresets, setInstructionPresets,
    selectedPresetId, setSelectedPresetId,
    characterSortOrder, setCharacterSortOrder,
    autoExport, setAutoExport,
    appliedCharacters, setAppliedCharacters,
    deletedItem, setDeletedItem,
    showUndoToast, setShowUndoToast,
    
    // Import/Export states
    importError, setImportError,
    importSuccess, setImportSuccess,
    
    // Instructions states
    globalInstructions, setGlobalInstructions,
    
    // Provider configuration states
    providerConfigs, setProviderConfigs,
    providerModels, setProviderModels,
    modelsFetching, setModelsFetching,
    activeProvider, setActiveProvider,
    editingProvider, setEditingProvider,
    connectionStatus, setConnectionStatus,
    
    // Ref states
    lastSessionRef,
    hasRestoredSession,
    messagesEndRef,
    inputRef,
    abortControllerRef,
    scrollContainerRef,
    fileInputRef,
    instructionsFileInputRef,
    autoExportTimerRef,
    userMessageIndices,
  };
};