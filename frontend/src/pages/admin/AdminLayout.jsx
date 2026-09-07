import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Layers,
  BarChart3,
  Bot,
  RefreshCw,
  Zap,
  ChevronRight,
  ShieldCheck,
  Bell,
  LogOut,
  Lock
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLayout({ children, title, subtitle, onRefresh, refreshing }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logoutAdmin } = useAdminAuth();

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", desc: "Key metrics & revenue", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products Catalog", desc: "Manage store catalog", icon: Package },
    { path: "/admin/inventory", label: "Warehouse Stock", desc: "Units & restock alerts", icon: Layers },
    { path: "/admin/sales", label: "Orders & Sales", desc: "Customer checkout logs", icon: BarChart3 },
    { path: "/admin/suppliers", label: "Suppliers & Vendors", desc: "Supply rates & quotes", icon: Truck },
    { path: "/admin/ai-agents", label: "AI Procurement", desc: "Automated restock advisor", icon: Bot },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-poppins">
      {/* ── TOP EXECUTIVE ADMIN HEADER ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          
          {/* Brand & Portal Mode */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/admin" className="group flex items-center gap-2 shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm transition-transform group-hover:scale-105">
                <span className="font-heading font-black text-amber-400 text-base">e</span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-xl tracking-tight text-slate-950">
                  emox<span className="text-amber-500">.</span>admin
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                  Enterprise Management Console
                </span>
              </div>
            </Link>

            {/* Restricted Admin Portal Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-950 px-3.5 py-1.5 text-white border border-slate-800 shadow-xs text-xs font-bold">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-amber-400">Restricted Admin Console</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Pill: Indian Rupees (₹) */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <span>🇮🇳</span>
              <span>INR (₹)</span>
            </div>

            {/* Admin Authenticated Profile Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-amber-400 text-[11px] font-black">
                {adminUser?.name ? adminUser.name.slice(0, 2).toUpperCase() : "SA"}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-slate-900">{adminUser?.name || "Alex V."}</span>
                <span className="text-[10px] text-amber-600 font-semibold">{adminUser?.role || "Superadmin"}</span>
              </div>
            </div>

            {/* Secure Admin Sign Out Button */}
            <button
              onClick={handleAdminLogout}
              className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-700 transition shadow-xs cursor-pointer"
              title="Sign out of Admin Console"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Container: Sidebar + Content ─────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Modern Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-5 flex flex-col justify-between shrink-0 shadow-xs">
          <div>
            {/* Sidebar Title */}
            <div className="mb-5 px-1">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-600 font-heading">
                Store Navigation
              </span>
              <h2 className="text-base font-heading font-black text-slate-950 tracking-tight">
                Admin Controls
              </h2>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all duration-200 ${
                      active
                        ? "bg-slate-950 text-white shadow-md shadow-slate-950/20"
                        : "text-slate-600 hover:bg-amber-50/70 hover:text-slate-950"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        active ? "text-amber-400" : "text-slate-400 group-hover:text-amber-600"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs ${active ? "font-bold text-white" : "font-semibold text-slate-900"}`}>
                        {item.label}
                      </div>
                      <div className={`text-[10px] truncate ${active ? "text-slate-300" : "text-slate-400 font-normal"}`}>
                        {item.desc}
                      </div>
                    </div>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Live System Health Pill */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">System Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                Live Database Synced &middot; All Prices in ₹ INR
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
                  {title}
                </h1>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Live Admin
                </span>
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="btn-press inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs disabled:opacity-50 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw
                  size={13}
                  className={`transition-transform duration-500 ${
                    refreshing ? "animate-spin text-amber-600" : "text-slate-500"
                  }`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
              </button>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
