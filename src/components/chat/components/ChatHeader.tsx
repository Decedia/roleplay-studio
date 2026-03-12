"use client";

import React from "react";

interface ChatHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  accentColor?: "purple" | "amber" | "blue";
  children?: React.ReactNode;
}

export function ChatHeader({ 
  title, 
  onBack, 
  showBack = true,
  accentColor = "blue",
  children 
}: ChatHeaderProps) {
  const accentClasses = {
    purple: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    amber: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    blue: "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
  };

  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Back"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>
      
      {children}
    </div>
  );
}

// Sessions dropdown component
interface SessionsDropdownProps {
  sessions: Array<{ id: string; updatedAt: number; messages: unknown[] }>;
  currentSessionId?: string;
  onSelectSession: (session: { id: string; updatedAt: number; messages: unknown[] }) => void;
  onNewSession: () => void;
  accentColor?: "purple" | "amber";
}

export function SessionsDropdown({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  accentColor = "purple"
}: SessionsDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const bgClass = accentColor === "purple" ? "bg-purple-600 hover:bg-purple-700" : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`ml-2 px-3 py-1.5 ${bgClass} text-white rounded-lg transition-colors text-sm flex items-center gap-1`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Sessions
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                onNewSession();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 ${bgClass} text-white rounded-lg transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Session
            </button>
          </div>
          
          {sessions.length > 0 && (
            <div className="border-t border-zinc-800">
              {sessions
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-zinc-800 transition-colors ${
                      currentSessionId === session.id ? 'bg-zinc-800' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        Session ({(session.messages as unknown[]).length} msgs)
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
