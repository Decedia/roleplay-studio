// SillyTavern Character Card import utilities

import { Character, SillyTavernCharacterCard, CharacterBook, CharacterBookEntry, Message } from "./types";

// Generate a unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Parse character book from SillyTavern format
const parseCharacterBook = (book: unknown): CharacterBook | undefined => {
  if (!book || typeof book !== "object") return undefined;
  
  const b = book as Record<string, unknown>;
  const entries = Array.isArray(b.entries) ? b.entries : [];
  
  return {
    entries: entries.map((entry: unknown, index: number): CharacterBookEntry => {
      const e = (entry || {}) as Record<string, unknown>;
      return {
        id: typeof e.id === "number" ? e.id : index,
        keys: Array.isArray(e.keys) ? e.keys.map(String) : [],
        secondaryKeys: Array.isArray(e.secondary_keys) ? e.secondary_keys.map(String) : undefined,
        content: typeof e.content === "string" ? e.content : "",
        enabled: typeof e.enabled === "boolean" ? e.enabled : true,
        insertionOrder: typeof e.insertion_order === "number" ? e.insertion_order : 100,
        caseSensitive: typeof e.case_sensitive === "boolean" ? e.case_sensitive : false,
        name: typeof e.name === "string" ? e.name : undefined,
        priority: typeof e.priority === "number" ? e.priority : undefined,
        position: typeof e.position === "string" ? e.position as CharacterBookEntry["position"] : undefined,
        constant: typeof e.constant === "boolean" ? e.constant : false,
        depth: typeof e.depth === "number" ? e.depth : undefined,
        comment: typeof e.comment === "string" ? e.comment : undefined,
      };
    }),
    scanDepth: typeof b.scan_depth === "number" ? b.scan_depth : 2,
    tokenBudget: typeof b.token_budget === "number" ? b.token_budget : 2048,
    recursiveScanning: typeof b.recursive_scanning === "boolean" ? b.recursive_scanning : false,
  };
};

// Parse SillyTavern character card JSON
export const parseSillyTavernCard = (json: unknown): Character | null => {
  try {
    const card = json as SillyTavernCharacterCard;

    // Handle V2 format (has data field)
    if (card.spec === "chara_card_v2" && card.data) {
      return {
        id: generateId(),
        name: card.data.name || "Unknown Character",
        description: card.data.description || "",
        firstMessage: card.data.first_mes || "Hello!",
        mesExample: card.data.mes_example,
        scenario: card.data.scenario,
        creatorNotes: card.data.creator_notes,
        tags: card.data.tags,
        avatar: card.data.avatar,
        // Instruction fields
        systemPrompt: card.data.system_prompt,
        postHistoryInstructions: card.data.post_history_instructions,
        characterBook: parseCharacterBook(card.data.character_book),
        alternateGreetings: card.data.alternate_greetings,
        createdAt: Date.now(),
      };
    }

    // Handle V1 format (flat structure)
    if (card.name) {
      return {
        id: generateId(),
        name: card.name,
        description: card.description || "",
        firstMessage: card.first_mes || "Hello!",
        mesExample: card.mes_example,
        scenario: card.scenario,
        creatorNotes: card.creator_notes,
        tags: card.tags,
        avatar: card.avatar,
        // Instruction fields (V2 fields may be present in V1 cards too)
        systemPrompt: card.system_prompt,
        postHistoryInstructions: card.post_history_instructions,
        characterBook: parseCharacterBook(card.character_book),
        alternateGreetings: card.alternate_greetings,
        createdAt: Date.now(),
      };
    }

    return null;
  } catch {
    return null;
  }
};

// Validate if JSON is a valid SillyTavern character card
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
          resolve({ error: "Invalid SillyTavern character card format" });
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

// Convert Character to SillyTavern format for export
export const exportToSillyTavern = (character: Character): string => {
  const card = {
    spec: "chara_card_v2",
    spec_version: "2.0",
    name: character.name,
    description: character.description,
    first_mes: character.firstMessage,
    data: {
      name: character.name,
      description: character.description,
      first_mes: character.firstMessage,
      mes_example: character.mesExample,
      scenario: character.scenario,
      creator_notes: character.creatorNotes,
      tags: character.tags,
      avatar: character.avatar,
      // Instruction fields
      system_prompt: character.systemPrompt,
      post_history_instructions: character.postHistoryInstructions,
      character_book: character.characterBook,
      alternate_greetings: character.alternateGreetings,
    },
  };

  return JSON.stringify(card, null, 2);
};

