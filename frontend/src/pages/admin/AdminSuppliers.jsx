import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  CheckCircle2,
  ClipboardList,
  Layers,
  ArrowRight
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    rating: 4.8,
    reliability_score: 95.0,
    payment_terms: "Net 30",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // AI Evaluation Sandbox Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState("Lithium-Ion Battery Pack 5000mAh");
  const [aiEval, setAiEval] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState("");

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.suppliers.list();
      setSuppliers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error("Suppliers load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      code: `VEND-${Math.floor(100 + Math.random() * 900)}`,
      contact_person: "",
      email: "",
      phone: "+91 98765 43210",
      address: "Bangalore Logistics Corridor, KA",
      rating: 4.8,
      reliability_score: 94.0,
      payment_terms: "Net 30",
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      code: s.code || `VEND-${s.id}`,
      contact_person: s.contact_person || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      rating: s.rating || 4.5,
      reliability_score: s.reliability_score || 90.0,
      payment_terms: s.payment_terms || "Net 30",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingSupplier) {
        await api.suppliers.update(editingSupplier.id, formData);
        setNotification(`Updated supplier profile: ${formData.name}`);
      } else {
        await api.suppliers.create(formData);
        setNotification(`Added verified supplier: ${formData.name}`);
      }
      setShowModal(false);
      setTimeout(() => setNotification(""), 4000);
      loadSuppliers();
    } catch (err) {
      alert("Failed to save supplier: " + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.suppliers.deleteOrArchive(deleteTarget.id);
      setNotification(`Archived supplier: ${deleteTarget.name}`);
      setTimeout(() => setNotification(""), 4000);
      setDeleteTarget(null);
      loadSuppliers();
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const runAiOptimization = async (prodName) => {
    if (!prodName) return;
    setAiLoading(true);
    setAiModalOpen(true);
    try {
      const res = await api.ai.evaluateSupplier(prodName);
      setAiEval(res);
    } catch (err) {
      alert("AI optimization error: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contact_person || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="Suppliers & Vendor Network"
      subtitle="Directory of manufacturing partners, performance scorecards, lead times, and multi-factor algorithmic rankings."
      onRefresh={loadSuppliers}
      refreshing={loading}
    >
      {notification && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification("")} className="text-emerald-700 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, code, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => runAiOptimization(targetProduct)}
            className="btn-press flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3.5 py-2 text-xs font-bold transition shadow-xs whitespace-nowrap"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>AI Vendor Optimizer</span>
          </button>
          <button
            onClick={openAddModal}
            className="btn-press flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Supplier Partner</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Quality Rating</th>
                <th className="py-3.5 px-4 text-center">Reliability</th>
                <th className="py-3.5 px-4">Terms</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                    Loading vendor profiles...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching suppliers found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          <Truck size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.code || `ID #${s.id}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{s.contact_person || "Operations Desk"}</div>
                      <div className="text-[10px] text-slate-400">{s.email || "vendor@emox.ai"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{s.address || "India"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700 font-mono">
                        ★ {s.rating ? Number(s.rating).toFixed(1) : "4.8"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
                        {s.reliability_score ? `${Math.round(s.reliability_score)}%` : "95%"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{s.payment_terms || "Net 30"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to="/admin/purchase-orders"
                          className="btn-press rounded-lg bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-2.5 py-1 text-[11px] font-bold transition shadow-2xs"
                        >
                          Issue PO
                        </Link>
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI EVALUATION MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="text-base font-black text-slate-900 font-heading">AI Supplier Optimization Engine</h3>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Component / Hardware Item
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetProduct}
                  onChange={(e) => setTargetProduct(e.target.value)}
                  placeholder="e.g. Lithium-Ion Battery Pack 5000mAh"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => runAiOptimization(targetProduct)}
                  disabled={aiLoading}
                  className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
                >
                  {aiLoading ? "Optimizing..." : "Evaluate"}
                </button>
              </div>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                Calculating weighted scores (Price 40%, Quality 35%, Lead Time 15%, Reliability 10%)...
              </div>
            ) : aiEval?.recommended_supplier ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Winning Vendor</span>
                    <h4 className="text-base font-black text-slate-900 font-heading mt-0.5">
                      {aiEval.recommended_supplier.supplier_name || aiEval.recommended_supplier.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">{aiEval.explanation}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-600 font-mono">
                      {aiEval.recommended_supplier.final_score ?? aiEval.recommended_supplier.composite_score ?? 94}/100
                    </span>
                    <span className="text-[10px] text-slate-400 block">Weighted Score</span>
                  </div>
                </div>

                {aiEval.all_evaluated_suppliers && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Supplier</th>
                          <th className="p-2.5 text-right">Price Quote</th>
                          <th className="p-2.5 text-right">Quality</th>
                          <th className="p-2.5 text-right">Lead Time</th>
                          <th className="p-2.5 text-right">Final Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {aiEval.all_evaluated_suppliers.map((sup, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-900">{sup.supplier_name || sup.name}</td>
                            <td className="p-2.5 text-right font-mono">{formatINR(toINR(sup.price || 0))}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-600">{sup.quality_score}/100</td>
                            <td className="p-2.5 text-right font-mono">{sup.delivery_days} days</td>
                            <td className="p-2.5 text-right font-mono font-bold text-amber-700">
                              {sup.final_score ?? sup.composite_score}/100
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Link
                    to="/admin/purchase-orders"
                    className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
                  >
                    Generate Purchase Order
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ADD / EDIT VENDOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900 font-heading">
                {editingSupplier ? "Edit Supplier Record" : "Add Verified Supplier"}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-1 text-slate-400 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Apex Silicon Technologies"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Vendor Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Ananya Verma"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Business Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supply@apexsilicon.in"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Quality Rating (0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Payment Terms</label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30 (Standard)</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Registered Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Plot 42, Electronic City, Bangalore"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-5 py-2 font-bold transition shadow-xs"
                >
                  {formSubmitting ? "Saving..." : editingSupplier ? "Update Vendor" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM ARCHIVE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up">
            <h3 className="text-sm font-black text-slate-900 font-heading">Archive Supplier?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Are you sure you want to deactivate <strong className="text-slate-800">{deleteTarget.name}</strong>? Existing purchase orders will be retained.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-press rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 text-xs font-bold transition shadow-xs"
              >
                {deleting ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
