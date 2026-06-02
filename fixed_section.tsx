                           )}
                         </div>
                       </div>
                       
                       {/* Provider Preset - only show if profile is selected */}
                       {providerConfigs["ollama"]?.activeProfileId && (
                         <>
                           <div>
                             <label className="block text-xs text-zinc-400 mb-1">Provider Preset</label>
                             <select
                               value={getSelectedPresetForProfile(getActiveProfile("ollama"))?.value || ""}
                               onChange={handlePresetChange}
                               className="w-full bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                             >
                               {ollamaPresets.map(preset => (
                                 <option key={preset.value} value={preset.value}>
                                   {preset.label}
                                 </option>
                               ))}
                             </select>
                           </div>
                           
                           {/* Base URL - only show if profile is selected */}
                           <div>
                             <label className="block text-xs text-zinc-400 mb-1">Base URL</label>
                             <div className="flex items-center gap-2">
                               <input
                                 type="text"
                                 value={getActiveProfile("ollama")?.baseUrl || ""}
                                 onChange={(e) => {
                                   const profileId = providerConfigs["ollama"].activeProfileId;
                                 if (!profileId) return;
                                   setProviderConfigs(prev => ({
                                     ...prev,
                                     "ollama": {
                                       ...prev["ollama"],
                                       profiles: (prev["ollama"]?.profiles || []).map(p =>
                                         p.id === profileId ? { ...p, baseUrl: e.target.value } : p
                                       )
                                     }
                                   }));
                                 }}
                                 placeholder="http://localhost:11434/api/chat"
                                 className="flex-1 bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                               />
                               <button
                                 type="button"
                                 onClick={() => {
                                   // Test connection for the ollama provider
                                   handleConnectProvider("ollama");
                                 }}
                                 className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                               >
                                 Test
                               </button>
                             </div>
                             <p className="text-xs text-zinc-500 mt-1">
                               {getSelectedPresetForProfile(getActiveProfile("ollama"))?.note}
                             </p>
                           </div>
                           
                           {/* Model Name - only show if profile is selected */}
                           <div>
                             <label className="block text-xs text-zinc-400 mb-1">Model Name</label>
                             <input
                               type="text"
                               value={getActiveProfile("ollama")?.selectedModel || ""}
                               onChange={(e) => {
                                 const profileId = providerConfigs["ollama"].activeProfileId;
                                 if (!profileId) return;
                                 setProviderConfigs(prev => ({
                                   ...prev,
                                   "ollama": {
                                     ...prev["ollama"],
                                     profiles: (prev["ollama"]?.profiles || []).map(p =>
                                       p.id === profileId ? { ...p, selectedModel: e.target.value } : p
                                     )
                                   }
                                 ));
                               }}
                               placeholder="llama3.2"
                               className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                             />
                             <p className="text-xs text-zinc-500 mt-1">
                               Enter the model name as it appears in Ollama (e.g., llama3.2, mistral, phi3)
                             </p>
                           </div>
                           
                           {/* API Key - optional for remote setups */}
                           <div>
                             <label className="block text-xs text-zinc-400 mb-1">API Key (Optional)</label>
                             <input
                               type="password"
                               value={getActiveProfile("ollama")?.apiKey || ""}
                               onChange={(e) => {
                                 const profileId = providerConfigs["ollama"].activeProfileId;
                                 if (!profileId) return;
                                 setProviderConfigs(prev => ({
                                   ...prev,
                                   "ollama": {
                                     ...prev["ollama"],
                                     profiles: (prev["ollama"]?.profiles || []).map(p =>
                                       p.id === profileId ? { ...p, apiKey: e.target.value } : p
                                     )
                                   }
                                 ));
                               }}
                               placeholder="Leave empty for local Ollama"
                               className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                             />
                             <p className="text-xs text-zinc-500 mt-1">
                               Optional API key for remote Ollama setups that require authentication
                             </p>
                           </div>
                           
                           {/* CORS Notice */}
                           <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-lg">
                             <div className="flex items-start gap-3">
                               <div className="flex-shrink-0">
                                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                   <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                                 </svg>
                               </div>
