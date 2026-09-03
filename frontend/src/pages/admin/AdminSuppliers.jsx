import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Sparkles, Award, X } from "lucide-react";
import AdminLayout from "./AdminLayout";

import { API_BASE_URL } from "../../context/CartContext";

function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // AI Sandbox state
  const [aiProductQuery, setAiProductQuery] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    product_name: "",
    price: 10,
    quality_score: 90,
    delivery_days: 5
  });

  const loadSuppliers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/suppliers/`)
      .then((res) => res.json())
      .then((data) => {
        setSuppliers(data);
        setLoading(false);
        if (data.length > 0 && !aiProductQuery) {
          setAiProductQuery(data[0].product_name);
        }
      })
      .catch((err) => {
        console.error("Error loading suppliers:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const runAiOptimization = (productName) => {
    if (!productName) return;
    setAiLoading(true);
    setAiError("");
    fetch(`${API_BASE_URL}/recommendations/supplier/${encodeURIComponent(productName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`No supplier found matching "${productName}"`);
        return res.json();
      })
      .then((data) => {
        setAiResult(data);
        setAiLoading(false);
      })
      .catch((err) => {
        setAiError(err.message);
        setAiResult(null);
        setAiLoading(false);
      });
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      product_name: aiProductQuery || "Microcontroller ARM Cortex-M4",
      price: 15.0,
      quality_score: 95.0,
      delivery_days: 4
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      product_name: s.product_name,
      price: s.price,
      quality_score: s.quality_score,
      delivery_days: s.delivery_days
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSupplier
        ? `${API_BASE_URL}/suppliers/${editingSupplier.id}`
        : `${API_BASE_URL}/suppliers/`;
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          product_name: formData.product_name,
          price: parseFloat(formData.price),
          quality_score: parseFloat(formData.quality_score),
          delivery_days: parseInt(formData.delivery_days)
        })
      });

      if (res.ok) {
        setShowModal(false);
        loadSuppliers();
        if (aiProductQuery === formData.product_name) {
          runAiOptimization(formData.product_name);
        }
      }
    } catch (err) {
      console.error("Failed to save supplier:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadSuppliers();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="Supplier Optimization & Intelligence"
      subtitle="AI multi-criteria scoring algorithm (40% Price, 35% Quality, 25% Lead-time)."
      onRefresh={loadSuppliers}
      refreshing={loading}
    >
      {/* AI Optimization Sandbox Section */}
      <div className="mb-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Agent 1: Real-Time Supplier Ranking Engine</h2>
              <p className="text-xs text-slate-400">Select any component name to run comparative multi-agent scoring</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Battery, Microcontroller, OLED"
              value={aiProductQuery}
              onChange={(e) => setAiProductQuery(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => runAiOptimization(aiProductQuery)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md transition"
            >
              <Sparkles size={13} /> Run AI Evaluation
            </button>
          </div>
        </div>

        {/* AI Result Box */}
        {aiLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Running Multi-Criteria Agent Assessment...
          </div>
        ) : aiError ? (
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
            {aiError}
          </div>
        ) : aiResult ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] mb-1">
                <Award size={14} /> Recommended Optimal Supplier
              </div>
              <p className="text-slate-200 text-sm">{aiResult.recommendation_reason}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiResult.all_suppliers.map((s, idx) => (
                <div
                  key={s.id}
                  className={`rounded-2xl border p-4 backdrop-blur-md transition ${
                    idx === 0
                      ? "border-indigo-500/50 bg-indigo-950/40 shadow-lg shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-950/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                        idx === 0
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      Score: {s.overall_score}/100
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] border-t border-slate-800/80 pt-2">
                    <div>
                      <div className="text-slate-500">Price</div>
                      <div className="font-bold text-white mt-0.5">${s.price}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Quality</div>
                      <div className="font-bold text-emerald-400 mt-0.5">{s.quality_score}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Lead Time</div>
                      <div className="font-bold text-blue-400 mt-0.5">{s.delivery_days}d</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Click "Run AI Evaluation" to benchmark suppliers for this component line.
          </div>
        )}
      </div>

      {/* Supplier Directory Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search suppliers or components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus size={16} />
          <span>Add New Supplier</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Component Supplied</th>
                <th className="px-6 py-4">Unit Quote ($)</th>
                <th className="px-6 py-4">Quality Score</th>
                <th className="px-6 py-4">Lead Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading suppliers..." : "No suppliers found."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-white">{s.name}</td>
                    <td className="px-6 py-4 text-slate-300">{s.product_name}</td>
                    <td className="px-6 py-4 font-bold text-white">${s.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                        {s.quality_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-400">{s.delivery_days} Days</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        title="Edit Supplier"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Supplier"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supplied Component / Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Quality (0-100)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    required
                    value={formData.quality_score}
                    onChange={(e) => setFormData({ ...formData, quality_score: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.delivery_days}
                    onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 shadow-md"
                >
                  {editingSupplier ? "Save Changes" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSuppliers;
