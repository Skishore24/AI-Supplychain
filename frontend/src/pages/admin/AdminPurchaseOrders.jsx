import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  PackageCheck,
  AlertTriangle,
  FileText,
  Filter,
  X,
  Truck,
  Warehouse as WarehouseIcon,
  ChevronRight,
  Eye,
  Calendar,
  Building
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";

export default function AdminPurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newPoData, setNewPoData] = useState({
    supplier_id: "",
    warehouse_id: "",
    notes: "",
    items: [{ product_id: "", quantity: 50, unit_price: 100 }],
  });

  // Details Modal state
  const [selectedPo, setSelectedPo] = useState(null);
  const [poDetailsLoading, setPoDetailsLoading] = useState(false);

  // Receive Modal state
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [receiveNotes, setReceiveNotes] = useState("");
  const [receiveSubmitting, setReceiveSubmitting] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, whRes, prodRes] = await Promise.all([
        api.purchaseOrders.list(),
        api.suppliers.list(),
        api.warehouses.list(),
        api.products.list({ limit: 100 }),
      ]);
      setOrders(Array.isArray(poRes) ? poRes : poRes.items || []);
      setSuppliers(Array.isArray(supRes) ? supRes : supRes.items || []);
      setWarehouses(Array.isArray(whRes) ? whRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : prodRes.items || []);
    } catch (err) {
      console.error("Failed to load PO data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setNewPoData({
      supplier_id: suppliers[0]?.id || "",
      warehouse_id: warehouses[0]?.id || "",
      notes: "Stock replenishment generated via Procurement Console.",
      items: [
        {
          product_id: products[0]?.id || "",
          quantity: 100,
          unit_price: products[0]?.cost_price || 250,
        },
      ],
    });
    setCreateError("");
    setShowCreateModal(true);
  };

  const addItemRow = () => {
    setNewPoData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: products[0]?.id || "",
          quantity: 50,
          unit_price: products[0]?.cost_price || 200,
        },
      ],
    }));
  };

  const removeItemRow = (idx) => {
    setNewPoData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const updateItemRow = (idx, field, value) => {
    setNewPoData((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === "product_id") {
        const prod = products.find((p) => String(p.id) === String(value));
        if (prod) {
          items[idx].unit_price = prod.cost_price || 200;
        }
      }
      return { ...prev, items };
    });
  };

  const calculateSubtotal = () => {
    return newPoData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    }, 0);
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateError("");

    try {
      const payload = {
        supplier_id: Number(newPoData.supplier_id),
        warehouse_id: Number(newPoData.warehouse_id),
        notes: newPoData.notes,
        items: newPoData.items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
        })),
      };

      await api.purchaseOrders.create(payload);
      setShowCreateModal(false);
      setReceiveSuccess("Purchase order generated and queued for approval.");
      setTimeout(() => setReceiveSuccess(""), 4000);
      loadData();
    } catch (err) {
      setCreateError(err.message || "Failed to create purchase order.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleStatusChange = async (poId, nextStatus) => {
    try {
      await api.purchaseOrders.updateStatus(poId, nextStatus, `Updated to ${nextStatus}`);
      setReceiveSuccess(`PO #${poId} moved to status: ${nextStatus.toUpperCase()}`);
      setTimeout(() => setReceiveSuccess(""), 4000);
      loadData();
      if (selectedPo && selectedPo.id === poId) {
        const updated = await api.purchaseOrders.get(poId);
        setSelectedPo(updated);
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const openReceiveModal = async (po) => {
    setReceiveTarget(po);
    try {
      setPoDetailsLoading(true);
      const detailed = await api.purchaseOrders.get(po.id);
      setReceiveTarget(detailed);
      const initial = {};
      (detailed.items || []).forEach((item) => {
        const remaining = item.quantity - (item.received_quantity || 0);
        initial[item.id] = Math.max(0, remaining);
      });
      setReceivedQuantities(initial);
      setShowReceiveModal(true);
    } catch (err) {
      alert("Could not load PO details: " + err.message);
    } finally {
      setPoDetailsLoading(false);
    }
  };

  const handleReceiveStockSubmit = async (e) => {
    e.preventDefault();
    if (!receiveTarget) return;
    setReceiveSubmitting(true);

    try {
      const itemsPayload = Object.entries(receivedQuantities).map(([itemId, qty]) => ({
        item_id: Number(itemId),
        quantity_received: Number(qty) || 0,
      }));

      await api.purchaseOrders.receiveItems(
        receiveTarget.id,
        itemsPayload,
        receiveNotes || "Received at dock and verified."
      );

      setShowReceiveModal(false);
      setReceiveSuccess(
        `Dock receipt recorded! Warehouse inventory has been automatically incremented.`
      );
      setTimeout(() => setReceiveSuccess(""), 5000);
      loadData();
    } catch (err) {
      alert("Stock receipt failed: " + err.message);
    } finally {
      setReceiveSubmitting(false);
    }
  };

  const viewPoDetails = async (po) => {
    setPoDetailsLoading(true);
    try {
      const detailed = await api.purchaseOrders.get(po.id);
      setSelectedPo(detailed);
    } catch (err) {
      console.error("Could not fetch PO details:", err);
      setSelectedPo(po);
    } finally {
      setPoDetailsLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.po_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.id).includes(searchTerm);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold border border-slate-200">
            <Clock size={12} /> Draft
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs font-bold border border-amber-200">
            <AlertTriangle size={12} /> Pending Approval
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold border border-blue-200">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-bold border border-indigo-200">
            <Send size={12} /> Dispatched to Vendor
          </span>
        );
      case "received":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
            <PackageCheck size={12} /> Stock Received
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 text-xs font-bold border border-rose-200">
            <X size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Purchase Orders & Replenishment"
      subtitle="Manage procurement lifecycles, approve vendor orders, and receive shipments directly into warehouse inventory."
      onRefresh={loadData}
      refreshing={loading}
    >
      {/* Success Notification Banner */}
      {receiveSuccess && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-bold shadow-xs animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{receiveSuccess}</span>
          </div>
          <button onClick={() => setReceiveSuccess("")} className="text-emerald-700 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total POs</span>
            <ClipboardList size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 font-heading">{orders.length}</div>
          <div className="mt-1 text-xs text-slate-500">All procurement cycles</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-600 uppercase tracking-wider">
            <span>Awaiting Approval</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-600 font-heading">
            {orders.filter((o) => o.status === "pending_approval" || o.status === "draft").length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Requires manager sign-off</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <span>In Transit (Sent)</span>
            <Truck size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-indigo-600 font-heading">
            {orders.filter((o) => o.status === "sent" || o.status === "approved").length}
          </div>
          <div className="mt-1 text-xs text-slate-500">En route from suppliers</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <span>Completed Receipt</span>
            <PackageCheck size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-600 font-heading">
            {orders.filter((o) => o.status === "received").length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Added into inventory</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Create Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PO number or supplier name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="sent">Dispatched / Sent</option>
              <option value="received">Stock Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-press flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs whitespace-nowrap"
        >
          <Plus size={15} />
          <span>Generate Purchase Order</span>
        </button>
      </div>

      {/* Main PO Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Destination Warehouse</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <span>Loading purchase orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <ClipboardList size={28} className="text-slate-300 mb-1" />
                      <span className="font-bold text-slate-600">No purchase orders found</span>
                      <span className="text-[11px]">Generate a new purchase order to replenish inventory.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => viewPoDetails(po)}
                        className="font-mono font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>{po.po_number || `PO-${po.id}`}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{po.supplier_name || "Enterprise Supplier"}</div>
                      <div className="text-[10px] text-slate-400">ID: #{po.supplier_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <WarehouseIcon size={13} className="text-slate-400" />
                        <span>{po.warehouse_name || "Primary Logistics Hub"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {po.created_at ? new Date(po.created_at).toLocaleDateString() : "Today"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatINR(toINR(po.total_cost || po.total_amount || 0))}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(po.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status progression shortcuts */}
                        {po.status === "draft" && (
                          <button
                            onClick={() => handleStatusChange(po.id, "pending_approval")}
                            className="btn-press rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-[11px] font-bold"
                          >
                            Submit
                          </button>
                        )}
                        {po.status === "pending_approval" && (
                          <button
                            onClick={() => handleStatusChange(po.id, "approved")}
                            className="btn-press rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs"
                          >
                            Approve
                          </button>
                        )}
                        {po.status === "approved" && (
                          <button
                            onClick={() => handleStatusChange(po.id, "sent")}
                            className="btn-press rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs flex items-center gap-1"
                          >
                            <Send size={10} /> Send PO
                          </button>
                        )}
                        {po.status === "sent" && (
                          <button
                            onClick={() => openReceiveModal(po)}
                            className="btn-press rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 text-[11px] font-bold shadow-2xs flex items-center gap-1"
                          >
                            <PackageCheck size={11} /> Receive Stock
                          </button>
                        )}

                        {/* View details */}
                        <button
                          onClick={() => viewPoDetails(po)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="View PO Details"
                        >
                          <Eye size={14} />
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

      {/* CREATE PO MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading">Generate Purchase Order</h2>
                <p className="text-xs text-slate-500">Initiate procurement order with verified suppliers.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
                <AlertTriangle size={16} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Target Supplier
                  </label>
                  <select
                    value={newPoData.supplier_id}
                    onChange={(e) => setNewPoData({ ...newPoData, supplier_id: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.contact_person || s.code || "Vendor"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Receiving Warehouse
                  </label>
                  <select
                    value={newPoData.warehouse_id}
                    onChange={(e) => setNewPoData({ ...newPoData, warehouse_id: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.city} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Order Line Items</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newPoData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItemRow(idx, "product_id", e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemRow(idx, "quantity", e.target.value)}
                        className="w-20 rounded-lg border border-slate-200 bg-white p-2 text-xs text-right font-mono"
                        required
                      />

                      <input
                        type="number"
                        placeholder="Unit Price ₹"
                        min="0"
                        step="0.1"
                        value={item.unit_price}
                        onChange={(e) => updateItemRow(idx, "unit_price", e.target.value)}
                        className="w-24 rounded-lg border border-slate-200 bg-white p-2 text-xs text-right font-mono"
                        required
                      />

                      {newPoData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Subtotal preview */}
                <div className="mt-3 flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-slate-900">
                  <span>Estimated Total PO Cost:</span>
                  <span className="font-mono text-sm text-emerald-700 font-heading">
                    {formatINR(toINR(calculateSubtotal()))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Procurement Notes
                </label>
                <textarea
                  rows={2}
                  value={newPoData.notes}
                  onChange={(e) => setNewPoData({ ...newPoData, notes: e.target.value })}
                  placeholder="Special instructions or batch requirements..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-5 py-2.5 text-xs font-bold transition shadow-xs"
                >
                  {createSubmitting ? "Generating..." : "Create & Queue PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE STOCK MODAL */}
      {showReceiveModal && receiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading">Receive Warehouse Stock</h2>
                <p className="text-xs text-slate-500">
                  Verify arrived units for <span className="font-bold text-slate-800">{receiveTarget.po_number}</span>.
                </p>
              </div>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReceiveStockSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
                <strong>Automatic Replenishment Notice:</strong> Submitting this dock receipt will immediately
                increment available physical stock in warehouse <strong>{receiveTarget.warehouse_name || "Main Hub"}</strong>.
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Arrived Items</span>
                {(receiveTarget.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.product_name || `Product #${item.product_id}`}</div>
                      <div className="text-[11px] text-slate-500">
                        Ordered: <span className="font-mono font-bold">{item.quantity}</span> units | Previously received: {item.received_quantity || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Arriving:</span>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity - (item.received_quantity || 0)}
                        value={receivedQuantities[item.id] ?? 0}
                        onChange={(e) =>
                          setReceivedQuantities({
                            ...receivedQuantities,
                            [item.id]: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono font-bold text-right"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Dock Inspection Notes
                </label>
                <input
                  type="text"
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  placeholder="e.g., Verified cartons intact, QC passed."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receiveSubmitting}
                  className="btn-press rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold transition shadow-xs"
                >
                  {receiveSubmitting ? "Processing..." : "Confirm & Replenish Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO DETAILS DRAWER / MODAL */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 font-heading">{selectedPo.po_number || `PO-${selectedPo.id}`}</h2>
                  {getStatusBadge(selectedPo.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered on {selectedPo.created_at ? new Date(selectedPo.created_at).toLocaleDateString() : "Today"}
                </p>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Supplier:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPo.supplier_name || "Verified Vendor"}</span>
                <span className="text-slate-500 block">ID: #{selectedPo.supplier_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Destination Warehouse:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPo.warehouse_name || "Main Warehouse"}</span>
                <span className="text-slate-500 block">ID: #{selectedPo.warehouse_id}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-right">Ordered</th>
                    <th className="p-2.5 text-right">Received</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedPo.items || []).map((i) => (
                    <tr key={i.id}>
                      <td className="p-2.5 font-bold text-slate-900">
                        {i.product_name || `Product #${i.product_id}`}
                      </td>
                      <td className="p-2.5 text-right font-mono">{i.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">{i.received_quantity || 0}</td>
                      <td className="p-2.5 text-right font-mono">{formatINR(toINR(i.unit_price))}</td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        {formatINR(toINR(i.total_price || i.quantity * i.unit_price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPo.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-4">
                <strong>Notes:</strong> {selectedPo.notes}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-slate-500">
                Total PO Value:{" "}
                <span className="text-base font-black text-slate-900 font-mono font-heading">
                  {formatINR(toINR(selectedPo.total_cost || selectedPo.total_amount || 0))}
                </span>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
