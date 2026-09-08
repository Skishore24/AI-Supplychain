import React from "react";
import { AlertTriangle, AlertCircle, TrendingDown, Clock, ShieldAlert, ArrowRight } from "lucide-react";

export default function RiskCard({ risk }) {
  if (!risk) return null;

  const severity = risk.severity || "MEDIUM";
  const badgeClasses = {
    CRITICAL: "bg-rose-100 text-rose-800 border-rose-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
    LOW: "bg-blue-100 text-blue-800 border-blue-200",
  }[severity] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-300 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl border ${badgeClasses}`}>
              <AlertTriangle size={15} />
            </span>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                {severity} RISK
              </span>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                {risk.category || risk.risk_type}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Index</div>
            <div className="text-sm font-black text-rose-600 font-mono">
              {risk.risk_score ? Math.round(risk.risk_score) : 65}/100
            </div>
          </div>
        </div>

        <h4 className="text-sm font-black text-slate-900 font-heading mt-3">
          {risk.title}
        </h4>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {risk.reason}
        </p>

        {risk.affected_entity && (
          <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Affected Entity</span>
            <span className="font-bold text-slate-800">{risk.affected_entity}</span>
          </div>
        )}
      </div>

      {risk.recommended_action && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1 mb-1">
            <ArrowRight size={12} />
            <span>Recommended Mitigation</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {risk.recommended_action}
          </p>
        </div>
      )}
    </div>
  );
}
