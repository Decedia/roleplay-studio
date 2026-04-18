import React, { useState, useEffect, useRef } from "react";
import {
  Persona,
  Character,
  Conversation,
  Message,
  GlobalSettings,
  GlobalInstructions,
  LLMProviderType,
  ViewType,
  AVAILABLE_PROVIDERS,
  Instruction,
  InstructionRole,
  InstructionPosition,
  FetchedModel,
  ConnectionStatus,
  AutoExportSettings,
  ProviderConfig,
  ProviderProfile,
  LastSession,
} from "@/lib/types";
import {
  loadPersonas,
  savePersonas,
  loadCharacters,
  saveCharacters,
  loadConversations,
  saveConversations,
  loadGlobalSettings,
  saveGlobalSettings,
  loadGlobalInstructions,
  saveGlobalInstructions,
  loadProviderConfigs,
  saveProviderConfigs,
  loadAutoExport,
  saveAutoExport,
  summarizeConversation,
} from "@/lib/storage";
import {
  chatWithProvider,
  streamWithProvider,
  getModelsForProvider,
  testConnection,
  fetchModels,
  connectProvider,
} from "@/lib/providers";
import { extractAllTags, removeThinkTags, formatResponse } from "@/lib/formatting";
import { replaceMacros, getThoughtSignature } from "@/lib/macros";
import { DEFAULT_FORMATTING_PROMPT, DEFAULT_CONTINUE_INSTRUCTION, DEFAULT_IMAGE_GENERATION_INSTRUCTIONS } from "@/lib/constants";

