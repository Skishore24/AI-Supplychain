import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Package,
  Eye,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpDown
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { getProductImage } from "../../components/user/ProductCard";
import { formatINR, toINR } from "../../utils/currency";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sku: "",
    price: 0,
    cost_price: 0,
    description: "",
    image_url: "",
    min_stock_level: 10,
    max_stock_level: 500,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.products.list({ limit: 100 }),
        api.categories.list().catch(() => []),
      ]);
      setProducts(Array.isArray(prodsRes) ? prodsRes : prodsRes.items || []);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category_id: categories[0]?.id || "",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      price: 999,
      cost_price: 650,
      description: "",
      image_url: "",
      min_stock_level: 15,
      max_stock_level: 500,
    });
    setErrorMsg("");
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id || (categories.find((c) => c.name === p.category)?.id ?? ""),
      sku: p.sku || "",
      price: p.price || 0,
      cost_price: p.cost_price || Math.round(p.price * 0.65),
      description: p.description || "",
      image_url: p.image_url || "",
      min_stock_level: p.min_stock_level || 15,
      max_stock_level: p.max_stock_level || 500,
    });
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFormSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        sku: formData.sku,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price || 0),
        description: formData.description,
        image_url: formData.image_url || undefined,
        min_stock_level: parseInt(formData.min_stock_level || 10),
        max_stock_level: parseInt(formData.max_stock_level || 500),
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
        setSuccessMsg(`Updated product: ${formData.name}`);
      } else {
        await api.products.create(payload);
        setSuccessMsg(`Product added to catalog: ${formData.name}`);
      }

      setShowModal(false);
      setTimeout(() => setSuccessMsg(""), 4000);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save product.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.products.deleteOrArchive(deleteTarget.id);
      setSuccessMsg(`Archived product: ${deleteTarget.name}`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      String(p.category_id) === String(categoryFilter) ||
      (p.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const stock = p.stock_quantity ?? 0;
    const minStock = p.min_stock_level ?? 15;
    let matchesStock = true;
    if (stockFilter === "low") matchesStock = stock <= minStock && stock > 0;
    else if (stockFilter === "out") matchesStock = stock === 0;
    else if (stockFilter === "healthy") matchesStock = stock > minStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <AdminLayout
      title="Hardware Products Catalog"
      subtitle="Manage hardware component listings, SKU identifiers, margin structures, and stock alert levels."
      onRefresh={loadData}
      refreshing={loading}
    >
      {successMsg && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-700 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="healthy">In Stock (Healthy)</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="btn-press flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs whitespace-nowrap"
        >
          <Plus size={15} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Retail Price</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Physical Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                    Loading catalog items...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching products found in catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stock_quantity ?? 0;
                  const minStock = p.min_stock_level ?? 15;
                  const isLow = stock <= minStock && stock > 0;
                  const isOut = stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(p)}
                            alt={p.name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <Link
                              to={`/admin/products/${p.id}`}
                              className="font-bold text-slate-900 hover:text-amber-600 transition"
                            >
                              {p.name}
                            </Link>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                              {p.description || "Hardware component"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.sku || "N/A"}</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {p.category_name || p.category || "Hardware"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        {formatINR(toINR(p.price))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {formatINR(toINR(p.cost_price || 0))}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-mono font-bold">
                          <span
                            className={
                              isOut
                                ? "text-rose-600"
                                : isLow
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }
                          >
                            {stock} units
                          </span>
                          {isOut ? (
                            <span className="h-2 w-2 rounded-full bg-rose-500" title="Out of Stock" />
                          ) : isLow ? (
                            <span className="h-2 w-2 rounded-full bg-amber-500" title="Low Stock Warning" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Stock Healthy" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/products/${p.id}`}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Product Details & AI Analysis"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                            title="Archive Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900 font-heading">
                {editingProduct ? "Edit Hardware Listing" : "Add Hardware Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ultra-Precision Gyroscope Sensor"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    SKU Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Min Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Hardware specifications, compatibility, and pinout notes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500"
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
                  {formSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
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
            <h3 className="text-sm font-black text-slate-900 font-heading">Archive Product?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Are you sure you want to deactivate <strong className="text-slate-800">{deleteTarget.name}</strong>? It will no longer appear on the public storefront.
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
