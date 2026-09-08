import React, { useState, useEffect } from "react";
import { Truck, Layers, TrendingUp, AlertTriangle, ShieldCheck, Database, Cpu } from "lucide-react";
import { aiApi } from "../../services/aiApi";

export default function AgentStatus() {
  const [summary, setSummary] = useState(null);
  const [ollama, setOllama] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      aiApi.recommendations.list().catch(() => ({ total_recommendations: 0 })),
      aiApi.knowledge.list().catch(() => ({ documents: [] })),
      aiApi.ollama.getHealth().catch(() => ({ available: false }))
    ]).then(([recData, kData, oData]) => {
      if (!mounted) return;
      const totalChunks = (kData.documents || []).reduce((acc, d) => acc + (d.chunk_count || 0), 0);
      setSummary({
        pendingRecs: (recData.recommendations || []).filter(r => r.status === "GENERATED").length,
        totalDocs: (kData.documents || []).length,
        totalChunks
      });
      setOllama(oData);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const agents = [
    {
      id: "supplier",
      name: "Supplier Agent",
      role: "Optimizer & Scoring",
      status: "Operational",
      icon: Truck,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accentColor: "text-emerald-600"
    },
    {
      id: "inventory",
      name: "Inventory Agent",
      role: "ROP & Stockout Risk",
      status: "Operational",
      icon: Layers,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      accentColor: "text-amber-600"
    },
    {
      id: "demand",
      name: "Demand Forecaster",
      role: "ML Time-Series 7/30/90d",
      status: "Trained",
      icon: TrendingUp,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentColor: "text-blue-600"
    },
    {
      id: "risk",
      name: "Risk Engine",
      role: "Anomaly Detection",
      status: "Active Monitoring",
      icon: AlertTriangle,
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      accentColor: "text-rose-600"
    },
    {
      id: "rag",
      name: "Enterprise RAG",
      role: "pgvector & Hybrid Search",
      status: `${summary?.totalChunks || 0} Chunks Indexed`,
      icon: Database,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accentColor: "text-purple-600"
    },
    {
      id: "ollama",
      name: "Ollama LLM",
      role: ollama?.configured_model || "llama3.1:8b",
      status: ollama?.available ? "Connected" : "Offline",
      icon: Cpu,
      badgeColor: ollama?.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200",
      accentColor: ollama?.available ? "text-emerald-600" : "text-rose-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {agents.map((ag) => {
        const Icon = ag.icon;
        return (
          <div
            key={ag.id}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-amber-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-slate-50 ${ag.accentColor}`}>
                  <Icon size={16} />
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ag.badgeColor}`}>
                  {ag.status}
                </span>
              </div>
              <div className="mt-2.5 font-bold text-xs text-slate-900 truncate">
                {ag.name}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-1">
              {ag.role}
            </div>
          </div>
        );
      })}
    </div>
  );
}
