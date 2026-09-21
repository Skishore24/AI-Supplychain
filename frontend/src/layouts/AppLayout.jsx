import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  Truck,
  ShoppingCart,
  ShieldAlert,
  BarChart3,
  Bot,
  FileText,
  Bell,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Sparkles,
  ShieldCheck,
  Search
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();
  const [activeOrg, setActiveOrg] = useState("Global Supply Chain Corp");
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const orgs = [
    { name: "Global Supply Chain Corp", plan: "Enterprise" },
    { name: "Apex Advanced Manufacturing", plan: "Pro" }
  ];

  const navItems = [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Inventory Intelligence", path: "/app/inventory", icon: Boxes },
    { label: "Demand Forecasting", path: "/app/forecasting", icon: TrendingUp },
    { label: "Supplier Intelligence", path: "/app/suppliers", icon: Truck },
    { label: "Purchase Orders", path: "/app/purchase-orders", icon: ShoppingCart },
    { label: "Risk Radar", path: "/app/risk", icon: ShieldAlert },
    { label: "Sales Analytics", path: "/app/sales", icon: BarChart3 },
    { label: "AI Assistant", path: "/app/ai-assistant", icon: Bot, highlight: true },
    { label: "Knowledge Base RAG", path: "/app/knowledge", icon: FileText },
    { label: "Team & Members", path: "/app/team", icon: Users },
    { label: "Workspace Settings", path: "/app/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isSuperAdmin = (adminUser?.role || "").toUpperCase().includes("ADMIN");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-4 space-y-4">
          {/* Logo */}
          <Link to="/app/dashboard" className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">EMOX Supply</span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                WORKSPACE
              </span>
            </div>
          </Link>

          {/* Org Switcher */}
          <div className="relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{activeOrg}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Enterprise Tier</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 space-y-1">
                {orgs.map((o) => (
                  <button
                    key={o.name}
                    onClick={() => {
                      setActiveOrg(o.name);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                      activeOrg === o.name
                        ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{o.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{o.plan}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.highlight && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with User Profile & Admin Switch */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {isSuperAdmin && (
            <Link
              to="/admin"
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Platform Admin</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">→</span>
            </Link>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                {adminUser?.full_name ? adminUser.full_name[0] : "A"}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {adminUser?.full_name || "Admin User"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{adminUser?.role || "ORG_ADMIN"}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span>Tenant:</span>
              <span className="text-cyan-400 font-semibold">{activeOrg}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/app/ai-assistant"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </Link>
            <div className="w-px h-5 bg-slate-800" />
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Public Site
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
