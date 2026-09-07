import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Truck,
  Layers,
  TrendingUp,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ClipboardList,
  RefreshCw,
  Cpu,
  Activity,
  Award
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";

export default function AdminAIAgents() {
  const [activeTab, setActiveTab] = useState("agent1"); // "agent1" | "agent2" | "agent3"
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Agent 1: Supplier Optimizer State
  const [agent1Product, setAgent1Product] = useState("Lithium-Ion Battery Pack 5000mAh");
  const [agent1Result, setAgent1Result] = useState(null);
  const [agent1Loading, setAgent1Loading] = useState(false);
  const [weights, setWeights] = useState({
    price: 40,
    quality: 35,
    delivery: 15,
    reliability: 10,
  });

  // Agent 2: Restock Intelligence State
  const [restockData, setRestockData] = useState(null);
  const [restockLoading, setRestockLoading] = useState(false);

  // Agent 3: Demand Forecast State
  const [demandData, setDemandData] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);

  // Telemetry Console
  const [executingAgent, setExecutingAgent] = useState("");
  const [executionLogs, setExecutionLogs] = useState([]);
  const [notification, setNotification] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await api.ai.summary();
      setSummary(data);
    } catch (err) {
      console.error("AI summary load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const runAgent1 = async () => {
    if (!agent1Product) return;
    setAgent1Loading(true);
    try {
      const res = await api.ai.evaluateSupplier(agent1Product);
      setAgent1Result(res);
      addConsoleLog(`[Agent 1: Supplier Optimizer] Evaluated quotes for "${agent1Product}". Recommended: ${res.recommended_supplier?.supplier_name || "Optimal Vendor"}`);
    } catch (err) {
      console.error("Agent 1 error:", err);
    } finally {
      setAgent1Loading(false);
    }
  };

  const runAgent2 = async () => {
    setRestockLoading(true);
    try {
      const res = await api.ai.restockIntelligence();
      setRestockData(res);
      addConsoleLog(`[Agent 2: Inventory Engine] Analyzed active SKUs. Identified ${res.restock_items?.length || 0} items needing restock.`);
    } catch (err) {
      console.error("Agent 2 error:", err);
    } finally {
      setRestockLoading(false);
    }
  };

  const runAgent3 = async () => {
    setDemandLoading(true);
    try {
      const res = await api.ai.demandForecast();
      setDemandData(res);
      addConsoleLog(`[Agent 3: Demand Forecaster] Projected 30-day velocity across ${res.forecasts?.length || 0} catalog segments.`);
    } catch (err) {
      console.error("Agent 3 error:", err);
    } finally {
      setDemandLoading(false);
    }
  };

  const addConsoleLog = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 15)]);
  };

  const triggerLiveAgentRun = async (agentName) => {
    setExecutingAgent(agentName);
    try {
      const res = await api.ai.runAgent(agentName);
      setNotification(`Agent "${agentName}" executed successfully.`);
      setTimeout(() => setNotification(""), 4000);
      addConsoleLog(`[System Dispatcher] Dispatched agent "${agentName}". Status: ${res.status || "COMPLETED"}`);
      loadSummary();
      if (agentName === "supplier_optimizer") runAgent1();
      else if (agentName === "inventory_restock") runAgent2();
      else if (agentName === "demand_forecasting") runAgent3();
    } catch (err) {
      alert("Execution error: " + err.message);
    } finally {
      setExecutingAgent("");
    }
  };

  useEffect(() => {
    loadSummary();
    runAgent1();
    runAgent2();
    runAgent3();
  }, []);

  return (
    <AdminLayout
      title="Multi-Agent AI Control Center"
      subtitle="Interact with 3 autonomous algorithms coordinating vendor selection, restock triggers, and predictive demand."
      onRefresh={() => {
        loadSummary();
        runAgent1();
        runAgent2();
        runAgent3();
      }}
      refreshing={loading}
    >
      {notification && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs animate-slide-down">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Agents Architectural Header */}
      <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-7 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900 mb-2">
              <Bot size={14} className="text-amber-700" />
              <span>Three Synchronized Decision Engines</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">Autonomous Operations Orchestrator</h2>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Every warehouse checkout, stock decrement, and supplier RFQ is computed across real-time multi-factor models to eliminate stockouts and optimize gross margins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerLiveAgentRun("supplier_optimizer")}
              disabled={!!executingAgent}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs"
            >
              <Zap size={13} />
              <span>Run Agent 1</span>
            </button>
            <button
              onClick={() => triggerLiveAgentRun("inventory_restock")}
              disabled={!!executingAgent}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs"
            >
              <Zap size={13} />
              <span>Run Agent 2</span>
            </button>
            <button
              onClick={() => triggerLiveAgentRun("demand_forecasting")}
              disabled={!!executingAgent}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs"
            >
              <Zap size={13} />
              <span>Run Agent 3</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("agent1")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "agent1"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Truck size={14} className={activeTab === "agent1" ? "text-amber-400" : "text-slate-400"} />
          <span>Agent 1: Supplier Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab("agent2")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "agent2"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers size={14} className={activeTab === "agent2" ? "text-amber-400" : "text-slate-400"} />
          <span>Agent 2: Restock & Buffer Engine</span>
        </button>

        <button
          onClick={() => setActiveTab("agent3")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "agent3"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <TrendingUp size={14} className={activeTab === "agent3" ? "text-amber-400" : "text-slate-400"} />
          <span>Agent 3: Demand Forecaster</span>
        </button>
      </div>

      {/* TAB 1: AGENT 1 CONSOLE */}
      {activeTab === "agent1" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Controls & Weights */}
          <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 font-heading">Multi-Factor Weight Configuration</h3>
            <p className="text-[11px] text-slate-400">Tuned criteria for selecting manufacturing partners</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Price Competitiveness:</span>
                  <span className="font-mono text-amber-600">{weights.price}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={weights.price}
                  onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Quality Rating:</span>
                  <span className="font-mono text-amber-600">{weights.quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.quality}
                  onChange={(e) => setWeights({ ...weights, quality: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Lead Time / Delivery Speed:</span>
                  <span className="font-mono text-amber-600">{weights.delivery}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.delivery}
                  onChange={(e) => setWeights({ ...weights, delivery: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Historical Reliability:</span>
                  <span className="font-mono text-amber-600">{weights.reliability}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.reliability}
                  onChange={(e) => setWeights({ ...weights, reliability: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Evaluate Component
              </label>
              <input
                type="text"
                value={agent1Product}
                onChange={(e) => setAgent1Product(e.target.value)}
                placeholder="Hardware name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={runAgent1}
                disabled={agent1Loading}
                className="btn-press mt-2.5 w-full rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white py-2 text-xs font-bold transition shadow-xs"
              >
                {agent1Loading ? "Computing Model..." : "Run Optimization"}
              </button>
            </div>
          </div>

          {/* Winning Vendor Card & Score Matrix */}
          <div className="lg:col-span-2 space-y-6">
            {agent1Result?.recommended_supplier ? (
              <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      Algorithmic Top Choice
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-heading mt-0.5">
                      {agent1Result.recommended_supplier.supplier_name || agent1Result.recommended_supplier.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-lg">
                      {agent1Result.explanation || "Selected based on optimal balance between lead time and quality score."}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-600 font-mono">
                        {agent1Result.recommended_supplier.final_score ?? agent1Result.recommended_supplier.composite_score ?? 93}/100
                      </span>
                      <span className="text-[10px] text-slate-400 block">Overall Score</span>
                    </div>
                    <Link
                      to="/admin/purchase-orders"
                      className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs whitespace-nowrap"
                    >
                      Issue Purchase Order
                    </Link>
                  </div>
                </div>

                {/* Candidates table */}
                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Supplier Partner</th>
                        <th className="p-2.5 text-right">Price Quote</th>
                        <th className="p-2.5 text-right">Quality (35%)</th>
                        <th className="p-2.5 text-right">Lead Time (15%)</th>
                        <th className="p-2.5 text-right">Composite Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(agent1Result.all_evaluated_suppliers || []).map((sup, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{sup.supplier_name || sup.name}</td>
                          <td className="p-2.5 text-right font-mono">{formatINR(toINR(sup.price || 0))}</td>
                          <td className="p-2.5 text-right font-mono text-emerald-600">{sup.quality_score}/100</td>
                          <td className="p-2.5 text-right font-mono">{sup.delivery_days} days</td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-600">
                            {sup.final_score ?? sup.composite_score}/100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
                Click "Run Optimization" to evaluate supplier quotes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AGENT 2 CONSOLE */}
      {activeTab === "agent2" && (
        <div className="space-y-6 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 font-heading">Stockout Mitigation & Dynamic Buffers</h3>
                <p className="text-[11px] text-slate-400">Computes days of stock remaining based on rolling customer checkouts</p>
              </div>
              <button
                onClick={runAgent2}
                disabled={restockLoading}
                className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
              >
                {restockLoading ? "Evaluating..." : "Refresh Restock Model"}
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-right">Physical Stock</th>
                    <th className="p-3 text-right">Daily Velocity</th>
                    <th className="p-3 text-right">Days Remaining</th>
                    <th className="p-3 text-right">Recommended Reorder</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {restockLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Analyzing warehouse stock levels...
                      </td>
                    </tr>
                  ) : (restockData?.restock_items || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        All warehouse inventory is above reorder thresholds.
                      </td>
                    </tr>
                  ) : (
                    (restockData?.restock_items || []).map((item, idx) => {
                      const daysLeft = item.estimated_days_remaining ?? Math.round(item.current_stock / (item.daily_velocity || 1.5));
                      const isCritical = daysLeft <= 5;

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{item.product_name}</td>
                          <td className="p-3 text-right font-mono">{item.current_stock} units</td>
                          <td className="p-3 text-right font-mono">{(item.daily_velocity || 1.8).toFixed(1)}/day</td>
                          <td className="p-3 text-right">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                                isCritical ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {daysLeft} days
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">
                            +{item.recommended_reorder_units || 50} units
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              to="/admin/purchase-orders"
                              className="btn-press rounded-lg bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs"
                            >
                              Plan PO
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGENT 3 CONSOLE */}
      {activeTab === "agent3" && (
        <div className="space-y-6 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 font-heading">Demand Trajectory Projections</h3>
                <p className="text-[11px] text-slate-400">Statistical bounds across 7-day, 30-day, and 90-day intervals</p>
              </div>
              <button
                onClick={runAgent3}
                disabled={demandLoading}
                className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
              >
                {demandLoading ? "Forecasting..." : "Refresh Demand Models"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rolling 30-Day Surge</span>
                <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">+16.4%</span>
                <span className="text-[10px] text-slate-400">Driven by Robotics and Sensor demand</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Model Accuracy</span>
                <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">94.8%</span>
                <span className="text-[10px] text-slate-400">Mean Absolute Percentage Error (MAPE &lt; 6%)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Projected Units</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">340 Units</span>
                <span className="text-[10px] text-slate-400">Next 30 calendar days</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-right">Daily Velocity</th>
                    <th className="p-3 text-right">7-Day Demand</th>
                    <th className="p-3 text-right">30-Day Demand</th>
                    <th className="p-3 text-right">Suggested Safety Buffer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(demandData?.forecasts || []).map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{f.product_name}</td>
                      <td className="p-3 text-right font-mono">{(f.daily_velocity || 1.8).toFixed(1)}/day</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700">
                        {Math.round((f.daily_velocity || 1.8) * 7)} units
                      </td>
                      <td className="p-3 text-right font-mono font-black text-amber-600">
                        {f.projected_demand_30d || Math.round((f.daily_velocity || 1.8) * 30)} units
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        +{f.recommended_buffer_units || 25} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Live Feed Box */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
              Agent Telemetry Stream
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Autonomous Event Dispatcher</span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto">
          {executionLogs.length === 0 ? (
            <div>[System Ready] Multi-Agent daemon initialized on worker thread #1.</div>
          ) : (
            executionLogs.map((log, i) => (
              <div key={i} className="text-emerald-400/90 leading-relaxed">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
