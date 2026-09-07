import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../context/CartContext";
import { formatINR, toINR } from "../../utils/currency";

function AdminSales() {
  const [salesList, setSalesList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSalesData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/sales/detailed`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_BASE_URL}/sales/analytics`).then((r) => (r.ok ? r.json() : null))
    ])
      .then(([salesData, analyticsData]) => {
        setSalesList(Array.isArray(salesData) ? salesData : []);
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading sales:", err);
        setSalesList([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSalesData();
  }, []);

  const filtered = Array.isArray(salesList)
    ? salesList.filter(
        (s) =>
          (s.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(s.sale_date || "").includes(searchTerm)
      )
    : [];

  return (
    <AdminLayout
      title="Customer Orders & Sales Records"
      subtitle="Track customer purchases, review total earnings in ₹ INR, and inspect sold quantities."
      onRefresh={loadSalesData}
      refreshing={loading}
    >
      {/* Analytics KPI Header */}
      <div className="grid gap-6 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales Revenue</span>
          <div className="mt-2 text-2xl font-black text-emerald-600 font-heading">
            {analytics ? formatINR(toINR(analytics.total_revenue)) : "₹0"}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            From completed customer checkout orders
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Units Fulfilled</span>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {analytics ? analytics.total_units_sold : 0} units
          </div>
          <div className="mt-1 text-xs text-slate-500">Decremented from active warehouse</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Orders</span>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {analytics ? analytics.total_orders : 0} orders
          </div>
          <div className="mt-1 text-xs text-slate-500">Recorded across store</div>
        </div>
      </div>

      {/* Category Revenue Breakdown */}
      {analytics && analytics.category_breakdown && analytics.category_breakdown.length > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Revenue by Category</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.category_breakdown.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{cat.category}</span>
                  <span className="text-[11px] font-mono text-slate-500">{cat.units} units sold</span>
                </div>
                <div className="mt-1 text-sm font-black text-emerald-600 font-heading">
                  {formatINR(toINR(cat.revenue))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Stream Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by product name, category, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Quantity Sold</th>
                <th className="px-6 py-3.5">Unit Price (₹)</th>
                <th className="px-6 py-3.5">Total Amount (₹)</th>
                <th className="px-6 py-3.5 text-right">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading transactions..." : "No sales records found."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition hover:bg-amber-50/30">
                    <td className="px-6 py-3.5 font-mono text-slate-500 font-bold">#TX-{s.id}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{s.product_name}</td>
                    <td className="px-6 py-3.5 text-slate-600">{s.category}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{s.quantity_sold} units</td>
                    <td className="px-6 py-3.5 text-slate-700 font-semibold">{formatINR(toINR(s.unit_price))}</td>
                    <td className="px-6 py-3.5 font-black text-emerald-600 font-heading">{formatINR(toINR(s.total_revenue))}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-slate-500">{s.sale_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSales;
