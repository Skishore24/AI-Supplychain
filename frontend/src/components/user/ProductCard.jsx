import { Link } from "react-router-dom";
import { ShoppingCart, Check, Heart, Star, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { formatINR, toINR } from "../../utils/currency";

// Clean hardware component SVG placeholder (data URI)
export const SAMPLE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F8FAFC'/%3E%3Cg fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='110' y='110' width='180' height='180' rx='20' fill='%23FFFFFF' stroke='%23CBD5E1' stroke-width='2.5'/%3E%3Cpath d='M150 110 V80 M200 110 V80 M250 110 V80'/%3E%3Cpath d='M150 290 V320 M200 290 V320 M250 290 V320'/%3E%3Cpath d='M110 150 H80 M110 200 H80 M110 250 H80'/%3E%3Cpath d='M290 150 H320 M290 200 H320 M290 250 H320'/%3E%3Ccircle cx='200' cy='200' r='36' fill='%23EEF2F6' stroke='%2394A3B8' stroke-width='2'/%3E%3Cpath d='M188 200h24M200 188v24' stroke='%23D97706' stroke-width='3'/%3E%3C/g%3E%3Ctext x='200' y='360' text-anchor='middle' font-family='sans-serif' font-size='12' font-weight='700' fill='%2364748B' letter-spacing='1'%3EHARDWARE COMPONENT%3C/text%3E%3C/svg%3E";

export const getProductImage = (product = {}) => {
  if (product.image_url && typeof product.image_url === "string" && product.image_url.trim()) {
    return product.image_url.trim();
  }
  return SAMPLE_IMAGE;
};

export default function ProductCard({ product = {}, index = 0 }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(getProductImage(product));
  const [wishlisted, setWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((w) => !w);
  };

  const priceNum = Number(product.price) || 0;
  const inrPrice = toINR(priceNum);
  const origPriceINR = Math.round(inrPrice * 1.25); // Simulated original MSRP for deal strikethrough

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 w-full font-poppins"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div>
        {/* Top: Category Tag + Wishlist Heart (Matching reference image) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[70%]">
            {product.category || "Hardware"}
          </span>

          <button
            onClick={handleWishlist}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 active:scale-90"
            title="Add to Wishlist"
            aria-label="Add to Wishlist"
          >
            <Heart
              size={16}
              className={`transition-colors duration-200 ${
                wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* Product Image Link */}
        <Link
          to={`/product/${product.id}`}
          className="block relative h-36 sm:h-44 w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center mb-3"
        >
          {!imgLoaded && <div className="skeleton absolute inset-0" />}
          <img
            src={imgSrc}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgSrc(SAMPLE_IMAGE);
              setImgLoaded(true);
            }}
            className={`h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
        </Link>

        {/* Product SKU */}
        {product.sku && (
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1 truncate">
            <span>SKU:</span>
            <span className="font-semibold text-slate-600">{product.sku}</span>
          </div>
        )}

        {/* Product Title */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Star Ratings (Matching reference image) */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-500">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((s) => (
              <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
            ))}
            <Star size={11} className="fill-amber-200 text-amber-400" />
          </div>
          <span className="text-[10px] font-semibold text-slate-400 ml-0.5">(1.2k)</span>
        </div>

        {/* Pricing with Rupee and Strikethrough MSRP */}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-heading font-black text-slate-950 tracking-tight">
            {formatINR(inrPrice)}
          </span>
          <span className="text-[11px] font-medium text-slate-400 line-through">
            {formatINR(origPriceINR)}
          </span>
        </div>
      </div>

      {/* Footer: View Details & Quick Add */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/product/${product.id}`}
          className="text-xs font-bold text-slate-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
        >
          <span>Details</span>
          <ArrowRight size={12} />
        </Link>

        <button
          onClick={handleAdd}
          className={`btn-press inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-all duration-200 cursor-pointer ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-slate-950 hover:bg-amber-600 active:scale-95 text-white"
          }`}
          title="Add to cart"
        >
          {added ? (
            <>
              <Check size={13} />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart size={13} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}