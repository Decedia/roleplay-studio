# MODULE_PLAN.md

## Goal
Split `src/components/Chat.tsx` (11,200 lines) into smaller, focused files while preserving exact behavior.

## Extraction Order (Safest → Riskiest)

### Step 1 — Extract Pure Helper Functions
- **New file**: `src/components/chat/helpers/chatHelpers.ts`
- **What it contains**:
  - `estimateTokens`
  - `providerSupportsImageGeneration`
  - `injectInlineInstructions`
  - `truncateMessagesToContext`
  - `extractThinkContent`
  - `removeThinkTags`
  - `extractAllTags`
  - `formatResponse`
  - `replaceMacros`
  - `getThoughtSignature`
- **Depends on**: `Message` type from `@/lib/types`, `LLMProviderType` from `@/lib/providers`
- **Why safe**: Pure functions with no state dependency; already used in multiple places.

### Step 2 — Extract Constants and Default Instructions
- **New file**: `src/components/chat/constants/chatDefaults.ts`
- **What it contains**:
  - `DEFAULT_JAILBREAK_INSTRUCTION`
  - `DEFAULT_CONTINUE_INSTRUCTION`
  - `DEFAULT_IMAGE_GENERATION_INSTRUCTIONS`
  - `DEFAULT_FORMATTING_PROMPT`
  - `DEFAULT_GLOBAL_INSTRUCTIONS`
  - `DEFAULT_GLOBAL_SETTINGS`
  - `DEFAULT_AUTO_EXPORT`
  - `DEFAULT_BRAINSTORM_INSTRUCTIONS`
  - `DEFAULT_GENERATOR_INSTRUCTIONS`
  - `DEFAULT_VN_INSTRUCTIONS`
  - `DEFAULT_MODEL_PREFERENCES`
  - LocalStorage key constants
- **Depends on**: Types from `@/lib/types` and `@/lib/providers`
- **Why safe**: Data-only; referenced but never mutated in place.

### Step 3 — Extract SettingsModal into its Own Component File
- **New file**: `src/components/chat/components/SettingsModal.tsx` (move from inline in Chat.tsx)
- **What it contains**: The `SettingsModal` function component (lines 599–2430).
- **Depends on**: Many props from parent (`globalSettings`, `setGlobalSettings`, `providerConfigs`, `handleConnectProvider`, etc.)
- **Why medium risk**: It is already a separate function component, but it takes ~20 props and uses many parent callbacks. Moving it requires updating all `<SettingsModal ... />` usages in Chat.tsx.
- **Note**: This is a move, not a rewrite. Keep the component signature identical.

### Step 4 — Extract Chat Hooks (State + Effects + Logic)
- **New files**:
  - `src/components/chat/hooks/useChatState.ts` — all `useState` declarations and refs
  - `src/components/chat/hooks/useChatEffects.ts` — all `useEffect` hooks
  - `src/components/chat/hooks/useChatHandlers.ts` — all handler functions (persona/character CRUD, messaging, navigation, generator/brainstorm/VN logic)
- **Depends on**: Types, helpers, constants from previous steps; external libs (`@/lib/providers`, `@/lib/summarization`, etc.)
- **Why risky**: These are deeply entangled with React state and each other. Must be extracted carefully, preserving hook order and dependency arrays.

### Step 5 — Extract View Components
- **New files** (under `src/components/chat/views/`):
  - `HomeView.tsx`
  - `PersonasView.tsx`
  - `CharactersView.tsx`
  - `ConversationsView.tsx`
  - `ChatView.tsx`
  - `GeneratorView.tsx`
  - `BrainstormView.tsx`
  - `VnGeneratorView.tsx`
- **Depends on**: State and handlers from `useChatState` / `useChatHandlers`
- **Why risky**: Each view renders large JSX trees with many inline handlers; extraction requires threading props carefully.

### Step 6 — Extract Modals
- **New files** (under `src/components/chat/modals/`):
  - `PersonaModal.tsx`
  - `CharacterModal.tsx`
  - `GreetingSelectionModal.tsx`
  - `CharacterCardModal.tsx`
  - `InstructionsModal.tsx`
  - `UtilitiesModal.tsx`
  - `ConversationHistoryModal.tsx`
- **Depends on**: State and handlers from parent
- **Why risky**: Many modals share similar patterns but have unique prop requirements.

### Step 7 — Final Assembly
- **New file**: `src/components/chat/Chat.tsx` (replaces the monolithic file)
- **What it contains**: The main `Chat` component that composes hooks and view/modal components.
- **Depends on**: Everything extracted above.
- **Why final step**: Only after all pieces are extracted can the main component become a thin orchestrator.

---

## Execution Rules
1. Extract exactly **one section per run**, in the order above.
2. Do **not** rewrite logic while moving; move code verbatim.
3. After each extraction, verify the app compiles and runs, then commit.
4. If an extraction is more tangled than expected, stop and update this plan to split it into smaller sub-extractions before continuing.
5. Update `ANALYSIS.md` and `MODULE_PLAN.md` if new findings emerge during extraction.
