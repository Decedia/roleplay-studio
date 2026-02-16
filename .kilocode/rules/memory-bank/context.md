# Active Context: Roleplay Studio

## Current State

**Application Status**: ✅ Ready for use

A chat application for roleplay conversations with multiple LLM provider support. Features a modern black theme with dual persona/character system, SillyTavern character import, and advanced instruction handling.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] GLM 5 Chat component with puter.js integration
- [x] Modern black theme UI with gradient accents
- [x] **Separated persona and character systems**
- [x] **Character creation with name, description, and first message**
- [x] **Global settings (temperature, max tokens, top_p, model, enableThinking)**
- [x] **Visible usage stats in header**
- [x] Conversation management (create, delete, continue)
- [x] LocalStorage persistence for personas, characters, and conversations
- [x] Loading states and error handling
- [x] User info display with puter.js getUser
- [x] Monthly usage stats with getMonthlyUsage
- [x] **Dynamic model selection with puter.ai.listModels()**
- [x] **Model pricing display - shows "Free" for zero-cost models**
- [x] **GLM 5 preferred as default model**
- [x] **Fixed send button position - centered with flexbox layout**
- [x] **Retry button for error recovery - resends last message**
- [x] **Global instructions - applied to all conversations**
- [x] **Collapsible model dropdown grouped by provider**
- [x] **Settings modal always accessible from header**
- [x] **Collapsible think tag display for AI reasoning**
- [x] **Empty message resends last user message**
- [x] **Multiple LLM provider support (Puter.js, Google AI Studio, Google Vertex AI, NVIDIA NIM)**
- [x] **Provider selector in header with visual indicators**
- [x] **API key configuration in settings modal**
- [x] **SillyTavern character JSON import**
- [x] **Renamed app to "Roleplay Studio"**
- [x] **SillyTavern-style instruction handling**
- [x] **Character Book (Lorebook) support**
- [x] **Advanced instruction fields in character editor**
- [x] **Changed default provider from Puter to Google AI Studio**
- [x] **Added localStorage persistence for active provider**
- [x] **Connection status tracking for each provider**
- [x] **Test Connection button to verify API keys**
- [x] **Connect button to switch active provider**
- [x] **Auto-select default model when connecting to provider**
- [x] **Visual connection status indicators (green=connected, yellow=testing, red=error)**
- [x] **Roleplay text formatting with visual styling**
- [x] **Action text (*action*) with italic styling**
- [x] **Dialogue text ("speech") with quote styling**
- [x] **Thought text ((thought)) with dimmed italic styling**
- [x] **OOC text ((OOC)) with amber highlight**
- [x] **Bold and code formatting support**
- [x] **Advanced global instructions with jailbreak support**
- [x] **JSON import for instructions**
- [x] **Global system prompt override**
- [x] **Global post-history instructions**
- [x] **Streaming system for real-time AI responses**
- [x] **Data export/import for backup and restore**

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with Chat component | ✅ Ready |
| `src/app/layout.tsx` | Root layout with puter.js script | ✅ Ready |
| `src/app/globals.css` | Global styles (black theme) | ✅ Ready |
| `src/components/Chat.tsx` | Main chat interface with persona/character system | ✅ Ready |
| `src/lib/types.ts` | TypeScript type definitions | ✅ Ready |
| `src/lib/providers.ts` | LLM provider implementations | ✅ Ready |
| `src/lib/character-import.ts` | SillyTavern import & instruction handling | ✅ Ready |
| `src/lib/text-formatter.ts` | Roleplay text formatting parser | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Features

### Persona System (User Identity)
- Create custom personas with name and description
- Edit existing personas
- Delete personas (also deletes related conversations)
- Persona represents WHO THE USER IS in the roleplay
- Blue/cyan gradient styling for user avatars
- Modal popup for persona creation/editing

### Character System (AI Identity)
- Create AI characters with name, description, and first message
- Edit existing characters
- Delete characters (also deletes related conversations)
- Character represents WHO THE AI PLAYS
- Purple/pink gradient styling for character avatars
- First message automatically sent when starting a new conversation
- **Advanced instruction fields (SillyTavern-style)**:
  - Scenario: The setting/situation for the roleplay
  - System Prompt Override: Custom system prompt
  - Post-History Instructions: Instructions after chat history
  - Example Messages: Dialogue examples with {{char}}/{{user}} placeholders

