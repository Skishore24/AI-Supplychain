import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Sparkles,
  Flame,
  ChevronRight,
  ChevronLeft,
  Cpu,
  BatteryCharging,
  Tv,
  Radio,
  Zap,
  Bot,
  Activity,
  Award,
  Layers
} from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import api from "../../services/api";
import { formatINR, toINR } from "../../utils/currency";
import heroBanner from "../../assets/hero_banner.jpg";
import categoryBanner from "../../assets/category_banner.jpg";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.products.list({ limit: 50 }),
      api.categories.list()
    ])
      .then(([prodData, catData]) => {
        setProducts(Array.isArray(prodData) ? prodData : prodData.items || []);
        setCategories(Array.isArray(catData) ? catData : catData.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products/categories from DB:", err);
        setLoading(false);
      });
  }, []);

  // Dynamically derived from products in PostgreSQL
  const officialBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean))
  ).map((brandName) => ({
    name: brandName,
    tier: "Verified Partner",
    logo: brandName.slice(0, 3).toUpperCase(),
    bg: "bg-slate-900 text-amber-400"
  }));

  const todayDeals = products.slice(0, 5);
  const computeProducts = products.filter(
    (p) =>
      p.category?.toLowerCase().includes("semiconductor") ||
      p.category?.toLowerCase().includes("microcontroller") ||
      p.name?.toLowerCase().includes("microcontroller") ||
      p.name?.toLowerCase().includes("arm")
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col justify-between pb-20 lg:pb-0 font-poppins">
      <Navbar />

      <main className="flex-grow space-y-8 sm:space-y-12">
        {/* ── 1. HERO BENTO SECTION (Matching Reference Image) ──────────── */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Large Featured Banner (emox flagship card) */}
            <div className="lg:col-span-8 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[360px] shadow-lg">
              {/* Background ambient glow and generated banner */}
              <img
                src={heroBanner}
                alt="AI Supply Chain Hardware"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity scale-105"
              />
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute left-1/3 -bottom-16 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

              <div className="relative z-10 max-w-md space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-amber-400 backdrop-blur-xs">
                  <Sparkles size={13} />
                  <span>Next-Gen Edge AI Hardware</span>
                </span>
                
                <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white leading-tight">
                  STM32 & Jetson AI
                  <span className="block text-amber-400">From ₹2,490*</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  All-chip Superfast Architecture. Certified brand-authentic hardware with express pan-India dispatch and warranty.
                </p>

                <div className="pt-2">
                  <Link
                    to="/shop"
                    className="btn-press inline-flex items-center gap-2 rounded-full bg-white text-slate-950 hover:bg-amber-400 hover:text-slate-950 px-6 py-2.5 text-xs font-bold shadow-md transition-all duration-200"
                  >
                    <span>Shop Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right Decorative 3D Device Preview Simulation */}
              <div className="hidden sm:flex absolute right-6 bottom-4 h-64 w-64 items-center justify-center pointer-events-none">
                <div className="relative w-48 h-56 rounded-3xl border-4 border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl p-3 flex flex-col justify-between overflow-hidden rotate-3">
                  <div className="h-4 w-16 bg-slate-800 rounded-full mx-auto" />
                  <div className="space-y-2 text-center my-auto">
                    <Cpu size={44} className="mx-auto text-amber-400 animate-pulse" />
                    <div className="text-[11px] font-mono text-slate-400 font-bold">EMOX CORTEX-M4</div>
                    <div className="text-xs font-black text-emerald-400">READY TO SHIP</div>
                  </div>
                  <div className="h-1 w-20 bg-slate-800 rounded-full mx-auto" />
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-4">
                <span>*Prices converted in real-time to INR (₹)</span>
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-6 rounded-full bg-amber-400" />
                  <span className="h-1.5 w-2 rounded-full bg-white/30" />
                  <span className="h-1.5 w-2 rounded-full bg-white/30" />
                </div>
              </div>
            </div>

            {/* Right Side Promo Banners (Matching Reference Image) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Upper Banner: SALE UP TO 50% OFF */}
              <div className="rounded-3xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-6 text-white relative overflow-hidden flex-1 flex flex-col justify-between shadow-md">
                <img
                  src={categoryBanner}
                  alt="Industrial Components"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay"
                />
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                    FLASH PROMO
                  </span>
                  <div className="mt-2 font-heading font-black text-2xl sm:text-3xl leading-tight">
                    SALE <br />
                    UP TO <span className="text-yellow-200">50%</span> OFF
                  </div>
                  <p className="mt-1 text-xs text-white/90 font-medium">
                    On Motors, Displays & Batteries
                  </p>
                </div>

                <div className="relative z-10 pt-4">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 text-xs font-black bg-slate-950 text-white hover:bg-slate-800 px-4 py-1.5 rounded-full transition"
                  >
                    <span>View Deals</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Decorative overlay icon */}
                <Zap size={96} className="absolute -right-4 -bottom-4 text-white/15 pointer-events-none" />
              </div>

              {/* Lower Mini Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-slate-950 flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider">Volume Discounts</div>
                  <div className="font-heading font-black text-lg text-slate-950">Bundle Packs in ₹</div>
                  <p className="text-[11px] text-slate-900/80">Save up to 35% extra</p>
                </div>
                <Link
                  to="/shop"
                  className="rounded-full bg-slate-950 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-slate-800 transition shrink-0"
                >
                  Explore Deals
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. EXPLORE POPULAR CATEGORIES (Circular Cards from Reference Image) ── */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 tracking-tight">
                Explore Popular Categories
              </h2>
              <p className="text-xs text-slate-500">Curated industrial catalog & verified inventory</p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id || i}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              >
                {/* Circular Photographic Container with soft shadow and zoom effect */}
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-md group-hover:shadow-xl group-hover:border-amber-400 transition-all p-0.5">
                  <img
                    src={cat.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"}
                    alt={cat.name}
                    className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 rounded-full bg-slate-950/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 3. TODAY'S BEST DEALS FOR YOU! (Matching Reference Image) ─── */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 tracking-tight">
                  Todays Best Deals For You!
                </h2>
                <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-black text-rose-700">
                  HOT DEALS
                </span>
              </div>
              <p className="text-xs text-slate-500">Verified factory pricing with fast doorstep express shipping</p>
            </div>
            <Link
              to="/shop?sort=deals"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1"
            >
              <span>View All Deals</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-white animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {todayDeals.map((prod, idx) => (
                <ProductCard key={prod.id || idx} product={prod} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* ── 4. TRIPLE PROMOTIONAL BANNERS (Matching Reference Image) ─── */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Vibrant Coral / Berry Banner */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-md group">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  FACTORY VERIFIED
                </span>
                <h3 className="mt-2 font-heading font-black text-xl leading-tight">
                  FRESH STOCK &amp; SENSORS
                </h3>
                <p className="mt-1 text-xs text-rose-100 font-medium">
                  50% Save &middot; Same-day dispatch across India
                </p>
              </div>
              <div>
                <Link
                  to={`/shop?category=${encodeURIComponent("Sensors & IoT")}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white text-rose-700 px-4 py-1.5 text-xs font-black shadow-xs hover:bg-rose-50 transition"
                >
                  <span>Shop Sensors</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Card 2: Sky Blue AI Compute Card (Matching Samsung Galaxy card) */}
            <div className="rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-md group">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  NEXT-GEN TECH
                </span>
                <h3 className="mt-2 font-heading font-black text-xl leading-tight">
                  ARM CORTEX-M4
                  <span className="block text-cyan-200">Edge AI is Here</span>
                </h3>
                <p className="mt-1 text-xs text-sky-100 font-medium">
                  Optimized for embedded machine learning
                </p>
              </div>
              <div>
                <Link
                  to={`/shop?category=${encodeURIComponent("Semiconductors")}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white text-blue-700 px-4 py-1.5 text-xs font-black shadow-xs hover:bg-sky-50 transition"
                >
                  <span>Explore Boards</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Card 3: Vibrant Crimson / Amber Card (Matching emox special card) */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-md group">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  SPECIAL BUNDLE
                </span>
                <h3 className="mt-2 font-heading font-black text-xl leading-tight">
                  COMBO PACKS (₹)
                  <span className="block text-amber-200">Value Savings</span>
                </h3>
                <p className="mt-1 text-xs text-amber-100 font-medium">
                  Starter kits, sensors & development boards
                </p>
              </div>
              <div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 text-white px-4 py-1.5 text-xs font-black shadow-xs hover:bg-slate-800 transition"
                >
                  <span>Shop Combos</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. EXPLORE OFFICIAL BRAND STORES (Matching Reference Image) ─ */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 tracking-tight">
                Explore Official Brand Stores
              </h2>
              <p className="text-xs text-slate-500">Directly authorized manufacturing partners</p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1"
            >
              <span>View All Brands</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {officialBrands.map((brand, i) => (
              <Link
                key={i}
                to={`/shop?search=${encodeURIComponent(brand.name)}`}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading font-black text-xs ${brand.bg} shadow-xs transition-transform group-hover:scale-105`}>
                  {brand.logo}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                    {brand.name}
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-semibold truncate">
                    {brand.tier}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 6. FULL-WIDTH MEGA SALE BANNER (Matching Green Ramadan Banner) */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10 max-w-xl text-center md:text-left space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
                <Sparkles size={13} />
                <span>Special Mega Season Offer</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight">
                Up to 60% Off Factory Orders
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Free standard express shipping on all orders over ₹2,000. Seamless GST invoice generated instantly.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/shop"
                className="btn-press rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 px-7 py-3 text-xs font-black shadow-md transition"
              >
                Claim Offer in ₹
              </Link>
              <Link
                to="/orders"
                className="btn-press rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-xs font-bold backdrop-blur-xs transition"
              >
                Track Shipment
              </Link>
            </div>
          </div>
        </section>

        {/* ── 7. CURATED SECTION: BESTSELLERS IN COMPUTE ───────────────── */}
        {computeProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 tracking-tight">
                  Bestsellers in Compute &amp; Microcontrollers
                </h2>
                <p className="text-xs text-slate-500">Top rated industrial logic boards</p>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent("Semiconductors")}`}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {computeProducts.map((p, idx) => (
                <ProductCard key={p.id || idx} product={p} index={idx} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Home;