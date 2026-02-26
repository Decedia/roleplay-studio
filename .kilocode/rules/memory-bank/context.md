# Active Context: Roleplay Studio

## Current State

**Application Status**: ✅ Ready for use

A chat application for roleplay conversations with multiple LLM provider support. Features a modern black theme with dual persona/character system, SillyTavern character import, and advanced instruction handling.

## Recently Completed

- [x] Add alternate greetings to character generator instructions - AI generates 2-4 alternate greetings with different tones/contexts when creating characters
- [x] Add alternate greetings feature - characters can have multiple greetings, users can choose which one to start chat with
- [x] Remove disabled state from all send buttons in all modes - send buttons are now always enabled
- [x] Enable send button in brainstorm when last message is from user - allows resending last message when input is empty
- [x] Add edit button for user messages in all views (chat, generator, brainstorm)
- [x] Add continue button for generator and brainstorm views
- [x] Expose continue instruction in settings modal
- [x] Make AI continue response appear in same bubble (append to existing message)
- [x] Add "Ding when unfocused" global setting - plays notification sound when AI finishes generating
- [x] Fixed notification sound logic - removed window focus check
- [x] Base Next.js 16 setup with App Router
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] GLM 5 Chat component with puter.js integration
- [x] Modern black theme UI with gradient accents
- [x] **Separated persona and character systems**
- [x] **Character creation with name, description, and first message**
- [x] **Global settings (temperature, max tokens, top_p, top_k, model, enableThinking)**
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
- [x] **Action text (_action_) with italic styling**
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
- [x] **Auto-export feature with configurable interval (1-60 minutes)**
- [x] **Context token counter in chat header - shows estimated tokens for current conversation**
- [x] **Fixed send button alignment with text input (items-end flexbox)**
- [x] **Top K parameter added to output settings (range 1-100, default 40)**
- [x] **Max Output Tokens: auto-set to model max on selection, added Max button for quick reset**
- [x] **Max Context Tokens slider - controls conversation history limit sent to AI**
- [x] **NVIDIA NIM thinking/reasoning support - DeepSeek R1 model with reasoning_content parsing**
- [x] **AI-powered character generator tab - create characters from text descriptions**
- [x] **{{user}} macro replacement - automatically replaces {{user}} with current persona name in conversations**
- [x] **Brainstorm tab - AI-assisted roleplay instruction brainstorming with apply-to-global-instructions buttons**
- [x] **Moved Clear/Import buttons above description in character generator preview**
- [x] **Changed user message bubble color from blue to greyish (bg-zinc-700)**
- [x] **Responsive hamburger menu for mobile views - collapsible dropdown menus for all action buttons**
- [x] **Visual feedback for brainstorm apply button - shows "Applied!" with checkmark for 3 seconds**
- [x] **Exclusive brainstorm instructions - separate from global instructions, customizable by user**
- [x] **Disconnect button for providers - allows users to disconnect from the current model/provider**
- [x] **Improved Vertex AI integration - separate model fetching with location support for Express mode**
- [x] **Enhanced AI character generator: asks for character details first, only generates JSON when user says "create now"**
- [x] **Added character JSON display in code blocks with syntax highlighting**
- [x] **Added "Create Character" button to immediately start a conversation with the generated character**
- [x] **Added "Export JSON" button to download character as JSON file with character name as filename**
- [x] **Improved generator instructions: allows skipping question phase if user provides enough details upfront**
- [x] **Updated VN generator instructions: asks questions first, only generates when user says "create now"**
- [x] **Added custom size checkbox for context/output tokens - when disabled, auto-uses model max sizes**
- [x] **Fixed Vertex AI connection - now requires Google Cloud Project ID for all requests**
- [x] **Fixed VN tab back button - now correctly navigates to personas view**
- [x] **Fixed character generator Create Character button - now correctly imports character and starts conversation**
- [x] **Enable Streaming toggle in global settings - allows users to disable streaming for more stable responses**
- [x] **Fixed header to top and input to bottom for mobile views - better mobile UX with fixed positioning**
- [x] **Added thinking config support for Vertex AI - applies to all models when enabled**
- [x] **Thinking feature now available for all models when enabled - removed Gemini 2.0-only restriction**
- [x] **Fixed error popup z-index to appear above input area**
- [x] **Continue instruction support for incomplete AI responses - allows users to continue truncated responses**
- [x] **System prompt restructured to follow context-instructions-constraints order for better AI compliance**
- [x] **Lorebook keyword scanning for dynamic context injection - keyword-triggered content from Character Book**
- [x] **Updated Gemini thinking config to use thinkingLevel (LOW/MEDIUM/HIGH) instead of thinkingBudget**
- [x] **Fixed regenerate buttons in all views** - now appear for ALL assistant messages (not just last)
- [x] **Added edit button for user messages in all views** - chat, generator, and brainstorm modes now support editing any user message
- [x] **Added continue button to generator and brainstorm views** - allows continuing incomplete AI responses
- [x] **Continue instruction support in settings modal** - customizable instructions for continuing responses
- [x] **AI continue response appears in same bubble** - appends to existing assistant message
- [x] **Added "Ding when unfocused" global setting** - plays notification sound when AI finishes generating
- [x] **Fixed notification sound logic** - removed window focus check (browsers throttle background tabs anyway)
- [x] **Enable send button in brainstorm when last message is from user** - allows resending last message

