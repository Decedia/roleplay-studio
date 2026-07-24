// Macro replacement utilities
import { replaceMacrosSimple } from "@/components/chat/utils/macroUtils";

export const replaceMacros = (text: string): string => {
  return replaceMacrosSimple(text, "you", "the character");
};

export const getThoughtSignature = (): string => {
  return "[System: This message contains the model's internal reasoning]";
};