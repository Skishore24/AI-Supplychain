import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Layers,
  BarChart3,
  Bot,
  Store,
  Cpu,
  RefreshCw
} from "lucide-react";


function AdminLayout({ children, title, subtitle, onRefresh, refreshing }) {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Executive Overview", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products Catalog", icon: Package },
    { path: "/admin/suppliers", label: "Supplier AI Optimizer", icon: Truck },
    { path: "/admin/inventory", label: "Inventory & Reorder Hub", icon: Layers },
    { path: "/admin/sales", label: "Sales & Analytics", icon: BarChart3 },
    { path: "/admin/ai-agents", label: "Multi-Agent Hub", icon: Bot }
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/95 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-white tracking-tight mb-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Cpu size={20} />
            </span>
            <span>
              Supply<span className="text-indigo-400">Hub</span>
            </span>
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
              Admin
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon size={16} className={active ? "text-white" : "text-slate-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
          <Link
            to="/shop"
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Store size={16} className="text-blue-400" />
            <span>Customer Store</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Multi-Agent Engine Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-400">{subtitle}</p>}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition self-start sm:self-auto"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-400" : ""} />
              <span>Refresh Metrics</span>
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
