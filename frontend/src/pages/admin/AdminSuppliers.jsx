import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Sparkles, Award, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";
import { formatINR, toINR } from "../../utils/currency";

function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Supplier Sandbox state
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

  // Custom Delete Confirmation State
  const [deleteTargetSupplier, setDeleteTargetSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(false);
  const [deleteSupplierError, setDeleteSupplierError] = useState("");

  const loadSuppliers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/suppliers/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSuppliers(list);
        setLoading(false);
        if (list.length > 0 && !aiProductQuery) {
          setAiProductQuery(list[0].product_name);
        }
      })
      .catch((err) => {
        console.error("Error loading suppliers:", err);
        setSuppliers([]);
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
      product_name: aiProductQuery || "Lithium-Ion Battery Pack",
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

  const handleDelete = (s) => {
    setDeleteTargetSupplier(s);
    setDeleteSupplierError("");
  };

  const confirmDeleteSupplier = async () => {
    if (!deleteTargetSupplier) return;
    setDeletingSupplier(true);
    setDeleteSupplierError("");
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers/${deleteTargetSupplier.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDeleteTargetSupplier(null);
        loadSuppliers();
      } else {
        setDeleteSupplierError("Failed to delete supplier record. Please check server logs.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteSupplierError("Network error while deleting supplier.");
    } finally {
      setDeletingSupplier(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="Suppliers & Vendor Quotes"
      subtitle="Manage your supply partners, compare prices in ₹ INR, review quality scores, and find the best suppliers."
      onRefresh={loadSuppliers}
      refreshing={loading}
    >
      {/* Optimization Sandbox Section */}
      <div className="mb-8 rounded-2xl border border-amber-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Find Best Supplier for a Part</h2>
              <p className="text-xs text-slate-500">Compare quotes across unit price (₹), delivery speed, and quality ratings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Battery, Display, Sensor"
              value={aiProductQuery}
              onChange={(e) => setAiProductQuery(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => runAiOptimization(aiProductQuery)}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles size={13} /> Compare Suppliers
            </button>
          </div>
        </div>

        {/* Evaluation Result Box */}
        {aiLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            Running Multi-Criteria Assessment...
          </div>
        ) : aiError ? (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            {aiError}
          </div>
        ) : aiResult ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold uppercase text-[11px] mb-1">
                <Award size={14} /> Recommended Optimal Supplier
              </div>
              <p className="text-emerald-900 font-medium text-xs sm:text-sm">{aiResult.recommendation_reason}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aiResult.all_suppliers.map((s, idx) => (
                <div
                  key={s.id}
                  className={`rounded-xl border p-4 transition ${
                    idx === 0
                      ? "border-amber-300 bg-amber-50/50 shadow-sm"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-black ${
                        idx === 0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Score: {s.overall_score}/100
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] border-t border-slate-100 pt-2">
                    <div>
                      <div className="text-slate-400">Quote (₹)</div>
                      <div className="font-bold text-slate-900 mt-0.5">{formatINR(toINR(s.price))}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Quality</div>
                      <div className="font-bold text-emerald-600 mt-0.5">{s.quality_score}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Lead Time</div>
                      <div className="font-bold text-blue-600 mt-0.5">{s.delivery_days}d</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Click "Run Evaluation" to benchmark suppliers for this component line.
          </div>
        )}
      </div>

      {/* Supplier Directory Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search suppliers or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={openAddModal}
          className="btn-press flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition-colors"
        >
          <Plus size={16} />
          <span>Add New Supplier</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
              <tr>
                <th className="px-6 py-3.5">Supplier Name</th>
                <th className="px-6 py-3.5">Supplied Product</th>
                <th className="px-6 py-3.5">Unit Quote (₹ INR)</th>
                <th className="px-6 py-3.5">Quality Score</th>
                <th className="px-6 py-3.5">Fulfillment Days</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading suppliers..." : "No suppliers found."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition hover:bg-amber-50/30">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{s.name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{s.product_name}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-heading font-black text-slate-900">{formatINR(toINR(s.price))}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        {s.quality_score}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-amber-600">{s.delivery_days} Days</td>
                    <td className="px-6 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(s)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                        title="Edit Supplier"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSupplier ? "Edit Supplier Record" : "Add New Supplier"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Supplied</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quote ($ / ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1 font-semibold">
                    ~{formatINR(toINR(formData.price || 0))}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quality (1-100)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    required
                    value={formData.quality_score}
                    onChange={(e) => setFormData({ ...formData, quality_score: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lead Days</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.delivery_days}
                    onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-press rounded-xl bg-slate-950 px-5 py-2 font-bold text-white hover:bg-amber-600 shadow-sm transition-colors"
                >
                  {editingSupplier ? "Save Changes" : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteTargetSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Supplier?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete supplier{" "}
              <span className="font-bold text-slate-900">"{deleteTargetSupplier.name}"</span>?
              <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <span>Supplying: {deleteTargetSupplier.product_name}</span>
                <span>&middot;</span>
                <span className="font-bold text-emerald-700">{formatINR(toINR(deleteTargetSupplier.price || 0))}</span>
              </div>
            </div>

            {deleteSupplierError && (
              <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {deleteSupplierError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setDeleteTargetSupplier(null); setDeleteSupplierError(""); }}
                disabled={deletingSupplier}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSupplier}
                disabled={deletingSupplier}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
              >
                {deletingSupplier ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Supplier</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSuppliers;
