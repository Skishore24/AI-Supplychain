import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, Layers, BarChart3, Cpu } from "lucide-react";
import Navbar from "../../components/user/Navbar";

import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import { API_BASE_URL } from "../../context/CartContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products
    fetch(`${API_BASE_URL}/products/`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });

    // Fetch AI Summary
    fetch(`${API_BASE_URL}/recommendations/summary`)
      .then((res) => res.json())
      .then((data) => setAiStats(data))
      .catch((err) => console.warn("AI summary error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-6 py-24 sm:py-32">
          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6 backdrop-blur-md">
              <Sparkles size={14} className="animate-spin text-blue-300" />
              <span>Multi-Agent Autonomous Supply Chain Platform</span>
            </div>

            <h1 className="max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Next-Gen Commerce Powered by{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Predictive AI Intelligence
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
              Experience zero-stockout reliability. Our multi-agent AI automatically optimizes supplier ranking, restock schedules, and delivery speeds in real-time.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/40"
              >
                <span>Browse Store Catalog</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <Cpu size={16} className="text-indigo-400" />
                <span>Launch Admin & AI Hub</span>
              </Link>
            </div>

            {/* Live AI Health Metrics Strip */}
            {aiStats && (
              <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                <div>
                  <div className="text-xs font-medium text-slate-400">AI Supply Health</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">
                    {aiStats.supply_chain_health_score}/100
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400">Total Products</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {aiStats.total_products}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400">Active Suppliers</div>
                  <div className="mt-1 text-2xl font-bold text-blue-400">
                    {aiStats.total_suppliers}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400">Units in Stock</div>
                  <div className="mt-1 text-2xl font-bold text-indigo-300">
                    {aiStats.total_stock_units}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Instant Dispatch</span>
              <h2 className="text-3xl font-bold text-white mt-1">Featured Inventory</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              <span>View all products</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400">
              No products found in the database.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* How Multi-Agent AI Works */}
        <section className="border-t border-slate-900 bg-slate-900/40 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Supply Chain Agents</span>
              <h2 className="text-3xl font-bold text-white mt-2">Autonomous Multi-Agent Coordination</h2>
              <p className="mt-3 text-slate-400 text-sm">
                Three specialized AI agents continually collaborate to ensure product availability, low costs, and rapid fulfillment.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
                  <Truck size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white">Agent 1: Supplier Optimizer</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  Evaluates unit cost (40%), verified quality scores (35%), and delivery lead times (25%) across multiple suppliers to pick the ideal procurement route.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white">Agent 2: Restock & Stockout Risk</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  Monitors real-time stock levels against safety stock thresholds, generating proactive reorder recommendations before stockouts occur.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white">Agent 3: Demand Velocity</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  Tracks sales velocity and purchase trends across product categories to dynamically suggest buffer adjustments and price points.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;