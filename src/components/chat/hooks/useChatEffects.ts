export const useChatEffects = () => {
  // useEffect hooks (27 total)
      useEffect(() => {
    setVisibleMessageCount(20);
      useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
      useEffect(() => {
    const storedPersonas = localStorage.getItem(PERSONAS_KEY);
      useEffect(() => {
    // Don't save on initial render
      useEffect(() => {
    if (personas.length > 0 || localStorage.getItem(PERSONAS_KEY)) {
      localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
    }
      useEffect(() => {
    if (characters.length > 0 || localStorage.getItem(CHARACTERS_KEY)) {
      localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    }
      useEffect(() => {
    if (conversations.length > 0 || localStorage.getItem(CONVERSATIONS_KEY)) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }
      useEffect(() => {
    localStorage.setItem(GLOBAL_INSTRUCTIONS_KEY, JSON.stringify(globalInstructions));
      useEffect(() => {
    localStorage.setItem(INSTRUCTION_PRESETS_KEY, JSON.stringify(instructionPresets));
      useEffect(() => {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings));
      useEffect(() => {
    localStorage.setItem(BRAINSTORM_INSTRUCTIONS_KEY, brainstormInstructions);
      useEffect(() => {
    localStorage.setItem(BRAINSTORM_MESSAGES_KEY, JSON.stringify(brainstormMessages));
      useEffect(() => {
    localStorage.setItem(GENERATOR_INSTRUCTIONS_KEY, generatorInstructions);
      useEffect(() => {
    localStorage.setItem(GENERATOR_MESSAGES_KEY, JSON.stringify(generatorMessages));
      useEffect(() => {
    if (generatorSessions.length > 0 || localStorage.getItem(GENERATOR_SESSIONS_KEY)) {
      localStorage.setItem(GENERATOR_SESSIONS_KEY, JSON.stringify(generatorSessions));
    }
      useEffect(() => {
    localStorage.setItem(BRAINSTORM_MESSAGES_KEY, JSON.stringify(brainstormMessages));
      useEffect(() => {
    if (brainstormSessions.length > 0 || localStorage.getItem(BRAINSTORM_SESSIONS_KEY)) {
      localStorage.setItem(BRAINSTORM_SESSIONS_KEY, JSON.stringify(brainstormSessions));
    }
      useEffect(() => {
    const loadProviderConfigs = () => {
      const stored = localStorage.getItem(PROVIDER_CONFIGS_KEY);
      if (stored) {
        try {
          let configs = JSON.parse(stored) as Record<LLMProviderType, ProviderConfig>;
          
          // Migration: Convert old single-config format to new profiles system
          // Check if configs have the new profiles structure
          const needsMigration = Object.values(configs).some(
            config => !Array.isArray(config.profiles) || config.profiles.length === 0
          );
          
          if (needsMigration) {
            console.log("Migrating provider configs to new profiles system");
            configs = Object.keys(configs).reduce((acc, key) => {
              const providerType = key as LLMProviderType;
              const oldConfig = configs[providerType];
              
              // Create a default profile from old single-config values
              const defaultProfile: ProviderProfile = {
                id: `default-${Date.now()}`,
                name: "Default Profile",
                apiKey: oldConfig.apiKey,
                projectId: oldConfig.projectId,
                serviceAccountJson: oldConfig.serviceAccountJson,
                vertexMode: oldConfig.vertexMode,
                vertexLocation: oldConfig.vertexLocation,
                selectedModel: oldConfig.selectedModel,
                createdAt: Date.now()
              };
              
              acc[providerType] = {
                ...oldConfig,
                profiles: [defaultProfile],
                activeProfileId: defaultProfile.id,
                isEnabled: oldConfig.isEnabled
              };
              
              return acc;
            }, {} as Record<LLMProviderType, ProviderConfig>);
            
            // Save migrated configs
            localStorage.setItem(PROVIDER_CONFIGS_KEY, JSON.stringify(configs));
            console.log("Migration completed successfully");
          }
          
          // Ensure all providers exist in loaded configs
          const allProviders: LLMProviderType[] = ["google-ai-studio", "google-vertex", "nvidia-nim", "groq", "open-router"];
          allProviders.forEach(key => {
            if (!configs[key]) {
              configs[key] = { type: key, isEnabled: false, profiles: [], activeProfileId: null };
            }
          });
          
          setProviderConfigs(configs);
        } catch (e) {
          console.error("Failed to parse provider configs:", e);
        }
      } else {
        // Check for old per-provider storage (for users upgrading from older versions)
        const providers: LLMProviderType[] = ["google-ai-studio", "google-vertex", "nvidia-nim", "groq", "open-router", "kobold-horde", "ollama"];
        const migratedConfigs: Record<LLMProviderType, ProviderConfig> = {
          "google-ai-studio": { type: "google-ai-studio", isEnabled: false, profiles: [], activeProfileId: null },
          "google-vertex": { type: "google-vertex", isEnabled: false, profiles: [], activeProfileId: null },
          "nvidia-nim": { type: "nvidia-nim", isEnabled: false, profiles: [], activeProfileId: null },
          "groq": { type: "groq", isEnabled: false, profiles: [], activeProfileId: null },
          "open-router": { type: "open-router", isEnabled: false, profiles: [], activeProfileId: null },
          "kobold-horde": { type: "kobold-horde", isEnabled: false, profiles: [], activeProfileId: null },
          "ollama": { type: "ollama", isEnabled: false, profiles: [], activeProfileId: null },
        };
        
        providers.forEach(providerType => {
          const oldKey = getProviderConfigKey(providerType);
          const oldConfigStr = localStorage.getItem(oldKey);
          if (oldConfigStr) {
            try {
              const oldConfig = JSON.parse(oldConfigStr);
              
               // Create a default profile from old config
               const defaultProfile: ProviderProfile = {
                 id: `default-${Date.now()}`,
                 name: "Default Profile",
                 apiKey: oldConfig.apiKey,
                 projectId: oldConfig.projectId,
                 serviceAccountJson: oldConfig.serviceAccountJson,
                 vertexMode: oldConfig.vertexMode,
                 vertexLocation: oldConfig.vertexLocation,
                 selectedModel: oldConfig.selectedModel,
                 lastUsedPreset: undefined,
                 createdAt: Date.now()
               };
              
               migratedConfigs[providerType] = {
                 ...(migratedConfigs[providerType] || {}),
                 isEnabled: oldConfig.isEnabled || false,
                 profiles: [defaultProfile],
                 activeProfileId: defaultProfile.id
               };
              
              console.log(`Migrated ${providerType} config from old storage`);
            } catch (e) {
              console.error(`Failed to parse old config for ${providerType}:`, e);
            }
          }
        });
        
        setProviderConfigs(migratedConfigs);
      }
    };
      useEffect(() => {
    localStorage.setItem(PROVIDER_CONFIGS_KEY, JSON.stringify(providerConfigs));
      useEffect(() => {
    localStorage.setItem(ACTIVE_PROVIDER_KEY, activeProvider);
      useEffect(() => {
    localStorage.setItem(CONNECTION_STATUS_KEY, JSON.stringify(connectionStatus));
      useEffect(() => {
    localStorage.setItem(AUTO_EXPORT_KEY, JSON.stringify(autoExport));
      useEffect(() => {
    // Clear any existing timer
      useEffect(() => {
    const handleFocus = () => setWindowFocused(true);
      useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      useEffect(() => {
    if (view === "chat") {
      inputRef.current?.focus();
    }
      useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest(".user-menu-container")) {
          setShowUserMenu(false);
        }
      }
    };
};
