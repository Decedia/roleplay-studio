"use client";

import { FormattedText } from "./FormattedText";

export interface SpeakerPart {
  /** Character name, or null for text before the first tag. */
  speaker: string | null;
  text: string;
}

// A line starting with [[Name]], optionally followed by ":" and text.
const TAG_LINE = /^[ \t]*\[\[([^\[\]\n]{1,40})\]\]:?[ \t]*/;

/**
 * Splits an AI reply into one part per character, using [[Name]] tags at the
 * start of a line. Returns a single untagged part when the reply has no tags.
 */
export function splitSpeakerParts(content: string): SpeakerPart[] {
  const parts: SpeakerPart[] = [];
  let current: SpeakerPart = { speaker: null, text: "" };
  for (const line of content.split("\n")) {
    const match = TAG_LINE.exec(line);
    if (match) {
      if (current.speaker !== null || current.text.trim()) parts.push(current);
      current = { speaker: match[1].trim(), text: line.slice(match[0].length) };
    } else {
      current.text += (current.text ? "\n" : "") + line;
    }
  }
  if (current.speaker !== null || current.text.trim()) parts.push(current);
  return parts.map((p) => ({ ...p, text: p.text.trim() })).filter((p) => p.speaker !== null || p.text);
}

export function hasSpeakerTags(content: string): boolean {
  return content.split("\n").some((line) => TAG_LINE.test(line));
}

const NARRATOR_NAMES = new Set(["narrator", "narration", "scene"]);

// Warm colours that sit on the dark Storybook background. The main character
// always gets the first; others get a stable colour from their name.
const SPEAKER_COLORS = ["#F2A65A", "#C9A6E8", "#9DBF7A", "#E8C46A", "#D98A6C", "#7FC8C0"];

function speakerColor(name: string, mainCharacter?: string): string {
  if (mainCharacter && name.toLowerCase() === mainCharacter.toLowerCase()) return SPEAKER_COLORS[0];
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SPEAKER_COLORS[1 + (hash % (SPEAKER_COLORS.length - 1))];
}

interface SpeakerPartsProps {
  content: string;
  mainCharacter?: string;
}

/** Renders a multi-character reply as one block per character. */
export function SpeakerParts({ content, mainCharacter }: SpeakerPartsProps) {
  const parts = splitSpeakerParts(content);
  return (
    <div className="flex flex-col gap-5">
      {parts.map((part, index) => {
        const isNarrator = part.speaker === null || NARRATOR_NAMES.has(part.speaker.toLowerCase());
        if (isNarrator) {
          return (
            <div key={index} className="font-story text-[16px] sm:text-[17px] leading-[1.75] italic text-parchment-soft">
              <FormattedText content={part.text} variant="story" />
            </div>
          );
        }
        const color = speakerColor(part.speaker!, mainCharacter);
        return (
          <div key={index} className="flex flex-col gap-1 pl-3.5 border-l-2" style={{ borderColor: `${color}66` }}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color }}>
              {part.speaker}
            </div>
            <div className="font-story text-[17px] sm:text-[18px] leading-[1.75]">
              <FormattedText content={part.text} variant="story" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
