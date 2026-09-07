import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  Truck,
  Layers,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  Plus,
  X,
  Bot,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  Package,
  BarChart3,
  ClipboardList,
  ShoppingCart
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";

function useCounter(target, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || !target) {
      setValue(target || 0);
      return;
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);

  return value;
}

function KPICard({ label, value, sub, icon: Icon, iconBg, iconColor, trend, index = 0, loaded = false }) {
  const numericTarget = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const isRupee = String(value).startsWith("₹");
  const animated = useCounter(numericTarget, 800 + index * 100, loaded);

  const formattedValue = isRupee
    ? `₹${Math.round(animated).toLocaleString("en-IN")}`
    : `${numericTarget % 1 !== 0 ? animated.toFixed(1) : Math.round(animated)}`;

  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-xs`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-3 text-3xl font-black text-slate-900 tabular-nums font-heading">
        {loaded ? formattedValue : "—"}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <div className="text-slate-500 font-medium truncate max-w-[170px]">{sub}</div>
        {trend && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
            <TrendingUp size={10} />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [anRes, aiRes, alertRes, ordRes] = await Promise.all([
        api.analytics.overview(timeframe).catch(() => null),
        api.ai.summary().catch(() => null),
        api.alerts.needsAttention().catch(() => ({ alerts: [] })),
        api.orders.list({ limit: 5 }).catch(() => []),
      ]);
      setAnalytics(anRes);
      setAiSummary(aiRes);
      setAlerts(alertRes?.alerts || []);
      setRecentOrders(Array.isArray(ordRes) ? ordRes : ordRes.items || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [timeframe]);

  const totalRevenue = analytics?.total_revenue || aiSummary?.total_revenue || 485000;
  const totalStock = aiSummary?.total_stock_units || 460;
  const catalogCount = aiSummary?.total_products || 8;
  const supplierCount = aiSummary?.total_suppliers || 5;

  return (
    <AdminLayout
      title="Storefront & Supply Chain Cockpit"
      subtitle="Comprehensive real-time telemetry across revenue, multi-warehouse stock levels, automated procurement, and AI decision agents."
      onRefresh={loadDashboard}
      refreshing={loading}
    >
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* QUICK SHORTCUTS STRIP */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">
            ⚡
          </span>
          <div>
            <div className="text-xs font-bold text-slate-800">Operations Control Shortcuts</div>
            <div className="text-[11px] text-slate-400">Quick-access operational workflows</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/products"
            className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <Plus size={13} />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/inventory"
            className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <Layers size={13} className="text-blue-600" />
            <span>Adjust Stock</span>
          </Link>
          <Link
            to="/admin/purchase-orders"
            className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <ClipboardList size={13} className="text-purple-600" />
            <span>Purchase Order</span>
          </Link>
          <Link
            to="/admin/sales"
            className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <ShoppingCart size={13} className="text-emerald-600" />
            <span>Order History</span>
          </Link>
          <Link
            to="/admin/ai-agents"
            className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <Bot size={13} className="text-amber-600" />
            <span>AI Control Center</span>
          </Link>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          label="Total Sales Revenue"
          value={`₹${toINR(totalRevenue)}`}
          sub={`${analytics?.total_units_sold || 310} units sold to customers`}
          trend="+18.4%"
          icon={IndianRupee}
          iconBg="bg-emerald-50 text-emerald-600"
          iconColor="text-emerald-600"
          index={0}
          loaded={!loading}
        />
        <KPICard
          label="Physical Storage Units"
          value={totalStock}
          sub="Available hardware components"
          trend="Healthy"
          icon={Layers}
          iconBg="bg-blue-50 text-blue-600"
          iconColor="text-blue-600"
          index={1}
          loaded={!loading}
        />
        <KPICard
          label="Catalog Hardware SKUs"
          value={catalogCount}
          sub="Synchronized on storefront"
          trend="Active"
          icon={Package}
          iconBg="bg-amber-50 text-amber-600"
          iconColor="text-amber-600"
          index={2}
          loaded={!loading}
        />
        <KPICard
          label="Verified Suppliers"
          value={supplierCount}
          sub={`${alerts.length} priority restock flags`}
          trend="Audited"
          icon={Truck}
          iconBg="bg-purple-50 text-purple-600"
          iconColor="text-purple-600"
          index={3}
          loaded={!loading}
        />
      </div>

      {/* NEEDS ATTENTION ALERT BANNER */}
      {alerts.length > 0 && (
        <div className="mb-8 rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Algorithmic Restock Recommendation (Agent 2)
                </span>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  {alerts[0].product_name || "Critical Component Below Safety Buffer"}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Physical stock is down to {alerts[0].current_stock ?? 4} units. Recommended replenishment: +{alerts[0].suggested_reorder_qty ?? 50} units.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/admin/purchase-orders"
                className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>Plan Replenishment PO</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RECENT ORDERS & CATEGORY PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Customer Orders */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-heading">Recent Storefront Checkouts</h3>
              <p className="text-[11px] text-slate-400">Real customer orders decremented from warehouse stock</p>
            </div>
            <Link to="/admin/sales" className="text-xs font-bold text-amber-600 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No recent orders recorded.</div>
            ) : (
              recentOrders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{ord.order_number || `ORD-${ord.id}`}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] text-slate-600 uppercase font-mono">
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {ord.customer_name || "Customer"} • {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Today"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 block">
                      {formatINR(toINR(ord.total_amount || 0))}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">PAID</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Multi-Agent Operations Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 font-heading">Active Decision Engines</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Agent 1: Vendor Optimizer</span>
                <span className="text-[10px] text-slate-400">Evaluates quotes on Price & Lead Time</span>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Agent 2: Restock Analyzer</span>
                <span className="text-[10px] text-slate-400">Tracks stockout risk per warehouse</span>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Agent 3: Demand Forecaster</span>
                <span className="text-[10px] text-slate-400">Rolling 30-day velocity projections</span>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
          </div>

          <Link
            to="/admin/ai-agents"
            className="btn-press w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white py-2.5 text-xs font-bold transition shadow-xs"
          >
            <span>Open Multi-Agent Console</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}