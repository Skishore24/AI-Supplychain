import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  Edit2,
  TrendingUp,
  Layers,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  BarChart2,
  ShieldCheck,
  ClipboardList
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";
import { getProductImage } from "../../components/user/ProductCard";

export default function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiEval, setAiEval] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadProductData = async () => {
    setLoading(true);
    try {
      const p = await api.products.get(id);
      setProduct(p);

      // Attempt to load inventory for this product
      try {
        const inv = await api.inventory.get(id);
        setInventory(inv);
      } catch (e) {
        console.warn("No direct inventory found for product", id);
      }

      // Run AI supplier evaluation
      setAiLoading(true);
      try {
        const ai = await api.ai.evaluateSupplier(p.name);
        setAiEval(ai);
      } catch (err) {
        console.warn("AI supplier eval unavailable:", err);
      } finally {
        setAiLoading(false);
      }
    } catch (err) {
      console.error("Product load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Product Intelligence" subtitle="Loading detailed telemetry...">
        <div className="py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <div className="mt-3 text-xs font-bold text-slate-500">Retrieving catalog data...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout title="Product Not Found" subtitle="Requested item does not exist.">
        <div className="py-16 text-center">
          <Package size={40} className="mx-auto text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-700">Product not found in system catalog</h2>
          <Link
            to="/admin/products"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:underline"
          >
            <ArrowLeft size={14} /> Back to Products Catalog
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const margin = product.cost_price
    ? Math.round(((product.price - product.cost_price) / product.price) * 100)
    : 0;

  const currentStock = inventory ? inventory.current_stock : product.stock_quantity ?? 0;
  const reorderLevel = inventory ? inventory.reorder_level : product.min_stock_level ?? 10;
  const isLowStock = currentStock <= reorderLevel;

  return (
    <AdminLayout
      title={`Product: ${product.name}`}
      subtitle={`SKU: ${product.sku || "N/A"} • Category: ${product.category_name || product.category || "General"}`}
      onRefresh={loadProductData}
      refreshing={loading}
    >
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50"
        >
          <ArrowLeft size={13} /> Back to Catalog
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/purchase-orders"
            className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
          >
            <ClipboardList size={13} />
            <span>Procure / Restock</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left details, right metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Product Summary & Image */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 mb-5">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80";
              }}
            />
            <div className="absolute top-3 right-3">
              {isLowStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                  <AlertTriangle size={10} /> Low Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                  <CheckCircle2 size={10} /> Healthy Stock
                </span>
              )}
            </div>
          </div>

          <h2 className="text-lg font-black text-slate-900 font-heading leading-snug">{product.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{product.description || "High-performance enterprise hardware component."}</p>

          <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">SKU:</span>
              <span className="font-mono font-bold text-slate-800">{product.sku || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Category:</span>
              <span className="font-bold text-slate-800">{product.category_name || product.category || "Hardware"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Retail Price:</span>
              <span className="font-mono font-black text-emerald-600 font-heading text-sm">{formatINR(toINR(product.price))}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Estimated Cost:</span>
              <span className="font-mono font-bold text-slate-700">{formatINR(toINR(product.cost_price || 0))}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Gross Margin:</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{margin}%</span>
            </div>
          </div>
        </div>

        {/* Middle & Right: Inventory Telemetry & AI Supplier Score */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory & Logistics Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-heading">Warehouse Stock Levels</h3>
                  <p className="text-[11px] text-slate-400">Real-time inventory synchronization</p>
                </div>
              </div>
              <Link
                to="/admin/inventory"
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                <span>Adjust Stock</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Physical Stock</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{currentStock}</span>
                <span className="text-[10px] text-slate-400">Total units on hand</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reserved Units</span>
                <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
                  {inventory?.reserved_stock ?? 0}
                </span>
                <span className="text-[10px] text-slate-400">In pending orders</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available to Sell</span>
                <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                  {Math.max(0, currentStock - (inventory?.reserved_stock ?? 0))}
                </span>
                <span className="text-[10px] text-slate-400">Ready for checkout</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reorder Level</span>
                <span className="text-2xl font-black text-purple-600 font-mono mt-1 block">{reorderLevel}</span>
                <span className="text-[10px] text-slate-400">Trigger threshold</span>
              </div>
            </div>
          </div>

          {/* AI Multi-Factor Supplier Optimization */}
          <div className="rounded-3xl border border-amber-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-heading">AI Supplier Optimization (Agent 1)</h3>
                  <p className="text-[11px] text-slate-400">Multi-criteria algorithmic ranking (Price 40%, Quality 35%, Delivery 15%, Reliability 10%)</p>
                </div>
              </div>
            </div>

            {aiLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                Calculating optimal supplier routing...
              </div>
            ) : aiEval?.recommended_supplier ? (
              <div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Top Recommended Vendor</span>
                    <h4 className="text-base font-black text-slate-900 font-heading mt-0.5">
                      {aiEval.recommended_supplier.supplier_name || aiEval.recommended_supplier.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">
                      {aiEval.explanation || "Selected based on superior composite scoring."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Overall Score</span>
                      <span className="text-2xl font-black text-amber-600 font-mono">
                        {aiEval.recommended_supplier.final_score ?? aiEval.recommended_supplier.composite_score ?? 92}/100
                      </span>
                    </div>
                    <Link
                      to="/admin/purchase-orders"
                      className="btn-press rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs whitespace-nowrap"
                    >
                      Create PO
                    </Link>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                {aiEval.all_evaluated_suppliers && aiEval.all_evaluated_suppliers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Candidate Evaluation Matrix</span>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {aiEval.all_evaluated_suppliers.map((sup, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-900">{sup.supplier_name || sup.name}</span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-3 mt-0.5">
                              <span>Quote: {formatINR(toINR(sup.price || sup.unit_cost || 0))}</span>
                              <span>Quality: {sup.quality_score}/100</span>
                              <span>Lead time: {sup.delivery_days} days</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                            Score: {sup.final_score ?? sup.composite_score}/100
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No active supplier quotes found for this specific hardware item. Visit{" "}
                <Link to="/admin/suppliers" className="text-amber-600 font-bold hover:underline">
                  Suppliers & Vendors
                </Link>{" "}
                to assign supplier pricing.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
