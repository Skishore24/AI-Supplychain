import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon, Eye } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";
import { getProductImage } from "../../components/user/ProductCard";
import { formatINR, toINR } from "../../utils/currency";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sku: "",
    price: 0,
    description: "",
    image_url: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      sku: "",
      price: 0,
      description: "",
      image_url: ""
    });
    setErrorMsg("");
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      sku: p.sku,
      price: p.price,
      description: p.description || "",
      image_url: p.image_url || ""
    });
    setErrorMsg("");
    setShowModal(true);
  };

  const handleDelete = (p) => {
    setDeleteTarget(p);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API_BASE_URL}/products/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setDeleteError("Failed to delete product. It may be linked to active warehouse inventory or sales records.");
      }
    } catch {
      setDeleteError("Network error while deleting product. Please verify server connection.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      price: parseFloat(formData.price),
      description: formData.description,
      image_url: formData.image_url.trim() || null
    };

    try {
      const url = editingProduct
        ? `${API_BASE_URL}/products/${editingProduct.id}`
        : `${API_BASE_URL}/products/`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.detail || "Error saving product");
        return;
      }

      setShowModal(false);
      loadProducts();
    } catch {
      setErrorMsg("Network error saving product");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="Store Catalog & Products Management"
      subtitle="Create, update, and manage products with real-time sync across Storefront and Admin."
      onRefresh={loadProducts}
      refreshing={loading}
    >
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={openAddModal}
          className="btn-press flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price (₹ INR)</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading products..." : "No products found in database."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-amber-50/30">
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 p-1 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal line-clamp-1">{p.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{p.sku}</td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-heading font-black text-slate-900 text-sm">
                        {formatINR(toINR(p.price || 0))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition align-middle"
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition align-middle"
                        title="Delete Product"
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
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? "Edit Product Details" : "Add Original Product"}
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Apple iPhone 15 Pro, Sony WH-1000XM5, Arduino Uno"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Product Image URL with preview */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-amber-600" />
                  <span>Product Image URL (Amazon, Flipkart, or Web URL)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://m.media-amazon.com/images/... or Flipkart image URL"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                />
                {formData.image_url && (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-12 w-12 object-contain rounded border border-slate-200 bg-white"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <span className="text-[11px] text-slate-500">Live image preview</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catalog Unit Price ($ USD / ₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Storefront Rupee Price: <strong className="text-emerald-700 font-bold">{formatINR(toINR(formData.price || 0))}</strong>
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-amber-500 focus:outline-none resize-none"
                />
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
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-slate-900">"{deleteTarget.name}"</span>?
              <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <span>SKU: {deleteTarget.sku}</span>
                <span>&middot;</span>
                <span className="font-bold text-emerald-700">{formatINR(toINR(deleteTarget.price || 0))}</span>
              </div>
            </div>

            {deleteError && (
              <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                disabled={deleting}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;
