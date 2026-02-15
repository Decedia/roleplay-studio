"use client";

import { useState, useRef, useEffect } from "react";

// Types
interface Persona {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  personaId: string;
  messages: Message[];
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
          options?: { model?: string }
        ) => Promise<{ message: { content: string } }>;
      };
    };
  }
}

// Local storage keys
const PERSONAS_KEY = "chat_personas";
const CONVERSATIONS_KEY = "chat_conversations";

export default function Chat() {
  // State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [view, setView] = useState<"personas" | "conversations" | "chat">("personas");
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  
  // Form state
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  
  // Chat state
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPersonas = localStorage.getItem(PERSONAS_KEY);
    const storedConversations = localStorage.getItem(CONVERSATIONS_KEY);
    
    if (storedPersonas) {
      setPersonas(JSON.parse(storedPersonas));
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

  // Conversation functions
  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setView("conversations");
  };

  const createConversation = () => {
    if (!selectedPersona) return;
    
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      personaId: selectedPersona.id,
      messages: [],
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

  // Chat functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversation || !selectedPersona) return;

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

      // Build system prompt with persona
      const systemPrompt = `You are roleplaying as ${selectedPersona.name}. ${selectedPersona.description} Stay in character throughout the conversation.`;

      // Prepare messages for API
      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await window.puter.ai.chat(chatMessages, {
        model: "glm-5",
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
      setView("personas");
      setSelectedPersona(null);
    }
  };

  // Get conversations for selected persona
  const personaConversations = conversations.filter(
    (c) => c.personaId === selectedPersona?.id
  );

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-800 bg-black">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
                {view === "chat" && selectedPersona
                  ? `Chat with ${selectedPersona.name}`
                  : view === "conversations" && selectedPersona
                  ? selectedPersona.name
                  : "GLM 5 Chat"}
              </h1>
              <p className="text-sm text-zinc-500">
                {view === "personas"
                  ? "Select or create a persona"
                  : view === "conversations"
                  ? "Select or start a conversation"
                  : "Powered by puter.js"}
              </p>
            </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No personas yet</h3>
                  <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                    Create a persona to define the character you want to chat with. Each persona has its own personality and conversation history.
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
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

          {/* Conversations View */}
          {view === "conversations" && selectedPersona && (
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

              {personaConversations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No conversations yet</h3>
                  <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                    Start a new conversation with {selectedPersona.name} to begin chatting.
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
                  {personaConversations
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 cursor-pointer" onClick={() => continueConversation(conversation)}>
                            <p className="text-white font-medium">
                              {conversation.messages.length > 0
                                ? conversation.messages[0].content.slice(0, 50) + (conversation.messages[0].content.length > 50 ? "..." : "")
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
                      {selectedPersona?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Chat with {selectedPersona?.name}
                  </h2>
                  <p className="text-zinc-500 max-w-md">
                    {selectedPersona?.description}
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
                            {selectedPersona?.name.charAt(0).toUpperCase()}
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">
                          {selectedPersona?.name.charAt(0).toUpperCase()}
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
                placeholder={`Message ${selectedPersona?.name}...`}
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
                  Character Name
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="e.g., Sherlock Holmes"
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
                  placeholder="Describe the character's personality, background, and how they should behave..."
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
    </div>
  );
}
