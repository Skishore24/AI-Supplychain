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
      title="Multi-Agent AI Control Center"
      subtitle="Interact with autonomous agents managing supplier ranking, stockout mitigation, and demand forecasting."
      onRefresh={loadAgentData}
      refreshing={loading}
    >
      {seedSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/80 p-4 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* Agents Overview Banner */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-purple-950/20 p-8 shadow-2xl backdrop-blur-md mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <Bot size={14} className="text-indigo-400" />
              <span>Autonomous Multi-Agent Architecture</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Three Specialized Agents Working in Concert</h2>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Every checkout, inventory shift, and supplier quote is processed through multi-criteria decision models to prevent stockouts and lower procurement overhead.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-900/40 px-5 py-3 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/70 hover:text-white transition shadow-md"
            >
              <Database size={15} className={seeding ? "animate-spin" : ""} />
              <span>{seeding ? "Seeding..." : "Refresh / Seed Sample Records"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Agent 1 */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Agent 1: Supplier Optimizer</h3>
                <span className="text-[11px] text-blue-400 font-semibold">Multi-Criteria Optimization</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically computes price normalization (40%), quality reliability (35%), and delivery turnaround (25%) to select optimal vendors.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Interactive Component Test:</label>
              <input
                type="text"
                value={testProduct}
                onChange={(e) => {
                  setTestProduct(e.target.value);
                  runAgent1Test(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />

              {agent1Loading ? (
                <div className="mt-4 text-xs text-slate-500 text-center py-4">Evaluating suppliers...</div>
              ) : agent1Result && agent1Result.best_supplier ? (
                <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 text-xs">
                  <div className="font-bold text-blue-300">Ranked #1: {agent1Result.best_supplier.name}</div>
                  <div className="mt-1 text-slate-300 text-[11px]">{agent1Result.recommendation_reason}</div>
                </div>
              ) : (
                <div className="mt-4 text-xs text-slate-500 text-center">No supplier found for test.</div>
              )}
            </div>
          </div>
        </div>

        {/* Agent 2 */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Agent 2: Restock Analyzer</h3>
                <span className="text-[11px] text-amber-400 font-semibold">Stockout Mitigation</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors stock-to-reorder ratios in real-time. Immediately flags items entering critical safety thresholds and generates order payloads.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Active Low-Stock Risks:</span>
                <span className="font-bold text-amber-400">{alerts.length} Items</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Critical Out-of-Stock:</span>
                <span className="font-bold text-rose-400">{summary?.critical_out_of_stock_count || 0}</span>
              </div>

              {alerts.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-2 pr-1">
                  {alerts.map((a) => (
                    <div key={a.product_id} className="rounded-lg bg-slate-950/80 p-2 text-[11px] border border-slate-800">
                      <div className="font-semibold text-white">{a.product_name}</div>
                      <div className="text-rose-400">Stock: {a.current_stock} / Reorder: {a.reorder_level}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent 3 */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Agent 3: Demand Velocity</h3>
                <span className="text-[11px] text-purple-400 font-semibold">Sales Run-rate Forecasting</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates daily burn rates, estimated days of inventory remaining, and revenue trends across active catalog categories.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Revenue Run:</span>
                <span className="font-bold text-emerald-400">${summary ? summary.total_revenue.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Units Dispatched:</span>
                <span className="font-bold text-white">{summary ? summary.total_sales_units : 0} units</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Supply Chain Health:</span>
                <span className="font-bold text-purple-400">{summary?.supply_chain_health_score || 0}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAIAgents;
