// SillyTavern Character Card import utilities

import { Character, SillyTavernCharacterCard } from "./types";

// Generate a unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    },
  };

  return JSON.stringify(card, null, 2);
};

// Build system prompt from character
export const buildCharacterSystemPrompt = (
  character: Character,
  personaName: string,
  personaDescription: string,
  globalInstructions?: string
): string => {
  let prompt = `You are ${character.name}. ${character.description}`;

  // Add scenario if available
  if (character.scenario) {
    prompt += `\n\nScenario: ${character.scenario}`;
  }

  // Add user persona info
  prompt += `\n\nThe user is roleplaying as ${personaName}. ${personaDescription}`;

  // Add custom system prompt if available
  if (character.systemPrompt) {
    prompt += `\n\n${character.systemPrompt}`;
  }

  // Add global instructions if available
  if (globalInstructions) {
    prompt += `\n\n${globalInstructions}`;
  }

  // Add example messages if available
  if (character.mesExample) {
    prompt += `\n\nExample dialogue:\n${character.mesExample}`;
  }

  prompt += "\n\nStay in character at all times. Respond naturally and engage with the roleplay scenario.";

  return prompt;
};
