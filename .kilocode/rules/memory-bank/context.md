# Active Context: Roleplay Studio

## Current State

**Application Status**: ✅ Ready for use - Modularization in progress

Currently modularizing `src/components/Chat.tsx` (11,200 lines) into smaller files under `src/components/chat/`. Completed Steps 1-3 of the module plan. Build compiles successfully.

## Recently Completed
- [x] **AI Response Alternatives with Pagination/Selection**
  - Added `alternatives` and `selectedAlternativeIndex` fields to `Message` interface in `src/lib/types.ts`
  - Added `selectedAlternativeIndex` and `canSelectAlternatives` state in `Chat.tsx`
  - Modified `handleSubmit` to generate new alternatives when input is empty (instead of retrying)
  - Modified `handleRetry` to support `addAlternative` parameter for adding alternatives vs replacing
  - Added `handleGenerateAlternative` function for generating new AI response alternatives
  - Added `lockSelectedAlternative` and `unlockAlternatives` helper functions
  - Added UI for alternative navigation: left/right arrows, X/Y counter, and Select button
  - Added keyboard navigation (arrow keys) for browsing alternatives while focused on input
  - Selection is enabled only on the last AI response when no user message follows
  - Selection is disabled when user sends a new message (locks selected alternative)
  - Selection is re-enabled when the last user message is deleted
  - Deleting the last AI message with multiple alternatives removes only the selected alternative, not the whole message
  - If only 1 alternative remains after deletion, the whole message is removed
  - Editing the last AI message locks alternatives and clears the alternatives array
  - Editing a non-last AI message with alternatives clears that message's alternatives without affecting the last message's selection UI
  - Saving an edited AI message removes alternatives and disables selection
- [x] **Exposed character generator default instructions globally**
  - Added `generatorDefaultInstructions` field to `GlobalInstructions` interface in `src/lib/types.ts`
  - Added `generatorDefaultInstructions` to local `GlobalInstructions` interface in `src/components/Chat.tsx` and `src/components/chat/components/SettingsModal.tsx`
  - Updated `DEFAULT_GLOBAL_INSTRUCTIONS` in `src/components/Chat.tsx` to include `generatorDefaultInstructions: DEFAULT_GENERATOR_SYSTEM_PROMPT`
  - Initialized `generatorInstructions` state from localStorage `generatorDefaultInstructions` value, falling back to `DEFAULT_GENERATOR_SYSTEM_PROMPT`
  - Added effect to sync `generatorInstructions` changes back to `globalInstructions.generatorDefaultInstructions`
  - Replaced hardcoded `DEFAULT_GENERATOR_SYSTEM_PROMPT` in generator API calls with `globalInstructions.generatorDefaultInstructions || DEFAULT_GENERATOR_SYSTEM_PROMPT`
  - Generator instructions are now persisted globally and shared across sessions
- [x] **Moved character generator instructions into instructions modal**
  - Added `generator` tab to the instructions modal alongside the existing `chat` tab in `src/components/Chat.tsx`
  - Added Generator tab content with a shared textarea bound to `globalInstructions.generatorDefaultInstructions`
  - Removed inline generator instructions textarea from the generator view
  - All generator sessions now use the same shared instructions field edited from the modal
- [x] **Fixed generator instructions leakage into user messages**
  - Removed `[Instructions: ...]` prefix from stored user messages in generator history
  - Instructions are now injected only as a system message on the API side, matching chat behavior
- [x] **Added exclusive character card preview button in generator**
  - Added `isCharacterCardJson` helper to require `name`, `description`, and `first_mes`
  - When an assistant message contains a full character card JSON, the JSON text is hidden from the UI
  - A preview button is shown instead: "Preview Character" for full cards, "View Character Card" for partial JSON
  - Behavior applies after stream finishes and during message re-render

- [x] **Expanded macro system with MacroContext**
  - Added `MacroContext` type in `src/components/chat/utils/macroUtils.ts` with all available fields
  - Added 14 new macros: `{{user_description}}`, `{{char_description}}`, `{{scenario}}`, `{{first_message}}`, `{{mes_example}}`, `{{creator_notes}}`, `{{tags}}`, `{{model}}`, `{{max_tokens}}`, `{{temperature}}`, `{{context_window}}`, `{{provider}}`, `{{datetime}}`, `{{date}}`, `{{time}}`, `{{message_count}}`
  - Updated `Chat.tsx` `replaceMacros` function to build full `MacroContext` from closure state variables (selectedPersona, selectedCharacter, globalSettings, activeProvider, etc.)
  - Centralized macro replacement in `macroUtils.ts`, updated `character-import.ts` and `lib/macros.ts` to use `replaceMacrosSimple`
  - UI hint updated to list all available placeholders
  - Typecheck and lint pass

