"use client";

import { useEffect } from "react";
import { addLog } from "@/lib/debugLogger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    addLog("error", [
      `React error boundary: ${error.message}`,
      error.stack || "",
      error.digest ? `digest: ${error.digest}` : "",
    ]);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-400 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
