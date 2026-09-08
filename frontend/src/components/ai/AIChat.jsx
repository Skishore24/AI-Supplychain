import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import { useAIChat } from "../../hooks/useAIChat";
import SourceCitation from "./SourceCitation";

const SUGGESTED_QUERIES = [
  "Which supplier is best for SKU-1004?",
  "Why is SKU-1004 at risk?",
  "What does our procurement policy say about emergency purchasing?",
  "Which products are likely to stock out next week?",
  "How many units should we order for replenishment?"
];

export default function AIChat({ onActionTriggered }) {
  const { messages, loading, error, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    sendMessage(text);
  };

  const handleSuggestedClick = (q) => {
    if (loading) return;
    sendMessage(q);
  };

  return (
    <div className="flex flex-col h-[650px] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-bold shadow-xs">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 font-heading">
                Supply Chain AI Copilot
              </h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500">
              Grounded in real DB inventory, suppliers, ML forecasts & RAG policies
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Clear conversation"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3 border border-amber-200">
              <Sparkles size={24} />
            </div>
            <h4 className="text-base font-black text-slate-900 font-heading">
              Enterprise Multi-Agent Intelligence
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ask about supplier selection, stockout alerts, demand projections, or corporate procurement guidelines.
            </p>

            {/* Suggested Prompt Chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q)}
                  className="rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 px-3 py-1.5 text-xs text-slate-700 font-medium transition cursor-pointer text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-slate-950 text-amber-400"
                    : "bg-amber-500 text-white shadow-xs"
                }`}
              >
                {isUser ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs font-sans leading-relaxed ${
                  isUser
                    ? "bg-slate-950 text-white rounded-tr-xs shadow-xs"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs"
                }`}
              >
                {/* Agent attribution pill */}
                {!isUser && msg.agent && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                    <Sparkles size={10} />
                    <span>{msg.agent.replace(/_/g, " ")}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.content}
                </div>

                {/* Grounded Sources / Citations */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <SourceCitation sources={msg.sources} />
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
              <Bot size={15} />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw size={13} className="animate-spin text-amber-600" />
              <span>Orchestrating agents and retrieving verified metrics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 focus-within:border-amber-500 focus-within:bg-white transition">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about suppliers, inventory risks, forecasts, or policy..."
            disabled={loading}
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden py-1.5"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-amber-400 hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
