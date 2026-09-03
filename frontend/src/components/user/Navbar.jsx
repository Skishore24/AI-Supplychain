import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Cpu, LayoutDashboard } from "lucide-react";
import { useCart } from "../../context/CartContext";


function Navbar() {
  const { getCartCount } = useCart();
  const location = useLocation();
  const cartCount = getCartCount();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-white tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Cpu size={20} />
          </span>
          <span>
            Supply<span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden items-center gap-8 md:flex text-sm font-medium">
          <Link
            to="/"
            className={`transition ${
              isActive("/") ? "text-blue-400 font-semibold" : "text-slate-300 hover:text-white"
            }`}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className={`transition ${
              isActive("/shop") ? "text-blue-400 font-semibold" : "text-slate-300 hover:text-white"
            }`}
          >
            Store Catalog
          </Link>

          <Link
            to="/orders"
            className={`transition ${
              isActive("/orders") ? "text-blue-400 font-semibold" : "text-slate-300 hover:text-white"
            }`}
          >
            Orders
          </Link>
        </div>

        {/* Right Actions & Admin Switcher */}
        <div className="flex items-center gap-4">

          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-900/60 hover:text-white shadow-sm"
          >
            <LayoutDashboard size={14} />
            <span>Admin Hub</span>
          </Link>

          <Link
            to="/shop"
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Search Catalog"
          >
            <Search size={20} />
          </Link>

          <Link
            to="/cart"
            className="relative rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white shadow-md animate-scale">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Profile"
          >
            <User size={20} />
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;