import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import SortFilterBar from "../../components/user/SortFilterBar";
import DealsStrip from "../../components/user/DealsStrip";
import { API_BASE_URL } from "../../context/CartContext";

const DEFAULT_SHOP_PRODUCTS = [
  {
    id: 1,
    name: "boAt Rockerz 650 Pro Wireless Over-Ear Headphones",
    category: "Headphones",
    price: 39.99,
    badge: "TOP SELLER",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "BOAT-ROC-650",
  },
  {
    id: 2,
    name: "boAt Nirvana Ion with 120 Hours Playback & Dual EQ",
    category: "Earbuds",
    price: 24.99,
    badge: "HOT DEAL",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "BOAT-NIR-ION",
  },
  {
    id: 3,
    name: "boAt Nirvana Ion 32dB Active Noise Cancellation ANC",
    category: "Earbuds",
    price: 26.50,
    badge: "LOWEST PRICE",
    image_url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "BOAT-NIR-32ANC",
  },
  {
    id: 4,
    name: "TECHIO AirBeats Wireless Magnetic Bluetooth Neckband",
    category: "Neckbands",
    price: 6.00,
    badge: "SUPER DEAL",
    image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "TECH-AIR-500",
  },
  {
    id: 5,
    name: "Sony WH-1000XM4 Industry Leading Noise Canceling",
    category: "Headphones",
    price: 269.99,
    badge: "PREMIUM",
    image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "SNY-WH1000XM4",
  },
  {
    id: 6,
    name: "Apple AirPods Pro (2nd Gen) with MagSafe Case USB-C",
    category: "Earbuds",
    price: 249.00,
    badge: "OFFICIAL",
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "APL-AIR-PRO2",
  },
  {
    id: 7,
    name: "Bose QuietComfort 45 Bluetooth Wireless Headphones",
    category: "Headphones",
    price: 279.00,
    badge: "BESTSELLER",
    image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "BOS-QC-45",
  },
  {
    id: 8,
    name: "JBL Tune 760NC Lightweight Foldable Wireless Headphones",
    category: "Headphones",
    price: 79.99,
    badge: "POPULAR",
    image_url: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fm=webp&fit=crop&w=600&q=80",
    sku: "JBL-TUNE-760",
  },
];

function Shop() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("relevance");
  const [minRating, setMinRating] = useState(0);

  const loadProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(DEFAULT_SHOP_PRODUCTS);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setProducts(DEFAULT_SHOP_PRODUCTS);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const productList = Array.isArray(products) && products.length > 0 ? products : DEFAULT_SHOP_PRODUCTS;
  const categories = Array.from(new Set(productList.map((p) => p.category).filter(Boolean)));

  const activeFilterCount = (selectedCategory !== "ALL" ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setMinRating(0);
    setSearchTerm("");
    setSortBy("relevance");
  };

  const filteredProducts = productList
    .filter((product) => {
      const name = (product.name || "").toLowerCase();
      const sku = (product.sku || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(term) ||
        sku.includes(term) ||
        category.includes(term);
      const matchesCat = selectedCategory === "ALL" || product.category === selectedCategory;
      const matchesRating = minRating === 0 || (product.id ? (product.id % 5) + 1 >= minRating : true);
      return matchesSearch && matchesCat && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "rating") return (b.id || 0) - (a.id || 0);
      if (sortBy === "newest") return (b.id || 0) - (a.id || 0);
      return 0; // relevance
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-20 lg:pb-0">
      <Navbar />

      {/* Sticky Flipkart/Amazon Sort & Filter Bar */}
      <SortFilterBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
      />

      <main className="flex-grow mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Top Search & Results Counter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategory === "ALL" ? "All Products" : selectedCategory}
            </h1>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} items &middot; Fast delivery available
            </p>
          </div>

          {/* Quick in-page search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search in these results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* 2-Column Mobile & 4-Column Desktop Product Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-64 sm:h-80 rounded-2xl bg-white animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center my-6">
              <ShoppingBag size={44} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-base font-bold text-slate-900">No products match your filters</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try resetting filters or adjusting search keyword.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Promotional Deals Strip Banner */}
        <div className="mt-8">
          <DealsStrip
            title="Top Sale Deals"
            subtitle="Shop at unbeatable prices & grab limited-time coupons"
            to="/shop"
          />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Shop;