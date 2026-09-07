import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import Navbar from "../../components/user/Navbar";
import BottomNav from "../../components/user/BottomNav";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import SortFilterBar from "../../components/user/SortFilterBar";
import { API_BASE_URL } from "../../context/CartContext";

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
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setProducts([]);
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

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const activeFilterCount = (selectedCategory !== "ALL" ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setMinRating(0);
    setSearchTerm("");
    setSortBy("relevance");
  };

  const filteredProducts = products
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
                className="btn-press mt-4 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition-colors"
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
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Shop;