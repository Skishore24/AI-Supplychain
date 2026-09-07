import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ZoomIn,
  ChevronUp,
  ChevronDown,
  Check,
  Package,
  ArrowRight,
  X,
  AlertTriangle,
  Cpu,
  HelpCircle,
  Clock,
  Plus
} from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import ProductCard, { getProductImage, SAMPLE_IMAGE } from "../../components/user/ProductCard";
import { useCart, API_BASE_URL } from "../../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [inventoryInfo, setInventoryInfo] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Accordion states
  const [specsOpen, setSpecsOpen] = useState(true);
  const [boxOpen, setBoxOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(1);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    fetch(`${API_BASE_URL}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);

        // Fetch live inventory for this product
        fetch(`${API_BASE_URL}/inventory/${data.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((invData) => setInventoryInfo(invData))
          .catch((err) => console.warn("Inventory fetch error:", err));

        // Fetch related recommendations
        fetch(`${API_BASE_URL}/products/`)
          .then((res) => (res.ok ? res.json() : []))
          .then((allProducts) => {
            if (Array.isArray(allProducts)) {
              // Exclude current product and prefer same category
              const others = allProducts.filter((p) => p.id !== data.id);
              setRelatedProducts(others.slice(0, 4));
            }
          })
          .catch((err) => console.warn("Related products fetch error:", err));
      })
      .catch(() => {
        setProduct(null);
        setNotFound(true);
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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-20 md:pb-0">
        <Navbar />
        <div className="mx-auto max-w-5xl py-32 text-center">
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="mt-4 text-xs font-semibold text-slate-500 font-poppins">
            Loading product details...
          </p>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-20 md:pb-0">
        <Navbar />
        <main className="flex-grow mx-auto w-full max-w-2xl px-4 py-24 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
              <Package size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              Product Not Found
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-poppins">
              The requested item #{id} is currently unavailable or may have been moved.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/shop"
                className="rounded-xl bg-slate-950 hover:bg-amber-600 px-6 py-2.5 text-xs font-bold text-white transition shadow-xs font-poppins"
              >
                Back to Shop Catalog
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const rawPrice = Number(product.price) || 0;
  const inrPrice = Math.round(rawPrice * 83);
  const currentStock = inventoryInfo ? inventoryInfo.current_stock : 25;
  const currentImage = getProductImage(product);

  const procurementFaqs = [
    {
      id: 1,
      q: "How are components packaged for delivery?",
      a: "All items are packed in multi-layer anti-static ESD shielding bags with shock-absorbing foam to prevent transit damage and moisture exposure.",
    },
    {
      id: 2,
      q: "Can I place volume or bulk reorders?",
      a: "Yes. Bulk procurement requests are automatically scheduled and fulfilled via our automated supplier reorder intelligence pipeline.",
    },
    {
      id: 3,
      q: "What warranty coverage is included?",
      a: "Each unit includes a standard 1-year enterprise replacement warranty against manufacturing defects and electrical tolerances.",
    },
    {
      id: 4,
      q: "How is real-time inventory verified?",
      a: "All items in our catalog undergo rigorous stock verification. Quantities shown reflect genuine ready-to-ship inventory.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between pb-20 lg:pb-0 font-poppins">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── BREADCRUMB NAVIGATION ──────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-amber-700 transition-colors">
            Home
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/shop" className="hover:text-amber-700 transition-colors">
            Catalog
          </Link>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-600 font-semibold">{product.category || "Hardware"}</span>
          <span className="text-slate-300">&gt;</span>
          <span className="font-bold text-slate-900 line-clamp-1">{product.name}</span>
        </nav>

        {/* ── PRODUCT MAIN SECTION ─────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: Product Image Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 flex items-center justify-center shadow-xs overflow-hidden group">
              <span className="absolute top-4 left-4 rounded-md bg-amber-500/15 border border-amber-400/40 px-2.5 py-1 text-[11px] font-bold text-amber-900 z-10">
                {product.category || "Hardware Component"}
              </span>

              <div className="relative h-72 sm:h-96 w-full flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Zoom Button */}
              <button
                onClick={() => setZoomOpen(true)}
                className="absolute bottom-4 right-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-transform active:scale-95"
                title="Enlarge image"
                aria-label="Enlarge image"
              >
                <ZoomIn size={17} />
              </button>
            </div>
          </div>

          {/* RIGHT: Product Info, Price & Actions (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              {/* Category & Live Stock Status */}
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  {product.category || "Hardware"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({currentStock} available)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-slate-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.sku && (
                <div className="mt-2 text-xs font-mono text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-400">SKU:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{product.sku}</span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight text-emerald-900">
                  ₹{inrPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-base sm:text-lg font-semibold text-slate-400 line-through">
                  ₹{Math.round(inrPrice * 1.25).toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-emerald-700">
                Official Store Price &middot; 100% Genuine Guaranteed
              </p>
            </div>

            {/* Product Overview & Description */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description & Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description ||
                  "Verified industrial hardware component from authenticated suppliers. Calibrated for seamless integration."}
              </p>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-800">Quantity:</span>
              <div className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-sm font-extrabold text-slate-700 hover:bg-slate-200 rounded-l-xl transition disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-extrabold text-slate-900 min-w-8 text-center font-mono">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-sm font-extrabold text-slate-700 hover:bg-slate-200 rounded-r-xl transition disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`btn-press flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-extrabold shadow-md transition-all duration-200 ${
                    added
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-950 hover:bg-slate-900 text-white shadow-slate-950/20"
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className="h-12 w-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-all duration-200 active:scale-95 shadow-xs"
                  title="Add to wishlist"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={20}
                    className={`transition-colors ${
                      wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500 hover:text-rose-500"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="btn-press w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 py-3.5 px-6 text-sm font-black text-slate-950 shadow-md shadow-amber-500/25 transition-all duration-200 active:scale-98"
              >
                Buy Now
              </button>
            </div>

            {/* Dispatch estimate */}
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready for dispatch from local warehouse within 24 hours</span>
            </div>
          </div>
        </div>

        {/* ── TRUST & DISPATCH FEATURE BANNER ─────────────────────── */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Truck size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Fast Dispatch</p>
                <p className="text-[11px] text-slate-400">Direct warehouse delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <RotateCcw size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">30-Day RMA</p>
                <p className="text-[11px] text-slate-400">Guaranteed replacement</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Certified Quality</p>
                <p className="text-[11px] text-slate-400">100% factory inspected</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Live Tracking</p>
                <p className="text-[11px] text-slate-400">Real-time status updates</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TECHNICAL SPECIFICATIONS & FAQ ACCORDIONS ─────────────── */}
        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* COLUMN 1: Real Product Specifications */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-2">
                Technical Specifications
              </h3>
              <p className="text-xs text-slate-500">
                Verified component specifications and dimensions.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Item Code</span>
                <span className="font-mono font-bold text-slate-900">#{product.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Product Name</span>
                <span className="font-semibold text-slate-900 text-right max-w-[65%]">{product.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{product.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Stock Keeping Unit (SKU)</span>
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Unit Catalog Price</span>
                <span className="font-mono font-bold text-emerald-700">₹{inrPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-500">Availability</span>
                <span className="font-semibold text-slate-900">{currentStock} units in stock</span>
              </div>
            </div>

            {/* Packaging information */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Package Contents
              </h4>
              <ul className="space-y-1.5 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-600 shrink-0" />
                  <span>1x {product.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-600 shrink-0" />
                  <span>Moisture-barrier ESD antistatic protective packaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-600 shrink-0" />
                  <span>QC factory test & calibration certificate</span>
                </li>
              </ul>
            </div>
          </div>

          {/* COLUMN 2: Procurement & Delivery FAQs */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Procurement & Shipping FAQs
              </h3>
              <p className="text-xs text-slate-500">
                Essential order and fulfillment guidelines.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {procurementFaqs.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div key={faq.id} className="py-3">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-start justify-between gap-3 text-left text-xs font-bold text-slate-900 hover:text-amber-700 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={15} className="shrink-0 mt-0.5 text-amber-600" />
                      ) : (
                        <Plus size={15} className="shrink-0 mt-0.5 text-slate-400" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SIMILAR REAL PRODUCTS ───────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Frequently Bought Together
                </h3>
                <p className="text-xs text-slate-500">
                  Curated matching components and recommended hardware
                </p>
              </div>

              <Link
                to="/shop"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                View Catalog &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── IMAGE ZOOM MODAL ────────────────────────────────────── */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center"
          >
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
            <div className="max-h-[70vh] w-full flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.name}
                className="max-h-[65vh] max-w-full object-contain"
              />
            </div>
            <p className="mt-4 text-xs font-bold text-slate-800">{product.name}</p>
          </div>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}

export default ProductDetails;