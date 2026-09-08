import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import OllamaStatus from "../../components/ai/OllamaStatus";
import { aiApi } from "../../services/aiApi";
import { Cpu, Terminal, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export default function AdminAISettings() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchModelDetails = async () => {
    setLoading(true);
    try {
      const data = await aiApi.ollama.getModels();
      setModelData(data);
    } catch (err) {
      console.warn("Failed to fetch model info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelDetails();
  }, []);

  return (
    <AdminLayout
      title="AI & Ollama Configuration"
      subtitle="Manage local Ollama connectivity, model routing, and local embedding engines."
      onRefresh={fetchModelDetails}
      refreshing={loading}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Live Status Card */}
        <OllamaStatus />

        {/* Task Model Routing Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-heading">
                Task-Based Model Routing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specialized tasks are routed to configured local models or fallback to the primary model.
              </p>
            </div>
            <button
              onClick={fetchModelDetails}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-amber-600" : "text-slate-500"} />
              <span>Refresh Models</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Simple Classification</div>
                  <div className="text-[11px] text-slate-500">Quick intent & category assignment</div>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                  {modelData?.task_routing?.simple_classification || "llama3.2:3b"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Normal Reasoning & Explanation</div>
                  <div className="text-[11px] text-slate-500">Supplier & stockout analysis</div>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                  {modelData?.task_routing?.normal_reasoning || "llama3.1:8b"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Complex Planning & Synthesis</div>
                  <div className="text-[11px] text-slate-500">Procurement multi-agent consensus</div>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                  {modelData?.task_routing?.complex_planning || "llama3.1:8b"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Vector Embeddings</div>
                  <div className="text-[11px] text-slate-500">pgvector RAG document indexing</div>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                  {modelData?.task_routing?.embeddings || "nomic-embed-text"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Local Setup Instructions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Terminal size={18} className="text-amber-600" />
            <h3 className="text-sm font-black text-slate-900 font-heading">
              Local Ollama Quickstart Instructions (Windows & Mac/Linux)
            </h3>
          </div>

          <div className="mt-4 space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
            <p>
              1. <strong>Start the local server</strong> in PowerShell or Command Prompt:
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 text-amber-400 font-mono text-[11px] overflow-x-auto select-all">
              ollama serve
            </pre>

            <p className="mt-2">
              2. <strong>Pull the recommended models</strong>:
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-1 select-all">
              <div>ollama pull llama3.1:8b</div>
              <div>ollama pull nomic-embed-text</div>
              <div>ollama pull llama3.2-vision</div>
            </pre>

            <p className="mt-2 text-slate-500">
              * Note: The platform operates with resilient deterministic logic and scikit-learn forecasting even if models are not yet pulled.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