### SillyTavern Import
- Import character cards from JSON files
- Supports V1 and V2 character card formats
- Parses all instruction fields automatically
- Character Book (Lorebook) imported with entries
- Alternate greetings supported

### Character Book (Lorebook)
- Dynamic context based on keywords in conversation
- Keyword-triggered entries with content injection
- Configurable scan depth (how many messages to scan)
- Support for primary and secondary keys
- Constant entries (always included)
- Case-sensitive matching option
- Priority and insertion order control

### Conversation Management
- Conversations are between a user persona and an AI character
- Create new conversations for each persona-character pair
- Continue existing conversations
- Delete conversations
- Conversations sorted by last updated time
- Persistent storage using localStorage

### Global Settings
- **Temperature** (0-2): Controls creativity vs focus
- **Max Tokens** (100-4000): Maximum response length
- **Top P** (0-1): Controls word selection diversity
- **Enable Thinking**: Toggle for AI reasoning display
- **Model Selection**: Choose from available AI models
- Settings apply to ALL conversations globally
- Accessible via gear icon in header (always visible)
- Custom collapsible dropdown grouped by provider

### Global Instructions
- Custom instructions applied to ALL conversations
- Stored in localStorage separately from settings
- Accessible via gear icon in header
- **Advanced Instructions Section**:
  - Jailbreak Instructions: Toggle-able instructions to bypass content restrictions
  - System Prompt Override: Replaces character's system prompt globally
  - Post-History Instructions: Added after conversation history
- **JSON Import**: Import instruction presets from JSON files
- Default jailbreak instruction provided for roleplay scenarios

### Chat Interface
- Full-screen chat UI with black theme
- Message bubbles for user and AI responses
- User avatar shows persona initial (blue/cyan)
- AI avatar shows character initial (purple/pink)
- Loading animation while waiting for AI response
- Error handling with user-friendly messages
- **Retry button for error recovery - resends last message**
- **Empty message sends last user message again**
- **Collapsible think tag display (💭 Thinking...)**
- Auto-scroll to latest message
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- **Send button always enabled (empty = resend)**

### Roleplay Text Formatting
- **Action text** (`*action*` or `_action_`) → italic styling with gray text
- **Dialogue text** (`"speech"`) → quoted text with special quote marks
- **Thought text** (`(thought)` or `((thought))`) → dimmed italic styling
- **OOC text** (`((OOC))`) → amber highlight for out-of-character messages
- **Bold text** (`**bold**` or `__bold__`) → bold styling
- **Inline code** (`` `code` ``) → monospace with background
- All formatting preserves whitespace and line breaks

### Usage Stats Display
- Token count visible in header (always visible on desktop)
- Detailed usage breakdown in user menu dropdown
- Shows: chat tokens, image generations, storage used
- Loading states and error handling for usage data

### Data Export/Import
- **Export Data**: Download all data as a JSON backup file
  - Personas, characters, conversations
  - Global settings and instructions
  - Provider configurations (API keys preserved)
- **Import Data**: Restore from JSON backup file
  - Validates file version
  - Merges with existing data
  - Preserves existing API keys for security
- Accessible via Settings modal → Data Backup section
- File naming: `roleplay-studio-backup-YYYY-MM-DD.json`

### AI Integration
- Multiple LLM providers supported:
  - **Puter.js** (default, free, no API key required)
  - **Google AI Studio** (Gemini models)
  - **Google Vertex AI** (enterprise Gemini)
  - **NVIDIA NIM** (Llama, Mistral, Codestral)
- System prompt follows SillyTavern hierarchy:
  1. Main system prompt (custom or default)
  2. Character description
  3. Scenario
  4. Example messages
  5. Post-history instructions
  6. Global instructions
  7. Lorebook content (keyword-triggered)
- Conversation context sent with each message
- Settings (temperature, max_tokens, top_p) passed to API
- Think tags extracted and displayed separately

## Technical Details

