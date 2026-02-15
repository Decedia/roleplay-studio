"use client";

import { useState, useRef, useEffect } from "react";

// Types
interface Persona {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

interface Character {
  id: string;
  name: string;
  description: string;
  firstMessage: string;
  createdAt: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Model configuration from puter.ai.listModels()
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

// Default model (will be updated when models are fetched)
const DEFAULT_MODEL_ID = "gpt-4o-mini";

interface ConversationSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  modelId: string;
}

interface Conversation {
  id: string;
  personaId: string;
  characterId: string;
  messages: Message[];
  settings: ConversationSettings;
  createdAt: number;
  updatedAt: number;
}

// Declare puter as a global
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          messages: Array<{ role: string; content: string }>,
          options?: { 
            model?: string;
            temperature?: number;
            max_tokens?: number;
            top_p?: number;
          }
        ) => Promise<{ message: { content: string } }>;
        listModels: (provider?: string) => Promise<Model[]>;
      };
      auth: {
        getUser: () => Promise<PuterUser | null>;
        getMonthlyUsage: () => Promise<PuterUsage>;
        getDetailedAppUsage: (appId: string) => Promise<PuterAppUsage>;
      };
    };
  }
}

interface PuterUser {
  username: string;
  email?: string;
  uuid: string;
}

interface PuterUsage {
  ai_chat_tokens?: number;
  ai_image_generations?: number;
  storage_bytes?: number;
  [key: string]: number | undefined;
}

interface PuterAppUsage {
  app_id?: string;
  ai_chat_tokens?: number;
  ai_image_generations?: number;
  storage_bytes?: number;
  [key: string]: string | number | undefined;
}

// Local storage keys
const PERSONAS_KEY = "chat_personas";
const CHARACTERS_KEY = "chat_characters";
const CONVERSATIONS_KEY = "chat_conversations";

// Default settings
const DEFAULT_SETTINGS: ConversationSettings = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
  modelId: DEFAULT_MODEL_ID,
};

