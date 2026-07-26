const STORAGE_KEY = "chat_debug_logs";
const MAX_ENTRIES = 500;

export interface LogEntry {
  timestamp: number;
  level: "log" | "warn" | "error";
  args: string[];
}

function loadLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: LogEntry[]) {
  try {
    const trimmed = logs.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}

function serializeArg(arg: unknown): string {
  try {
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message}\n${arg.stack || ""}`;
    }
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  } catch {
    return String(arg);
  }
}

export function addLog(level: LogEntry["level"], args: unknown[]) {
  const logs = loadLogs();
  logs.push({
    timestamp: Date.now(),
    level,
    args: args.map(serializeArg),
  });
  saveLogs(logs);
}

export function getLogs(): LogEntry[] {
  return loadLogs();
}

export function clearLogs() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportLogs(): string {
  const logs = loadLogs();
  return logs
    .map((l) => {
      const date = new Date(l.timestamp).toISOString();
      const level = l.level.toUpperCase().padEnd(5);
      return `[${date}] ${level} ${l.args.join(" ")}`;
    })
    .join("\n");
}