- [x] **Completely removed character generator, instructions generator, and VN generator**
  - Removed all generator/VN types from `src/lib/types.ts` (`GeneratorConversation`, `GlobalInstructions.generatorInstructions`, `GlobalInstructions.vnInstructions`, `ViewType` generator/vn values)
  - Removed generator constants from `src/lib/constants.ts` (`DEFAULT_GENERATOR_INSTRUCTIONS`, `DEFAULT_VN_INSTRUCTIONS`)
  - Removed generator storage functions from `src/lib/storage.ts` (`loadGeneratorConversations`, `saveGeneratorConversations`)
  - Removed all generator/VN state, types, and exports from `src/components/chat/hooks/useChatState.ts`
  - Removed generator/VN storage keys from `src/components/chat/constants/storage.ts`
  - Removed generator/VN default instructions from `src/components/chat/constants/settings.ts`
  - Removed `ChatButtonInput` component from `src/components/chat/components/ChatInput.tsx`
  - Removed all generator/VN code from `src/components/Chat.tsx`:
    - Removed 14 generator/VN functions
    - Removed all generator/VN state variables
    - Removed all generator/VN localStorage load/save effects
    - Removed entire generator and VN generator JSX views
    - Removed generator/VN buttons from home view and mobile menus
    - Updated `ViewType` to only include `"home" | "personas" | "characters" | "conversations" | "chat" | "brainstorm"`
    - Updated error display to only show `error` (removed `generatorError`, `brainstormError`, `vnError`)
    - Updated SettingsModal instruction tabs to only show `chat` and `brainstorm`
  - Updated `src/components/chat/components/SettingsModal.tsx` to remove generator/vn instruction tab
  - Typecheck and lint pass successfully

- [x] **Extracted SettingsModal from Chat.tsx into its own file**
  - Created `src/components/chat/components/SettingsModal.tsx` with all necessary imports and local type definitions
  - Updated `src/components/chat/components/index.ts` to export SettingsModal
  - Updated Chat.tsx to import SettingsModal from the new module
  - Chat.tsx now delegates settings UI to the extracted component
  - Build compiles successfully


- [x] **Added toast system for provider connection debugging**
  - Created reusable `useToast` hook in `src/hooks/useToast.ts`
  - Integrated toast system into Chat component to show connection status for providers
  - Kobold Horde connect button now shows toast with provider name when connection is attempted
  - Increased toast z-index to ensure it appears above other content
  - Toasts automatically disappear after 5 seconds


- [x] **COMPLETED: Fixed AI Horde models fetching to use workers API**
   - Fixed model fetching to query `/api/v2/status/models?type=text` which returns available workers
   - Fixed filtering to only show models with available workers (`count > 0`)
   - Fixed model mapping to use correct API response fields (`name`, `type`, `count`)
   - Allowed model fetching without API key requirement (Horde public endpoint)
   - Fixed `FetchedModel` type to include `provider` field
- [x] **COMPLETED: Removed test connection buttons and system**
  - Removed individual "Test Connection" buttons for each provider
  - Removed testProviderConnection function and related status tracking
  - Modified connection flow to immediately fetch models from provider servers during connection without separate testing
  - Updated UI to show "Connect" buttons that directly fetch models
  - Simplified provider configuration UI by removing redundant testing states and connection status indicators
  - Improved user experience by making connection immediate and model fetching automatic
 - [x] **COMPLETED: Fixed structural problems in KoboldAI Horde handleConnection**  
    - Removed duplicate `case "kobold-horde"` in `testProviderConnection` (was causing dead code)
    - Fixed hardcoded `max_context_length: 2048` to use dynamic model context window  
    - Added `DEFAULT_KOBOLD_HORDE_MODEL` constant to avoid model string duplication
    - Improved polling in `chatWithKoboldHorde` with exponential backoff (1s→30s cap) and per-attempt error handling
    - Added proper model context lookup for both chat and stream functions
    - Clarified connection status messages for Horde network
    - Reduced state update race conditions in `handleConnectProvider`
  - Improved responsiveness by removing unnecessary connection testing step
- [x] **COMPLETED: Fixed NVIDIA NIM model fetching**
  - Updated NVIDIA NIM provider to properly fetch models from the API
  - Fixed the models endpoint in src/app/api/models/route.ts to correctly call NVIDIA NIM's models API
  - Ensured proper transformation of NVIDIA NIM model data to the application's format
  - Verified that NVIDIA NIM models are now properly displayed in the UI after connection
- [x] **COMPLETED: Separated global settings from models modal and added dedicated settings access**
  - Removed duplicate global settings controls (temperature, max tokens, top P, top K, enable thinking, enable streaming, ding when unfocused, thinking level/budget) from models modal
  - Created dedicated Settings modal that shows only global settings controls
  - Added Settings button to header dropdown menu for clean access to global settings
  - Models modal now focuses exclusively on model selection and provider configuration
  - Improved UX by clearly separating: Models (model selection + providers) vs Settings (global parameters) vs Instructions (prompt templates)
  - Eliminated user confusion from having settings scattered across different modals
  - Fixed KoboldAI Horde profile creation by adding default selectedModel to prevent connection errors