export default function Chat() {
  // State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [view, setView] = useState<"personas" | "characters" | "conversations" | "chat">("personas");
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  
  // Form state
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [characterFirstMessage, setCharacterFirstMessage] = useState("");
  
  // Settings state
  const [tempSettings, setTempSettings] = useState<ConversationSettings>(DEFAULT_SETTINGS);
  
  // Chat state
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // User state
  const [user, setUser] = useState<PuterUser | null>(null);
  const [usage, setUsage] = useState<PuterUsage | null>(null);
  const [appUsage, setAppUsage] = useState<PuterAppUsage | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  
  // Models state
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPersonas = localStorage.getItem(PERSONAS_KEY);
    const storedCharacters = localStorage.getItem(CHARACTERS_KEY);
    const storedConversations = localStorage.getItem(CONVERSATIONS_KEY);
    
    if (storedPersonas) {
      setPersonas(JSON.parse(storedPersonas));
    }
    if (storedCharacters) {
      setCharacters(JSON.parse(storedCharacters));
    }
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  // Save personas to localStorage
  useEffect(() => {
    if (personas.length > 0 || localStorage.getItem(PERSONAS_KEY)) {
      localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
    }
  }, [personas]);

  // Save characters to localStorage
  useEffect(() => {
    if (characters.length > 0 || localStorage.getItem(CHARACTERS_KEY)) {
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    }
  }, [characters]);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0 || localStorage.getItem(CONVERSATIONS_KEY)) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  // Focus input when entering chat view
  useEffect(() => {
    if (view === "chat") {
      inputRef.current?.focus();
    }
  }, [view]);

  // Fetch user and usage data from puter.js
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof window.puter !== "undefined") {
          console.log("Fetching user data...");
          const userData = await window.puter.auth.getUser();
          console.log("User data:", userData);
          setUser(userData);
          
          console.log("Fetching usage data...");
          const usageData = await window.puter.auth.getMonthlyUsage();
          console.log("Usage data:", usageData);
          setUsage(usageData);

          // Get detailed app usage if we have an app ID
          const puterWithApp = window.puter as typeof window.puter & { appID?: string };
          if (puterWithApp.appID) {
            console.log("Fetching detailed app usage for app:", puterWithApp.appID);
            try {
              const appUsageData = await window.puter.auth.getDetailedAppUsage(puterWithApp.appID);
              console.log("App usage data:", appUsageData);
              setAppUsage(appUsageData);
            } catch (appErr) {
              console.warn("Could not fetch detailed app usage:", appErr);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setUsageError(err instanceof Error ? err.message : "Failed to load usage data");
      }
    };

    // Wait for puter.js to load
    const checkPuter = setInterval(() => {
      if (typeof window.puter !== "undefined") {
        clearInterval(checkPuter);
        fetchUserData();
      }
    }, 100);

    // Cleanup interval after 10 seconds if puter doesn't load
    const timeout = setTimeout(() => {
      clearInterval(checkPuter);
      if (typeof window.puter === "undefined") {
        setUsageError("Puter.js failed to load");
      }
    }, 10000);
    
    return () => {
      clearInterval(checkPuter);
      clearTimeout(timeout);
    };
  }, []);

  // Fetch available models from puter.ai.listModels()
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        if (typeof window.puter !== "undefined") {
          console.log("Fetching available models...");
          const modelsData = await window.puter.ai.listModels();
          console.log("Models data:", modelsData);
          setModels(modelsData);
          
          // Set default model if not already set
          if (modelsData.length > 0) {
            const defaultModel = modelsData.find(m => m.id === DEFAULT_MODEL_ID) || modelsData[0];
            setTempSettings(prev => ({
              ...prev,
              modelId: prev.modelId || defaultModel.id
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        setModelsError(err instanceof Error ? err.message : "Failed to load models");
      } finally {
        setModelsLoading(false);
      }
    };

    // Wait for puter.js to load
    const checkPuter = setInterval(() => {
      if (typeof window.puter !== "undefined") {
        clearInterval(checkPuter);
        fetchModels();
      }
    }, 100);

    // Cleanup interval after 10 seconds if puter doesn't load
    const timeout = setTimeout(() => {
      clearInterval(checkPuter);
      if (typeof window.puter === "undefined") {
        setModelsError("Puter.js failed to load");
        setModelsLoading(false);
      }
    }, 10000);
    
    return () => {
      clearInterval(checkPuter);
      clearTimeout(timeout);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest(".user-menu-container")) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  // Persona functions
  const createPersona = () => {
    if (!personaName.trim() || !personaDescription.trim()) return;
    
    const newPersona: Persona = {
      id: crypto.randomUUID(),
      name: personaName.trim(),
      description: personaDescription.trim(),
      createdAt: Date.now(),
    };
    
    setPersonas((prev) => [...prev, newPersona]);
    setPersonaName("");
    setPersonaDescription("");
    setShowPersonaModal(false);
  };

  const updatePersona = () => {
    if (!editingPersona || !personaName.trim() || !personaDescription.trim()) return;
    
    setPersonas((prev) =>
      prev.map((p) =>
        p.id === editingPersona.id
          ? { ...p, name: personaName.trim(), description: personaDescription.trim() }
          : p
      )
    );
    setEditingPersona(null);
    setPersonaName("");
    setPersonaDescription("");
    setShowPersonaModal(false);
  };

  const deletePersona = (id: string) => {
    setPersonas((prev) => prev.filter((p) => p.id !== id));
    // Also delete related conversations
    setConversations((prev) => prev.filter((c) => c.personaId !== id));
    if (selectedPersona?.id === id) {
      setSelectedPersona(null);
      setView("personas");
    }
  };

  const openEditPersona = (persona: Persona) => {
    setEditingPersona(persona);
    setPersonaName(persona.name);
    setPersonaDescription(persona.description);
    setShowPersonaModal(true);
  };

  // Character functions
  const createCharacter = () => {
    if (!characterName.trim() || !characterDescription.trim() || !characterFirstMessage.trim()) return;
    
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: characterName.trim(),
      description: characterDescription.trim(),
      firstMessage: characterFirstMessage.trim(),
      createdAt: Date.now(),
    };
    
    setCharacters((prev) => [...prev, newCharacter]);
    setCharacterName("");
    setCharacterDescription("");
    setCharacterFirstMessage("");
    setShowCharacterModal(false);
  };

  const updateCharacter = () => {
    if (!editingCharacter || !characterName.trim() || !characterDescription.trim() || !characterFirstMessage.trim()) return;
    
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === editingCharacter.id
          ? { 
              ...c, 
              name: characterName.trim(), 
              description: characterDescription.trim(),
              firstMessage: characterFirstMessage.trim()
            }
          : c
      )
    );
    setEditingCharacter(null);
    setCharacterName("");
    setCharacterDescription("");
    setCharacterFirstMessage("");
    setShowCharacterModal(false);
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    // Also delete related conversations
    setConversations((prev) => prev.filter((c) => c.characterId !== id));
    if (selectedCharacter?.id === id) {
      setSelectedCharacter(null);
      setView("characters");
    }
  };

  const openEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setCharacterName(character.name);
    setCharacterDescription(character.description);
    setCharacterFirstMessage(character.firstMessage);
    setShowCharacterModal(true);
  };

  // Navigation functions
  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setView("characters");
  };

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setView("conversations");
  };

  // Conversation functions
  const createConversation = () => {
    if (!selectedPersona || !selectedCharacter) return;
    
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      personaId: selectedPersona.id,
      characterId: selectedCharacter.id,
      messages: [
        { role: "assistant", content: selectedCharacter.firstMessage }
      ],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversation(newConversation);
    setView("chat");
  };

  const continueConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setView("chat");
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const openSettings = () => {
    if (currentConversation) {
      setTempSettings({ ...currentConversation.settings });
      setShowSettingsModal(true);
    }
  };

  const saveSettings = () => {
    if (!currentConversation) return;
    
    const updated = {
      ...currentConversation,
      settings: { ...tempSettings },
      updatedAt: Date.now(),
    };
    
    setCurrentConversation(updated);
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversation.id ? updated : c))
    );
    setShowSettingsModal(false);
  };

  // Chat functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversation || !selectedPersona || !selectedCharacter) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // Add user message to conversation
    const updatedMessages: Message[] = [
      ...currentConversation.messages,
      { role: "user", content: userMessage },
    ];

    updateConversationMessages(updatedMessages);
    setIsLoading(true);

    try {
      if (typeof window.puter === "undefined") {
        throw new Error("Puter.js is still loading. Please wait a moment and try again.");
      }

      // Build system prompt - user is roleplaying as persona, AI is the character
      const systemPrompt = `You are ${selectedCharacter.name}. ${selectedCharacter.description}

The user is roleplaying as ${selectedPersona.name}. ${selectedPersona.description}

Stay in character as ${selectedCharacter.name} throughout the conversation. Respond naturally and consistently with your character's personality.`;

      // Prepare messages for API
      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await window.puter.ai.chat(chatMessages, {
        model: currentConversation.settings.modelId || DEFAULT_MODEL_ID,
        temperature: currentConversation.settings.temperature,
        max_tokens: currentConversation.settings.maxTokens,
        top_p: currentConversation.settings.topP,
      });

      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: "assistant", content: response.message.content },
      ];

      updateConversationMessages(finalMessages);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const updateConversationMessages = (messages: Message[]) => {
    if (!currentConversation) return;
    
    const updated = {
      ...currentConversation,
      messages,
      updatedAt: Date.now(),
    };
    
    setCurrentConversation(updated);
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversation.id ? updated : c))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const goBack = () => {
    if (view === "chat") {
      setView("conversations");
      setCurrentConversation(null);
    } else if (view === "conversations") {
      setView("characters");
      setSelectedCharacter(null);
    } else if (view === "characters") {
      setView("personas");
      setSelectedPersona(null);
    }
  };

  // Get conversations for selected persona and character
  const filteredConversations = conversations.filter(
    (c) => c.personaId === selectedPersona?.id && c.characterId === selectedCharacter?.id
  );

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-800 bg-black">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== "personas" && (
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {view === "chat" && selectedPersona && selectedCharacter
                    ? `${selectedPersona.name} × ${selectedCharacter.name}`
                    : view === "conversations" && selectedPersona && selectedCharacter
                    ? `${selectedPersona.name} × ${selectedCharacter.name}`
                    : view === "characters" && selectedPersona
                    ? `${selectedPersona.name} - Select Character`
                    : "GLM 5 Chat"}
                </h1>
                <p className="text-sm text-zinc-500">
                  {view === "personas"
                    ? "Select your persona"
                    : view === "characters"
                    ? "Select AI character"
                    : view === "conversations"
                    ? "Select or start a conversation"
                    : "Powered by puter.js"}
                </p>
              </div>
            </div>
            
            {/* Settings button in chat view */}
            {view === "chat" && (
              <button
                onClick={openSettings}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors mr-2"
                title="Conversation Settings"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            
            {/* Usage Stats - Always Visible */}
            {usage && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-zinc-800 mr-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-xs text-zinc-400">Tokens:</span>
                  <span className="text-xs text-white font-mono font-medium">{usage.ai_chat_tokens?.toLocaleString() ?? 0}</span>
                </div>
              </div>
            )}
            
            {/* User Menu */}
            {user && (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <span className="text-sm text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-300 hidden sm:block">{user.username}</span>
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-zinc-800">
                      <p className="text-sm text-zinc-400">Signed in as</p>
                      <p className="text-white font-medium">{user.username}</p>
                      {user.email && <p className="text-xs text-zinc-500 mt-1">{user.email}</p>}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-zinc-400 mb-3 font-medium">Monthly Usage</p>
                      {usageError ? (
                        <p className="text-sm text-red-400">{usageError}</p>
                      ) : usage ? (
                        <div className="space-y-2">
                          {usage.ai_chat_tokens !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Chat Tokens</span>
                              <span className="text-zinc-300 font-mono">{usage.ai_chat_tokens.toLocaleString()}</span>
                            </div>
                          )}
                          {usage.ai_image_generations !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Image Generations</span>
                              <span className="text-zinc-300 font-mono">{usage.ai_image_generations}</span>
                            </div>
                          )}
                          {usage.storage_bytes !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Storage</span>
                              <span className="text-zinc-300 font-mono">{(usage.storage_bytes / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          )}
                          {Object.keys(usage).length === 0 && (
                            <p className="text-sm text-zinc-500">No usage data available</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500">Loading usage data...</p>
                      )}
                      
                      {/* App-specific usage */}
                      {appUsage && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                          <p className="text-sm text-zinc-400 mb-3 font-medium">This App&apos;s Usage</p>
                          <div className="space-y-2">
                            {appUsage.ai_chat_tokens !== undefined && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Chat Tokens</span>
                                <span className="text-zinc-300 font-mono">{appUsage.ai_chat_tokens.toLocaleString()}</span>
                              </div>
                            )}
                            {appUsage.ai_image_generations !== undefined && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Image Generations</span>
                                <span className="text-zinc-300 font-mono">{appUsage.ai_image_generations}</span>
                              </div>
                            )}
                            {appUsage.storage_bytes !== undefined && (
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Storage</span>
                                <span className="text-zinc-300 font-mono">{(appUsage.storage_bytes / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Personas View */}
          {view === "personas" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Your Personas</h2>
                <button
                  onClick={() => {
                    setEditingPersona(null);
                    setPersonaName("");
                    setPersonaDescription("");
                    setShowPersonaModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Persona
                </button>
              </div>

              {personas.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No personas yet</h3>
                  <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                    Create a persona to represent yourself in conversations. This is who YOU are in the roleplay.
                  </p>
                  <button
                    onClick={() => setShowPersonaModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Persona
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {personas.map((persona) => (
                    <div
                      key={persona.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-xl text-white font-semibold">
                            {persona.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditPersona(persona)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deletePersona(persona.id)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">{persona.name}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{persona.description}</p>
                      <button
                        onClick={() => selectPersona(persona)}
                        className="w-full py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        Select Persona
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Characters View */}
          {view === "characters" && selectedPersona && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">AI Characters</h2>
                <button
                  onClick={() => {
                    setEditingCharacter(null);
                    setCharacterName("");
                    setCharacterDescription("");
                    setCharacterFirstMessage("");
                    setShowCharacterModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Character
                </button>
              </div>

              {characters.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No characters yet</h3>
                  <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                    Create an AI character to chat with. This is who the AI will roleplay as.
                  </p>
                  <button
                    onClick={() => setShowCharacterModal(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Your First Character
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-xl text-white font-semibold">
                            {character.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditCharacter(character)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteCharacter(character.id)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">{character.name}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-2">{character.description}</p>
                      <p className="text-xs text-zinc-500 italic line-clamp-2 mb-4">&ldquo;{character.firstMessage}&rdquo;</p>
                      <button
                        onClick={() => selectCharacter(character)}
                        className="w-full py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        Select Character
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversations View */}
          {view === "conversations" && selectedPersona && selectedCharacter && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Conversations</h2>
                <button
                  onClick={createConversation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>
              </div>

              {filteredConversations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No conversations yet</h3>
                  <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                    Start a new conversation between {selectedPersona.name} and {selectedCharacter.name}.
                  </p>
                  <button
                    onClick={createConversation}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Chatting
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConversations
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 cursor-pointer" onClick={() => continueConversation(conversation)}>
                            <p className="text-white font-medium">
                              {conversation.messages.length > 1
                                ? conversation.messages[1].content.slice(0, 50) + (conversation.messages[1].content.length > 50 ? "..." : "")
                                : "New conversation"}
                            </p>
                            <p className="text-sm text-zinc-500">
                              {conversation.messages.length} messages • Updated {new Date(conversation.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => continueConversation(conversation)}
                              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                              Continue
                            </button>
                            <button
                              onClick={() => deleteConversation(conversation.id)}
                              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Chat View */}
          {view === "chat" && currentConversation && (
            <>
              {currentConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                    <span className="text-2xl text-white font-semibold">
                      {selectedCharacter?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Chat with {selectedCharacter?.name}
                  </h2>
                  <p className="text-zinc-500 max-w-md">
                    {selectedCharacter?.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentConversation.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-sm text-white font-semibold">
                            {selectedCharacter?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-sm text-white font-semibold">
                            {selectedPersona?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">
                          {selectedCharacter?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/50 border border-red-800 rounded-lg px-4 py-2 text-red-200 text-sm">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Only show in chat view */}
      {view === "chat" && currentConversation && (
        <div className="flex-shrink-0 border-t border-zinc-800 bg-black">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message as ${selectedPersona?.name}...`}
                rows={1}
                className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded-xl px-4 py-3 pr-14 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-zinc-800"
                style={{ minHeight: "48px", maxHeight: "200px" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
            <p className="text-xs text-zinc-600 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Persona Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingPersona ? "Edit Persona" : "Create New Persona"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="e.g., Alex the Adventurer"
                  className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Description / Personality
                </label>
                <textarea
                  value={personaDescription}
                  onChange={(e) => setPersonaDescription(e.target.value)}
                  placeholder="Describe who you are, your personality, background, etc..."
                  rows={4}
                  className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPersonaModal(false);
                  setEditingPersona(null);
                  setPersonaName("");
                  setPersonaDescription("");
                }}
                className="flex-1 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPersona ? updatePersona : createPersona}
                disabled={!personaName.trim() || !personaDescription.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingPersona ? "Save Changes" : "Create Persona"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingCharacter ? "Edit Character" : "Create New Character"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Character Name
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g., Sherlock Holmes"
                  className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Description / Personality
                </label>
                <textarea
                  value={characterDescription}
                  onChange={(e) => setCharacterDescription(e.target.value)}
                  placeholder="Describe the character's personality, background, and how they should behave..."
                  rows={3}
                  className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  First Message
                </label>
                <textarea
                  value={characterFirstMessage}
                  onChange={(e) => setCharacterFirstMessage(e.target.value)}
                  placeholder="What does the character say when you first meet them?"
                  rows={3}
                  className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCharacterModal(false);
                  setEditingCharacter(null);
                  setCharacterName("");
                  setCharacterDescription("");
                  setCharacterFirstMessage("");
                }}
                className="flex-1 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCharacter ? updateCharacter : createCharacter}
                disabled={!characterName.trim() || !characterDescription.trim() || !characterFirstMessage.trim()}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingCharacter ? "Save Changes" : "Create Character"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && currentConversation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              Conversation Settings
            </h2>
            
            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Model
                </label>
                {modelsLoading ? (
                  <div className="w-full bg-zinc-800 text-zinc-400 rounded-lg px-4 py-2 border border-zinc-700">
                    Loading models...
                  </div>
                ) : modelsError ? (
                  <div className="w-full bg-red-900/30 text-red-400 rounded-lg px-4 py-2 border border-red-800">
                    {modelsError}
                  </div>
                ) : (
                  <>
                    <select
                      value={tempSettings.modelId || DEFAULT_MODEL_ID}
                      onChange={(e) => {
                        const newModelId = e.target.value;
                        const selectedModel = models.find(m => m.id === newModelId);
                        // Adjust maxTokens if it exceeds the new model's max_tokens
                        const maxOutput = selectedModel?.max_tokens || 4000;
                        const newMaxTokens = Math.min(tempSettings.maxTokens, maxOutput);
                        setTempSettings({ ...tempSettings, modelId: newModelId, maxTokens: newMaxTokens });
                      }}
                      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700"
                    >
                      {models.map((model) => {
                        const ctx = model.context ? model.context.toLocaleString() : "Unknown";
                        let costInfo: string;
                        if (model.cost && model.cost.tokens) {
                          const inputCost = (model.cost.input || 0) / 100 * (1000000 / model.cost.tokens);
                          const outputCost = (model.cost.output || 0) / 100 * (1000000 / model.cost.tokens);
                          if (inputCost === 0 && outputCost === 0) {
                            costInfo = "Free";
                          } else {
                            costInfo = `$${inputCost.toFixed(2)}/M in | $${outputCost.toFixed(2)}/M out`;
                          }
                        } else {
                          costInfo = "Pricing N/A";
                        }
                        return (
                          <option key={model.id} value={model.id}>
                            {model.name || model.id} - {ctx} ctx | {costInfo}
                          </option>
                        );
                      })}
                    </select>
                    {(() => {
                      const selectedModel = models.find(m => m.id === (tempSettings.modelId || DEFAULT_MODEL_ID));
                      if (selectedModel) {
                        const ctx = selectedModel.context ? selectedModel.context.toLocaleString() : "Unknown";
                        const maxOut = selectedModel.max_tokens ? selectedModel.max_tokens.toLocaleString() : "Unknown";
                        let inputCostDisplay: string;
                        let outputCostDisplay: string;
                        if (selectedModel.cost && selectedModel.cost.tokens) {
                          const inputCost = (selectedModel.cost.input || 0) / 100 * (1000000 / selectedModel.cost.tokens);
                          const outputCost = (selectedModel.cost.output || 0) / 100 * (1000000 / selectedModel.cost.tokens);
                          inputCostDisplay = inputCost === 0 ? "Free" : `$${inputCost.toFixed(2)} per 1M tokens`;
                          outputCostDisplay = outputCost === 0 ? "Free" : `$${outputCost.toFixed(2)} per 1M tokens`;
                        } else {
                          inputCostDisplay = "N/A";
                          outputCostDisplay = "N/A";
                        }
                        return (
                          <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Provider:</span>
                              <span className="text-zinc-300">{selectedModel.provider || "Unknown"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Context Window:</span>
                              <span className="text-zinc-300">{ctx} tokens</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Output:</span>
                              <span className="text-zinc-300">{maxOut} tokens</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Input Cost:</span>
                              <span className="text-zinc-300">{inputCostDisplay}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Output Cost:</span>
                              <span className="text-zinc-300">{outputCostDisplay}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Temperature: {tempSettings.temperature.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={tempSettings.temperature}
                  onChange={(e) => setTempSettings({ ...tempSettings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Max Tokens: {tempSettings.maxTokens}
                </label>
                {(() => {
                  const selectedModel = models.find(m => m.id === (tempSettings.modelId || DEFAULT_MODEL_ID));
                  const maxOutput = selectedModel?.max_tokens || 4000;
                  return (
                    <>
                      <input
                        type="range"
                        min="100"
                        max={maxOutput}
                        step="100"
                        value={tempSettings.maxTokens}
                        onChange={(e) => setTempSettings({ ...tempSettings, maxTokens: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        Maximum length of AI responses (model max: {maxOutput.toLocaleString()})
                      </p>
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Top P: {tempSettings.topP.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={tempSettings.topP}
                  onChange={(e) => setTempSettings({ ...tempSettings, topP: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Controls diversity of word selection
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
