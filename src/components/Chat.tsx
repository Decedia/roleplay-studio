"use client";

import React, { useState, useEffect } from "react";
import { LLMProviderType, GlobalInstructions, Instruction, InstructionRole, InstructionPosition } from "@/lib/types";
import { AVAILABLE_PROVIDERS } from "@/lib/providers";
import { loadGlobalInstructions, saveGlobalInstructions } from "@/lib/storage";
import {
  DEFAULT_FORMATTING_PROMPT,
  DEFAULT_CONTINUE_INSTRUCTION,
  DEFAULT_IMAGE_GENERATION_INSTRUCTIONS,
  DEFAULT_GENERATOR_INSTRUCTIONS,
  DEFAULT_BRAINSTORM_INSTRUCTIONS,
  DEFAULT_VN_INSTRUCTIONS
} from "@/lib/constants";

type TabType = "chat" | "generator" | "brainstorm" | "vn";

export default function Chat() {
  const [globalInstructions, setGlobalInstructions] = useState<GlobalInstructions>(() => loadGlobalInstructions());
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  // Save instructions when they change
  const updateInstructions = (newInstructions: GlobalInstructions) => {
    setGlobalInstructions(newInstructions);
    saveGlobalInstructions(newInstructions);
  };

  const addInstruction = (name: string, content: string, role: InstructionRole, position: InstructionPosition) => {
    const newInstruction: Instruction = {
      id: Date.now().toString(),
      name,
      content,
      role,
      position,
      enabled: true,
      order: globalInstructions.instructions.length,
    };

    updateInstructions({
      ...globalInstructions,
      instructions: [...globalInstructions.instructions, newInstruction],
    });
  };

  const updateInstruction = (id: string, updates: Partial<Instruction>) => {
    updateInstructions({
      ...globalInstructions,
      instructions: globalInstructions.instructions.map(inst =>
        inst.id === id ? { ...inst, ...updates } : inst
      ),
    });
  };

  const deleteInstruction = (id: string) => {
    updateInstructions({
      ...globalInstructions,
      instructions: globalInstructions.instructions.filter(inst => inst.id !== id),
    });
  };

  const moveInstruction = (id: string, direction: "up" | "down") => {
    const instructions = [...globalInstructions.instructions];
    const index = instructions.findIndex(inst => inst.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= instructions.length) return;

    // Swap orders
    const tempOrder = instructions[index].order;
    instructions[index].order = instructions[newIndex].order;
    instructions[newIndex].order = tempOrder;

    // Sort by order
    instructions.sort((a, b) => a.order - b.order);

    updateInstructions({
      ...globalInstructions,
      instructions,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">AI Chat</h1>
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Instructions
          </button>
        </header>

        <div className="bg-gray-800 rounded-lg p-6 min-h-[400px]">
          <p className="text-gray-400 text-center">
            Chat interface coming soon...
          </p>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Instructions</h2>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              {[
                { id: "chat" as TabType, label: "Chat" },
                { id: "generator" as TabType, label: "Generator" },
                { id: "brainstorm" as TabType, label: "Brainstorm" },
                { id: "vn" as TabType, label: "VN" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "chat" && (
                <div className="space-y-6">
                  {/* Formatting Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Formatting Prompt
                    </label>
                    <textarea
                      value={globalInstructions.formattingPrompt || DEFAULT_FORMATTING_PROMPT}
                      onChange={(e) => updateInstructions({
                        ...globalInstructions,
                        formattingPrompt: e.target.value
                      })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter formatting instructions..."
                    />
                  </div>

                  {/* Jailbreak Instructions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Jailbreak Instructions
                      </label>
                      <button
                        onClick={() => updateInstructions({
                          ...globalInstructions,
                          enableJailbreak: !globalInstructions.enableJailbreak
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          globalInstructions.enableJailbreak ? "bg-amber-600" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            globalInstructions.enableJailbreak ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {globalInstructions.enableJailbreak && (
                      <textarea
                        value={globalInstructions.jailbreakInstructions || ""}
                        onChange={(e) => updateInstructions({
                          ...globalInstructions,
                          jailbreakInstructions: e.target.value
                        })}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Enter jailbreak instructions..."
                      />
                    )}
                  </div>

                  {/* Continue Instruction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Continue Instruction
                    </label>
                    <textarea
                      value={globalInstructions.continueInstruction || DEFAULT_CONTINUE_INSTRUCTION}
                      onChange={(e) => updateInstructions({
                        ...globalInstructions,
                        continueInstruction: e.target.value
                      })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter continue instructions..."
                    />
                  </div>

                  {/* Image Generation Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Generation Instructions
                    </label>
                    <textarea
                      value={globalInstructions.imageGenerationInstructions || DEFAULT_IMAGE_GENERATION_INSTRUCTIONS}
                      onChange={(e) => updateInstructions({
                        ...globalInstructions,
                        imageGenerationInstructions: e.target.value
                      })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Enter image generation instructions..."
                    />
                  </div>

                  {/* Instructions List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Instructions List</h3>
                      <button
                        onClick={() => {
                          const name = prompt("Instruction name:");
                          const content = prompt("Instruction content:");
                          if (name && content) {
                            addInstruction(name, content, "system", "before_context");
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                      >
                        Add Instruction
                      </button>
                    </div>

                    <div className="space-y-2">
                      {globalInstructions.instructions.map((instruction, index) => (
                        <div key={instruction.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={instruction.enabled}
                                onChange={(e) => updateInstruction(instruction.id, { enabled: e.target.checked })}
                                className="rounded"
                              />
                              <span className="font-medium">{instruction.name}</span>
                              <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                                {instruction.role} • {instruction.position}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => moveInstruction(instruction.id, "up")}
                                disabled={index === 0}
                                className={`p-1 ${index === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white'} transition-colors`}
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveInstruction(instruction.id, "down")}
                                disabled={index === globalInstructions.instructions.length - 1}
                                className={`p-1 ${index === globalInstructions.instructions.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'} transition-colors`}
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => deleteInstruction(instruction.id)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={instruction.content}
                            onChange={(e) => updateInstruction(instruction.id, { content: e.target.value })}
                            className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "generator" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generator Instructions
                    </label>
                    <textarea
                      value={globalInstructions.generatorInstructions || DEFAULT_GENERATOR_INSTRUCTIONS}
                      onChange={(e) => updateInstructions({
                        ...globalInstructions,
                        generatorInstructions: e.target.value
                      })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                      placeholder="Enter generator instructions..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "brainstorm" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Brainstorm Instructions
                    </label>
                    <textarea
                      value={globalInstructions.brainstormInstructions || DEFAULT_BRAINSTORM_INSTRUCTIONS}
                      onChange={(e) => updateInstructions({
                        ...globalInstructions,
                        brainstormInstructions: e.target.value
                      })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                      placeholder="Enter brainstorm instructions..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "vn" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Visual Novel Instructions
                    </label>
                    <textarea
                      value={globalInstructions.vnInstructions || DEFAULT_VN_INSTRUCTIONS}
                      onChange={(e) => updateInstructions({
                        ...globalInstructions,
                        vnInstructions: e.target.value
                      })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                      placeholder="Enter VN instructions..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}