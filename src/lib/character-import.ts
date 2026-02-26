// Simple Character Card import utilities
// Only extracts: name, description, firstMessage, scenario

import { Character, Message, GlobalInstructions, CharacterBook } from "./types";

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
// Follows guideline: [Context] [Main instructions] [Negative constraints at end]
export const buildCharacterSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  globalInstructions?: GlobalInstructions
): string => {
  const contextSections: string[] = [];
  const instructionSections: string[] = [];
  const constraintSections: string[] = [];
  
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
    const exampleText = character.mesExample
      .replace(/\{\{char\}\}/gi, character.name)
      .replace(/\{\{user\}\}/gi, personaName);
    contextSections.push(`[Example Dialogue]\n${exampleText}`);
  }
  
  // === MAIN TASK INSTRUCTIONS ===
  
  // Main system prompt - priority: global override > character override > default
  if (globalInstructions?.systemPrompt) {
    instructionSections.push(globalInstructions.systemPrompt);
  } else if (character.systemPrompt) {
    instructionSections.push(character.systemPrompt);
  } else {
    instructionSections.push(`You are ${character.name}.`);
  }
  
  // Post-history instructions - priority: global > character
  if (globalInstructions?.postHistoryInstructions) {
    instructionSections.push(`[Instructions]\n${globalInstructions.postHistoryInstructions}`);
  } else if (character.postHistoryInstructions) {
    instructionSections.push(`[Instructions]\n${character.postHistoryInstructions}`);
  }
  
  // Custom instructions
  if (globalInstructions?.customInstructions) {
    instructionSections.push(`[Additional Instructions]\n${globalInstructions.customInstructions}`);
  }
  
  // === NEGATIVE AND FORMATTING CONSTRAINTS (at the end) ===
  
  // Jailbreak instructions (if enabled) - placed near end as it's a constraint
  if (globalInstructions?.enableJailbreak && globalInstructions.jailbreakInstructions) {
    constraintSections.push(globalInstructions.jailbreakInstructions);
  }
  
  // Final instruction - core constraint at the very end
  constraintSections.push("Stay in character at all times. Respond naturally and engage with the roleplay scenario. Do not break character or acknowledge that you are an AI.");
  
  // Combine: Context -> Instructions -> Constraints
  return [...contextSections, ...instructionSections, ...constraintSections].join("\n\n");
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
  const recentText = messagesToScan
    .map(m => m.content)
    .join(" ")
    .replace(/\{\{char\}\}/gi, characterName)
    .replace(/\{\{user\}\}/gi, personaName)
    .toLowerCase();
  
  const matchedContents: string[] = [];
  
  for (const entry of characterBook.entries) {
    if (!entry.enabled) continue;
    
    // Constant entries are always included
    if (entry.constant) {
      const content = entry.content
        .replace(/\{\{char\}\}/gi, characterName)
        .replace(/\{\{user\}\}/gi, personaName);
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
      const content = entry.content
        .replace(/\{\{char\}\}/gi, characterName)
        .replace(/\{\{user\}\}/gi, personaName);
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
// Follows guideline: [Context] [Main instructions] [Negative constraints at end]
export const buildFullSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  messages: Message[],
  globalInstructions?: GlobalInstructions
): string => {
  const contextSections: string[] = [];
  const instructionSections: string[] = [];
  const constraintSections: string[] = [];
  
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
    const exampleText = character.mesExample
      .replace(/\{\{char\}\}/gi, character.name)
      .replace(/\{\{user\}\}/gi, personaName);
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
  
  // Main system prompt - priority: global override > character override > default
  if (globalInstructions?.systemPrompt) {
    instructionSections.push(globalInstructions.systemPrompt);
  } else if (character.systemPrompt) {
    instructionSections.push(character.systemPrompt);
  } else {
    instructionSections.push(`You are ${character.name}.`);
  }
  
  // Post-history instructions - priority: global > character
  if (globalInstructions?.postHistoryInstructions) {
    instructionSections.push(`[Instructions]\n${globalInstructions.postHistoryInstructions}`);
  } else if (character.postHistoryInstructions) {
    instructionSections.push(`[Instructions]\n${character.postHistoryInstructions}`);
  }
  
  // Custom instructions
  if (globalInstructions?.customInstructions) {
    instructionSections.push(`[Additional Instructions]\n${globalInstructions.customInstructions}`);
  }
  
  // === NEGATIVE AND FORMATTING CONSTRAINTS (at the end) ===
  
  // Jailbreak instructions (if enabled) - placed near end as it's a constraint
  if (globalInstructions?.enableJailbreak && globalInstructions.jailbreakInstructions) {
    constraintSections.push(globalInstructions.jailbreakInstructions);
  }
  
  // Final instruction - core constraint at the very end
  constraintSections.push("Stay in character at all times. Respond naturally and engage with the roleplay scenario. Do not break character or acknowledge that you are an AI.");
  
  // Combine: Context -> Instructions -> Constraints
  return [...contextSections, ...instructionSections, ...constraintSections].join("\n\n");
};
