import { useEffect, useState } from "react";
import { Bot, Truck, Layers, BarChart3, CheckCircle2, Database } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";

function AdminAIAgents() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedSuccess, setSeedSuccess] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // Agent 1 interactive tester
  const [testProduct, setTestProduct] = useState("Lithium-Ion Battery Pack 5000mAh");
  const [agent1Result, setAgent1Result] = useState(null);
  const [agent1Loading, setAgent1Loading] = useState(false);

  const loadAgentData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/recommendations/summary`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/recommendations/inventory-alerts`).then((r) => r.json())
    ])
      .then(([summaryData, alertsData]) => {
        setSummary(summaryData);
        setAlerts(alertsData.alerts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading agent data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAgentData();
    runAgent1Test(testProduct);
  }, []);

  const runAgent1Test = (prodName) => {
    if (!prodName) return;
    setAgent1Loading(true);
    fetch(`${API_BASE_URL}/recommendations/supplier/${encodeURIComponent(prodName)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setAgent1Result(data);
        setAgent1Loading(false);
      })
      .catch(() => setAgent1Loading(false));
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/seed-data`, { method: "POST" });
      if (res.ok) {
        setSeedSuccess("Database verified and refreshed with sample records!");
        setTimeout(() => setSeedSuccess(null), 4000);
        loadAgentData();
        runAgent1Test(testProduct);
      }
    } catch (err) {
      console.error("Seed error:", err);
    }
    setSeeding(false);
  };

  return (
    <AdminLayout
      title="Decision Engines & Multi-Agent Models"
      subtitle="Interact with autonomous backend decision models managing supplier ranking, stockout mitigation, and demand."
      onRefresh={loadAgentData}
      refreshing={loading}
    >
      {seedSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs">
          <CheckCircle2 size={16} />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* Agents Overview Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700 mb-3">
              <Bot size={14} className="text-indigo-600" />
              <span>Multi-Agent Algorithmic Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Three Specialized Decision Models</h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every checkout, inventory shift, and supplier quote is processed through multi-criteria decision algorithms to prevent stockouts and optimize fulfillment routing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-xs"
            >
              <Database size={15} className={seeding ? "animate-spin text-indigo-600" : ""} />
              <span>{seeding ? "Seeding..." : "Load Initial Benchmark Records"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agent 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Agent 1: Supplier Optimizer</h3>
                <span className="text-[11px] text-blue-600 font-bold">Multi-Criteria Optimization</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamically computes price normalization (40%), quality reliability (35%), and delivery turnaround (25%) to select optimal vendors.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Interactive Component Test:</label>
              <input
                type="text"
                value={testProduct}
                onChange={(e) => {
                  setTestProduct(e.target.value);
                  runAgent1Test(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />

              {agent1Loading ? (
                <div className="mt-3 text-xs text-slate-400 text-center py-2">Evaluating suppliers...</div>
              ) : agent1Result && agent1Result.best_supplier ? (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs">
                  <div className="font-bold text-blue-900">Ranked #1: {agent1Result.best_supplier.name}</div>
                  <div className="mt-1 text-blue-800 text-[11px]">{agent1Result.recommendation_reason}</div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-400 text-center py-2">No supplier found for test.</div>
              )}
            </div>
          </div>
        </div>

        {/* Agent 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Agent 2: Restock Analyzer</h3>
                <span className="text-[11px] text-amber-600 font-bold">Stockout Mitigation</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Monitors stock-to-reorder ratios in real-time. Immediately flags items entering critical safety thresholds and generates replenishment orders.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Active Low-Stock Risks:</span>
                <span className="font-bold text-amber-600">{alerts.length} Items</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Critical Out-of-Stock:</span>
                <span className="font-bold text-rose-600">{summary?.critical_out_of_stock_count || 0}</span>
              </div>

              {alerts.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-2 pr-1">
                  {alerts.map((a) => (
                    <div key={a.product_id} className="rounded-lg bg-slate-50 p-2 text-[11px] border border-slate-200">
                      <div className="font-bold text-slate-900">{a.product_name}</div>
                      <div className="text-rose-600 font-medium">Stock: {a.current_stock} / Reorder: {a.reorder_level}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Agent 3: Demand Velocity</h3>
                <span className="text-[11px] text-purple-600 font-bold">Sales Run-rate Forecasting</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates burn rates, estimated days of inventory remaining, and revenue trends across active store categories.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Revenue Run:</span>
                <span className="font-bold text-emerald-600">${summary ? summary.total_revenue.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Units Dispatched:</span>
                <span className="font-bold text-slate-900">{summary ? summary.total_sales_units : 0} units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Supply Chain Health:</span>
                <span className="font-bold text-purple-600">{summary?.supply_chain_health_score || 0}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAIAgents;
