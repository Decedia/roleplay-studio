import type { FetchedModel, Message } from "./types";

/**
 * AI Horde text generation, run from the browser.
 *
 * Horde jobs can wait in a queue for minutes, longer than a Vercel function
 * may run, so the browser does the waiting: it submits through
 * /api/kobold-horde, then polls the job's status through the same route.
 *
 * Every worker has its own limits (max_length, max_context_length). A request
 * asking for more than a worker allows is never picked up, so we read the
 * worker list and only ask for what the chosen workers can do.
 */

/** Horde's hard cap on generated tokens per request. */
export const HORDE_MAX_LENGTH = 1024;
const HORDE_MIN_LENGTH = 16;
const POLL_MS = 3000;
const MAX_WAIT_MS = 10 * 60 * 1000;
const WORKER_CACHE_MS = 60 * 1000;

export interface HordeWorker {
  id: string;
  name: string;
  models: string[];
  max_length: number;
  max_context_length: number;
  online?: boolean;
  maintenance_mode?: boolean;
  trusted?: boolean;
}

let workerCache: { at: number; workers: HordeWorker[] } | null = null;

/** Online text workers, cached for a minute. */
export async function fetchHordeWorkers(force = false): Promise<HordeWorker[]> {
  if (!force && workerCache && Date.now() - workerCache.at < WORKER_CACHE_MS) return workerCache.workers;
  const data = await callRoute({ action: "workers" });
  const workers: HordeWorker[] = (Array.isArray(data) ? data : []).filter(
    (w: HordeWorker) => w && w.online !== false && !w.maintenance_mode && Array.isArray(w.models)
  );
  workerCache = { at: Date.now(), workers };
  return workers;
}

/** One model entry per model that at least one online worker serves, with the best limits on offer. */
export function hordeModelsFromWorkers(workers: HordeWorker[]): FetchedModel[] {
  const byModel = new Map<string, { count: number; context: number; length: number }>();
  for (const w of workers) {
    for (const name of w.models) {
      const entry = byModel.get(name) || { count: 0, context: 0, length: 0 };
      entry.count += 1;
      entry.context = Math.max(entry.context, w.max_context_length || 0);
      entry.length = Math.max(entry.length, w.max_length || 0);
      byModel.set(name, entry);
    }
  }
  return [...byModel.entries()].map(([name, e]) => ({
    id: name,
    provider: "kobold-horde",
    name: `${name.replace(/^[^/]+\//, "")} (${e.count} worker${e.count === 1 ? "" : "s"})`,
    workerCount: e.count,
    context: e.context || undefined,
    max_tokens: Math.min(e.length || HORDE_MAX_LENGTH, HORDE_MAX_LENGTH),
  }));
}

export interface HordePlan {
  workers: string[];
  maxContext: number;
  maxLength: number;
}

/**
 * Chooses the workers for a request and the limits to ask for.
 * Context matters most for roleplay, so we take the second-largest context
 * among the model's workers: close to the best, but still open to more than
 * one worker when there are several, so the queue moves faster.
 */
export function planHordeRequest(workers: HordeWorker[], model: string, wantedLength: number): HordePlan | null {
  const serving = workers.filter((w) => w.models.includes(model));
  if (serving.length === 0) return null;
  const contexts = serving.map((w) => w.max_context_length || 0).sort((a, b) => b - a);
  const maxContext = contexts[Math.min(1, contexts.length - 1)];
  const withContext = serving.filter((w) => (w.max_context_length || 0) >= maxContext);
  // Ask for no more than every one of those workers can write, so none is left out.
  const sharedLength = Math.min(...withContext.map((w) => w.max_length || HORDE_MAX_LENGTH));
  const maxLength = Math.max(HORDE_MIN_LENGTH, Math.min(wantedLength || HORDE_MAX_LENGTH, sharedLength, HORDE_MAX_LENGTH));
  const chosen = withContext.filter((w) => (w.max_length || 0) >= maxLength);
  return { workers: chosen.map((w) => w.id), maxContext, maxLength };
}

/** Rough token count (about 3.5 characters per token for English text). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/**
 * Builds the text prompt and drops the oldest chat messages until it fits
 * the context left after the reply. System text is always kept.
 */
