export function extractErrorMessage(value: unknown): string {
  if (!value) return "An unknown error occurred.";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
    return "An unknown error occurred.";
  }

  if (value instanceof Error) {
    const message = value.message.trim();
    if (message) return message;
    return "An unknown error occurred.";
  }

  if (Array.isArray(value)) {
    const flattened = value.map((item) => extractErrorMessage(item)).filter(Boolean).join(" ");
    if (flattened.trim()) return flattened.trim();
    return "An unknown error occurred.";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    const nested = record.error || record.message || record.detail || record.description;
    const extracted = extractErrorMessage(nested);
    if (extracted && extracted !== "An unknown error occurred.") {
      return extracted;
    }

    try {
      const json = JSON.stringify(record);
      if (json && json !== "{}") return json;
    } catch {
      // ignore JSON stringify errors
    }
  }

  return "An unknown error occurred.";
}
