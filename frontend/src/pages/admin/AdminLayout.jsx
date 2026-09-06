import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Layers,
  BarChart3,
  Bot,
  RefreshCw,
  Zap
} from "lucide-react";

function AdminLayout({ children, title, subtitle, onRefresh, refreshing }) {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Executive Overview", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products Catalog", icon: Package },
    { path: "/admin/suppliers", label: "Supplier Intelligence", icon: Truck },
    { path: "/admin/inventory", label: "Inventory & Reorder Hub", icon: Layers },
    { path: "/admin/sales", label: "Sales & Analytics", icon: BarChart3 },
    { path: "/admin/ai-agents", label: "Decision Engine", icon: Bot },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-5 flex flex-col justify-between shrink-0 shadow-xs md:shadow-[2px_0_24px_rgba(0,0,0,0.04)]">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 text-xl font-bold text-slate-900 tracking-tight mb-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 animate-glow-pulse">
              <Package size={20} />
            </span>
            <span>
              Admin<span className="text-indigo-600">Portal</span>
            </span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-600 border border-indigo-200">
              BETA
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 animate-fade-in ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Active left bar */}
                  {active && (
                    <span className="nav-indicator absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white/40" />
                  )}
                  <Icon
                    size={16}
                    className={`transition-all duration-200 ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-indigo-600"
                    }`}
                  />
                  <span>{item.label}</span>

                  {/* Hover glow pill (inactive only) */}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 -z-10" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status */}
        <div className="mt-8 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs px-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-slate-700">Database Connected</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
            <Zap size={12} className="text-amber-500" />
            <span>AI agents running — 3 active</span>
          </div>
          <p className="text-[11px] text-slate-400 px-1">
            Direct URL-only administration portal.
          </p>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 animate-slide-down">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500">{subtitle}</p>
            )}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn-press inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all duration-200 self-start sm:self-auto"
            >
              <RefreshCw
                size={14}
                className={`transition-all duration-500 ${refreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`}
              />
              <span>Refresh Data</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="mt-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