- [x] **COMPLETED: Implemented full "Inline with Message" instruction positioning system**
  - **UI/UX**: Added position selector and index input field for inline injection
  - **Backend**: Implemented `injectInlineInstructions()` function with proper indexing logic
  - **Integration**: Modified `buildFullSystemPrompt()` to collect and `injectInlineInstructions()` to place instructions
  - **Positioning Logic**: Index 0 = after last user message, 1 = before that, etc. (overflows to end)
  - **Message Construction**: Inline instructions injected into conversation before API calls
  - Project builds successfully with complete inline instruction functionality
- [x] **COMPLETED: Simplified models modal and fixed component sizing**
  - Removed unnecessary tabbed navigation from models modal - now shows models and settings in single view
  - Made Switch and Checkbox components fixed small sizes instead of responsive
  - Switch: reduced from h-[10.5px] w-5 to h-3 w-8 with proportional thumb
  - Checkbox: reduced from h-4 w-4 to h-3 w-3 with matching icon
  - Streamlined modal interface for better usability
  - Project builds successfully with updated modal design
- [x] **COMPLETED: Removed duplicate utilities button**
- [x] **COMPLETED: Fixed duplicate instructions buttons and moved advanced instructions to new tabbed modal**
- [x] Fix Vertex AI model loading - Added proper Vertex AI API models list endpoint integration with fallback to static Gemini model list for when projectId and accessToken are not provided. Updated api/models/route.ts to properly call Vertex AI `projects.locations.models.list` API endpoint with correct authentication headers.
- [x] Responsive Design System Refactor - Implemented mobile-first responsive design:
  - Added CSS design system with spacing variables, border radius, and transitions in globals.css
  - Added responsive breakpoint utilities and overflow prevention
  - Updated modals to use responsive max-widths (max-w-sm -> sm:max-w-md -> md:max-w-lg)
  - Updated header with responsive padding and sizing
  - Updated input components with responsive sizing
  - Added touch-friendly tap targets for mobile
- [x] Add Groq as new AI provider - implemented full Groq support including:
  - Added "groq" to LLMProviderType in types.ts
  - Added Groq to AVAILABLE_PROVIDERS with Llama 3.3, Llama 3.1, Mixtral, and Gemma models
  - Implemented chatWithGroq function for non-streaming chat
  - Implemented streamWithGroq function for streaming chat
  - Added Groq to testConnection function
  - Added Groq to fetchModels function with dynamic API fetching (falls back to static models on error)
  - Updated Chat.tsx state to include groq provider
  - Added groq-sdk dependency for potential future server-side usage
