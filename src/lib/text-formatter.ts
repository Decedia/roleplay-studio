// Text formatting utility for roleplay chat messages
// Parses common roleplay text conventions and applies styling

export type TextSegmentType = 
  | "action"        // *action* or _action_ - italic
  | "dialogue"      // "speech" - quoted text
  | "thought"       // (thought) or ((thought)) - inner thoughts
  | "narration"     // plain text
  | "bold"          // **bold** or __bold__
  | "ooc"           // ((OOC)) - out of character
  | "code"          // `code` - inline code
  | "emphasis"      // *emphasis* (single asterisk when not action)
  | "html";         // HTML tags like <b>, <i>, <u>, etc.

export interface TextSegment {
  type: TextSegmentType;
  content: string;
}

/**
 * Parses roleplay text and returns an array of styled segments
 * 
 * Supported formats:
 * - **text** or __text__ → bold
 * - *text* or _text_ → action (italic)
 * - "text" or "text" → dialogue
 * - (text) or ((text)) → thought
 * - ((OOC: text)) → out of character
 * - `text` → inline code
 */
export function parseRoleplayText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;
  
  // Combined regex pattern for all formats
  // Order matters: more specific patterns first
  const patterns = [
    // HTML tags (must come first to preserve them)
    // Matches opening tags, closing tags, and self-closing tags
    { regex: /^<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s+[^>]*?)?\/?>/, type: "html" as TextSegmentType },
    // OOC (must come before thought)
    { regex: /^\(\(([^\)]+)\)\)/, type: "ooc" as TextSegmentType },
    // Bold with ** or __
    { regex: /^(\*\*|__)([^\*_]+?)\1/, type: "bold" as TextSegmentType },
    // Action with *text* (must have content, not just asterisks)
    { regex: /^\*([^*\n]+?)\*/, type: "action" as TextSegmentType },
    // Action with _text_ (must have content)
    { regex: /^_([^_\n]+?)_/, type: "action" as TextSegmentType },
    // Dialogue with smart quotes "text" or regular "text"
    { regex: /^[""]([^""\n]+?)[""]/, type: "dialogue" as TextSegmentType },
    // Thought with (text) - single parentheses
    { regex: /^\(([^)\n]+?)\)/, type: "thought" as TextSegmentType },
    // Inline code with backticks
    { regex: /^`([^`\n]+?)`/, type: "code" as TextSegmentType },
  ];
  
  while (remaining.length > 0) {
    let matched = false;
    
    // Try each pattern
    for (const { regex, type } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        // For bold and action, the content is in match[2]
        // For others, it's in match[1]
        const content = match[2] || match[1];
        segments.push({ type, content });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    
    // If no pattern matched, consume text until next special character or end
    if (!matched) {
      // Find the next special character (including < for HTML tags)
      const nextSpecial = remaining.search(/[\*_\""\(\(`<>]/);
      
      if (nextSpecial === -1) {
        // No more special characters, rest is narration
        if (remaining.length > 0) {
          segments.push({ type: "narration", content: remaining });
        }
        break;
      } else if (nextSpecial === 0) {
        // Special character at start but didn't match any pattern
        // This could be an unclosed format - treat as narration
        segments.push({ type: "narration", content: remaining[0] });
        remaining = remaining.slice(1);
      } else {
        // Add text before special character as narration
        segments.push({ type: "narration", content: remaining.slice(0, nextSpecial) });
        remaining = remaining.slice(nextSpecial);
      }
    }
  }
  
  return mergeAdjacentSegments(segments);
}

/**
 * Merge adjacent segments of the same type
 */
function mergeAdjacentSegments(segments: TextSegment[]): TextSegment[] {
  if (segments.length === 0) return segments;
  
  const merged: TextSegment[] = [];
  let current = segments[0];
  
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].type === current.type) {
      current = { ...current, content: current.content + segments[i].content };
    } else {
      merged.push(current);
      current = segments[i];
    }
  }
  
  merged.push(current);
  return merged;
}

/**
 * Get CSS classes for a text segment type
 * 
 * Color scheme for roleplay text (high contrast, readable):
 * - Action: Sky blue for character actions (*action*)
 * - Dialogue: Soft white for spoken words ("speech")
 * - Thought: Lavender for inner thoughts ((thought))
 * - Bold: Bright white for emphasis
 * - OOC: Amber highlight for out-of-character messages
 * - Code: Green monospace for code snippets
 * - Narration: Light gray for descriptive text
 */
export function getSegmentClasses(type: TextSegmentType): string {
  const baseClasses = "inline";
  
  switch (type) {
    case "action":
      // Slightly yellow for actions - warm and distinct
      return `${baseClasses} italic text-amber-200`;
    case "dialogue":
      // Soft white for spoken dialogue - easy to read
      return `${baseClasses} text-gray-100`;
    case "thought":
      // Lavender for inner thoughts - distinct but readable
      return `${baseClasses} italic text-purple-300`;
    case "bold":
      // Bright white for emphasis
      return `${baseClasses} font-bold text-white`;
    case "ooc":
      // Amber highlight for out-of-character messages
      return `${baseClasses} text-amber-400 text-sm bg-amber-400/10 px-1.5 py-0.5 rounded`;
    case "code":
      // Green monospace for code snippets
      return `${baseClasses} font-mono text-sm bg-zinc-700 px-1.5 py-0.5 rounded text-green-400`;
    case "narration":
    default:
      // Grey-ish for normal text without punctuation
      return `${baseClasses} text-gray-400`;
    case "html":
      // HTML tags - render as-is, will use dangerouslySetInnerHTML
      return baseClasses;
  }
}

/**
 * React component props for formatted text
 */
export interface FormattedTextProps {
  segments: TextSegment[];
}

/**
 * Convert segments to a simple object for rendering
 */
export function formatTextForDisplay(text: string): TextSegment[] {
  return parseRoleplayText(text);
}
