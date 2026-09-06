import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { Home, ShoppingBag, ShoppingCart, Package, User } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";

function BottomNav() {
  const location = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { path: "/", label: "Home", icon: Home, exact: true },
    { path: "/shop", label: "Shop", icon: ShoppingBag },
    { path: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { path: "/orders", label: "Orders", icon: Package },
    { path: "/profile", label: "Account", icon: User },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const idx = navItems.findIndex(({ path, exact }) => isActive(path, exact));
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [location.pathname]);

  const navElement = (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.12)] lg:hidden font-poppins">
      {/* Sliding pill indicator */}
      <div className="relative flex items-stretch">
        <div
          className="pointer-events-none absolute top-1.5 h-10 rounded-xl bg-amber-50/80 border border-amber-200/40 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: `${100 / navItems.length}%`,
            left: `${(activeIndex / navItems.length) * 100}%`,
          }}
        />

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative z-10 flex flex-1 flex-col items-center justify-center py-2.5 px-1 transition-colors duration-200"
            >
              <div className="relative">
                <Icon
                  size={21}
                  className={`transition-all duration-300 ${
                    active
                      ? "text-amber-600 scale-110 stroke-[2.5]"
                      : "text-slate-500 scale-100 stroke-[1.75]"
                  }`}
                  style={active ? { filter: "drop-shadow(0 0 4px rgba(217,119,6,0.35))" } : {}}
                />
                {item.badge > 0 && (
                  <span className="animate-scale-in absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-0.5 text-[10px] tracking-tight font-semibold transition-all duration-200 ${
                  active ? "text-slate-950 font-bold" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  if (typeof document === "undefined") return navElement;
  return createPortal(navElement, document.body);
}

export default BottomNav;