## Current Structure

| File/Directory                | Purpose                                           | Status   |
| ----------------------------- | ------------------------------------------------- | -------- |
| `src/app/page.tsx`            | Home page with Chat component                     | ✅ Ready |
| `src/app/layout.tsx`          | Root layout with puter.js script                  | ✅ Ready |
| `src/app/globals.css`         | Global styles (black theme)                       | ✅ Ready |
| `src/components/Chat.tsx`     | Main chat interface with persona/character system | ✅ Ready |
| `src/lib/types.ts`            | TypeScript type definitions                       | ✅ Ready |
| `src/lib/providers.ts`        | LLM provider implementations                      | ✅ Ready |
| `src/lib/character-import.ts` | SillyTavern import & instruction handling         | ✅ Ready |
| `src/lib/text-formatter.ts`   | Roleplay text formatting parser                   | ✅ Ready |
| `.kilocode/`                  | AI context & recipes                              | ✅ Ready |

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

### AI Character Generator

- Create characters using AI from text descriptions
- Accessible from personas view via "AI Generator" button
- Uses current provider and model for generation
- Higher temperature (0.8) for creative character creation
- **Interactive character creation process**:
  - AI asks for character details first (type, personality, appearance, background)
  - Only generates JSON when user says "create now"
- Generates full character profile:
  - Name
  - Description (personality, appearance, background)
  - First message (greeting)
  - Scenario (setting)
  - Example dialogue
- Preview generated character before importing
- **Character JSON display**: Shows generated JSON in code blocks with syntax highlighting
- **"Create Character" button**: Immediately starts a conversation with the generated character
- **"Export JSON" button**: Downloads character as JSON file with character name as filename

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
- **Top K** (1-100): Limits token selection to top K choices
- **Enable Thinking**: Toggle for AI reasoning display (Gemini 2.0 only)
- **Enable Streaming**: Toggle for real-time AI responses (disable for more stable responses)
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
- **Auto-Export**: Automatically backup data at regular intervals
  - Configurable interval (1-60 minutes)
  - Toggle on/off in Settings modal
  - Persists setting in localStorage
- Accessible via Settings modal → Data Backup section
- File naming: `roleplay-studio-backup-YYYY-MM-DD.json`

### AI Integration

- Multiple LLM providers supported:
  - **Puter.js** (default, free, no API key required)
  - **Google AI Studio** (Gemini models)
  - **Google Vertex AI** (enterprise Gemini)
  - **NVIDIA NIM** (DeepSeek R1, Llama, Mistral, Codestral)
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
  maxContextTokens: number;
  topP: number;
  topK: number;
  modelId: string;
  enableThinking: boolean;
  thinkingLevel: "LOW" | "MEDIUM" | "HIGH"; // Thinking level for Gemini models
  useCustomSize: boolean;
  enableStreaming: boolean;
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
- Five views: personas, characters, conversations, chat, generator
- Modal popups for persona, character, and settings editing
- SettingsModal component with collapsible model dropdown
- ThinkingSection component for collapsible think tags

## Session History