### Data Models
```typescript
interface Persona {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

interface Character {
  id: string;
  name: string;
  description: string;
  firstMessage: string;
  // SillyTavern extended fields
  mesExample?: string;
  scenario?: string;
  creatorNotes?: string;
  tags?: string[];
  avatar?: string;
  // Instruction fields
  systemPrompt?: string;
  postHistoryInstructions?: string;
  characterBook?: CharacterBook;
  alternateGreetings?: string[];
  createdAt: number;
}

interface CharacterBook {
  entries: CharacterBookEntry[];
  scanDepth?: number;
  tokenBudget?: number;
  recursiveScanning?: boolean;
}

interface CharacterBookEntry {
  id: number;
  keys: string[];
  secondaryKeys?: string[];
  content: string;
  enabled: boolean;
  insertionOrder: number;
  caseSensitive?: boolean;
  name?: string;
  priority?: number;
  position?: "before_char" | "after_char" | "before_example" | "after_example";
  constant?: boolean;
  // ... more fields
}

interface GlobalSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  modelId: string;
  enableThinking: boolean;
  activeProvider: LLMProviderType;
}

interface GlobalInstructions {
  customInstructions: string;
  systemPrompt?: string;
  postHistoryInstructions?: string;
  jailbreakInstructions?: string;
  enableJailbreak: boolean;
}

interface Conversation {
  id: string;
  personaId: string;
  characterId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
```

### LocalStorage Keys
- `chat_personas` - Stores all user personas
- `chat_characters` - Stores all AI characters
- `chat_conversations` - Stores all conversations
- `chat_global_instructions` - Stores global instructions for all conversations
- `chat_global_settings` - Stores global settings (temperature, maxTokens, topP, modelId, enableThinking)
- `chat_provider_<type>` - Stores provider-specific configuration

### System Prompt Building
The `buildFullSystemPrompt` function creates prompts following SillyTavern's hierarchy:
1. Jailbreak instructions (if enabled globally)
2. System prompt override (global > character) OR default "You are [name]..."
3. Character description
4. Scenario (if present)
5. User persona info
6. Example messages (if present)
7. Post-history instructions (global > character)
8. Custom instructions (if present)
9. Lorebook content (keyword-triggered from recent messages)
10. Final "Stay in character" instruction

### Component Architecture
- Client component with `"use client"` directive
- React hooks: useState, useRef, useEffect, useMemo
- TypeScript interfaces for type safety
- Four views: personas, characters, conversations, chat
- Modal popups for persona, character, and settings editing
- SettingsModal component with collapsible model dropdown
- ThinkingSection component for collapsible think tags

## Session History

| Date | Changes |
|------|---------|
| 2026-02-16 | Added data export/import for backup and restore - users can save all data to JSON file and restore on any device |
| 2026-02-16 | Fixed NVIDIA NIM error handling for non-JSON responses (Cloudflare 524 timeout) |
| 2026-02-16 | Added streaming system for real-time AI responses with animated cursor |
| 2026-02-16 | Added advanced global instructions: jailbreak support, system prompt override, post-history instructions, JSON import |
| 2026-02-16 | Added roleplay text formatting: action (*text*), dialogue ("text"), thought ((text)), OOC, bold, code styling |
| 2026-02-16 | Added SillyTavern-style instruction handling: scenario, system prompt override, post-history instructions, example messages |
| 2026-02-16 | Implemented Character Book (Lorebook) with keyword scanning and dynamic content injection |
| 2026-02-16 | Enhanced character editor with advanced instruction fields |
| 2026-02-15 | Added multiple LLM providers (Google AI Studio, Vertex AI, NVIDIA NIM), SillyTavern import, renamed to "Roleplay Studio" |
| 2026-02-15 | Global settings refactor: removed per-conversation settings, added enableThinking toggle, collapsible model dropdown, think tag display, empty message resends last |
| 2026-02-15 | Made instructions global (not per-conversation), grouped models by provider in dropdown |
| 2026-02-15 | Fixed send button position (flexbox layout), added retry button for errors, added custom instructions field |
| 2026-02-15 | Added dynamic model selection, "Free" pricing display for zero-cost models, GLM 5 as preferred default |
| 2026-02-15 | Major refactor: separated persona/character systems, added conversation settings, visible usage stats |
| 2026-02-15 | Added getUser and getMonthlyUsage integration with user menu in header |
| 2026-02-15 | Fixed persona system: persona now represents the user (not AI) in conversations |
| 2026-02-15 | Added persona system with create/edit/delete, conversation management, and black theme |
| 2026-02-15 | Enhanced dark theme with custom scrollbar and global dark mode styles |
| 2026-02-15 | Created GLM 5 chat application with puter.js integration |
| Initial | Template created with base setup |