- [x] Fix error popup styling - replaced ui.notifications references with inline Tailwind classes to ensure proper styling
- [x] Fix Advanced Instructions collapsible - Fixed bug where Advanced Instructions section was always visible. Changed `true &&` to `showAdvancedInstructions &&` to properly toggle visibility.
- [x] Fix instruction list not being sent properly to AI - Fixed issue where instruction messages with role "system" were being converted to "user" role when sent to Google AI Studio and Vertex AI. Now system messages are properly extracted and passed via the `systemInstruction` parameter for Gemini APIs. Applied fix to all 4 provider functions (chatWithGoogleAIStudio, streamWithGoogleAIStudio, chatWithVertexAI, streamWithVertexAI).
- [x] Restore utilities button capabilities to show utilities modal - Changed the utilities button from opening a sliding panel to opening a modal dialog. Added `showUtilitiesModal` state and created a new utilities modal with tabs for Tags, Summarize, and Debug functionality.
- [x] Consolidate instructions buttons - Removed the old "Instructions" button that opened the settings modal, keeping only the newest "Dedicated Instructions Button" that opens the tabbed instruction modal for Chat, Generator, Brainstorm, and VN modes.
- [x] Migrate advanced instructions UI to Chat tab - Moved all advanced instructions functionality from the old settings modal to the Chat tab in the new instructions modal, including formatting prompt, jailbreak instructions, continue instruction, image generation instructions, and the full SillyTavern-style instruction list management.
- [x] Remove old settings system completely - Eliminated the old SettingsModal's instructions functionality. Renamed SettingsModal to ModelsModal for clarity. All instruction management now exclusively uses the new instructions modal system.
- [x] Consolidate instruction buttons - Removed duplicate instruction buttons, keeping only the newest "Dedicated Instructions Button" that opens the comprehensive tabbed instructions modal.
- [x] Wrap all thinking/reasoning content in `<think>` tags - removed `thinking` property from Message type, now thinking content is wrapped in `<think> tags</think>` and stored in message content for consistent format across all providers
- [x] Remove includeThoughts from Gemini 3 models - removed the `includeThoughts` parameter from all Gemini 3 model configurations in providers.ts (4 locations: chatWithGoogleAIStudio, streamChatWithGoogleAIStudio, chatWithVertexAI, streamChatWithVertexAI)
- [x] Fix delete button bug in chat views - Fixed issue where delete button was deleting wrong message due to index mismatch when filtering out continue messages. Applied fix to main chat, generator, and brainstorm views by preserving original index before filtering.
- [x] Remove Puter.js provider completely - removed from providers.ts, types.ts, Chat.tsx state, UI components, and layout.tsx script
- [x] Remove Puter.js usage stats and user menu from header - removed user authentication, usage display, and sign out functionality
- [x] Add streaming plot generation display in VN generator - Shows AI-generated plot JSON in real-time under the Generate Plot button
- [x] Fix NVIDIA NIM 524 timeout error in VN generator - Added 90-second timeout to API route and reduced max tokens for NVIDIA NIM (800 for story, 1200 for characters/plot)
- [x] Show AI response in VN generator premise step - Displays generated character JSON under the Generate Characters button
- [x] Fix VN generator streaming for NVIDIA NIM - Always enable streaming when using NVIDIA NIM in VN generator, regardless of global settings
- [x] Add thought signature for Gemini models - Shows model type badge (⚡ Flash, 🔮 Pro, 👑 Ultra, ✨ 1.5) in thinking section
- [x] Add conversation history modal - View all messages from past conversations with "Continue Conversation" button
- [x] Add "History" button under Continue in character selection (conversations view)
- [x] Remove provider selector dropdown from header - model configuration now only accessible via gear/settings button
- [x] Clean up unused state variables (showProviderConfig, providerDropdownRef) and related effect
- [x] Create "Clean-Up" branch for UI simplification
- [x] Create "feature-thought-signature" branch for Gemini thought signatures
- [x] Add support for Gemini 2.5 and Gemini 3 models - added new models to Google AI Studio and Vertex AI providers, implemented thinking parameter logic: Gemini 2.5 uses thinkingBudget, Gemini 3 uses includeThoughts boolean, all synchronized with global enableThinking setting
- [x] Fix Pollinations AI dropdown - models now fetched dynamically from API before testing connection
- [x] Add top_k parameter to NVIDIA NIM - for better response control similar to other providers
- [x] Fix Groq provider error when pressing Configure - added migration code to ensure groq is added to providerConfigs when loading from old localStorage data
- [x] Add Groq as a free AI provider - fast inference with free tier, supports Llama 3.3, Llama 3.1, Mixtral, and Gemma models. API key required but has generous free credits.
- [x] Fix NVIDIA NIM API key not being passed to chat requests - properly extracts API key from active profile
- [x] Fix instruction list not being sent to AI - the `buildFullSystemPrompt` function returns both `systemPrompt` and `instructionMessages`, but only `systemPrompt` was being used. Fixed by extracting both values and combining `instructionMessages` with conversation messages before sending to AI. Applied fix to all 5 call sites in Chat.tsx (chat send, generator retry, brainstorm continue, regenerate, continue flow).
- [x] Add character avatar feature - users can now upload character images (PNG, JPG, GIF up to 5MB) that display in character list and chat messages. Falls back to initial if no image uploaded.
- [x] Add AI image generation for character avatars - users can generate character images using AI. Button in character modal uses the current LLM provider. Disabled when using providers that don't support image generation (NVIDIA NIM). Instructions configurable in global settings.
- [x] Fix navigation back button: home no longer has back button, personas now has back button (goes to home), characters/generator/brainstorm/vn-generator now go back to main menu (home)
- [x] Remove system prompt override and post history instruction fields from settings modal - simplified interface to only use instruction list
- [x] Fix message duplication bug in generator/brainstorm when resending same message - removed duplicate message addition to state (only add new messages, not resends)
- [x] Fix refresh/continue button showing on all assistant messages - now only shows on last assistant message
- [x] Fix generator regenerate to keep last user message - changed slice to lastUserIdx + 1 to include the user message
- [x] Update button styling for mobile in generator and brainstorm views - made buttons smaller on mobile using responsive classes (px-2 sm:px-3, py-1 sm:py-1.5, hidden sm:inline)
- [x] Update export JSON in character generator - now exports full character data including alternateGreetings and scenario when available
- [x] Add Update Character functionality in character generator - button now checks for existing character with same name and updates it instead of creating duplicate, preserves original creation timestamp
- [x] Add "Continue Last Session" button to home menu:
  - Stores last session state (view, persona, character, conversation) in localStorage
  - Shows "Continue Last Session" button on home page when valid session exists
  - Resumes chat, generator, brainstorm, and VN generator views
  - Automatically saves session when switching views or starting conversations
- [x] Sync UI/UX between conversation, generator, and brainstorm views:
  - Added loading spinner to send buttons in generator and brainstorm
  - Added "Press Enter to send" hint to generator and brainstorm
  - Added message avatars (AI and user) to generator and brainstorm
  - Added AI avatar to loading animations
  - Added empty message resends last message functionality to generator/brainstorm
  - Added thinking/collapsible display (💭) to generator and brainstorm
