const fs = require('fs');
const path = require('path');

const chatFilePath = path.join(__dirname, 'src/components/Chat.tsx');
const chatContent = fs.readFileSync(chatFilePath, 'utf8');
const lines = chatContent.split('\n');

// Extract useState, useRef, useEffect, useCallback declarations
const useStateLines = [];
const useRefLines = [];
const useEffectLines = [];
const useCallbackLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Find useState lines
  if (line.startsWith('const [')) {
    if (line.includes('[ ...') || line.includes('[reset') || line.includes('[is') || line.includes('[enable') || line.includes('[temperature') || line.includes('[max') || line.includes('[modelId') || 
       line.includes('[enableThinking') || line.includes('[thinkingLevel') || line.includes('[thinkingBudget') || line.includes('[useCustomSize') || line.includes('[enableStreaming') || 
       line.includes('[dingWhenUnfocused') || line.includes('[instructionInjectionPosition') || line.includes('[instructionCustomInjectionIndex') || 
       line.includes('[enabled') || line.includes('[trigger') || line.includes('[quality') || line.includes('[overrideModel') || line.includes('[temperature') || line.includes('[messageThreshold') || 
       line.includes('[tokenThreshold') || line.includes('[periodicInterval') || line.includes('[recentMessagesCount') || line.includes('[provider') || line.includes('[modelId') || line.includes('[instructions') || line.includes('[summaryLength')) {
      // Skip complex state declarations
      continue;
    }
    if (line.includes('useState<')) {
      useStateLines.push(lines[i]);
    }
  }
  
  // Find useRef lines
  if (line.startsWith('const ') && (line.includes('Ref = useRef') || line.includes('Ref = useRef<'))) {
    useRefLines.push(lines[i]);
  }
  
  // Find useEffect lines
  if (line.startsWith('useEffect(')) {
    // Get the full function
    let funcLines = [lines[i]];
    let j = i + 1;
    let braceCount = 0;
    let capturing = false;
    
    // Check if this is actually a function
    if (lines[i].includes('=>')) {
      funcLines.push(lines[j]);
      braceCount = countBraces(lines[j]);
      j++;
      capturing = true;
    }
    
    if (capturing) {
      while (j < lines.length && braceCount > 0) {
        funcLines.push(lines[j]);
        braceCount += countBraces(lines[j]);
        j++;
      }
      useEffectLines.push(funcLines.join('\n'));
      i = j - 1;
    }
  }
  
  // Find useCallback lines
  if (line.startsWith('useCallback(')) {
    // Get the full function
    let funcLines = [lines[i]];
    let j = i + 1;
    let braceCount = 0;
    let capturing = false;
    
    // Check if this is actually a function
    for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
      if (lines[k].includes('=>')) {
        funcLines.push(lines[k]);
        braceCount = countBraces(lines[k]);
        j = k + 1;
        capturing = true;
        break;
      }
    }
    
    if (capturing) {
      while (j < lines.length && braceCount > 0) {
        funcLines.push(lines[j]);
        braceCount += countBraces(lines[j]);
        j++;
      }
      useCallbackLines.push(funcLines.join('\n'));
      i = j - 1;
    }
  }
}

function countBraces(line) {
  let count = 0;
  for (let char of line) {
    if (char === '{') count++;
    else if (char === '}') count--;
  }
  return count;
}

// Create the hooks directory
const hooksDir = path.join(__dirname, 'src/components/chat/hooks');
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

// Write useChatState.ts
const useChatStateContent = `export const useChatState = () => {
  // State declarations extracted from Chat.tsx
  // useState declarations (${useStateLines.length} total)
  ${useStateLines.join('\n  ')}
  
  // useRef declarations (${useRefLines.length} total)
  ${useRefLines.join('\n  ')}
};

export type { Persona, Character, Conversation, ViewType, LastSession } from '@/lib/types';
`;

fs.writeFileSync(path.join(hooksDir, 'useChatState.ts'), useChatStateContent);

// Write useChatEffects.ts  
const useChatEffectsContent = `export const useChatEffects = () => {
  // useEffect hooks (${useEffectLines.length} total)
  ${useEffectLines.map(line => `  ${line}`).join('\n  ')}
};
`;

fs.writeFileSync(path.join(hooksDir, 'useChatEffects.ts'), useChatEffectsContent);

// Write useChatHandlers.ts
const useChatHandlersContent = `export const useChatHandlers = () => {
  // useCallback handlers (${useCallbackLines.length} total)
  ${useCallbackLines.map(line => `  ${line}`).join('\n  ')}
};
`;

fs.writeFileSync(path.join(hooksDir, 'useChatHandlers.ts'), useChatHandlersContent);

console.log(`Extracted ${useStateLines.length} useState declarations`);
console.log(`${useRefLines.length} useRef declarations`);
console.log(`${useEffectLines.length} useEffect hooks`);
console.log(`${useCallbackLines.length} useCallback hooks`);
