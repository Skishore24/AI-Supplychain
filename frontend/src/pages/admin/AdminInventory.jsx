import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Minus, Search, Edit3, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";

function AdminInventory() {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ current_stock: 0, reorder_level: 10 });
  const [notification, setNotification] = useState(null);

  const loadInventory = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/inventory/detailed`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setInventoryList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading inventory:", err);
        setInventoryList([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const adjustStock = async (productId, delta) => {
    const item = inventoryList.find((i) => i.product_id === productId);
    if (!item) return;
    const newStock = Math.max(0, item.current_stock + delta);

    try {
      const res = await fetch(`${API_BASE_URL}/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_stock: newStock })
      });
      if (res.ok) {
        loadInventory();
      }
    } catch (e) {
      console.error("Stock adjust failed:", e);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      current_stock: item.current_stock,
      reorder_level: item.reorder_level
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`${API_BASE_URL}/inventory/${editingItem.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_stock: parseInt(formData.current_stock),
          reorder_level: parseInt(formData.reorder_level)
        })
      });

      if (res.ok) {
        setEditingItem(null);
        setNotification(`Updated stock parameters for ${editingItem.product_name}`);
        setTimeout(() => setNotification(null), 3000);
        loadInventory();
      }
    } catch (e) {
      console.error("Update failed:", e);
    }
  };

  const filtered = inventoryList.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventoryList.filter((i) => i.is_low_stock).length;
  const totalStockUnits = inventoryList.reduce((acc, i) => acc + i.current_stock, 0);

  return (
    <AdminLayout
      title="Warehouse Inventory & Stock Control"
      subtitle="Track physical units on hand, reorder thresholds, and quick replenishment."
      onRefresh={loadInventory}
      refreshing={loading}
    >
      {notification && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs">
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Inventory Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracked SKUs</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{inventoryList.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Physical Stock Units</span>
          <div className="mt-2 text-2xl font-black text-blue-600">{totalStockUnits}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Alerts</span>
          <div className="mt-2 text-2xl font-black text-amber-600">{lowStockCount} Items</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
              <tr>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Stock on Hand</th>
                <th className="px-6 py-3.5">Reorder Threshold</th>
                <th className="px-6 py-3.5">Stock Status</th>
                <th className="px-6 py-3.5 text-right">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading inventory..." : "No inventory records found."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div>{item.product_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.category}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{item.sku}</td>
                    <td className="px-6 py-3.5 font-black text-slate-900 text-sm">
                      {item.current_stock} units
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-medium">
                      {item.reorder_level} units
                    </td>
                    <td className="px-6 py-3.5">
                      {item.current_stock === 0 ? (
                        <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : item.is_low_stock ? (
                        <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          Healthy Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => adjustStock(item.product_id, -5)}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                        title="Reduce 5 units"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => adjustStock(item.product_id, 10)}
                        className="rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 transition"
                        title="Add 10 units"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Configure thresholds"
                      >
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Thresholds Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Adjust Stock Parameters</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-1">Product</span>
                <span className="font-bold text-slate-900 text-sm">{editingItem.product_name}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Stock on Hand</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Safety Reorder Level</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminInventory;
