// Macro replacement function - replaces {{user}} with persona name and {{char}} with character name
export const replaceMacros = (
  content: string,
  personaName: string,
  characterName: string
): string => {
  return content
    .replace(/\{\{user\}\}/gi, personaName)
    .replace(/\{\{char\}\}/gi, characterName);
};

// Check if a provider supports image generation
export const providerSupportsImageGeneration = (provider: string): boolean => {
  return ["google-ai-studio", "google-vertex"].includes(provider);
};
