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
      .then((res) => res.json())
      .then((data) => {
        setInventoryList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading inventory:", err);
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
      title="Inventory & Stock Health Control"
      subtitle="Track stock levels, configure autonomous safety thresholds, and monitor replenishment."
      onRefresh={loadInventory}
      refreshing={loading}
    >
      {notification && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/80 p-4 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Inventory Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <span className="text-xs text-slate-400">Total Tracked SKUs</span>
          <div className="mt-2 text-2xl font-bold text-white">{inventoryList.length}</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <span className="text-xs text-slate-400">Total Physical Units</span>
          <div className="mt-2 text-2xl font-bold text-blue-400">{totalStockUnits}</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <span className="text-xs text-slate-400">Active Stockout Alerts</span>
          <div className="mt-2 text-2xl font-bold text-amber-400">{lowStockCount} Items</div>
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
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Reorder Threshold</th>
                <th className="px-6 py-4">Stock Health</th>
                <th className="px-6 py-4 text-right">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading inventory..." : "No inventory records found."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{item.product_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">{item.sku}</td>
                    <td className="px-6 py-4 font-bold text-white text-sm">
                      {item.current_stock} units
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.reorder_level} units
                    </td>
                    <td className="px-6 py-4">
                      {item.current_stock === 0 ? (
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
                          Out of Stock
                        </span>
                      ) : item.is_low_stock ? (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                          Low Stock (Reorder Needed)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          Optimal Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => adjustStock(item.product_id, -5)}
                        className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                        title="Reduce 5 units"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => adjustStock(item.product_id, 10)}
                        className="rounded-lg bg-indigo-600/80 p-1.5 text-white hover:bg-indigo-600 transition"
                        title="Add 10 units"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Product</span>
                <span className="font-semibold text-white text-sm">{editingItem.product_name}</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Current Stock on Hand</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Safety Reorder Trigger Level</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 shadow-md"
                >
                  Update
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
