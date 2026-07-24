// Simple Character Card import utilities
// Only extracts: name, description, firstMessage, scenario

import { Character, Message, GlobalInstructions, CharacterBook } from "./types";
import { replaceMacrosSimple } from "@/components/chat/utils/macroUtils";

// Generate a unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Parse character card JSON (simplified - only extracts basic fields)
export const parseSillyTavernCard = (json: unknown): Character | null => {
  try {
    const card = json as Record<string, unknown>;

    // Handle V2 format (has data field)
    if (card.spec === "chara_card_v2" && card.data) {
      const data = card.data as Record<string, unknown>;
      return {
        id: generateId(),
        name: typeof data.name === "string" ? data.name : "Unknown Character",
        description: typeof data.description === "string" ? data.description : "",
        firstMessage: typeof data.first_mes === "string" ? data.first_mes : "Hello!",
        scenario: typeof data.scenario === "string" ? data.scenario : undefined,
        systemPrompt: typeof data.system_prompt === "string" ? data.system_prompt : undefined,
        postHistoryInstructions: typeof data.post_history_instructions === "string" ? data.post_history_instructions : undefined,
        mesExample: typeof data.mes_example === "string" ? data.mes_example : undefined,
        alternateGreetings: Array.isArray(data.alternate_greetings) ? data.alternate_greetings.filter((g): g is string => typeof g === "string") : undefined,
        createdAt: Date.now(),
      };
    }

    // Handle V1 format (flat structure)
    if (typeof card.name === "string") {
      return {
        id: generateId(),
        name: card.name,
        description: typeof card.description === "string" ? card.description : "",
        firstMessage: typeof card.first_mes === "string" ? card.first_mes : "Hello!",
        scenario: typeof card.scenario === "string" ? card.scenario : undefined,
        systemPrompt: typeof card.system_prompt === "string" ? card.system_prompt : undefined,
        postHistoryInstructions: typeof card.post_history_instructions === "string" ? card.post_history_instructions : undefined,
        mesExample: typeof card.mes_example === "string" ? card.mes_example : undefined,
        alternateGreetings: Array.isArray(card.alternate_greetings) ? card.alternate_greetings.filter((g): g is string => typeof g === "string") : undefined,
        createdAt: Date.now(),
      };
    }

    return null;
  } catch {
    return null;
  }
};

// Validate if JSON is a valid character card
export const isValidSillyTavernCard = (json: unknown): boolean => {
  if (!json || typeof json !== "object") return false;

  const card = json as Record<string, unknown>;

  // V2 format check
  if (card.spec === "chara_card_v2" && card.data) {
    const data = card.data as Record<string, unknown>;
    return typeof data.name === "string";
  }

  // V1 format check
  return typeof card.name === "string";
};

// Read and parse JSON file
export const readCharacterFile = async (
  file: File
): Promise<Character | { error: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);

        if (!isValidSillyTavernCard(json)) {
          resolve({ error: "Invalid character card format. Expected a JSON with 'name' field." });
          return;
        }

        const character = parseSillyTavernCard(json);
        if (character) {
          resolve(character);
        } else {
          resolve({ error: "Failed to parse character card" });
        }
      } catch {
        resolve({ error: "Invalid JSON file" });
      }
    };

    reader.onerror = () => {
      resolve({ error: "Failed to read file" });
    };

    reader.readAsText(file);
  });
};

// Convert Character to simple format for export
export const exportToSillyTavern = (character: Character): string => {
  const card = {
    name: character.name,
    description: character.description,
    first_mes: character.firstMessage,
    scenario: character.scenario,
  };

  return JSON.stringify(card, null, 2);
};

