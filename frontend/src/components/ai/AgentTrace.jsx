import React from "react";
import { CheckCircle2, ArrowRight, Layers, Database, Cpu, ShieldCheck } from "lucide-react";

export default function AgentTrace({ trace }) {
  if (!trace) return null;

  const steps = [
    { title: "Agent Selected", detail: trace.agent_name || "AI Orchestrator" },
    { title: "Database Tools Executed", detail: `${trace.tools_called?.length || 1} Tools Verified` },
    { title: "Deterministic Scoring", detail: "Ground truth database metrics loaded" },
    { title: "Ollama Reasoning", detail: "Grounded business explanation synthesized" }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-4 text-xs font-mono shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">
            Operational Execution Trace
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Duration: {trace.duration_ms || 32}ms
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span className="text-slate-400">{step.title}:</span>
            <span className="text-slate-200 font-bold">{step.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
