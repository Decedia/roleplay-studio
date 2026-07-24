export interface MacroContext {
  personaName: string;
  characterName: string;
  personaDescription?: string;
  characterDescription?: string;
  scenario?: string;
  firstMessage?: string;
  mesExample?: string;
  creatorNotes?: string;
  tags?: string[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  contextWindow?: number;
  provider?: string;
  currentDateTime?: Date;
  messageCount?: number;
}

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const replaceMacros = (content: string, context: MacroContext): string => {
  if (!content) return content;

  const dt = context.currentDateTime ?? new Date();
  const dateStr = dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const timeStr = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const datetimeStr = `${dateStr} ${timeStr}`;

  let result = content;

  result = result.replace(/\{\{user\}\}/gi, escapeHtml(context.personaName));
  result = result.replace(/\{\{char\}\}/gi, escapeHtml(context.characterName));
  result = result.replace(/\{\{user_description\}\}/gi, escapeHtml(context.personaDescription ?? ""));
  result = result.replace(/\{\{char_description\}\}/gi, escapeHtml(context.characterDescription ?? ""));
  result = result.replace(/\{\{scenario\}\}/gi, escapeHtml(context.scenario ?? ""));
  result = result.replace(/\{\{first_message\}\}/gi, escapeHtml(context.firstMessage ?? ""));
  result = result.replace(/\{\{mes_example\}\}/gi, escapeHtml(context.mesExample ?? ""));
  result = result.replace(/\{\{creator_notes\}\}/gi, escapeHtml(context.creatorNotes ?? ""));
  result = result.replace(/\{\{tags\}\}/gi, escapeHtml((context.tags ?? []).join(", ")));
  result = result.replace(/\{\{model\}\}/gi, escapeHtml(context.model ?? ""));
  result = result.replace(/\{\{max_tokens\}\}/gi, typeof context.maxTokens === "number" ? String(context.maxTokens) : "");
  result = result.replace(/\{\{temperature\}\}/gi, typeof context.temperature === "number" ? String(context.temperature) : "");
  result = result.replace(/\{\{context_window\}\}/gi, typeof context.contextWindow === "number" ? String(context.contextWindow) : "");
  result = result.replace(/\{\{provider\}\}/gi, escapeHtml(context.provider ?? ""));
  result = result.replace(/\{\{datetime\}\}/gi, escapeHtml(datetimeStr));
  result = result.replace(/\{\{date\}\}/gi, escapeHtml(dateStr));
  result = result.replace(/\{\{time\}\}/gi, escapeHtml(timeStr));
  result = result.replace(/\{\{message_count\}\}/gi, typeof context.messageCount === "number" ? String(context.messageCount) : "");

  return result;
};

export const replaceMacrosSimple = (content: string, personaName: string, characterName: string): string => {
  return replaceMacros(content, { personaName, characterName });
};

export const providerSupportsImageGeneration = (provider: string): boolean => {
  return ["google-ai-studio", "google-vertex"].includes(provider);
};
