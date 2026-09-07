import React, { useEffect, useState } from "react";
import {
  Sliders,
  CheckCircle2,
  Save,
  Bell,
  Cpu,
  ShieldCheck,
  Zap,
  RefreshCw,
  Database
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    default_reorder_level: 15,
    safety_stock_multiplier: 1.25,
    auto_agent_run_interval_hours: 6,
    currency_symbol: "₹",
    low_stock_notification_enabled: true,
    po_auto_approval_threshold: 50000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.settings.get();
      if (data && typeof data === "object") {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn("Settings fetch fallback to defaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess("");

    try {
      await api.settings.update(settings);
      setSavedSuccess("System configuration updated successfully.");
      setTimeout(() => setSavedSuccess(""), 4000);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="System Configuration & Thresholds"
      subtitle="Define algorithmic risk parameters, automated reorder buffers, and operational notification rules."
      onRefresh={loadSettings}
      refreshing={loading}
    >
      {savedSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs animate-slide-down">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Multi-Agent Parameters */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 font-heading">Multi-Agent Intelligence Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Default Reorder Threshold Units
              </label>
              <input
                type="number"
                min="1"
                value={settings.default_reorder_level}
                onChange={(e) =>
                  setSettings({ ...settings, default_reorder_level: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Trigger level for Agent 2 stockout flags</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Safety Buffer Multiplier
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="3.0"
                value={settings.safety_stock_multiplier}
                onChange={(e) =>
                  setSettings({ ...settings, safety_stock_multiplier: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Dynamic volatility cushion (e.g. 1.25x lead time)</span>
            </div>
          </div>
        </div>

        {/* Procurement & Currency */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders size={18} className="text-indigo-500" />
            <h3 className="text-sm font-black text-slate-900 font-heading">Procurement & Financial Controls</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                System Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency_symbol}
                onChange={(e) =>
                  setSettings({ ...settings, currency_symbol: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Indian Rupee (₹) standard</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                PO Auto-Approval Ceiling (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.po_auto_approval_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, po_auto_approval_threshold: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Orders under this limit can be pre-approved</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-press flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-6 py-2.5 text-xs font-bold transition shadow-xs"
          >
            <Save size={14} />
            <span>{saving ? "Updating..." : "Save System Settings"}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