// Build system prompt from character (SillyTavern-style hierarchy)
export const buildCharacterSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  globalInstructions?: string
): string => {
  // SillyTavern instruction hierarchy:
  // 1. Main system prompt (character.systemPrompt or default)
  // 2. Character description
  // 3. Scenario
  // 4. Example messages
  // 5. Post-history instructions
  // 6. Global instructions (our addition)
  
  const sections: string[] = [];
  
  // 1. Main system prompt - either custom or default
  if (character.systemPrompt) {
    sections.push(character.systemPrompt);
  } else {
    sections.push(`You are ${character.name}.`);
  }
  
  // 2. Character description
  if (character.description) {
    sections.push(character.description);
  }
  
  // 3. Scenario
  if (character.scenario) {
    sections.push(`[Scenario]\n${character.scenario}`);
  }
  
  // 4. User persona info
  sections.push(`[User]\nThe user is roleplaying as ${personaName}.${personaDescription ? ` ${personaDescription}` : ""}`);
  
  // 5. Example messages (helps establish character voice)
  if (character.mesExample) {
    sections.push(`[Example Dialogue]\n${character.mesExample}`);
  }
  
  // 6. Post-history instructions (applied after chat context)
  if (character.postHistoryInstructions) {
    sections.push(`[Instructions]\n${character.postHistoryInstructions}`);
  }
  
  // 7. Global instructions
  if (globalInstructions) {
    sections.push(`[Additional Instructions]\n${globalInstructions}`);
  }
  
  // 8. Final instruction
  sections.push("Stay in character at all times. Respond naturally and engage with the roleplay scenario.");
  
  return sections.join("\n\n");
};

// Scan for lorebook entries triggered by keywords in messages
export const scanLorebook = (
  character: Character,
  messages: Message[],
  scanDepth: number = 2
): string[] => {
  if (!character.characterBook?.entries) return [];
  
  const triggeredContent: string[] = [];
  
  // Get recent messages to scan
  const recentMessages = messages.slice(-scanDepth);
  const textToScan = recentMessages
    .map(m => m.content.toLowerCase())
    .join(" ");
  
  // Check each lorebook entry
  const enabledEntries = character.characterBook.entries
    .filter(e => e.enabled)
    .sort((a, b) => (a.insertionOrder || 100) - (b.insertionOrder || 100));
  
  for (const entry of enabledEntries) {
    // Constant entries are always included
    if (entry.constant) {
      triggeredContent.push(entry.content);
      continue;
    }
    
    // Check if any key matches
    const hasMatch = entry.keys.some(key => {
      const searchKey = entry.caseSensitive ? key : key.toLowerCase();
      const searchText = entry.caseSensitive 
        ? recentMessages.map(m => m.content).join(" ")
        : textToScan;
      return searchText.includes(searchKey);
    });
    
    // Check secondary keys if present (must also match for entry to trigger)
    if (hasMatch && entry.secondaryKeys && entry.secondaryKeys.length > 0) {
      const hasSecondaryMatch = entry.secondaryKeys.some(key => {
        const searchKey = entry.caseSensitive ? key : key.toLowerCase();
        const searchText = entry.caseSensitive 
          ? recentMessages.map(m => m.content).join(" ")
          : textToScan;
        return searchText.includes(searchKey);
      });
      
      if (hasSecondaryMatch) {
        triggeredContent.push(entry.content);
      }
    } else if (hasMatch) {
      triggeredContent.push(entry.content);
    }
  }
  
  return triggeredContent;
};

// Build full context with lorebook
export const buildFullSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  messages: Message[],
  globalInstructions?: string
): string => {
  // Get base system prompt
  const basePrompt = buildCharacterSystemPrompt(
    character,
    personaName,
    personaDescription,
    globalInstructions
  );
  
  // Get lorebook content
  const lorebookContent = scanLorebook(
    character,
    messages,
    character.characterBook?.scanDepth || 2
  );
  
  if (lorebookContent.length > 0) {
    return `${basePrompt}\n\n[World Knowledge]\n${lorebookContent.join("\n\n")}`;
  }
  
  return basePrompt;
};
