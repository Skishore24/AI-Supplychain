import { Link } from "react-router-dom";
import { ShoppingCart, Check, Star, Heart, ArrowDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

// ─── Single WebP placeholder ───
export const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fm=webp&fit=crop&w=600&q=80";

// Returns sample image or real URL if provided
export const getProductImage = (product = {}) => {
  if (product.image_url && product.image_url.trim()) return product.image_url.trim();
  return SAMPLE_IMAGE;
};

// Realistic mock ratings based on product id
const getProductRating = (id = 1) => {
  const ratings = [4.7, 4.3, 4.8, 4.1, 4.9, 4.5, 4.4];
  const reviews = [1420, 890, 2340, 560, 3120, 780, 1150];
  const discounts = [63, 73, 77, 89, 54, 68, 80];
  const highlights = [
    "Lowest price since launch",
    "Hot Deal",
    "Best Seller",
    "Top Rated",
    "Limited Stock Deal",
  ];
  const idx = Math.abs(id) % ratings.length;
  return {
    score: ratings[idx],
    count: reviews[idx],
    discount: discounts[idx],
    highlight: highlights[idx % highlights.length],
  };
};

export default function ProductCard({ product, index = 0, variant = "standard" }) {
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

  const rawPrice = Number(product.price) || 29.99;
  const meta = getProductRating(product.id || 1);
  const discountPercent = meta.discount;
  
  // Format in ₹ (Rupees) like Flipkart / Amazon screenshot
  const inrPrice = Math.round(rawPrice * 83);
  const inrOriginalPrice = Math.round(inrPrice / (1 - discountPercent / 100));

  const fullStars = Math.floor(meta.score);

  return (
    <div
      className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 transition-all duration-300 hover:shadow-xl hover:border-amber-200/70 hover:-translate-y-0.5 w-full font-poppins"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div>
        {/* Top Header: Sponsored tag + Floating Wishlist Heart */}
        <div className="flex items-center justify-between mb-1 min-h-[22px]">
          <span className="text-[10px] font-medium text-slate-400 tracking-tight">
            {product.badge ? (
              <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{product.badge}</span>
            ) : index % 2 === 0 ? (
              "Sponsored"
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-900 bg-amber-50/90 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px]">
                Ekart Assured
              </span>
            )}
          </span>

          <button
            onClick={handleWishlist}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 active:scale-90"
            title="Add to Wishlist"
            aria-label="Add to Wishlist"
          >
            <Heart
              size={17}
              className={`transition-colors duration-200 ${
                wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* Product Image */}
        <Link
          to={`/product/${product.id}`}
          className="block relative h-36 sm:h-44 w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center mb-2"
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

        {/* Product Title (2 lines clamp) */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors font-poppins">
            {product.name}
          </h3>
        </Link>

        {/* Pricing Row: Green Discount + Strikethrough + Bold Price */}
        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap font-poppins">
          {/* Green Discount with Down Arrow */}
          <span className="inline-flex items-center text-xs font-black text-emerald-600">
            <ArrowDown size={11} className="stroke-[3]" />
            {discountPercent}%
          </span>

          {/* Strikethrough MRP */}
          <span className="text-[11px] font-medium text-slate-400 line-through">
            ₹{inrOriginalPrice.toLocaleString("en-IN")}
          </span>

          {/* Current Selling Price */}
          <span className="text-sm sm:text-base font-heading font-black text-slate-950 tracking-tight">
            ₹{inrPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Green Stars Rating Bar (Flipkart / Amazon style) */}
        <div className="mt-1 flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < fullStars
                    ? "fill-emerald-600 text-emerald-600"
                    : i === fullStars && meta.score % 1 >= 0.5
                    ? "fill-emerald-600/60 text-emerald-600/60"
                    : "fill-slate-200 text-slate-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            ({meta.count.toLocaleString("en-IN")})
          </span>
        </div>

        {/* Special Highlight Pill (e.g. Lowest price since launch) */}
        <div className="mt-1.5">
          <span className="inline-block rounded-xs bg-emerald-50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 border border-emerald-100/60">
            {meta.highlight}
          </span>
        </div>
      </div>

      {/* Quick Add To Cart Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">
          {product.category || "Audio & Tech"}
        </span>

        <button
          onClick={handleAdd}
          className={`btn-press inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xs transition-all duration-200 ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-slate-950 hover:bg-amber-600 active:scale-95 text-white"
          }`}
          title="Quick add to cart"
        >
          {added ? (
            <>
              <Check size={12} />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart size={12} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}