// Build system prompt from character
// Follows guideline: [Formatting] [Context] [Main instructions] [Negative constraints at end]
export const buildCharacterSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  globalInstructions?: GlobalInstructions
): string => {
  const formattingSections: string[] = [];
  const contextSections: string[] = [];
  const instructionSections: string[] = [];
  const constraintSections: string[] = [];

  // === INSTRUCTION LIST (SillyTavern-style) ===
  
  // Process instruction list if available
  if (globalInstructions?.instructions && globalInstructions.instructions.length > 0) {
    const enabledInstructions = globalInstructions.instructions.filter(inst => inst.enabled);
    
    for (const instruction of enabledInstructions) {
      if (instruction.position === "before_context") {
        formattingSections.push(instruction.content);
      } else {
        // after_context instructions
        if (instruction.role === "system") {
          instructionSections.push(instruction.content);
        } else if (instruction.role === "user") {
          constraintSections.push(instruction.content);
        }
        // assistant role is not added as it's used differently
      }
    }
  }

  // === CONTEXT AND SOURCE MATERIAL ===

  // Character description
  if (character.description) {
    contextSections.push(`[Character Description]\n${character.description}`);
  }
  
  // Scenario
  if (character.scenario) {
    contextSections.push(`[Scenario]\n${character.scenario}`);
  }
  
  // User persona info
  contextSections.push(`[User]\nThe user is roleplaying as ${personaName}.${personaDescription ? ` ${personaDescription}` : ""}`);
  
  // Example messages (dialogue examples)
  if (character.mesExample) {
    const exampleText = replaceMacrosSimple(character.mesExample, personaName, character.name);
    contextSections.push(`[Example Dialogue]\n${exampleText}`);
  }
  
  // === MAIN TASK INSTRUCTIONS ===
  
  // Main system prompt - use character override or default
  if (character.systemPrompt) {
    instructionSections.push(character.systemPrompt);
  } else {
    instructionSections.push(`You are ${character.name}.`);
  }
  
  // Post-history instructions from character
  if (character.postHistoryInstructions) {
    instructionSections.push(`[Instructions]\n${character.postHistoryInstructions}`);
  }
  
  // === NEGATIVE AND FORMATTING CONSTRAINTS (at the end) ===
  
  // Final instruction - core constraint at the very end
  constraintSections.push("Stay in character at all times. Respond naturally and engage with the roleplay scenario. Do not break character or acknowledge that you are an AI.");
  
  // Combine: Formatting -> Context -> Instructions -> Constraints
  return [...formattingSections, ...contextSections, ...instructionSections, ...constraintSections].join("\n\n");
};

// Scan messages for lorebook keyword matches
const scanForLorebookEntries = (
  messages: Message[],
  characterBook: CharacterBook | undefined,
  personaName: string,
  characterName: string
): string[] => {
  if (!characterBook?.entries?.length) return [];
  
  const scanDepth = characterBook.scanDepth || 2;
  const messagesToScan = messages.slice(-scanDepth);
  
  // Combine message content for scanning
  const recentText = replaceMacrosSimple(messagesToScan.map(m => m.content).join(" "), personaName, characterName).toLowerCase();
  
  const matchedContents: string[] = [];
  
  for (const entry of characterBook.entries) {
    if (!entry.enabled) continue;
    
    // Constant entries are always included
    if (entry.constant) {
      const content = replaceMacrosSimple(entry.content, personaName, characterName);
      matchedContents.push(content);
      continue;
    }
    
    // Check for keyword matches
    const keys = entry.keys || [];
    const secondaryKeys = entry.secondaryKeys || [];
    
    let primaryMatch = false;
    let secondaryMatch = false;
    
    // Check primary keys
    for (const key of keys) {
      const searchKey = entry.caseSensitive ? key : key.toLowerCase();
      const searchText = entry.caseSensitive ? recentText : recentText.toLowerCase();
      if (searchText.includes(searchKey)) {
        primaryMatch = true;
        break;
      }
    }
    
    // Check secondary keys if primary matched
    if (primaryMatch && secondaryKeys.length > 0) {
      for (const key of secondaryKeys) {
        const searchKey = entry.caseSensitive ? key : key.toLowerCase();
        const searchText = entry.caseSensitive ? recentText : recentText.toLowerCase();
        if (searchText.includes(searchKey)) {
          secondaryMatch = true;
          break;
        }
      }
      // If secondary keys exist but none matched, skip this entry
      if (!secondaryMatch) continue;
    }
    
    if (primaryMatch) {
      const content = replaceMacrosSimple(entry.content, personaName, characterName);
      matchedContents.push(content);
    }
  }
  
  // Sort by insertion order
  matchedContents.sort((a, b) => {
    // We can't access insertionOrder from here, but entries are already sorted
    return 0;
  });
  
  return matchedContents;
};

