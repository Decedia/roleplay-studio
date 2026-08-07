"use client";

import * as React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeConfig {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

interface UtilitiesMenuProps {
  themeConfig?: ThemeConfig;
  children?: React.ReactNode;
}

export function UtilitiesMenu({ themeConfig, children }: UtilitiesMenuProps) {
  const defaultTheme = useTheme();
  const { theme, setTheme } = defaultTheme;
  const resolvedTheme = defaultTheme.resolvedTheme || "system";

  const currentMode = themeConfig?.mode || (theme as ThemeMode) || "system";
  const handleSetMode = themeConfig?.setMode || setTheme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9">
          Utilities
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleSetMode("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
          {currentMode === "light" && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetMode("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {currentMode === "dark" && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSetMode("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
          {currentMode === "system" && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
        </DropdownMenuItem>

        {children && (
          <>
            <DropdownMenuSeparator />
            {children}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
