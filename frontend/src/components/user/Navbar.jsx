import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

function Navbar() {
  const { getCartCount, user } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = getCartCount();
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);
  const [cartBump, setCartBump] = useState(false);
  const searchRef = useRef(null);

  // Scroll-aware navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bounce cart badge when count changes
  useEffect(() => {
    if (cartCount !== prevCartCount && cartCount > prevCartCount) {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 400);
    }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/shop");
    }
    searchRef.current?.blur();
  };

  const navLinks = [
    { to: "/", label: "Home", exact: true },
    { to: "/shop", label: "All Products" },
    { to: "/orders", label: "Track Orders", icon: Truck },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all duration-300 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-xl font-heading font-black text-slate-900 tracking-tight shrink-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-700 text-white shadow-md shadow-amber-950/20 border border-amber-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <ShoppingBag size={19} className="text-amber-400" />
          </span>
          <span className="font-heading font-black text-slate-900 text-2xl tracking-tighter">
            E<span className="text-amber-500">kart</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                searchFocused ? "text-amber-500" : "text-slate-400"
              }`}
              size={18}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="input-smooth w-full rounded-full border border-slate-200/90 bg-slate-50/80 pl-10 pr-24 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-400/80 focus:ring-2 focus:ring-amber-200/50 font-poppins"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-[72px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="btn-press absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors duration-200 font-poppins"
            >
              Search
            </button>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium font-poppins">
          {navLinks.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 py-1 transition-colors duration-200 ${
                  active ? "text-slate-950 font-bold" : "text-slate-600 hover:text-amber-700"
                }`}
              >
                {Icon && <Icon size={15} />}
                <span>{label}</span>
                {/* Animated gold underline */}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ${
                    active ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <Link
            to="/shop"
            className="sm:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200"
          >
            <Search size={20} />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl p-2 sm:px-3 sm:py-2 text-slate-700 hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="relative">
              <ShoppingCart size={22} className="text-slate-700" />
              {cartCount > 0 && (
                <span
                  className={`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-extrabold text-slate-950 shadow-sm transition-transform duration-300 ${
                    cartBump ? "scale-125" : "scale-100"
                  } animate-scale-in`}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-slate-800">Cart</span>
          </Link>

          {/* Account */}
          <Link
            to="/profile"
            className="rounded-xl p-2 sm:px-3 sm:py-2 text-slate-700 hover:bg-slate-100 transition-colors duration-200 flex items-center gap-1.5"
            title={`Account: ${user?.name || "Alex Johnson"}`}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-amber-400 text-[10px] font-black border border-amber-500/30">
              {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : "AJ")}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-slate-800">
              {user?.name ? user.name.split(" ")[0] : "Account"}
            </span>
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;