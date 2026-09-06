import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  Package,
  ArrowRight,
  X,
  AlertTriangle,
  Zap,
  HelpCircle,
  MessageSquare,
  Plus
} from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import DealsStrip from "../../components/user/DealsStrip";
import { useCart, API_BASE_URL } from "../../context/CartContext";
import { getProductImage, SAMPLE_IMAGE } from "../../components/user/ProductCard";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [inventoryInfo, setInventoryInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [zoomOpen, setZoomOpen] = useState(false);

  // Accordion states for Product Details
  const [specsOpen, setSpecsOpen] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);

  // FAQ accordion state (id of expanded question)
  const [activeFaq, setActiveFaq] = useState(1);

  // Gallery images (WebP high-res headphones)
  const galleryImages = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fm=webp&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fm=webp&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fm=webp&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fm=webp&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fm=webp&fit=crop&w=800&q=80",
  ];

  // Color swatches matching anatomy diagram
  const colors = [
    { name: "Black", bg: "bg-slate-900" },
    { name: "Silver", bg: "bg-slate-300" },
    { name: "Midnight Blue", bg: "bg-blue-900" },
  ];

  // FAQs matching anatomy diagram
  const faqs = [
    {
      id: 1,
      q: "How good is the noise cancellation?",
      a: "Features industry-leading active noise cancellation powered by dedicated HD processors. It dynamically adapts to your environment to virtually eliminate low and mid-frequency ambient sounds.",
    },
    {
      id: 2,
      q: "What is the battery life?",
      a: "Delivers up to 30 hours of continuous playback with noise cancellation enabled. Quick-charge provides 5 hours of playback from just a 10-minute charge.",
    },
    {
      id: 3,
      q: "Can I use these while charging?",
      a: "Yes, you can continue listening with the included 3.5mm audio cable while plugged into USB power.",
    },
    {
      id: 4,
      q: "Do they support voice assistants?",
      a: "Full built-in integration for Google Assistant, Alexa, and Siri with touch-to-activate controls.",
    },
    {
      id: 5,
      q: "How do I connect to multiple devices?",
      a: "Multipoint connection allows seamless pairing with two Bluetooth devices simultaneously. Switch effortlessly between calls on your phone and video on your laptop.",
    },
  ];

  // Related products matching anatomy diagram
  const relatedProducts = [
    {
      id: 201,
      name: "Bose QuietComfort 45",
      category: "Wireless Headphones",
      price: 329.0,
      rating: 4.8,
      reviews: 46,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fm=webp&fit=crop&w=400&q=80",
    },
    {
      id: 202,
      name: "Apple AirPods Max",
      category: "Over-Ear Headphones",
      price: 549.0,
      rating: 4.7,
      reviews: 38,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fm=webp&fit=crop&w=400&q=80",
    },
    {
      id: 203,
      name: "JBL Tune 760NC",
      category: "Wireless Headphones",
      price: 129.99,
      rating: 4.6,
      reviews: 52,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fm=webp&fit=crop&w=400&q=80",
    },
    {
      id: 204,
      name: "Sennheiser HD 450BT",
      category: "Wireless Headphones",
      price: 149.95,
      rating: 4.5,
      reviews: 29,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fm=webp&fit=crop&w=400&q=80",
    },
    {
      id: 205,
      name: "Anker Soundcore Life Q30",
      category: "Wireless Headphones",
      price: 79.99,
      rating: 4.6,
      reviews: 61,
      image: SAMPLE_IMAGE,
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);

        // Fetch inventory info
        fetch(`${API_BASE_URL}/inventory/${data.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((invData) => setInventoryInfo(invData))
          .catch((err) => console.warn("Inventory fetch error:", err));
      })
      .catch(() => {
        // Fallback demo product matching anatomy
        setProduct({
          id: id || 1,
          name: "Sony WH-1000XM4 Wireless Headphones",
          category: "Headphones",
          price: 269.99,
          sku: "SNY-WH1000XM4-BLK",
          description:
            "Experience industry-leading noise cancellation and premium sound quality with the Sony WH-1000XM4 Wireless Headphones. Designed for all-day comfort, these headphones adapt to your environment and deliver an immersive listening experience.",
        });
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
        <div className="mx-auto max-w-5xl py-24 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Loading product details...</p>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const rawPrice = Number(product?.price) || 269.99;
  const inrPrice = Math.round(rawPrice * 83);
  const inrOriginalPrice = Math.round(inrPrice * 1.35);
  const inrSavings = inrOriginalPrice - inrPrice;
  const discountPercent = Math.round(((inrOriginalPrice - inrPrice) / inrOriginalPrice) * 100);
  const currentStock = inventoryInfo ? inventoryInfo.current_stock : 42;

  const currentImage =
    product?.image_url && product.image_url !== SAMPLE_IMAGE && activeImageIndex === 0
      ? product.image_url
      : galleryImages[activeImageIndex] || galleryImages[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── BREADCRUMB NAVIGATION ──────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/shop" className="hover:text-blue-600 transition-colors">
            Electronics
          </Link>
          <span className="text-slate-300">&gt;</span>
          <Link to="/shop" className="hover:text-blue-600 transition-colors">
            {product.category || "Headphones"}
          </Link>
          <span className="text-slate-300">&gt;</span>
          <span className="font-bold text-slate-800 line-clamp-1">{product.name}</span>
        </nav>

        {/* ── TOP HERO: PRODUCT IMAGE & PURCHASE BOX ──────────────── */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: Product Image & Thumbnail Gallery (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Main Image Card */}
            <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex items-center justify-center shadow-xs overflow-hidden group">
              {/* Discount Tag */}
              <span className="absolute top-4 left-4 rounded-md bg-rose-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-xs z-10">
                ↓ {discountPercent}% OFF
              </span>

              {/* Main Image */}
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

            {/* Thumbnail Gallery Row */}
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative h-16 sm:h-20 rounded-2xl border-2 p-1 bg-white overflow-hidden transition-all duration-200 ${
                    activeImageIndex === i
                      ? "border-amber-500 shadow-md ring-2 ring-amber-200/60 scale-102"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="h-full w-full object-cover rounded-xl"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info, Pricing & CTA (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5 font-poppins">
            <div>
              {/* Category & Live Stock Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/40">
                  {product.category || "Electronics / Premium Audio"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({currentStock} units available)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-slate-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews (Flipkart green stars) */}
              <div className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-emerald-600 text-emerald-600" />
                  ))}
                </div>
                <span className="font-bold text-emerald-700">4.9</span>
                <a
                  href="#reviews"
                  className="font-bold text-amber-700 hover:underline transition-colors"
                >
                  (95 Reviews)
                </a>
              </div>
            </div>

            {/* Pricing, Discounts & Offers (Flipkart/Amazon style) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight">
                  ₹{inrPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-400 line-through">
                  ₹{inrOriginalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-600">
                  ↓ {discountPercent}% off
                </span>
              </div>
              <p className="mt-1 text-xs font-extrabold text-emerald-600">
                Special price &middot; You save ₹{inrSavings.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Product Overview & Description Words */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-poppins">
                {product.description ||
                  "Experience industry-leading noise cancellation and exceptional sound clarity with the Sony WH-1000XM4. Designed with plush pressure-relieving earpads and intelligent adaptive sound control, these wireless headphones provide immersive music reproduction and crystal-clear hands-free calling with up to 30 hours of battery life."}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] sm:text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Dual Noise Sensor HD QN1 Tech</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>30-Hour Battery + Quick Charge</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Multipoint 2-Device Pairing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Touch Sensor & Speak-to-Chat</span>
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span>Color:</span>
                <span className="text-slate-600 font-semibold">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-8 w-8 rounded-full ${c.bg} transition-all duration-200 relative ${
                      selectedColor === c.name
                        ? "ring-2 ring-amber-500 ring-offset-2 scale-108 shadow-sm"
                        : "border border-slate-300 hover:scale-105 opacity-85"
                    }`}
                    title={c.name}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
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
                <span className="px-4 py-1.5 text-xs font-extrabold text-slate-900 min-w-8 text-center">
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
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Primary Add to Cart */}
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

                {/* Wishlist Button */}
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

              {/* Buy Now Button (Luxury Champagne Gold Gradient) */}
              <button
                onClick={handleBuyNow}
                className="btn-press w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 py-3.5 px-6 text-sm font-black text-slate-950 shadow-md shadow-amber-500/25 transition-all duration-200 active:scale-98"
              >
                Buy Now
              </button>
            </div>

            {/* Delivery / Shipping Estimate */}
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Order now to get it by May 28 - May 31</span>
            </div>
          </div>
        </div>

        {/* ── TRUST & FEATURE BANNER STRIP ───────────────────────── */}
        <section className="mt-10 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Truck size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Free Shipping</p>
                <p className="text-[11px] text-slate-400">Free shipping on all orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <RotateCcw size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Easy Returns</p>
                <p className="text-[11px] text-slate-400">30 days easy returns</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Secure Payment</p>
                <p className="text-[11px] text-slate-400">100% secure payment</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 lg:pt-0 lg:px-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Headphones size={22} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">Live Support</p>
                <p className="text-[11px] text-slate-400">24/7 customer support</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-COLUMN PRODUCT DETAILS ANATOMY ─────────────────────── */}
        <section className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* COLUMN 1: Product Description & Accordions */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-3">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description ||
                  "Experience industry-leading noise cancellation and premium sound quality with the Sony WH-1000XM4 Wireless Headphones. Designed for all-day comfort, these headphones adapt to your environment and deliver an immersive listening experience."}
              </p>

              {/* Feature bullet checklist */}
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span>Industry-leading noise cancellation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span>Up to 30 hours of battery life</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span>Quick charge: 10 min charge for 5 hours of playback</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span>Touch sensor controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span>Speak-to-Chat pauses music when you talk</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span>Multipoint connection for two devices</span>
                </li>
              </ul>
            </div>

            {/* Accordion: Specifications */}
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={() => setSpecsOpen((s) => !s)}
                className="flex w-full items-center justify-between py-2 text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
              >
                <span>Specifications</span>
                {specsOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
              </button>
              {specsOpen && (
                <div className="mt-3 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 animate-slide-down">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Driver Unit</span>
                    <span className="font-semibold text-slate-800">40mm Dome Type</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Frequency Response</span>
                    <span className="font-semibold text-slate-800">4Hz - 40,000Hz</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Bluetooth Version</span>
                    <span className="font-semibold text-slate-800">5.0 (LDAC, AAC, SBC)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-slate-500">Weight</span>
                    <span className="font-semibold text-slate-800">254g (approx.)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: What's in the box */}
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={() => setBoxOpen((b) => !b)}
                className="flex w-full items-center justify-between py-2 text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
              >
                <span>What's in the box</span>
                {boxOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
              </button>
              {boxOpen && (
                <ul className="mt-3 space-y-1.5 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-3 animate-slide-down">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>Sony WH-1000XM4 Wireless Headphones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>Carrying Case with Cable Organizer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>USB Type-C Charging Cable (approx. 20 cm)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>Headphone Audio Cable (approx. 1.2 m)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>Plug Adaptor for In-flight Use</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* COLUMN 2: Customer Reviews & Ratings */}
          <div
            id="reviews"
            className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5"
          >
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Customer Reviews</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">4.9</span>
                <span className="text-lg text-amber-500 font-bold">★</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Based on 95 reviews</p>
            </div>

            {/* Rating distribution breakdown */}
            <div className="space-y-1.5 text-xs font-medium text-slate-600">
              {[
                { star: 5, count: 88, pct: 92 },
                { star: 4, count: 6, pct: 6 },
                { star: 3, count: 1, pct: 2 },
                { star: 2, count: 0, pct: 0 },
                { star: 1, count: 0, pct: 0 },
              ].map((r) => (
                <div key={r.star} className="flex items-center gap-2">
                  <span className="w-5 text-right font-bold text-slate-700">{r.star} ★</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[11px] text-slate-400">{r.count}</span>
                </div>
              ))}
            </div>

            {/* Verified Customer Reviews list */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs font-bold text-slate-900">
                    Excellent sound quality!
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The noise cancellation is incredible. Perfect for work and travel.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-700">John D.</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">Verified Purchase</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs font-bold text-slate-900">Very comfortable</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I can wear these for hours without any discomfort.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-700">Sarah M.</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">Verified Purchase</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs font-bold text-slate-900">Worth every penny</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Best headphones I've ever owned. Highly recommend!
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-700">Michael T.</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">Verified Purchase</span>
                </div>
              </div>
            </div>

            <button className="btn-press w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors">
              View All Reviews
            </button>
          </div>

          {/* COLUMN 3: Frequently Asked Questions (FAQ) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {faqs.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div key={faq.id} className="py-3">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-start justify-between gap-3 text-left text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={15} className="shrink-0 mt-0.5" />
                      ) : (
                        <Plus size={15} className="shrink-0 mt-0.5 text-slate-400" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed animate-slide-down">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="btn-press mt-4 w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors">
              View All FAQs
            </button>
          </div>
        </section>

        {/* ── TOP SALE DEALS STRIP ─────────────────────────────────── */}
        <div className="mt-10">
          <DealsStrip
            title="Top Sale Deals & Bundles"
            subtitle="Shop at unbeatable prices with free fast delivery"
            to="/shop"
          />
        </div>

        {/* ── RELATED PRODUCTS ROW (Screenshot Match) ─────────────── */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Similar Products You May Like
              </h3>
              <p className="text-xs text-slate-400">Based on this item category & customer trends</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                title="Previous"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
                title="Next"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Related products 2-column responsive grid on mobile, 5-col on desktop */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 pb-2">
            {relatedProducts.map((item) => {
              const inrItemPrice = Math.round(item.price * 83);
              const inrItemOrig = Math.round(inrItemPrice * 1.4);
              return (
                <div
                  key={item.id}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div>
                    <div className="h-32 sm:h-36 w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-2 transition-transform duration-400 group-hover:scale-108"
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-amber-700 transition-colors font-poppins">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate font-poppins">{item.category}</p>

                    {/* Green Stars Rating */}
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < Math.floor(item.rating)
                                ? "fill-emerald-600 text-emerald-600"
                                : "fill-slate-200 text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">({item.reviews})</span>
                    </div>

                    {/* Price with green discount */}
                    <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap font-poppins">
                      <span className="text-xs font-black text-emerald-600">↓ 40%</span>
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{inrItemOrig.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs sm:text-sm font-heading font-black text-slate-950">
                        ₹{inrItemPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-slate-100 font-poppins">
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                      Free Delivery
                    </span>
                    <button
                      onClick={() => {
                        addToCart(
                          { id: item.id, name: item.name, price: item.price, image_url: item.image },
                          1
                        );
                      }}
                      className="btn-press h-7 w-7 rounded-full bg-slate-950 hover:bg-amber-600 text-white flex items-center justify-center transition-colors shadow-xs"
                      title="Add to cart"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
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
            <p className="mt-4 text-xs font-bold text-slate-700">{product.name}</p>
          </div>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}

export default ProductDetails;