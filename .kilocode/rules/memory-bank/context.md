# Active Context: GLM 5 Chat Application

## Current State

**Application Status**: ✅ Ready for use

A chat application that enables users to converse with GLM 5 AI using puter.js. The app features a modern black theme with persona-based conversations and conversation management.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] GLM 5 Chat component with puter.js integration
- [x] Modern black theme UI with gradient accents
- [x] Persona system (create, edit, delete)
- [x] Conversation management (create, delete, continue)
- [x] Persona-based AI roleplay
- [x] LocalStorage persistence for personas and conversations
- [x] Loading states and error handling
- [x] User info display with puter.js getUser
- [x] Monthly usage stats with getMonthlyUsage

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with Chat component | ✅ Ready |
| `src/app/layout.tsx` | Root layout with puter.js script | ✅ Ready |
| `src/app/globals.css` | Global styles (black theme) | ✅ Ready |
| `src/components/Chat.tsx` | Main chat interface with persona system | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Features

### Persona System
- Create custom personas with name and description
- Edit existing personas
- Delete personas (also deletes related conversations)
- Persona selection screen as the starting view
- Modal popup for persona creation/editing

### Conversation Management
- Create new conversations for each persona
- Continue existing conversations
- Delete conversations
- Conversations sorted by last updated time
- Persistent storage using localStorage

### Chat Interface
- Full-screen chat UI with black theme
- Message bubbles for user and AI responses
- Persona avatar with initial letter
- Loading animation while waiting for AI response
- Error handling with user-friendly messages
- Auto-scroll to latest message
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### AI Integration
- Uses puter.js SDK for GLM 5 access
- No API key required - puter.js handles authentication
- System prompt tells AI that the user is roleplaying as the persona character
- Conversation context sent with each message for coherent responses

## Technical Details

### Data Models
```typescript
interface Persona {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

interface Conversation {
  id: string;
  personaId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
```

### LocalStorage Keys
- `chat_personas` - Stores all personas
- `chat_conversations` - Stores all conversations

### puter.js Integration
- Loaded via script tag in layout.tsx: `https://js.puter.com/v2/`
- Uses `window.puter.ai.chat()` method
- Model specified as "glm-5"
- System prompt: `The user is roleplaying as ${name}. ${description} Treat the user as this character and respond accordingly.`
- User info: `window.puter.auth.getUser()` - returns username, email, uuid
- Usage stats: `window.puter.usage.getMonthlyUsage()` - returns ai_chat_tokens, ai_image_generations, storage_bytes

### Component Architecture
- Client component with `"use client"` directive
- React hooks: useState, useRef, useEffect
- TypeScript interfaces for type safety
- Three views: personas, conversations, chat

## Session History

| Date | Changes |
|------|---------|
| 2026-02-15 | Added getUser and getMonthlyUsage integration with user menu in header |
| 2026-02-15 | Fixed persona system: persona now represents the user (not AI) in conversations |
| 2026-02-15 | Added persona system with create/edit/delete, conversation management, and black theme |
| 2026-02-15 | Enhanced dark theme with custom scrollbar and global dark mode styles |
| 2026-02-15 | Created GLM 5 chat application with puter.js integration |
| Initial | Template created with base setup |
