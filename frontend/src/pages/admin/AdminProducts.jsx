import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";
import { getProductImage } from "../../components/user/ProductCard";

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

  const loadProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Electronics",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      price: 29.99,
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
      price: p.price || 0,
      description: p.description || "",
      image_url: p.image_url || ""
    });
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const url = editingProduct
        ? `${API_BASE_URL}/products/${editingProduct.id}`
        : `${API_BASE_URL}/products/`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          sku: formData.sku,
          price: parseFloat(formData.price),
          description: formData.description,
          image_url: formData.image_url
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save product");
      }

      setShowModal(false);
      loadProducts();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadProducts();
      }
    } catch (err) {
      console.error("Delete error:", err);
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
      title="Product Catalog & Original Data"
      subtitle="Create, update, and manage products with Amazon/Flipkart images and prices."
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
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add Original Product</span>
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
                <th className="px-6 py-3.5">Price</th>
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
                  <tr key={p.id} className="transition hover:bg-slate-50">
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
                    <td className="px-6 py-3.5 font-black text-slate-900">
                      ${(p.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Product Image URL with preview */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-indigo-600" />
                  <span>Product Image URL (Amazon, Flipkart, or Web URL)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://m.media-amazon.com/images/... or Flipkart image URL"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Selling Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none resize-none"
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
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;