function ModelsModal({
  show,
  onClose,
  globalSettings,
  setGlobalSettings,
  providerConfigs,
  setProviderConfigs,
  activeProvider,
  setActiveProvider,
  connectionStatus,
  onTestConnection,
  onConnect,
  providerModels,
  modelsFetching,
  onExportData,
  onImportData,
  autoExport,
  setAutoExport,
  createProfile,
  selectProfile,
  deleteProfile,
  getActiveProfile,
}: {
  show: boolean;
  onClose: () => void;
  globalSettings: GlobalSettings;
  setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
  providerConfigs: Record<LLMProviderType, ProviderConfig>;
  setProviderConfigs: React.Dispatch<React.SetStateAction<Record<LLMProviderType, ProviderConfig>>>;
  activeProvider: LLMProviderType;
  setActiveProvider: React.Dispatch<React.SetStateAction<LLMProviderType>>;
  connectionStatus: Record<LLMProviderType, ConnectionStatus>;
  onTestConnection: (providerType: LLMProviderType) => void;
  onConnect: (providerType: LLMProviderType) => void;
  providerModels: Record<LLMProviderType, FetchedModel[]>;
  modelsFetching: Record<LLMProviderType, boolean>;
  onExportData: () => void;
  onImportData: (file: File) => void;
  autoExport: AutoExportSettings;
  setAutoExport: React.Dispatch<React.SetStateAction<AutoExportSettings>>;
  createProfile: (providerType: LLMProviderType, profileData: Omit<ProviderProfile, "id" | "createdAt">) => ProviderProfile;
  selectProfile: (providerType: LLMProviderType, profileId: string) => void;
  deleteProfile: (providerType: LLMProviderType, profileId: string) => void;
  getActiveProfile: (providerType: LLMProviderType) => ProviderProfile | undefined;
}) {
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
  const [editingProvider, setEditingProvider] = useState<LLMProviderType | null>(null);

  // Get models for the active provider
  const activeProviderModels = providerModels[activeProvider] || [];

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Models & Providers</h2>
            <p className="text-sm text-zinc-500">Configure AI models and provider settings</p>
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
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                AI Provider
              </label>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value as LLMProviderType)}
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Model ({AVAILABLE_PROVIDERS.find(p => p.id === activeProvider)?.name || activeProvider})
              </label>
              {modelsFetching[activeProvider] ? (
                <div className="w-full bg-zinc-800 text-zinc-400 rounded-lg px-4 py-2 border border-zinc-700">
                  Loading models...
                </div>
              ) : activeProviderModels.length === 0 ? (
                <div className="w-full bg-zinc-800/50 text-zinc-400 rounded-lg px-4 py-2 border border-zinc-700">
                  Test connection to load models
                </div>
              ) : (
                <select
                  value={globalSettings.modelId}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, modelId: e.target.value })}
                  className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a model</option>
                  {activeProviderModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name || model.id}
                      {'context' in model && model.context && ` (${model.context?.toLocaleString()} ctx)`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Test Connection Button */}
            <div>
              <button
                onClick={() => onTestConnection(activeProvider)}
                disabled={connectionStatus[activeProvider]?.status === "testing"}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {connectionStatus[activeProvider]?.status === "testing" ? "Testing..." : "Test Connection"}
              </button>
              {connectionStatus[activeProvider]?.message && (
                <p className={`text-sm mt-2 ${
                  connectionStatus[activeProvider]?.status === "connected" ? "text-green-400" :
                  connectionStatus[activeProvider]?.status === "error" ? "text-red-400" : "text-zinc-400"
                }`}>
                  {connectionStatus[activeProvider].message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  // State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [view, setView] = useState<ViewType>("home");

  // Ref to store last session for continue functionality
  const lastSessionRef = useRef<LastSession | null>(null);
  const hasRestoredSession = useRef(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Settings state
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => loadGlobalSettings());
  const [globalInstructions, setGlobalInstructions] = useState<GlobalInstructions>(() => loadGlobalInstructions());

  // Provider state
  const [providerConfigs, setProviderConfigs] = useState<Record<LLMProviderType, ProviderConfig>>(() => loadProviderConfigs());
  const [activeProvider, setActiveProvider] = useState<LLMProviderType>(globalSettings.provider || "openai");
  const [connectionStatus, setConnectionStatus] = useState<Record<LLMProviderType, ConnectionStatus>>({});
  const [providerModels, setProviderModels] = useState<Record<LLMProviderType, FetchedModel[]>>({});
  const [modelsFetching, setModelsFetching] = useState<Record<LLMProviderType, boolean>>({});

  // UI state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showCharacterCardModal, setShowCharacterCardModal] = useState(false);
  const [showModelsModal, setShowModelsModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'chat' | 'generator' | 'brainstorm' | 'vn'>('chat');
  const [chatInstructions, setChatInstructions] = useState<string>('');
  const [generatorInstructions, setGeneratorInstructions] = useState<string>(DEFAULT_GENERATOR_INSTRUCTIONS);
  const [brainstormInstructions, setBrainstormInstructions] = useState<string>(DEFAULT_BRAINSTORM_INSTRUCTIONS);
  const [vnInstructions, setVnInstructions] = useState<string>(DEFAULT_VN_INSTRUCTIONS);
  const [showUtilityPanel, setShowUtilityPanel] = useState(false);
  const [showUtilitiesModal, setShowUtilitiesModal] = useState(false);
  const [utilityPanelTab, setUtilityPanelTab] = useState<'tags' | 'summarization' | 'debug'>('tags');
  const [apiDebugPayload, setApiDebugPayload] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<string>("");
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [viewingConversation, setViewingConversation] = useState<Conversation | null>(null);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterSortOrder, setCharacterSortOrder] = useState<'added' | 'lastChat' | 'name'>('added');
  const [autoExport, setAutoExport] = useState<AutoExportSettings>(() => loadAutoExport());
  const [showAdvancedInstructions, setShowAdvancedInstructions] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    const loadedPersonas = loadPersonas();
    const loadedCharacters = loadCharacters();
    const loadedConversations = loadConversations();

    setPersonas(loadedPersonas);
    setCharacters(loadedCharacters);
    setConversations(loadedConversations);

    // Set default persona if available
    if (loadedPersonas.length > 0) {
      setSelectedPersona(loadedPersonas[0]);
    }

    // Set default character if available
    if (loadedCharacters.length > 0) {
      setSelectedCharacter(loadedCharacters[0]);
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    savePersonas(personas);
  }, [personas]);

  useEffect(() => {
    saveCharacters(characters);
  }, [characters]);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveGlobalSettings(globalSettings);
  }, [globalSettings]);

  useEffect(() => {
    saveGlobalInstructions(globalInstructions);
  }, [globalInstructions]);

  useEffect(() => {
    saveProviderConfigs(providerConfigs);
  }, [providerConfigs]);

  useEffect(() => {
    saveAutoExport(autoExport);
  }, [autoExport]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showHeaderActions) {
          setShowHeaderActions(false);
        } else if (showMobileMenu) {
          setShowMobileMenu(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showHeaderActions, showMobileMenu]);

  // Chat functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedPersona || !selectedCharacter) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const controller = new AbortController();
      setAbortController(controller);

      const response = await chatWithProvider(
        [...messages, userMessage],
        selectedPersona,
        selectedCharacter,
        globalSettings,
        globalInstructions,
        activeProvider,
        providerConfigs,
        controller.signal
      );

      const aiMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update conversation
      if (currentConversation) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, userMessage, aiMessage],
          lastActivity: new Date(),
        };
        setCurrentConversation(updatedConversation);
        setConversations(prev =>
          prev.map(conv => conv.id === currentConversation.id ? updatedConversation : conv)
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  // Utility functions
  const getTagsFromMessages = () => {
    const allTags: Array<{ messageIndex: number; tagName: string; content: string }> = [];
    messages.forEach((msg, idx) => {
      if (msg.role === 'assistant') {
        const tags = extractAllTags(msg.content);
        tags.forEach(tag => {
          allTags.push({ messageIndex: idx, tagName: tag.tagName, content: tag.content });
        });
      }
    });
    return allTags;
  };

  const handleSummarize = async () => {
    if (!currentConversation) return;

    setIsSummarizing(true);
    try {
      const result = await summarizeConversation({
        messages: currentConversation.messages,
        settings: globalSettings.summarization,
        provider: globalSettings.provider,
        modelId: globalSettings.modelId,
        apiKey: getActiveProfile(globalSettings.provider)?.apiKey || "",
      });

      setConversationSummary(result.summary);
      setCurrentConversation(prev => prev ? { ...prev, summaryMemory: result.summary } : null);
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDebugLastRequest = () => {
    // This would need to be implemented to capture the last API request
    setApiDebugPayload("Debug functionality not yet implemented");
  };

  const continueConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages);
    setView("chat");
  };

  const handleImportInstructions = (file: File) => {
    // Implementation would go here
    console.log("Import instructions from file:", file.name);
  };

  const handleExportData = () => {
    // Implementation would go here
    console.log("Export data");
  };

  const handleImportData = (file: File) => {
    // Implementation would go here
    console.log("Import data from file:", file.name);
  };

  const createProfile = (providerType: LLMProviderType, profileData: Omit<ProviderProfile, "id" | "createdAt">) => {
    const newProfile: ProviderProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...profileData,
      createdAt: new Date(),
    };

    setProviderConfigs(prev => ({
      ...prev,
      [providerType]: {
        ...prev[providerType],
        profiles: [...prev[providerType].profiles, newProfile],
        activeProfileId: newProfile.id,
      }
    }));

    return newProfile;
  };

  const selectProfile = (providerType: LLMProviderType, profileId: string) => {
    setProviderConfigs(prev => ({
      ...prev,
      [providerType]: {
        ...prev[providerType],
        activeProfileId: profileId,
      }
    }));
  };

  const deleteProfile = (providerType: LLMProviderType, profileId: string) => {
    setProviderConfigs(prev => ({
      ...prev,
      [providerType]: {
        ...prev[providerType],
        profiles: prev[providerType].profiles.filter(p => p.id !== profileId),
        activeProfileId: prev[providerType].activeProfileId === profileId
          ? (prev[providerType].profiles.find(p => p.id !== profileId)?.id || null)
          : prev[providerType].activeProfileId,
      }
    }));
  };

  const getActiveProfile = (providerType: LLMProviderType) => {
    const config = providerConfigs[providerType];
    return config?.profiles.find(p => p.id === config.activeProfileId) || null;
  };

  const handleTestConnection = async (providerType: LLMProviderType) => {
    setConnectionStatus(prev => ({ ...prev, [providerType]: { status: "testing", message: "Testing connection..." } }));

    try {
      await testConnection(providerType, getActiveProfile(providerType)?.apiKey || "");
      setConnectionStatus(prev => ({ ...prev, [providerType]: { status: "connected", message: "Connected successfully" } }));
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [providerType]: {
          status: "error",
          message: error instanceof Error ? error.message : "Connection failed"
        }
      }));
    }
  };

  const handleConnectProvider = async (providerType: LLMProviderType) => {
    // Implementation would go here
    console.log("Connect provider:", providerType);
  };

  // Render
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Roleplay Studio</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setView("home")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  view === "home" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setView("chat")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  view === "chat" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setView("characters")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  view === "characters" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Characters
              </button>
              <button
                onClick={() => setShowModelsModal(true)}
                className="px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                Models
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-zinc-800 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Header Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowHeaderActions(!showHeaderActions)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  setView("home");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  view === "home" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setView("chat");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  view === "chat" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => {
                  setView("characters");
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  view === "characters" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                Characters
              </button>
              <button
                onClick={() => {
                  setShowModelsModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                Models
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Header Actions Dropdown */}
      {showHeaderActions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowHeaderActions(false)} />
          <div className="absolute top-16 right-4 z-50 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl">
            <div className="p-2">
              {/* Instructions */}
              <button
                onClick={() => {
                  setShowInstructionModal(true);
                  setShowHeaderActions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.333.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.333.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.333.477-4.5 1.253" />
                </svg>
                <div>
                  <div className="text-sm text-white">Instructions</div>
                  <div className="text-xs text-zinc-500">Chat, Generator, Brainstorm, VN</div>
                </div>
              </button>

              {/* Utilities */}
              <button
                onClick={() => {
                  setShowUtilitiesModal(true);
                  setShowHeaderActions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="text-sm text-white">Utilities</div>
                  <div className="text-xs text-zinc-500">Tags, summarize, debug</div>
                </div>
              </button>

              {/* Character Card - only in chat view with character */}
              {view === "chat" && selectedCharacter && (
                <button
                  onClick={() => {
                    setShowCharacterCardModal(true);
                    setShowHeaderActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="text-sm text-white">Character Card</div>
                    <div className="text-xs text-zinc-500">View & edit info</div>
                  </div>
                </button>
              )}

              {/* Utility Panel - only in chat view with conversation */}
              {view === "chat" && currentConversation && (
                <button
                  onClick={() => {
                    setShowUtilityPanel(!showUtilityPanel);
                    setShowHeaderActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <div>
                    <div className="text-sm text-white">Utilities</div>
                    <div className="text-xs text-zinc-500">Tags, summarize, debug</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "home" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to Roleplay Studio</h2>
            <p className="text-zinc-400 mb-8">Select a view from the navigation above to get started.</p>
          </div>
        )}

        {view === "chat" && (
          <div className="max-w-4xl mx-auto">
            {/* Chat Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Chat</h2>
              {selectedPersona && selectedCharacter && (
                <p className="text-zinc-400">
                  Roleplaying as <span className="text-blue-400">{selectedPersona.name}</span> with <span className="text-purple-400">{selectedCharacter.name}</span>
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg mb-4 max-h-96 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="mb-4 last:mb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">
                          {message.role === "user" ? (selectedPersona?.name.charAt(0).toUpperCase() || "U") : (selectedCharacter?.name.charAt(0).toUpperCase() || "A")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-zinc-300">
                            {message.role === "user" ? (selectedPersona?.name || "You") : (selectedCharacter?.name || "AI")}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !selectedPersona || !selectedCharacter}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
              {isLoading && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop
                </button>
              )}
            </form>
          </div>
        )}

        {view === "characters" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Characters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <div key={character.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">{character.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{character.description}</p>
                  <button
                    onClick={() => setSelectedCharacter(character)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModelsModal && (
        <ModelsModal
          show={showModelsModal}
          onClose={() => setShowModelsModal(false)}
          globalSettings={globalSettings}
          setGlobalSettings={setGlobalSettings}
          providerConfigs={providerConfigs}
          setProviderConfigs={setProviderConfigs}
          activeProvider={activeProvider}
          setActiveProvider={setActiveProvider}
          connectionStatus={connectionStatus}
          onTestConnection={handleTestConnection}
          onConnect={handleConnectProvider}
          providerModels={providerModels}
          modelsFetching={modelsFetching}
          onExportData={handleExportData}
          onImportData={handleImportData}
          autoExport={autoExport}
          setAutoExport={setAutoExport}
          createProfile={createProfile}
          selectProfile={selectProfile}
          deleteProfile={deleteProfile}
          getActiveProfile={getActiveProfile}
        />
      )}

      {showInstructionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Instructions</h2>
                <p className="text-sm text-zinc-500">Exclusive to each mode - Chat, Generator, Brainstorm, VN</p>
              </div>
              <button
                onClick={() => setShowInstructionModal(false)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabbed Navigation */}
            <div className="flex-shrink-0 border-b border-zinc-800">
              <div className="flex gap-0">
                {['chat', 'generator', 'brainstorm', 'vn'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setActiveInstructionTab(mode as any)}
                    className={`px-6 py-3 text-sm font-medium transition-all ${
                      activeInstructionTab === mode
                        ? 'text-blue-400 border-b-2 border-blue-500'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - Instruction Inputs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Chat Instructions Tab */}
              {activeInstructionTab === 'chat' && (
                <div className="space-y-4">
                  {/* Formatting Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Formatting Prompt
                    </label>
                    <textarea
                      value={globalInstructions.formattingPrompt || DEFAULT_FORMATTING_PROMPT}
                      onChange={(e) => setGlobalInstructions({
                        ...globalInstructions,
                        formattingPrompt: e.target.value
                      })}
                      placeholder="Instructions for how the AI should format responses (actions, dialogue, thoughts...)"
                      rows={5}
                      className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700 resize-none text-sm"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Sent before context to guide response formatting (actions, speech, thoughts)
                    </p>
                  </div>

                  {/* Jailbreak Instructions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-zinc-400">
                        Jailbreak Instructions
                      </label>
                      <button
                        type="button"
                        onClick={() => setGlobalInstructions({
                          ...globalInstructions,
                          enableJailbreak: !globalInstructions.enableJailbreak
                        })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          globalInstructions.enableJailbreak ? "bg-amber-600" : "bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            globalInstructions.enableJailbreak ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <textarea
                      value={globalInstructions.jailbreakInstructions || ""}
                      onChange={(e) => setGlobalInstructions({
                        ...globalInstructions,
                        jailbreakInstructions: e.target.value
                      })}
                      placeholder="Jailbreak instructions to bypass content restrictions..."
                      rows={4}
                      className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 border border-zinc-700 resize-none text-sm"
                    />
                    <p className="text-xs text-amber-500/70 mt-1">
                      ⚠️ Enable to include jailbreak instructions in prompts
                    </p>
                  </div>

                  {/* Continue Instruction */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Continue Instruction
                    </label>
                    <textarea
                      value={globalInstructions.continueInstruction || DEFAULT_CONTINUE_INSTRUCTION}
                      onChange={(e) => setGlobalInstructions({
                        ...globalInstructions,
                        continueInstruction: e.target.value
                      })}
                      placeholder="Continue your previous response..."
                      rows={2}
                      className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none text-sm"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Used when clicking continue button to complete incomplete responses
                    </p>
                  </div>

                  {/* Image Generation Instructions */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Image Generation Instructions
                    </label>
                    <textarea
                      value={globalInstructions.imageGenerationInstructions || DEFAULT_IMAGE_GENERATION_INSTRUCTIONS}
                      onChange={(e) => setGlobalInstructions({
                        ...globalInstructions,
                        imageGenerationInstructions: e.target.value
                      })}
                      placeholder="Instructions for generating character images..."
                      rows={3}
                      className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none text-sm"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Used when generating character avatar images. Describe the style, quality, and composition you want.
                    </p>
                  </div>

                  {/* Instruction List Section (SillyTavern-style) */}
                  <div className="mt-6 pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-zinc-400">
                        Instruction List
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newInstruction: Instruction = {
                            id: `instruction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            name: "New Instruction",
                            content: "",
                            role: "system",
                            position: "after_context",
                            enabled: true,
                            order: globalInstructions.instructions?.length || 0,
                          };
                          setGlobalInstructions({
                            ...globalInstructions,
                            instructions: [...(globalInstructions.instructions || []), newInstruction],
                          });
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        + Add Instruction
                      </button>
                    </div>

                    <p className="text-xs text-zinc-500 mb-4">
                      Manage multiple instructions with custom roles and positions (SillyTavern-style)
                    </p>

                    {/* Instruction List */}
                    <div className="space-y-3">
                      {(globalInstructions.instructions || []).map((instruction, index) => (
                        <div
                          key={instruction.id}
                          className={`p-3 rounded-lg border ${
                            instruction.enabled
                              ? "bg-zinc-800/50 border-zinc-700"
                              : "bg-zinc-900/50 border-zinc-800 opacity-60"
                          }`}
                        >
                          {/* Instruction Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {/* Reorder Buttons */}
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === 0) return;
                                    const newList = [...(globalInstructions.instructions || [])];
                                    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
                                    // Update order values
                                    newList.forEach((inst, i) => { inst.order = i; });
                                    setGlobalInstructions({
                                      ...globalInstructions,
                                      instructions: newList,
                                    });
                                  }}
                                  disabled={index === 0}
                                  className={`p-0.5 ${index === 0 ? 'text-zinc-600' : 'text-zinc-400 hover:text-white'} transition-colors`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === (globalInstructions.instructions || []).length - 1) return;
                                    const newList = [...(globalInstructions.instructions || [])];
                                    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
                                    // Update order values
                                    newList.forEach((inst, i) => { inst.order = i; });
                                    setGlobalInstructions({
                                      ...globalInstructions,
                                      instructions: newList,
                                    });
                                  }}
                                  disabled={index === (globalInstructions.instructions || []).length - 1}
                                  className={`p-0.5 ${index === (globalInstructions.instructions || []).length - 1 ? 'text-zinc-600' : 'text-zinc-400 hover:text-white'} transition-colors`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>

                              {/* Name Input */}
                              <input
                                type="text"
                                value={instruction.name}
                                onChange={(e) => {
                                  const newList = [...(globalInstructions.instructions || [])];
                                  newList[index] = { ...instruction, name: e.target.value };
                                  setGlobalInstructions({
                                    ...globalInstructions,
                                    instructions: newList,
                                  });
                                }}
                                className="bg-transparent text-white text-sm font-medium border-none focus:outline-none focus:ring-0 w-32"
                                placeholder="Instruction name"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Enable/Disable Toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newList = [...(globalInstructions.instructions || [])];
                                  newList[index] = { ...instruction, enabled: !instruction.enabled };
                                  setGlobalInstructions({
                                    ...globalInstructions,
                                    instructions: newList,
                                  });
                                }}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  instruction.enabled ? "bg-green-600" : "bg-zinc-700"
                                }`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                    instruction.enabled ? "translate-x-5" : "translate-x-1"
                                  }`}
                                />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Delete this instruction?")) {
                                    const newList = (globalInstructions.instructions || []).filter(
                                      (_, i) => i !== index
                                    );
                                    setGlobalInstructions({
                                      ...globalInstructions,
                                      instructions: newList,
                                    });
                                  }
                                }}
                                className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Role and Position Dropdowns */}
                          <div className="flex gap-2 mb-2">
                            {/* Role Dropdown */}
                            <div className="flex-1">
                              <label className="block text-xs text-zinc-500 mb-1">Role</label>
                              <select
                                value={instruction.role}
                                onChange={(e) => {
                                  const newList = [...(globalInstructions.instructions || [])];
                                  newList[index] = { ...instruction, role: e.target.value as InstructionRole };
                                  setGlobalInstructions({
                                    ...globalInstructions,
                                    instructions: newList,
                                  });
                                }}
                                className="w-full bg-zinc-900 text-white text-xs rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="system">System</option>
                                <option value="user">User</option>
                                <option value="assistant">Assistant</option>
                              </select>
                            </div>

                            {/* Position Dropdown */}
                            <div className="flex-1">
                              <label className="block text-xs text-zinc-500 mb-1">Position</label>
                              <select
                                value={instruction.position}
                                onChange={(e) => {
                                  const newList = [...(globalInstructions.instructions || [])];
                                  newList[index] = { ...instruction, position: e.target.value as InstructionPosition };
                                  setGlobalInstructions({
                                    ...globalInstructions,
                                    instructions: newList,
                                  });
                                }}
                                className="w-full bg-zinc-900 text-white text-xs rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="before_context">Before Context</option>
                                <option value="after_context">After Context</option>
                              </select>
                            </div>
                          </div>

                          {/* Content Textarea */}
                          <textarea
                            value={instruction.content}
                            onChange={(e) => {
                              const newList = [...(globalInstructions.instructions || [])];
                              newList[index] = { ...instruction, content: e.target.value };
                              setGlobalInstructions({
                                ...globalInstructions,
                                instructions: newList,
                              });
                            }}
                            placeholder="Enter instruction content..."
                            rows={3}
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      ))}

                      {/* Empty State */}
                      {(!globalInstructions.instructions || globalInstructions.instructions.length === 0) && (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                          No instructions yet. Click &quot;Add Instruction&quot; to create one.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Generator Instructions Tab */}
              {activeInstructionTab === 'generator' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Character Generator Instructions</h3>
                  <textarea
                    value={generatorInstructions}
                    onChange={(e) => setGeneratorInstructions(e.target.value)}
                    placeholder="Enter character creator instructions..."
                    className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none"
                    rows={6}
                  />
                </div>
              )}

              {/* Brainstorm Instructions Tab */}
              {activeInstructionTab === 'brainstorm' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Brainstorm Instructions</h3>
                  <textarea
                    value={brainstormInstructions}
                    onChange={(e) => setBrainstormInstructions(e.target.value)}
                    placeholder="Enter brainstorm assistant instructions..."
                    className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none"
                    rows={6}
                  />
                </div>
              )}

              {/* VN Generator Instructions Tab */}
              {activeInstructionTab === 'vn' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">VN Generator Instructions</h3>
                  <textarea
                    value={vnInstructions}
                    onChange={(e) => setVnInstructions(e.target.value)}
                    placeholder="Enter visual novel generator instructions..."
                    className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none"
                    rows={6}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-4 border-t border-zinc-800 flex gap-3">
              <button
                onClick={() => {
                  // Apply all instruction changes
                  setShowInstructionModal(false);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save All
              </button>
              <button
                onClick={() => setShowInstructionModal(false)}
                className="flex-1 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUtilitiesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Utilities</h2>
                <p className="text-sm text-zinc-500">Tags, summarize, debug</p>
              </div>
              <button
                onClick={() => setShowUtilitiesModal(false)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2 border-b border-zinc-800">
              <button
                onClick={() => setUtilityPanelTab('tags')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  utilityPanelTab === 'tags'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                </span>
              </button>
              <button
                onClick={() => setUtilityPanelTab('summarization')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  utilityPanelTab === 'summarization'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summarize
                </span>
              </button>
              <button
                onClick={() => setUtilityPanelTab('debug')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  utilityPanelTab === 'debug'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Debug
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tags Section */}
              {utilityPanelTab === 'tags' && (
                <div className="space-y-3">
                  {(() => {
                    const allTags: Array<{ messageIndex: number; tagName: string; content: string }> = [];
                    (currentConversation?.messages || []).forEach((msg, idx) => {
                      if (msg.role === 'assistant') {
                        const tags = extractAllTags(msg.content);
                        tags.forEach(tag => {
                          allTags.push({ messageIndex: idx, tagName: tag.tagName, content: tag.content });
                        });
                      }
                    });

                    if (allTags.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <p className="text-sm text-zinc-500">No tags found</p>
                          <p className="text-xs text-zinc-600 mt-1">Custom tags from AI responses appear here</p>
                        </div>
                      );
                    }

                    return allTags.map((tag, idx) => (
                      <div key={idx} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
                        <div className="px-3 py-2.5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded-md border border-purple-800/50 font-mono">
                              &lt;{tag.tagName}&gt;
                            </span>
                            <span className="text-xs text-zinc-600">msg {tag.messageIndex + 1}</span>
                          </div>
                          <div className="whitespace-pre-wrap text-xs text-zinc-300 leading-relaxed">
                            {tag.content}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* Summarization Section */}
              {utilityPanelTab === 'summarization' && (
                <div className="space-y-4">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                    <div>
                      <p className="text-sm font-medium text-white">Summarization</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Compress context to save tokens</p>
                    </div>
                    <button
                      onClick={() => {
                        setGlobalSettings(prev => ({
                          ...prev,
                          summarization: {
                            ...prev.summarization,
                            enabled: !prev.summarization.enabled
                          }
                        }));
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        globalSettings.summarization.enabled ? 'bg-blue-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          globalSettings.summarization.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {globalSettings.summarization.enabled ? (
                    <>
                      {/* Quick Actions */}
                      <div className="bg-zinc-800/30 rounded-xl border border-zinc-700/50 p-3">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</p>
                        <button
                          onClick={handleSummarize}
                          disabled={isSummarizing || isLoading || (currentConversation?.messages?.length || 0) <= (globalSettings.summarization.recentMessagesCount ?? 10)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {isSummarizing ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Summarizing...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {currentConversation?.summaryMemory ? 'Update Summary' : 'Create Summary'}
                            </>
                          )}
                        </button>
                      </div>

                      {/* Summary Memory */}
                      {currentConversation?.summaryMemory && (
                        <div className="bg-zinc-800/30 rounded-xl border border-zinc-700/50 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Summary Memory</p>
                            <span className="text-xs text-zinc-600">
                              {(currentConversation?.messages?.length || 0)} msgs
                            </span>
                          </div>
                          <div className="bg-zinc-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                            <p className="whitespace-pre-wrap text-xs text-zinc-300 leading-relaxed">
                              {currentConversation.summaryMemory}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Configuration */}
                      <div className="bg-zinc-800/30 rounded-xl border border-zinc-700/50 p-3 space-y-3">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Settings</p>

                        {/* Quality */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Quality</label>
                          <select
                            value={globalSettings.summarization.quality}
                            onChange={(e) => {
                              setGlobalSettings(prev => ({
                                ...prev,
                                summarization: {
                                  ...prev.summarization,
                                  quality: e.target.value as any
                                }
                              }));
                            }}
                            className="w-full bg-zinc-900 text-white rounded-lg px-2.5 py-2 text-xs border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="fast">Fast - Compact</option>
                            <option value="balanced">Balanced - Good detail</option>
                            <option value="detailed">Detailed - Comprehensive</option>
                          </select>
                        </div>

                        {/* Trigger */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Trigger</label>
                          <select
                            value={globalSettings.summarization.trigger}
                            onChange={(e) => {
                              setGlobalSettings(prev => ({
                                ...prev,
                                summarization: {
                                  ...prev.summarization,
                                  trigger: e.target.value as any
                                }
                              }));
                            }}
                            className="w-full bg-zinc-900 text-white rounded-lg px-2.5 py-2 text-xs border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="manual">Manual only</option>
                            <option value="auto-length">Auto (by length)</option>
                            <option value="periodic">Periodic</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-zinc-500">Summarization disabled</p>
                      <p className="text-xs text-zinc-600 mt-1">Toggle on to compress context</p>
                    </div>
                  )}
                </div>
              )}

              {/* Debug Section */}
              {utilityPanelTab === 'debug' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">API Payload Preview</p>
                    {apiDebugPayload && (
                      <button
                        onClick={() => setApiDebugPayload(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {!apiDebugPayload ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <p className="text-sm text-zinc-500">No debug data</p>
                      <p className="text-xs text-zinc-600 mt-1">Send a message to see the API payload</p>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-words">
                        {apiDebugPayload}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowUtilitiesModal(false)}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showHeaderActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowHeaderActions(false)}
        />
      )}
    </div>
  );
}