import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AdminLayout from "./AdminLayout";

import { API_BASE_URL } from "../../context/CartContext";

function AdminSales() {
  const [salesList, setSalesList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSalesData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/sales/detailed`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/sales/analytics`).then((r) => r.json())
    ])
      .then(([salesData, analyticsData]) => {
        setSalesList(salesData);
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading sales:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSalesData();
  }, []);

  const filtered = salesList.filter(
    (s) =>
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sale_date.includes(searchTerm)
  );

  return (
    <AdminLayout
      title="Sales Logs & Demand Intelligence"
      subtitle="Historical transaction stream, revenue velocity, and category sales breakdowns."
      onRefresh={loadSalesData}
      refreshing={loading}
    >
      {/* Analytics KPI Header */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <span className="text-xs text-slate-400">Total Gross Revenue</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">
            ${analytics ? analytics.total_revenue.toFixed(2) : "0.00"}
          </div>
          <div className="mt-1 text-xs text-slate-400">From all completed checkouts</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <span className="text-xs text-slate-400">Total Units Dispatched</span>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {analytics ? analytics.total_units_sold : 0} units
          </div>
          <div className="mt-1 text-xs text-slate-400">Decremented from active inventory</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <span className="text-xs text-slate-400">Total Transactions</span>
          <div className="mt-2 text-3xl font-extrabold text-indigo-400">
            {analytics ? analytics.total_orders : 0} orders
          </div>
          <div className="mt-1 text-xs text-slate-400">Recorded across store</div>
        </div>
      </div>

      {/* Category Revenue Breakdown */}
      {analytics && analytics.category_breakdown && analytics.category_breakdown.length > 0 && (
        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
          <h2 className="text-base font-bold text-white mb-4">Category Demand Distribution</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.category_breakdown.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{cat.category}</span>
                  <span className="text-xs font-mono text-slate-400">{cat.units} units</span>
                </div>
                <div className="mt-2 text-base font-bold text-emerald-400">
                  ${cat.revenue.toFixed(2)}
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
            placeholder="Search sales transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Quantity Sold</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    {loading ? "Loading transactions..." : "No sales records found."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono text-slate-400">#TX-{s.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{s.product_name}</td>
                    <td className="px-6 py-4 text-slate-400">{s.category}</td>
                    <td className="px-6 py-4 font-medium text-white">{s.quantity_sold} units</td>
                    <td className="px-6 py-4 text-slate-300">${s.unit_price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">${s.total_revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">{s.sale_date}</td>
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
