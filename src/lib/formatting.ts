// Text formatting utilities
export const extractAllTags = (text: string): string[] => {
  const tagRegex = /<([^>]+)>/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }
  return tags;
};

export const removeThinkTags = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

export const formatResponse = (text: string): string => {
  return text.trim();
};