import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw, Clock,
  Sparkles, ChevronRight, ChevronLeft, Star, Quote, Package,
  Zap, Cpu, Battery, Monitor, Bot, Radio, Check
} from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import DealsStrip from "../../components/user/DealsStrip";
import { API_BASE_URL } from "../../context/CartContext";

// ─── Sample placeholder image (WebP) ───
export const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fm=webp&fit=crop&w=600&q=80";

function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const carouselRef = useRef(null);

  const [productsRef, productsVisible] = useScrollReveal(0.05);
  const [promoRef, promoVisible] = useScrollReveal(0.1);
  const [testimonialRef, testimonialVisible] = useScrollReveal(0.1);

  const DEFAULT_FALLBACK_PRODUCTS = [
    {
      id: 101,
      name: "Glycolic Acid 7% Toning Solution",
      category: "The Ordinary",
      price: 14.50,
      badge: "LIMITED EDITION",
      description: "Exfoliating toner that visibly targets surface radiance, texture, and skin clarity.",
      image_url: "https://images.unsplash.com/photo-1608248597359-5613531b4198?auto=format&fm=webp&fit=crop&w=500&q=80",
      sku: "ORD-GLY-07",
    },
    {
      id: 102,
      name: "Aqualia Thermal Rehydrating Cream",
      category: "Vichy",
      price: 24.00,
      badge: "BESTSELLER",
      description: "Intense 48-hour hydration enriched with mineralizing thermal water and hyaluronic acid.",
      image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fm=webp&fit=crop&w=500&q=80",
      sku: "VIC-AQU-48",
    },
    {
      id: 103,
      name: "Retinol Youth Renewal Night Cream",
      category: "Murad",
      price: 88.00,
      badge: "NEW ARRIVAL",
      description: "Helps fight appearance of fine lines, wrinkles, and uneven skin tone overnight.",
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fm=webp&fit=crop&w=500&q=80",
      sku: "MUR-RET-01",
    },
    {
      id: 104,
      name: "Niacinamide 10% + Zinc 1%",
      category: "The Ordinary",
      price: 6.50,
      badge: "HOT ITEM",
      description: "High-strength vitamin and mineral blemish and oil control formula.",
      image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fm=webp&fit=crop&w=500&q=80",
      sku: "ORD-NIA-10",
    },
  ];

  useEffect(() => {
    fetch(`${API_BASE_URL}/products/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(DEFAULT_FALLBACK_PRODUCTS);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts(DEFAULT_FALLBACK_PRODUCTS);
        setLoading(false);
      });
  }, []);

  // Responsive Promo Banners (Reference image layout)
  const promoBanners = [
    {
      id: 1,
      brand: "Murad",
      title: "Retinol Youth Renewal Night Cream",
      description:
        "Retinol Tri-Active Technology: Helps fight the appearance of lines/deep wrinkles, even skin tone, and visibly boost radiance.",
      badge: "20% OFF | BUY NOW",
      gradient: "from-lime-500 via-emerald-500 to-green-600",
      textColor: "text-emerald-950",
      btnBg: "bg-emerald-950/15 hover:bg-emerald-950/25 text-emerald-950 border-emerald-950/25",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fm=webp&fit=crop&w=500&q=80",
      link: "/shop",
    },
    {
      id: 2,
      brand: "NextGen AI",
      title: "Neural Vision & Edge Sensor Kit",
      description:
        "Dual RISC-V neural computing core with integrated low-latency HDR image processing and wireless mesh telemetry.",
      badge: "15% OFF | BUY NOW",
      gradient: "from-[#8B7D72] via-[#7D6E63] to-[#5C5046]",
      textColor: "text-amber-50",
      btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fm=webp&fit=crop&w=500&q=80",
      link: "/shop",
    },
    {
      id: 3,
      brand: "OmniRobotics",
      title: "High-Torque Smart Brushless Actuator",
      description:
        "Integrated magnetic encoder, CAN-FD bus communication, and sub-millimeter precision position feedback.",
      badge: "30% OFF | BUY NOW",
      gradient: "from-blue-600 via-indigo-600 to-slate-900",
      textColor: "text-white",
      btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fm=webp&fit=crop&w=500&q=80",
      link: "/shop",
    },
  ];

  const categoryChips = [
    "All Items",
    "Fragrance",
    "Makeup",
    "Hair",
    "Skincare",
    "Semiconductors",
    "Displays & OLED",
    "Robotics",
    "Smart Sensors",
  ];

  const trustItems = [
    { icon: Truck, title: "Free Shipping", sub: "On orders over $50" },
    { icon: ShieldCheck, title: "Secure Payment", sub: "100% encrypted & safe" },
    { icon: RotateCcw, title: "Easy Returns", sub: "30-day money back" },
    { icon: Clock, title: "24/7 Support", sub: "Dedicated live assistance" },
  ];

  const testimonials = [
    {
      quote: "Amazing product selection and fast shipping! The mobile interface makes ordering effortless.",
      name: "Olivia W.",
      rating: 5,
    },
    {
      quote: "Outstanding quality and responsive customer service. Highly recommend Ekart!",
      name: "Marcus K.",
      rating: 5,
    },
    {
      quote: "Top-grade certified items with hassle-free delivery. Exactly what our team needed.",
      name: "Elena R.",
      rating: 5,
    },
  ];

  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef(null);

  // Auto-scroll hero carousel
  useEffect(() => {
    if (isPaused || promoBanners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % promoBanners.length;
        if (carouselRef.current) {
          const container = carouselRef.current;
          const children = container.children;
          if (children && children[next]) {
            const targetLeft = Math.max(0, children[next].offsetLeft - (window.innerWidth >= 640 ? 0 : 16));
            container.scrollTo({
              left: targetLeft,
              behavior: "smooth",
            });
          } else {
            const cardWidth = container.clientWidth * 0.86;
            container.scrollTo({
              left: next * cardWidth,
              behavior: "smooth",
            });
          }
        }
        return next;
      });
    }, 3600);

    return () => clearInterval(timer);
  }, [isPaused, promoBanners.length]);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !carouselRef.current) return;
    setIsMouseDown(true);
    setIsPaused(true);
    isDraggingRef.current = false;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.35;
    if (Math.abs(walk) > 6) {
      isDraggingRef.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    if (carouselRef.current && isDraggingRef.current) {
      const container = carouselRef.current;
      const { scrollLeft, clientWidth } = container;
      const index = Math.round(scrollLeft / (clientWidth * 0.85));
      const targetIdx = Math.min(Math.max(index, 0), promoBanners.length - 1);
      scrollToSlide(targetIdx);
    }
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      isDraggingRef.current = false;
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (isMouseDown) {
      handleMouseUp();
    } else {
      setIsPaused(false);
    }
  };

  const handleCardClickCapture = (e) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchStart = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  // Carousel scroll sync
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.85));
    setActiveSlide(Math.min(Math.max(index, 0), promoBanners.length - 1));
  };

  const scrollToSlide = (idx) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const children = container.children;
    if (children && children[idx]) {
      const targetLeft = Math.max(0, children[idx].offsetLeft - (window.innerWidth >= 640 ? 0 : 16));
      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });
    } else {
      const cardWidth = container.clientWidth * 0.86;
      container.scrollTo({
        left: idx * cardWidth,
        behavior: "smooth",
      });
    }
    setActiveSlide(idx);
  };

  // Filter products by category chip
  const filteredArrivals =
    activeCategory === "All Items"
      ? products
      : products.filter((p) =>
          (p.category || "").toLowerCase().includes(activeCategory.toLowerCase())
        );

  const displayArrivals = filteredArrivals.length > 0 ? filteredArrivals : products;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-grow">
        {/* ── HERO PROMO CAROUSEL (Horizontal Snap Scroll with Peeking) ── */}
        <section className="relative mx-auto max-w-7xl px-0 sm:px-6 py-2">
          {/* Scroll Track Container with Subtle White Smoked Edges */}
          <div className="relative overflow-hidden">
            {/* Left White Smoked Gradient (Subtle & Delicate) */}
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-4 sm:w-8 lg:w-12 bg-gradient-to-r from-white/70 via-white/20 to-transparent"
              aria-hidden="true"
            />

            {/* Right White Smoked Gradient (Subtle & Delicate) */}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-4 sm:w-8 lg:w-12 bg-gradient-to-l from-white/70 via-white/20 to-transparent"
              aria-hidden="true"
            />

            {/* Scroll Track */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClickCapture={handleCardClickCapture}
              className={`flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 sm:px-0 py-2 select-none ${
                isMouseDown ? "cursor-grabbing scroll-auto" : "cursor-grab scroll-smooth"
              }`}
            >
            {promoBanners.map((card, idx) => (
              <div
                key={card.id}
                className={`snap-start shrink-0 w-[86vw] sm:w-[500px] lg:w-[560px] rounded-3xl p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[240px] bg-gradient-to-br ${card.gradient} shadow-md transition-transform duration-300 hover:scale-[1.01]`}
              >
                {/* Subtle decorative glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/20 blur-2xl" />

                {/* Left: Text & CTA */}
                <div className="relative z-10 max-w-[60%] sm:max-w-[58%] space-y-1 sm:space-y-2">
                  <span
                    className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${card.textColor} opacity-80 block`}
                  >
                    {card.brand}
                  </span>
                  <h2
                    className={`text-lg sm:text-2xl font-black ${card.textColor} leading-tight tracking-tight`}
                  >
                    {card.title}
                  </h2>
                  <p
                    className={`text-[11px] sm:text-xs ${card.textColor} opacity-90 line-clamp-2 sm:line-clamp-3 leading-relaxed`}
                  >
                    {card.description}
                  </p>

                  <div className="pt-2 sm:pt-3">
                    <Link
                      to={card.link}
                      className={`btn-press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md border shadow-xs transition-all ${card.btnBg}`}
                    >
                      {card.badge}
                    </Link>
                  </div>
                </div>

                {/* Right: Floating Product Image */}
                <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-3 w-36 h-36 sm:w-44 sm:h-44 z-10 flex items-center justify-center rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xs p-1">
                  <img
                    src={card.image || SAMPLE_IMAGE}
                    alt={card.title}
                    className="h-full w-full object-cover rounded-xl drop-shadow-md transition-transform duration-500 hover:scale-108"
                    loading="eager"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2 pb-1">
            {promoBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ── CATEGORIES PILLS (Screenshot Match) ────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Categories
            </h2>
            <Link
              to="/shop"
              className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors duration-200"
            >
              See all
            </Link>
          </div>

          {/* Horizontal Scrollable Pills */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categoryChips.map((chip) => {
              const isSelected = activeCategory === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setActiveCategory(chip)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-950 text-white shadow-sm scale-102"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── NEW ARRIVALS (Screenshot Match) ─────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              New arrivals
            </h2>
            <Link
              to="/shop"
              className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors duration-200"
            >
              See all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-full h-56 sm:h-64 rounded-3xl skeleton" />
              ))}
            </div>
          ) : displayArrivals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Package size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-2">
              {displayArrivals.slice(0, 8).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  variant="arrival"
                />
              ))}
            </div>
          )}
        </section>

        {/* ── TRUST STRIP ─────────────────────────────────────────── */}
        <section className="bg-slate-50/70 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-200/60">
              {trustItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 sm:px-6 py-4 animate-fade-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TOP SALE DEALS STRIP (Screenshot Match) ─────────────── */}
        <div className="pt-6">
          <DealsStrip
            title="Top Sale Deals"
            subtitle="Shop at unbeatable prices & save up to 89% today"
            to="/shop"
          />
        </div>

        {/* ── BEST SELLING CATALOG (Full Grid for Desktop & Mobile) ─── */}
        <section ref={productsRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 transition-all duration-500 ${
              productsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Featured Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore our full hardware inventory with verified specs and manufacturer warranties.
              </p>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Explore All Items
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-64 sm:h-80 rounded-2xl skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center animate-fade-in">
              <Package size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products available yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                New inventory added in Admin will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* ── SPECIAL OFFER BANNER ────────────────────────────────── */}
        <section ref={promoRef} className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 mx-0">
          <div
            className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 items-center gap-8 transition-all duration-600 ${
              promoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Text */}
            <div className="text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" />
                Limited Time Promotion
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Up to 50% Off On Selected Hardware
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md">
                Equip your lab and production line with premium certified components at unbeatable bulk discounts.
              </p>
              <Link
                to="/shop"
                className="btn-press mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 group"
              >
                Shop the Sale
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-64 h-64">
                <div className="absolute inset-4 rounded-full bg-amber-400/10 blur-2xl" />
                <img
                  src={SAMPLE_IMAGE}
                  alt="Special Offer"
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs text-center leading-tight shadow-lg z-20">
                  50%<br />OFF
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────── */}
        <section ref={testimonialRef} className="bg-slate-50 py-12 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center mb-10 transition-all duration-500 ${
                testimonialVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                What Our Customers Say
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Trusted by thousands of engineers, makers, and enterprises.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
                    testimonialVisible ? "animate-slide-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Quote size={20} className="text-blue-200 mb-3" />
                  <p className="text-sm text-slate-600 leading-relaxed">"{t.quote}"</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                        <img src={SAMPLE_IMAGE} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}

export default Home;