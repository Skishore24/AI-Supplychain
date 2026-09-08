import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import RiskCard from "../../components/ai/RiskCard";
import { aiApi } from "../../services/aiApi";
import { AlertTriangle, ShieldAlert, Sparkles, Filter, RefreshCw } from "lucide-react";

export default function AdminRisk() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");

  const fetchRiskOverview = async () => {
    setLoading(true);
    try {
      const data = await aiApi.agents.run("risk_agent");
      setRiskData(data);
    } catch (err) {
      console.error("Failed to fetch risk overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskOverview();
  }, []);

  const risks = riskData?.risks || [];
  const filteredRisks = filterCategory === "ALL"
    ? risks
    : risks.filter(r => (r.category || r.risk_type).toUpperCase().includes(filterCategory));

  return (
    <AdminLayout
      title="Supply Chain Risk & Anomaly Command Center"
      subtitle="Real-time multi-anomaly engine tracking imminent stockouts, lead time slippages, and demand surges."
      onRefresh={fetchRiskOverview}
      refreshing={loading}
    >
      <div className="space-y-6">
        {/* Executive AI Briefing Card */}
        {riskData?.executive_briefing && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-800 tracking-wider mb-1">
              <Sparkles size={15} className="text-amber-600" />
              <span>AI Executive Risk Briefing</span>
            </div>
            <p className="text-xs text-amber-950 font-sans leading-relaxed whitespace-pre-line">
              {riskData.executive_briefing}
            </p>
          </div>
        )}

        {/* Risk Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Composite Risk Index</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              {riskData?.overall_risk_score || "18.5"}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              {riskData?.risk_level || "MODERATE"}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Critical Anomalies</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              {riskData?.critical_alerts_count || 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Requires immediate action</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Warning Alerts</span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {riskData?.warning_alerts_count || 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Scheduled replenishment</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Threat Signals</span>
            <div className="text-2xl font-black text-slate-800 font-mono mt-1">
              {riskData?.total_risks_count || risks.length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Continuously monitored</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "STOCKOUT", "DEMAND", "QUALITY", "SUPPLIER"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterCategory === cat
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Risk Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRisks.length === 0 ? (
            <div className="col-span-full p-8 rounded-2xl border border-dashed border-slate-200 bg-white text-center text-slate-400 text-xs">
              No anomalies detected under '{filterCategory}' category.
            </div>
          ) : (
            filteredRisks.map((r, idx) => (
              <RiskCard key={r.id || idx} risk={r} />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
