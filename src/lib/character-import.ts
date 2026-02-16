// Simple Character Card import utilities
// Only extracts: name, description, firstMessage, scenario

import { Character, Message, GlobalInstructions } from "./types";

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
export const buildCharacterSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  globalInstructions?: GlobalInstructions
): string => {
  const sections: string[] = [];
  
  // 1. Jailbreak instructions (if enabled)
  if (globalInstructions?.enableJailbreak && globalInstructions.jailbreakInstructions) {
    sections.push(globalInstructions.jailbreakInstructions);
  }
  
  // 2. Main system prompt - global override takes precedence
  if (globalInstructions?.systemPrompt) {
    sections.push(globalInstructions.systemPrompt);
  } else {
    sections.push(`You are ${character.name}.`);
  }
  
  // 3. Character description
  if (character.description) {
    sections.push(character.description);
  }
  
  // 4. Scenario
  if (character.scenario) {
    sections.push(`[Scenario]\n${character.scenario}`);
  }
  
  // 5. User persona info
  sections.push(`[User]\nThe user is roleplaying as ${personaName}.${personaDescription ? ` ${personaDescription}` : ""}`);
  
  // 6. Post-history instructions (global takes precedence)
  if (globalInstructions?.postHistoryInstructions) {
    sections.push(`[Instructions]\n${globalInstructions.postHistoryInstructions}`);
  }
  
  // 7. Custom instructions
  if (globalInstructions?.customInstructions) {
    sections.push(`[Additional Instructions]\n${globalInstructions.customInstructions}`);
  }
  
  // 8. Final instruction
  sections.push("Stay in character at all times. Respond naturally and engage with the roleplay scenario.");
  
  return sections.join("\n\n");
};

// Build full system prompt (simplified - no lorebook)
export const buildFullSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  _messages: Message[],
  globalInstructions?: GlobalInstructions
): string => {
  return buildCharacterSystemPrompt(
    character,
    personaName,
    personaDescription,
    globalInstructions
  );
};
