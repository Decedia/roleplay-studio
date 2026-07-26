"use client";

import * as React from "react";

interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={[
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
        disabled ? "cursor-not-allowed opacity-50" : "",
        checked ? "bg-blue-600" : "bg-zinc-700",
        "w-11 h-6 sm:w-12 sm:h-7",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          checked ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5",
          "w-4 h-4 sm:w-5 sm:h-5",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </button>
  );
}