- [x] Fix edit message showing continue instruction in generator/brainstorm views
- [x] Fix brainstorm empty input duplicating user message - removed duplicate message addition to state
- [x] Add {{char}} macro replacement - replaces {{char}} with character name in AI responses and greetings
- [x] Improve character generator instructions - added Required Fields section emphasizing alternateGreetings is required
- [x] Add alternate greetings feature - characters can have multiple greetings, users can choose which one to start chat with
- [x] Remove disabled state from all send buttons in all modes - send buttons are now always enabled
- [x] Enable send button in brainstorm when last message is from user - allows resending last message when input is empty
- [x] Fix duplicate instruction tab content in settings modal - removed incorrect duplicate tab section that was using brainstormInstructions for chat tab instead of chatInstructions
- [x] Added Service Account JSON input field for Vertex AI Full mode - users can now enter service account credentials when using Full mode
- [x] Added proper validation for Test Connection and Connect buttons based on selected mode (Express requires API key, Full requires service account JSON)
- [x] Add continue button for generator and brainstorm views
- [x] Expose continue instruction in settings modal
- [x] Make AI continue response appear in same bubble (append to existing message)
- [x] Add "Ding when unfocused" global setting - plays notification sound when AI finishes generating
- [x] Fixed notification sound logic - removed window focus check
- [x] Instruction List Rework - Implemented SillyTavern-style instruction list system:
  - Added Instruction interface with id, name, content, role (system/user/assistant), position (before/after context), enabled, order
  - Added instruction list UI in Settings Modal with full CRUD operations (add, edit, delete, reorder, enable/disable)
  - Role dropdown per instruction to select who the instruction appears as (system/user/assistant)
  - Position dropdown per instruction to select when to send (before_context/after_context)
  - Default instructions: Formatting, Jailbreak, Continue - each with configurable name, role, position
  - Modified applyInstructions to prompt for name, role, and position when applying from brainstorm/generator/VN
  - Updated buildFullSystemPrompt to process instruction list with proper role/position handling
- [x] Base Next.js 16 setup with App Router
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] GLM 5 Chat component with multi-provider support
- [x] Modern black theme UI with gradient accents
- [x] **Separated persona and character systems**
- [x] **Character creation with name, description, and first message**
- [x] **Global settings (temperature, max tokens, top_p, top_k, model, enableThinking)**
- [x] **Visible usage stats in header**
- [x] Conversation management (create, delete, continue)
- [x] LocalStorage persistence for personas, characters, and conversations
- [x] Loading states and error handling
- [x] **Dynamic model selection from provider APIs**
- [x] **Model pricing display - shows "Free" for zero-cost models**
- [x] **GLM 5 preferred as default model**
- [x] **Fixed send button position - centered with flexbox layout**
- [x] **Retry button for error recovery - resends last message**
- [x] **Global instructions - applied to all conversations**
- [x] **Collapsible model dropdown grouped by provider**
- [x] **Settings modal always accessible from header**
- [x] **Collapsible think tag display for AI reasoning**
- [x] **Empty message resends last user message**
- [x] **Multiple LLM provider support (Google AI Studio, Google Vertex AI, NVIDIA NIM)**
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
- [x] **Add modular Utilities Menu with theme configuration**
  - Created `src/components/utilities-menu.tsx` as a reusable dropdown menu component
  - Integrated light/dark/system theme toggle into the Utilities Menu
  - Refactored `ChatHeader.tsx` to use `UtilitiesMenu` instead of standalone `ThemeToggle`
  - UtilitiesMenu accepts optional `themeConfig` prop for custom theme state management
  - Menu supports additional items via `children` prop for future extensibility (color pickers, presets, etc.)
  - Theme mode options: Light, Dark, System with active state indicators
  - Typecheck and lint pass successfully
- [x] **Fixed OpenRouter provider to properly handle system messages** - Ensured system messages from input and options.systemPrompt are preserved and sent with correct role "system" to prevent 'provider return error' from some models.

## Current Structure

| File/Directory                | Purpose                                           | Status   |
| ----------------------------- | ------------------------------------------------- | -------- |
| `src/app/page.tsx`            | Home page with Chat component                     | ✅ Ready |
| `src/app/layout.tsx`          | Root layout                                       | ✅ Ready |
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
  - **Google AI Studio** (Gemini models, default)
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

