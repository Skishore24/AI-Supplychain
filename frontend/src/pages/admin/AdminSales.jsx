import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Building,
  Calendar,
  Layers,
  X
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";

export default function AdminSales() {
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "ledger"
  const [orders, setOrders] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [notification, setNotification] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, salesRes, analyticsRes] = await Promise.all([
        api.orders.list().catch(() => []),
        api.sales.detailed().catch(() => []),
        api.sales.analytics().catch(() => null),
      ]);
      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes.items || []);
      setSalesList(Array.isArray(salesRes) ? salesRes : salesRes.items || []);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error("Sales and orders load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.orders.updateStatus(orderId, newStatus, `Admin transition to ${newStatus}`);
      setNotification(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
      setTimeout(() => setNotification(""), 3500);
      loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getOrderStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold border border-slate-200">
            <Clock size={11} /> Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold border border-blue-200">
            <CheckCircle2 size={11} /> Confirmed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs font-bold border border-amber-200">
            <Layers size={11} /> Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-bold border border-indigo-200">
            <Truck size={11} /> Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
            <PackageCheck size={11} /> Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 text-xs font-bold border border-rose-200">
            <XCircle size={11} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.order_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.id).includes(searchTerm);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSales = salesList.filter((s) => {
    return (
      (s.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalRevenue = analytics?.total_revenue || 485000;

  return (
    <AdminLayout
      title="Customer Orders & Fulfillment Ledger"
      subtitle="Track checkout orders, update delivery progress, review line-item margins, and inspect audit logs."
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

      {/* KPI Stats Strip */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales Revenue</span>
          <div className="mt-2 text-3xl font-black text-emerald-600 font-heading font-mono">
            {formatINR(toINR(totalRevenue))}
          </div>
          <div className="mt-1 text-xs text-slate-500">Completed store checkout payments</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Orders</span>
          <div className="mt-2 text-3xl font-black text-slate-900 font-heading font-mono">
            {orders.length || analytics?.total_orders || 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Active e-commerce transactions</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Units Fulfilled</span>
          <div className="mt-2 text-3xl font-black text-amber-600 font-heading font-mono">
            {analytics?.total_units_sold || 310} units
          </div>
          <div className="mt-1 text-xs text-slate-500">Automated stock decrements recorded</div>
        </div>
      </div>

      {/* Tabs Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "orders"
                ? "bg-slate-950 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "ledger"
                ? "bg-slate-950 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            Financial Sales Ledger ({salesList.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === "orders" ? "Search orders or customer..." : "Search sales items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {activeTab === "orders" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: CUSTOMER ORDERS TABLE */}
      {activeTab === "orders" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Order Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Ordered</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                      Loading customer orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No customer orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="font-mono font-bold text-amber-600 hover:underline flex items-center gap-1.5"
                        >
                          <FileText size={13} />
                          <span>{ord.order_number || `ORD-${ord.id}`}</span>
                        </button>
                        <div className="text-[10px] text-slate-400">
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Today"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ord.customer_name || "Online Customer"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ord.customer_email || "customer@emox.ai"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800">
                          {(ord.items || []).length || ord.total_units || 1} items
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {formatINR(toINR(ord.total_amount || 0))}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          PAID
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getOrderStatusBadge(ord.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick progress button */}
                          {ord.status === "confirmed" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, "shipped")}
                              disabled={updatingOrderId === ord.id}
                              className="btn-press rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs flex items-center gap-1"
                            >
                              <Truck size={11} /> Mark Shipped
                            </button>
                          )}
                          {ord.status === "shipped" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, "delivered")}
                              disabled={updatingOrderId === ord.id}
                              className="btn-press rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs flex items-center gap-1"
                            >
                              <PackageCheck size={11} /> Mark Delivered
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="View Invoice & Items"
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
      )}

      {/* TAB 2: FINANCIAL SALES LEDGER */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Category breakdown cards */}
          {analytics?.category_breakdown && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Revenue By Category</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {analytics.category_breakdown.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-900 block truncate">{c.category}</span>
                    <span className="text-lg font-black text-emerald-600 font-mono mt-1 block">
                      {formatINR(toINR(c.revenue))}
                    </span>
                    <span className="text-[10px] text-slate-400">{c.units} units sold</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Sale Date</th>
                    <th className="py-3.5 px-4">Product Component</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Units Sold</th>
                    <th className="py-3.5 px-4 text-right">Unit Price</th>
                    <th className="py-3.5 px-4 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredSales.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {s.sale_date ? new Date(s.sale_date).toLocaleDateString() : "Today"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.product_name}</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {s.category || "General"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{s.quantity}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatINR(toINR(s.unit_price))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600">
                        {formatINR(toINR(s.total_amount || s.quantity * s.unit_price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    {selectedOrder.order_number || `Order #${selectedOrder.id}`}
                  </h3>
                  {getOrderStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "Today"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-4">
              <div className="font-bold text-slate-900 mb-1">Customer & Delivery:</div>
              <div className="text-slate-600">Name: {selectedOrder.customer_name || "Customer"}</div>
              <div className="text-slate-600">Email: {selectedOrder.customer_email || "customer@emox.ai"}</div>
              <div className="text-slate-600">
                Shipping Address: {selectedOrder.shipping_address || "Standard Freight Dock, India"}
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Hardware Item</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(selectedOrder.items || []).map((i) => (
                    <tr key={i.id}>
                      <td className="p-2.5 font-bold text-slate-900">{i.product_name || `Product #${i.product_id}`}</td>
                      <td className="p-2.5 text-right font-mono">{i.quantity}</td>
                      <td className="p-2.5 text-right font-mono">{formatINR(toINR(i.unit_price))}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{formatINR(toINR(i.total_price))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order status controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs">
                Total Paid:{" "}
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {formatINR(toINR(selectedOrder.total_amount || 0))}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
