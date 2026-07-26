"use client";

import { useEffect } from "react";
import { addLog } from "@/lib/debugLogger";

export default function DebugInitializer() {
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: unknown[]) => {
      originalLog.apply(console, args);
      addLog("log", args);
    };
    console.warn = (...args: unknown[]) => {
      originalWarn.apply(console, args);
      addLog("warn", args);
    };
    console.error = (...args: unknown[]) => {
      originalError.apply(console, args);
      addLog("error", args);
    };

    const handleError = (event: ErrorEvent) => {
      addLog("error", [
        `Uncaught error: ${event.message}`,
        `at ${event.filename}:${event.lineno}:${event.colno}`,
        event.error ? String(event.error) : "",
      ]);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? `${event.reason.name}: ${event.reason.message}\n${event.reason.stack || ""}`
          : String(event.reason);
      addLog("error", [`Unhandled rejection: ${reason}`]);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
