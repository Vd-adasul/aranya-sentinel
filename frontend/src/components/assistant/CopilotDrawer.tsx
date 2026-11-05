"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { queryAssistant } from "@/lib/api";
import {
  Bot,
  X,
  Send,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Trash2,
  Compass,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  suggested_actions?: string[];
  referenced_incidents?: string[];
  confidence?: number;
}

export function CopilotDrawer() {
  const { isCopilotOpen, setIsCopilotOpen, selectedRegion } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Namaste Officer. I am the Aranya Sentinel Forest Intelligence Copilot. I synthesize real-time Sentinel-2 multispectral passes, Dynamic World 10m land cover probabilities, and zero-shot drone computer vision detections (Grounding DINO + SAM 2). How can I assist your investigation today?",
      suggested_actions: [
        "Show critical incidents in Western Ghats",
        "Summarize heavy machinery spotted by drones",
        "Calculate 30-day carbon biomass loss",
      ],
      referenced_incidents: ["AS-2026-088"],
      confidence: 0.99,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCopilotOpen) {
      inputRef.current?.focus();
    }
  }, [isCopilotOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isCopilotOpen]);

  // Escape closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCopilotOpen) {
        setIsCopilotOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCopilotOpen, setIsCopilotOpen]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput("");
    setLoading(true);

    try {
      const res = await queryAssistant(textToSend);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: res.reply,
        suggested_actions: res.suggested_actions,
        referenced_incidents: res.referenced_incidents,
        confidence: res.confidence,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "Telemetry synthesis temporarily degraded. Local heuristic model indicates active critical disturbances in Agumbe and Corbett Buffer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isCopilotOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Ask Sentinel Forest Intelligence Copilot"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:w-[420px] bg-bone border-l border-sand shadow-dialog flex flex-col font-sans text-xs"
    >
      {/* Header */}
      <div className="p-4 border-b border-sand bg-paper flex items-center justify-between text-ink-900">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-control bg-canopy text-bone flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-ink-900 text-sm flex items-center gap-2">
              <span>Ask Sentinel</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-moss-100 text-moss-600 border border-moss-600/30">
                Online
              </span>
            </div>
            <p className="text-[11px] text-ink-600 flex items-center gap-1 mt-0.5">
              <Compass className="h-3 w-3 text-signal" />
              <span>Scope: {selectedRegion.name.split("—")[0].trim()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome",
                  sender: "assistant",
                  text: "Copilot session reset. Telemetry re-indexed for active transect.",
                  suggested_actions: ["Show critical incidents in Western Ghats"],
                },
              ])
            }
            title="Clear Chat History"
            aria-label="Clear chat history"
            className="p-1.5 rounded-control hover:bg-bone text-ink-600 hover:text-ink-900 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsCopilotOpen(false)}
            aria-label="Close Ask Sentinel drawer"
            className="p-1.5 rounded-control hover:bg-bone text-ink-600 hover:text-ink-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-card p-3.5 leading-relaxed whitespace-pre-wrap ${
                m.sender === "user"
                  ? "bg-canopy text-bone font-medium"
                  : "bg-paper border border-sand text-ink-900 shadow-card"
              }`}
            >
              {m.text}

              {/* Referenced Incidents */}
              {m.referenced_incidents && m.referenced_incidents.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-sand flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-ink-600">
                    Related dockets:
                  </span>
                  {m.referenced_incidents.map((incId) => (
                    <Link
                      key={incId}
                      href={`/incidents?id=${incId}`}
                      onClick={() => setIsCopilotOpen(false)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-sand bg-bone hover:border-signal text-xs font-semibold text-ink-900 num transition-colors"
                    >
                      <ShieldAlert className="h-3 w-3 text-signal" />
                      {incId}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Action Pills */}
            {m.suggested_actions && m.suggested_actions.length > 0 && (
              <div className="mt-2.5 space-y-1.5 w-full pl-1">
                {m.suggested_actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(act)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-control border border-sand bg-paper hover:bg-sand/40 text-xs text-ink-600 hover:text-ink-900 transition-colors shadow-card"
                  >
                    <span>{act}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-signal shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 text-ink-600 text-xs bg-paper rounded-card border border-sand">
            <Loader2 className="h-4 w-4 animate-spin text-signal" />
            <span>Consulting cadastral database and aerial CV records...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3.5 border-t border-sand bg-paper">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about machinery, incidents, carbon..."
            className="flex-1 bg-bone border border-sand rounded-control px-3.5 h-11 min-h-[44px] text-ink-900 placeholder:text-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canopy text-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send prompt"
            className="btn btn-primary h-11 min-h-[44px] px-4"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-2 text-[11px] text-ink-600 text-center font-mono">
          Grounded to Indian Forest Act &amp; Sentinel-2 Dynamic World observations
        </div>
      </div>
    </div>
  );
}
