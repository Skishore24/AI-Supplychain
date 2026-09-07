import { useEffect, useState } from "react";
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
  BarChart3
} from "lucide-react";

import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";
import { formatINR, toINR } from "../../utils/currency";

// Animated counter hook
function useCounter(target, duration = 900, enabled = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || !target) return;
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
  const isRupee = String(value).startsWith("₹") || String(value).startsWith("$");
  const prefix = isRupee ? "₹" : "";
  const suffix = String(value).includes("/100") ? "/100" : "";
  const animated = useCounter(numericTarget, 900 + index * 100, loaded);

  const formattedValue = isRupee
    ? `₹${Math.round(animated).toLocaleString("en-IN")}`
    : `${prefix}${suffix ? animated.toFixed(0) : numericTarget % 1 !== 0 ? animated.toFixed(2) : Math.round(animated)}${suffix}`;

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

// Animated toast
function Toast({ message, onDismiss }) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm animate-slide-down">
      <div className="flex items-center gap-3 p-4 text-emerald-800 text-sm font-bold">
        <CheckCircle2 size={18} className="shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onDismiss} className="text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderSuccess, setReorderSuccess] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/recommendations/summary`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_BASE_URL}/recommendations/inventory-alerts`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_BASE_URL}/sales/detailed`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([sumData, alertsData, salesData]) => {
        setSummary(sumData);
        setAlerts(alertsData ? alertsData.alerts || [] : []);
        setRecentSales(Array.isArray(salesData) ? salesData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data load error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickReorder = async (productId, currentStock, reorderUnits) => {
    try {
      const newStock = currentStock + reorderUnits;
      const res = await fetch(`${API_BASE_URL}/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_stock: newStock }),
      });
      if (res.ok) {
        setReorderSuccess(`Successfully replenished +${reorderUnits} units in warehouse!`);
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Reorder failed:", e);
    }
  };

  const kpiCards = [
    {
      label: "Total Sales Revenue",
      value: summary ? `₹${toINR(summary.total_revenue)}` : "₹0",
      sub: `${summary?.total_sales_units ?? 0} total units sold to customers`,
      trend: "+16.8%",
      icon: IndianRupee,
      iconBg: "bg-emerald-50 text-emerald-600",
      iconColor: "text-emerald-600",
    },
    {
      label: "Warehouse Physical Stock",
      value: summary ? `${summary.total_stock_units ?? 0}` : "0",
      sub: `Available component units ready to ship`,
      trend: "Optimal",
      icon: Layers,
      iconBg: "bg-blue-50 text-blue-600",
      iconColor: "text-blue-600",
    },
    {
      label: "Store Catalog Items",
      value: summary ? `${summary.total_products ?? 0}` : "0",
      sub: `Active products listed on storefront`,
      trend: "Active",
      icon: Package,
      iconBg: "bg-amber-50 text-amber-600",
      iconColor: "text-amber-600",
    },
    {
      label: "Verified Suppliers",
      value: summary ? `${summary.total_suppliers}` : "0",
      sub: `${summary?.low_stock_alerts_count ?? 0} items need restock`,
      trend: "Verified",
      icon: Truck,
      iconBg: "bg-purple-50 text-purple-600",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <AdminLayout
      title="Store Dashboard & Overview"
      subtitle="Welcome to your store control center. Monitor sales revenue, live inventory levels, and one-click stock replenishment in Indian Rupees (₹)."
      onRefresh={fetchDashboardData}
      refreshing={loading}
    >
      {/* Toast Notification */}
      {reorderSuccess && (
        <Toast message={reorderSuccess} onDismiss={() => setReorderSuccess(null)} />
      )}

      {/* ── QUICK ACTIONS BAR ────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">
            ⚡
          </span>
          <div>
            <div className="text-xs font-bold text-slate-800">Quick Shortcuts</div>
            <div className="text-[11px] text-slate-400">Frequently used management tools</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <Plus size={13} />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <Layers size={13} className="text-blue-600" />
            <span>Update Stock</span>
          </Link>
          <Link
            to="/admin/suppliers"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <Truck size={13} className="text-amber-600" />
            <span>Manage Suppliers</span>
          </Link>
          <Link
            to="/admin/sales"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <BarChart3 size={13} className="text-emerald-600" />
            <span>Order History</span>
          </Link>
        </div>
      </div>

      {/* ── KPI STATS CARDS ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 rounded-3xl bg-white animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, i) => (
            <KPICard key={i} {...card} index={i} loaded={!loading} />
          ))}
        </div>
      )}

      {/* ── MAIN BENTO GRID: ALERTS & RECENT SALES ───────────────────── */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        
        {/* Restock Alerts */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs animate-slide-up" style={{ animationDelay: "320ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h2 className="text-base font-heading font-black text-slate-900">
                  Low Stock Warnings (Restock Needed)
                </h2>
                <p className="text-xs text-slate-500">Items below safety limits. Click below to add units directly to stock.</p>
              </div>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors">
              Manage All Stock &rarr;
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-slate-800">All inventory levels are healthy!</p>
              <p className="text-xs mt-1">No products currently below safety reorder levels.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={alert.product_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{alert.product_name}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            alert.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 font-mono">
                        SKU: {alert.sku} | In Stock:{" "}
                        <strong className="text-rose-600 font-bold">{alert.current_stock}</strong> / Reorder: {alert.reorder_level}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Suggested Supplier:{" "}
                        <strong className="text-amber-800 font-semibold">{alert.recommended_supplier}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickReorder(alert.product_id, alert.current_stock, alert.suggested_reorder_units)}
                      className="btn-press shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Reorder +{alert.suggested_reorder_units} Units
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Log */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-heading font-black text-slate-900">Recent Sales Log</h2>
              <Link to="/admin/sales" className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors">
                View All &rarr;
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400 text-xs">
                No recent sales recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {recentSales.slice(0, 6).map((sale) => (
                  <div key={sale.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{sale.product_name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{sale.quantity_sold} units &middot; {sale.sale_date}</div>
                    </div>
                    <div className="text-right font-heading font-black text-emerald-600">
                      +{formatINR(toINR(sale.total_revenue))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/admin/inventory"
              className="btn-press flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-100 hover:bg-slate-950 hover:text-white py-2.5 text-xs font-bold text-slate-800 transition-all group"
            >
              <Layers size={14} className="group-hover:text-white transition-colors" />
              <span>Manage Warehouse Stock</span>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;