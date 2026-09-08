import React, { useState, useEffect } from "react";
import { Cpu, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Terminal } from "lucide-react";
import { aiApi } from "../../services/aiApi";

export default function OllamaStatus({ onModelSelect, compact = false }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const data = await aiApi.ollama.getHealth();
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setHealth({
        available: false,
        message: err.message || "Failed to reach Ollama runtime."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const isOnline = health?.available === true;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-xs">
        <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
        <span className="text-slate-800">
          Ollama: {isOnline ? "Connected" : "Offline"}
        </span>
        {isOnline && health?.configured_model && (
          <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
            {health.configured_model}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}>
            <Cpu size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 font-heading">
                Local Ollama LLM Runtime
              </h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${isOnline ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {isOnline ? "Connected" : "Offline"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              URL: <span className="font-mono text-slate-700">{health?.base_url || "http://localhost:11434"}</span>
              {health?.version && <span> • v{health.version}</span>}
              {lastChecked && <span> • Checked at {lastChecked}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkConnection}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-amber-600" : "text-slate-500"} />
            <span>Check Connection</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {/* LLM Model Card */}
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Primary Reasoning LLM
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>{health?.configured_model || "llama3.1:8b"}</span>
            {health?.configured_model_available ? (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Installed</span>
            ) : (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Pending Pull</span>
            )}
          </div>
        </div>

        {/* Embedding Model Card */}
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Vector Embedding Model
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>{health?.embedding_model || "nomic-embed-text"}</span>
            {health?.embedding_available ? (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Installed</span>
            ) : (
              <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Fallback Active</span>
            )}
          </div>
        </div>

        {/* Vision Model Card */}
        <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Multimodal Vision Model
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>{health?.vision_model || "llama3.2-vision"}</span>
            {health?.vision_available ? (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Installed</span>
            ) : (
              <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
            )}
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ollama service is not running.</span> To enable AI explanations and local LLM reasoning:
            <div className="mt-1 font-mono text-[11px] bg-white/80 p-2 rounded-lg border border-amber-200 select-all">
              ollama serve
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              Deterministic scoring, inventory analysis, and ML forecasts remain 100% operational in fallback mode.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