export function buildHordePrompt(messages: Message[], systemPrompt: string | undefined, budget: number): { prompt: string; dropped: number } {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n") || systemPrompt || "";
  const turns = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}\n\n`);
  const head = system ? `${system}\n\n` : "";
  const tail = "Assistant: ";
  let used = estimateTokens(head + tail);
  const kept: string[] = [];
  for (let i = turns.length - 1; i >= 0; i--) {
    const cost = estimateTokens(turns[i]);
    // Always keep the latest message, even if it alone is over budget.
    if (kept.length > 0 && used + cost > budget) break;
    kept.unshift(turns[i]);
    used += cost;
  }
  return { prompt: head + kept.join("") + tail, dropped: turns.length - kept.length };
}

async function callRoute(body: Record<string, unknown>, signal?: AbortSignal): Promise<any> {
  const response = await fetch("/api/kobold-horde", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // Keep the empty object; the status below explains the failure.
  }
  if (!response.ok || data?.error) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

export interface HordeRunOptions {
  apiKey: string;
  model: string;
  messages: Message[];
  systemPrompt?: string;
  maxTokens: number;
  params: Record<string, unknown>;
  signal?: AbortSignal;
  /** Called with a short line while the job waits, e.g. "In Horde queue: 3rd". */
  onWaiting?: (status: string) => void;
}

/** Runs one Horde text job and returns the generated text. */
export async function runHordeJob(options: HordeRunOptions): Promise<string> {
  const { apiKey, model, signal, onWaiting } = options;
  let workers: HordeWorker[];
  try {
    workers = await fetchHordeWorkers();
  } catch {
    workers = [];
  }
  let plan = planHordeRequest(workers, model, options.maxTokens);
  if (!plan && workers.length > 0) {
    // The cached list may be a minute old; check once more before giving up.
    plan = planHordeRequest(await fetchHordeWorkers(true), model, options.maxTokens);
  }
  if (workers.length > 0 && (!plan || plan.workers.length === 0)) {
    throw new Error(`No AI Horde worker is serving ${model} right now. Reconnect AI Horde to refresh the model list, then pick another model.`);
  }
  const maxContext = plan?.maxContext || 2048;
  const maxLength = plan?.maxLength || Math.min(options.maxTokens || 512, 512);
  const { prompt } = buildHordePrompt(options.messages, options.systemPrompt, maxContext - maxLength);

  const { id } = await callRoute(
    {
      action: "submit",
      apiKey,
      payload: {
        prompt,
        params: { ...options.params, n: 1, max_context_length: maxContext, max_length: maxLength },
        models: [model],
        workers: plan?.workers.length ? plan.workers : undefined,
      },
    },
    signal
  );
  if (!id) throw new Error("AI Horde didn't return a job id");

  const cancel = () => {
    callRoute({ action: "cancel", apiKey, id }).catch(() => {});
  };
  signal?.addEventListener("abort", cancel, { once: true });

  try {
    const started = Date.now();
    while (Date.now() - started < MAX_WAIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      let status: Record<string, any>;
      try {
        status = await callRoute({ action: "status", apiKey, id }, signal);
      } catch (error) {
        if (signal?.aborted) throw error;
        continue; // A failed poll is retried on the next tick.
      }
      if (status.faulted) throw new Error("An AI Horde worker failed on this job. Try again.");
      if (status.is_possible === false) {
        cancel();
        throw new Error("No AI Horde worker can run this request right now. Try another model.");
      }
      if (status.done) {
        const text = status.generations?.[0]?.text;
        if (typeof text !== "string") throw new Error("AI Horde finished without a reply");
        return text;
      }
      if (onWaiting) {
        const wait = status.wait_time ? `, about ${status.wait_time}s` : "";
        onWaiting(
          status.processing > 0
            ? "A Horde worker is writing the reply"
            : `Waiting in the AI Horde queue (position ${status.queue_position ?? "?"}${wait})`
        );
      }
    }
    cancel();
    throw new Error("AI Horde took longer than 10 minutes. Try a model with more workers.");
  } finally {
    signal?.removeEventListener("abort", cancel);
  }
}
