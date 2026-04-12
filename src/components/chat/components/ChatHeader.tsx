"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, List, Plus } from "lucide-react";

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
    <div className="flex justify-between items-center gap-2 py-2 px-1 h-14 border-b border-border">
      <div className="flex items-center gap-2">
        {showBack && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">{title}</h2>
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="ml-2 h-8">
          <List className="w-4 h-4 mr-1.5" />
          Sessions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem onClick={onNewSession} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {sessions.length > 0 && (
          sessions
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((session) => (
              <DropdownMenuItem
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`cursor-pointer flex-col items-start ${
                  currentSessionId === session.id ? 'bg-accent' : ''
                }`}
              >
                <span className="text-sm font-medium">
                  Session ({(session.messages as unknown[]).length} msgs)
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </span>
              </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