// Build full system prompt with lorebook support
// Follows guideline: [Formatting] [Context] [Main instructions] [Negative constraints at end]
// Always returns an object with systemPrompt string, characterContext, and separate before/after instructions
export const buildFullSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  messages: Message[],
  globalInstructions?: GlobalInstructions,
  summaryMemory?: string
): {
  systemPrompt: string;
  characterContext: Message;
  beforeContextInstructions: Message[];
  afterContextInstructions: Message[];
  inlineInstructions: Array<{ message: Message; index: number }>;
} => {
  const formattingSections: string[] = [];
  const contextSections: string[] = [];
  const instructionSections: string[] = [];
  const constraintSections: string[] = [];

  // === PROCESS INSTRUCTION LIST (SillyTavern-style) ===
  
  const beforeContextInstructions: Message[] = [];
  const afterContextInstructions: Message[] = [];
  const inlineInstructions: Array<{ message: Message; index: number }> = [];
  
  if (globalInstructions?.instructions && globalInstructions.instructions.length > 0) {
    // Sort instructions by position and order
    const sortedInstructions = [...globalInstructions.instructions]
      .filter(inst => inst.enabled)
      .sort((a, b) => {
        if (a.position !== b.position) {
          return a.position === "before_context" ? -1 : 1;
        }
        return a.order - b.order;
      });
    
    for (const instruction of sortedInstructions) {
      const msg: Message = {
        role: instruction.role,
        content: instruction.content,
      };

      if (instruction.position === "before_context") {
        beforeContextInstructions.push(msg);
      } else if (instruction.position === "after_context") {
        afterContextInstructions.push(msg);
      } else if (instruction.position === "inline_with_message") {
        // For inline positioning, use the inlineIndex (default to 0 if not set)
        const index = instruction.inlineIndex ?? 0;
        inlineInstructions.push({ message: msg, index });
      }
    }
  }

  // Keep character system prompt separate from instruction messages
  // (will be created after context is built)

  // === CONTEXT AND SOURCE MATERIAL ===

  // Character description
  if (character.description) {
    contextSections.push(`[Character Description]\n${character.description}`);
  }
  
  // Scenario
  if (character.scenario) {
    contextSections.push(`[Scenario]\n${character.scenario}`);
  }
  
  // User persona info
  contextSections.push(`[User]\nThe user is roleplaying as ${personaName}.${personaDescription ? ` ${personaDescription}` : ""}`);
  
  // Example messages (dialogue examples)
  if (character.mesExample) {
    const exampleText = replaceMacrosSimple(character.mesExample, personaName, character.name);
    contextSections.push(`[Example Dialogue]\n${exampleText}`);
  }
  
  // Lorebook content (world knowledge) - part of context
  if (character.characterBook) {
    const lorebookContent = scanForLorebookEntries(
      messages,
      character.characterBook,
      personaName,
      character.name
    );
    
    if (lorebookContent.length > 0) {
      contextSections.push(`[World Knowledge]\n${lorebookContent.join("\n\n")}`);
    }
  }
  
  // === MAIN TASK INSTRUCTIONS ===
  
  // Main system prompt - use character override or default
  if (character.systemPrompt) {
    instructionSections.push(character.systemPrompt);
  } else {
    instructionSections.push(`You are ${character.name}.`);
  }
  
  // Post-history instructions from character
  if (character.postHistoryInstructions) {
    instructionSections.push(`[Instructions]\n${character.postHistoryInstructions}`);
  }
  
  // === NEGATIVE AND FORMATTING CONSTRAINTS (at the end) ===
  
  // Formatting instructions - ensures proper paragraph breaks and readability
  constraintSections.push("Format your responses with proper paragraph breaks, line spacing, and natural dialogue structure. Use separate paragraphs for different ideas, actions, and speech. Avoid walls of text.");
  
  // Final instruction - core constraint at the very end
  constraintSections.push("Stay in character at all times. Respond naturally and engage with the roleplay scenario. Do not break character or acknowledge that you are an AI.");
  
  // Combine: Formatting -> Context -> Instructions -> Constraints
  const basePrompt = [...formattingSections, ...contextSections, ...instructionSections, ...constraintSections].join("\n\n");
  
  // Prepend summary memory if available
  const systemPromptContent = summaryMemory
    ? `[Conversation Summary]\n${summaryMemory}\n\n${basePrompt}`
    : basePrompt;
  
  // Create system message
  const systemMessage: Message = {
    role: "system",
    content: systemPromptContent,
  };
  
  // Always return object with character context and separate before/after instructions
  return {
    systemPrompt: systemPromptContent,
    characterContext: systemMessage,
    beforeContextInstructions,
    afterContextInstructions,
    inlineInstructions,
  };
};
