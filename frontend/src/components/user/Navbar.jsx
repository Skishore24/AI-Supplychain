import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  User,
  Search,
  ShoppingBag,
  Truck,
  X,
  ChevronDown,
  Sparkles,
  Layers,
  Cpu,
  Flame,
  Radio,
  SlidersHorizontal
} from "lucide-react";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const { getCartCount, user } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);
  const [cartBump, setCartBump] = useState(false);
  const searchRef = useRef(null);

  const isSearchExpanded = searchFocused || searchHovered || searchTerm.trim().length > 0;

  // Bounce cart badge when count changes
  useEffect(() => {
    if (cartCount !== prevCartCount && cartCount > prevCartCount) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    let url = "/shop";
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);

    const queryString = params.toString();
    navigate(queryString ? `/shop?${queryString}` : "/shop");
    searchRef.current?.blur();
  };

  const categoriesList = [
    { label: "All Categories", value: "All" },
    { label: "Electronics", value: "Electronics" },
    { label: "Microcontrollers", value: "Microcontroller" },
    { label: "Power & Batteries", value: "Power" },
    { label: "Sensors & Modules", value: "Sensors" },
    { label: "Motors & Actuators", value: "Actuators" },
    { label: "Displays", value: "Displays" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs font-poppins">
      {/* ── TOP MAIN HEADER ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Brand Logo (Modern emox-style aesthetic) */}
          <Link to="/" className="group flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md transition-transform group-hover:scale-105">
              <span className="font-heading font-black text-amber-400 text-lg">e</span>
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-black text-2xl tracking-tight text-slate-950">
                emox<span className="text-amber-500">.</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
                Electronics &amp; Lifestyle Store
              </span>
            </div>
          </Link>

          {/* Quick Top Navigation Links (Home, Shop, Orders) */}
          <nav className="hidden lg:flex items-center gap-1 font-bold text-xs shrink-0">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                location.pathname === "/"
                  ? "bg-slate-950 text-amber-400 shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Home size={14} />
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                location.pathname === "/shop"
                  ? "bg-slate-950 text-amber-400 shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <ShoppingBag size={14} />
              <span>Shop</span>
            </Link>
            <Link
              to="/orders"
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                location.pathname === "/orders"
                  ? "bg-slate-950 text-amber-400 shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Truck size={14} />
              <span>Orders</span>
            </Link>
          </nav>

          {/* Unified Search Bar with Category Dropdown (Butter-smooth expansion on hover or focus) */}
          <form
            onSubmit={handleSearchSubmit}
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            className={`hidden md:flex items-center rounded-full border bg-slate-50 transition-[width,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              isSearchExpanded
                ? "w-[520px] lg:w-[620px] xl:w-[680px] border-amber-500 ring-2 ring-amber-100 bg-white shadow-md"
                : "w-[310px] lg:w-[350px] border-slate-300 hover:border-slate-400 hover:w-[520px] lg:hover:w-[620px] xl:hover:w-[680px] hover:bg-white hover:shadow-xs"
            }`}
          >
            {/* Category Dropdown Inside Search - Fixed Width & Stable */}
            <div className="relative w-[115px] shrink-0 pl-3 pr-1 border-r border-slate-200">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer truncate py-2"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input - Full width of remaining space */}
            <div className="relative flex-1 min-w-0 flex items-center">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products, MCUs, sensors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none truncate"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-1 shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="m-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors shrink-0"
              title="Search catalog"
            >
              <Search size={15} />
            </button>
          </form>

          {/* Right Header Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Button with Count Badge */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-xl p-2 sm:px-3 sm:py-1.5 text-slate-700 hover:bg-slate-100 transition"
              title="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart size={21} className="text-slate-800" />
                {cartCount > 0 && (
                  <span
                    className={`absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-black text-slate-950 shadow-xs transition-transform ${
                      cartBump ? "scale-125" : "scale-100"
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block text-xs font-extrabold text-slate-800">Cart</span>
            </Link>

            {/* Profile / Account */}
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 sm:px-3 sm:py-1.5 text-xs font-bold text-slate-800 hover:border-slate-300 hover:shadow-xs transition"
              title="User Account"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-amber-400 text-[10px] font-black">
                {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : "AJ")}
              </div>
              <span className="hidden sm:inline-block truncate max-w-[80px]">
                {user?.name ? user.name.split(" ")[0] : "Sign In"}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 flex md:hidden items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5">
          <Search size={15} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search products in ₹..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none"
          />
          <button type="submit" className="text-xs font-bold text-amber-600 shrink-0">
            Search
          </button>
        </form>
      </div>

      {/* ── SECONDARY SUB-CATEGORY STRIP (Matching reference image) ───── */}
      <div className="border-t border-slate-100 bg-slate-50/60 hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold text-slate-600 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-5">
            {/* Direct Home Navigation */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 font-bold transition shrink-0 ${
                location.pathname === "/"
                  ? "text-amber-600 font-extrabold"
                  : "text-slate-800 hover:text-amber-600"
              }`}
            >
              <Home size={14} className="text-amber-500" />
              <span>Home</span>
            </Link>

            {/* Direct Shop Navigation */}
            <Link
              to="/shop"
              className={`flex items-center gap-1.5 font-bold transition shrink-0 ${
                location.pathname === "/shop" && !location.search
                  ? "text-amber-600 font-extrabold"
                  : "text-slate-800 hover:text-amber-600"
              }`}
            >
              <ShoppingBag size={14} className="text-amber-500" />
              <span>Shop All</span>
            </Link>

            <span className="h-4 w-px bg-slate-200 shrink-0" />

            <Link
              to="/shop"
              className="flex items-center gap-1.5 font-bold text-slate-900 hover:text-amber-600 transition shrink-0"
            >
              <SlidersHorizontal size={13} className="text-amber-500" />
              <span>All Categories</span>
              <ChevronDown size={13} className="text-slate-400" />
            </Link>
            
            <Link to="/shop?category=Electronics" className="hover:text-amber-600 transition shrink-0">
              Electronics
            </Link>
            <Link to="/shop?category=Microcontroller" className="hover:text-amber-600 transition shrink-0">
              Microcontrollers
            </Link>
            <Link to="/shop?category=Power" className="hover:text-amber-600 transition shrink-0">
              Power & Batteries
            </Link>
            <Link to="/shop?category=Displays" className="hover:text-amber-600 transition shrink-0">
              Displays & OLED
            </Link>
            <Link to="/shop?category=Sensors" className="hover:text-amber-600 transition shrink-0">
              Sensors & Modules
            </Link>
            <Link to="/shop?category=Actuators" className="hover:text-amber-600 transition shrink-0">
              Industrial Motors
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold shrink-0">
            <Link to="/shop?sort=deals" className="flex items-center gap-1 text-amber-700 hover:text-amber-800">
              <Flame size={14} className="text-amber-600 fill-amber-500" />
              <span>Today's Deals</span>
            </Link>
            <Link to="/orders" className="flex items-center gap-1 text-slate-600 hover:text-slate-900">
              <Truck size={14} />
              <span>Track Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;