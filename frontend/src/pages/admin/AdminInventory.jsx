import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Search,
  Plus,
  Minus,
  Edit3,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Warehouse as WarehouseIcon,
  Clock,
  ArrowUpDown,
  ClipboardList,
  X
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

export default function AdminInventory() {
  const [inventoryList, setInventoryList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [adjustReason, setAdjustReason] = useState("Restock Received");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [notification, setNotification] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, whRes] = await Promise.all([
        api.inventory.detailed(),
        api.warehouses.list().catch(() => []),
      ]);
      setInventoryList(Array.isArray(invRes) ? invRes : invRes.items || []);
      setWarehouses(Array.isArray(whRes) ? whRes : []);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;
    setAdjustSubmitting(true);

    try {
      await api.inventory.adjust(adjustItem.product_id, Number(adjustAmount), adjustReason);
      setNotification(`Adjusted stock for ${adjustItem.product_name} by ${adjustAmount > 0 ? `+${adjustAmount}` : adjustAmount} units.`);
      setTimeout(() => setNotification(""), 4000);
      setAdjustItem(null);
      loadData();
    } catch (err) {
      alert("Adjustment failed: " + err.message);
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const exportToCSV = () => {
    if (inventoryList.length === 0) return;
    const headers = ["Product ID", "Product Name", "SKU", "Category", "Current Stock", "Reserved Stock", "Available Stock", "Reorder Level", "Status"];
    const rows = inventoryList.map((i) => [
      i.product_id,
      `"${(i.product_name || "").replace(/"/g, '""')}"`,
      i.sku || "",
      `"${i.category || ""}"`,
      i.current_stock,
      i.reserved_stock || 0,
      Math.max(0, i.current_stock - (i.reserved_stock || 0)),
      i.reorder_level,
      i.is_low_stock ? "LOW STOCK" : "OPTIMAL",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `emox_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = inventoryList.filter((item) => {
    const matchesSearch =
      (item.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const isLow = item.is_low_stock || item.current_stock <= item.reorder_level;
    const isOut = item.current_stock === 0;

    let matchesStatus = true;
    if (statusFilter === "low") matchesStatus = isLow && !isOut;
    else if (statusFilter === "out") matchesStatus = isOut;
    else if (statusFilter === "healthy") matchesStatus = !isLow && !isOut;

    return matchesSearch && matchesStatus;
  });

  const totalStockUnits = inventoryList.reduce((acc, i) => acc + (i.current_stock || 0), 0);
  const lowStockCount = inventoryList.filter((i) => i.is_low_stock || i.current_stock <= i.reorder_level).length;

  return (
    <AdminLayout
      title="Warehouse Inventory & Stock Operations"
      subtitle="Physical inventory counts, reserved allocations, safety thresholds, and manual dock adjustments."
      onRefresh={loadData}
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

      {/* KPI Cards Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Physical Stock Count</span>
          <div className="mt-2 text-3xl font-black text-slate-900 font-heading font-mono">{totalStockUnits}</div>
          <div className="mt-1 text-xs text-slate-500">Total units physically in storage</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Low Stock Flags</span>
          <div className="mt-2 text-3xl font-black text-rose-600 font-heading font-mono">{lowStockCount}</div>
          <div className="mt-1 text-xs text-rose-600">Items below replenishment point</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Connected Hubs</span>
          <div className="mt-2 text-3xl font-black text-indigo-600 font-heading font-mono">
            {warehouses.length || 2}
          </div>
          <div className="mt-1 text-xs text-slate-500">Active regional fulfillment sites</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Catalog SKUs Tracked</span>
          <div className="mt-2 text-3xl font-black text-emerald-600 font-heading font-mono">
            {inventoryList.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Synchronized with orders engine</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="healthy">Healthy Stock</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="btn-press flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 text-xs font-bold transition shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <Link
            to="/admin/purchase-orders"
            className="btn-press flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
          >
            <ClipboardList size={14} />
            <span>Procure Stock</span>
          </Link>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Physical Stock</th>
                <th className="py-3.5 px-4 text-right">Reserved</th>
                <th className="py-3.5 px-4 text-right">Available</th>
                <th className="py-3.5 px-4 text-right">Reorder Point</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                    Synchronizing stock counts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.is_low_stock || item.current_stock <= item.reorder_level;
                  const available = Math.max(0, item.current_stock - (item.reserved_stock || 0));

                  return (
                    <tr key={item.id || item.product_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link
                          to={`/admin/products/${item.product_id}`}
                          className="hover:text-amber-600 transition"
                        >
                          {item.product_name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{item.sku || "N/A"}</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {item.category || "Hardware"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        {item.current_stock}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-600 font-bold">
                        {item.reserved_stock || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {available}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isLow ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.reorder_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustAmount(25);
                              setAdjustReason("Restock Received");
                            }}
                            className="btn-press rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Edit3 size={12} />
                            <span>Adjust</span>
                          </button>
                          {isLow && (
                            <Link
                              to="/admin/purchase-orders"
                              className="btn-press rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-1 text-[11px] font-bold shadow-2xs"
                            >
                              Replenish
                            </Link>
                          )}
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

      {/* ADJUST STOCK MODAL */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 font-heading">Manual Stock Adjustment</h3>
                <p className="text-[11px] text-slate-400">{adjustItem.product_name}</p>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Current In-Stock:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{adjustItem.current_stock} units</span>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Delta Units (+ to add, - to subtract)
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Restock Received">Dock Shipment Restock</option>
                  <option value="Cycle Count Discrepancy">Cycle Count Correction</option>
                  <option value="Damaged Inventory">Damaged / Expired / Scrapped</option>
                  <option value="Customer Return Restock">Customer Return Restock</option>
                  <option value="Sample / Internal Testing">Internal R&D / Testing</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-5 py-2 font-bold transition shadow-xs"
                >
                  {adjustSubmitting ? "Updating..." : "Commit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