| Date       | Changes                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-26 | Add alternate greetings feature - characters can have multiple greetings stored, users can choose which greeting to start roleplay with when creating new conversation |
| 2026-02-26 | Remove disabled state from all send buttons in all modes - send buttons are now always enabled in chat, generator, brainstorm, and VN views                                                                                         |
| 2026-02-26 | Enable send button in brainstorm view when last message is from user - allows resending last message when input is empty                                                                                                                                             |
| 2026-02-25 | Added jailbreak support to exclusive instruction views (brainstorm, generator, VN) - jailbreak now applied after exclusive instructions when enabled in global settings                                                                             |
| 2026-02-25 | Added edit button for user messages in all views - chat, generator, and brainstorm modes now support editing any user message with edit and delete buttons |
| 2026-02-24 | Fixed error popup z-index to appear above input area                                                                                                                                               |
| 2026-02-24 | Thinking feature now available for all models when enabled - removed Gemini 2.0-only restriction, thinking budget available for all providers                                                      |
| 2026-02-24 | Updated Vertex AI thinking config to apply to all models when enabled (not just Gemini 2.0)                                                                                                        |
| 2026-02-24 | Added thinking config support for Vertex AI Gemini 2.0 models                                                                                                                                      |
| 2026-02-24 | Fixed header to top and input to bottom for mobile views - better mobile UX with fixed positioning                                                                                                 |
| 2026-02-24 | Added Enable Streaming toggle in global settings - allows users to disable streaming for more stable responses                                                                                     |
| 2026-02-23 | Fixed VN tab back button and character generator Create Character button                                                                                                                           |
| 2026-02-23 | Added custom size checkbox for context/output tokens, fixed Vertex AI to require Project ID for all requests                                                                                       |
| 2026-02-23 | Updated VN generator instructions: asks questions first, only generates when user says "create now", merged changes to main branch                                                                 |
| 2026-02-23 | Improved generator instructions: allows skipping question phase if user provides enough details upfront, clarified "create now" trigger requirement                                                |
| 2026-02-23 | Enhanced AI character generator: asks for character details first, only generates JSON when user says "create now", added character JSON display with "Create Character" and "Export JSON" buttons |
| 2026-02-18 | Improved Vertex AI integration - separate model fetching endpoint with location support for Express mode                                                                                           |
| 2026-02-17 | Added disconnect button for providers - allows users to disconnect from the current model/provider in the provider dropdown                                                                        |
| 2026-02-17 | Added exclusive brainstorm instructions - separate from global instructions, customizable by user with collapsible editor in brainstorm tab                                                        |
| 2026-02-17 | Added visual feedback for brainstorm apply button - shows "Applied!" with checkmark for 3 seconds when instructions are applied to global settings                                                 |
| 2026-02-17 | Added responsive hamburger menu for mobile views - collapsible dropdown menus for all action buttons in personas, characters, conversations, brainstorm, and generator views                       |
| 2026-02-16 | Changed user message bubble color from blue to greyish (bg-zinc-700)                                                                                                                               |
| 2026-02-16 | Moved Clear/Import buttons above description in character generator preview                                                                                                                        |
| 2026-02-16 | Added Brainstorm tab - AI-assisted roleplay instruction brainstorming with apply-to-global-instructions buttons                                                                                    |
| 2026-02-16 | Added {{user}} macro replacement - automatically replaces {{user}} with current persona name in conversations                                                                                      |
| 2026-02-16 | Added AI-powered character generator tab - create characters from text descriptions with one-click import                                                                                          |
| 2026-02-16 | Added NVIDIA NIM thinking/reasoning support - DeepSeek R1 model with reasoning_content parsing for both streaming and non-streaming responses                                                      |
| 2026-02-16 | Added Max Context Tokens slider - controls conversation history limit sent to AI, auto-sets to model's context window on selection                                                                 |
| 2026-02-16 | Max Output Tokens: auto-set to model max on selection, added Max button for quick reset                                                                                                            |
| 2026-02-16 | Fixed thinking feature - added thinkingBudget parameter (8192 tokens) for Gemini 2.0 models when enableThinking is enabled                                                                         |
| 2026-02-16 | Added Top K parameter to output settings (range 1-100, default 40)                                                                                                                                 |
| 2026-02-16 | Added context token counter in chat header showing estimated tokens for current conversation                                                                                                       |
| 2026-02-16 | Fixed send button alignment with text input using items-end flexbox                                                                                                                                |
| 2026-02-16 | Added auto-export feature with configurable interval (1-60 minutes) for automatic data backup                                                                                                      |
| 2026-02-16 | Added data export/import for backup and restore - users can save all data to JSON file and restore on any device                                                                                   |
| 2026-02-16 | Fixed NVIDIA NIM error handling for non-JSON responses (Cloudflare 524 timeout)                                                                                                                    |
| 2026-02-16 | Added streaming system for real-time AI responses with animated cursor                                                                                                                             |
| 2026-02-16 | Added advanced global instructions: jailbreak support, system prompt override, post-history instructions, JSON import                                                                              |
| 2026-02-16 | Added roleplay text formatting: action (_text_), dialogue ("text"), thought ((text)), OOC, bold, code styling                                                                                      |
| 2026-02-16 | Added SillyTavern-style instruction handling: scenario, system prompt override, post-history instructions, example messages                                                                        |
| 2026-02-16 | Implemented Character Book (Lorebook) with keyword scanning and dynamic content injection                                                                                                          |
| 2026-02-16 | Enhanced character editor with advanced instruction fields                                                                                                                                         |
| 2026-02-15 | Added multiple LLM providers (Google AI Studio, Vertex AI, NVIDIA NIM), SillyTavern import, renamed to "Roleplay Studio"                                                                           |
| 2026-02-15 | Global settings refactor: removed per-conversation settings, added enableThinking toggle, collapsible model dropdown, think tag display, empty message resends last                                |
| 2026-02-15 | Made instructions global (not per-conversation), grouped models by provider in dropdown                                                                                                            |
| 2026-02-15 | Fixed send button position (flexbox layout), added retry button for errors, added custom instructions field                                                                                        |
| 2026-02-15 | Added dynamic model selection, "Free" pricing display for zero-cost models, GLM 5 as preferred default                                                                                             |
| 2026-02-15 | Major refactor: separated persona/character systems, added conversation settings, visible usage stats                                                                                              |
| 2026-02-15 | Added getUser and getMonthlyUsage integration with user menu in header                                                                                                                             |
| 2026-02-15 | Fixed persona system: persona now represents the user (not AI) in conversations                                                                                                                    |
| 2026-02-15 | Added persona system with create/edit/delete, conversation management, and black theme                                                                                                             |
| 2026-02-15 | Enhanced dark theme with custom scrollbar and global dark mode styles                                                                                                                              |
| 2026-02-15 | Created GLM 5 chat application with puter.js integration                                                                                                                                           |
| Initial    | Template created with base setup                                                                                                                                                                   |
