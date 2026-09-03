import { Link } from "react-router-dom";
import { ShoppingCart, Check, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

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

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const price = Number(product.price) || 29.99;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10">
      <div>
        {/* Visual Icon / Header */}
        <div className="relative mb-4 flex h-44 items-center justify-center rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 text-6xl shadow-inner group-hover:scale-105 transition-transform duration-300">
          <span>{getCategoryIcon(product.category)}</span>
          <span className="absolute top-3 left-3 rounded-full bg-slate-800/90 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700/50">
            {product.category || "General"}
          </span>
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
            <Zap size={10} /> AI Optimized
          </span>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <p className="mt-1 text-xs font-mono text-slate-400">
            SKU: <span className="text-slate-300">{product.sku}</span>
          </p>

          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || "Certified component with AI-verified supplier reliability and optimal lead-times."}
          </p>
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Price</span>
          <div className="text-lg font-bold text-white">
            ${price.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/product/${product.id}`}
            className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            title="View Details"
          >
            <ArrowRight size={16} />
          </Link>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-md transition ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20"
            }`}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;