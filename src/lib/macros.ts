// Macro replacement utilities
export const replaceMacros = (text: string): string => {
  // Basic macro replacement - can be expanded later
  return text
    .replace(/\{\{char\}\}/g, "the character")
    .replace(/\{\{user\}\}/g, "you");
};

export const getThoughtSignature = (): string => {
  return "[System: This message contains the model's internal reasoning]";
};