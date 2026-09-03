import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Check, Sparkles, AlertTriangle } from "lucide-react";
import Navbar from "../../components/user/Navbar";

import Footer from "../../components/user/Footer";
import { useCart, API_BASE_URL } from "../../context/CartContext";

const getCategoryIcon = (category = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("batter") || cat.includes("energy")) return "🔋";
  if (cat.includes("semi") || cat.includes("mcu") || cat.includes("arm")) return "⚡";
  if (cat.includes("display") || cat.includes("oled") || cat.includes("screen")) return "🖥️";
  if (cat.includes("motor") || cat.includes("actuator")) return "⚙️";
  if (cat.includes("thermal") || cat.includes("heat")) return "❄️";
  if (cat.includes("sensor")) return "📡";
  return "📦";
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [supplierAi, setSupplierAi] = useState(null);
  const [inventoryInfo, setInventoryInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch product
    fetch(`${API_BASE_URL}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);

        // Fetch AI Supplier Recommendation for this product
        fetch(`${API_BASE_URL}/recommendations/supplier/${encodeURIComponent(data.name)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((recData) => setSupplierAi(recData))
          .catch((err) => console.warn("Supplier AI error:", err));

        // Fetch inventory info
        fetch(`${API_BASE_URL}/inventory/${data.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((invData) => setInventoryInfo(invData))
          .catch((err) => console.warn("Inventory fetch error:", err));
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-5xl py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading product intelligence...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-3xl py-24 text-center">
          <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
          <p className="mt-2 text-slate-400">The requested item could not be retrieved from the database.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white">
            Back to Store
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const price = Number(product.price) || 29.99;
  const currentStock = inventoryInfo ? inventoryInfo.current_stock : 25;
  const isLowStock = currentStock <= (inventoryInfo?.reorder_level || 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-6 py-12">
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Visual Showcase */}
          <div className="relative flex h-[420px] items-center justify-center rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-10 text-9xl shadow-2xl">
            <span className="animate-pulse-slow">{getCategoryIcon(product.category)}</span>
            <div className="absolute top-4 left-4 rounded-full bg-slate-800/90 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
              {product.category}
            </div>
            {isLowStock && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
                <AlertTriangle size={14} />
                <span>Low Stock ({currentStock} left)</span>
              </div>
            )}
          </div>

          {/* Details & Purchase */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              SKU: {product.sku}
            </span>

            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <div className="text-3xl font-extrabold text-white">
                ${price.toFixed(2)}
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                In Stock & Verified ({currentStock} Units)
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-300">
              {product.description || "High-reliability industrial component integrated with automated multi-agent supply chain forecasting and autonomous replenishment."}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">Quantity:</span>
                <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 text-slate-300 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-1.5 text-slate-300 hover:text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition shadow-lg ${
                    added
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30"
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-8 py-3.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* AI Supply Chain Intelligence Box */}
            {supplierAi && supplierAi.best_supplier && (
              <div className="mt-10 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="animate-spin text-indigo-300" />
                  <span>AI Multi-Agent Supplier Intelligence</span>
                </div>
                <div className="text-sm font-semibold text-white">
                  Ranked #1 Supplier: {supplierAi.best_supplier.name}
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {supplierAi.recommendation_reason}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                    <div className="text-slate-400">Supplier Price</div>
                    <div className="font-bold text-white mt-0.5">${supplierAi.best_supplier.price}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                    <div className="text-slate-400">Quality Score</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{supplierAi.best_supplier.quality_score}%</div>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                    <div className="text-slate-400">Fulfillment</div>
                    <div className="font-bold text-blue-400 mt-0.5">{supplierAi.best_supplier.delivery_days} Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;