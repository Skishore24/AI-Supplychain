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
  Plus
} from "lucide-react";

import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderSuccess, setReorderSuccess] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/recommendations/summary`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/recommendations/inventory-alerts`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/sales/detailed`).then((r) => r.json())
    ])
      .then(([summaryData, alertsData, salesData]) => {
        setSummary(summaryData);
        setAlerts(alertsData.alerts || []);
        setRecentSales(salesData.slice(0, 5));
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
        body: JSON.stringify({ current_stock: newStock })
      });
      if (res.ok) {
        setReorderSuccess(`Successfully replenished +${reorderUnits} units!`);
        setTimeout(() => setReorderSuccess(null), 3000);
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Reorder failed:", e);
    }
  };

  return (
    <AdminLayout
      title="Supply Chain Executive Dashboard"
      subtitle="Autonomous multi-agent intelligence, inventory health, and procurement monitoring."
      onRefresh={fetchDashboardData}
      refreshing={loading}
    >
      {/* Toast */}
      {reorderSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/80 p-4 text-emerald-300 text-sm font-semibold">
          <CheckCircle2 size={18} />
          <span>{reorderSuccess}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Sales Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white">
            ${summary ? summary.total_revenue.toFixed(2) : "0.00"}
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} /> {summary ? summary.total_sales_units : 0} units fulfilled
          </div>
        </div>

        {/* Inventory Value */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Inventory Valuation</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Layers size={20} />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white">
            ${summary ? summary.total_inventory_value.toFixed(2) : "0.00"}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {summary ? summary.total_stock_units : 0} active stock units
          </div>
        </div>

        {/* Active Suppliers */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Verified Suppliers</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Truck size={20} />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white">
            {summary ? summary.total_suppliers : 0}
          </div>
          <div className="mt-2 text-xs text-indigo-400">
            Across {summary ? summary.total_products : 0} product lines
          </div>
        </div>

        {/* Supply Chain Health */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">AI Supply Health Score</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-purple-400">
            {summary ? summary.supply_chain_health_score : 0}/100
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {summary ? summary.low_stock_alerts_count : 0} low stock risks
          </div>
        </div>
      </div>

      {/* Main Grid: AI Restock Alerts & Recent Sales */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Restock Alerts Table */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Autonomous Restock Alerts</h2>
                <p className="text-xs text-slate-400">Agent 2: Real-time low-stock and safety-level mitigation</p>
              </div>
            </div>

            <Link to="/admin/inventory" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All Stock →
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-white">All inventory levels are healthy!</p>
              <p className="text-xs mt-1">No products currently below safety reorder levels.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.product_id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{alert.product_name}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            alert.severity === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400 font-mono">
                        SKU: {alert.sku} | Stock: <strong className="text-rose-400">{alert.current_stock}</strong> / Reorder Level: {alert.reorder_level}
                      </div>
                      <div className="mt-2 text-xs text-slate-300">
                        Recommended Supplier: <strong className="text-indigo-300">{alert.recommended_supplier}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickReorder(alert.product_id, alert.current_stock, alert.suggested_reorder_units)}
                      className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
                    >
                      <Plus size={14} /> Reorder +{alert.suggested_reorder_units} Units
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Activity Feed */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Sales Log</h2>
              <Link to="/admin/sales" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                View All →
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent sales records.</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{sale.product_name}</div>
                      <div className="text-slate-400">{sale.quantity_sold} units • {sale.sale_date}</div>
                    </div>
                    <div className="text-right font-bold text-emerald-400">
                      +${sale.total_revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <Link
              to="/admin/ai-agents"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition"
            >
              <Sparkles size={14} />
              <span>Explore Multi-Agent Sandbox</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;