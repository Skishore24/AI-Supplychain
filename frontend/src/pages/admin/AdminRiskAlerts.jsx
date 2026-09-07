import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Layers,
  Sparkles,
  RefreshCw,
  XCircle,
  TrendingDown
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

export default function AdminRiskAlerts() {
  const [alertsData, setAlertsData] = useState(null);
  const [riskOverview, setRiskOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const [alertsRes, riskRes] = await Promise.all([
        api.alerts.needsAttention(),
        api.ai.riskOverview().catch(() => null),
      ]);
      setAlertsData(alertsRes);
      setRiskOverview(riskRes);
    } catch (err) {
      console.error("Risk alerts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const alerts = alertsData?.alerts || [];
  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === "all") return true;
    return (a.severity || "").toLowerCase() === filterSeverity.toLowerCase();
  });

  const criticalCount = alerts.filter((a) => (a.severity || "").toLowerCase() === "critical").length;
  const warningCount = alerts.filter((a) => (a.severity || "").toLowerCase() === "warning" || (a.severity || "").toLowerCase() === "high").length;

  return (
    <AdminLayout
      title="Supply Chain Risk & Anomaly Monitor"
      subtitle="Early-warning indicators for stockout vulnerabilities, lead-time delays, and vendor concentration bottlenecks."
      onRefresh={loadAlerts}
      refreshing={loading}
    >
      {/* KPI Severity Strip */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-700">
            <span>Critical Stockout Risks</span>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-rose-700 font-heading font-mono">{criticalCount}</div>
          <div className="mt-1 text-xs text-rose-600">Immediate replenishment required</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Lead Time Spikes</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-700 font-heading font-mono">{warningCount}</div>
          <div className="mt-1 text-xs text-amber-600">Monitored supplier shipping delays</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span>Overall Resilience Index</span>
            <ShieldCheck size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-700 font-heading font-mono">
            {criticalCount === 0 ? "98/100" : `${Math.max(60, 95 - criticalCount * 8)}/100`}
          </div>
          <div className="mt-1 text-xs text-emerald-600">Active automated safeguards</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter By Severity:</span>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterSeverity("all")}
              className={`px-3 py-1 rounded-lg transition ${
                filterSeverity === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity("critical")}
              className={`px-3 py-1 rounded-lg transition ${
                filterSeverity === "critical" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilterSeverity("warning")}
              className={`px-3 py-1 rounded-lg transition ${
                filterSeverity === "warning" ? "bg-amber-500 text-slate-950 shadow-2xs" : "text-slate-500"
              }`}
            >
              Warnings ({warningCount})
            </button>
          </div>
        </div>

        <Link
          to="/admin/purchase-orders"
          className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
        >
          Procurement Center
        </Link>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
            Analyzing telemetry anomalies...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-emerald-500 mb-2" />
            <h3 className="text-base font-bold text-emerald-900">All Operations Clear</h3>
            <p className="text-xs text-emerald-700 mt-1">No active stockout or supplier disruption alerts.</p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const isCrit = (alert.severity || "").toLowerCase() === "critical";
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-5 transition-all shadow-xs ${
                  isCrit
                    ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
                    : "border-amber-300 bg-amber-50/30 hover:border-amber-400"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isCrit ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            isCrit ? "bg-rose-600 text-white" : "bg-amber-500 text-slate-950"
                          }`}
                        >
                          {alert.severity || "Warning"}
                        </span>
                        <h4 className="font-heading font-black text-slate-900 text-sm">
                          {alert.title || alert.product_name || "Inventory Velocity Anomaly"}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {alert.message || alert.recommended_action || "Current stock is below buffer threshold."}
                      </p>
                      {alert.current_stock !== undefined && (
                        <div className="mt-2 flex items-center gap-4 text-[11px] font-mono text-slate-500">
                          <span>Physical Stock: <strong className="text-slate-800">{alert.current_stock}</strong> units</span>
                          <span>Reorder Point: <strong className="text-slate-800">{alert.reorder_level}</strong> units</span>
                          {alert.suggested_reorder_qty && (
                            <span className="text-emerald-700 font-bold">Recommended Replenish: +{alert.suggested_reorder_qty} units</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/admin/purchase-orders"
                      className={`btn-press rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs whitespace-nowrap flex items-center gap-1.5 ${
                        isCrit
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white"
                      }`}
                    >
                      <span>Resolve via PO</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
