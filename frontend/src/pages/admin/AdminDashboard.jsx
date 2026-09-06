import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Truck,
  Layers,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  Plus,
  X
} from "lucide-react";

import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";

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

function KPICard({ label, value, sub, icon: Icon, iconBg, iconColor, index = 0, loaded = false }) {
  const numericTarget = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const prefix = String(value).startsWith("$") ? "$" : "";
  const suffix = String(value).includes("/100") ? "/100" : "";
  const animated = useCounter(numericTarget, 900 + index * 100, loaded);

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900 tabular-nums">
        {loaded
          ? `${prefix}${suffix ? animated.toFixed(0) : numericTarget % 1 !== 0 ? animated.toFixed(2) : Math.round(animated)}${suffix}`
          : "—"}
      </div>
      <div className="mt-2 text-xs font-medium text-slate-500">{sub}</div>
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
        <button onClick={onDismiss} className="text-emerald-600 hover:text-emerald-800 transition-colors">
          <X size={16} />
        </button>
      </div>
      {/* Auto-dismiss progress bar */}
      <div className="h-1 bg-emerald-200">
        <div className="toast-progress h-full bg-emerald-500 rounded-full" />
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
      .then(([summaryData, alertsData, salesData]) => {
        setSummary(summaryData);
        setAlerts(Array.isArray(alertsData?.alerts) ? alertsData.alerts : []);
        setRecentSales(Array.isArray(salesData) ? salesData.slice(0, 5) : []);
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
        setReorderSuccess(`Successfully replenished +${reorderUnits} units!`);
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Reorder failed:", e);
    }
  };

  const kpiCards = [
    {
      label: "Total Sales Revenue",
      value: summary ? `$${summary.total_revenue.toFixed(2)}` : "$0.00",
      sub: (
        <span className="flex items-center gap-1 text-emerald-600 font-bold">
          <TrendingUp size={12} /> {summary?.total_sales_units ?? 0} total units sold
        </span>
      ),
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Inventory Value",
      value: summary ? `$${summary.total_inventory_value.toFixed(2)}` : "$0.00",
      sub: `${summary?.total_stock_units ?? 0} units in warehouse`,
      icon: Layers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Suppliers",
      value: summary ? `${summary.total_suppliers}` : "0",
      sub: (
        <span className="text-indigo-600 font-bold">
          Across {summary?.total_products ?? 0} product lines
        </span>
      ),
      icon: Truck,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Health Rating",
      value: summary ? `${summary.supply_chain_health_score}/100` : "0/100",
      sub: `${summary?.low_stock_alerts_count ?? 0} stockout warnings`,
      icon: Activity,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <AdminLayout
      title="Store & Supply Chain Executive Overview"
      subtitle="Real-time sales revenue, inventory valuation, stock alerts, and procurement."
      onRefresh={fetchDashboardData}
      refreshing={loading}
    >
      {/* Toast */}
      {reorderSuccess && (
        <Toast
          message={reorderSuccess}
          onDismiss={() => setReorderSuccess(null)}
        />
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, i) => (
            <KPICard key={i} {...card} index={i} loaded={!loading} />
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Restock Alerts */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-slide-up" style={{ animationDelay: "320ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Automated Restock Alerts</h2>
                <p className="text-xs text-slate-500">Real-time low-stock detection & auto-reorder suggestions</p>
              </div>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              View All Stock →
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 animate-fade-in">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-slate-800">All inventory levels are healthy!</p>
              <p className="text-xs mt-1">No products currently below safety reorder levels.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={alert.product_id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 animate-slide-in-left"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{alert.product_name}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            alert.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 font-mono">
                        SKU: {alert.sku} | In Stock:{" "}
                        <strong className="text-rose-600">{alert.current_stock}</strong> / Reorder Level: {alert.reorder_level}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Suggested Supplier:{" "}
                        <strong className="text-indigo-700">{alert.recommended_supplier}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickReorder(alert.product_id, alert.current_stock, alert.suggested_reorder_units)}
                      className="btn-press shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm hover:shadow-indigo-600/30 hover:shadow-md transition-all duration-200"
                    >
                      <Plus size={14} /> Reorder +{alert.suggested_reorder_units} Units
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900">Recent Sales Log</h2>
              <Link to="/admin/sales" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                View All →
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent sales recorded.</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale, i) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 p-3 text-xs border border-slate-100 transition-colors duration-150 animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{sale.product_name}</div>
                      <div className="text-slate-500">{sale.quantity_sold} units • {sale.sale_date}</div>
                    </div>
                    <div className="text-right font-black text-emerald-600">
                      +${sale.total_revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/admin/inventory"
              className="btn-press flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white py-2.5 text-xs font-bold text-slate-800 transition-all duration-200 group"
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