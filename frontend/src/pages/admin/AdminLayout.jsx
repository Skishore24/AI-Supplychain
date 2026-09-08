import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  ShoppingCart,
  ClipboardList,
  Bot,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Users,
  Bell,
  Sliders,
  History,
  LogOut,
  RefreshCw,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useAnalytics";

function AdminLayout({ children, title, subtitle, onRefresh, refreshing }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("emox_sidebar_collapsed") === "true";
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("emox_sidebar_collapsed", String(next));
  };

  const handleAdminLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const navigationSections = [
    {
      group: "OVERVIEW",
      items: [
        { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { path: "/admin/products", label: "Products Catalog", icon: Package },
        { path: "/admin/inventory", label: "Warehouse Stock", icon: Layers },
        { path: "/admin/suppliers", label: "Suppliers & Vendors", icon: Truck },
        { path: "/admin/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
        { path: "/admin/sales", label: "Customer Orders", icon: ShoppingCart },
      ],
    },
    {
      group: "INTELLIGENCE",
      items: [
        { path: "/admin/ai", label: "AI Control Center", icon: Bot },
        { path: "/admin/recommendations", label: "AI Recommendations", icon: Sparkles },
        { path: "/admin/knowledge", label: "Knowledge Base (RAG)", icon: Database },
        { path: "/admin/forecasting", label: "Demand Forecasting", icon: TrendingUp },
        { path: "/admin/risk", label: "Risk & Anomalies", icon: AlertTriangle },
        { path: "/admin/ai/settings", label: "Ollama Configuration", icon: Cpu },
      ],
    },
    {
      group: "ANALYTICS",
      items: [
        { path: "/admin/analytics", label: "Operations Analytics", icon: BarChart3 },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { path: "/admin/users", label: "Users & Roles", icon: Users },
        { path: "/admin/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
        { path: "/admin/audit-logs", label: "Audit Logs", icon: History },
        { path: "/admin/settings", label: "Settings", icon: Sliders },
      ],
    },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const NavContent = () => (
    <div className="flex flex-col justify-between h-full py-4 px-3">
      <div className="space-y-6">
        {/* Brand & Collapse Header */}
        <div className="flex items-center justify-between px-2">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-heading font-black text-amber-400 text-lg">e</span>
            </span>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-lg tracking-tight text-slate-950">
                  emox<span className="text-amber-500">.</span>admin
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                  Multi-Agent Platform
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-190px)] pr-1">
          {navigationSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {sec.group}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 ${
                      active
                        ? "bg-slate-950 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 transition-colors ${
                        active ? "text-amber-400" : "text-slate-400 group-hover:text-amber-600"
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge > 0 && (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-black text-white shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Pill */}
      <div className="pt-3 border-t border-slate-200">
        <div
          className={`flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-2.5 ${
            collapsed ? "justify-center p-1.5" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-amber-400 text-xs font-black shrink-0">
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || "Admin User"}
              </div>
              <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider truncate">
                {user?.role || "Administrator"}
              </div>
            </div>
          )}
          <button
            onClick={handleAdminLogout}
            title="Sign out"
            className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-poppins">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 bg-white shrink-0 sticky top-0 h-screen transition-all duration-200 z-40 ${
          collapsed ? "w-18" : "w-64"
        }`}
      >
        <NavContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          />
          <div className="relative z-10 w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xs">
          {/* Left: Mobile hamburger & live system status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            >
              <Menu size={18} />
            </button>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-white border border-slate-800 text-[11px] font-bold">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span className="text-amber-400 font-mono">RBAC Auth Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>PostgreSQL Synced</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Storefront switch */}
            <Link
              to="/shop"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
            >
              <span>View Customer Store</span>
              <span className="text-slate-400 text-[11px]">↗</span>
            </Link>

            {/* Currency Pill */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800">
              <span>🇮🇳</span>
              <span>INR (₹)</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-scale-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-900">Notifications</span>
                    <Link
                      to="/admin/notifications"
                      onClick={() => setNotifPopoverOpen(false)}
                      className="text-[10px] font-bold text-amber-600 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            setNotifPopoverOpen(false);
                            if (n.link_url) navigate(n.link_url);
                          }}
                          className={`p-2 rounded-xl text-xs cursor-pointer transition ${
                            n.is_read ? "bg-slate-50 text-slate-600" : "bg-amber-50/70 border border-amber-200 text-slate-900 font-semibold"
                          }`}
                        >
                          <div className="font-bold text-[11px]">{n.title}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Data CTA */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin text-amber-600" : "text-slate-400"} />
                <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb / Page Title */}
          <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
