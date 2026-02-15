# Active Context: GLM 5 Chat Application

## Current State

**Application Status**: ✅ Ready for use

A chat application that enables users to converse with GLM 5 AI using puter.js. The app features a modern black theme with a dual persona/character system for roleplay conversations.

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

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with Chat component | ✅ Ready |
| `src/app/layout.tsx` | Root layout with puter.js script | ✅ Ready |
| `src/app/globals.css` | Global styles (black theme) | ✅ Ready |
| `src/components/Chat.tsx` | Main chat interface with persona/character system | ✅ Ready |
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

### Usage Stats Display
- Token count visible in header (always visible on desktop)
- Detailed usage breakdown in user menu dropdown
- Shows: chat tokens, image generations, storage used
- Loading states and error handling for usage data

### AI Integration
- Uses puter.js SDK for GLM 5 access
- No API key required - puter.js handles authentication
- System prompt sets up dual roleplay:
  - AI is instructed to be the character
  - User is described as their persona
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
  createdAt: number;
}

interface GlobalSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  modelId: string;
  enableThinking: boolean;
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

### puter.js Integration
- Loaded via script tag in layout.tsx: `https://js.puter.com/v2/`
- Uses `window.puter.ai.chat()` method
- Model specified dynamically from global settings
- API options: temperature, max_tokens, top_p
- System prompt: `You are ${character.name}. ${character.description} The user is roleplaying as ${persona.name}. ${persona.description} Stay in character...`
- User info: `window.puter.auth.getUser()` - returns username, email, uuid
- Usage stats: `window.puter.usage.getMonthlyUsage()` - returns ai_chat_tokens, ai_image_generations, storage_bytes

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