| Date       | Changes                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-04 | **COMPLETED: Implemented AI Response Alternatives with Pagination/Selection** - Users can now generate multiple AI responses per message by pressing send with empty input; alternatives are browsable with arrow keys and UI buttons; selection is enabled only on last AI response and disabled after user sends a new message; re-enabled when last user message is deleted; alternatives persist in conversation storage. |
| 2026-08-07 | **Added modular Utilities Menu with theme configuration** - Created `src/components/utilities-menu.tsx` with integrated light/dark/system theme toggle; refactored `ChatHeader.tsx` to use `UtilitiesMenu`; menu accepts optional `themeConfig` prop and `children` for future extensibility (custom colors, theme presets). |
| 2026-08-04 | **FIXED: Edit/delete behavior for messages with alternatives** - Deleting last AI message with multiple alternatives removes only selected alternative; editing last AI message locks alternatives first; editing non-last AI message no longer incorrectly disables last message's alternative selection UI. |
| 2026-08-04 | **Exposed character generator default instructions globally** - Added `generatorDefaultInstructions` to `GlobalInstructions`; character generator instructions textarea now defaults to global value and persists changes back to global instructions/localStorage; API calls use global instructions instead of hardcoded default. |
| 2026-08-04 | **Moved character generator instructions into instructions modal** - Added `generator` tab to instructions modal; removed inline generator instructions textarea from generator view; all generator sessions now share one global instructions field edited from the modal. |
| 2026-08-04 | **FIXED: Character generator broke after moving instructions to modal** - Removed stale `generatorInstructions` local state; generator input now reads `globalInstructions.generatorDefaultInstructions` directly; removed redundant sync effect; updates in modal now apply immediately to generator sessions. |
| 2026-08-04 | **FIXED: Generator instructions no longer shown in chat UI** - Removed instruction prefix from stored user messages; instructions are now injected as system message only on the API side, matching chat instruction behavior. |
| 2026-08-04 | **Added exclusive character card preview button in generator** - Assistant messages containing full character card JSON (`name`, `description`, `first_mes`) now hide the raw JSON and show a preview button instead; partial JSON still shows content plus a "View Character Card" button. |
| 2026-08-04 | **Fixed generator character card extraction for loose JSON** - Updated `extractCharacterJson` to scan entire message content for JSON objects with `name`, not just code blocks or trailing JSON; preview button now appears even when JSON is not wrapped in markdown code fences. |
| 2026-08-04 | **Fixed generator session persistence** - Added missing `useEffect` to save `generatorSessions` to localStorage; creating, renaming, or deleting generator sessions now persists correctly across reloads. |
| 2026-08-04 | **Updated generator character save to update existing characters** - When saving a character from the generator preview, if a character with the same name already exists, it updates the existing character instead of adding a duplicate. |
| 2026-08-05 | **Replaced broken JSON extraction with simple save-as-character flow** - Removed `extractCharacterJson`, `isCharacterCardJson`, preview dialog, and related state from generator; each assistant message now has a "Save as Character" button that opens the character creation modal pre-filled with the message content; existing character with same name is updated instead of duplicated. |
| 2026-08-05 | **Added smart character field extraction from generator messages** - New `extractCharacterFieldsFromContent` function parses AI responses for `name`, `description`, `first_mes`, `scenario`, `system_prompt`, `post_history_instructions`, `mes_example`, and `creator_notes` from both JSON and labeled text; "Save as Character" now pre-fills the character modal with extracted fields instead of raw text. |
| 2026-08-05 | **Simplified generator character extraction to direct JSON/pattern matching** - Removed complex regex lookahead logic; extractor now first attempts JSON parse, then simple `"key": "value"` and `key: value` pattern matches, then falls back to first-line-as-name heuristics. |
| 2026-05-04 | **COMPLETED: Implemented instruction preset system** - Added InstructionPreset interface with id, name, instructions[], createdAt, updatedAt fields; added dropdown for selecting presets; added Save/Rename/Delete preset functionality with localStorage persistence; default name uses current date/time |
| 2026-04-21 | **COMPLETED: Implemented backend for inline instruction positioning** - Added injectInlineInstructions function, integrated with message construction, system now fully functional |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-12 | Refactor Chat.tsx to follow SOLID principles - Created modular structure in `src/components/chat/` with constants, utils, hooks, and extracted UI components for better maintainability and testability                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                                                                                 |
| 2026-03-15 | Fix instruction list not being sent properly to AI - Fixed issue where instruction messages with role "system" were being converted to "user" role when sent to Google AI Studio and Vertex AI. Now system messages are properly extracted and passed via the `systemInstruction` parameter for Gemini APIs. Applied fix to all 4 provider functions. |
| 2026-03-04 | Remove includeThoughts from Gemini 3 models - removed the `includeThoughts` parameter from all Gemini 3 model configurations in providers.ts (4 locations: chatWithGoogleAIStudio, streamChatWithGoogleAIStudio, chatWithVertexAI, streamChatWithVertexAI)                                                                                            |
| 2026-03-03 | Fix delete button bug in chat views - Fixed issue where delete button was deleting wrong message due to index mismatch when filtering out continue messages. Applied fix to main chat, generator, and brainstorm views by preserving original index before filtering.                                                                                 |
| 2026-03-02 | Remove Puter.js provider completely - removed from providers.ts, types.ts, Chat.tsx state/UI/effects, and layout.tsx script; removed user authentication, usage stats, and sign out functionality from header                                                                                                                                         |
| 2026-03-02 | Add streaming plot generation display in VN generator - Shows AI-generated plot JSON in real-time under the Generate Plot button                                                                                                                                                                                                                      |
| 2026-03-02 | Fix NVIDIA NIM 524 timeout error in VN generator - Added 90-second timeout to API route and reduced max tokens for NVIDIA NIM (800 for story, 1200 for characters/plot) to prevent Cloudflare timeouts                                                                                                                                                |
| 2026-03-02 | Merged feature-thought-signature branch to main - adds model type badges (⚡ Flash, 🔮 Pro, 👑 Ultra, ✨ 1.5) to Gemini thinking sections                                                                                                                                                                                                             |
| 2026-02-28 | Fix message duplication bug in generator/brainstorm when resending same message - removed duplicate message addition to state, fixed refresh/continue buttons to only show on last assistant message, fixed regenerate to keep last user message                                                                                                      |
| 2026-02-28 | Add "Continue Last Session" button to home menu - stores last view, persona, character, conversation in localStorage, allows resuming chat, generator, brainstorm, and VN generator views                                                                                                                                                             |
| 2026-02-26 | Add alternate greetings feature - characters can have multiple greetings stored, users can choose which greeting to start roleplay with when creating new conversation                                                                                                                                                                                |
| 2026-02-26 | Remove disabled state from all send buttons in all modes - send buttons are now always enabled in chat, generator, brainstorm, and VN views                                                                                                                                                                                                           |
| 2026-02-26 | Enable send button in brainstorm view when last message is from user - allows resending last message when input is empty                                                                                                                                                                                                                              |
| 2026-02-25 | Added jailbreak support to exclusive instruction views (brainstorm, generator, VN) - jailbreak now applied after exclusive instructions when enabled in global settings                                                                                                                                                                               |
| 2026-02-25 | Added edit button for user messages in all views - chat, generator, and brainstorm modes now support editing any user message with edit and delete buttons                                                                                                                                                                                            |
| 2026-02-24 | Fixed error popup z-index to appear above input area                                                                                                                                                                                                                                                                                                  |
| 2026-02-24 | Thinking feature now available for all models when enabled - removed Gemini 2.0-only restriction, thinking budget available for all providers                                                                                                                                                                                                         |
| 2026-02-24 | Updated Vertex AI thinking config to apply to all models when enabled (not just Gemini 2.0)                                                                                                                                                                                                                                                           |
| 2026-02-24 | Added thinking config support for Vertex AI Gemini 2.0 models                                                                                                                                                                                                                                                                                         |
| 2026-02-24 | Fixed header to top and input to bottom for mobile views - better mobile UX with fixed positioning                                                                                                                                                                                                                                                    |
| 2026-02-24 | Added Enable Streaming toggle in global settings - allows users to disable streaming for more stable responses                                                                                                                                                                                                                                        |
| 2026-02-23 | Fixed VN tab back button and character generator Create Character button                                                                                                                                                                                                                                                                              |
| 2026-02-23 | Added custom size checkbox for context/output tokens, fixed Vertex AI to require Project ID for all requests                                                                                                                                                                                                                                          |
| 2026-02-23 | Updated VN generator instructions: asks questions first, only generates when user says "create now", merged changes to main branch                                                                                                                                                                                                                    |
| 2026-02-23 | Improved generator instructions: allows skipping question phase if user provides enough details upfront, clarified "create now" trigger requirement                                                                                                                                                                                                   |
| 2026-02-23 | Enhanced AI character generator: asks for character details first, only generates JSON when user says "create now", added character JSON display with "Create Character" and "Export JSON" buttons                                                                                                                                                    |
| 2026-02-18 | Improved Vertex AI integration - separate model fetching endpoint with location support for Express mode                                                                                                                                                                                                                                              |
| 2026-02-17 | Added disconnect button for providers - allows users to disconnect from the current model/provider in the provider dropdown                                                                                                                                                                                                                           |
| 2026-02-17 | Added exclusive brainstorm instructions - separate from global instructions, customizable by user with collapsible editor in brainstorm tab                                                                                                                                                                                                           |
| 2026-02-17 | Added visual feedback for brainstorm apply button - shows "Applied!" with checkmark for 3 seconds when instructions are applied to global settings                                                                                                                                                                                                    |
| 2026-02-17 | Added responsive hamburger menu for mobile views - collapsible dropdown menus for all action buttons in personas, characters, conversations, brainstorm, and generator views                                                                                                                                                                          |
| 2026-02-16 | Changed user message bubble color from blue to greyish (bg-zinc-700)                                                                                                                                                                                                                                                                                  |
| 2026-02-16 | Moved Clear/Import buttons above description in character generator preview                                                                                                                                                                                                                                                                           |
| 2026-02-16 | Added Brainstorm tab - AI-assisted roleplay instruction brainstorming with apply-to-global-instructions buttons                                                                                                                                                                                                                                       |
| 2026-02-16 | Added {{user}} macro replacement - automatically replaces {{user}} with current persona name in conversations                                                                                                                                                                                                                                         |
| 2026-07-24 | Expanded macro system with MacroContext - added {{char_description}}, {{scenario}}, {{first_message}}, {{mes_example}}, {{creator_notes}}, {{tags}}, {{model}}, {{max_tokens}}, {{temperature}}, {{context_window}}, {{provider}}, {{datetime}}, {{date}}, {{time}}, {{message_count}} macros. Centralized replacement in macroUtils.ts and updated Chat.tsx, character-import.ts, and macros.ts |
| 2026-02-16 | Added AI-powered character generator tab - create characters from text descriptions with one-click import                                                                                                                                                                                                                                             |
| 2026-02-16 | Added NVIDIA NIM thinking/reasoning support - DeepSeek R1 model with reasoning_content parsing for both streaming and non-streaming responses                                                                                                                                                                                                         |
| 2026-02-16 | Added Max Context Tokens slider - controls conversation history limit sent to AI, auto-sets to model's context window on selection                                                                                                                                                                                                                    |
| 2026-02-16 | Max Output Tokens: auto-set to model max on selection, added Max button for quick reset                                                                                                                                                                                                                                                               |
| 2026-02-16 | Fixed thinking feature - added thinkingBudget parameter (8192 tokens) for Gemini 2.0 models when enableThinking is enabled                                                                                                                                                                                                                            |
| 2026-02-16 | Added Top K parameter to output settings (range 1-100, default 40)                                                                                                                                                                                                                                                                                    |
| 2026-02-16 | Added context token counter in chat header showing estimated tokens for current conversation                                                                                                                                                                                                                                                          |
| 2026-02-16 | Fixed send button alignment with text input using items-end flexbox                                                                                                                                                                                                                                                                                   |
| 2026-02-16 | Added auto-export feature with configurable interval (1-60 minutes) for automatic data backup                                                                                                                                                                                                                                                         |
| 2026-02-16 | Added data export/import for backup and restore - users can save all data to JSON file and restore on any device                                                                                                                                                                                                                                      |
| 2026-02-16 | Fixed NVIDIA NIM error handling for non-JSON responses (Cloudflare 524 timeout)                                                                                                                                                                                                                                                                       |
| 2026-02-16 | Added streaming system for real-time AI responses with animated cursor                                                                                                                                                                                                                                                                                |
| 2026-02-16 | Added advanced global instructions: jailbreak support, system prompt override, post-history instructions, JSON import                                                                                                                                                                                                                                 |
| 2026-02-16 | Added roleplay text formatting: action (_text_), dialogue ("text"), thought ((text)), OOC, bold, code styling                                                                                                                                                                                                                                         |
| 2026-02-16 | Added SillyTavern-style instruction handling: scenario, system prompt override, post-history instructions, example messages                                                                                                                                                                                                                           |
| 2026-02-16 | Implemented Character Book (Lorebook) with keyword scanning and dynamic content injection                                                                                                                                                                                                                                                             |
| 2026-02-16 | Enhanced character editor with advanced instruction fields                                                                                                                                                                                                                                                                                            |
| 2026-02-15 | Added multiple LLM providers (Google AI Studio, Vertex AI, NVIDIA NIM), SillyTavern import, renamed to "Roleplay Studio"                                                                                                                                                                                                                              |
| 2026-02-15 | Global settings refactor: removed per-conversation settings, added enableThinking toggle, collapsible model dropdown, think tag display, empty message resends last                                                                                                                                                                                   |
| 2026-02-15 | Made instructions global (not per-conversation), grouped models by provider in dropdown                                                                                                                                                                                                                                                               |
| 2026-02-15 | Fixed send button position (flexbox layout), added retry button for errors, added custom instructions field                                                                                                                                                                                                                                           |
| 2026-02-15 | Added dynamic model selection, "Free" pricing display for zero-cost models, GLM 5 as preferred default                                                                                                                                                                                                                                                |
| 2026-02-15 | Major refactor: separated persona/character systems, added conversation settings, visible usage stats                                                                                                                                                                                                                                                 |
| 2026-02-15 | Fixed persona system: persona now represents the user (not AI) in conversations                                                                                                                                                                                                                                                                       |
| 2026-02-15 | Added persona system with create/edit/delete, conversation management, and black theme                                                                                                                                                                                                                                                                |
| 2026-02-15 | Enhanced dark theme with custom scrollbar and global dark mode styles                                                                                                                                                                                                                                                                                 |
| 2026-02-15 | Created GLM 5 chat application with multi-provider support                                                                                                                                                                                                                                                                                            |
| Initial    | Template created with base setup                                                                                                                                                                                                                                                                                                                      |
| 2026-07-05 | **Refactor: Extract SettingsModal from Chat.tsx** - Moved SettingsModal component (lines 599-2231) into `src/components/chat/components/SettingsModal.tsx` as part of Step 3 modularization. Added necessary imports and local type definitions. Updated barrel exports and Chat.tsx import. Build compiles successfully. |
