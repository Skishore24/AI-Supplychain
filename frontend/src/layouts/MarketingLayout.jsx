import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Boxes,
  Cpu,
  TrendingUp,
  ShieldCheck,
  FileText,
  DollarSign,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  BarChart3,
  Bot
} from "lucide-react";

export default function MarketingLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Features", path: "/features" },
    { name: "AI Agents", path: "/ai-agents" },
    { name: "Forecasting", path: "/forecasting" },
    { name: "Solutions", path: "/solutions" },
    { name: "Pricing", path: "/pricing" },
    { name: "Docs", path: "/documentation" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-blue-600 py-1.5 px-4 text-center text-xs font-medium text-white flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
        <span>Enterprise 100% Local AI Support with Ollama & pgvector Hybrid RAG is now live!</span>
        <Link to="/ai-agents" className="underline font-semibold hover:text-cyan-100 ml-1 inline-flex items-center gap-0.5">
          Explore Agents <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main SaaS Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                EMOX
              </span>
              <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                AI SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-cyan-400 bg-slate-900 border border-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/app/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Enterprise SaaS Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">EMOX AI-Supplychain</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                Next-generation autonomous supply chain intelligence platform. Deterministic calculations, localized Ollama models, pgvector RAG, and multi-agent coordination.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 font-mono">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">SOC2 Type II Compliant</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">100% Private Local Inference</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link to="/forecasting" className="hover:text-cyan-400 transition-colors">Demand Forecasting</Link></li>
                <li><Link to="/inventory" className="hover:text-cyan-400 transition-colors">Inventory Intelligence</Link></li>
                <li><Link to="/procurement" className="hover:text-cyan-400 transition-colors">Procurement AI</Link></li>
                <li><Link to="/supplier-intelligence" className="hover:text-cyan-400 transition-colors">Supplier Optimization</Link></li>
                <li><Link to="/risk-management" className="hover:text-cyan-400 transition-colors">Risk Monitoring</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link to="/documentation" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><Link to="/ai-agents" className="hover:text-cyan-400 transition-colors">AI Agent Registry</Link></li>
                <li><Link to="/blog" className="hover:text-cyan-400 transition-colors">Engineering Blog</Link></li>
                <li><Link to="/pricing" className="hover:text-cyan-400 transition-colors">Pricing & Plans</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">Company & Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/shop" className="hover:text-cyan-400 transition-colors">E-Commerce Showcase</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 EMOX AI Inc. All rights reserved. Enterprise Supply Chain Intelligence.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
